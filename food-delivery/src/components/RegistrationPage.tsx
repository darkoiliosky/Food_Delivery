import React, { useState } from "react";
import styled from "styled-components";

const Container = styled.div`
  background-image: url("your-background-image-url");
  background-size: cover;
  background-position: center;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: lightblue;
`;

const RegistrationFormWrapper = styled.div`
  background-color: white;
  padding: 30px;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 500px;
  min-height: 500px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
  transition: box-shadow 0.3s ease-in-out;

  &:hover {
    box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
  }
`;

const Title = styled.h3`
  text-align: center;
  margin-bottom: 20px;
  color: #2d3748;
`;

const Input = styled.input<{ hasError: boolean }>`
  width: 100%;
  padding: 10px;
  min-width: 400px;
  min-height: 50px;
  margin: 10px;
  border: 1px solid ${({ hasError }) => (hasError ? "#e53e3e" : "#ccc")};
  border-radius: 5px;
  transition: border-color 0.3s;
  height: 40px; /* Дефинирајте фиксирана висина */

  &:focus {
    border-color: #4caf50;
    outline: none;
  }
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

const ToggleButton = styled.button`
  padding: 10px 20px;
  margin: 10px;
  background-color: #2d3748;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background-color: #4a5568;
  }

  &.active {
    background-color: #38a169;
  }
`;

const CheckboxWrapper = styled.div`
  margin-bottom: 15px;
`;

const CheckboxLabel = styled.label`
  font-size: 14px;
  color: #4a5568;
`;

const ErrorMessage = styled.div`
  color: #e53e3e;
  font-size: 12px;
  margin-top: -8px;
`;

interface FormErrors {
  email?: string;
  password?: string;
  confirmPassword?: string;
  name?: string;
  phone?: string;
  termsAccepted?: string;
}

const RegistrationPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(false); // State for toggling between login and registration
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "",
    phone: "",
    termsAccepted: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: FormErrors = {};

    if (!formData.name) newErrors.name = "Име и презиме е задолжително!";
    if (!formData.email) newErrors.email = "Емаил е задолжителен!";
    if (!formData.password) newErrors.password = "Лозинка е задолжителна!";
    if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Лозинките не се совпаѓаат!";
    if (formData.password.length < 6)
      newErrors.password = "Лозинката мора да има најмалку 6 карактери!";
    if (!formData.phone) newErrors.phone = "Телефон е задолжителен!";
    if (!formData.termsAccepted && !isLogin)
      newErrors.termsAccepted = "Мора да се согласите со условите.";

    setErrors(newErrors);

    if (Object.keys(newErrors).length === 0) {
      // Испрати податоци или направи некоја друга акција
      console.log(formData);
    }
  };

  return (
    <Container>
      <RegistrationFormWrapper>
        <Title>
          {isLogin
            ? "Најава на Порачај јади"
            : "Регистрирајте се на Порачај јади"}
        </Title>

        {/* Toggle Buttons */}
        <div>
          <ToggleButton
            className={!isLogin ? "active" : ""}
            onClick={() => setIsLogin(false)}
          >
            Регистрација
          </ToggleButton>
          <ToggleButton
            className={isLogin ? "active" : ""}
            onClick={() => setIsLogin(true)}
          >
            Најава
          </ToggleButton>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Conditionally rendered fields */}
          {!isLogin && (
            <>
              <Input
                type="text"
                name="name"
                placeholder="Име и презиме*"
                value={formData.name}
                onChange={handleChange}
                hasError={!!errors.name}
              />
              {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
            </>
          )}

          <Input
            type="email"
            name="email"
            placeholder="Емаил (Корисничко име)*"
            value={formData.email}
            onChange={handleChange}
            hasError={!!errors.email}
          />
          {errors.email && <ErrorMessage>{errors.email}</ErrorMessage>}

          <Input
            type="password"
            name="password"
            placeholder="Лозинка*"
            value={formData.password}
            onChange={handleChange}
            hasError={!!errors.password}
          />
          {errors.password && <ErrorMessage>{errors.password}</ErrorMessage>}

          {/* Confirm password field only for registration */}
          {!isLogin && (
            <Input
              type="password"
              name="confirmPassword"
              placeholder="Потврдете лозинка*"
              value={formData.confirmPassword}
              onChange={handleChange}
              hasError={!!errors.confirmPassword}
            />
          )}
          {errors.confirmPassword && (
            <ErrorMessage>{errors.confirmPassword}</ErrorMessage>
          )}

          {/* Phone field only for registration */}
          {!isLogin && (
            <Input
              type="text"
              name="phone"
              placeholder="Телефон*"
              value={formData.phone}
              onChange={handleChange}
              hasError={!!errors.phone}
            />
          )}
          {errors.phone && <ErrorMessage>{errors.phone}</ErrorMessage>}

          {/* Terms and conditions checkbox for registration */}
          {!isLogin && (
            <CheckboxWrapper>
              <input
                type="checkbox"
                name="termsAccepted"
                checked={formData.termsAccepted}
                onChange={handleChange}
              />
              <CheckboxLabel>
                Се согласувам со{" "}
                <a
                  href="/Content/data/Opsti uslovi na koristenje.pdf"
                  target="_blank"
                >
                  условите за користење
                </a>
              </CheckboxLabel>
            </CheckboxWrapper>
          )}
          {errors.termsAccepted && (
            <ErrorMessage>{errors.termsAccepted}</ErrorMessage>
          )}

          <Button type="submit">{isLogin ? "Најава" : "Регистрирај се"}</Button>
        </form>
      </RegistrationFormWrapper>
    </Container>
  );
};

export default RegistrationPage;
