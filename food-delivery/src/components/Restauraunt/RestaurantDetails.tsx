import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import styled from "styled-components";
import { useAppDispatch } from "../../store/store"; // Користи типизираниот dispatch
import { addToCart } from "../../store/cartSlice";
import AddToCartModal from "./AddToCartModal"; // Увоз на модал компонентата

interface MenuItem {
  id: number;
  name: string;
  price: number;
  imageurl: string;
  category: string;
  ingredients: string[];
  addons: string[];
}

interface Restaurant {
  id: number;
  name: string;
  cuisine: string;
  imageurl: string;
  workinghours: string;
}

interface RestaurantDetailsProps {
  restaurants: Restaurant[];
}

const Container = styled.div`
  padding: 20px;
`;

const RestaurantHeader = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  img {
    width: 100%;
    max-width: 600px;
    height: auto;
    border-radius: 10px;
    margin-bottom: 20px;
  }

  h1 {
    font-size: 2rem;
    color: #333;
    margin-bottom: 10px;
  }

  p {
    font-size: 1rem;
    color: #666;
    margin-bottom: 5px;

    &.working-hours {
      font-weight: bold;
      color: #3498db;
    }
  }
`;

const MenuGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 30px;
`;

const MenuItemCard = styled.div`
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  img {
    width: 100%;
    height: 150px;
    object-fit: cover;
    border-radius: 5px;
    margin-bottom: 10px;
  }

  h3 {
    font-size: 1.2rem;
    color: #333;
    margin-bottom: 5px;
  }

  p {
    font-size: 0.9rem;
    color: #666;
    margin-bottom: 5px;

    &.price {
      font-weight: bold;
      color: #2ecc71;
    }
  }

  button {
    background-color: #48bb78;
    color: white;
    padding: 10px;
    border: none;
    border-radius: 5px;
    font-size: 14px;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
      background-color: #2f855a;
    }
  }
`;

const RestaurantDetails: React.FC<RestaurantDetailsProps> = ({
  restaurants,
}) => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch(); // Користи го dispatch од Redux
  const restaurant = restaurants.find((r) => r.id === Number(id));

  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const response = await axios.get<MenuItem[]>(
          `http://localhost:5000/restaurants/${id}/menu`
        );
        setMenuItems(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching menu items:", error);
        setLoading(false);
      }
    };

    fetchMenu();
  }, [id]);

  if (!restaurant) {
    return <p>Ресторанот не е пронајден.</p>;
  }

  if (loading) {
    return <p>Вчитување на менито...</p>;
  }

  const openModal = (item: MenuItem) => {
    setSelectedItem(item);
    setModalOpen(true);
  };

  const closeModal = () => {
    setSelectedItem(null);
    setModalOpen(false);
  };

  const handleAddToCart = (
    selectedAddons: { name: string; price: number }[]
  ) => {
    console.log("Selected Addons:", selectedAddons); // Додади лог
    if (selectedItem) {
      const addonsPrice = selectedAddons.reduce(
        (total, addon) => total + Number(addon.price),
        0
      );
      const totalPrice = selectedItem.price + addonsPrice;

      console.log("Addons Price:", addonsPrice); // Проверка на цената на додатоците
      console.log("Total Price:", totalPrice); // Проверка на конечната цена

      dispatch(
        addToCart({
          id: selectedItem.id,
          name: selectedItem.name,
          price: selectedItem.price,
          quantity: 1,
          totalPrice: totalPrice,
          addons: selectedAddons.map((addon) => addon.name),
        })
      );
    }
    closeModal();
  };

  return (
    <Container>
      <RestaurantHeader>
        <img src={restaurant.imageurl} alt={restaurant.name} />
        <h1>{restaurant.name}</h1>
        <p>{restaurant.cuisine}</p>
        <p className="working-hours">
          Работно време: {restaurant.workinghours || "Не е достапно"}
        </p>
      </RestaurantHeader>

      <h2>Мени</h2>
      <MenuGrid>
        {menuItems.map((item) => (
          <MenuItemCard key={item.id}>
            <img src={item.imageurl} alt={item.name} />
            <h3>{item.name}</h3>
            <p className="price">Цена: {item.price} ден.</p>
            <p>Категорија: {item.category}</p>
            <p>Состојки: {item.ingredients.join(", ")}</p>
            <button onClick={() => openModal(item)}>Додај во корпа</button>
          </MenuItemCard>
        ))}
      </MenuGrid>

      {selectedItem && (
        <AddToCartModal
          isOpen={modalOpen}
          onClose={closeModal}
          itemName={selectedItem.name}
          addons={selectedItem.addons.map((addon) => ({
            name: addon,
            price: 50, // Пример цена за секој додаток, увери се дека е точно
          }))}
          onAddToCart={handleAddToCart}
        />
      )}
    </Container>
  );
};

export default RestaurantDetails;
