import { useState, useEffect } from "react";
import axios from "axios";

// ✅ Додај интерфејс за ресторан
interface Restaurant {
  id: number;
  name: string;
  cuisine: string;
  image_url: string;
  working_hours: string;
}

const AdminPanel = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]); // ✅ Дефинирање тип
  const [newRestaurant, setNewRestaurant] = useState<Restaurant>({
    id: 0, // ID може да биде автоматски генериран од backend, но TypeScript бара да постои
    name: "",
    cuisine: "",
    image_url: "",
    working_hours: "",
  });

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await axios.get<Restaurant[]>(
        "http://localhost:5000/restaurants"
      );
      setRestaurants(response.data);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    }
  };

  const handleAddRestaurant = async () => {
    try {
      const restaurantData = {
        name: newRestaurant.name,
        cuisine: newRestaurant.cuisine,
        image_url: newRestaurant.image_url, // ✅ Променето од `imageUrl` во `image_url`
        working_hours: newRestaurant.working_hours, // ✅ Променето од `workingHours` во `working_hours`
      };

      await axios.post("http://localhost:5000/restaurants", restaurantData, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });

      fetchRestaurants();
    } catch (error) {
      console.error("Error adding restaurant:", error);
    }
  };

  const handleDeleteRestaurant = async (id: number) => {
    try {
      await axios.delete(`http://localhost:5000/restaurants/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      fetchRestaurants();
    } catch (error) {
      console.error("Error deleting restaurant:", error);
    }
  };

  return (
    <div>
      <h2>Admin Panel</h2>
      <input
        type="text"
        placeholder="Name"
        onChange={(e) =>
          setNewRestaurant({ ...newRestaurant, name: e.target.value })
        }
      />
      <input
        type="text"
        placeholder="Cuisine"
        onChange={(e) =>
          setNewRestaurant({ ...newRestaurant, cuisine: e.target.value })
        }
      />
      <input
        type="text"
        placeholder="Image URL"
        onChange={(e) =>
          setNewRestaurant({ ...newRestaurant, image_url: e.target.value })
        }
      />
      <input
        type="text"
        placeholder="Working Hours"
        onChange={(e) =>
          setNewRestaurant({ ...newRestaurant, working_hours: e.target.value })
        }
      />
      <button onClick={handleAddRestaurant}>Add Restaurant</button>

      <h3>Existing Restaurants:</h3>
      {restaurants.map((r) => (
        <div key={r.id}>
          {r.name}{" "}
          <button onClick={() => handleDeleteRestaurant(r.id)}>Delete</button>
        </div>
      ))}
    </div>
  );
};

export default AdminPanel;
