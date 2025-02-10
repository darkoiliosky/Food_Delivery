import styled from "styled-components";
// ============ Стили ==============
export const PanelContainer = styled.div`
  max-width: 1100px;
  margin: 40px auto;
  padding: 30px;
  background: #ffffff;
  border-radius: 12px;
  box-shadow: 0 6px 15px rgba(0, 0, 0, 0.08);
`;

export const Header = styled.h2`
  text-align: center;
  margin-bottom: 25px;
  color: #2c3e50;
  font-size: 2.2rem;
  font-weight: bold;
  color: gre;
`;

export const SubHeader = styled.h3`
  margin-top: 25px;
  margin-bottom: 15px;
  color: #34495e;
  font-size: 1.5rem;
  font-weight: 600;
`;

export const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 20px;
  background: #f7f9fc;
  border-radius: 10px;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.05);
`;

export const Input = styled.input`
  padding: 12px;
  font-size: 16px;
  border: 1px solid #dcdcdc;
  border-radius: 6px;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    outline: none;
    border-color: #3498db;
    box-shadow: 0 0 5px rgba(52, 152, 219, 0.3);
  }
`;

export const ButtonRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 10px;
`;

export const Button = styled.button<{ variant?: string }>`
  padding: 10px 15px;
  font-size: 14px;
  font-weight: bold;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    opacity: 0.85;
  }

  ${({ variant }) => {
    switch (variant) {
      case "danger":
        return `background: #e74c3c; &:hover { background: #c0392b; }`;
      case "secondary":
        return `background: #95a5a6; &:hover { background: #7f8c8d; }`;
      default:
        return `background: #3498db; &:hover { background: #2980b9; }`;
    }
  }}
`;

export const RestaurantGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  justify-content: center;
  padding: 20px;
  max-width: 1200px;
  margin: auto;
`;

export const RestaurantCard = styled.div`
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: transform 0.3s, box-shadow 0.3s;
  text-align: center;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 15px rgba(0, 0, 0, 0.15);
  }
`;

export const CardTopRow = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

export const CardInfo = styled.div`
  h4 {
    margin: 8px 0;
    font-size: 1.2rem;
    color: #2c3e50;
  }
  p {
    font-size: 1rem;
    color: #555;
  }
`;

export const Image = styled.img`
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 8px;
  border: 2px solid #ddd;
`;

export const MenuItemsContainer = styled.div`
  margin-top: 12px;

  h4 {
    margin-bottom: 8px;
    font-size: 1.2rem;
    color: #34495e;
  }

  div.menu-item-row {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 5px;
    text-align: left;

    img {
      border-radius: 5px;
      width: 50px;
      height: 50px;
    }

    p {
      margin: 0;
      font-size: 1rem;
    }
  }

  .add-menu-btn {
    margin-top: 8px;
    background: #27ae60;
    &:hover {
      background: #1f8a4d;
    }
  }
`;

export const CollapsibleContainer = styled.div`
  margin-top: 12px;
  border: 1px solid #ccc;
  padding: 12px;
  border-radius: 6px;
  background: #f9f9f9;

  h5 {
    margin: 0 0 8px;
    font-size: 1.1rem;
    color: #555;
  }

  input {
    margin-bottom: 6px;
  }

  .submit-btn {
    margin-right: 10px;
    background-color: #2ecc71;
    &:hover {
      background-color: #27ae60;
    }
  }
`;
