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

export const DashboardContent = styled.div`
  width: 100%;
  max-width: 1100px;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  background: #ffffff;
  border-radius: 15px;
  box-shadow: inset 5px 5px 10px #d1d9e6, inset -5px -5px 10px #ffffff;
`;

export const Section = styled.div`
  width: 100%;
  margin-bottom: 25px;
  padding: 20px;
  background: #f7f9fc;
  border-radius: 12px;
  box-shadow: inset 5px 5px 10px #d1d9e6, inset -5px -5px 10px #ffffff;
`;

export const SectionTitle = styled.h3`
  font-size: 24px;
  color: #34495e;
  font-weight: bold;
  margin-bottom: 15px;
  text-align: center;
`;

export const OrderList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  width: 100%;
`;

export const OrderCard = styled.div`
  background: #f7f9fc;
  border-left: 5px solid #3498db;
  padding: 15px;
  border-radius: 12px;
  margin-bottom: 10px;
  box-shadow: inset 2px 2px 5px #d1d9e6, inset -2px -2px 5px #ffffff;
`;

export const StatusButton = styled.button`
  margin-top: 10px;
  padding: 10px 15px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
  box-shadow: 4px 4px 10px #d1d9e6, -4px -4px 10px #ffffff;

  &:hover {
    background-color: #2980b9;
    box-shadow: inset 4px 4px 10px #b0b5be, inset -4px -4px 10px #ffffff;
  }
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
