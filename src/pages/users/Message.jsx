import ChatBox from "../../components/chatBox";
import useUserId from "../../hooks/useUserId";

export default function Message() {
  // const [userId, setUserId] = useState(null);
  const userId = useUserId();

  return (
    <>
      <ChatBox userId={userId} />
    </>
  );
}
