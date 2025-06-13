import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Container, 
  Typography, 
  Paper, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow,
  Button,
  IconButton,
  TextField,
  CircularProgress,
  Snackbar,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Card,
  CardContent,
  Divider,
  useTheme,
  alpha,
  Chip
} from '@mui/material';
import { 
  Add as AddIcon, 
  Edit as EditIcon, 
  Delete as DeleteIcon, 
  Search as SearchIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';

// Define interface for article data - match the naming convention from the service
interface Article {
  articleid: string; // changed from 'id' to 'articleid' to match other components
  title: string;
  subtitle: string;
  content: string;
  author: string;
  publishedDate: string;
  status: 'published' | 'draft';
}

const ManageArticles: React.FC = () => {
  console.log('ManageArticles component rendering');
  const theme = useTheme();
  const navigate = useNavigate();
  
  // State management
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState<boolean>(false);
  const [articleToDelete, setArticleToDelete] = useState<string | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  // Fetch articles from backend
  const fetchArticles = async () => {
    console.log('Fetching articles...'); // Debug log
    setLoading(true);
    try {
      // Use a try-catch block for the API call to handle connection issues
      const apiUrl = '/api/articles';
      console.log(`Calling API endpoint: ${apiUrl}`);
      
      // Add timeout to prevent hanging requests
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
      // More descriptive error message including the error details
      setError(`Failed to fetch articles: ${err.message || 'Unknown error'}`);
      
      console.log('Using mock data as fallback');
      // Use mock data for demonstration if API fails
      setArticles([
        {
          id: '1',
          title: 'Introduction to IoT Sensors',
          summary: 'Learn about the basics of IoT sensors and their applications',
          content: 'Full content here...',
          author: 'John Doe',
          publishedDate: '2023-06-15',
          status: 'published'
        },
        {
          id: '2',
          title: 'Smart Grid Technology',
          summary: 'Exploring the future of smart grid implementations',
          content: 'Full content here...',
          author: 'Jane Smith',
          publishedDate: '2023-07-22',
          status: 'published'
        },
        {
          id: '3',
          title: 'Data Security in IoT',
          summary: 'Best practices for securing IoT data transmission',
          content: 'Full content here...',
          author: 'Robert Johnson',
          publishedDate: '2023-08-10',
          status: 'draft'
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
    
    // Return cleanup function
    return () => {
      console.log('ManageArticles unmounting');
    };
  }, []);

  // Handle article deletion
  const handleDeleteArticle = async (id: string) => {
    try {
      // Replace with your actual API endpoint
      await axios.delete(`/api/articles/${id}`);
      setArticles(articles.filter(article => article.articleid !== id)); // Changed from article.id to article.articleid
      setNotification({ message: 'Article deleted successfully', type: 'success' });
    } catch (err) {
      console.error('Error deleting article:', err);
      setNotification({ message: 'Failed to delete article', type: 'error' });
    }
    setDeleteDialogOpen(false);
    setArticleToDelete(null);
  };

  // Filter articles based on search term
  const filteredArticles = articles.filter(article => 
    article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    article.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to handle editing an article
  const handleEditArticle = (id: string) => {
    console.log(`Navigating to edit article with ID: ${id}`);
    navigate(`/edit-article/${id}`);
  };

  // Function to handle creating a new article
  const handleNewArticle = () => {
    navigate('/edit-article');
  };

  return (
    <Box 
      sx={{ 
        py: 3, 
        px: { xs: 2, md: 3 },
        bgcolor: theme.palette.mode === 'dark' ? 'background.default' : 'grey.50',
        minHeight: '100vh'
      }}
    >
      <Container maxWidth="lg">
        <Card elevation={2} sx={{ mb: 3, borderRadius: 2, overflow: 'visible' }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' }, 
              justifyContent: 'space-between', 
              alignItems: { xs: 'flex-start', md: 'center' }, 
              mb: 3,
              gap: 2
            }}>
              <Box>
                <Typography variant="h4" component="h1" fontWeight="bold" gutterBottom color="primary">
                  Manage Articles
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Create, edit and manage all articles in the system
                </Typography>
              </Box>
              <Button 
                variant="contained" 
                color="primary" 
                startIcon={<AddIcon />}
                onClick={handleNewArticle}
                size="large"
                sx={{ 
                  px: 3, 
                  py: 1, 
                  boxShadow: 2,
                  '&:hover': { 
                    boxShadow: 4,
                    transform: 'translateY(-2px)',
                    transition: 'all 0.2s'
                  }
                }}
              >
                New Article
              </Button>
            </Box>

            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              justifyContent: 'space-between', 
              alignItems: { xs: 'flex-start', sm: 'center' },
              gap: 2,
              mb: 3 
            }}>
              <TextField
                label="Search articles"
                variant="outlined"
                size="small"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                sx={{ 
                  minWidth: { xs: '100%', sm: 300 },
                  bgcolor: 'background.paper',
                  '& .MuiOutlinedInput-root': {
                    '&:hover fieldset': {
                      borderColor: theme.palette.primary.main,
                    },
                  },
                }}
                InputProps={{
                  startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />
                }}
                placeholder="Search by title or author..."
              />
              <Button
                variant="outlined"
                color="inherit"
                startIcon={<FilterListIcon />}
                size="medium"
              >
                Filter
              </Button>
            </Box>

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 8, flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                <CircularProgress size={40} thickness={4} />
                <Typography variant="body2" color="text.secondary">Loading articles...</Typography>
              </Box>
            ) : error ? (
              <Alert 
                severity="error" 
                sx={{ 
                  mb: 2,
                  borderRadius: 2,
                  boxShadow: 1
                }}
              >
                {error}
              </Alert>
            ) : (
              <TableContainer 
                component={Paper} 
                sx={{ 
                  boxShadow: 0,
                  borderRadius: 2,
                  overflow: 'hidden',
                  border: `1px solid ${theme.palette.divider}`
                }}
              >
                <Table sx={{ minWidth: 650 }}>
                  <TableHead sx={{ 
                    backgroundColor: theme.palette.mode === 'dark' 
                      ? alpha(theme.palette.primary.main, 0.2) 
                      : alpha(theme.palette.primary.main, 0.1)
                  }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Title</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Summary</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Author</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Published Date</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 'bold', py: 2 }}>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredArticles.length > 0 ? (
                      filteredArticles.map((article) => (
                        <TableRow 
                          key={article.articleid} // Changed from article.id to article.articleid
                          hover 
                          sx={{
                            '&:last-child td, &:last-child th': { border: 0 },
                            transition: 'all 0.2s',
                            '&:hover': {
                              backgroundColor: alpha(theme.palette.primary.main, 0.04),
                            }
                          }}
                        >
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body2" fontWeight="medium" color="text.primary">
                              {article.title}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body2" color="text.secondary">
                              {article.subtitle
                                ? `${article.subtitle.substring(0, 60)}${article.subtitle.length > 60 ? '...' : ''}`
                                : 'No subtitle available'}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body2">{article.author}</Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Typography variant="body2">
                              {new Date(article.publishedDate).toLocaleDateString(undefined, {
                                year: 'numeric', 
                                month: 'short', 
                                day: 'numeric'
                              })}
                            </Typography>
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Chip 
                              label={article.status}
                              size="small"
                              color={article.status === 'published' ? 'success' : 'warning'}
                              sx={{ 
                                textTransform: 'capitalize',
                                fontWeight: 500
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ py: 2 }}>
                            <Box sx={{ display: 'flex', gap: 1 }}>
                              <IconButton 
                                size="small" 
                                color="primary" 
                                onClick={() => handleEditArticle(article.articleid)} // Changed from article.id to article.articleid
                                sx={{ 
                                  bgcolor: alpha(theme.palette.primary.main, 0.1),
                                  '&:hover': {
                                    bgcolor: alpha(theme.palette.primary.main, 0.2)
                                  }
                                }}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => {
                                  setArticleToDelete(article.articleid); // Changed from article.id to article.articleid
                                  setDeleteDialogOpen(true);
                                }}
                                sx={{ 
                                  bgcolor: alpha(theme.palette.error.main, 0.1),
                                  '&:hover': {
                                    bgcolor: alpha(theme.palette.error.main, 0.2)
                                  }
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                            <Typography variant="body1">No articles found</Typography>
                            <Typography variant="body2" color="text.secondary">
                              Try adjusting your search or create a new article
                            </Typography>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </CardContent>
        </Card>

        {/* Simple debug message */}
        {process.env.NODE_ENV === 'development' && (
          <Card sx={{ mb: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
            <CardContent>
              <Typography variant="caption" color="text.secondary">
                Debug: {loading ? 'Loading articles...' : `Loaded ${articles.length} articles`}
              </Typography>
            </CardContent>
          </Card>
        )}
      </Container>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        PaperProps={{
          sx: { borderRadius: 2 }
        }}
      >
        <DialogTitle>
          <Typography variant="h6" fontWeight="bold">Confirm Delete</Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this article? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 0 }}>
          <Button 
            onClick={() => setDeleteDialogOpen(false)} 
            variant="outlined"
          >
            Cancel
          </Button>
          <Button 
            onClick={() => articleToDelete && handleDeleteArticle(articleToDelete)} 
            color="error" 
            variant="contained"
            startIcon={<DeleteIcon />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Notification Snackbar */}
      <Snackbar 
        open={!!notification} 
        autoHideDuration={6000} 
        onClose={() => setNotification(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {notification && (
          <Alert 
            severity={notification.type} 
            onClose={() => setNotification(null)}
            variant="filled"
            sx={{ borderRadius: 2, boxShadow: 3 }}
          >
            {notification.message}
          </Alert>
        )}
      </Snackbar>
    </Box>
  );
};

export default ManageArticles;
