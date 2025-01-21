import React, { useState } from "react";
import styled from "styled-components";
import RestaurantList from "../components/RestaurantList";

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  background-color: #f9f9f9;
  padding: 20px;
  border-bottom: 1px solid #eaeaea;

  .buttons {
    display: flex;
    gap: 10px;

    button {
      padding: 10px 15px;
      border: none;
      border-radius: 5px;
      background-color: #3498db;
      color: #ffffff;
      cursor: pointer;
      transition: background-color 0.3s;

      &:hover {
        background-color: #2980b9;
      }

      &.active {
        background-color: #1abc9c;
      }
    }
  }

  .search {
    input {
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
      width: 200px;
      outline: none;

      &:focus {
        border-color: #3498db;
      }
    }
  }
`;

interface Restaurant {
  id: number;
  name: string;
  cuisine: string;
  imageUrl: string;
  workingHours: string;
}

interface HeaderProps {
  restaurants: Restaurant[];
}

const FilterHeader: React.FC<HeaderProps> = ({ restaurants }) => {
  const [filter, setFilter] = useState<string>("All");
  const [searchTerm, setSearchTerm] = useState<string>("");

  // Добиј уникатни типови кујни
  const uniqueCuisines = [
    "All",
    ...Array.from(new Set(restaurants.map((r) => r.cuisine))),
  ];

  const filteredRestaurants = restaurants.filter((restaurant) => {
    const matchesFilter = filter === "All" || restaurant.cuisine === filter;
    const matchesSearch = restaurant.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div>
      <Header>
        <div className="buttons">
          {uniqueCuisines.map((cuisine) => (
            <button
              key={cuisine}
              className={filter === cuisine ? "active" : ""}
              onClick={() => setFilter(cuisine)}
            >
              {cuisine}
            </button>
          ))}
        </div>
        <div className="search">
          <input
            type="text"
            placeholder="Пребарај..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </Header>
      <RestaurantList restaurants={filteredRestaurants} />
    </div>
  );
};

export default FilterHeader;
