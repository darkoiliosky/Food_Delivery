import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

// ================== Типови и Интерфејси ==================
interface User {
  id: number;
  name: string;
  lastname: string;
  email: string;
  phone?: string;
  dob?: string;
  is_admin: boolean;
  role: "customer" | "admin" | "delivery" | "restaurant"; // Вклучив "restaurant"
  is_verified?: boolean;
}

interface LoginResponse {
  token: string;
  user: User;
}

// Што ќе содржи контекстот
interface AuthContextType {
  isLoggedIn: boolean;
  user: User | null;
  setIsLoggedIn: (value: boolean) => void;
  login: (emailOrPhone: string, password: string) => Promise<void>;
  loginRestaurant?: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

// Создаваме context (почетно undefined)
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// ================== AuthProvider Компонента ==================
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // При mount, проверуваме дали има token/user во localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser) {
      try {
        const parsedUser: User = JSON.parse(storedUser);
        setUser(parsedUser);
        setIsLoggedIn(true);
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        setIsLoggedIn(false);
        setUser(null);
      }
    }
  }, []);

  // ================== login ==================
  const login = async (emailOrPhone: string, password: string) => {
    try {
      // Обична рута /login
      const response = await axios.post<LoginResponse>(
        "http://localhost:5000/login",
        { emailOrPhone, password },
        { withCredentials: true }
      );
      const { token, user } = response.data;
      if (!token || !user.role) {
        throw new Error("Token or role missing in server response.");
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

  // ================== loginRestaurant (по желба) ==================
  const loginRestaurant = async (email: string, password: string) => {
    try {
      // Засебна рута /login-restaurant (ако сакате да ја задржите)
      const response = await axios.post<LoginResponse>(
        "http://localhost:5000/login-restaurant",
        { email, password },
        { withCredentials: true }
      );
      const { token, user } = response.data;
      if (!token || user.role !== "restaurant") {
        throw new Error("Invalid restaurant login or role mismatch.");
      }
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      setUser(user);
      setIsLoggedIn(true);
    } catch (error) {
      console.error("Restaurant login error:", error);
      throw new Error("Неуспешна најава за ресторан.");
    }
  };

  // ================== logout ==================
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    setIsLoggedIn(false);
  };

  // ================== Return: Provider ==================
  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        user,
        setIsLoggedIn,
        login,
        loginRestaurant,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ================== useAuth Hook ==================
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth мора да се користи внатре во AuthProvider");
  }
  return context;
};
