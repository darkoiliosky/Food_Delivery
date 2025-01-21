import { Link } from "react-router-dom";
import styled from "styled-components";
import { FaClock, FaTruck } from "react-icons/fa";
import { parse, format, isWithinInterval } from "date-fns";

// Функција за проверка дали ресторанот е отворен
const isRestaurantOpen = (workingHours: string): boolean => {
  const [openTime, closeTime] = workingHours.split(" - ");
  const now = new Date();

  const currentTime = parse(format(now, "HH:mm"), "HH:mm", new Date());
  const open = parse(openTime, "HH:mm", new Date());
  const close = parse(closeTime, "HH:mm", new Date());

  // Ако времето на затворање е помало од времето на отворање, значи ресторанот работи преку полноќ
  const interval =
    close < open
      ? { start: open, end: parse("23:59", "HH:mm", new Date()) }
      : { start: open, end: close };

  return isWithinInterval(currentTime, interval);
};
const StyledCard = styled.div`
  background-color: #f0f8ff;
  border-radius: 15px;
  /* padding: 16px; */
  transition: transform 0.3s, box-shadow 0.3s;
  border: 1px solid #eaeaea;
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
  width: calc(25% - 20px);
  cursor: pointer;
  height: 460px;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 12px 20px rgba(0, 0, 0, 0.2);
  }

  .image-container {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-bottom: 10px;

    img {
      width: 90%; /* Приспособена ширина */
      height: 180px;
      object-fit: cover;
      border-radius: 10px;
    }
  }

  .working-hours {
    background-color: #f9f9f9;
    padding: 10px;
    border-radius: 10px;
    font-size: 14px;
    color: #555555;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    justify-content: center;

    .icon {
      margin-right: 8px;
      color: #3498db;
    }
  }

  h2 {
    font-size: 18px;
    font-weight: bold;
    color: #333333;
    margin: 10px 0;
    text-align: center; /* Центриран текст */
  }

  .times-wrap {
    display: flex;
    justify-content: space-between;
    margin-bottom: 10px;

    .wrap-time,
    .wrap-delivery {
      display: flex;
      align-items: center;
      font-size: 14px;
      color: #7d7d7d;

      .icon {
        margin-right: 8px;
        color: #3498db;
      }
    }
  }

  p {
    font-size: 14px;
    color: #555555;
    margin-bottom: 15px;
    text-align: center; /* Центриран текст */
  }

  hr {
    width: 100%;
    margin: 10px 0;
    border: none;
    border-top: 1px solid #eaeaea;
  }

  a {
    display: inline-block;
    font-size: 14px;
    text-decoration: none;
    color: #1abc9c;
    font-weight: bold;
    transition: color 0.3s;

    &:hover {
      color: #16a085;
    }
  }

  @media (max-width: 1024px) {
    width: calc(33.33% - 20px);
  }

  @media (max-width: 768px) {
    width: calc(50% - 20px);
  }

  @media (max-width: 480px) {
    width: calc(100% - 20px);
  }
`;

const CardContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  max-width: 2000px;
  margin: auto;
  justify-content: space-evenly; /* Подеднакво растојание меѓу картичките */
  padding: 20px;
  /* height: 460px; */

  @media (max-width: 768px) {
    gap: 15px;
    padding: 10px;
  }
`;

interface Restaurant {
  id: number;
  name: string;
  cuisine: string;
  imageUrl: string;
  workingHours: string; // Додадено поле за работно време
}

interface RestaurantListProps {
  restaurants: Restaurant[];
}

const RestaurantList: React.FC<RestaurantListProps> = ({ restaurants }) => {
  return (
    <CardContainer>
      {restaurants.map((restaurant) => {
        const isOpen = isRestaurantOpen(restaurant.workingHours);

        return (
          <StyledCard key={restaurant.id}>
            <h2
              style={{
                backgroundColor: "#F9F9F9",
                margin: "0px",
                paddingBottom: "8px",
                fontSize: "25px",
                // color: "gray",
              }}
            >
              {restaurant.name}
            </h2>

            <Link
              style={{
                display: "flex",
                justifyContent: "center",
                backgroundColor: "#F9F9F9",
              }}
              to={`/restaurants/${restaurant.id}`}
            >
              <img
                src={restaurant.imageUrl}
                alt={restaurant.name}
                style={{ width: "300px", height: "250px" }}
              />
            </Link>
            <div className="working-hours">
              <FaClock
                className="icon"
                style={{ color: isOpen ? "#34db5e" : "red" }} // Сина ако е отворено, црвена ако е затворено
              />
              {restaurant.workingHours}
            </div>
            <div className="times-wrap">
              <div className="wrap-time">
                <FaClock className="icon" style={{ fontSize: "25px" }} /> 15-30
                мин.
              </div>
              <div className="wrap-delivery">
                <FaTruck className="icon" style={{ fontSize: "25px" }} /> 90
                ден.
              </div>
            </div>
            <p style={{ fontSize: "19px" }}>{restaurant.cuisine}</p>
            <hr />
            <Link to={`/restaurants/${restaurant.id}`}>Повеќе детали</Link>
          </StyledCard>
        );
      })}
    </CardContainer>
  );
};

export default RestaurantList;
