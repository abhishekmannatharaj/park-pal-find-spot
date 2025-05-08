
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation, Outlet } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { AppProvider } from "./context/AppContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import MapPage from "./pages/MapPage";
import BookingsPage from "./pages/BookingsPage";
import SpotsPage from "./pages/SpotsPage";
import AddSpotPage from "./pages/AddSpotPage";
import ProfilePage from "./pages/ProfilePage";
import AdminPage from "./pages/AdminPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Protected route wrapper
const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  // While checking auth status, show nothing
  if (isLoading) {
    return null;
  }
  
  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If authenticated, render the child routes
  return <Outlet />;
};

// Admin route wrapper
const AdminRoute = () => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  
  // While checking auth status, show nothing
  if (isLoading) {
    return null;
  }
  
  // If not authenticated or not admin, redirect
  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  // If admin, render the child routes
  return <Outlet />;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<Auth />} />
      <Route path="/signup" element={<Auth />} />
      
      {/* Admin routes */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminPage />} />
      </Route>
      
      {/* Protected routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/map" element={<MapPage />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/spots" element={<SpotsPage />} />
        <Route path="/add-spot" element={<AddSpotPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Route>
      
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AppRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </AppProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
