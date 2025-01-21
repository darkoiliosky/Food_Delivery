import React from "react";
import Modal from "react-modal";
import styled from "styled-components";

// Styled components
const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  width: 90%;
  max-width: 400px;
  border-radius: 12px;
  background-color: #fff;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  animation: fadeIn 0.3s ease;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.9);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }
`;

const ModalHeader = styled.h3`
  font-size: 22px;
  text-align: center;
  color: #2d3748;
  margin-bottom: 12px;
`;

const ModalText = styled.p`
  font-size: 16px;
  color: #4a5568;
  text-align: center;
  margin: 0;
`;

const ModalLabel = styled.label`
  display: block;
  font-size: 14px;
  color: #2d3748;
  margin-bottom: 8px;
`;

const QuantityInput = styled.input`
  padding: 10px;
  font-size: 16px;
  border: 1px solid #cbd5e0;
  border-radius: 6px;
  width: 100%;
  margin-bottom: 16px;
`;

const ModalActions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  button {
    padding: 12px;
    font-size: 16px;
    font-weight: bold;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:first-child {
      background-color: #48bb78;
      color: white;
    }

    &:first-child:hover {
      background-color: #38a169;
    }

    &:last-child {
      background-color: #e53e3e;
      color: white;
    }

    &:last-child:hover {
      background-color: #c53030;
    }
  }
`;

const CustomModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  item: {
    name: string;
    price: number;
    ingredients?: string[];
  } | null;
  quantity: number;
  setQuantity: (value: number) => void;
  handleAddToCart: () => void;
}> = ({ isOpen, onClose, item, quantity, setQuantity, handleAddToCart }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={{
        overlay: {
          backgroundColor: "rgba(0, 0, 0, 0.6)",
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
      {item && (
        <ModalContent>
          <ModalHeader>{item.name}</ModalHeader>
          <ModalText>Цена: {item.price} ден.</ModalText>

          {item.ingredients && (
            <ModalText>Состојки: {item.ingredients.join(", ")}</ModalText>
          )}

          <ModalLabel htmlFor="quantity">Количина:</ModalLabel>
          <QuantityInput
            id="quantity"
            type="number"
            value={quantity}
            min="1"
            onChange={(e) => setQuantity(Number(e.target.value))}
          />

          <ModalActions>
            <button onClick={handleAddToCart}>Додај во Корпа</button>
            <button onClick={onClose}>Откажи</button>
          </ModalActions>
        </ModalContent>
      )}
    </Modal>
  );
};

export default CustomModal;
