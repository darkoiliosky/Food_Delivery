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
          return { ...restaurant, menuItems: menuResponse.data || [] };
        } catch {
          return { ...restaurant, menuItems: [] };
        }
      })
    );

    return restaurantsWithMenu;
  } catch (error) {
    console.error("Error fetching restaurants:", error);
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
    await axios.put(
      `http://localhost:5000/menu_items/${menuItemId}`,
      formData,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      }
    );
  } catch (error) {
    console.error("Error updating menu item:", error);
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
