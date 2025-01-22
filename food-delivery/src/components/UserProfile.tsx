import axios from "axios";
import { useEffect, useState } from "react";

// Дефинирај тип за корисничките податоци
interface User {
  name: string;
  email: string;
  phone: string;
}

const UserProfile = () => {
  // Користиме User тип за state
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    axios
      .get("http://localhost:5000/api/user/profile") // Патеката до твојот Express сервер
      .then((response) => {
        setUser(response.data); // Спремање на податоците од серверот
      })
      .catch((error) => {
        console.error("There was an error fetching the user profile!", error);
      });
  }, []);

  if (!user) return <p>Loading...</p>;

  return (
    <div>
      <h1>Profile</h1>
      <p>Name: {user.name}</p>
      <p>Email: {user.email}</p>
      <p>Phone: {user.phone}</p>
    </div>
  );
};

export default UserProfile;
