import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  TrendingUp, 
  Users, 
  Calendar,
  MoreHorizontal
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import axios from "axios";

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
  views?: number; // Optional for backward compatibility
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  //fetching articles
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
        setError(`Failed to fetch articles: ${err.message || 'Unknown error'}`);
        
        console.log('Using mock data as fallback');
        setArticles([
          {
            articleid: "1",
            title: "Sample Article",
            subtitle: "This is a sample article",
            author: "Admin",
            date: "2023-08-15",
            status: "published",
            images: [],
            subtopics: ["Introduction"],
            subcontent: ["Sample content"],
            designation: "Administrator",
            keywords: ["sample", "test"],
            views: 120
          }
        ]);
      } finally {
        setLoading(false);
        console.log('Fetch articles completed');
      }
    };

  // Call fetchArticles when component mounts
  useEffect(() => {
    fetchArticles();
  }, []);

  const handleDeleteArticle = (id: string) => {
    setArticles(articles.filter(article => article.articleid !== id));
    toast({
      title: "Article deleted",
      description: "The article has been successfully deleted.",
    });
  };

  const handleEditArticle = (id: string) => {
    navigate(`/edit-article/${id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "published":
        return "bg-green-100 text-green-800 hover:bg-green-100";
      case "draft":
        return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100";
      case "archived":
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-100";
    }
  };

  const stats = [
    {
      title: "Total Articles",
      value: articles.length.toString(),
      icon: FileText,
      change: "+12%",
      changeType: "positive" as const
    },
    {
      title: "Published",
      value: articles.filter(a => a.status === "published").length.toString(),
      icon: TrendingUp,
      change: "+8%",
      changeType: "positive" as const
    },
    {
      title: "Total Views",
      value: articles.reduce((sum, a) => sum + (a.views || 0), 0).toLocaleString(),
      icon: Users,
      change: "+23%",
      changeType: "positive" as const
    },
    {
      title: "This Month",
      value: articles.filter(a => new Date(a.date).getMonth() === new Date().getMonth()).length.toString(),
      icon: Calendar,
      change: "+5%",
      changeType: "positive" as const
    }
  ];

  return (
    <div className="space-y-4 sm:space-y-6 md:space-y-8 animate-fade-in p-3 sm:p-4 md:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-xs sm:text-sm md:text-base text-muted-foreground mt-1 sm:mt-2">
            Welcome back! Here's what's happening with your content.
          </p>
        </div>
        <Button 
          onClick={() => navigate("/add-article")}
          className="admin-button-primary flex items-center gap-2 w-full sm:w-auto h-9 sm:h-10"
        >
          <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
          Add Article
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="admin-card hover:scale-102 sm:hover:scale-105 transition-transform duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-1 sm:pb-2 px-3 sm:px-4 pt-3 sm:pt-4">
              <CardTitle className="text-xs sm:text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="px-3 sm:px-4 pb-3 sm:pb-4">
              <div className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-[10px] sm:text-xs text-muted-foreground">
                <span className={`${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.change}
                </span>
                {" "}from last month
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Articles */}
      <Card className="admin-card">
        <CardHeader className="px-3 sm:px-4 pt-3 sm:pt-4 pb-2 sm:pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
            <div>
              <CardTitle className="text-base sm:text-lg md:text-xl">Recent Articles</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Manage and monitor your published content
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate("/add-article")}
              className="flex items-center gap-1 sm:gap-2 w-full sm:w-auto h-8 sm:h-10 text-xs sm:text-sm"
            >
              <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
              New Article
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-2 sm:px-4 py-2 sm:py-3">
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[120px] sm:min-w-[200px] py-2 px-2 sm:px-4 text-xs sm:text-sm">Title</TableHead>
                  <TableHead className="hidden sm:table-cell text-xs sm:text-sm">Category</TableHead>
                  <TableHead className="py-2 px-2 sm:px-4 text-xs sm:text-sm">Status</TableHead>
                  <TableHead className="hidden md:table-cell text-xs sm:text-sm">Date</TableHead>
                  <TableHead className="hidden lg:table-cell text-xs sm:text-sm">Views</TableHead>
                  <TableHead className="w-[40px] sm:w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 sm:py-8">
                      <div className="flex flex-col items-center gap-2 sm:gap-3">
                        <FileText className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
                        <p className="text-xs sm:text-sm text-muted-foreground">No articles found</p>
                        <Button 
                          onClick={() => navigate("/add-article")}
                          className="admin-button-primary text-xs sm:text-sm h-8 sm:h-10"
                        >
                          Create your first article
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  articles.map((article) => (
                    <TableRow key={article.articleid} className="hover:bg-muted/50">
                      <TableCell className="font-medium py-2 px-2 sm:px-4">
                        <div className="max-w-[150px] sm:max-w-[200px] truncate text-xs sm:text-sm">
                          {article.title}
                        </div>
                        <div className="sm:hidden text-[10px] text-muted-foreground mt-1">
                          {article.status} • {new Date(article.date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell text-xs sm:text-sm">{article.author}</TableCell>
                      <TableCell className="py-2 px-2 sm:px-4">
                        <Badge className={`${getStatusColor(article.status)} text-[10px] sm:text-xs py-0.5 px-1.5 sm:px-2`}>
                          {article.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-xs sm:text-sm">
                        {new Date(article.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell text-xs sm:text-sm">
                        {(article.views || 0).toLocaleString()}
                      </TableCell>
                      <TableCell className="p-0 sm:p-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-6 w-6 sm:h-8 sm:w-8 p-0">
                              <MoreHorizontal className="h-3 w-3 sm:h-4 sm:w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="text-xs sm:text-sm">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEditArticle(article.articleid)}>
                              <Edit className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteArticle(article.articleid)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
