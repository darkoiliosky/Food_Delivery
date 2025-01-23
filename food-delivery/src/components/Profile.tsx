import React from "react";
import styled from "styled-components";
import { FaUser } from "react-icons/fa"; // Икона за Account

const Container = styled.div`
  background-color: #00ccbc;
  padding: 40px 20px;
  color: white;
  height: 250px; /* Поголема висина за 150px */
  width: 100%; /* Сега зафаќа цел екран */
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
`;

const Navbar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 95%;
  max-width: 1200px;
  position: absolute;
  top: 10px;
`;

const Logo = styled.a`
  font-size: 26px;
  font-weight: bold;
  text-decoration: none;
  color: white; /* Бело лого */
  background-color: #00ccbc;
  padding: 10px;
  border-radius: 8px;
`;

const AccountButton = styled.button`
  background: white;
  border: none;
  display: flex;
  align-items: center;
  padding: 10px 15px;
  border-radius: 20px;
  cursor: pointer;
  font-size: 16px;
  color: black;
  font-weight: bold;

  svg {
    margin-right: 5px;
  }
`;

const ProfileHeader = styled.div`
  text-align: center;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%); /* Центрирање */
`;

const ProfileName = styled.h1`
  font-size: 36px;
  font-weight: bold;
  margin-bottom: 5px;
`;

const ProfileEmail = styled.p`
  font-size: 20px;
  opacity: 0.9;
`;

const Profile: React.FC = () => {
  return (
    <Container>
      <Navbar>
        <Logo href="/">Порачај јади</Logo>
        <AccountButton>
          <FaUser /> Account
        </AccountButton>
      </Navbar>

      <ProfileHeader>
        <ProfileName>Дарко Илиоски</ProfileName>
        <ProfileEmail>dare.ilioski@hotmail.com</ProfileEmail>
      </ProfileHeader>
    </Container>
  );
};

export default Profile;
