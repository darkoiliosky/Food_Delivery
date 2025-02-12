import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { useAuth } from "../../context/AuthContext";
import axios from "axios";

// Тип за одговорот што го очекуваме од серверот
interface UserProfile {
  name: string;
  lastname: string;
  email: string;
  phone: string;
  dob?: string;
}

// ------------------------ Styled Components ------------------------
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

// ------------------------ Main Component ------------------------
const Profile: React.FC = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
  });
  const [message, setMessage] = useState("");

  // 1) Автоматски го вчитуваме профилот откако имаме user + token
  useEffect(() => {
    const fetchUserProfile = async () => {
      // Ако нема user (значи не сме логирани), не fetch-ирај
      if (!user) return;

      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await axios.get<UserProfile>(
          "http://localhost:5000/profile",
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        // Постави ги податоците во локалниот state
        setFormData({
          firstName: response.data.name || "",
          lastName: response.data.lastname || "",
          email: response.data.email || "",
          phone: response.data.phone || "",
          password: "", // Не го враќаме пасвордот од база, ако треба менување, корисникот внесува нов
        });
      } catch (error) {
        console.error("Error fetching profile:", error);
        setMessage("Настана грешка при извлекувањето на податоците.");
      }
    };

    fetchUserProfile();
  }, [user]);
  // Кога `user` ќе се промени (од null -> стварен корисник), ќе се повика fetchUserProfile

  // 2) При секоја промена во input полињата
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // 3) При “Зачувај промени” -> правиме POST /profile/update-request
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage("Нема токен. Најавете се повторно.");
        return;
      }

      const response = await axios.post(
        "http://localhost:5000/profile/update-request",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status === 200) {
        setMessage("Испратен е емаил за потврда на измените!");
      } else {
        setMessage("Настана грешка при апдејт.");
      }
    } catch (error) {
      console.error("Error sending update request:", error);
      setMessage("Настана грешка при апдејт.");
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

        <Label htmlFor="password">Нова лозинка (опционално):</Label>
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

      {message && (
        <p style={{ textAlign: "center", marginTop: "20px" }}>{message}</p>
      )}
    </Container>
  );
};

export default Profile;
