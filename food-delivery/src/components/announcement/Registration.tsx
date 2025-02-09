// Registration
import React, { useState, ChangeEvent, FormEvent } from "react";
import axios from "axios";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom"; // Import за навигација и линкови
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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

const Register: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    lastname: "",
    email: "",
    phone: "",
    password: "",
    role: "customer", // Додај го role со почетна вредност customer
    adminCode: "",
    deliveryCode: "", // ✅ Додадено
  });

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updatedFormData = {
        ...prev,
        [name]: value,
      };

      // Ако се менува улогата, избришете ги непотребните полиња
      if (name === "role") {
        updatedFormData.adminCode = value === "admin" ? prev.adminCode : "";
        updatedFormData.deliveryCode =
          value === "delivery" ? prev.deliveryCode : "";
      }

      return updatedFormData;
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (formData.role === "admin" && !formData.adminCode) {
      toast.error("Admin Code is required for admin registration!");
      return;
    }

    if (formData.role === "delivery" && !formData.deliveryCode) {
      toast.error("Delivery Code is required for delivery registration!");
      return;
    }

    try {
      await axios.post("http://localhost:5000/register", formData);
      toast.success("Registration successful!");
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
          <StyledInput
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
          <StyledInput
            type="text"
            name="lastname"
            placeholder="Last Name"
            value={formData.lastname}
            onChange={handleChange}
            required
          />
          <StyledInput
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <StyledInput
            type="text"
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
          <StyledInput
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          {/* Ново поле за админ код (опционално) */}
          {/* Ако е избран "admin", прикажи Admin Code */}
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

          {/* Ако е избран "delivery", прикажи Delivery Code */}
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

          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            required
          >
            <option value="customer">Customer</option>
            <option value="delivery">Delivery</option>
            <option value="admin">Admin</option> {/* Додадено */}
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
