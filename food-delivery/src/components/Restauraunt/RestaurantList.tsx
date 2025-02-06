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
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  padding: 20px;
  background-color: #f9f9f9;
`;

const RestaurantCard = styled.div`
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s, box-shadow 0.3s;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
  }

  img {
    width: 100%;
    height: 150px;
    object-fit: cover;
  }

  h3 {
    font-size: 1.2rem;
    color: #333;
    margin: 10px 15px;
  }

  p {
    margin: 5px 15px;
    font-size: 0.9rem;
    color: #666;
  }

  .working-hours {
    font-weight: bold;
    color: #3498db;
  }

  .details-button {
    display: block;
    width: 100%;
    text-align: center;
    margin: 15px 0;
    padding: 10px;
    background-color: #3498db;
    color: white;
    border: none;
    border-radius: 5px;
    text-decoration: none;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
      background-color: #2980b9;
    }
  }
`;

const RestaurantList: React.FC<RestaurantListProps> = ({ restaurants }) => {
  return (
    <RestaurantGrid>
      {restaurants.length > 0 ? (
        restaurants.map((restaurant) => (
          <RestaurantCard key={restaurant.id}>
            <img src={restaurant.image_url} alt={restaurant.name} />
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
