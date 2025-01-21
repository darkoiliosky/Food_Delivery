import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import RestaurantDetails from "./components/RestaurantDetails";
// import Checkout from "./pages/Checkout";
import Cart from "./pages/Cart";
import { Provider } from "react-redux";
import store from "./store/store";
import MainFooter from "./components/DownFooter";

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
        id: 3,
        name: "Burger",
        price: 450,
        image: "/images/burger.jpg",
        addons: ["Сирење", "Кулен", "Кечап"],
        category: "Burger",
      },
      {
        id: 4,
        name: "Fries",
        price: 150,
        image: "/images/fries.jpg",
        addons: ["Мајонез", "Кечап", "Сирење"],
        category: "Proba",
      },
    ],
  },
  {
    id: 3,
    name: "Burger King",
    menu: [
      {
        id: 5,
        name: "Double Burger",
        price: 550,
        image: "/images/double-burger.jpg",
        addons: ["Сирење", "Кулен", "Бекон"],
        category: "Pizza",
      },
      {
        id: 6,
        name: "Curly Fries",
        price: 200,
        image: "/images/curly-fries.jpg",
        addons: ["Чили сос", "Кечап", "Мајонез"],
        category: "Chicken",
      },
    ],
  },
  {
    id: 4,
    name: "Sushi Bar",
    menu: [
      {
        id: 7,
        name: "California Roll",
        price: 400,
        image: "/images/california-roll.jpg",
        addons: ["Авокадо", "Краставица", "Лосос"],
        category: "Pizza",
      },
      {
        id: 8,
        name: "Sashimi",
        price: 350,
        image: "/images/sashimi.jpg",
        addons: ["Туна", "Лосос", "Риба"],
        category: "Pizza",
      },
    ],
  },
  {
    id: 5,
    name: "Mexican Grill",
    menu: [
      {
        id: 9,
        name: "Такос",
        price: 220,
        image: "/images/tacos.jpg",
        addons: ["Чили", "Гуакамоле", "Сирење"],
        category: "Pizza",
      },
      {
        id: 10,
        name: "Бурито",
        price: 280,
        image: "/images/burrito.jpg",
        addons: ["Кисела павлака", "Салса", "Печено месо"],
        category: "Pizza",
      },
    ],
  },
  {
    id: 6,
    name: "Italian Bistro",
    menu: [
      {
        id: 11,
        name: "Lasagna",
        price: 400,
        image: "/images/lasagna.jpg",
        addons: ["Печен лук", "Моцарела", "Бешамел сос"],
        category: "Pizza",
      },
      {
        id: 12,
        name: "Spaghetti Bolognese",
        price: 350,
        image: "/images/spaghetti.jpg",
        addons: ["Пармезан", "Чили", "Ореви"],
        category: "Pizza",
      },
    ],
  },
  {
    id: 7,
    name: "Chinese Delight",
    menu: [
      {
        id: 13,
        name: "Sweet and Sour Chicken",
        price: 450,
        image: "/images/sweet-sour-chicken.jpg",
        addons: ["Ѓумбир", "Кориандр", "Лук"],
        category: "Pizza",
      },
      {
        id: 14,
        name: "Spring Rolls",
        price: 180,
        image: "/images/spring-rolls.jpg",
        addons: ["Чили сос", "Гао лук", "Печурки"],
        category: "Pizza",
      },
    ],
  },
  {
    id: 8,
    name: "Healthy Bites",
    menu: [
      {
        id: 15,
        name: "Grilled Chicken Salad",
        price: 350,
        image: "/images/grilled-chicken-salad.jpg",
        addons: ["Лимон", "Авокадо", "Ореви"],
        category: "Pizza",
      },
      {
        id: 16,
        name: "Quinoa Bowl",
        price: 300,
        image: "/images/quinoa-bowl.jpg",
        addons: ["Тофу", "Кикирики", "Брокули"],
        category: "Pizza",
      },
    ],
  },
  {
    id: 9,
    name: "Steakhouse",
    menu: [
      {
        id: 17,
        name: "Grilled Steak",
        price: 750,
        image: "/images/grilled-steak.jpg",
        addons: ["Бекон", "Сирење", "Чили сос"],
        category: "Pizza",
      },
      {
        id: 18,
        name: "Ribs",
        price: 800,
        image: "/images/ribs.jpg",
        addons: ["Барбекју сос", "Печен лук", "Чипс"],
        category: "Pizza",
      },
    ],
  },
  {
    id: 10,
    name: "Vegan Cafe",
    menu: [
      {
        id: 19,
        name: "Vegan Burger",
        price: 380,
        image: "/images/vegan-burger.jpg",
        addons: ["Авокадо", "Салса", "Реќа со семки"],
        category: "Pizza",
      },
      {
        id: 20,
        name: "Lentil Soup",
        price: 220,
        image: "/images/lentil-soup.jpg",
        addons: ["Црвен лук", "Морков", "Тимјан"],
        category: "Pizza",
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
            {/* <Route path="/checkout" element={<Checkout />} /> */}
            <Route path="/cart" element={<Cart />} />
          </Routes>
        </Router>
      </Provider>
      <MainFooter />
    </>
  );
};

export default App;
