import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";
import { addToCart } from "../../store/cartSlice";
import Modal from "react-modal";
import styled from "styled-components";
import CategoryFilter from "../CategoryFilter"; // Импортирање на новата компонента

Modal.setAppElement("#root");

// Styled components
const ModalContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 20px;
  width: 90%;
  max-width: 400px;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
`;

const CategoryHeader = styled.h4`
  width: 100%;
  text-align: center;
  background-color: cornsilk;
  padding: 10px;
  margin-top: 20px;
  color: #2d3748;
  border-radius: 4px;
  font-size: 18px;
`;

const MenuItemCard = styled.div`
  border: 1px solid #ddd;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  width: calc(33.333% - 20px);

  @media (max-width: 768px) {
    width: calc(50% - 10px);
  }

  @media (max-width: 480px) {
    width: 100%;
  }
`;

const MenuGrid = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
`;

// Дефинирање на типови
interface MenuItem {
  id: number;
  name: string;
  price: number;
  image: string;
  category: string;
  addons?: string[];
  ingredients?: string[]; // Додадено поле за состојки
}

interface Restaurant {
  id: number;
  name: string;
  menu: MenuItem[];
}

interface RestaurantDetailsProps {
  restaurants: Restaurant[];
}

const RestaurantDetails: React.FC<RestaurantDetailsProps> = ({
  restaurants,
}) => {
  const dispatch = useDispatch();
  const { id } = useParams<{ id: string }>();
  const restaurantId = parseInt(id ?? "", 10);

  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addons, setAddons] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState("All");

  if (isNaN(restaurantId)) {
    return <div>Невалиден идентификатор за ресторан!</div>;
  }

  const restaurant = restaurants.find((r) => r.id === restaurantId);

  if (!restaurant) {
    return <div>Ресторанот не е пронајден!</div>;
  }

  const categories = [
    "All",
    ...Array.from(new Set(restaurant.menu.map((item) => item.category))),
  ];

  const filteredMenu =
    activeCategory === "All"
      ? restaurant.menu
      : restaurant.menu.filter((item) => item.category === activeCategory);

  const openModal = (item: MenuItem) => {
    setSelectedItem(item);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedItem(null);
    setQuantity(1);
    setAddons([]);
  };

  const handleAddToCart = () => {
    if (selectedItem && quantity > 0) {
      dispatch(
        addToCart({
          id: selectedItem.id,
          name: selectedItem.name,
          price: selectedItem.price,
          quantity,
          totalPrice: selectedItem.price * quantity,
          addons,
        })
      );
      closeModal();
    }
  };

  return (
    <div>
      <h3
        style={{
          backgroundColor: "#D4593E",
          color: "white",
          padding: "20px",
          textAlign: "center",
          margin: "0px",
        }}
      >
        {restaurant.name}
      </h3>
      <CategoryFilter
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={(category) => setActiveCategory(category)}
      />

      {/* Прикажување на категориите и нивното мени */}
      {categories.map(
        (category) =>
          filteredMenu.filter((item) => item.category === category).length >
          0 ? ( // Проверка дали има елементи за оваа категорија
            <div key={category}>
              <CategoryHeader>{category}</CategoryHeader>
              <MenuGrid>
                {filteredMenu
                  .filter((item) => item.category === category)
                  .map((item) => (
                    <MenuItemCard key={item.id}>
                      <p
                        style={{
                          margin: "0px",
                          fontWeight: "bold",
                          textAlign: "center",
                          padding: "10px 0",
                        }}
                      >
                        {item.name}
                      </p>
                      <div
                        style={{
                          backgroundImage: `url(${item.image})`,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          height: "150px",
                        }}
                      />
                      <div style={{ padding: "10px" }}>
                        <p style={{ margin: 0, fontWeight: "bold" }}>
                          Цена: {item.price} ден.
                        </p>

                        {/* Прикажување на состојките тука, во рамките на картата */}
                        {item.ingredients && item.ingredients.length > 0 && (
                          <p
                            style={{
                              fontSize: "14px",
                              color: "#666",
                              marginTop: "8px",
                              textAlign: "center",
                            }}
                          >
                            <strong>Состојки:</strong>{" "}
                            {item.ingredients.join(", ")}
                          </p>
                        )}

                        <button
                          style={{
                            backgroundColor: "#48BB78",
                            color: "white",
                            padding: "10px",
                            border: "none",
                            borderRadius: "5px",
                            cursor: "pointer",
                            width: "100%",
                            marginTop: "12px",
                          }}
                          onClick={() => openModal(item)}
                        >
                          Додај во Корпа
                        </button>
                      </div>
                    </MenuItemCard>
                  ))}
              </MenuGrid>
            </div>
          ) : null // Ако нема елементи, не прикажувај ја категоријата
      )}

      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
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
        {selectedItem && (
          <ModalContent>
            <h3>{selectedItem.name}</h3>
            <p>Цена: {selectedItem.price} ден.</p>

            {/* Прикажи состојки */}
            {selectedItem.ingredients &&
              selectedItem.ingredients.length > 0 && (
                <p>Состојки: {selectedItem.ingredients.join(", ")}</p>
              )}

            <label>
              Количина:
              <input
                type="number"
                value={quantity}
                min="1"
                onChange={(e) => setQuantity(Number(e.target.value))}
                style={{
                  padding: "8px",
                  fontSize: "16px",
                  border: "1px solid #cbd5e0",
                  borderRadius: "4px",
                  width: "100%",
                  marginBottom: "16px",
                }}
              />
            </label>
            <button
              onClick={handleAddToCart}
              style={{
                backgroundColor: "#48BB78",
                color: "white",
                padding: "10px",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              Додај во Корпа
            </button>
          </ModalContent>
        )}
      </Modal>
    </div>
  );
};

export default RestaurantDetails;
