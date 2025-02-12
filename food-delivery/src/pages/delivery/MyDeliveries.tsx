import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Title,
  OrderList,
  OrderItem,
  AcceptButton,
  CompleteButton,
  StatusTag,
  Message,
} from "./MyDeliveries.styles.";

// ✅ Поправен import
interface Order {
  id: number;
  status: string;
  total_price: number;
  delivery_id?: number | null;
}

const MyDeliveries: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Проверка дали корисникот е "delivery"
  useEffect(() => {
    const checkRole = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          navigate("/");
          return;
        }

        const resp = await axios.get<{ role: string }>(
          "http://localhost:5000/me",
          {
            headers: {
              Authorization: `Bearer ${token}`,
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
      console.log("🚚 Превземам нарачки...");

      const token = localStorage.getItem("token");
      if (!token) {
        console.error("❌ Нема токен! Пренасочувам...");
        navigate("/");
        return;
      }

      const resp = await axios.get("http://localhost:5000/my-deliveries", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("📦 Добиени нарачки:", resp.data);
      setOrders(resp.data as Order[]);
    } catch (error) {
      console.error("❌ Грешка при земање на нарачки:", error);
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
      const token = localStorage.getItem("token");
      if (!token) {
        alert("❌ Немате токен! Најавете се повторно.");
        return;
      }

      await axios.put(
        `http://localhost:5000/orders/${orderId}/accept`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("✅ Успешно ја прифативте нарачката!");
      fetchOrders(); // Освежи ја листата на нарачки
    } catch (error) {
      console.error("❌ Грешка при прифаќање нарачка:", error);
      alert("Не може да се прифати!");
    }
  };

  // Испорака -> статус: "Испорачана"
  const markAsDelivered = async (orderId: number) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("❌ Немате токен! Најавете се повторно.");
        return;
      }

      await axios.put(
        `http://localhost:5000/orders/${orderId}/status`,
        { status: "Испорачана" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      alert("✅ Нарачката е успешно испорачана!");
      fetchOrders(); // Освежи ја листата на нарачки
    } catch (error) {
      console.error("❌ Грешка при ажурирање на статусот:", error);
      alert("Неуспешно ажурирање на статусот.");
    }
  };

  return (
    <Container>
      <Title>🚚 Достапни Нарачки</Title>

      {loading ? (
        <Message>🔄 Вчитување на нарачките...</Message>
      ) : orders.length === 0 ? (
        <Message>📭 Нема достапни нарачки во моментов.</Message>
      ) : (
        <OrderList>
          {orders.map((order) => (
            <OrderItem key={order.id}>
              <div>
                <p>
                  <strong>Нарачка #{order.id}</strong>
                </p>
                <p>
                  <strong>Статус:</strong>{" "}
                  <StatusTag status={order.status}>{order.status}</StatusTag>
                </p>
                <p>
                  <strong>Цена:</strong> {order.total_price} ден.
                </p>
              </div>

              {/* Ако нарачката е слободна (без доставувач) -> Копче за прифаќање */}
              {order.delivery_id === null && (
                <AcceptButton onClick={() => handleAcceptOrder(order.id)}>
                  Прими Нарачка
                </AcceptButton>
              )}

              {/* Ако нарачката е „Во достава“ -> Копче за испорака */}
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
