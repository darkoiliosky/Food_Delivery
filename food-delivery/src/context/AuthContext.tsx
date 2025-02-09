import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// ✅ Поправена дефиниција на User (без дупликации)
interface User {
  id: number;
  name: string;
  lastname: string;
  email: string;
  phone?: string;
  dob?: string;
  is_admin: boolean; // Додадено поле за администратор
  role: "customer" | "admin" | "delivery"; // ✅ Додадено `role`
}

// ✅ Интерфејс за одговор при најава
interface LoginResponse {
  token: string;
  user: User;
}

// ✅ Интерфејс за AuthContext
interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  setIsLoggedIn: (value: boolean) => void;
  login: (emailOrPhone: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // ✅ Проверка при вчитување на апликацијата дали корисникот е најавен
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser); // Проба за парсирање на JSON
        setUser(parsedUser);
        setIsLoggedIn(true);
      } catch (error) {
        console.error("Error parsing user data:", error); // Ако не е валиден JSON
        localStorage.removeItem("user"); // Избриши невалиден user
        localStorage.removeItem("token"); // Избриши невалиден токен
        setIsLoggedIn(false);
        setUser(null);
      }
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  }, []);

  // ✅ Функција за најава
  const login = async (emailOrPhone: string, password: string) => {
    try {
      const response = await axios.post<LoginResponse>(
        "http://localhost:5000/login",
        { emailOrPhone, password },
        { withCredentials: true } // Дозволи cookies ако користиш JWT во cookies
      );

      const { token, user } = response.data;

      if (!token || !user.role) {
        // ✅ Проверка дали role постои
        throw new Error("Token or role missing from server response.");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      console.log("✅ Logged in user:", user); // ✅ Додади проверка

      setUser(user);
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Login error:", error);
      throw new Error("Неуспешна најава. Проверете ги податоците.");
    }
  };

  // ✅ Функција за одјава
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, user, setIsLoggedIn, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Hook за користење на AuthContext
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth мора да се користи внатре во AuthProvider");
  }
  return context;
};
