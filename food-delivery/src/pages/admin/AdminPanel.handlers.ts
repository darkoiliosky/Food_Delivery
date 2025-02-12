// AdminPanel.handlers.ts
import {
  addRestaurant,
  updateRestaurant,
  deleteRestaurant,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  fetchRestaurants as fetchAll,
  assignRestaurantOwner,
} from "./AdminPanel.utils";

import type { Restaurant, MenuItem } from "./AdminPanel.utils";

/* ---------------- Fetch Restaurants ---------------- */
export const handleFetchRestaurants = async (
  setRestaurants: (val: Restaurant[]) => void
) => {
  const data = await fetchAll();
  setRestaurants(data);
};

/* ---------------- Add NEW Restaurant ---------------- */
export const handleAddRestaurant = async (
  e: React.FormEvent,
  newRestaurant: {
    name: string;
    cuisine: string;
    working_hours: string;
    imageFile: File | null;
  },
  menuItems: {
    name: string;
    price: string;
    category: string;
    ingredients?: { name: string; price: number }[];
    imageFile: File | null;
  }[],
  fetchRestaurants: () => void,
  setNewRestaurant: (val: {
    name: string;
    cuisine: string;
    working_hours: string;
    imageFile: File | null;
  }) => void,
  setMenuItems: (
    val: {
      name: string;
      price: string;
      category: string;
      imageFile: File | null;
    }[]
  ) => void
) => {
  e.preventDefault();
  try {
    const formData = new FormData();
    formData.append("name", newRestaurant.name || "");
    formData.append("cuisine", newRestaurant.cuisine || "");
    formData.append("working_hours", newRestaurant.working_hours || "");
    if (newRestaurant.imageFile) {
      formData.append("image", newRestaurant.imageFile);
    }

    // Менито (optional)
    formData.append(
      "menuItems",
      JSON.stringify(
        menuItems.map((item) => ({
          ...item,
          ingredients: item.ingredients
            ? item.ingredients.map((ing) => ing.name)
            : [],
        }))
      )
    );
    // Фајлови за слика на тие menu-items
    menuItems.forEach((item) => {
      if (item.imageFile) {
        formData.append("menuImages", item.imageFile);
      }
    });

    await addRestaurant(formData);

    // refresh
    fetchRestaurants();
    setNewRestaurant({
      name: "",
      cuisine: "",
      working_hours: "",
      imageFile: null,
    });
    setMenuItems([]);
  } catch (error) {
    console.error("Error adding restaurant:", error);
  }
};

/* ---------------- Update Restaurant ---------------- */
export const handleUpdateRestaurant = async (
  e: React.FormEvent,
  editRestaurant: Restaurant,
  fetchRestaurants: () => void,
  setEditRestaurant: (val: Restaurant | null) => void
) => {
  e.preventDefault();
  if (!editRestaurant) return;
  try {
    const formData = new FormData();
    formData.append("name", editRestaurant.name);
    formData.append("cuisine", editRestaurant.cuisine);
    formData.append("working_hours", editRestaurant.working_hours);

    if (editRestaurant.imageFile) {
      formData.append("image", editRestaurant.imageFile);
    } else {
      formData.append("image_url", editRestaurant.image_url || "");
    }

    await updateRestaurant(editRestaurant.id, formData);

    fetchRestaurants();
    setEditRestaurant(null);
  } catch (error) {
    console.error("Error updating restaurant:", error);
  }
};

/* ---------------- Delete Restaurant ---------------- */
export const handleDeleteRestaurant = async (
  id: number,
  fetchRestaurants: () => void
) => {
  try {
    await deleteRestaurant(id);
    fetchRestaurants();
  } catch (error) {
    console.error("Error deleting restaurant:", error);
  }
};

/* ---------------- Add Menu Item to existing Restaurant ---------------- */
export const handleAddMenuItemToRestaurant = async (
  restaurantId: number,
  newItem: {
    name: string;
    price: string;
    category: string;
    ingredients?: string[];
    imageFile: File | null;
  },
  fetchRestaurants: () => void,
  setShowAddItem: (val: boolean) => void,
  setNewItem: (val: {
    name: string;
    price: string;
    category: string;
    ingredients: string[];
    imageFile: File | null;
  }) => void
) => {
  try {
    const formData = new FormData();
    formData.append("name", newItem.name);
    formData.append("price", newItem.price);
    formData.append("category", newItem.category);

    const cleanedIngredients = (newItem.ingredients || [])
      .map((ing) => ing.trim())
      .filter((ing) => ing.length > 0);

    formData.append("ingredients", JSON.stringify(cleanedIngredients));

    if (newItem.imageFile) {
      formData.append("image", newItem.imageFile);
    }

    await addMenuItem(restaurantId, formData);

    // refresh
    fetchRestaurants();
    setShowAddItem(false);
    setNewItem({
      name: "",
      price: "",
      category: "",
      ingredients: [],
      imageFile: null,
    });
  } catch (error) {
    console.error("Error adding menu item:", error);
  }
};

/* ---------------- Delete Menu Item ---------------- */
export const handleDeleteMenuItem = async (
  menuItemId: number,
  fetchRestaurants: () => void
) => {
  try {
    await deleteMenuItem(menuItemId);
    fetchRestaurants();
  } catch (error) {
    console.error("Error deleting menu item:", error);
  }
};

/* ---------------- Update Menu Item ---------------- */
export const handleUpdateMenuItem = async (
  editingItem: MenuItem,
  fetchRestaurants: () => void,
  setEditingItem: (val: MenuItem | null) => void
) => {
  if (!editingItem) return;
  try {
    const formData = new FormData();
    formData.append("name", editingItem.name);
    formData.append("price", editingItem.price);
    formData.append("category", editingItem.category);

    const cleanedIngredients = Array.from(
      new Set(
        (editingItem.ingredients || [])
          .map((ing) => ing.trim())
          .filter((ing) => ing.length > 0)
      )
    );
    formData.append("ingredients", JSON.stringify(cleanedIngredients));

    if (editingItem.imageFile) {
      formData.append("image", editingItem.imageFile);
    }

    if (!editingItem.id) return;
    await updateMenuItem(editingItem.id, formData);

    setEditingItem(null);
    fetchRestaurants();
  } catch (error) {
    console.error("❌ Грешка при ажурирање на мени предмет:", error);
  }
};

/* ---------------- Assign Owner Handler ---------------- */
export const handleAssignOwner = async (
  restId: number,
  userId: number,
  fetchRestaurants: () => void
) => {
  try {
    await assignRestaurantOwner(restId, userId);
    fetchRestaurants();
    alert("Owner assigned successfully!");
  } catch {
    alert("Error assigning owner!");
  }
};
