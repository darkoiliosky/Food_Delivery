import React, { useState, useEffect } from "react";
import styled from "styled-components";

const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background-color: lightblue;
`;

const ProfileWrapper = styled.div`
  background-color: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
`;

const Title = styled.h3`
  text-align: center;
  margin-bottom: 20px;
  color: #2d3748;
`;

const Input = styled.input<{ hasError: boolean }>`
  width: 100%;
  padding: 10px;
  margin: 10px 0;
  border: 1px solid ${({ hasError }) => (hasError ? "#e53e3e" : "#ccc")};
  border-radius: 5px;
  transition: border-color 0.3s;
`;

const Button = styled.button`
  width: 100%;
  padding: 10px;
  background-color: #48bb78;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #38a169;
  }
`;

const ErrorMessage = styled.div`
  color: #e53e3e;
  font-size: 12px;
  margin-top: -8px;
`;

interface UserProfile {
  name: string;
  email: string;
  phone: string;
}

const ProfilePage: React.FC = () => {
  const [profileData, setProfileData] = useState<UserProfile>({
    name: "",
    email: "",
    phone: "",
  });
  const [errors, setErrors] = useState<{
    name?: string;
    email?: string;
    phone?: string;
  }>({});
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    // Повик за добивање на податоците на корисникот од API
    // Се користи примерна функција getUserProfile (ќе треба да го имплементираш API повикот)
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await fetch("/api/user/profile"); // Замени со вистинскиот API
        const data = await response.json();
        setProfileData(data);
      } catch (error) {
        console.error("Грешка при добивање на профилот:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfileData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { name?: string; email?: string; phone?: string } = {};
    if (!profileData.name) newErrors.name = "Името е задолжително!";
    if (!profileData.email) newErrors.email = "Емаилот е задолжителен!";
    if (!profileData.phone)
      newErrors.phone = "Телефонскиот број е задолжителен!";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      try {
        // Повик за ажурирање на податоците
        const response = await fetch("/api/user/profile", {
          method: "PUT", // Или PATCH ако го користиш
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(profileData),
        });

        if (response.ok) {
          alert("Профилот е успешно ажуриран!");
        } else {
          alert("Настана грешка при ажурирањето.");
        }
      } catch (error) {
        console.error("Грешка при ажурирање на профилот:", error);
      }
    }
  };

  if (loading) {
    return <p>Loading...</p>;
  }

  return (
    <Container>
      <ProfileWrapper>
        <Title>Уреди го твојот профил</Title>
        <form onSubmit={handleSubmit}>
          <Input
            type="text"
            name="name"
            placeholder="Име"
            value={profileData.name}
            onChange={handleChange}
            hasError={!!errors.name}
          />
          {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}

          <Input
            type="email"
            name="email"
            placeholder="Емаил"
            value={profileData.email}
            onChange={handleChange}
            hasError={!!errors.email}
          />
          {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}

          <Input
            type="text"
            name="phone"
            placeholder="Телефон"
            value={profileData.phone}
            onChange={handleChange}
            hasError={!!errors.phone}
          />
          {errors.phone && <ErrorMessage>{errors.phone}</ErrorMessage>}

          <Button type="submit">Зачувај го профилот</Button>
        </form>
      </ProfileWrapper>
    </Container>
  );
};

export default ProfilePage;
