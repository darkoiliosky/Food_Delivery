// AdminRestaurantMenu.tsx
import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { fetchRestaurants, Restaurant, MenuItem } from "./AdminPanel.utils";
import styled from "styled-components";

import {
  handleAddMenuItemToRestaurant,
  handleDeleteMenuItem,
  handleUpdateMenuItem,
} from "./AdminPanel.handlers";

import {
  PanelContainer,
  Header,
  SubHeader,
  ButtonRow,
  Button,
} from "./AdminPanel.styles";

/* ----------------- Styled Components ----------------- */
const MenuItemsWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 20px;
  justify-content: center;
`;

const MenuItemCard = styled.div`
  width: 250px;
  background: #fafafa;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
  box-shadow: 0 3px 5px rgba(0, 0, 0, 0.1);
`;

// Модал Overlay
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
`;

// Модал Content
const ModalContent = styled.div`
  background: #fff;
  padding: 25px;
  border-radius: 10px;
  width: 400px;
  max-width: 90%;
  position: relative;
`;

const ModalField = styled.div`
  margin-bottom: 15px;

  label {
    display: block;
    font-weight: 600;
    margin-bottom: 5px;
  }

  input {
    width: 100%;
    padding: 8px;
    border: 1px solid #ccc;
    border-radius: 5px;
  }
`;

const AdminRestaurantMenu: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [restaurant, setRestaurant] = useState<Restaurant | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("");

  // Модал за Edit
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const closeEditingModal = () => setEditingItem(null);

  // Модал за Add
  const [showAddItem, setShowAddItem] = useState<boolean>(false);
  const closeAddModal = () => setShowAddItem(false);

  // Template за new item
  const [newItem, setNewItem] = useState<{
    name: string;
    price: string;
    category: string;
    ingredients: string[];
    imageFile: File | null;
  }>({
    name: "",
    price: "",
    category: "",
    ingredients: [],
    imageFile: null,
  });

  // Земаме еден ресторан според ID
  const fetchSingleRestaurant = useCallback(async () => {
    const allRests = await fetchRestaurants();
    const rest = allRests.find((r) => r.id === Number(id));
    if (rest) {
      setRestaurant(rest);
    }
  }, [id]);

  useEffect(() => {
    fetchSingleRestaurant();
  }, [fetchSingleRestaurant]);

  if (!restaurant) {
    return <div>Loading restaurant menu...</div>;
  }

  // Собери категории
  const categories = Array.from(
    new Set(
      (restaurant.menuItems || [])
        .map((item) => item.category)
        .filter((cat) => cat)
    )
  );

  // Филтрирани items
  const visibleMenuItems = (restaurant.menuItems || []).filter((item) => {
    if (!selectedCategory) return true;
    return item.category === selectedCategory;
  });

  /* -------------- Handlers -------------- */
  const onAddMenuItem = async () => {
    if (!id) return;
    await handleAddMenuItemToRestaurant(
      Number(id),
      newItem,
      fetchSingleRestaurant,
      setShowAddItem,
      setNewItem
    );
  };

  const onDeleteItem = async (menuItemId: number) => {
    await handleDeleteMenuItem(menuItemId, fetchSingleRestaurant);
  };

  const onUpdateItem = async () => {
    if (!editingItem) return;
    await handleUpdateMenuItem(
      editingItem,
      fetchSingleRestaurant,
      setEditingItem
    );
  };

  return (
    <PanelContainer>
      <Button onClick={() => navigate(-1)} style={{ marginBottom: "15px" }}>
        ← Back to Admin Panel
      </Button>

      <Header>Menu for {restaurant.name}</Header>

      {categories.length > 0 && (
        <div style={{ marginBottom: "20px" }}>
          <label style={{ marginRight: "10px" }}>
            <strong>Filter by Category:</strong>
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            style={{ padding: "5px", fontSize: "16px", borderRadius: "5px" }}
          >
            <option value="">All</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      )}

      <SubHeader>List of Menu Items:</SubHeader>

      <MenuItemsWrapper>
        {visibleMenuItems.length > 0 ? (
          visibleMenuItems.map((item) => (
            <MenuItemCard key={item.id}>
              <h3>{item.name}</h3>
              <p>
                <strong>Price:</strong> ${item.price}
              </p>
              <p>
                <strong>Category:</strong> {item.category}
              </p>
              <p>
                <strong>Ingredients:</strong>{" "}
                {item.ingredients && item.ingredients.length > 0
                  ? item.ingredients.join(", ")
                  : "N/A"}
              </p>
              {item.image_url && (
                <img
                  src={`http://localhost:5000${item.image_url}`}
                  alt={item.name}
                  style={{
                    width: "100%",
                    maxHeight: "150px",
                    objectFit: "cover",
                    borderRadius: "5px",
                    marginTop: "10px",
                  }}
                />
              )}

              <ButtonRow style={{ marginTop: "10px" }}>
                <Button
                  onClick={() =>
                    setEditingItem({
                      ...item,
                      imageFile: item.imageFile || null,
                    })
                  }
                >
                  Edit
                </Button>
                <Button variant="danger" onClick={() => onDeleteItem(item.id!)}>
                  Delete
                </Button>
              </ButtonRow>
            </MenuItemCard>
          ))
        ) : (
          <p>No menu items in this category.</p>
        )}
      </MenuItemsWrapper>

      {/* Ако нема ниту еден item */}
      {restaurant.menuItems && restaurant.menuItems.length === 0 && (
        <p style={{ textAlign: "center" }}>No menu items yet.</p>
      )}

      <Button onClick={() => setShowAddItem(true)}>+ Add Menu Item</Button>

      {/* ----- Add Modal ----- */}
      {showAddItem && (
        <ModalOverlay onClick={closeAddModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <h3>Add New Menu Item</h3>
            <ModalField>
              <label>Name:</label>
              <input
                type="text"
                placeholder="Name"
                value={newItem.name}
                onChange={(e) =>
                  setNewItem({ ...newItem, name: e.target.value })
                }
              />
            </ModalField>

            <ModalField>
              <label>Price:</label>
              <input
                type="number"
                step="0.01"
                placeholder="Price"
                value={newItem.price}
                onChange={(e) =>
                  setNewItem({ ...newItem, price: e.target.value })
                }
              />
            </ModalField>

            <ModalField>
              <label>Category:</label>
              <input
                type="text"
                placeholder="Category"
                value={newItem.category}
                onChange={(e) =>
                  setNewItem({ ...newItem, category: e.target.value })
                }
              />
            </ModalField>

            <ModalField>
              <label>Ingredients (comma-separated):</label>
              <input
                type="text"
                placeholder="e.g. Mushrooms, Cheese"
                value={newItem.ingredients?.join(", ")}
                onChange={(e) => {
                  const arr = e.target.value
                    .split(",")
                    .map((ing) => ing.trim())
                    .filter(Boolean);
                  setNewItem({ ...newItem, ingredients: arr });
                }}
              />
            </ModalField>

            <ModalField>
              <label>Image (optional):</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setNewItem({ ...newItem, imageFile: e.target.files[0] });
                  } else {
                    setNewItem({ ...newItem, imageFile: null }); // ✅ Додади default null
                  }
                }}
              />
            </ModalField>

            <ButtonRow>
              <Button onClick={onAddMenuItem}>Submit</Button>
              <Button variant="secondary" onClick={closeAddModal}>
                Cancel
              </Button>
            </ButtonRow>
          </ModalContent>
        </ModalOverlay>
      )}

      {/* ----- Edit Modal ----- */}
      {editingItem && (
        <ModalOverlay onClick={closeEditingModal}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <h3>Edit Menu Item</h3>

            <ModalField>
              <label>Name:</label>
              <input
                type="text"
                value={editingItem.name}
                onChange={(e) =>
                  setEditingItem({ ...editingItem, name: e.target.value })
                }
              />
            </ModalField>

            <ModalField>
              <label>Price:</label>
              <input
                type="number"
                step="0.01"
                value={editingItem.price}
                onChange={(e) =>
                  setEditingItem({ ...editingItem, price: e.target.value })
                }
              />
            </ModalField>

            <ModalField>
              <label>Category:</label>
              <input
                type="text"
                value={editingItem.category}
                onChange={(e) =>
                  setEditingItem({ ...editingItem, category: e.target.value })
                }
              />
            </ModalField>

            <ModalField>
              <label>Ingredients (comma-separated):</label>
              <input
                type="text"
                value={
                  editingItem.ingredients
                    ? editingItem.ingredients.join(", ")
                    : ""
                }
                onChange={(e) => {
                  const arr = e.target.value
                    .split(",")
                    .map((ing) => ing.trim())
                    .filter(Boolean);
                  setEditingItem({ ...editingItem, ingredients: arr });
                }}
              />
            </ModalField>

            <ModalField>
              <label>Change Image (optional):</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setEditingItem({
                      ...editingItem,
                      imageFile: e.target.files[0],
                    });
                  }
                }}
              />
            </ModalField>

            <ButtonRow>
              <Button onClick={onUpdateItem}>Save</Button>
              <Button variant="secondary" onClick={closeEditingModal}>
                Cancel
              </Button>
            </ButtonRow>
          </ModalContent>
        </ModalOverlay>
      )}
    </PanelContainer>
  );
};

export default AdminRestaurantMenu;
