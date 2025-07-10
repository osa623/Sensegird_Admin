import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/App";
import { v4 as uuidv4 } from 'uuid';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Save, 
  Plus,
  Eye, 
  ArrowLeft, 
  X,
  Image as ImageIcon,
  Trash2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
// Import the service functions
import { 
  Article, 
  CreateArticleDTO, 
  getArticleById, 
  createArticle, 
  updateArticle 
} from "@/services/articleService";

interface ArticleForm {
  title: string;
  subtitle: string;
  images: string[];
  subtopics: string[];
  subcontent: string[];
  author: string;
  designation: string;
  keywords: string[];
  status: 'draft' | 'published' | 'archived';
  // For UI purpose only - not part of the model
  currentKeyword: string;
}

// Create or update article function using the service
const saveArticle = async (articleData: CreateArticleDTO, articleId?: string): Promise<Article> => {
  try {
    let result;
    
    if (articleId) {
      // Update existing article
      console.log("Updating article data for ID:", articleId);
      console.log("Update payload:", articleData);
      result = await updateArticle(articleId, articleData);
    } else {
      // Create new article
      console.log("Creating new article:", articleData);
      result = await createArticle(articleData);
    }
    
    console.log("API response from save operation:", result);
    return result;
  } catch (error) {
    console.error('Error saving article:', error);
    // Log more detailed error information
    if ((error as any).response) {
      console.error('Server response:', (error as any).response.data);
    }
    throw error;
  }
};

const EditArticle = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { id: articleId } = useParams<{ id: string }>();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingArticle, setIsFetchingArticle] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [isEditMode, setIsEditMode] = useState(false);
  
  const [formData, setFormData] = useState<ArticleForm>({
    title: "",
    subtitle: "",
    images: [],
    subtopics: [],
    subcontent: [],
    author: user?.name || "",
    designation: "",
    keywords: [],
    status: 'draft',
    currentKeyword: "",
  });

  // Load article data if editing existing article
  useEffect(() => {
    if (articleId) {
      setIsEditMode(true);
      setIsFetchingArticle(true);
      
      console.log(`EditArticle: Loading article with ID ${articleId}`);
      
      // Add timeout to abort fetch after 20 seconds
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);
      
      getArticleById(articleId)
        .then(article => {
          clearTimeout(timeoutId);
          console.log("Article data received:", article);
          
          // Handle potential data structure differences
          if (!article) {
            throw new Error('No article data returned from the server');
          }
          
          // Set form data with proper defaults for all fields and handle potential missing properties
          setFormData({
            title: article.title || "",
            subtitle: article.subtitle || "",
            images: Array.isArray(article.images) ? article.images : [],
            subtopics: Array.isArray(article.subtopics) ? article.subtopics : [],
            subcontent: Array.isArray(article.subcontent) ? article.subcontent : [],
            author: article.author || user?.name || "",
            designation: article.designation || "",
            keywords: Array.isArray(article.keywords) ? article.keywords : [],
            status: article.status || 'draft',
            currentKeyword: "",
          });
          setIsFetchingArticle(false);
        })
        .catch(err => {
          clearTimeout(timeoutId);
          console.error("Article fetch error details:", err);
          
          let errorMessage = `Failed to load article: ${err.message || 'Unknown error'}`;
          if (err.name === 'AbortError') {
            errorMessage = 'Request took too long to complete and was aborted. Please try again.';
          }
          
          // Show error message to user
          toast({
            variant: "destructive",
            title: "Error Loading Article",
            description: errorMessage,
          });
          
          // Optional: Navigate back to articles list when fetching fails
          // navigate('/dashboard', { replace: true });
          
          setIsFetchingArticle(false);
        });
    }
  }, [articleId, user?.name, toast]);

  // Function to handle adding a content section (subtopic + subcontent)
  const addContentSection = () => {
    setFormData(prev => ({
      ...prev,
      subtopics: [...prev.subtopics, ""],
      subcontent: [...prev.subcontent, ""]
    }));
  };

  // Function to remove a content section
  const removeContentSection = (index: number) => {
    setFormData(prev => ({
      ...prev,
      subtopics: prev.subtopics.filter((_, i) => i !== index),
      subcontent: prev.subcontent.filter((_, i) => i !== index)
    }));
  };

  // Function to update a subtopic
  const updateSubtopic = (index: number, value: string) => {
    const updatedSubtopics = [...formData.subtopics];
    updatedSubtopics[index] = value;
    setFormData(prev => ({ ...prev, subtopics: updatedSubtopics }));
  };

  // Function to update subcontent
  const updateSubcontent = (index: number, value: string) => {
    const updatedSubcontent = [...formData.subcontent];
    updatedSubcontent[index] = value;
    setFormData(prev => ({ ...prev, subcontent: updatedSubcontent }));
  };

  const handleInputChange = (field: keyof ArticleForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Add a function to add image by URL
  const addImageByUrl = () => {
    if (imageUrl.trim()) {
      setFormData(prev => ({
        ...prev,
        images: [...prev.images, imageUrl.trim()]
      }));
      setImageUrl("");
    } else {
      toast({
        variant: "destructive",
        title: "Invalid URL",
        description: "Please enter a valid URL for the image.",
      });
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        // In real application, you would upload image to server and store URL
        // Here we're just storing the base64 string for demo purposes
        setFormData(prev => ({
          ...prev,
          images: [...prev.images, e.target?.result as string]
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const addKeyword = () => {
    if (formData.currentKeyword.trim() && !formData.keywords.includes(formData.currentKeyword.trim())) {
      setFormData(prev => ({
        ...prev,
        keywords: [...prev.keywords, formData.currentKeyword.trim()],
        currentKeyword: ""
      }));
    }
  };

  const removeKeyword = (keywordToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      keywords: prev.keywords.filter(keyword => keyword !== keywordToRemove)
    }));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addKeyword();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Validate form data
      if (!formData.title || !formData.subtitle || !formData.author || !formData.designation) {
        toast({
          variant: "destructive",
          title: "Missing required fields",
          description: "Please fill in all required fields.",
        });
        setIsLoading(false);
        return;
      }
      
      // Validate that we have at least one content section
      if (formData.subtopics.length === 0 || formData.subcontent.length === 0) {
        toast({
          variant: "destructive",
          title: "Missing content",
          description: "Please add at least one content section.",
        });
        setIsLoading(false);
        return;
      }

      // Extract the data needed for the API
      const articleData: CreateArticleDTO = {
        title: formData.title,
        subtitle: formData.subtitle,
        images: formData.images,
        subtopics: formData.subtopics,
        subcontent: formData.subcontent,
        author: formData.author,
        designation: formData.designation,
        keywords: formData.keywords,
        status: formData.status
      };
      
      console.log(`${isEditMode ? "Updating" : "Creating"} article:`, articleData);
      
      // Save article (create or update) using the service function
      const result = await saveArticle(articleData, articleId);
      console.log("API response:", result);
      
      toast({
        title: isEditMode ? "Article updated!" : "Article published!",
        description: `Your article "${formData.title}" has been ${isEditMode ? "updated" : "published"} successfully.`,
      });
      
      navigate("/dashboard");
    } catch (error: any) {
      console.error(`Error ${isEditMode ? "updating" : "publishing"} article:`, error);
      let errorMessage = `Failed to ${isEditMode ? "update" : "publish"} article: ${error.message || 'Unknown error'}`;
      
      toast({
        variant: "destructive",
        title: "Error",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6 animate-fade-in p-3 sm:p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
        <Button
          variant="ghost"
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 w-fit h-9 sm:h-10"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm sm:text-base">Back to Dashboard</span>
        </Button>
        <div>
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground">
            {isEditMode ? "Edit Article" : "Add New Article"}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {isEditMode ? "Update your existing content" : "Create and publish your content"}
          </p>
        </div>
      </div>

      {isFetchingArticle ? (
        <div className="flex flex-col items-center justify-center p-8">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <p className="mt-4 text-muted-foreground">Loading article data...</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-3 sm:space-y-6">
              {/* Article Details Card */}
              <Card className="admin-card shadow-sm">
                <CardHeader className="px-4 sm:px-6">
                  <CardTitle className="text-lg sm:text-xl">Article Details</CardTitle>
                  <CardDescription className="text-sm">
                    Enter the main information for your article
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 sm:space-y-4 px-3 sm:px-6 py-3 sm:py-4">
                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="title" className="text-xs sm:text-sm font-medium">Title *</Label>
                    <Input
                      id="title"
                      placeholder="Enter article title"
                      value={formData.title}
                      onChange={(e) => handleInputChange("title", e.target.value)}
                      className="admin-input h-9 sm:h-11 text-sm sm:text-base"
                      required
                    />
                  </div>

                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="subtitle" className="text-xs sm:text-sm font-medium">Subtitle *</Label>
                    <Input
                      id="subtitle"
                      placeholder="Enter article subtitle"
                      value={formData.subtitle}
                      onChange={(e) => handleInputChange("subtitle", e.target.value)}
                      className="admin-input h-9 sm:h-11 text-sm sm:text-base"
                      required
                    />
                  </div>

                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="author" className="text-xs sm:text-sm font-medium">Author *</Label>
                    <Input
                      id="author"
                      placeholder="Author name"
                      value={formData.author}
                      onChange={(e) => handleInputChange("author", e.target.value)}
                      className="admin-input h-9 sm:h-11 text-sm sm:text-base"
                      required
                    />
                  </div>

                  <div className="space-y-1 sm:space-y-2">
                    <Label htmlFor="designation" className="text-xs sm:text-sm font-medium">Designation *</Label>
                    <Input
                      id="designation"
                      placeholder="Author designation"
                      value={formData.designation}
                      onChange={(e) => handleInputChange("designation", e.target.value)}
                      className="admin-input h-9 sm:h-11 text-sm sm:text-base"
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Article Content Sections Card */}
              <Card className="admin-card">
                <CardHeader className="px-4 sm:px-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <CardTitle className="text-lg sm:text-xl">Article Content</CardTitle>
                      <CardDescription className="text-sm">
                        Add subtopics and their content
                      </CardDescription>
                    </div>
                    <Button 
                      type="button" 
                      onClick={addContentSection}
                      variant="outline"
                      className="flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Add Section
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 px-4 sm:px-6">
                  {formData.subtopics.length === 0 && (
                    <div className="text-center py-4 border-dashed border-2 border-muted rounded-lg">
                      <p className="text-muted-foreground">No content sections yet. Add one to start writing.</p>
                      <Button 
                        type="button" 
                        onClick={addContentSection}
                        variant="outline"
                        className="mt-2"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Add First Section
                      </Button>
                    </div>
                  )}
                  
                  {formData.subtopics.map((subtopic, index) => (
                    <div key={index} className="space-y-3 border p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <h3 className="font-medium">Section {index + 1}</h3>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeContentSection(index)}
                          className="text-destructive h-8 w-8 p-0"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`subtopic-${index}`} className="text-sm font-medium">Subtopic</Label>
                        <Input
                          id={`subtopic-${index}`}
                          placeholder="Enter subtopic"
                          value={subtopic}
                          onChange={(e) => updateSubtopic(index, e.target.value)}
                          className="admin-input h-10 sm:h-11"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor={`subcontent-${index}`} className="text-sm font-medium">Content</Label>
                        <Textarea
                          id={`subcontent-${index}`}
                          placeholder="Write the content for this subtopic..."
                          value={formData.subcontent[index] || ""}
                          onChange={(e) => updateSubcontent(index, e.target.value)}
                          className="admin-input min-h-[150px] resize-y"
                        />
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Images Card */}
              <Card className="admin-card shadow-sm">
                <CardHeader className="px-4 sm:px-6">
                  <CardTitle className="text-lg sm:text-xl">Images</CardTitle>
                  <CardDescription className="text-sm">
                    Upload images or add image URLs for your article
                  </CardDescription>
                </CardHeader>
                <CardContent className="px-3 sm:px-6 py-3 sm:py-4">
                  <div className="space-y-3 sm:space-y-4">
                    {/* Image URL Input */}
                    <div className="space-y-1 sm:space-y-2">
                      <Label htmlFor="image-url" className="text-xs sm:text-sm font-medium">Add Image by URL</Label>
                      <div className="flex gap-2">
                        <Input
                          id="image-url"
                          placeholder="https://example.com/image.jpg"
                          value={imageUrl}
                          onChange={(e) => setImageUrl(e.target.value)}
                          className="admin-input flex-1 h-9 sm:h-11 text-sm"
                        />
                        <Button 
                          type="button" 
                          onClick={addImageByUrl} 
                          variant="outline"
                          className="shrink-0 h-9 sm:h-11 text-xs sm:text-sm"
                        >
                          Add Image
                        </Button>
                      </div>
                    </div>
                    
                    {formData.images.length > 0 && (
                      <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
                        {formData.images.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={image}
                              alt={`Image ${index + 1}`}
                              className="w-full h-24 sm:h-32 object-cover rounded-lg border"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x300?text=Image+Error';
                              }}
                            />
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="absolute top-1 right-1 sm:top-2 sm:right-2 h-7 w-7 sm:h-8 sm:w-8 p-0"
                              onClick={() => removeImage(index)}
                            >
                              <X className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                    
                    {/* Image upload area */}
                    <Label
                      htmlFor="image-upload"
                      className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <ImageIcon className="w-6 h-6 sm:w-8 sm:h-8 mb-2 sm:mb-4 text-muted-foreground" />
                        <p className="mb-2 text-xs sm:text-sm text-muted-foreground text-center">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-muted-foreground text-center">
                          PNG, JPG or WEBP (MAX. 800x400px)
                        </p>
                      </div>
                      <Input
                        id="image-upload"
                        type="file"
                        className="hidden"
                        accept="image/*"
                        onChange={handleImageUpload}
                      />
                    </Label>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-3 sm:space-y-6">
              {/* Keywords Card */}
              <Card className="admin-card">
                <CardHeader className="px-4 sm:px-6">
                  <CardTitle className="text-lg sm:text-xl">Keywords</CardTitle>
                  <CardDescription className="text-sm">
                    Add keywords to help categorize your article
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 px-4 sm:px-6">
                  <div className="flex gap-2">
                    <Input
                      placeholder="Add a keyword"
                      value={formData.currentKeyword}
                      onChange={(e) => handleInputChange("currentKeyword", e.target.value)}
                      onKeyPress={handleKeyPress}
                      className="admin-input h-10 sm:h-11"
                    />
                    <Button type="button" variant="outline" onClick={addKeyword} className="shrink-0">
                      Add
                    </Button>
                  </div>
                  {formData.keywords.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.keywords.map((keyword, index) => (
                        <Badge key={index} variant="secondary" className="flex items-center gap-1">
                          {keyword}
                          <X
                            className="w-3 h-3 cursor-pointer hover:text-destructive"
                            onClick={() => removeKeyword(keyword)}
                          />
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Status Card */}
              <Card className="admin-card">
                <CardHeader className="px-4 sm:px-6">
                  <CardTitle className="text-lg sm:text-xl">Publication Status</CardTitle>
                  <CardDescription className="text-sm">
                    Set the current status of this article
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 px-4 sm:px-6">
                  <div className="grid grid-cols-1 gap-2">
                    <select
                      value={formData.status}
                      onChange={(e) => handleInputChange("status", e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formData.status === 'draft' 
                      ? "Draft articles are only visible to you and won't appear on the website."
                      : formData.status === 'published'
                      ? "Published articles will be visible to all visitors on the website."
                      : "Archived articles are hidden from the website but preserved in the system."}
                  </p>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className="space-y-2 sm:space-y-3 fixed bottom-0 left-0 right-0 lg:relative bg-background p-3 sm:p-0 shadow-lg lg:shadow-none z-10">
                <Button
                  type="submit"
                  className="admin-button-primary w-full h-10 sm:h-11 text-sm"
                  disabled={
                    isLoading || 
                    !formData.title || 
                    !formData.subtitle || 
                    !formData.author ||
                    !formData.designation
                  }
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isLoading ? (isEditMode ? "Updating..." : "Publishing...") : (isEditMode ? "Update Article" : "Publish Article")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full h-10 sm:h-11 text-sm"
                  onClick={() => {
                    toast({
                      title: "Preview mode",
                      description: "Preview functionality would open here.",
                    });
                  }}
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              </div>

              {/* Add some spacing at the bottom on mobile to accommodate fixed buttons */}
              <div className="h-24 lg:h-0 block lg:hidden"></div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default EditArticle;

