// AdminPanel.tsx

import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

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
} from "./AdminPanel.styles";

import {
  handleFetchRestaurants,
  handleAddRestaurant,
  handleDeleteRestaurant,
  handleUpdateRestaurant,
} from "./AdminPanel.handlers";

// Додадено:
import { handleAssignOwner } from "./AdminPanel.handlers";
import { fetchRestaurantUsers, Restaurant, User } from "./AdminPanel.utils";

const AdminPanel = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [newRestaurant, setNewRestaurant] = useState({
    name: "",
    cuisine: "",
    working_hours: "",
    imageFile: null as File | null,
  });
  const [editRestaurant, setEditRestaurant] = useState<Restaurant | null>(null);
  const [menuItems, setMenuItems] = useState<
    { name: string; price: string; category: string; imageFile: File | null }[]
  >([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // ====== Додадено: list of restaurantUsers (role="restaurant") ======
  const [restaurantUsers, setRestaurantUsers] = useState<User[]>([]);

  // ====== Додадено: AssignOwner modal states ======
  const [assignOwnerRestId, setAssignOwnerRestId] = useState<number | null>(
    null
  );
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);

  // При mount: земи ресторани, земи restaurantUsers
  useEffect(() => {
    fetchAllRestaurants();
    fetchAllRestaurantUsers(); // нова функција
  }, []);

  const fetchAllRestaurants = async () => {
    await handleFetchRestaurants(setRestaurants);
  };

  const fetchAllRestaurantUsers = async () => {
    const data = await fetchRestaurantUsers();
    setRestaurantUsers(data);
  };

  // Глобална промена на сликата ...
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

  // === Assign Owner logics ===
  const openAssignOwnerModal = (restId: number) => {
    setAssignOwnerRestId(restId);
    setSelectedUserId(null); // ресетирај го dropdown
  };
  const closeAssignOwnerModal = () => {
    setAssignOwnerRestId(null);
    setSelectedUserId(null);
  };
  const doAssignOwner = async () => {
    if (assignOwnerRestId && selectedUserId) {
      await handleAssignOwner(
        assignOwnerRestId,
        selectedUserId,
        fetchAllRestaurants
      );
      closeAssignOwnerModal();
    }
  };

  return (
    <PanelContainer>
      <Header>Admin Panel</Header>

      {/* --- EDIT / ADD Restaurant --- */}
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
          {/* Optional Menu Items for the new Restaurant */}
          <div>
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
      {/* Search Field */}
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
                onClick={() =>
                  setEditRestaurant({
                    id: r.id,
                    name: r.name,
                    cuisine: r.cuisine,
                    working_hours: r.working_hours,
                    image_url: r.image_url,
                    imageFile: null,
                  })
                }
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

            {/* Assign Owner копче */}
            <ButtonRow>
              <Button onClick={() => openAssignOwnerModal(r.id)}>
                Assign Owner
              </Button>
              <Link to={`/admin/restaurants/${r.id}/menu`}>
                <Button>View Menu</Button>
              </Link>
            </ButtonRow>
          </RestaurantCard>
        ))}
      </RestaurantGrid>

      {/* ============== MODAL ЗА ASSIGN OWNER ============== */}
      {assignOwnerRestId !== null && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background: "rgba(0,0,0,0.5)",
            zIndex: 999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={closeAssignOwnerModal}
        >
          <div
            style={{
              background: "#fff",
              padding: "20px",
              borderRadius: "10px",
              width: "400px",
              maxWidth: "90%",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Assign Owner for Restaurant ID #{assignOwnerRestId}</h3>
            <p>Select a user with role="restaurant":</p>

            <select
              style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
              value={selectedUserId || ""}
              onChange={(e) => setSelectedUserId(Number(e.target.value))}
            >
              <option value="">-- select user --</option>
              {restaurantUsers.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} {u.lastname} (ID: {u.id})
                </option>
              ))}
            </select>

            <ButtonRow>
              <Button onClick={doAssignOwner} disabled={!selectedUserId}>
                Assign
              </Button>
              <Button variant="secondary" onClick={closeAssignOwnerModal}>
                Cancel
              </Button>
            </ButtonRow>
          </div>
        </div>
      )}
    </PanelContainer>
  );
};

export default AdminPanel;
