import FilterHeader from "../components/FilterHeader";

interface Restaurant {
  id: number;
  name: string;
  cuisine: string;
  image_url: string;
  working_hours: string;
}

interface HomeProps {
  restaurants: Restaurant[];
}

const Home: React.FC<HomeProps> = ({ restaurants }) => {
  return (
    <div className="p-4">
      <FilterHeader restaurants={restaurants} />
    </div>
  );
};

export default Home;
