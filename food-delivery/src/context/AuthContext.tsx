// AuthContext.tsx
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

interface User {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dob?: string;
}

interface LoginResponse {
  token: string;
  user: User;
}

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

  // Оваа useEffect ќе се активира само кога ќе се учита компонентата
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser); // Проба за парсирање на JSON
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
  const login = async (emailOrPhone: string, password: string) => {
    try {
      const response = await axios.post<LoginResponse>(
        "http://localhost:5000/login",
        { emailOrPhone, password },
        { withCredentials: true } // Додај го ова за да дозволиш cookies
      );

      const { token, user } = response.data;

      console.log("Token received from backend:", token); // DEBUG
      console.log("User received:", user); // DEBUG

      if (!token) {
        throw new Error("Token not received from server.");
      }

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Login error:", error);
      throw new Error("Неуспешна најава. Проверете ги податоците.");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsLoggedIn(false); // Постави статус на одјавен
  };

  return (
    <AuthContext.Provider
      value={{ isLoggedIn, user, setIsLoggedIn, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth мора да се користи внатре во AuthProvider");
  }
  return context;
};
