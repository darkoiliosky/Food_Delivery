import React, { useState } from "react";
import Modal from "react-modal";
import styled from "styled-components";

// Styled Components
const ModalContent = styled.div`
  background: #ffffff;
  padding: 20px;
  border-radius: 10px;
  max-width: 400px;
  width: 90%;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  text-align: center;
`;

const FormGroup = styled.div`
  margin-bottom: 15px;

  label {
    display: block;
    margin-bottom: 5px;
    font-weight: bold;
    color: #555;
  }

  input {
    width: 100%;
    padding: 10px;
    font-size: 16px;
    border: 1px solid #cbd5e0;
    border-radius: 5px;
    &:focus {
      outline: none;
      border-color: #007bff;
    }
  }
`;

const Button = styled.button<{ bgColor: string; hoverColor: string }>`
  width: 100%;
  padding: 10px;
  font-size: 16px;
  color: white;
  background-color: ${(props) => props.bgColor};
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;

  &:hover {
    background-color: ${(props) => props.hoverColor};
  }

  &:not(:last-child) {
    margin-bottom: 10px;
  }
`;

// Modal accessibility setup
Modal.setAppElement("#root");

// Props interface
interface RegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const RegistrationModal: React.FC<RegistrationModalProps> = ({
  isOpen,
  onClose,
}) => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    phone: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Basic validation
    if (
      !formData.email ||
      !formData.password ||
      !formData.firstName ||
      !formData.lastName ||
      !formData.phone
    ) {
      alert("Сите полиња се задолжителни!");
      return;
    }

    console.log("Submitted Data:", formData);
    alert("Регистрацијата е успешна!");
    onClose(); // Затворање на модалот
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={{
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        },
        content: {
          position: "relative",
          padding: "0",
          border: "none",
          inset: "auto",
          background: "transparent",
        },
      }}
    >
      <ModalContent>
        <h3>Регистрација</h3>
        <form onSubmit={handleFormSubmit}>
          <FormGroup>
            <label htmlFor="email">Е-пошта</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </FormGroup>
          <FormGroup>
            <label htmlFor="password">Лозинка</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
            />
          </FormGroup>
          <FormGroup>
            <label htmlFor="firstName">Име</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
          </FormGroup>
          <FormGroup>
            <label htmlFor="lastName">Презиме</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
            />
          </FormGroup>
          <FormGroup>
            <label htmlFor="phone">Телефон</label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              required
            />
          </FormGroup>

          <Button type="submit" bgColor="#48bb78" hoverColor="#38a169">
            Регистрирај се
          </Button>
        </form>
        <Button onClick={onClose} bgColor="#e53e3e" hoverColor="#c53030">
          Затвори
        </Button>
      </ModalContent>
    </Modal>
  );
};

export default RegistrationModal;
