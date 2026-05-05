import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layouts
import CustomerLayout from './layouts/CustomerLayout';
import PortalLayout from './layouts/PortalLayout';

// Auth pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import SocialCallback from './pages/auth/SocialCallback';

// Customer pages
import HomePage from './pages/customer/HomePage';
import ProductListPage from './pages/customer/ProductListPage';
import ProductDetailPage from './pages/customer/ProductDetailPage';
import CartPage from './pages/customer/CartPage';
import CheckoutPage from './pages/customer/CheckoutPage';
import OrderTrackingPage from './pages/customer/OrderTrackingPage';
import CustomerDashboard from './pages/customer/CustomerDashboard';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import ProductManagement from './pages/admin/ProductManagement';
import OrderManagement from './pages/admin/OrderManagement';
import StaffManagement from './pages/admin/StaffManagement';
import CouponManagement from './pages/admin/CouponManagement';
import AnalyticsPage from './pages/admin/AnalyticsPage';
import SecurityLogPage from './pages/admin/SecurityLogPage';
import ReviewModeration from './pages/admin/ReviewModeration';

// Staff pages
import StaffDashboard from './pages/staff/StaffDashboard';
import StaffOrderDetail from './pages/staff/StaffOrderDetail';
import DeliveryPersonManagement from './pages/staff/DeliveryPersonManagement';
import PaymentDetails from './pages/staff/PaymentDetails';

// Shared pages
import CustomerQueriesPage from './pages/shared/CustomerQueriesPage';

// Delivery pages
import DeliveryDashboard from './pages/delivery/DeliveryDashboard';
import DeliveryOrderDetail from './pages/delivery/DeliveryOrderDetail';

// Guards
import ProtectedRoute from './components/ProtectedRoute';

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Auth */}
      <Route path="/login" element={user ? <Navigate to={getDashboard(user.role)} /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to="/" /> : <RegisterPage />} />
      <Route path="/auth/social" element={<SocialCallback />} />

      {/* Customer storefront */}
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductListPage />} />
        <Route path="/products/:id" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<ProtectedRoute roles={['customer']}><CheckoutPage /></ProtectedRoute>} />
        <Route path="/orders/:id/track" element={<ProtectedRoute roles={['customer']}><OrderTrackingPage /></ProtectedRoute>} />
        <Route path="/account" element={<ProtectedRoute roles={['customer']}><CustomerDashboard /></ProtectedRoute>} />
      </Route>

      {/* Admin portal */}
      <Route path="/admin" element={<ProtectedRoute roles={['admin']}><PortalLayout role="admin" /></ProtectedRoute>}>
        <Route index element={<AdminDashboard />} />
        <Route path="products" element={<ProductManagement />} />
        <Route path="orders" element={<OrderManagement />} />
        <Route path="staff" element={<StaffManagement />} />
        <Route path="coupons" element={<CouponManagement />} />
        <Route path="analytics" element={<AnalyticsPage />} />
        <Route path="security" element={<SecurityLogPage />} />
        <Route path="reviews" element={<ReviewModeration />} />
        <Route path="customer-queries" element={<CustomerQueriesPage />} />
      </Route>

      {/* Staff portal */}
      <Route path="/staff" element={<ProtectedRoute roles={['staff']}><PortalLayout role="staff" /></ProtectedRoute>}>
        <Route index element={<StaffDashboard />} />
        <Route path="orders/:id" element={<StaffOrderDetail />} />
        <Route path="delivery-persons" element={<DeliveryPersonManagement />} />
        <Route path="payments" element={<PaymentDetails />} />
        <Route path="reviews" element={<ReviewModeration />} />
        <Route path="customer-queries" element={<CustomerQueriesPage />} />
      </Route>

      {/* Delivery portal */}
      <Route path="/delivery" element={<ProtectedRoute roles={['delivery']}><PortalLayout role="delivery" /></ProtectedRoute>}>
        <Route index element={<DeliveryDashboard />} />
        <Route path="orders/:id" element={<DeliveryOrderDetail />} />
      </Route>

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

function getDashboard(role) {
  const map = { admin: '/admin', staff: '/staff', delivery: '/delivery', customer: '/' };
  return map[role] || '/';
}
