import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { AppShell } from '../components/ui/AppShell';
import { AuthLoadingScreen } from '../components/ui/AuthLoadingScreen';

// --- Auth Pages ---
import { LoginPage } from '../pages/auth/LoginPage';
import { SignupPage } from '../pages/auth/SignupPage';
import { RoleSelectionPage } from '../pages/auth/RoleSelectionPage';

// --- Buyer Pages ---
import { BuyerHomePage } from '../pages/buyer/BuyerHomePage';
import { BuyerCategoriesPage } from '../pages/buyer/BuyerCategoriesPage';
import { BuyerMarketplacePage } from '../pages/buyer/BuyerMarketplacePage';
import { ProductDetailPage } from '../pages/buyer/ProductDetailPage';
import { SellerProfilePage } from '../pages/buyer/SellerProfilePage';
import { WishlistPage } from '../pages/buyer/WishlistPage';
import { ProcurementCartPage } from '../pages/buyer/ProcurementCartPage';
import { CheckoutPage } from '../pages/buyer/CheckoutPage';
import { OrderReviewPage } from '../pages/buyer/OrderReviewPage';
import { PaymentPage } from '../pages/buyer/PaymentPage';
import { OrderConfirmationPage } from '../pages/buyer/OrderConfirmationPage';
import { BuyerOrdersPage } from '../pages/buyer/BuyerOrdersPage';
import { OrderTrackingPage } from '../pages/buyer/OrderTrackingPage';
import { BuyerProfilePage } from '../pages/buyer/BuyerProfilePage';
import { BulkRequirementsPage } from '../pages/buyer/BulkRequirementsPage';
import { CreateBulkRequirementPage } from '../pages/buyer/CreateBulkRequirementPage';

// --- Farmer Pages ---
import { FarmerDashboardPage } from '../pages/farmer/FarmerDashboardPage';
import { SellerWindowPage } from '../pages/farmer/SellerWindowPage';
import { AddCropListingPage } from '../pages/farmer/AddCropListingPage';
import { FarmerOrdersPage } from '../pages/farmer/FarmerOrdersPage';
import { FarmerOrderDetailPage } from '../pages/farmer/FarmerOrderDetailPage';
import { FarmerCalculationsPage } from '../pages/farmer/FarmerCalculationsPage';
import { CropLifeCyclePage } from '../pages/farmer/CropLifeCyclePage';
import { FarmerNewsPage } from '../pages/farmer/FarmerNewsPage';
import { ColdStoragePage } from '../pages/farmer/ColdStoragePage';
import { AIAssistantPage } from '../pages/farmer/AIAssistantPage';

// --- Admin Pages ---
import { AdminPortalPage } from '../pages/admin/AdminPortalPage';

// --- Error Pages ---
import { UnauthorizedPage } from '../pages/UnauthorizedPage';

// ─── Role-Based Root Redirect ─────────────────────────────────────────────────
const RootRedirect: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { currentRole } = useApp();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  const role = user?.role || currentRole;
  if (role === 'farmer') return <Navigate to="/farmer" replace />;
  if (role === 'admin') return <Navigate to="/admin" replace />;
  return <Navigate to="/buyer" replace />;
};

// ─── Redirect authenticated users away from login/signup ─────────────────────
const PublicOnlyRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  if (!isAuthenticated) return <>{children}</>;
  // Already logged in — send to correct dashboard
  const dest = user?.role === 'farmer' ? '/farmer' : user?.role === 'admin' ? '/admin' : '/buyer';
  return <Navigate to={dest} replace />;
};

// ─── Auth Guard: requires login, optionally requires specific roles ────────────
const RequireAuth: React.FC<{
  children: React.ReactNode;
  allowedRoles?: string[];
}> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Preserve intended destination so login can redirect back
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
};

// ─── Shell Wrapper ─────────────────────────────────────────────────────────────
const Shell: React.FC<{ children: React.ReactNode; showSidebar?: boolean }> = ({
  children,
  showSidebar = true,
}) => (
  <AppShell showSidebar={showSidebar}>
    {children}
  </AppShell>
);

// ─── App Router ────────────────────────────────────────────────────────────────
export const AppRouter: React.FC = () => {
  const { isLoading } = useAuth();

  // Show full-screen loading gate while session is being verified on startup
  if (isLoading) {
    return <AuthLoadingScreen />;
  }

  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<RootRedirect />} />

      {/* ── Unauthorized Page ── */}
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      {/* ── Auth Pages (public only — redirect authed users away) ── */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <AppShell showSidebar={false}>
              <LoginPage />
            </AppShell>
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicOnlyRoute>
            <AppShell showSidebar={false}>
              <SignupPage />
            </AppShell>
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/role-selection"
        element={
          <RequireAuth>
            <AppShell showSidebar={false}>
              <RoleSelectionPage />
            </AppShell>
          </RequireAuth>
        }
      />

      {/* ── Buyer Routes (buyer + admin only) ── */}
      <Route path="/buyer" element={
        <RequireAuth allowedRoles={['buyer', 'admin']}>
          <Shell><BuyerHomePage /></Shell>
        </RequireAuth>
      } />
      <Route path="/buyer/categories" element={
        <RequireAuth allowedRoles={['buyer', 'admin']}>
          <Shell><BuyerCategoriesPage /></Shell>
        </RequireAuth>
      } />
      <Route path="/buyer/marketplace" element={
        <RequireAuth allowedRoles={['buyer', 'admin']}>
          <Shell><BuyerMarketplacePage /></Shell>
        </RequireAuth>
      } />
      <Route path="/buyer/product/:id" element={
        <RequireAuth allowedRoles={['buyer', 'admin']}>
          <Shell><ProductDetailPage /></Shell>
        </RequireAuth>
      } />
      <Route path="/buyer/seller/:id" element={
        <RequireAuth allowedRoles={['buyer', 'admin']}>
          <Shell><SellerProfilePage /></Shell>
        </RequireAuth>
      } />
      <Route path="/buyer/wishlist" element={
        <RequireAuth allowedRoles={['buyer', 'admin']}>
          <Shell><WishlistPage /></Shell>
        </RequireAuth>
      } />
      <Route path="/buyer/cart" element={
        <RequireAuth allowedRoles={['buyer', 'admin']}>
          <Shell><ProcurementCartPage /></Shell>
        </RequireAuth>
      } />
      <Route path="/buyer/checkout" element={
        <RequireAuth allowedRoles={['buyer', 'admin']}>
          <Shell><CheckoutPage /></Shell>
        </RequireAuth>
      } />
      <Route path="/buyer/order-review" element={
        <RequireAuth allowedRoles={['buyer', 'admin']}>
          <Shell><OrderReviewPage /></Shell>
        </RequireAuth>
      } />
      <Route path="/buyer/payment" element={
        <RequireAuth allowedRoles={['buyer', 'admin']}>
          <Shell><PaymentPage /></Shell>
        </RequireAuth>
      } />
      <Route path="/buyer/order-confirmation/:id" element={
        <RequireAuth allowedRoles={['buyer', 'admin']}>
          <Shell><OrderConfirmationPage /></Shell>
        </RequireAuth>
      } />
      <Route path="/buyer/orders" element={
        <RequireAuth allowedRoles={['buyer', 'admin']}>
          <Shell><BuyerOrdersPage /></Shell>
        </RequireAuth>
      } />
      <Route path="/buyer/orders/:id" element={
        <RequireAuth allowedRoles={['buyer', 'admin']}>
          <Shell><OrderTrackingPage /></Shell>
        </RequireAuth>
      } />
      <Route path="/buyer/profile" element={
        <RequireAuth allowedRoles={['buyer', 'admin']}>
          <Shell><BuyerProfilePage /></Shell>
        </RequireAuth>
      } />
      <Route path="/buyer/bulk-requirements" element={
        <RequireAuth allowedRoles={['buyer', 'admin']}>
          <Shell><BulkRequirementsPage /></Shell>
        </RequireAuth>
      } />
      <Route path="/buyer/bulk-requirements/create" element={
        <RequireAuth allowedRoles={['buyer', 'admin']}>
          <Shell><CreateBulkRequirementPage /></Shell>
        </RequireAuth>
      } />

      {/* ── Farmer Routes (farmer + admin only) ── */}
      <Route path="/farmer" element={
        <RequireAuth allowedRoles={['farmer', 'admin']}>
          <Shell><FarmerDashboardPage /></Shell>
        </RequireAuth>
      } />
      <Route path="/farmer/seller-window" element={
        <RequireAuth allowedRoles={['farmer', 'admin']}>
          <Shell><SellerWindowPage /></Shell>
        </RequireAuth>
      } />
      <Route path="/farmer/seller-window/add" element={
        <RequireAuth allowedRoles={['farmer', 'admin']}>
          <Shell><AddCropListingPage /></Shell>
        </RequireAuth>
      } />
      <Route path="/farmer/seller-window/edit/:id" element={
        <RequireAuth allowedRoles={['farmer', 'admin']}>
          <Shell><AddCropListingPage /></Shell>
        </RequireAuth>
      } />
      <Route path="/farmer/orders" element={
        <RequireAuth allowedRoles={['farmer', 'admin']}>
          <Shell><FarmerOrdersPage /></Shell>
        </RequireAuth>
      } />
      <Route path="/farmer/orders/:id" element={
        <RequireAuth allowedRoles={['farmer', 'admin']}>
          <Shell><FarmerOrderDetailPage /></Shell>
        </RequireAuth>
      } />
      <Route path="/farmer/calculations" element={
        <RequireAuth allowedRoles={['farmer', 'admin']}>
          <Shell><FarmerCalculationsPage /></Shell>
        </RequireAuth>
      } />
      <Route path="/farmer/crop-lifecycle" element={
        <RequireAuth allowedRoles={['farmer', 'admin']}>
          <Shell><CropLifeCyclePage /></Shell>
        </RequireAuth>
      } />
      <Route path="/farmer/crop-life-cycle" element={
        <RequireAuth allowedRoles={['farmer', 'admin']}>
          <Shell><CropLifeCyclePage /></Shell>
        </RequireAuth>
      } />
      <Route path="/farmer/news" element={
        <RequireAuth allowedRoles={['farmer', 'admin']}>
          <Shell><FarmerNewsPage /></Shell>
        </RequireAuth>
      } />
      <Route path="/farmer/cold-storage" element={
        <RequireAuth allowedRoles={['farmer', 'admin']}>
          <Shell><ColdStoragePage /></Shell>
        </RequireAuth>
      } />
      <Route path="/farmer/ai" element={
        <RequireAuth allowedRoles={['farmer', 'admin']}>
          <Shell><AIAssistantPage /></Shell>
        </RequireAuth>
      } />

      {/* ── Admin Routes (admin only) ── */}
      <Route path="/admin" element={
        <RequireAuth allowedRoles={['admin']}>
          <Shell><AdminPortalPage /></Shell>
        </RequireAuth>
      } />

      {/* ── 404 Fallback ── */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
