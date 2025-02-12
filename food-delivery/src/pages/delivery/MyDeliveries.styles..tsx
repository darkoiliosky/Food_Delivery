import styled from "styled-components";

export const Container = styled.div`
  width: 90vw;
  height: 85vh;
  margin: 20px auto;
  padding: 30px;
  background: #ecf0f3;
  border-radius: 20px;
  box-shadow: 10px 10px 30px #d1d9e6, -10px -10px 30px #ffffff;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

export const Title = styled.h2`
  text-align: center;
  color: #2c3e50;
  font-size: 32px;
  font-weight: bold;
  text-shadow: 2px 2px 5px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
`;

export const OrderList = styled.ul`
  list-style: none;
  padding: 0;
  width: 100%;
  max-width: 900px;
  margin-top: 20px;
`;

export const OrderItem = styled.li`
  padding: 20px;
  margin-bottom: 20px; /* Повеќе простор меѓу нарачките */
  background: #ecf0f3;
  border-radius: 15px;
  box-shadow: inset 5px 5px 10px #d1d9e6, inset -5px -5px 10px #ffffff;
  display: flex;
  flex-direction: column; /* Поставува содржината вертикално */
  justify-content: center;
  align-items: flex-start;
  transition: transform 0.2s;
  width: 100%;

  &:hover {
    transform: scale(1.02);
  }

  p {
    margin: 8px 0; /* Повеќе простор меѓу текстовите */
    font-size: 18px;
    color: #2c3e50;
  }
`;

export const AcceptButton = styled.button`
  padding: 12px 20px;
  background: #3498db;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 4px 4px 10px #d1d9e6, -4px -4px 10px #ffffff;
  margin-top: 10px; /* Простор над копчето */

  &:hover {
    background: #217dbb;
    box-shadow: inset 4px 4px 10px #b0b5be, inset -4px -4px 10px #ffffff;
  }

  &:active {
    transform: scale(0.98);
  }
`;

export const CompleteButton = styled.button`
  padding: 12px 20px;
  background: #2ecc71;
  color: white;
  font-weight: bold;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 4px 4px 10px #d1d9e6, -4px -4px 10px #ffffff;
  margin-top: 10px; /* Простор над копчето */

  &:hover {
    background: #27ae60;
    box-shadow: inset 4px 4px 10px #b0b5be, inset -4px -4px 10px #ffffff;
  }

  &:active {
    transform: scale(0.98);
  }
`;

export const StatusTag = styled.span<{ status: string }>`
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: bold;
  color: white;
  text-transform: uppercase;
  font-size: 16px;
  box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2);
  display: inline-block;
  margin-top: 5px;

  background-color: ${({ status }) =>
    status === "Во достава"
      ? "#e67e22"
      : status === "Завршена"
      ? "#2ecc71"
      : "#3498db"};
`;

export const Message = styled.p`
  text-align: center;
  font-size: 20px;
  color: #7f8c8d;
  padding: 20px;
  background: #ecf0f3;
  border-radius: 15px;
  box-shadow: inset 5px 5px 10px #d1d9e6, inset -5px -5px 10px #ffffff;
  width: 80%;
  max-width: 700px;
  margin: 0 auto;
`;
