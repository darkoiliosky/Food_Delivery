import React, { useState, ChangeEvent, FormEvent } from "react";
import axios, { AxiosError, isAxiosError } from "axios";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

/* ----------------- Styled Components ----------------- */
const Container = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f5f5f5;
`;

const FormWrapper = styled.div`
  background: white;
  padding: 2rem;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 400px;
`;

const FormTitle = styled.h2`
  text-align: center;
  margin-bottom: 1.5rem;
  color: #333;
`;

const StyledForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const StyledInput = styled.input`
  padding: 0.75rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 3px rgba(52, 152, 219, 0.5);
  }
`;

const StyledButton = styled.button`
  padding: 0.75rem;
  background-color: #3498db;
  color: white;
  font-size: 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
  &:hover {
    background-color: #217dbb;
  }
`;

const Login: React.FC = () => {
  const navigate = useNavigate();

  // Локален state за login form
  const [loginData, setLoginData] = useState({
    emailOrPhone: "",
    password: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setLoginData({ ...loginData, [name]: value });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/login", {
        emailOrPhone: loginData.emailOrPhone,
        password: loginData.password,
      });

      // Ако е успешен login
      const { token, user } = response.data;

      // Сними во localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Пренасочи според user.role
      if (user.role === "admin") {
        navigate("/admin");
      } else if (user.role === "restaurant") {
        navigate("/restaurant-dashboard");
      } else if (user.role === "delivery") {
        navigate("/my-deliveries");
      } else {
        navigate("/");
      }
    } catch (err) {
      // Проверка на статусот
      if (isAxiosError(err) && err.response) {
        const status = err.response.status;
        if (status === 401) {
          toast.error("Invalid password!");
        } else if (status === 403) {
          toast.error("Please verify your email first!");
        } else if (status === 404) {
          toast.error("User not found!");
        } else {
          toast.error("Login error. Please try again.");
        }
      } else {
        toast.error("Login error. Please try again.");
      }
      console.error("Login error:", err);
    }
  };

  return (
    <Container>
      <ToastContainer />
      <FormWrapper>
        <FormTitle>Login</FormTitle>
        <StyledForm onSubmit={handleSubmit}>
          <StyledInput
            type="text"
            name="emailOrPhone"
            placeholder="Email or Phone"
            value={loginData.emailOrPhone}
            onChange={handleChange}
            required
          />
          <StyledInput
            type="password"
            name="password"
            placeholder="Password"
            value={loginData.password}
            onChange={handleChange}
            required
          />
          <StyledButton type="submit">Login</StyledButton>
        </StyledForm>

        <p style={{ textAlign: "center", marginTop: "1rem" }}>
          Don't have an account?{" "}
          <Link to="/register" style={{ color: "#3498db", fontWeight: "bold" }}>
            Register here
          </Link>
        </p>

        <p style={{ textAlign: "center", marginTop: "1rem" }}>
          <Link
            to="/forgot-password"
            style={{ color: "#3498db", fontWeight: "bold" }}
          >
            Forgot Password?
          </Link>
        </p>
      </FormWrapper>
    </Container>
  );
};

export default Login;
