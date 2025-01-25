import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Cart from "./pages/Basket";
import { Provider } from "react-redux";
import store from "./store/store";
import MainFooter from "./components/DownFooter";
import RegistrationPage from "./components/announcement/Registration";
import Profile from "./components/Profile";
import { AuthProvider } from "./context/AuthContext"; // Импорт на AuthProvider

import { useEffect, useState } from "react";
import axios from "axios";
import RestaurantDetails from "./components/Restauraunt/RestaurantDetails";
import Register from "./components/announcement/Registration";
import Login from "./components/announcement/Login";
const App: React.FC = () => {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true); // додај loading state

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await axios.get("http://localhost:5000/restaurants");
        console.log("Fetched restaurants:", response.data); // Овде провери ги податоците
        setRestaurants(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching restaurants:", error);
        setLoading(false);
      }
    };

    fetchRestaurants();
  }, []);

  if (loading) {
    return <div>Вчитување на рестораните...</div>; // Прикажи порака додека се вчитуваат податоците
  }

  return (
    <>
      <AuthProvider>
        {" "}
        {/* Обвиј AuthProvider околу целиот компонент */}
        <Provider store={store}>
          <Router>
            <Navbar />
            <Routes>
              <Route path="/" element={<Home restaurants={restaurants} />} />
              <Route
                path="/restaurants/:id"
                element={<RestaurantDetails restaurants={restaurants} />}
              />
              <Route path="/register" element={<RegistrationPage />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/register" element={<Register />} />
              <Route path="/login" element={<Login />} />
            </Routes>
          </Router>
        </Provider>
        <MainFooter />
      </AuthProvider>
    </>
  );
};

export default App;
