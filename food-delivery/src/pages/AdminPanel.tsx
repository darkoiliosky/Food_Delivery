import { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";

// Интерфејси
interface Restaurant {
  id: number;
  name: string;
  cuisine: string;
  image_url: string;
  working_hours: string;
  imageFile?: File | null;
  menuItems?: MenuItem[];
}
interface MenuItem {
  id?: number;
  name: string;
  price: string;
  category: string;
  imageFile?: File | null;
  image_url?: string;
}

// ============ Стили ==============
const PanelContainer = styled.div`
  max-width: 1200px;
  margin: 40px auto;
  padding: 25px;
  background: #f9fafc;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
`;

const Header = styled.h2`
  text-align: center;
  margin-bottom: 20px;
  color: #333;
  font-size: 2rem;
`;

const SubHeader = styled.h3`
  margin-top: 30px;
  margin-bottom: 15px;
  color: #444;
  font-size: 1.4rem;
`;

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 20px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.07);

  h3 {
    margin-top: 0;
    margin-bottom: 10px;
    font-size: 1.2rem;
    color: #555;
  }
`;

const Input = styled.input`
  padding: 10px;
  font-size: 15px;
  border: 1px solid #dcdcdc;
  border-radius: 5px;
  transition: border-color 0.2s, box-shadow 0.2s;

  &:focus {
    outline: none;
    border-color: #7cbaf9;
    box-shadow: 0 0 0 2px rgba(124, 186, 249, 0.3);
  }
`;

const ButtonRow = styled.div`
  display: flex;
  gap: 10px;
`;

const Button = styled.button<{ variant?: string }>`
  padding: 10px 15px;
  font-size: 15px;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s, opacity 0.2s;

  &:hover {
    opacity: 0.9;
  }

  ${({ variant }) => {
    switch (variant) {
      case "danger":
        return `
          background: #e74c3c;
          &:hover {
            background: #c0392b;
          }
        `;
      case "secondary":
        return `
          background: #95a5a6;
          &:hover {
            background: #7f8c8d;
          }
        `;
      default:
        return `
          background: #3498db;
          &:hover {
            background: #2980b9;
          }
        `;
    }
  }}
`;

const RestaurantGrid = styled.div`
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  margin-top: 20px;
`;

const RestaurantCard = styled.div`
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  padding: 15px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  }
`;

const CardTopRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CardInfo = styled.div`
  h4 {
    margin: 0;
    font-size: 1.1rem;
    color: #333;
  }
  p {
    margin: 2px 0;
    font-size: 0.9rem;
    color: #555;
  }
`;

const Image = styled.img`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 5px;
  border: 1px solid #ddd;
`;

const MenuItemsContainer = styled.div`
  margin-top: 10px;

  h4 {
    margin-bottom: 8px;
    font-size: 1rem;
    color: #444;
  }

  div.menu-item-row {
    display: flex;
    gap: 10px;
    align-items: center;
    margin-bottom: 5px;

    img {
      border-radius: 4px;
    }

    p {
      margin: 0;
    }

    button {
      margin-left: auto;
      background: white;
      padding: 6px 10px;
      font-size: 0.8rem;
      border: none;
      border-radius: 4px;
      color: #fff;
      cursor: pointer;

      &:hover {
        background: #c0392b;
      }
    }
  }

  .add-menu-btn {
    margin-top: 8px;
    background: #27ae60;
    &:hover {
      background: #1f8a4d;
    }
  }
`;

const CollapsibleContainer = styled.div`
  margin-top: 10px;
  border: 1px solid #ccc;
  padding: 10px;
  border-radius: 5px;

  h5 {
    margin: 0 0 8px;
    font-size: 1rem;
    color: #555;
  }

  input {
    margin-bottom: 5px;
  }

  .submit-btn {
    margin-right: 10px;
    background-color: #2ecc71;
    &:hover {
      background-color: #27ae60;
    }
  }
`;

// ============ Компonentа =============
const AdminPanel = () => {
  // Листа со сите ресторани
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  // Формата за нов ресторан
  const [newRestaurant, setNewRestaurant] = useState({
    name: "",
    cuisine: "",
    working_hours: "",
    imageFile: null as File | null,
  });

  // Коj ресторан се уредува во моментов
  const [editRestaurant, setEditRestaurant] = useState<Restaurant | null>(null);

  // MenuItems за сосема нов ресторан
  const [menuItems, setMenuItems] = useState<
    { name: string; price: string; category: string; imageFile: File | null }[]
  >([]);

  // Додавање menu item во Постоечки Ресторан
  const [showAddItemId, setShowAddItemId] = useState<number | null>(null);
  const [newItem, setNewItem] = useState({
    name: "",
    price: "",
    category: "",
    imageFile: null as File | null,
  });

  // По вчитување на компонентата
  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
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
      setRestaurants(restaurantsWithMenu);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    }
  };

  // Промена на сликата
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (editRestaurant !== null) {
        setEditRestaurant((prev) =>
          prev ? { ...prev, imageFile: file } : prev
        );
      } else {
        setNewRestaurant((prev) => ({ ...prev, imageFile: file }));
      }
    }
  };

  // 1) Додавање сосема нов ресторан (+ мени)
  const handleAddRestaurant = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      formData.append("name", newRestaurant.name || "");
      formData.append("cuisine", newRestaurant.cuisine || "");
      formData.append("working_hours", newRestaurant.working_hours || "");
      if (newRestaurant.imageFile) {
        formData.append("image", newRestaurant.imageFile);
      }
      formData.append("menuItems", JSON.stringify(menuItems));
      menuItems.forEach((item) => {
        if (item.imageFile) {
          formData.append("menuImages", item.imageFile);
        }
      });
      await axios.post("http://localhost:5000/restaurants", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });
      fetchRestaurants();
      // Ресет
      setNewRestaurant({
        name: "",
        cuisine: "",
        working_hours: "",
        imageFile: null,
      });
      setMenuItems([]);
    } catch (error: any) {
      console.error("Error adding restaurant:", error);
      if (error.response) {
        console.error("Server Response:", error.response.data);
      }
    }
  };

  // 2) Бришење meni item
  const handleDeleteMenuItem = async (menuItemId: number) => {
    try {
      await axios.delete(`http://localhost:5000/menu_items/${menuItemId}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      fetchRestaurants();
    } catch (error) {
      console.error("Error deleting menu item:", error);
    }
  };

  // 3) Бришење ресторан
  const handleDeleteRestaurant = async (id: number) => {
    try {
      await axios.delete(`http://localhost:5000/restaurants/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });
      fetchRestaurants();
    } catch (error) {
      console.error("Error deleting restaurant:", error);
    }
  };

  // 4) Ажурирање ресторан
  const handleUpdateRestaurant = async (e: React.FormEvent) => {
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
      await axios.put(
        `http://localhost:5000/restaurants/${editRestaurant.id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      fetchRestaurants();
      setEditRestaurant(null);
    } catch (error) {
      console.error("Error updating restaurant:", error);
    }
  };

  // 5) Отворање форма за додавање meni item
  const handleOpenAddItem = (restaurantId: number) => {
    setShowAddItemId(restaurantId);
    setNewItem({ name: "", price: "", category: "", imageFile: null });
  };

  // 6) Додавање meni item во Постоечки Ресторан
  const handleAddMenuItemToRestaurant = async () => {
    if (!showAddItemId) return;
    try {
      const formData = new FormData();
      formData.append("name", newItem.name);
      formData.append("price", newItem.price);
      formData.append("category", newItem.category);
      if (newItem.imageFile) {
        formData.append("image", newItem.imageFile);
      }
      await axios.post(
        `http://localhost:5000/restaurants/${showAddItemId}/menu`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );
      fetchRestaurants();
      setShowAddItemId(null);
      setNewItem({ name: "", price: "", category: "", imageFile: null });
    } catch (error) {
      console.error("Error adding menu item:", error);
    }
  };

  return (
    <PanelContainer>
      <Header>Admin Panel</Header>

      {editRestaurant ? (
        <>
          <SubHeader>Edit Restaurant</SubHeader>
          <FormContainer onSubmit={handleUpdateRestaurant}>
            <Input
              type="text"
              placeholder="Name"
              value={editRestaurant.name}
              onChange={(e) =>
                setEditRestaurant({ ...editRestaurant, name: e.target.value })
              }
            />
            <Input
              type="text"
              placeholder="Cuisine"
              value={editRestaurant.cuisine}
              onChange={(e) =>
                setEditRestaurant({
                  ...editRestaurant,
                  cuisine: e.target.value,
                })
              }
            />
            <Input
              type="text"
              placeholder="Working Hours"
              value={editRestaurant.working_hours}
              onChange={(e) =>
                setEditRestaurant({
                  ...editRestaurant,
                  working_hours: e.target.value,
                })
              }
            />
            <Input type="file" accept="image/*" onChange={handleFileChange} />
            <ButtonRow>
              <Button type="submit">Save Changes</Button>
              <Button
                variant="secondary"
                onClick={() => setEditRestaurant(null)}
              >
                Cancel
              </Button>
            </ButtonRow>
          </FormContainer>
        </>
      ) : (
        <>
          <SubHeader>Add New Restaurant</SubHeader>
          <FormContainer onSubmit={handleAddRestaurant}>
            <Input
              type="text"
              placeholder="Name"
              value={newRestaurant.name}
              onChange={(e) =>
                setNewRestaurant({ ...newRestaurant, name: e.target.value })
              }
            />
            <Input
              type="text"
              placeholder="Cuisine"
              value={newRestaurant.cuisine}
              onChange={(e) =>
                setNewRestaurant({ ...newRestaurant, cuisine: e.target.value })
              }
            />
            <Input
              type="text"
              placeholder="Working Hours"
              value={newRestaurant.working_hours}
              onChange={(e) =>
                setNewRestaurant({
                  ...newRestaurant,
                  working_hours: e.target.value,
                })
              }
            />
            <Input type="file" accept="image/*" onChange={handleFileChange} />
            <Button type="submit">Add Restaurant</Button>
          </FormContainer>
        </>
      )}

      <SubHeader>Existing Restaurants:</SubHeader>
      <RestaurantGrid>
        {restaurants.map((r) => (
          <RestaurantCard key={r.id}>
            <CardTopRow>
              <CardInfo>
                <h4>{r.name}</h4>
                <p>Cuisine: {r.cuisine}</p>
                <p>Working Hours: {r.working_hours}</p>
              </CardInfo>
              {r.image_url && (
                <Image
                  src={`http://localhost:5000${r.image_url}`}
                  alt={r.name}
                />
              )}
            </CardTopRow>

            <ButtonRow>
              <Button
                onClick={() => {
                  setEditRestaurant({ ...r, imageFile: null });
                }}
              >
                Edit
              </Button>
              <Button
                variant="danger"
                onClick={() => handleDeleteRestaurant(r.id)}
              >
                Delete
              </Button>
            </ButtonRow>

            <MenuItemsContainer>
              <h4>Menu Items:</h4>
              {r.menuItems && r.menuItems.length > 0 ? (
                r.menuItems.map((item, idx) => (
                  <div className="menu-item-row" key={idx}>
                    <p>
                      {item.name} - ${item.price}
                    </p>
                    {item.image_url && (
                      <img
                        src={`http://localhost:5000${item.image_url}`}
                        alt={item.name}
                        width="50"
                      />
                    )}
                    {item.id !== undefined && (
                      <Button
                        variant="danger"
                        onClick={() => handleDeleteMenuItem(item.id!)}
                      >
                        ❌
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                <p>No menu items yet.</p>
              )}

              {/* Add item to existing restaurant */}
              <Button
                className="add-menu-btn"
                onClick={() => handleOpenAddItem(r.id)}
              >
                + Add Menu Item
              </Button>
              {showAddItemId === r.id && (
                <CollapsibleContainer>
                  <h5>Add new item for: {r.name}</h5>
                  <Input
                    type="text"
                    placeholder="Name"
                    value={newItem.name}
                    onChange={(e) =>
                      setNewItem({ ...newItem, name: e.target.value })
                    }
                  />
                  <Input
                    type="text"
                    placeholder="Price"
                    value={newItem.price}
                    onChange={(e) =>
                      setNewItem({ ...newItem, price: e.target.value })
                    }
                  />
                  <Input
                    type="text"
                    placeholder="Category"
                    value={newItem.category}
                    onChange={(e) =>
                      setNewItem({ ...newItem, category: e.target.value })
                    }
                  />
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setNewItem({
                          ...newItem,
                          imageFile: e.target.files[0],
                        });
                      }
                    }}
                  />
                  <ButtonRow>
                    <Button
                      className="submit-btn"
                      onClick={handleAddMenuItemToRestaurant}
                    >
                      Submit
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => setShowAddItemId(null)}
                    >
                      Cancel
                    </Button>
                  </ButtonRow>
                </CollapsibleContainer>
              )}
            </MenuItemsContainer>
          </RestaurantCard>
        ))}
      </RestaurantGrid>

      {/* Optional - додадени мени items за NEW Restaurant */}
      <div style={{ marginTop: "40px" }}>
        <SubHeader>Menu Items for NEW Restaurant (Optional)</SubHeader>
        {menuItems.map((item, index) => (
          <div
            key={index}
            style={{ display: "flex", gap: "10px", marginBottom: "10px" }}
          >
            <Input
              type="text"
              placeholder="Dish Name"
              value={item.name}
              onChange={(e) => {
                const newMenu = [...menuItems];
                newMenu[index].name = e.target.value;
                setMenuItems(newMenu);
              }}
            />
            <Input
              type="number"
              placeholder="Price"
              value={item.price}
              onChange={(e) => {
                const newMenu = [...menuItems];
                newMenu[index].price = e.target.value;
                setMenuItems(newMenu);
              }}
            />
            <Input
              type="text"
              placeholder="Category"
              value={item.category}
              onChange={(e) => {
                const newMenu = [...menuItems];
                newMenu[index].category = e.target.value;
                setMenuItems(newMenu);
              }}
            />
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files.length > 0) {
                  const newMenu = [...menuItems];
                  newMenu[index].imageFile = e.target.files[0];
                  setMenuItems(newMenu);
                }
              }}
            />
            <Button
              variant="danger"
              onClick={() =>
                setMenuItems(menuItems.filter((_, i) => i !== index))
              }
            >
              ❌
            </Button>
          </div>
        ))}
        <Button
          onClick={() =>
            setMenuItems([
              ...menuItems,
              { name: "", price: "", category: "", imageFile: null },
            ])
          }
        >
          ➕ Add Menu Item (for NEW Restaurant)
        </Button>
      </div>
    </PanelContainer>
  );
};

export default AdminPanel;
