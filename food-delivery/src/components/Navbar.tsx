import React from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import { FaHome, FaShoppingCart, FaUser, FaTruck } from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const NavbarContainer = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #282c34;
  padding: 10px 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  color: #fff;
  font-size: 16px;
  font-weight: bold;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: color 0.3s;

  &:hover {
    color: #007bff;
  }
`;

const Button = styled.button`
  background-color: #48bb78;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
  transition: background-color 0.3s;

  &:hover {
    background-color: #38a169;
  }
`;

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const { isLoggedIn, user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <NavbarContainer>
      <NavLinks>
        <StyledLink to="/">
          <FaHome /> Home
        </StyledLink>
        <StyledLink to="/cart">
          <FaShoppingCart /> Cart
        </StyledLink>

        {/* Линк за обични корисници (ако додадеш страница за нарачки) */}
        {user?.role === "customer" && (
          <StyledLink to="/my-orders">📦 Моите Нарачки</StyledLink>
        )}

        {/* Линк за доставувачи */}
        {user?.role === "delivery" && (
          <StyledLink to="/my-deliveries">
            <FaTruck /> Мои Нарачки
          </StyledLink>
        )}

        {/* Линк за администратори */}
        {user?.role === "admin" && (
          <StyledLink to="/admin">🛠️ Админ Панел</StyledLink>
        )}
      </NavLinks>

      {isLoggedIn ? (
        <>
          <StyledLink to="/profile">
            <FaUser /> {user?.name || "Profile"}
          </StyledLink>

          <Button onClick={handleLogout}>Logout</Button>
        </>
      ) : (
        <Button onClick={() => navigate("/login")}>Login</Button>
      )}
    </NavbarContainer>
  );
};

export default Navbar;
