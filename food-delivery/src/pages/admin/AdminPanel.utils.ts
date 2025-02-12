// AdminPanel.utils.ts
import axios from "axios";

/* ------------------ Типови / Интерфејси ------------------ */
export interface User {
  id: number;
  name: string;
  lastname: string;
  role: string;
  // ... ако имаш други полиња (email, phone и сл.)
}

export interface MenuItem {
  id?: number;
  name: string;
  price: string;
  category: string;
  ingredients?: string[]; // ✅
  image_url?: string;
  imageFile?: File | null;
}

export interface Restaurant {
  id: number;
  name: string;
  cuisine: string;
  image_url: string;
  working_hours: string;
  menuItems?: MenuItem[];
  imageFile?: File | null;
  // owner_id?: number; // ако ти треба
}

/* ------------------ 1) Земаме сите ресторани + нивното мени ------------------ */
export const fetchRestaurants = async (): Promise<Restaurant[]> => {
  try {
    const response = await axios.get<Restaurant[]>(
      "http://localhost:5000/restaurants"
    );

    // За секој ресторан, земи ги menuItems
    const restaurantsWithMenu = await Promise.all(
      response.data.map(async (restaurant) => {
        try {
          const menuResponse = await axios.get<MenuItem[]>(
            `http://localhost:5000/restaurants/${restaurant.id}/menu`
          );
          const menuItemsWithIngredients = menuResponse.data.map((item) => ({
            ...item,
            ingredients: Array.isArray(item.ingredients)
              ? item.ingredients.filter((ing) => typeof ing === "string")
              : [],
          }));
          return { ...restaurant, menuItems: menuItemsWithIngredients };
        } catch (error) {
          console.error(
            `❌ Грешка при вчитување на мени за ресторан ID: ${restaurant.id}`,
            error
          );
          return { ...restaurant, menuItems: [] };
        }
      })
    );

    return restaurantsWithMenu;
  } catch (error) {
    console.error("❌ Грешка при вчитување на ресторани:", error);
    return [];
  }
};

/* ------------------ 2) Add / Update / Delete Restaurant ------------------ */
export const addRestaurant = async (newRestaurant: FormData) => {
  try {
    await axios.post("http://localhost:5000/restaurants", newRestaurant, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "multipart/form-data",
      },
    });
  } catch (error) {
    console.error("Error adding restaurant:", error);
  }
};

export const updateRestaurant = async (id: number, formData: FormData) => {
  try {
    await axios.put(`http://localhost:5000/restaurants/${id}`, formData, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "multipart/form-data",
      },
    });
  } catch (error) {
    console.error("Error updating restaurant:", error);
  }
};

export const deleteRestaurant = async (id: number) => {
  try {
    await axios.delete(`http://localhost:5000/restaurants/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  } catch (error) {
    console.error("Error deleting restaurant:", error);
  }
};

/* ------------------ 3) Add / Update / Delete Menu Item ------------------ */
export const addMenuItem = async (restaurantId: number, formData: FormData) => {
  try {
    await axios.post(
      `http://localhost:5000/restaurants/${restaurantId}/menu`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
  } catch (error) {
    console.error("Error adding menu item:", error);
  }
};

export const updateMenuItem = async (
  menuItemId: number,
  formData: FormData
) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("❌ Нема пронајден токен!");
      throw new Error("Unauthorized: No token found");
    }
    const response = await axios.put(
      `http://localhost:5000/menu_items/${menuItemId}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
    console.log("✅ Успешно ажурирање:", response.data);
    return response.data;
  } catch {
    console.log("❌ Грешка при ажурирање на мени предмет:");
  }
};

export const deleteMenuItem = async (menuItemId: number) => {
  try {
    await axios.delete(`http://localhost:5000/menu_items/${menuItemId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });
  } catch (error) {
    console.error("Error deleting menu item:", error);
  }
};

/* ------------------ 4) Корисници со улога "restaurant" + Assign Owner ------------------ */

// Претпоставка: имаш backend рута GET /users?role=restaurant
export const fetchRestaurantUsers = async (): Promise<User[]> => {
  try {
    const resp = await axios.get<User[]>(
      "http://localhost:5000/users?role=restaurant",
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
    return resp.data;
  } catch (err) {
    console.error("Error fetching restaurant users:", err);
    return [];
  }
};

// PUT /restaurants/:restId/assign_owner
export const assignRestaurantOwner = async (restId: number, userId: number) => {
  try {
    await axios.put(
      `http://localhost:5000/restaurants/${restId}/assign_owner`,
      { userId },
      {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      }
    );
  } catch (error) {
    console.error("Error assigning restaurant owner:", error);
    throw error;
  }
};
