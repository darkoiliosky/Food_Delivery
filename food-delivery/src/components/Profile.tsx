import React, { useState } from "react";
import styled from "styled-components";
import { FaUser } from "react-icons/fa";

const Container = styled.div`
  background-color: #00ccbc;
  padding: 20px;
  color: white;
  height: 20vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
`;

const Navbar = styled.nav`
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
  color: white;
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

const ProfileHeader = styled.header`
  text-align: center;
  position: absolute;
  top: 20%;
  left: 50%;
  transform: translate(-50%, -50%);
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

const AccountDetails = styled.section`
  background: white;
  color: black;
  padding: 20px;
  border-radius: 10px;
  width: 90%;
  max-width: 600px;
  margin-top: 20px;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  margin-bottom: 5px;
  font-weight: bold;
`;

const Input = styled.input`
  margin-bottom: 15px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const SubmitButton = styled.button`
  background-color: #00ccbc;
  color: white;
  padding: 10px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  font-weight: bold;
`;

const Profile: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dob: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const password = prompt("Please enter your password to confirm changes:");
    if (password) {
      // Handle form submission logic here
      console.log("Form submitted", formData);
    } else {
      alert("Password is required to submit the form.");
    }
  };

  return (
    <>
      <Container>
        <Navbar>
          <Logo href="/">Deliveroo</Logo>
          <AccountButton>
            <FaUser /> Account
          </AccountButton>
        </Navbar>
      </Container>

      <ProfileHeader>
        <ProfileName>Дарко Илиоски</ProfileName>
        <ProfileEmail>dare.ilioski@hotmail.com</ProfileEmail>
      </ProfileHeader>

      <AccountDetails>
        <h2>Account Details</h2>
        <Form onSubmit={handleSubmit}>
          <Label htmlFor="firstName">First Name</Label>
          <Input
            type="text"
            id="firstName"
            name="firstName"
            placeholder="Enter your first name"
            value={formData.firstName}
            onChange={handleChange}
          />

          <Label htmlFor="lastName">Last Name</Label>
          <Input
            type="text"
            id="lastName"
            name="lastName"
            placeholder="Enter your last name"
            value={formData.lastName}
            onChange={handleChange}
          />

          <Label htmlFor="email">Email</Label>
          <Input
            type="email"
            id="email"
            name="email"
            placeholder="Enter your email"
            value={formData.email}
            onChange={handleChange}
          />

          <Label htmlFor="phone">Phone</Label>
          <Input
            type="tel"
            id="phone"
            name="phone"
            placeholder="Enter your phone number"
            value={formData.phone}
            onChange={handleChange}
          />

          <Label htmlFor="dob">Date of Birth</Label>
          <Input
            type="date"
            id="dob"
            name="dob"
            value={formData.dob}
            onChange={handleChange}
          />

          <Label htmlFor="password">Password</Label>
          <Input
            type="password"
            id="password"
            name="password"
            placeholder="Enter your password"
            value={formData.password}
            onChange={handleChange}
          />

          <SubmitButton type="submit">Submit</SubmitButton>
        </Form>
      </AccountDetails>
    </>
  );
};

export default Profile;
