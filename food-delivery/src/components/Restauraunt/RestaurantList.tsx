import React from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";

interface Restaurant {
  id: number;
  name: string;
  cuisine: string;
  image_url: string;
  working_hours: string;
}

interface RestaurantListProps {
  restaurants: Restaurant[];
}

const Container = styled.div`
  padding: 20px;
  background-color: #f7f7f7;
`;

const RestaurantGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 24px;
  max-width: 1200px;
  margin: 0 auto;

  @media (max-width: 768px) {
    /* За мобилна резолуција - колони 1 или 2 */
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  }
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
    height: 160px;
    object-fit: cover;
    transition: transform 0.3s ease-in-out;

    &:hover {
      transform: scale(1.05);
    }
  }
`;

const CardInfo = styled.div`
  padding: 15px 20px;

  h3 {
    font-size: 1.2rem;
    font-weight: bold;
    color: #2c3e50;
    margin-bottom: 5px;
    text-transform: capitalize;
  }

  p {
    font-size: 0.95rem;
    color: #555;
    margin-bottom: 5px;

    &.working-hours {
      font-weight: bold;
      color: #e74c3c;
    }
  }

  .details-button {
    display: inline-block;
    margin-top: 10px;
    padding: 10px 20px;
    background-color: #3498db;
    color: #fff;
    border-radius: 8px;
    font-weight: bold;
    text-decoration: none;
    transition: background-color 0.3s, transform 0.2s ease-in-out;

    &:hover {
      background-color: #2980b9;
      transform: scale(1.03);
    }
  }
`;

const RestaurantList: React.FC<RestaurantListProps> = ({ restaurants }) => {
  return (
    <Container>
      {restaurants.length > 0 ? (
        <RestaurantGrid>
          {restaurants.map((restaurant) => (
            <RestaurantCard key={restaurant.id}>
              <img
                src={`http://localhost:5000${restaurant.image_url}`}
                alt={restaurant.name}
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.jpg"; // fallback
                }}
              />
              <CardInfo>
                <h3>{restaurant.name}</h3>
                <p>{restaurant.cuisine}</p>
                <p className="working-hours">{restaurant.working_hours}</p>
                <Link
                  to={`/restaurants/${restaurant.id}`}
                  className="details-button"
                >
                  Повеќе детали
                </Link>
              </CardInfo>
            </RestaurantCard>
          ))}
        </RestaurantGrid>
      ) : (
        <p style={{ textAlign: "center", marginTop: "40px" }}>
          Нема резултати за прикажување.
        </p>
      )}
    </Container>
  );
};

export default RestaurantList;
