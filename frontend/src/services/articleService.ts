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
}

// Use relative URL to be consistent with other components
const API_URL = '/api';

// Function to create a new article
export const createArticle = async (articleData: CreateArticleDTO): Promise<Article> => {
  try {
    // Generate a unique ID for the article
    const articleWithId = {
      ...articleData,
      articleid: uuidv4(),
      date: new Date().toISOString()
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

// Function to get a single article by ID
export const getArticleById = async (id: string): Promise<Article> => {
  try {
    console.log(`Fetching article with ID: ${id}`);
    
    const response = await fetch(`${API_URL}/articles/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include'
    });

    if (!response.ok) {
      const status = response.status;
      console.error(`Error fetching article - Status: ${status}`);
      
      // For development environment, return mock data on failure
      if (process.env.NODE_ENV === 'development' && (status === 404 || status === 500)) {
        console.log("Using mock data as fallback");
        return getMockArticle(id);
      }
      
      throw new Error(`Error: ${response.status}`);
    }

    const data = await response.json();
    console.log("Article data received:", data);
    
    // Handle different API response formats
    return normalizeArticleData(data);
  } catch (error) {
    console.error(`Error fetching article ${id}:`, error);
    
    // For development, return mock data on any error
    if (process.env.NODE_ENV === 'development') {
      console.log("Using mock data as fallback due to error");
      return getMockArticle(id);
    }
    
    throw error;
  }
};

// Add missing update article function
export const updateArticle = async (id: string, articleData: CreateArticleDTO): Promise<Article> => {
  try {
    console.log(`Updating article with ID: ${id}`);
    console.log("Update data:", articleData);
    
    const response = await fetch(`${API_URL}/articles/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(articleData),
      credentials: 'include'
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("API Error Response:", response.status, errorData);
      throw new Error(`Server error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`Error updating article ${id}:`, error);
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
    date: article.date || new Date().toISOString()
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
    date: new Date().toISOString()
  };
};
