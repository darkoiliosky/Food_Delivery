import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import styled from "styled-components";

interface Order {
  id: number;
  status: string;
  total_price: number;
}

const Container = styled.div`
  max-width: 800px;
  margin: 40px auto;
  padding: 20px;
  background: white;
  border-radius: 10px;
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
  &:hover {
    background-color: #217dbb;
  }
`;

const CompleteButton = styled.button`
  padding: 8px 12px;
  background-color: #2ecc71;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  &:hover {
    background-color: #27ae60;
  }
`;

const MyDeliveries: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Проверка дали корисникот е "delivery"
  useEffect(() => {
    const checkRole = async () => {
      try {
        const resp = await axios.get<{ role: string }>(
          "http://localhost:5000/me",
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          }
        );
        if (resp.data.role !== "delivery") {
          navigate("/");
        }
      } catch (err) {
        console.error("Error checking role:", err);
        navigate("/");
      }
    };
    checkRole();
  }, [navigate]);

  // Функција за вчитување на нарачки
  const fetchOrders = async () => {
    setLoading(true);
    try {
      const resp = await axios.get<Order[]>("http://localhost:5000/orders", {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      setOrders(resp.data);
    } catch (error) {
      console.error("❌ Error fetching deliveries:", error);
    }
    setLoading(false);
  };

  // Превземање на нарачките при вчитување на страната
  useEffect(() => {
    fetchOrders();
  }, []);

  // Прифаќање на нарачка -> статус: "Во достава"
  const handleAcceptOrder = async (orderId: number) => {
    try {
      await axios.put(
        `http://localhost:5000/orders/${orderId}/status`,
        { status: "Во достава" },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      alert("✅ Успешно ја прифативте нарачката! (Во достава)");
      fetchOrders(); // Освежи ја листата на нарачки
    } catch (error) {
      console.error("❌ Грешка при прифаќање нарачка:", error);
      alert("Не може да се прифати!");
    }
  };

  // Испорака -> статус: "Испорачана"
  const markAsDelivered = async (orderId: number) => {
    try {
      await axios.put(
        `http://localhost:5000/orders/${orderId}/status`,
        { status: "Испорачана" },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );
      alert("✅ Нарачката е успешно испорачана!");
      fetchOrders(); // Освежи ја листата на нарачки
    } catch (error) {
      console.error("❌ Error finishing order:", error);
      alert("Неуспешно ажурирање на статусот.");
    }
  };

  return (
    <Container>
      <Title>🚚 Достапни Нарачки</Title>
      {loading ? (
        <p>Вчитување...</p>
      ) : orders.length === 0 ? (
        <p>Нема достапни нарачки.</p>
      ) : (
        <OrderList>
          {orders.map((order) => (
            <OrderItem key={order.id}>
              <div>
                <p>
                  <strong>Нарачка #{order.id}</strong>
                </p>
                <p>
                  <strong>Статус:</strong> {order.status}
                </p>
                <p>
                  <strong>Цена:</strong> {order.total_price} ден.
                </p>
              </div>

              {/* Ако е „Во подготовка“ или „Завршена“ => Прифати, ако е „Во достава“ => Испорачај */}
              {["Завршена", "Во подготовка"].includes(order.status) && (
                <AcceptButton onClick={() => handleAcceptOrder(order.id)}>
                  Прими Нарачка
                </AcceptButton>
              )}
              {order.status === "Во достава" && (
                <CompleteButton onClick={() => markAsDelivered(order.id)}>
                  Испорачај
                </CompleteButton>
              )}
            </OrderItem>
          ))}
        </OrderList>
      )}
    </Container>
  );
};

export default MyDeliveries;
