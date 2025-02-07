// Profile
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useAuth } from "../../context/AuthContext"; // Користи го AuthContext
import axios from "axios";

// Дефинирање на интерфејс за одговорот што го очекуваме од серверот
interface UserProfile {
  name: string;
  lastname: string;
  email: string;
  phone: string;
  dob?: string;
}

const Container = styled.div`
  font-family: Arial, sans-serif;
  background-color: #f4f4f9;
  padding: 20px;
  min-height: 100vh;
`;

const Title = styled.h1`
  text-align: center;
  color: #333;
  margin-top: 20px;
`;

const Form = styled.form`
  max-width: 500px;
  margin: 20px auto;
  background: #ffffff;
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const Label = styled.label`
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
  color: #555;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  margin-bottom: 15px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 16px;
  box-sizing: border-box;

  &:focus {
    border-color: #007bff;
    outline: none;
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
  }
`;

const Button = styled.button`
  width: 100%;
  background-color: #007bff;
  color: #ffffff;
  border: none;
  padding: 10px;
  font-size: 16px;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #0056b3;
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.5);
  }
`;

const Profile: React.FC = () => {
  const { user } = useAuth(); // Преземи го корисникот од AuthContext
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [message, setMessage] = useState("");

  // Пополнување на формата со податоците од корисникот по најавата
  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          // Поправено: Додадено withCredentials: true
          const response = await axios.get<UserProfile>(
            "http://localhost:5000/profile/",
            {
              withCredentials: true, // Ова овозможува испраќање на cookies
            }
          );

          // Поставување на податоците во формата
          setFormData({
            firstName: response.data.name || "",
            lastName: response.data.lastname || "",
            email: response.data.email || "",
            phone: response.data.phone || "",
            password: "", // Лозинката останува празна
          });
        } catch (error) {
          console.error("Error fetching profile:", error);
          setMessage("Настана грешка при извлекувањето на податоците.");
        }
      }
    };

    fetchUserProfile();
  }, [user]); // Ова ќе се активира секој пат кога корисникот ќе се промени

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await axios.post(
        "http://localhost:5000/profile/update-request",
        formData,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      if (response.status === 200) {
        setMessage("Испратен е емаил за потврда на измените!");
      } else {
        setMessage("Настана грешка.");
      }
    } catch (error) {
      console.error("Error sending update request:", error);
      setMessage("Настана грешка.");
    }
  };

  return (
    <Container>
      <Title>Вашиот профил</Title>
      <Form onSubmit={handleSubmit}>
        <Label htmlFor="firstName">Име:</Label>
        <Input
          type="text"
          id="firstName"
          name="firstName"
          value={formData.firstName}
          onChange={handleChange}
          placeholder="Вашето име"
        />

        <Label htmlFor="lastName">Презиме:</Label>
        <Input
          type="text"
          id="lastName"
          name="lastName"
          value={formData.lastName}
          onChange={handleChange}
          placeholder="Вашето презиме"
        />

        <Label htmlFor="email">Емаил:</Label>
        <Input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Вашиот емаил"
        />

        <Label htmlFor="phone">Телефон:</Label>
        <Input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Вашиот телефонски број"
        />

        <Label htmlFor="password">Нова лозинка:</Label>
        <Input
          type="password"
          id="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="Внесете нова лозинка"
        />

        <Button type="submit">Зачувај промени</Button>
      </Form>
      {message && <p>{message}</p>}
    </Container>
  );
};

export default Profile;
