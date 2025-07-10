import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { deleteArticle, getArticlesByStatus, updateArticleStatus } from '../services/articleService';

// Define interface for article data
interface Article {
  articleid: string;
  title: string;
  subtitle: string;
  author: string;
  date: string;
  status: 'draft' | 'published' | 'archived';
  images: string[];
  subtopics: string[];
  subcontent: string[];
  designation: string;
  keywords: string[];
}

const ManageArticles: React.FC = () => {
  console.log('ManageArticles component rendering');
  const navigate = useNavigate();
  
  // State management
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'published' | 'archived'>('all');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [articleToDelete, setArticleToDelete] = useState<string | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'warning'} | null>(null);
  const [retryingDelete, setRetryingDelete] = useState<{id: string, attempt: number} | null>(null);

  // Fetch articles from backend
  const fetchArticles = async () => {
    console.log('Fetching articles...'); // Debug log
    setLoading(true);
    try {
      const apiUrl = '/api/articles';
      console.log(`Calling API endpoint: ${apiUrl}`);
      
      const response = await axios.get(apiUrl, { 
        timeout: 10000,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      });
      
      console.log('API response received:', response.data);
      setArticles(response.data);
      setError(null);
    } catch (err: any) {
      console.error('Error fetching articles:', err);
      setError(`Failed to fetch articles: ${err.message || 'Unknown error'}`);
      
      console.log('Using mock data as fallback');
      setArticles([
        {
          articleid: '1',
          title: 'Introduction to Smart Grid Technology',
          subtitle: 'Understanding the basics of modern energy systems',
          author: 'Jane Smith',
          date: '2023-05-15T10:30:00Z',
          status: 'published',
          images: [],
          subtopics: ['Introduction', 'Benefits'],
          subcontent: ['Smart grid technology represents...', 'The benefits include...'],
          designation: 'Energy Specialist',
          keywords: ['smart grid', 'energy', 'technology']
        },
        {
          articleid: '2',
          title: 'Energy Efficiency in Industrial Applications',
          subtitle: 'How factories are reducing energy consumption',
          author: 'John Doe',
          date: '2023-06-22T14:45:00Z',
          status: 'draft',
          images: [],
          subtopics: ['Industrial Practices', 'Case Studies'],
          subcontent: ['Modern industrial facilities...', 'Case study 1 shows...'],
          designation: 'Industrial Engineer',
          keywords: ['energy efficiency', 'industrial', 'manufacturing']
        }
      ]);
    } finally {
      setLoading(false);
      console.log('Fetch articles completed');
    }
  };

  // Load articles on component mount
  useEffect(() => {
    console.log('ManageArticles useEffect triggered');
    fetchArticles();
    
    return () => {
      console.log('ManageArticles unmounting');
    };
  }, []);

  // Handle status change
  const handleStatusChange = async (id: string, newStatus: 'draft' | 'published' | 'archived') => {
    try {
      const updatedArticle = await updateArticleStatus(id, newStatus);
      setArticles(prev => prev.map(article => 
        article.articleid === id 
          ? { ...article, status: newStatus }
          : article
      ));
      setNotification({ 
        message: `Article status updated to ${newStatus}`, 
        type: 'success' 
      });
    } catch (error: any) {
      console.error('Error updating article status:', error);
      setNotification({ 
        message: `Failed to update status: ${error.message}`, 
        type: 'error' 
      });
    }
  };

  // Handle article deletion with better error handling for backend issues
  const handleDeleteArticle = async (id: string, retryAttempt: number = 0) => {
    try {
      console.log(`Attempting to delete article with ID: ${id}${retryAttempt > 0 ? ` (retry ${retryAttempt})` : ''}`);
      setLoading(true);
      
      // Use the service function
      const result = await deleteArticle(id);
      
      // Always update the UI for better UX, regardless of API success
      setArticles(prevArticles => {
        console.log(`Removing article ${id} from UI list`);
        return prevArticles.filter(article => article.articleid !== id);
      });
      
      // Show appropriate message based on result
      if (result.success) {
        setNotification({ 
          message: 'Article deleted successfully', 
          type: 'success' 
        });
      } else {
        console.error('Error from delete service:', result.message);
        
        // Check if this is the specific MongoDB error
        if (result.message.includes('findOneAndRemove is not a function')) {
          setNotification({
            message: 'Article removed from UI. Note: Backend has a configuration issue - please notify developers.',
            type: 'warning'
          });
        } else {
          setNotification({ 
            message: `Article removed from UI. Server message: ${result.message}`, 
            type: 'warning' 
          });
        }
      }
    } catch (err: any) {
      // Handle any other errors in the deletion process
      console.error('Error in delete process:', err);
      
      // Still update UI for better UX
      setArticles(prevArticles => prevArticles.filter(article => article.articleid !== id));
      
      setNotification({ 
        message: `Article removed from UI. Error: ${err.message || 'Unknown error'}`, 
        type: 'warning' 
      });
    } finally {
      // Always close the dialog, clear the selected article and finish loading
      setDeleteDialogOpen(false);
      setArticleToDelete(null);
      setLoading(false);
      setRetryingDelete(null); // Clear retry state
    }
  };

  // Function to handle editing an article
  const handleEditArticle = (id: string) => {
    try {
      console.log(`Navigating to edit article with ID: ${id}`);
      // Ensure we're passing the correct ID format
      navigate(`/edit-article/${id}`);
      
      // Add debugging to console to verify the ID
      console.log(`Navigation initiated to edit article with ID: ${id}`);
    } catch (err) {
      console.error('Navigation error:', err);
      setNotification({ 
        message: 'Error navigating to edit page. Please try again.', 
        type: 'error' 
      });
    }
  };

  // Function to handle creating a new article
  const handleNewArticle = () => {
    navigate('/edit-article');
  };

  // Filter articles based on search term and status
  const filteredArticles = articles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         article.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || article.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Mobile article card component
  const MobileArticleCard = ({ article, onEdit, onDelete }: { 
    article: Article, 
    onEdit: (id: string) => void, 
    onDelete: (id: string) => void 
  }) => {
    return (
      <div className="mb-4 bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="p-4">
          <h3 className="text-lg font-medium text-blue-600 dark:text-blue-400 mb-1">
            {article.title}
          </h3>
          
          <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
            {article.subtitle
              ? `${article.subtitle.substring(0, 60)}${article.subtitle.length > 60 ? '...' : ''}`
              : 'No subtitle available'}
          </p>
          
          <div className="flex justify-between items-center mb-2">
            <p className="text-sm"><span className="font-semibold">Author:</span> {article.author}</p>
            <div className="flex items-center gap-2">
              <span className={`px-2 py-1 text-xs rounded-full font-medium capitalize ${
                article.status === 'published' 
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                  : article.status === 'draft'
                  ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
              }`}>
                {article.status}
              </span>
              <select
                value={article.status}
                onChange={(e) => handleStatusChange(article.articleid, e.target.value as 'draft' | 'published' | 'archived')}
                className="text-xs border rounded px-1 py-0.5"
              >
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
          
          <p className="text-sm mb-4">
            <span className="font-semibold">Date:</span> {new Date(article.date).toLocaleDateString()}
          </p>
          
          <div className="flex justify-end gap-2 mt-2">
            <button
              onClick={() => onEdit(article.articleid)}
              className="flex items-center justify-center px-4 py-2 border border-blue-500 text-blue-500 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900 transition-colors flex-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </button>
            <button
              onClick={() => onDelete(article.articleid)}
              className="flex items-center justify-center px-4 py-2 border border-red-500 text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-red-900 transition-colors flex-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="py-6 px-4 sm:px-6 md:px-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm mb-6 overflow-visible">
          <div className="p-4 sm:p-6">
            {/* Header section */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6 gap-4">
              <div>
                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-1 text-blue-600 dark:text-blue-400">
                  Manage Articles
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Create, edit and manage all articles in the system
                </p>
              </div>
              <button 
                onClick={handleNewArticle}
                className="flex items-center justify-center px-4 sm:px-6 py-2 sm:py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow transition-all hover:translate-y-[-2px] hover:shadow-md"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Article
              </button>
            </div>

            {/* Search and filter section */}
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-6">
              <div className="relative flex-grow">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search by title or author..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:text-white text-sm transition duration-150 ease-in-out"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'draft' | 'published' | 'archived')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 w-full sm:w-auto h-10"
              >
                <option value="all">All Articles</option>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="archived">Archived</option>
              </select>
            </div>

            {/* Loading state */}
            {loading ? (
              <div className="flex flex-col items-center justify-center my-16 gap-4">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Loading articles...</p>
              </div>
            ) : error ? (
              <div className="bg-red-50 dark:bg-red-900/30 border-l-4 border-red-500 p-4 mb-4 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Mobile View (Cards) */}
                <div className="block md:hidden">
                  {filteredArticles.length > 0 ? (
                    filteredArticles.map((article) => (
                      <MobileArticleCard 
                        key={article.articleid}
                        article={article}
                        onEdit={handleEditArticle}
                        onDelete={(id) => {
                          setArticleToDelete(id);
                          setDeleteDialogOpen(true);
                        }}
                      />
                    ))
                  ) : (
                    <div className="flex flex-col items-center py-8 gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
                      <p className="text-gray-900 dark:text-gray-100">No articles found</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Try adjusting your search or create a new article
                      </p>
                    </div>
                  )}
                </div>

                {/* Desktop View (Table) */}
                <div className="hidden md:block overflow-hidden border border-gray-200 dark:border-gray-700 rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-800/50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Title</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Summary</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Author</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {filteredArticles.length > 0 ? (
                        filteredArticles.map((article) => (
                          <tr 
                            key={article.articleid}
                            className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition duration-150"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <p className="text-sm font-medium text-gray-900 dark:text-white">
                                {article.title}
                              </p>
                            </td>
                            <td className="px-6 py-4">
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {article.subtitle
                                  ? `${article.subtitle.substring(0, 60)}${article.subtitle.length > 60 ? '...' : ''}`
                                  : 'No subtitle available'}
                              </p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <p className="text-sm text-gray-500 dark:text-gray-400">{article.author}</p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {new Date(article.date).toLocaleDateString(undefined, {
                                  year: 'numeric', 
                                  month: 'short', 
                                  day: 'numeric'
                                })}
                              </p>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <select
                                value={article.status}
                                onChange={(e) => handleStatusChange(article.articleid, e.target.value as 'draft' | 'published' | 'archived')}
                                className={`px-2 py-1 text-xs leading-5 font-semibold rounded-full capitalize border-0 ${
                                  article.status === 'published' 
                                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                                    : article.status === 'draft'
                                    ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                                    : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                                }`}
                              >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                                <option value="archived">Archived</option>
                              </select>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex gap-2">
                                <button 
                                  onClick={() => handleEditArticle(article.articleid)}
                                  className="p-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded hover:bg-blue-100 dark:hover:bg-blue-800/50 transition-colors"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                  </svg>
                                </button>
                                <button 
                                  onClick={() => {
                                    setArticleToDelete(article.articleid);
                                    setDeleteDialogOpen(true);
                                  }}
                                  className="p-1.5 bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded hover:bg-red-100 dark:hover:bg-red-800/50 transition-colors"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-16 text-center">
                            <div className="flex flex-col items-center gap-2">
                              <p className="text-gray-900 dark:text-white">No articles found</p>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                Try adjusting your search or create a new article
                              </p>
                            </div>
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Debug message */}
        {import.meta.env?.DEV && (
          <div className="mb-4 bg-white dark:bg-gray-800 rounded-lg p-4">
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Debug: {loading ? 'Loading articles...' : `Loaded ${filteredArticles.length} articles (${statusFilter})`}
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            {/* Background overlay */}
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setDeleteDialogOpen(false)}></div>

            {/* Modal panel */}
            <div className="inline-block align-bottom bg-white dark:bg-gray-800 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white dark:bg-gray-800 px-4 pt-5 pb-4 sm:p-6">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Confirm Delete</h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Are you sure you want to delete this article? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                <button 
                  onClick={() => articleToDelete && handleDeleteArticle(articleToDelete)}
                  className="w-full sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3"
                  disabled={!!retryingDelete}
                >
                  {retryingDelete ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                      Retrying ({retryingDelete.attempt}/3)...
                    </>
                  ) : (
                    <>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </>
                  )}
                </button>
                <button 
                  onClick={() => setDeleteDialogOpen(false)}
                  className="mt-3 w-full sm:mt-0 sm:w-auto inline-flex justify-center items-center px-4 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Notification toast */}
      {notification && (
        <div className="fixed bottom-4 inset-x-0 flex justify-center px-4 z-50">
          <div className={`rounded-lg shadow-lg p-4 ${
            notification.type === 'success' ? 'bg-green-500' : 
            notification.type === 'error' ? 'bg-red-500' : 'bg-yellow-500'
          } text-white max-w-md`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {notification.type === 'success' ? (
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium">{notification.message}</p>
              </div>
              <div className="ml-auto pl-3">
                <button 
                  onClick={() => setNotification(null)}
                  className="inline-flex text-white focus:outline-none"
                >
                  <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageArticles;
