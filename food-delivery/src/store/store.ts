// Store.ts
import { configureStore } from "@reduxjs/toolkit";
import { useDispatch, useSelector, TypedUseSelectorHook } from "react-redux"; // Додади увоз на потребните hook-ови
import cartReducer from "./cartSlice";

const store = configureStore({
  reducer: {
    cart: cartReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export const useAppDispatch: () => AppDispatch = useDispatch; // За типизиран dispatch
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector; // За типизиран selector

export default store;
