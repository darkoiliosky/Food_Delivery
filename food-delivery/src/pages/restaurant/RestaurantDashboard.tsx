import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import {
  Container,
  Title,
  DashboardContent,
  Section,
  SectionTitle,
  OrderList,
  OrderCard,
  StatusButton,
  Message,
} from "./RestaurantDashboard.styles";

interface Order {
  id: number;
  status: string;
  total_price: number;
  created_at?: string;
}

const RestaurantDashboard: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!user || user.role !== "restaurant") {
      setLoading(false);
      return;
    }

    const fetchRestaurantOrders = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await axios.get<Order[]>(
          "http://localhost:5000/restaurant/orders",
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        console.log("📦 Добиени нарачки:", response.data); // Додај за дебагирање
        setOrders(response.data);
      } catch (error) {
        console.error("❌ Грешка при вчитување на нарачки:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantOrders();
  }, [user]);

  // Функција за ажурирање на статус на нарачка
  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    try {
      const token = localStorage.getItem("token");
      await axios.put(
        `http://localhost:5000/orders/${orderId}/status`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
      );
    } catch (err) {
      console.error("❌ Грешка при ажурирање на статус:", err);
      alert("Не може да се ажурира статусот!");
    }
  };

  if (loading) return <Message>🔄 Вчитување на нарачките...</Message>;

  if (!user || user.role !== "restaurant") {
    return (
      <Container>
        <Title>🚫 Немате пристап до оваа страница.</Title>
      </Container>
    );
  }

  return (
    <Container>
      <Title>📊 Контролна Табла за Ресторан</Title>
      <DashboardContent>
        <Section>
          <SectionTitle>Нарачки</SectionTitle>
          {orders.length === 0 ? (
            <Message>📭 Нема нарачки за прикажување.</Message>
          ) : (
            <OrderList>
              {orders.map((order) => (
                <OrderCard key={order.id}>
                  <p>
                    <strong>Нарачка #{order.id}</strong>
                  </p>
                  <p>
                    <strong>Статус:</strong> {order.status}
                  </p>
                  <p>
                    <strong>Цена:</strong>{" "}
                    {Number(order.total_price).toFixed(2)} ден.
                  </p>
                  {order.created_at && (
                    <p>
                      <strong>Датум:</strong>{" "}
                      {new Date(order.created_at).toLocaleString()}
                    </p>
                  )}

                  {/* Контрола на статусот на нарачките */}
                  {order.status === "Примена" && (
                    <StatusButton
                      onClick={() =>
                        updateOrderStatus(order.id, "Во подготовка")
                      }
                    >
                      🏁 Започни Подготовка
                    </StatusButton>
                  )}

                  {order.status === "Во подготовка" && (
                    <StatusButton
                      onClick={() => updateOrderStatus(order.id, "Завршена")}
                    >
                      ✅ Заврши Подготовка
                    </StatusButton>
                  )}
                </OrderCard>
              ))}
            </OrderList>
          )}
        </Section>
      </DashboardContent>
    </Container>
  );
};

export default RestaurantDashboard;
