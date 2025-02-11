import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styled from "styled-components";

// Типови за Order
interface Order {
  id: number;
  status: string;
  total_price: number;
}

// Styled компоненти
const Container = styled.div`
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  text-align: center;
  color: #2c3e50;
`;

const OrderList = styled.ul`
  list-style: none;
  padding: 0;
`;

const OrderItem = styled.li`
  padding: 12px;
  margin-bottom: 10px;
  background: #f7f9fc;
  border-radius: 8px;
  border-left: 5px solid #3498db;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const AcceptButton = styled.button`
  padding: 8px 12px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background-color 0.3s;
  &:hover {
    background-color: #217dbb;
  }
`;
const Button = styled.button`
  padding: 8px 12px;
  background-color: #2ecc71; /* Зелена боја за доставено */
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.3s;
  &:hover {
    background-color: #27ae60; /* Потемна зелена при hover */
  }
`;

const MyDeliveries: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkRole = async () => {
      try {
        const response = await axios.get("http://localhost:5000/me", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        const data = response.data as { role: string };
        if (data.role !== "delivery") {
          navigate("/"); // Ако не е доставувач, пренасочи го
        }
      } catch (error) {
        console.error("Error checking role:", error);
        navigate("/"); // Ако има грешка, врати го на почетна
      }
    };

    checkRole();
  }, [navigate]);

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const response = await axios.get<Order[]>(
          "http://localhost:5000/orders",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        setOrders(response.data);
      } catch (error) {
        console.error("❌ Error fetching deliveries:", error);
      }
      setLoading(false);
    };

    fetchOrders();
  }, []);

  const handleAcceptOrder = async (orderId: number) => {
    try {
      await axios.put(
        `http://localhost:5000/orders/${orderId}/accept`,
        {},
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      alert("✅ Успешно ја прифативте нарачката!");

      // ✅ Локално ажурирање на статусот
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: "Во достава" } : order
        )
      );
    } catch (error) {
      console.error("❌ Грешка при прифаќање нарачка:", error);
    }
  };

  const markAsDelivered = async (orderId: number) => {
    try {
      await axios.put(
        `http://localhost:5000/orders/${orderId}/status`,
        { status: "Завршена" },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );
      alert("Нарачката е успешно означена како Завршена!");

      // ✅ Локално ажурирање на статусот без рефреш
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: "Завршена" } : order
        )
      );
    } catch (error) {
      console.error("❌ Грешка при ажурирање на статус:", error);
      alert("Неуспешно ажурирање на статусот.");
    }
  };

  return (
    <Container>
      <Title>🚚 Достапни Нарачки</Title>
      {loading ? (
        <p style={{ textAlign: "center", color: "#7f8c8d" }}>Вчитување...</p>
      ) : orders.length === 0 ? (
        <p style={{ textAlign: "center", color: "#7f8c8d" }}>
          Нема достапни нарачки.
        </p>
      ) : (
        <OrderList>
          {orders.map((order) => (
            <OrderItem key={order.id}>
              <div>
                <p>
                  <strong>Нарачка #{order.id}</strong>
                </p>
                <p>
                  📌 <strong>Статус:</strong> {order.status}
                </p>
                <p>
                  💰 <strong>Цена:</strong> {order.total_price} ден.
                </p>
              </div>
              {order.status === "Примена" && (
                <AcceptButton onClick={() => handleAcceptOrder(order.id)}>
                  🚚 Прими Нарачка
                </AcceptButton>
              )}
              {order.status === "Во достава" && (
                <Button onClick={() => markAsDelivered(order.id)}>
                  Означи како доставено
                </Button>
              )}
            </OrderItem>
          ))}
        </OrderList>
      )}
    </Container>
  );
};

export default MyDeliveries;
