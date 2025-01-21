import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CartItem {
  id: number;
  name: string;
  price: number; // Цена на еден производ
  quantity: number; // Количина
  totalPrice: number; // Вкупна цена за производот
  addons?: string[]; // Додатоци (опционално)
}

interface CartState {
  items: CartItem[];
}

const initialState: CartState = {
  items: [],
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const existingItem = state.items.find(
        (item) => item.id === action.payload.id
      );

      if (existingItem) {
        existingItem.quantity += action.payload.quantity;
        existingItem.totalPrice +=
          action.payload.price * action.payload.quantity; // Зголеми вкупната цена
      } else {
        state.items.push({
          ...action.payload,
          totalPrice: action.payload.price * action.payload.quantity, // Пресметај вкупна цена
        });
      }
    },
    removeFromCart: (state, action: PayloadAction<{ id: number }>) => {
      state.items = state.items.filter((item) => item.id !== action.payload.id);
    },
    decrementQuantity: (state, action: PayloadAction<{ id: number }>) => {
      const existingItem = state.items.find(
        (item) => item.id === action.payload.id
      );
      if (existingItem) {
        if (existingItem.quantity > 1) {
          existingItem.quantity -= 1;
          existingItem.totalPrice -= existingItem.price; // Намали вкупна цена
        } else {
          state.items = state.items.filter(
            (item) => item.id !== action.payload.id
          );
        }
      }
    },
  },
});

export const { addToCart, removeFromCart, decrementQuantity } =
  cartSlice.actions;
export default cartSlice.reducer;
