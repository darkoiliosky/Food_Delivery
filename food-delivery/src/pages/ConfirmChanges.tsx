import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios"; // Само axios без AxiosError

const ConfirmChanges: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [message, setMessage] = useState<string>("Вчитување...");

  useEffect(() => {
    const confirmChanges = async () => {
      try {
        const response = await axios.get<string>(
          `http://localhost:5000/profile/confirm-changes?token=${token}`
        );
        setMessage(response.data);
      } catch (error: unknown) {
        if (error && typeof error === "object" && "response" in error) {
          setMessage(
            (error as { response: { data: string } }).response.data ||
              "Настана грешка при барањето."
          );
        } else if (error instanceof Error) {
          setMessage(`Грешка: ${error.message}`);
        } else {
          setMessage("Настана непозната грешка.");
        }
      }
    };

    if (token) confirmChanges();
  }, [token]);

  return <div>{message}</div>;
};

export default ConfirmChanges;
