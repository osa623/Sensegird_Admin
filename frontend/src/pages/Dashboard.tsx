
import { useState } from "react";
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

interface Article {
  id: string;
  title: string;
  category: string;
  date: string;
  status: "published" | "draft" | "archived";
  views: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [articles, setArticles] = useState<Article[]>([
    {
      id: "1",
      title: "Getting Started with Modern Web Development",
      category: "Technology",
      date: "2024-06-10",
      status: "published",
      views: 1234
    },
    {
      id: "2",
      title: "The Future of AI in Content Creation",
      category: "AI",
      date: "2024-06-08",
      status: "published",
      views: 856
    },
    {
      id: "3",
      title: "Building Responsive Layouts with CSS Grid",
      category: "Design",
      date: "2024-06-05",
      status: "draft",
      views: 0
    },
    {
      id: "4",
      title: "Understanding React Hooks in Depth",
      category: "Technology",
      date: "2024-06-03",
      status: "published",
      views: 642
    }
  ]);

  const handleDeleteArticle = (id: string) => {
    setArticles(articles.filter(article => article.id !== id));
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
      value: articles.reduce((sum, a) => sum + a.views, 0).toLocaleString(),
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
    <div className="space-y-6 sm:space-y-8 animate-fade-in p-4 sm:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1 sm:mt-2">
            Welcome back! Here's what's happening with your content.
          </p>
        </div>
        <Button 
          onClick={() => navigate("/add-article")}
          className="admin-button-primary flex items-center gap-2 w-full sm:w-auto"
        >
          <Plus className="w-4 h-4" />
          Add Article
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="admin-card hover:scale-105 transition-transform duration-200">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
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
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg sm:text-xl">Recent Articles</CardTitle>
              <CardDescription className="text-sm">
                Manage and monitor your published content
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              onClick={() => navigate("/add-article")}
              className="flex items-center gap-2 w-full sm:w-auto"
            >
              <Plus className="w-4 h-4" />
              New Article
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[200px]">Title</TableHead>
                  <TableHead className="hidden sm:table-cell">Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden md:table-cell">Date</TableHead>
                  <TableHead className="hidden lg:table-cell">Views</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {articles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center gap-3">
                        <FileText className="w-8 h-8 text-muted-foreground" />
                        <p className="text-muted-foreground">No articles found</p>
                        <Button 
                          onClick={() => navigate("/add-article")}
                          className="admin-button-primary"
                        >
                          Create your first article
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  articles.map((article) => (
                    <TableRow key={article.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">
                        <div className="max-w-[200px] truncate">
                          {article.title}
                        </div>
                        <div className="sm:hidden text-xs text-muted-foreground mt-1">
                          {article.category} • {new Date(article.date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">{article.category}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(article.status)}>
                          {article.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        {new Date(article.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">{article.views.toLocaleString()}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleEditArticle(article.id)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={() => handleDeleteArticle(article.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
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
