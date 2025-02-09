// AdminPanel.utils.ts
import axios from "axios";
// Интерфејси
export interface Restaurant {
  id: number;
  name: string;
  cuisine: string;
  image_url: string;
  working_hours: string;
  menuItems?: MenuItem[];
  imageFile?: File | null;
}

export interface MenuItem {
  id?: number;
  name: string;
  price: string;
  category: string;
  ingredients?: string[]; // ✅ Додади `ingredients`

  image_url?: string;
  imageFile?: File | null;
}

// ✅ Функција за земање на сите ресторани + мени
export const fetchRestaurants = async (): Promise<Restaurant[]> => {
  try {
    const response = await axios.get<Restaurant[]>(
      "http://localhost:5000/restaurants"
    );

    const restaurantsWithMenu = await Promise.all(
      response.data.map(async (restaurant) => {
        try {
          const menuResponse = await axios.get<MenuItem[]>(
            `http://localhost:5000/restaurants/${restaurant.id}/menu`
          );

          // ✅ Осигурај се дека `ingredients` секогаш е низа и отстранува `null`
          const menuItemsWithIngredients = menuResponse.data.map((item) => ({
            ...item,
            ingredients: Array.isArray(item.ingredients)
              ? item.ingredients.filter((ing) => typeof ing === "string")
              : [], // Ако `ingredients` не е низа, врати празна низа
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

// ✅ Додавање нов ресторан
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

// ✅ Ажурирање ресторан
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

// ✅ Бришење ресторан
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

// ✅ Додавање мени предмет во ресторан
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

// ✅ Ажурирање мени предмет
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

    console.log("📤 Испраќам барање за ажурирање:", menuItemId);
    console.log("🔑 Токен:", token);

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
  } catch (error: any) {
    if (error.response) {
      console.error(
        "❌ Грешка при ажурирање мени предмет:",
        error.response.data
      );
      if (error.response.status === 403) {
        alert("Немате дозвола за ажурирање на мени предмет!");
      }
    } else {
      console.error("❌ Неочекувана грешка:", error);
    }
    throw error;
  }
};

// ✅ Бришење мени предмет
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
