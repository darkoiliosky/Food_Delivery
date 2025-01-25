import FilterHeader from "../components/FilterHeader";

interface Restaurant {
  id: number;
  name: string;
  cuisine: string;
  imageUrl: string;
  workingHours: string;
}

interface HomeProps {
  restaurants: Restaurant[]; // Прими рестораните како проп
}

const Home: React.FC<HomeProps> = ({ restaurants }) => {
  return (
    <div className="p-4">
      <FilterHeader restaurants={restaurants} />
    </div>
  );
};

export default Home;
