import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { createContext, useContext, useState, useEffect } from "react";
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth";
import { auth } from "./lib/firebase";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import Dashboard from "./pages/Dashboard";
import AddArticle from "./pages/AddArticle";
import EditArticle from "./pages/EditArticle";
import NotFound from "./pages/NotFound";
import AdminLayout from "./components/AdminLayout";
import ManageArticles from "./pages/ManageArticles";

const queryClient = new QueryClient();

// Auth context for demo purposes
interface User {
  uid: string;
  name: string | null;
  email: string | null;
  photoURL?: string | null;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  loading: boolean;
  setUser: (user: User | null) => void;
}

// Create the auth context
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  user: null,
  loading: true,
  setUser: () => {}
});

export const useAuth = () => useContext(AuthContext);

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          name: firebaseUser.displayName,
          email: firebaseUser.email,
          photoURL: firebaseUser.photoURL,
        });
      } else {
        setUser(null);
      }
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthContext.Provider value={{ 
        isAuthenticated: !!user, 
        user, 
        loading,
        setUser 
      }}>
        <TooltipProvider>
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <Dashboard />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              
              {/* Admin routes */}
              <Route path="/dashboard" element={
                <Navigate to="/" replace />
              } />
              <Route path="/add-article" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <AddArticle />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/edit-article/:id" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <EditArticle />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              <Route path="/manage-articles" element={
                <ProtectedRoute>
                  <AdminLayout>
                    <ManageArticles />
                  </AdminLayout>
                </ProtectedRoute>
              } />
              
              {/* Not found */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <Toaster />
          </BrowserRouter>
        </TooltipProvider>
      </AuthContext.Provider>
    </QueryClientProvider>
  );
};

export default App;
