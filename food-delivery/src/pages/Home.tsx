// import RestaurantList from "../components/RestaurantList";
import styled from "styled-components";
import FilterHeader from "../components/FilterHeader";
const H1StyledTitle = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: cadetblue;
  font-size: 30px;
`;
interface Restaurant {
  id: number;
  name: string;
  cuisine: string;
  imageUrl: string;
  workingHours: string;
}

const Home: React.FC = () => {
  const restaurants: Restaurant[] = [
    {
      id: 2,
      name: "Academy",
      cuisine: "Ресторан",
      imageUrl: "/sliki/logo/academyLogo.png",
      workingHours: "09:00 - 22:00",
    },
    {
      id: 3,
      name: "La Piazza",
      cuisine: "Ресторан",
      imageUrl: "/sliki/logo/LaPiazzaLogo.jpg",
      workingHours: "09:00 - 22:00",
    },
    {
      id: 1,
      name: "La strada",
      cuisine: "Ресторан",
      imageUrl: "/sliki/logo/LaStradaLogo.jpg",
      workingHours: "09:00 - 00:00",
    },
    // {
    //   id: 5,
    //   name: "Paradiso",
    //   cuisine: "Брза храна",
    //   imageUrl: "/sliki/logo/ParadisoLogo.jpg",
    //   workingHours: "09:00 - 22:00",
    // },
    {
      id: 6,
      name: "Papo",
      cuisine: "Брза храна",
      imageUrl: "/sliki/logo/PapoLogo.jpg",
      workingHours: "09:00 - 22:00",
    },
    {
      id: 4,
      name: "City Garden",
      cuisine: "Брза храна",
      imageUrl: "/sliki/logo/CityGardenLogo.jpg",
      workingHours: "09:00 - 22:00",
    },
    {
      id: 7,
      name: "Kermes",
      cuisine: "Кафана",
      imageUrl: "/sliki/logo/KermesLogo.jpg",
      workingHours: "09:00 - 00:00",
    },
  ];

  return (
    <div className="p-4">
      <H1StyledTitle className="text-3xl font-bold text-center mb-8">
        <span style={{ width: "100%" }}>
          <img
            src="/sliki/logo/PoracajJadiLogo.png"
            alt="Logo"
            style={{ width: "100%", height: "500px" }}
          />
        </span>
      </H1StyledTitle>
      <FilterHeader restaurants={restaurants} />
      {/* <RestaurantList restaurants={restaurants} /> */}
    </div>
  );
};

export default Home;
