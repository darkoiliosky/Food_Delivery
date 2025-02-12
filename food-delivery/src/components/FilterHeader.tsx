import React, { useState } from "react";
import styled from "styled-components";
import RestaurantList from "./Restauraunt/RestaurantList";

const HeaderContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 20px;
  background-color: #fdfdfd;
  border-bottom: 1px solid #e2e2e2;

  @media (max-width: 768px) {
    /* За мобилна резолуција да биде наредено вертикално */
    gap: 15px;
  }
`;

const FilterButtons = styled.div`
  display: flex;
  flex-wrap: wrap;
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
`;

const SearchBox = styled.div`
  display: flex;
  justify-content: flex-end;

  input {
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    width: 240px;
    outline: none;

    &:focus {
      border-color: #3498db;
    }
  }
`;

interface Restaurant {
  id: number;
  name: string;
  cuisine: string;
  image_url: string;
  working_hours: string;
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
    // Филтер по кујна (или "All")
    const matchesFilter = filter === "All" || restaurant.cuisine === filter;
    // Пребарување по име
    const matchesSearch = restaurant.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div>
      <HeaderContainer>
        {/* Филтер копчиња */}
        <FilterButtons>
          {uniqueCuisines.map((cuisine) => (
            <button
              key={cuisine}
              className={filter === cuisine ? "active" : ""}
              onClick={() => setFilter(cuisine)}
            >
              {cuisine}
            </button>
          ))}
        </FilterButtons>

        {/* Поле за пребарување */}
        <SearchBox>
          <input
            type="text"
            placeholder="Пребарај..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </SearchBox>
      </HeaderContainer>

      {/* Прикажи ги филтрираните ресторани */}
      <RestaurantList restaurants={filteredRestaurants} />
    </div>
  );
};

export default FilterHeader;
