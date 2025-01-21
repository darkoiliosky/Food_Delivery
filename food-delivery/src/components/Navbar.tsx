import React, { useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { FaHome, FaShoppingCart } from "react-icons/fa";
import RegistrationModal from "./RegistrationModal";

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

const Navbar: React.FC = () => {
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);

  const handleOpenModal = () => setIsRegistrationModalOpen(true);
  const handleCloseModal = () => setIsRegistrationModalOpen(false);

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
      <button
        onClick={handleOpenModal}
        style={{
          backgroundColor: "#48BB78",
          color: "white",
          padding: "10px 15px",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
      >
        Регистрирај се
      </button>

      {/* Регистрациски модал */}
      <RegistrationModal
        isOpen={isRegistrationModalOpen}
        onClose={handleCloseModal}
      />
    </NavbarContainer>
  );
};

export default Navbar;
