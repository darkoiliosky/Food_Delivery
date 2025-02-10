import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom"; // Додади Link од React Router

interface Restaurant {
  id: number;
  name: string;
  cuisine: string;
  image_url: string; // Останува image_url од backend
  working_hours: string;
}

interface RestaurantListProps {
  restaurants: Restaurant[];
}

const RestaurantGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  padding: 20px;
  background-color: #f4f4f4;
`;

const RestaurantCard = styled.div`
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out;

  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
  }

  img {
    width: 100%;
    height: 180px;
    object-fit: cover;
    transition: transform 0.3s ease-in-out;

    &:hover {
      transform: scale(1.05);
    }
  }

  h3 {
    font-size: 1.4rem;
    font-weight: bold;
    color: #222;
    margin: 15px 20px;
  }

  p {
    margin: 5px 20px;
    font-size: 1rem;
    color: #555;
  }

  .working-hours {
    font-weight: bold;
    color: #e74c3c;
    font-size: 1rem;
  }

  .details-button {
    display: block;
    width: calc(100% - 40px);
    text-align: center;
    margin: 15px auto;
    padding: 12px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 8px;
    text-decoration: none;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.3s, transform 0.2s ease-in-out;

    &:hover {
      background-color: #2980b9;
      transform: scale(1.05);
    }
  }
`;

const RestaurantList: React.FC<RestaurantListProps> = ({ restaurants }) => {
  return (
    <RestaurantGrid>
      {restaurants.length > 0 ? (
        restaurants.map((restaurant) => (
          <RestaurantCard key={restaurant.id}>
            <img
              src={`http://localhost:5000${restaurant.image_url}`}
              alt={restaurant.name}
              onError={(e) => {
                e.currentTarget.src = "/placeholder.jpg"; // Ако сликата не постои, користи default placeholder
              }}
            />{" "}
            <h3>{restaurant.name}</h3>
            <p>{restaurant.cuisine}</p>
            <p className="working-hours">{restaurant.working_hours}</p>
            <Link
              to={`/restaurants/${restaurant.id}`} // Линкот за детали
              className="details-button"
            >
              Повеќе детали
            </Link>
          </RestaurantCard>
        ))
      ) : (
        <p>Нема резултати за прикажување.</p>
      )}
    </RestaurantGrid>
  );
};

export default RestaurantList;
