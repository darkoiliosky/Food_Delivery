import { useSelector } from "react-redux";
import { RootState } from "../store/store";
import styled from "styled-components";

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
  color: #38a169; /* Зеленa боја за цената */
`;

const CartItemQuantity = styled.span`
  font-size: 14px;
  color: #4a5568; /* Сива боја за количината */
`;

const TotalPrice = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 16px;
  font-weight: bold;
`;

const ProceedButton = styled.button`
  background-color: #48bb78;
  color: white;
  padding: 12px;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.3s;

  &:hover {
    background-color: #2f855a;
  }
`;

const Basket: React.FC = () => {
  const cartItems = useSelector((state: RootState) => state.cart.items);

  // Избројување на вкупната цена
  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <CartContainer>
      <CartTitle>Your Cart</CartTitle>
      {cartItems.length === 0 ? (
        <p>Your cart is empty.</p>
      ) : (
        <div>
          {cartItems.map((item) => (
            <CartItem key={item.id}>
              <CartItemDetails>
                <CartItemName>{item.name}</CartItemName>
                <CartItemQuantity>Quantity: {item.quantity}</CartItemQuantity>
              </CartItemDetails>
              <CartItemPrice>
                {(item.price * item.quantity).toFixed(2)}
              </CartItemPrice>
            </CartItem>
          ))}
          <TotalPrice>
            <p>Total Price:</p>
            <span>{totalPrice.toFixed(2)}</span>
          </TotalPrice>
        </div>
      )}
      <ProceedButton>Proceed to Checkout</ProceedButton>
    </CartContainer>
  );
};

export default Basket;
