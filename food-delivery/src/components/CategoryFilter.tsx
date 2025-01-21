import React from "react";
import styled from "styled-components";

// Styled components
const FilterContainer = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;
  margin: 20px 0;
`;

const FilterButton = styled.button<{ isActive: boolean }>`
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  background-color: ${(props) => (props.isActive ? "#48BB78" : "#EDF2F7")};
  color: ${(props) => (props.isActive ? "white" : "#2D3748")};
  font-weight: ${(props) => (props.isActive ? "bold" : "normal")};
  cursor: pointer;

  &:hover {
    background-color: ${(props) => (props.isActive ? "#38A169" : "#E2E8F0")};
  }
`;

// Props за компонентата
interface CategoryFilterProps {
  categories: string[];
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  activeCategory,
  onCategoryChange,
}) => {
  return (
    <FilterContainer>
      {categories.map((category) => (
        <FilterButton
          key={category}
          isActive={activeCategory === category}
          onClick={() => onCategoryChange(category)}
        >
          {category}
        </FilterButton>
      ))}
    </FilterContainer>
  );
};

export default CategoryFilter;
