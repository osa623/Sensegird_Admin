import { v4 as uuidv4 } from 'uuid';

// Define types based on your article model
export interface Article {
  articleid: string;
  date: string;
  title: string;
  subtitle: string;
  images: string[];
  subtopics: string[];
  subcontent: string[];
  author: string;
  designation: string;
  keywords: string[];
  status: 'draft' | 'published' | 'archived';
}

export interface CreateArticleDTO {
  title: string;
  subtitle: string;
  images: string[];
  subtopics: string[];
  subcontent: string[];
  author: string;
  designation: string;
  keywords: string[];
  status?: 'draft' | 'published' | 'archived';
}

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Function to create a new article
export const createArticle = async (articleData: CreateArticleDTO): Promise<Article> => {
  try {
    // Generate a unique ID for the article
    const articleWithId = {
      ...articleData,
      articleid: uuidv4(),
      date: new Date().toISOString(),
      status: articleData.status || 'draft'
    };

    console.log("Sending article data:", articleWithId);
    
    const response = await fetch(`${API_URL}/articles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(articleWithId),
      credentials: 'include' // Include cookies for cross-origin requests if needed
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API Error Response:", response.status, errorData);
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error creating article:', error);
    throw error;
  }
};

// Function to get all articles
export const getAllArticles = async (): Promise<Article[]> => {
  try {
    const response = await fetch(`${API_URL}/articles`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching articles:', error);
    throw error;
  }
};

/**
 * Fetches an article by its ID
 * @param id The article ID to fetch
 * @returns Promise with article data
 */
export const getArticleById = async (id: string): Promise<Article> => {
  console.log(`Fetching article with ID: ${id}`);
  
  try {
    // Use a timeout promise to avoid hanging requests
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Request timeout after 15 seconds')), 15000);
    });
    
    // The actual fetch request
    const fetchPromise = fetch(`/api/articles/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      // Ensure credentials are included for authenticated requests if needed
      credentials: 'include',
    });
    
    // Race between the fetch and the timeout
    const response = await Promise.race([fetchPromise, timeoutPromise]) as Response;
    
    if (!response.ok) {
      throw new Error(`Server returned ${response.status}: ${response.statusText}`);
    }
    
    const article: Article = await response.json();
    console.log(`Successfully fetched article:`, article);
    return article;
    
  } catch (error: any) {
    console.error(`Error fetching article ${id}:`, error);
    
    // For development environment - provide mock data as fallback
    if (import.meta.env?.DEV || import.meta.env?.MODE === 'development') {
      console.warn('Development environment detected. Using mock data as fallback.');
      
      // Create mock data based on the ID
      const mockArticle: Article = {
        articleid: id,
        title: `Mock Article (ID: ${id.substring(0, 8)}...)`,
        subtitle: 'This is mock data provided due to API fetch failure',
        content: 'This mock content is displayed because the API request failed. ' +
                 'Check the console for detailed error information.',
        author: 'System',
        designation: 'Automated Fallback',
        images: [],
        subtopics: ['Error Loading Article'],
        subcontent: ['The actual article could not be loaded. This is fallback content.'],
        keywords: ['error', 'mock', 'fallback'],
        publishedDate: new Date().toISOString(),
        status: 'draft'
      };
      
      // Only use mock data as fallback in development
      return mockArticle;
    }
    
    // For production, properly throw the error
    throw new Error(`Failed to fetch article: ${error.message || 'Unknown error'}`);
  }
};

/**
 * Updates an existing article
 * @param id Article ID to update
 * @param articleData New article data
 * @returns Updated article
 */
export const updateArticle = async (id: string, articleData: CreateArticleDTO): Promise<Article> => {
  console.log(`Updating article with ID: ${id}`);
  try {
    // Add retry mechanism for PUT requests
    let retries = 3;
    let response: Response | null = null;
    let lastError: Error | null = null;
    
    while (retries > 0) {
      try {
        response = await fetch(`/api/articles/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(articleData),
          credentials: 'include',
        });
        
        if (response.ok) break;
        
        lastError = new Error(`Server returned ${response.status}: ${response.statusText}`);
      } catch (error: any) {
        lastError = error;
        console.warn(`Retry attempt ${4 - retries} failed:`, error.message);
      }
      
      retries--;
      if (retries > 0) {
        // Wait before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries)));
      }
    }
    
    if (!response || !response.ok) {
      throw lastError || new Error('Failed to update article after multiple attempts');
    }
    
    const updatedArticle: Article = await response.json();
    console.log('Article updated successfully:', updatedArticle);
    return updatedArticle;
    
  } catch (error: any) {
    console.error('Error updating article:', error);
    throw new Error(`Failed to update article: ${error.message}`);
  }
};

/**
 * Deletes an article by ID
 * @param id Article ID to delete
 * @returns Promise resolving to success status
 */
export const deleteArticle = async (id: string): Promise<{ success: boolean, message: string }> => {
  console.log(`Attempting to delete article with ID: ${id}`);
  
  try {
    // Use relative URL path instead of full URL with API_URL 
    // This allows the browser to use the same origin and avoids CORS issues
    const response = await fetch(`/api/articles/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      // Don't include credentials if using a relative URL path through proxy
      // If your setup requires credentials, ensure your backend sets proper CORS headers
      // credentials: 'include'
    });
    
    // If successful, return success
    if (response.ok) {
      console.log(`Article ${id} successfully deleted`);
      return { success: true, message: 'Article deleted successfully' };
    }
    
    // If we get an error, try to parse it
    const errorText = await response.text().catch(() => '');
    let errorData;
    try {
      errorData = errorText ? JSON.parse(errorText) : {};
    } catch {
      errorData = { error: errorText };
    }
    
    // Check if this is the specific "findOneAndRemove" error
    const errorMessage = errorData.message || errorData.error || response.statusText || 'Unknown error';
    console.error(`Error deleting article: ${response.status} - ${errorMessage}`);
    
    // If it's a findOneAndRemove error, try alternative method
    if (errorMessage.includes('findOneAndRemove is not a function')) {
      console.log('Detected findOneAndRemove error. Trying alternative delete method...');
      
      // Try POST method with alternative endpoint
      try {
        const altResponse = await fetch(`/api/articles/remove`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ articleId: id }),
          // credentials: 'include'
        });
        
        if (altResponse.ok) {
          console.log(`Article ${id} successfully deleted using alternative method`);
          return { success: true, message: 'Article deleted successfully (alt method)' };
        }
      } catch (altError: any) {
        console.error('Error with alternative delete method:', altError);
      }
    }
    
    return { 
      success: false, 
      message: `Server error (${response.status}): ${errorMessage}`
    };
  } catch (error: any) {
    console.error('Error deleting article:', error);
    return { 
      success: false, 
      message: `Network error: ${error.message || 'Could not connect to server'}`
    };
  }
};

// Function to get articles by status
export const getArticlesByStatus = async (status: 'draft' | 'published' | 'archived'): Promise<Article[]> => {
  try {
    const response = await fetch(`${API_URL}/articles/status/${status}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching articles by status:', error);
    throw error;
  }
};

// Function to update article status
export const updateArticleStatus = async (id: string, status: 'draft' | 'published' | 'archived'): Promise<Article> => {
  try {
    const response = await fetch(`${API_URL}/articles/${id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
      credentials: 'include'
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating article status:', error);
    throw error;
  }
};

// Helper function to normalize article data structure
export const normalizeArticleData = (data: any): Article => {
  // Handle different API response structures
  const article = data.article || data.data || data;
  
  return {
    articleid: article.articleid || article.id || "",
    title: article.title || "",
    subtitle: article.subtitle || "",
    images: Array.isArray(article.images) ? article.images : [],
    subtopics: Array.isArray(article.subtopics) ? article.subtopics : [],
    subcontent: Array.isArray(article.subcontent) ? article.subcontent : [],
    author: article.author || "",
    designation: article.designation || "",
    keywords: Array.isArray(article.keywords) ? article.keywords : [],
    date: article.date || new Date().toISOString(),
    status: article.status || 'draft'
  };
};

// Mock article data for development and testing
export const getMockArticle = (id: string): Article => {
  console.log(`Generating mock data for article ID: ${id}`);
  return {
    articleid: id,
    title: `Test Article ${id}`,
    subtitle: "This is a mock article for development purposes",
    images: ["https://via.placeholder.com/800x400?text=Mock+Image"],
    subtopics: ["First Section", "Second Section"],
    subcontent: [
      "This is the content of the first section. It's just mock data used when the API is unavailable.",
      "This is the content of the second section. In a real application, this would be replaced with actual article content."
    ],
    author: "Test Author",
    designation: "Developer",
    keywords: ["test", "mock", "development"],
    date: new Date().toISOString(),
    status: 'draft'
  };
};
