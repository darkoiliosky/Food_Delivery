// import { useSelector } from "react-redux";
// import { RootState } from "../store/store";
// import styled from "styled-components";

// // Стилови за Checkout
// const CheckoutContainer = styled.div`
//   padding: 16px;
// `;

// const CheckoutTitle = styled.h2`
//   font-size: 24px;
//   font-weight: bold;
//   margin-bottom: 16px;
// `;

// const CheckoutItem = styled.div`
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
//   padding: 12px 0;
//   border-bottom: 1px solid #e0e0e0;
// `;

// const CheckoutItemDetails = styled.div`
//   display: flex;
//   flex-direction: column;
// `;

// const CheckoutItemName = styled.p`
//   font-size: 16px;
//   font-weight: medium;
// `;

// const CheckoutItemPrice = styled.span`
//   color: #38a169; /* Зелената боја за цената */
// `;

// const CheckoutItemQuantity = styled.span`
//   font-size: 14px;
//   color: #4a5568; /* Сива боја за количината */
// `;

// const TotalPrice = styled.div`
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
//   margin-top: 16px;
//   font-weight: bold;
// `;

// const PlaceOrderButton = styled.button`
//   background-color: #48bb78;
//   color: white;
//   padding: 12px;
//   border-radius: 4px;
//   font-size: 16px;
//   cursor: pointer;
//   transition: background-color 0.3s;

//   &:hover {
//     background-color: #2f855a;
//   }
// `;

// const Checkout: React.FC = () => {
//   const cartItems = useSelector((state: RootState) => state.cart.items);

//   // Избројување на вкупната цена
//   const totalPrice = cartItems.reduce(
//     (total, item) => total + item.price * item.quantity,
//     0
//   );

//   return (
//     <CheckoutContainer>
//       <CheckoutTitle>Checkout</CheckoutTitle>
//       {cartItems.length === 0 ? (
//         <p>Your cart is empty.</p>
//       ) : (
//         <div>
//           {cartItems.map((item) => (
//             <CheckoutItem key={item.id}>
//               <CheckoutItemDetails>
//                 <CheckoutItemName>{item.name}</CheckoutItemName>
//                 <CheckoutItemQuantity>
//                   Quantity: {item.quantity}
//                 </CheckoutItemQuantity>
//               </CheckoutItemDetails>
//               <CheckoutItemPrice>
//                 ${(item.price * item.quantity).toFixed(2)}
//               </CheckoutItemPrice>
//             </CheckoutItem>
//           ))}
//           <TotalPrice>
//             <p>Total Price:</p>
//             <span>${totalPrice.toFixed(2)}</span>
//           </TotalPrice>
//         </div>
//       )}
//       <PlaceOrderButton>Place Order</PlaceOrderButton>
//     </CheckoutContainer>
//   );
// };

// export default Checkout;
