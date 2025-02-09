import { useEffect, useState } from "react";
import axios from "axios";
import styled from "styled-components";

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
  flex-direction: column;
`;

const ItemList = styled.ul`
  list-style: none;
  padding: 0;
  margin-top: 10px;
`;

const Item = styled.li`
  font-size: 14px;
  padding: 4px 0;
  border-bottom: 1px dashed #ccc;
  display: flex;
  justify-content: space-between;
`;

const MyOrders: React.FC = () => {
  interface Order {
    id: number;
    status: string;
    total_price: number;
    items: { name: string; quantity: number }[];
  }

  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const response = await axios.get("http://localhost:5000/my-orders", {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        });

        console.log("📦 Преземени нарачки:", response.data);
        setOrders(response.data);
      } catch (error) {
        console.error("❌ Грешка при преземање нарачки:", error);
        setError(
          "Не можеме да ги вчитаме нарачките во моментов. Пробајте подоцна."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) return <p>🔄 Вчитување на нарачките...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <Container>
      <Title>📦 Моите Нарачки</Title>
      {orders.length === 0 ? (
        <p style={{ textAlign: "center", color: "#7f8c8d" }}>
          Немате активни нарачки.
        </p>
      ) : (
        <OrderList>
          {orders.map((order) => (
            <OrderItem key={order.id}>
              <p>🔢 Нарачка #{order.id}</p>
              <p>📍 Статус: {order.status}</p>
              <p>💰 Вкупно: {order.total_price} ден.</p>

              {order.items.length > 0 && (
                <ItemList>
                  {order.items.map((item, index) => (
                    <Item key={index}>
                      <span>🍽 {item.name}</span>
                      <span>{item.quantity}x</span>
                    </Item>
                  ))}
                </ItemList>
              )}
            </OrderItem>
          ))}
        </OrderList>
      )}
    </Container>
  );
};

export default MyOrders;
