import React, { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
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

/* ----------------- Component ----------------- */
const Register: React.FC = () => {
  const navigate = useNavigate();

  // Локален state за полињата
  const [formData, setFormData] = useState({
    name: "",
    lastname: "",
    email: "",
    phone: "",
    password: "",
    role: "customer", // default
    adminCode: "",
    deliveryCode: "",
    restaurantCode: "",
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedFormData = { ...prev, [name]: value };
      // ако se menува role, ресетирај другите code полиња
      if (name === "role") {
        updatedFormData.adminCode = value === "admin" ? prev.adminCode : "";
        updatedFormData.deliveryCode =
          value === "delivery" ? prev.deliveryCode : "";
        updatedFormData.restaurantCode =
          value === "restaurant" ? prev.restaurantCode : "";
      }
      return updatedFormData;
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    let code = "";
    if (formData.role === "admin") code = formData.adminCode;
    else if (formData.role === "delivery") code = formData.deliveryCode;
    else if (formData.role === "restaurant") code = formData.restaurantCode;

    try {
      await axios.post("http://localhost:5000/register", {
        name: formData.name,
        lastname: formData.lastname,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        role: formData.role,
        code: code,
      });

      toast.success("Registration successful! Check your email to verify.");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Error registering user. Please try again.");
    }
  };

  return (
    <Container>
      <ToastContainer />
      <FormWrapper>
        <FormTitle>Register</FormTitle>

        <StyledForm onSubmit={handleSubmit}>
          {/* Name */}
          <StyledInput
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          {/* Last Name */}
          <StyledInput
            type="text"
            name="lastname"
            placeholder="Last Name"
            value={formData.lastname}
            onChange={handleChange}
            required
          />

          {/* Email */}
          <StyledInput
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />

          {/* Phone */}
          <StyledInput
            type="text"
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />

          {/* Password */}
          <StyledInput
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          {/* Ако role=admin, покажи поле adminCode */}
          {formData.role === "admin" && (
            <StyledInput
              type="password"
              name="adminCode"
              placeholder="Admin Code"
              value={formData.adminCode}
              onChange={handleChange}
              required
            />
          )}

          {/* Ако role=delivery, покажи поле deliveryCode */}
          {formData.role === "delivery" && (
            <StyledInput
              type="password"
              name="deliveryCode"
              placeholder="Delivery Code"
              value={formData.deliveryCode}
              onChange={handleChange}
              required
            />
          )}

          {/* Ако role=restaurant, покажи поле restaurantCode */}
          {formData.role === "restaurant" && (
            <StyledInput
              type="password"
              name="restaurantCode"
              placeholder="Restaurant Code"
              value={formData.restaurantCode}
              onChange={handleChange}
              required
            />
          )}

          {/* Dropdown за role */}
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="customer">Customer</option>
            <option value="delivery">Delivery</option>
            <option value="admin">Admin</option>
            <option value="restaurant">Ресторан</option>
          </select>

          <StyledButton type="submit">Register</StyledButton>
        </StyledForm>

        <p style={{ textAlign: "center", marginTop: "1rem" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color: "#3498db", fontWeight: "bold" }}>
            Login here
          </Link>
        </p>
      </FormWrapper>
    </Container>
  );
};

export default Register;
