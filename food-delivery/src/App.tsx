import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Cart from "./pages/Basket";
import { Provider } from "react-redux";
import store from "./store/store";
import MainFooter from "./components/DownFooter";
import Profile from "./components/announcement/Profile";
import { AuthProvider } from "./context/AuthContext";
import { useEffect, useState } from "react";
import axios from "axios";
import RestaurantDetails from "./components/Restauraunt/RestaurantDetails";
import Register from "./components/announcement/Registration";
import Login from "./components/announcement/Login";
import { Restaurant } from "./types";
import ResetPassword from "./components/announcement/ResetPassword";
import ForgotPassword from "./components/announcement/ForgotPassword";
import ConfirmChanges from "./pages/ConfirmChanges";
import AdminPanel from "./pages/admin/AdminPanel";
import MyDeliveries from "./pages/delivery/MyDeliveries";
import MyOrders from "./pages/MyOrders";
import AdminRestaurantMenu from "./pages/admin/AdminRestaurantMenu";
import RestaurantDashboard from "./pages/restaurant/RestaurantDashboard"; // или каде и да ја поставиш
const App: React.FC = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await axios.get<Restaurant[]>(
          "http://localhost:5000/restaurants"
        );
        if (response.data) {
          setRestaurants(response.data);
        }
      } catch (error) {
        console.error("❌ Грешка при преземање на ресторани:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  if (loading) {
    return <div>🔄 Вчитување на рестораните...</div>;
  }

  return (
    <Provider store={store}>
      <AuthProvider>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home restaurants={restaurants} />} />
            <Route
              path="/restaurants/:id"
              element={<RestaurantDetails restaurants={restaurants} />}
            />
            <Route path="/register" element={<Register />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/login" element={<Login />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/confirm-changes" element={<ConfirmChanges />} />
            <Route path="/admin" element={<AdminPanel />} />
            <Route
              path="/admin/restaurants/:id/menu"
              element={<AdminRestaurantMenu />}
            />
            <Route path="/my-orders" element={<MyOrders />} />
            <Route path="/my-deliveries" element={<MyDeliveries />} />
            <Route
              path="/restaurant-dashboard"
              element={<RestaurantDashboard />}
            />
          </Routes>
          <MainFooter />
        </Router>
      </AuthProvider>
    </Provider>
  );
};

export default App;
