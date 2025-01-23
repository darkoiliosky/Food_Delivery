import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import RestaurantDetails from "./components/Restauraunt/RestaurantDetails";
// import Checkout from "./pages/Checkout";
import Cart from "./pages/Basket";
import { Provider } from "react-redux";
import store from "./store/store";
import MainFooter from "./components/DownFooter";
import RegistrationPage from "./components/RegistrationPage";
// import UserProfile from "./components/UserProfile";
import Profile from "./components/Profile";
const sampleRestaurants = [
  {
    id: 1,
    name: "La strada",
    menu: [
      {
        id: 1,
        name: "Капричиоза",
        price: 250,
        image: "/sliki/la_strada/pici/pizzakapricioza.jpg",
        addons: ["Моцарела", "Шунка", "Маслинки"],
        category: "Pizza",
        ingredients: [
          "доматно пире",
          "кашкавал",
          "шунка",
          "печурки",
          "оригано",
        ],
      },
      {
        id: 2,
        name: "Стелато",
        price: 299,
        image: "/images/pasta.jpg",
        addons: ["Чили сос", "Печурки", "Сирење"],
        category: "Pizza",
        ingredients: [
          "доматно пире",
          "кашкавал",
          "шунка",
          "печурки",
          "оригано",
        ],
      },
      {
        id: 3,
        name: "Мајонеза",
        price: 299,
        image: "/images/pasta.jpg",
        addons: ["Чили сос", "Печурки", "Сирење"],
        category: "Pizza",
        ingredients: [
          "доматно пире",
          "кашкавал",
          "шунка",
          "печурки",
          "оригано",
        ],
      },
      {
        id: 4,
        name: "Ал Фунги",
        price: 299,
        image: "/images/pasta.jpg",
        addons: ["Чили сос", "Печурки", "Сирење"],
        category: "Pizza",
        ingredients: [
          "доматно пире",
          "кашкавал",
          "шунка",
          "печурки",
          "оригано",
        ],
      },
      {
        id: 5,
        name: "Везувио",
        price: 299,
        image: "/images/pasta.jpg",
        addons: ["Чили сос", "Печурки", "Сирење"],
        category: "Pizza",
        ingredients: [
          "доматно пире",
          "кашкавал",
          "шунка",
          "печурки",
          "оригано",
        ],
      },
      {
        id: 6,
        name: "Мови",
        price: 299,
        image: "/images/pasta.jpg",
        addons: ["Чили сос", "Печурки", "Сирење"],
        category: "Pizza",
        ingredients: [
          "доматно пире",
          "кашкавал",
          "шунка",
          "печурки",
          "оригано",
        ],
      },
      {
        id: 7,
        name: "Томато",
        price: 299,
        image: "/images/pasta.jpg",
        addons: ["Чили сос", "Печурки", "Сирење"],
        category: "Pasta",
        ingredients: [
          "доматно пире",
          "кашкавал",
          "шунка",
          "печурки",
          "оригано",
        ],
      },
    ],
  },
  {
    id: 2,
    name: "Academy",
    menu: [
      {
        id: 8,
        name: "Burger",
        price: 450,
        image: "/images/burger.jpg",
        addons: ["Сирење", "Кулен", "Кечап"],
        category: "Burger",
        ingredients: [
          "доматно пире",
          "кашкавал",
          "шунка",
          "печурки",
          "оригано",
        ],
      },
      {
        id: 9,
        name: "Fries",
        price: 150,
        image: "/images/fries.jpg",
        addons: ["Мајонез", "Кечап", "Сирење"],
        category: "Proba",
        ingredients: [
          "доматно пире",
          "кашкавал",
          "шунка",
          "печурки",
          "оригано",
        ],
      },
    ],
  },
  {
    id: 3,
    name: "Burger King",
    menu: [
      {
        id: 10,
        name: "Double Burger",
        price: 550,
        image: "/images/double-burger.jpg",
        addons: ["Сирење", "Кулен", "Бекон"],
        category: "Pizza",
        ingredients: [
          "доматно пире",
          "кашкавал",
          "шунка",
          "печурки",
          "оригано",
        ],
      },
      {
        id: 11,
        name: "Curly Fries",
        price: 200,
        image: "/images/curly-fries.jpg",
        addons: ["Чили сос", "Кечап", "Мајонез"],
        category: "Chicken",
        ingredients: [
          "доматно пире",
          "кашкавал",
          "шунка",
          "печурки",
          "оригано",
        ],
      },
    ],
  },
  {
    id: 4,
    name: "Sushi Bar",
    menu: [
      {
        id: 12,
        name: "California ",
        price: 400,
        image: "/images/california-roll.jpg",
        addons: ["Авокадо", "Краставица", "Лосос"],
        category: "Pizza",
        ingredients: [
          "доматно пире",
          "кашкавал",
          "шунка",
          "печурки",
          "оригано",
        ],
      },
      {
        id: 13,
        name: "Sashimi",
        price: 350,
        image: "/images/sashimi.jpg",
        addons: ["Туна", "Лосос", "Риба"],
        category: "Pizza",
        ingredients: [
          "доматно пире",
          "кашкавал",
          "шунка",
          "печурки",
          "оригано",
        ],
      },
    ],
  },
  {
    id: 5,
    name: "Mexican Grill",
    menu: [
      {
        id: 14,
        name: "Такос",
        price: 220,
        image: "/images/tacos.jpg",
        addons: ["Чили", "Гуакамоле", "Сирење"],
        category: "Pizza",
        ingredients: [
          "доматно пире",
          "кашкавал",
          "шунка",
          "печурки",
          "оригано",
        ],
      },
      {
        id: 15,
        name: "Ловечка  ",
        price: 280,
        image: "/images/burrito.jpg",
        addons: ["Кисела павлака", "Салса", "Печено месо"],
        category: "Pizza",
        ingredients: [
          "доматно пире",
          "кашкавал",
          "шунка",
          "печурки",
          "оригано",
        ],
      },
    ],
  },
  {
    id: 6,
    name: "Кермес",
    menu: [
      {
        id: 16,
        name: "Ловечка",
        price: 400,
        image: "/images/lasagna.jpg",
        addons: ["Печен лук", "Моцарела", "Бешамел сос"],
        category: "Pizza",
        ingredients: ["шунка", "кашкавал", "оригано", "печурки"],
      },
      {
        id: 17,
        name: "Spaghetti Bolognese",
        price: 350,
        image: "/images/spaghetti.jpg",
        addons: ["Пармезан", "Чили", "Ореви"],
        category: "Pizza",
        ingredients: ["шунка", "кашкавал", "оригано", "печурки"],
      },
    ],
  },
  {
    id: 7,
    name: "Кермес",
    menu: [
      {
        id: 18,
        name: "Ловечка",
        price: 450,
        image: "/images/sweet-sour-chicken.jpg",
        addons: ["Ѓумбир", "Кориандр", "Лук"],
        category: "Скара",
        ingredients: ["Амур 300гр, кашкавал 50гр"],
      },
      {
        id: 19,
        name: "Spring Rolls",
        price: 180,
        image: "/images/spring-rolls.jpg",
        addons: ["Чили сос", "Гао лук", "Печурки"],
        category: "Скара",
        ingredients: ["шунка", "кашкавал", "оригано", "печурки"],
      },
    ],
  },
  {
    id: 8,
    name: "Healthy Bites",
    menu: [
      {
        id: 20,
        name: "Grilled Chicken Salad",
        price: 350,
        image: "/images/grilled-chicken-salad.jpg",
        addons: ["Лимон", "Авокадо", "Ореви"],
        category: "Pizza",
        ingredients: [
          "доматно пире",
          "кашкавал",
          "шунка",
          "печурки",
          "оригано",
        ],
      },
      {
        id: 21,
        name: "Quinoa Bowl",
        price: 300,
        image: "/images/quinoa-bowl.jpg",
        addons: ["Тофу", "Кикирики", "Брокули"],
        category: "Печен сендвич",
        ingredients: [
          "доматно пире",
          "кашкавал",
          "шунка",
          "печурки",
          "оригано",
        ],
      },
    ],
  },
  {
    id: 9,
    name: "Steakhouse",
    menu: [
      {
        id: 22,
        name: "Grilled Steak",
        price: 750,
        image: "/images/grilled-steak.jpg",
        addons: ["Бекон", "Сирење", "Чили сос"],
        category: "Pizza",
        ingredients: [
          "доматно пире",
          "кашкавал",
          "шунка",
          "печурки",
          "оригано",
        ],
      },
      {
        id: 23,
        name: "Ribs",
        price: 800,
        image: "/images/ribs.jpg",
        addons: ["Барбекју сос", "Печен лук", "Чипс"],
        category: "Pizza",
        ingredients: [
          "доматно пире",
          "кашкавал",
          "шунка",
          "печурки",
          "оригано",
        ],
      },
    ],
  },
  {
    id: 10,
    name: "Vegan Cafe",
    menu: [
      {
        id: 24,
        name: "Vegan Burger",
        price: 380,
        image: "/images/vegan-burger.jpg",
        addons: ["Авокадо", "Салса", "Реќа со семки"],
        category: "Pizza",
        ingredients: [
          "доматно пире",
          "кашкавал",
          "шунка",
          "печурки",
          "оригано",
        ],
      },
      {
        id: 25,
        name: "Ловечка",
        price: 220,
        image: "/images/lentil-soup.jpg",
        addons: ["Црвен лук", "Морков", "Тимјан"],
        category: "Ловечка",
        ingredients: ["250гр месо, кашкавал 50 гр"],
      },
    ],
  },
];

const App: React.FC = () => {
  return (
    <>
      <Provider store={store}>
        <Router>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route
              path="/restaurants/:id"
              element={<RestaurantDetails restaurants={sampleRestaurants} />}
            />
            <Route path="/register" element={<RegistrationPage />} />
            <Route path="/cart" element={<Cart />} />
            {/* <Route path="/profile" element={<UserProfile />} />{" "} */}
            <Route path="/profile" element={<Profile />} />
          </Routes>
        </Router>
      </Provider>
      <MainFooter />
    </>
  );
};

export default App;
