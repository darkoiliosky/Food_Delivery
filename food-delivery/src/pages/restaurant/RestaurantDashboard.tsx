import React, { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import styled from "styled-components";

const Container = styled.div`
  max-width: 900px;
  margin: 40px auto;
  padding: 20px;
  background: #ffffff;
  border-radius: 10px;
  box-shadow: 0px 4px 6px rgba(0, 0, 0, 0.1);
`;

const Title = styled.h2`
  text-align: center;
  margin-bottom: 20px;
`;

const OrderList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
`;

const OrderCard = styled.div`
  background: #f7f9fc;
  border-left: 5px solid #3498db;
  padding: 15px;
  border-radius: 8px;
  margin-bottom: 10px;
`;

const StatusButton = styled.button`
  margin-top: 10px;
  padding: 8px 12px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  &:hover {
    background-color: #2980b9;
  }
`;

interface Order {
  id: number;
  status: string;
  total_price: number;
  created_at?: string;
}

const RestaurantDashboard: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
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

        console.log("📦 Orders fetched:", response.data); // Додај ова за дебагирање

        setOrders(response.data);
      } catch (error) {
        console.error("Error fetching restaurant orders:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurantOrders();
  }, [user]);

  // Ажурирање (PUT) /orders/:id/status
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
      console.error("Error updating order status:", err);
      alert("Не може да се ажурира статусот!");
    }
  };

  if (loading) return <Container>Вчитување на нарачките...</Container>;

  if (!user || user.role !== "restaurant") {
    return (
      <Container>
        <Title>Ресторан Dashboard</Title>
        <p>Немате овластување за оваа страница.</p>
      </Container>
    );
  }

  return (
    <Container>
      <Title>Ресторан Dashboard</Title>
      {orders.length === 0 ? (
        <p>Нема нарачки за прикажување.</p>
      ) : (
        <OrderList>
          {orders.map((order) => (
            <OrderCard key={order.id}>
              <p>
                <strong>Нарачка #{order.id}</strong> — Статус: {order.status}
              </p>
              <p>Цена: {Number(order.total_price).toFixed(2)} ден.</p>
              {order.created_at && (
                <p>Датум: {new Date(order.created_at).toLocaleString()}</p>
              )}

              {/* Логика: Ресторан менува од “Примена” -> “Во подготовка”, па -> “Завршена” */}
              {order.status === "Примена" && (
                <StatusButton
                  onClick={() => updateOrderStatus(order.id, "Во подготовка")}
                >
                  Започни Подготовка
                </StatusButton>
              )}

              {order.status === "Во подготовка" && (
                <StatusButton
                  onClick={() => updateOrderStatus(order.id, "Завршена")}
                >
                  Заврши Подготовка
                </StatusButton>
              )}

              {/* Ако е во достава, испорачана, итн., нема копче */}
            </OrderCard>
          ))}
        </OrderList>
      )}
    </Container>
  );
};

export default RestaurantDashboard;
