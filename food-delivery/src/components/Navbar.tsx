import React from "react";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import { FaHome, FaShoppingCart } from "react-icons/fa";

// Стилови за Navbar
const NavbarContainer = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #282c34;
  padding: 10px 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    padding: 10px;
  }
`;

const NavLinks = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }
`;

const StyledLink = styled(Link)<{ to: string }>`
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
  const navigate = useNavigate(); // Користење на useNavigate

  // Функција за отварање на страницата за регистрација
  const handleOpenRegistration = () => {
    navigate("/register"); // Пренасочување на /register
  };

  return (
    <NavbarContainer>
      {/* Линковите на левата страна */}
      <NavLinks>
        <StyledLink to="/" style={{ fontSize: "20px" }}>
          <FaHome />
          Дома
        </StyledLink>
        <StyledLink to="/cart" style={{ fontSize: "20px" }}>
          <FaShoppingCart />
          Корпа
        </StyledLink>
      </NavLinks>

      {/* Копче за регистрација */}
      <Button onClick={handleOpenRegistration}>Регистрирај се</Button>
    </NavbarContainer>
  );
};

export default Navbar;
