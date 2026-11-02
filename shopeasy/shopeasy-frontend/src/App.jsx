import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import StoreLayout from "./components/StoreLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import ProductDetailsPage from "./pages/ProductDetailsPage";
import OrdersPage from "./pages/OrdersPage";
import OrderPage from "./pages/OrderPage";
import AdminOrdersPage from "./pages/AdminOrdersPage";
import AdminProductsPage from "./pages/AdminProductsPage";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<StoreLayout />}>
              <Route index element={<Home />} />
              <Route path="login" element={<Login />} />
              <Route path="register" element={<Register />} />
              <Route path="products/:id" element={<ProductDetailsPage />} />
              <Route path="cart" element={<CartPage />} />
              <Route path="checkout" element={
                <ProtectedRoute><CheckoutPage /></ProtectedRoute>
              } />
              <Route path="orders/success/:id" element={
                <ProtectedRoute><OrderPage success /></ProtectedRoute>
              } />
              <Route path="orders" element={
                <ProtectedRoute><OrdersPage /></ProtectedRoute>
              } />
              <Route path="orders/:id" element={
                <ProtectedRoute><OrderPage /></ProtectedRoute>
              } />
              <Route path="admin/orders" element={
                <ProtectedRoute role="ADMIN"><AdminOrdersPage /></ProtectedRoute>
              } />
              <Route path="admin/products" element={
                <ProtectedRoute role="ADMIN"><AdminProductsPage /></ProtectedRoute>
              } />
              <Route path="admin/orders/:id" element={
                <ProtectedRoute role="ADMIN"><OrderPage admin /></ProtectedRoute>
              } />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
