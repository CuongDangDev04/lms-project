// src/components/JitsiMeeting.jsx
import { useEffect, useRef } from "react";

const JitsiMeeting = ({ roomName, displayName, onMeetingEnd }) => {
  const jitsiContainerRef = useRef(null);

  useEffect(() => {
    // Kiểm tra xem JitsiMeetExternalAPI đã được tải chưa
    if (!window.JitsiMeetExternalAPI) {
      console.error("Jitsi Meet API chưa được tải!");
      return;
    }

    // Khởi tạo Jitsi Meeting
    const domain = "meet.jit.si"; // Sử dụng server Jitsi công khai
    const options = {
      roomName: roomName || "MyDefaultRoom", // Tên phòng họp
      width: "100%",
      height: 600,
      parentNode: jitsiContainerRef.current, // Container để render Jitsi
      userInfo: {
        displayName: displayName || "User", // Tên hiển thị của người dùng
      },
      configOverwrite: {
        startWithAudioMuted: true, // Tắt mic khi bắt đầu
        startWithVideoMuted: false, // Bật video khi bắt đầu
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false, // Ẩn watermark
      },
    };

    const api = new window.JitsiMeetExternalAPI(domain, options);

    // Sự kiện khi cuộc họp kết thúc
    api.addEventListener("videoConferenceLeft", () => {
      console.log("Cuộc họp đã kết thúc");
      if (onMeetingEnd) onMeetingEnd();
    });

    // Dọn dẹp khi component bị unmount
    return () => {
      api.dispose();
    };
  }, [roomName, displayName, onMeetingEnd]);

  return (
    <div
      ref={jitsiContainerRef}
      style={{ width: "100%", height: "600px", border: "1px solid #ccc" }}
    />
  );
};

export default JitsiMeeting;
