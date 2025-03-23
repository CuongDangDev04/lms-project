import { useEffect, useState } from "react";
import ChatBox from "../../components/chatBox";

export default function Message() {
  const [userId, setUserId] = useState(null);
  const [_, setError] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserId(parsedUser?.id);
    } else {
      setError("Không tìm thấy thông tin người dùng!");
    }
  }, []);

  return (
    < >
        <ChatBox userId={userId} />
    </>
  );
}
