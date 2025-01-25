import React, { useState } from "react";
import styled from "styled-components";

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 10px;
  width: 400px;
  padding: 20px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;

  h2 {
    margin: 0;
    font-size: 1.5rem;
  }

  button {
    background: transparent;
    border: none;
    font-size: 1.5rem;
    cursor: pointer;
  }
`;

const AddonList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-bottom: 20px;

  label {
    display: flex;
    justify-content: space-between;
    align-items: center;

    input {
      margin-right: 10px;
    }
  }
`;

const AddToCartButton = styled.button`
  width: 100%;
  padding: 10px;
  background: #48bb78;
  color: white;
  font-size: 1rem;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background: #2f855a;
  }
`;

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  addons: { name: string; price: number }[];
  onAddToCart: (selectedAddons: { name: string; price: number }[]) => void;
}

const AddToCartModal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  itemName,
  addons,
  onAddToCart,
}) => {
  const [selectedAddons, setSelectedAddons] = useState<
    { name: string; price: number }[]
  >([]);

  const handleAddonChange = (
    addon: { name: string; price: number },
    isChecked: boolean
  ) => {
    if (isChecked) {
      setSelectedAddons((prev) => [...prev, addon]);
    } else {
      setSelectedAddons((prev) => prev.filter((a) => a.name !== addon.name));
    }
  };

  const handleAddToCart = () => {
    onAddToCart(selectedAddons);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay>
      <ModalContent>
        <ModalHeader>
          <h2>Додај во корпа - {itemName}</h2>
          <button onClick={onClose}>&times;</button>
        </ModalHeader>
        <AddonList>
          {addons.map((addon) => (
            <label key={addon.name}>
              <input
                type="checkbox"
                onChange={(e) => handleAddonChange(addon, e.target.checked)}
              />
              {addon.name} (+{addon.price} ден.)
            </label>
          ))}
        </AddonList>
        <AddToCartButton onClick={handleAddToCart}>
          Додај во корпа
        </AddToCartButton>
      </ModalContent>
    </ModalOverlay>
  );
};

export default AddToCartModal;
