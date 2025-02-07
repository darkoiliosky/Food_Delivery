import { useState, useEffect } from "react";
import axios from "axios";
import styled from "styled-components";
// ✅ Интерфејс за ресторан
interface Restaurant {
  id: number;
  name: string;
  cuisine: string;
  image_url: string;
  working_hours: string;
}
const PanelContainer = styled.div`
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  background: #f8f9fa;
  border-radius: 10px;
  box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);
`;

const FormContainer = styled.form`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 10px;
  background: white;
  border-radius: 8px;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
`;

const Input = styled.input`
  padding: 8px;
  font-size: 16px;
  border: 1px solid #ccc;
  border-radius: 5px;
`;

const Button = styled.button`
  padding: 10px;
  font-size: 16px;
  background: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;

  &:hover {
    background: #0056b3;
  }
`;

const RestaurantCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: white;
  padding: 10px;
  border-radius: 8px;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.1);
  margin-top: 10px;
`;

const Image = styled.img`
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 5px;
  border: 1px solid #ddd;
`;

const AdminPanel = () => {
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [newRestaurant, setNewRestaurant] = useState({
    name: "",
    cuisine: "",
    working_hours: "",
    imageFile: null as File | null, // ✅ Додавање на `File`
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

  // ✅ Функција за промена на слика
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setNewRestaurant({ ...newRestaurant, imageFile: e.target.files[0] });
    }
  };

  // ✅ Подобрена `handleAddRestaurant`
  const handleAddRestaurant = async (e: React.FormEvent) => {
    e.preventDefault(); // ✅ Спречи refresh

    try {
      const formData = new FormData();
      formData.append("name", newRestaurant.name);
      formData.append("cuisine", newRestaurant.cuisine);
      formData.append("working_hours", newRestaurant.working_hours);

      if (newRestaurant.imageFile) {
        formData.append("image", newRestaurant.imageFile); // ✅ Додавање на слика
      }

      await axios.post("http://localhost:5000/restaurants", formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "multipart/form-data",
        },
      });

      fetchRestaurants();
      setNewRestaurant({
        name: "",
        cuisine: "",
        working_hours: "",
        imageFile: null,
      }); // ✅ Чистење на формата
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
    <PanelContainer>
      <h2>Admin Panel</h2>
      <FormContainer
        onSubmit={handleAddRestaurant}
        encType="multipart/form-data"
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

      <h3>Existing Restaurants:</h3>
      {restaurants.map((r) => (
        <RestaurantCard key={r.id}>
          <div>
            <h4>{r.name}</h4>
            <p>Cuisine: {r.cuisine}</p>
            <p>Working Hours: {r.working_hours}</p>
          </div>
          {r.image_url && (
            <Image src={`http://localhost:5000${r.image_url}`} alt={r.name} />
          )}
          <Button onClick={() => handleDeleteRestaurant(r.id)}>Delete</Button>
        </RestaurantCard>
      ))}
    </PanelContainer>
  );
};

export default AdminPanel;
