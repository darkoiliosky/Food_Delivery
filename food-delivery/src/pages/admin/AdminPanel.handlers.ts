// AdminPanel.handlers.ts
import {
  addRestaurant,
  updateRestaurant,
  deleteRestaurant,
  addMenuItem,
  updateMenuItem,
  deleteMenuItem,
  fetchRestaurants as fetchAll,
} from "./AdminPanel.utils";
import type { Restaurant, MenuItem } from "./AdminPanel.utils";

/**
 * Handler за земање списоци на ресторани и ажурирање на локален state
 */
export const handleFetchRestaurants = async (
  setRestaurants: (val: Restaurant[]) => void
) => {
  const data = await fetchAll(); // повикуваме функција од AdminPanel.utils
  setRestaurants(data);
};

/**
 * Handler за додавање сосема нов ресторан + init menu items
 */
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
    imageFile: File | null;
  }[],
  fetchRestaurants: () => void,
  setNewRestaurant: (val: any) => void,
  setMenuItems: (val: any) => void
) => {
  e.preventDefault();
  try {
    // 1) Подготви FormData
    const formData = new FormData();
    formData.append("name", newRestaurant.name || "");
    formData.append("cuisine", newRestaurant.cuisine || "");
    formData.append("working_hours", newRestaurant.working_hours || "");
    if (newRestaurant.imageFile) {
      formData.append("image", newRestaurant.imageFile);
    }
    // Мени предмети
    formData.append("menuItems", JSON.stringify(menuItems));
    menuItems.forEach((item) => {
      if (item.imageFile) {
        formData.append("menuImages", item.imageFile);
      }
    });

    // 2) Испрати до backend
    await addRestaurant(formData);

    // 3) Освежи и ресетирај
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

/**
 * Handler за ажурирање (PUT) на ресторан
 */
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
    }

    await updateRestaurant(editRestaurant.id, formData);

    fetchRestaurants();
    setEditRestaurant(null);
  } catch (error) {
    console.error("Error updating restaurant:", error);
  }
};

/**
 * Handler за бришење (DELETE) ресторан
 */
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

/**
 * Handler за отварање форма за додавање meni item во Постоечки Ресторан
 */
export const handleOpenAddItem = (
  restaurantId: number,
  setShowAddItemId: (val: number | null) => void,
  setNewItem: (val: any) => void
) => {
  setShowAddItemId(restaurantId);
  setNewItem({ name: "", price: "", category: "", imageFile: null });
};

/**
 * Handler за додавање meni item во Постоечки Ресторан
 */
export const handleAddMenuItemToRestaurant = async (
  showAddItemId: number | null,
  newItem: {
    name: string;
    price: string;
    category: string;
    imageFile: File | null;
  },
  fetchRestaurants: () => void,
  setShowAddItemId: (val: number | null) => void,
  setNewItem: (val: any) => void
) => {
  if (!showAddItemId) return;
  try {
    const formData = new FormData();
    formData.append("name", newItem.name);
    formData.append("price", newItem.price);
    formData.append("category", newItem.category);

    if (newItem.imageFile) {
      formData.append("image", newItem.imageFile);
    }

    await addMenuItem(showAddItemId, formData);

    fetchRestaurants();
    setShowAddItemId(null);
    setNewItem({ name: "", price: "", category: "", imageFile: null });
  } catch (error) {
    console.error("Error adding menu item:", error);
  }
};

/**
 * Handler за бришење meni item
 */
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

/**
 * Handler за ажурирање (PUT) meni item
 */
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

    if (editingItem.imageFile) {
      formData.append("image", editingItem.imageFile);
    }

    if (!editingItem.id) return; // safety
    await updateMenuItem(editingItem.id, formData);

    setEditingItem(null);
    fetchRestaurants();
  } catch (error) {
    console.error("Error updating menu item:", error);
  }
};
