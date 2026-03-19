import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AuthProvider } from "./contexts/AuthContext";
import { ChatProvider } from "./contexts/ChatContext";
import Header from "./components/layout/header";
import Footer from "./components/layout/footer";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import VerifyEmail from "./pages/auth/VerifyEmail";
import BikeList from "./pages/bikes/BikeList";
import BikeDetailPage from "./pages/bikes/BikeDetailPage";
import SellerDashboard from "./pages/seller/SellerDashboard";
import MyPostsPage from "./pages/seller/MyPostsPage";
import CreatePostPage from "./pages/seller/CreatePostPage";
import EditPostPage from "./pages/seller/EditPostPage";
import MyInspectionRequestsPage from "./pages/seller/MyInspectionRequestsPage";
import SellerOrdersPage from "./pages/seller/SellerOrdersPage";
import WishlistPage from "./pages/wishlist/WishlistPage";
import CartPage from "./pages/cart/CartPage";
import MyOrdersPage from "./pages/orders/MyOrdersPage";
import OrderDetailPage from "./pages/orders/OrderDetailPage";
import ConversationsPage from "./pages/chat/ConversationsPage";
import ChatRoomPage from "./pages/chat/ChatRoomPage";
import ProfilePage from "./pages/profile/ProfilePage";
import EditProfilePage from "./pages/profile/EditProfilePage";
import ChangePasswordPage from "./pages/profile/ChangePasswordPage";
import MyAbuseReportsPage from "./pages/abuse/MyAbuseReportsPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import PostModerationPage from "./pages/admin/PostModerationPage";
import UserManagementPage from "./pages/admin/UserManagementPage";
import AbuseManagementPage from "./pages/admin/AbuseManagementPage";
import CategoryManagementPage from "./pages/admin/CategoryManagementPage";
import BrandManagementPage from "./pages/admin/BrandManagementPage";
import BicycleCatalogPage from "./pages/admin/BicycleCatalogPage";
import InspectorDashboard from "./pages/inspector/InspectorDashboard";
import PendingInspectionsPage from "./pages/inspector/PendingInspectionsPage";
import AssignedInspectionsPage from "./pages/inspector/AssignedInspectionsPage";
import UploadReportPage from "./pages/inspector/UploadReportPage";
import MyInspectionReportsPage from "./pages/inspector/MyInspectionReportsPage";
import InspectionReportPage from "./pages/inspection/InspectionReportPage";
import { ROUTES } from "./constants/routes";
import "./App.css";

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

const HomePlaceholder = () => (
  <div style={{ maxWidth: "1280px", margin: "0 auto" }}>
    <h1
      style={{
        fontSize: "2.5rem",
        marginBottom: "1rem",
        color: "#1F2937",
      }}
    >
      Welcome to SecondBike
    </h1>
    <p
      style={{
        fontSize: "1.2rem",
        color: "#6B7280",
        marginBottom: "2rem",
      }}
    >
      Your trusted marketplace for quality used bicycles.
    </p>

    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
        gap: "2rem",
        marginTop: "3rem",
      }}
    >
      <div
        style={{
          backgroundColor: "white",
          padding: "2rem",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <h3 style={{ color: "#C41E3A", marginBottom: "1rem" }}>🏠 Trang chủ</h3>
        <p style={{ color: "#6B7280" }}>
          Browse our collection of quality used bicycles
        </p>
      </div>

      <div
        style={{
          backgroundColor: "white",
          padding: "2rem",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <h3 style={{ color: "#C41E3A", marginBottom: "1rem" }}>🛒 Giỏ hàng</h3>
        <p style={{ color: "#6B7280" }}>View your selected items</p>
      </div>

      <div
        style={{
          backgroundColor: "white",
          padding: "2rem",
          borderRadius: "12px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        }}
      >
        <h3 style={{ color: "#C41E3A", marginBottom: "1rem" }}>❤️ Wishlist</h3>
        <p style={{ color: "#6B7280" }}>Your favorite bikes saved for later</p>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
      <BrowserRouter>
        <AuthProvider>
          <ChatProvider>
            <div
              style={{
                minHeight: "100vh",
                display: "flex",
                flexDirection: "column",
                width: "100vw",
              }}
            >
              <Header />

              {/* Main content */}
              <main
                style={{
                  flex: 1,
                  padding: "3rem 1.5rem",
                  backgroundColor: "#f9fafb",
                }}
              >
                <Routes>
                  {/* Auth Routes */}
                  <Route path={ROUTES.LOGIN} element={<Login />} />
                  <Route path={ROUTES.REGISTER} element={<Register />} />
                  <Route path={ROUTES.VERIFY_EMAIL} element={<VerifyEmail />} />

                  {/* Bike Routes */}
                  <Route path={ROUTES.BIKES} element={<BikeList />} />
                  <Route
                    path={ROUTES.BIKE_DETAIL}
                    element={<BikeDetailPage />}
                  />
                  <Route path={ROUTES.STORE} element={<BikeList />} />

                  {/* Seller Routes */}
                  <Route
                    path={ROUTES.SELLER_DASHBOARD}
                    element={<SellerDashboard />}
                  />
                  <Route
                    path={ROUTES.SELLER_LISTINGS}
                    element={<MyPostsPage />}
                  />
                  <Route
                    path={ROUTES.SELLER_CREATE}
                    element={<CreatePostPage />}
                  />
                  <Route path={ROUTES.SELLER_EDIT} element={<EditPostPage />} />
                  <Route
                    path={ROUTES.SELLER_INSPECTIONS}
                    element={<MyInspectionRequestsPage />}
                  />
                  <Route
                    path={ROUTES.SELLER_ORDERS}
                    element={<SellerOrdersPage />}
                  />

                  {/* Inspector Routes */}
                  <Route
                    path={ROUTES.INSPECTOR_DASHBOARD}
                    element={<InspectorDashboard />}
                  />
                  <Route
                    path={ROUTES.INSPECTOR_PENDING}
                    element={<PendingInspectionsPage />}
                  />
                  <Route
                    path={ROUTES.INSPECTOR_ASSIGNED}
                    element={<AssignedInspectionsPage />}
                  />
                  <Route
                    path={ROUTES.INSPECTOR_UPLOAD_REPORT}
                    element={<UploadReportPage />}
                  />
                  <Route
                    path={ROUTES.INSPECTOR_MY_REPORTS}
                    element={<MyInspectionReportsPage />}
                  />

                  {/* Inspection Report (Public) */}
                  <Route
                    path={ROUTES.INSPECTION_REPORT}
                    element={<InspectionReportPage />}
                  />

                  {/* Functional Routes */}
                  <Route path={ROUTES.CART} element={<CartPage />} />
                  <Route path={ROUTES.WISHLIST} element={<WishlistPage />} />
                  <Route path={ROUTES.MY_ORDERS} element={<MyOrdersPage />} />
                  <Route
                    path={ROUTES.ORDER_DETAIL}
                    element={<OrderDetailPage />}
                  />

                  {/* Chat / Messaging Routes */}
                  <Route
                    path={ROUTES.MESSAGES}
                    element={<ConversationsPage />}
                  />
                  <Route path={ROUTES.CHAT_ROOM} element={<ChatRoomPage />} />

                  {/* Buyer Abuse Reports */}
                  <Route
                    path={ROUTES.MY_REPORTS}
                    element={<MyAbuseReportsPage />}
                  />

                  {/* Admin Routes */}
                  <Route
                    path={ROUTES.ADMIN_DASHBOARD}
                    element={<AdminDashboard />}
                  />
                  <Route
                    path={ROUTES.ADMIN_MODERATION}
                    element={<PostModerationPage />}
                  />
                  <Route
                    path={ROUTES.ADMIN_USERS}
                    element={<UserManagementPage />}
                  />
                  <Route
                    path={ROUTES.ADMIN_CATEGORIES}
                    element={<CategoryManagementPage />}
                  />
                  <Route
                    path={ROUTES.ADMIN_BRANDS}
                    element={<BrandManagementPage />}
                  />
                  <Route
                    path={ROUTES.ADMIN_BICYCLES}
                    element={<BicycleCatalogPage />}
                  />
                  <Route
                    path={ROUTES.ADMIN_ABUSE}
                    element={<AbuseManagementPage />}
                  />

                  <Route path={ROUTES.PROFILE} element={<ProfilePage />} />
                  <Route
                    path={ROUTES.PROFILE_EDIT}
                    element={<EditProfilePage />}
                  />
                  <Route
                    path={ROUTES.PROFILE_CHANGE_PASSWORD}
                    element={<ChangePasswordPage />}
                  />

                  {/* Home Route */}
                  <Route path={ROUTES.HOME} element={<HomePlaceholder />} />
                </Routes>
              </main>

              <Footer />
            </div>

            <Toaster
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: "#363636",
                  color: "#fff",
                },
              }}
            />
          </ChatProvider>
        </AuthProvider>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
