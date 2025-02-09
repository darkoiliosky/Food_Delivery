// AdminPanel.tsx
import { useState, useEffect } from "react";
import {
  PanelContainer,
  Header,
  SubHeader,
  FormContainer,
  Input,
  ButtonRow,
  Button,
  RestaurantGrid,
  RestaurantCard,
  CardTopRow,
  CardInfo,
  Image,
  MenuItemsContainer,
  CollapsibleContainer,
} from "./AdminPanel.styles";

// ✅ Ги увезуваме "handler" функциите
import {
  handleFetchRestaurants,
  handleAddRestaurant,
  handleDeleteRestaurant,
  handleUpdateRestaurant,
  handleOpenAddItem,
  handleAddMenuItemToRestaurant,
  handleDeleteMenuItem,
  handleUpdateMenuItem,
} from "./AdminPanel.handlers";

// Типизиран interface (можеш и во .utils)
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
  ingredients?: string[]; // ✅ Додај ова поле
  imageFile?: File | null;
  image_url?: string;
}

const AdminPanel = () => {
  // Листа со сите ресторани
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);

  // Податоци за создавање нов ресторан
  const [newRestaurant, setNewRestaurant] = useState({
    name: "",
    cuisine: "",
    working_hours: "",
    imageFile: null as File | null,
  });

  // Ресторан за Edit
  const [editRestaurant, setEditRestaurant] = useState<Restaurant | null>(null);

  // "Привремени" мени-предмети при создавање нов ресторан
  const [menuItems, setMenuItems] = useState<
    { name: string; price: string; category: string; imageFile: File | null }[]
  >([]);

  // За додавање мени-предмет во постоечки ресторан
  const [showAddItemId, setShowAddItemId] = useState<number | null>(null);
  const [newItem, setNewItem] = useState({
    name: "",
    price: "",
    category: "",
    ingredients: [] as string[],
    imageFile: null as File | null,
  });

  // Edit на веќе постоечки мени предмет
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>(""); // ✅ Додај state за пребарување

  // При mount: земи ги сите ресторани
  useEffect(() => {
    fetchAllRestaurants();
  }, []);

  // Обвивка да ја повикаме handler функцијата за fetch
  const fetchAllRestaurants = async () => {
    await handleFetchRestaurants(setRestaurants);
  };

  // ======================= HANDLERS ======================

  // Глобална промена на сликата (за newRestaurant или editRestaurant)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (editRestaurant) {
        setEditRestaurant({ ...editRestaurant, imageFile: file });
      } else {
        setNewRestaurant({ ...newRestaurant, imageFile: file });
      }
    }
  };
  const filteredRestaurants = restaurants.filter((restaurant) =>
    restaurant.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <PanelContainer>
      <Header>Admin Panel</Header>

      {/* ------------------- EDIT OR ADD Restaurant ------------------- */}
      {editRestaurant ? (
        <>
          <SubHeader>Edit Restaurant</SubHeader>
          <FormContainer
            onSubmit={(e) =>
              handleUpdateRestaurant(
                e,
                editRestaurant,
                fetchAllRestaurants,
                setEditRestaurant
              )
            }
          >
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
          <FormContainer
            onSubmit={(e) =>
              handleAddRestaurant(
                e,
                newRestaurant,
                menuItems,
                fetchAllRestaurants,
                setNewRestaurant,
                setMenuItems
              )
            }
          >
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
      {/* ✅ Поле за пребарување */}
      <Input
        type="text"
        placeholder="Search restaurants..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        style={{ marginBottom: "20px", width: "100%", padding: "10px" }}
      />
      <RestaurantGrid>
        {filteredRestaurants.map((r) => (
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
                  setEditRestaurant({
                    id: r.id,
                    name: r.name,
                    cuisine: r.cuisine,
                    working_hours: r.working_hours,
                    image_url: r.image_url, // ✅ Додадено за да не исчезне сликата
                    imageFile: null,
                  });
                }}
              >
                Edit
              </Button>

              <Button
                variant="danger"
                onClick={() =>
                  handleDeleteRestaurant(r.id, fetchAllRestaurants)
                }
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
                      <>
                        <Button
                          variant="primary"
                          onClick={() =>
                            setEditingItem({
                              ...item,
                              ingredients: item.ingredients || [], // Осигурај дека нема `undefined`
                            })
                          }
                        >
                          ✏️ Edit
                        </Button>

                        <Button
                          variant="danger"
                          onClick={() =>
                            handleDeleteMenuItem(item.id!, fetchAllRestaurants)
                          }
                        >
                          ❌
                        </Button>
                      </>
                    )}

                    {/* Ако editingItem е истиот */}
                    {editingItem && editingItem.id === item.id && (
                      <CollapsibleContainer>
                        <h5>Edit Menu Item: {editingItem.name}</h5>

                        <Input
                          type="text"
                          placeholder="Name"
                          value={editingItem.name}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              name: e.target.value,
                            })
                          }
                        />

                        <Input
                          type="number"
                          placeholder="Price"
                          value={editingItem.price}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              price: parseFloat(e.target.value) || 0,
                            })
                          }
                        />

                        <Input
                          type="text"
                          placeholder="Category"
                          value={editingItem.category}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              category: e.target.value,
                            })
                          }
                        />

                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setEditingItem({
                                ...editingItem,
                                imageFile: e.target.files[0],
                                image_url: editingItem.image_url, // ✅ Додадено за да не исчезне сликата
                              });
                            }
                          }}
                        />

                        {/* ✅ Поле за состојки во еден input */}
                        <Input
                          type="text"
                          placeholder="Ingredients (comma-separated)"
                          value={
                            editingItem.ingredients
                              ? editingItem.ingredients.join(", ")
                              : ""
                          }
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              ingredients: e.target.value
                                .split(",")
                                .map((ing) => ing.trim())
                                .filter((ing) => ing.length > 0), // ✅ Отстранување на празни елементи
                            })
                          }
                        />

                        {/* Додавање на ново `ingredient` поле */}
                        <Button
                          onClick={() =>
                            setEditingItem({
                              ...editingItem,
                              ingredients: [
                                ...(editingItem.ingredients || []),
                                "",
                              ],
                            })
                          }
                        >
                          ➕ Додади состојка
                        </Button>

                        <ButtonRow>
                          <Button
                            onClick={() =>
                              handleUpdateMenuItem(
                                editingItem,
                                fetchAllRestaurants,
                                setEditingItem
                              )
                            }
                          >
                            Save
                          </Button>
                          <Button
                            variant="secondary"
                            onClick={() => setEditingItem(null)}
                          >
                            Cancel
                          </Button>
                        </ButtonRow>
                      </CollapsibleContainer>
                    )}
                  </div>
                ))
              ) : (
                <p>No menu items yet.</p>
              )}

              <Button
                className="add-menu-btn"
                onClick={() =>
                  handleOpenAddItem(r.id, setShowAddItemId, setNewItem)
                }
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
                      onClick={() =>
                        handleAddMenuItemToRestaurant(
                          showAddItemId,
                          newItem,
                          fetchAllRestaurants,
                          setShowAddItemId,
                          setNewItem
                        )
                      }
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
                if (e.target.files && e.target.files[0]) {
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
