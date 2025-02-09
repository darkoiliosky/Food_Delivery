import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store/store";
import styled from "styled-components";
import axios from "axios";
import { clearCart } from "../store/cartSlice";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

// Стилови за Cart
const CartContainer = styled.div`
  padding: 16px;
`;

const CartTitle = styled.h2`
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 16px;
`;

const CartItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #e0e0e0;
`;

const CartItemName = styled.p`
  font-size: 16px;
  font-weight: medium;
`;

const CartItemDetails = styled.div`
  display: flex;
  flex-direction: column;
`;

const CartItemPrice = styled.span`
  color: #38a169;
`;

const CartItemQuantity = styled.span`
  font-size: 14px;
  color: #4a5568;
`;

const TotalPrice = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  font-weight: bold;
`;

const ProceedButton = styled.button<{ disabled?: boolean }>`
  background-color: ${({ disabled }) => (disabled ? "#a0aec0" : "#48bb78")};
  color: white;
  padding: 12px;
  border-radius: 4px;
  font-size: 16px;
  cursor: ${({ disabled }) => (disabled ? "not-allowed" : "pointer")};
  transition: background-color 0.3s;

  &:hover {
    background-color: ${({ disabled }) => (disabled ? "#a0aec0" : "#2f855a")};
  }
`;

const Basket: React.FC = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const cartItems = useSelector((state: RootState) => state.cart.items);
  const [loading, setLoading] = useState(false);

  // Проверка дали постои `restaurant_id` во `cartItems`
  const restaurantId = cartItems.length > 0 ? cartItems[0].restaurant_id : null;

  // Избројување на вкупната цена
  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  // ✅ Испраќање на нарачка
  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      alert("Вашата кошничка е празна!");
      return;
    }

    console.log("📦 cartItems:", cartItems); // ✅ Проверка дали има `restaurant_id`

    const restaurantId = cartItems[0]?.restaurant_id;
    if (!restaurantId) {
      alert("❌ Грешка: Нема поврзан ресторан за оваа нарачка.");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        "http://localhost:5000/orders",
        {
          restaurant_id: restaurantId,
          total_price: totalPrice,
          items: cartItems.map((item) => ({
            id: item.id,
            quantity: item.quantity,
          })),
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      console.log("✅ Order response:", response.data); // ✅ Проверка дали серверот ја примил нарачката

      alert("✅ Успешно направивте нарачка!");
      dispatch(clearCart());
      navigate("/my-orders");
    } catch (error) {
      console.error("❌ Грешка при нарачка:", error);

      // Подобро обработување на грешките
      if (error.response) {
        console.log("❌ Server Error:", error.response.data);
        alert(
          error.response.data.message ||
            "❌ Неуспешна нарачка. Обиди се повторно."
        );
      } else if (error.request) {
        console.log("❌ No Response from Server");
        alert(
          "❌ Серверот не одговара. Проверете ја вашата интернет конекција."
        );
      } else {
        alert("❌ Грешка при обработка на нарачката.");
      }
    }
    setLoading(false);
  };

  return (
    <CartContainer>
      <CartTitle>🛒 Вашата кошничка</CartTitle>
      {cartItems.length === 0 ? (
        <p>Вашата кошничка е празна.</p>
      ) : (
        <div>
          {cartItems.map((item) => (
            <CartItem key={item.id}>
              <CartItemDetails>
                <CartItemName>{item.name}</CartItemName>
                <CartItemQuantity>Количина: {item.quantity}</CartItemQuantity>
              </CartItemDetails>
              <CartItemPrice>
                {(item.price * item.quantity).toFixed(2)} ден.
              </CartItemPrice>
            </CartItem>
          ))}
          <TotalPrice>
            <p>Вкупна Цена:</p>
            <span>{totalPrice.toFixed(2)} ден.</span>
          </TotalPrice>
        </div>
      )}
      {cartItems.length > 0 && (
        <ProceedButton onClick={handlePlaceOrder} disabled={loading}>
          {loading ? "Обработува се..." : "Потврди Нарачка"}
        </ProceedButton>
      )}
    </CartContainer>
  );
};

export default Basket;
