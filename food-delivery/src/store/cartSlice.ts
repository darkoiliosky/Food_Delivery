import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface CartItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  totalPrice: number;
  addons?: string[];
  restaurant_id: number; // ✅ Осигурај се дека секој артикал има restaurant_id
}

interface CartState {
  items: CartItem[];
  restaurant_id: number | null; // ✅ Следење на ресторанот од кој се нарачува
}

const initialState: CartState = {
  items: [],
  restaurant_id: null, // ✅ Првично нема ресторан
};

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    addToCart: (state, action: PayloadAction<CartItem>) => {
      const { restaurant_id, id, quantity, price } = action.payload;

      // ✅ Ако има артикли од друг ресторан, спречи додавање без чистење на корпата
      if (state.restaurant_id && state.restaurant_id !== restaurant_id) {
        alert("❌ Можете да нарачате само од еден ресторан во исто време.");
        return;
      }

      const existingItem = state.items.find((item) => item.id === id);

      if (existingItem) {
        existingItem.quantity += quantity;
        existingItem.totalPrice += price * quantity;
      } else {
        state.items.push({ ...action.payload, totalPrice: price * quantity });
      }

      state.restaurant_id = restaurant_id; // ✅ Постави ресторан ID во корпата
    },

    removeFromCart: (state, action: PayloadAction<{ id: number }>) => {
      state.items = state.items.filter((item) => item.id !== action.payload.id);

      // ✅ Ако корпата е празна, ресетирај го restaurant_id
      if (state.items.length === 0) {
        state.restaurant_id = null;
      }
    },

    decrementQuantity: (state, action: PayloadAction<{ id: number }>) => {
      const existingItem = state.items.find(
        (item) => item.id === action.payload.id
      );

      if (existingItem) {
        if (existingItem.quantity > 1) {
          existingItem.quantity -= 1;
          existingItem.totalPrice -= existingItem.price;
        } else {
          state.items = state.items.filter(
            (item) => item.id !== action.payload.id
          );
        }
      }

      // ✅ Ако корпата е празна, ресетирај restaurant_id
      if (state.items.length === 0) {
        state.restaurant_id = null;
      }
    },

    updateCart: (state, action: PayloadAction<CartItem[]>) => {
      state.items = action.payload;

      // ✅ Ако се менува корпата рачно, освежи го restaurant_id
      state.restaurant_id = action.payload.length
        ? action.payload[0].restaurant_id
        : null;
    },

    clearCart: (state) => {
      state.items = [];
      state.restaurant_id = null; // ✅ Ресетирај ресторан ID при чистење на корпата
    },
  },
});

export const {
  addToCart,
  removeFromCart,
  decrementQuantity,
  updateCart,
  clearCart,
} = cartSlice.actions;
export default cartSlice.reducer;
