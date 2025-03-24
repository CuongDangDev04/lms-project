import React, { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import { getUserById } from "../../services/userServices";
import { useParams, useNavigate } from "react-router-dom";

const Classroom = () => {
  const { classroomId } = useParams();
  const navigate = useNavigate();
  const jitsiContainerRef = useRef(null);
  const jitsiApiRef = useRef(null);
  const [roomName, setRoomName] = useState("");
  const [userName, setUserName] = useState("");
  const [userId, setUserId] = useState(null);
  const [hasLeft, setHasLeft] = useState(false);
  const BASEURL = import.meta.env.VITE_API_BASE_URL;
  const [containerHeight, setContainerHeight] = useState(
    window.innerHeight - 100
  );

  const handleConferenceLeft = useCallback(() => {
    if (!hasLeft) {
      setHasLeft(true);
      navigate(`/class/${classroomId}`);
    }
  }, [hasLeft, navigate, classroomId]);

  useEffect(() => {
    if (!classroomId) return;
    let isMounted = true;

    axios
      .get(`${BASEURL}/api/class-course/createRoom/${classroomId}`)
      .then((response) => {
        if (isMounted) setRoomName(response.data.roomName);
      })
      .catch((error) => console.error("Lỗi khi lấy phòng học:", error));

    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserId(parsedUser?.id);
    }

    return () => {
      isMounted = false;
    };
  }, [classroomId]);

  useEffect(() => {
    if (!userId) return;
    let isMounted = true;

    getUserById(userId)
      .then((user) => {
        if (isMounted) setUserName(user.username);
      })
      .catch((error) =>
        console.error("Lỗi khi lấy thông tin người dùng:", error)
      );

    return () => {
      isMounted = false;
    };
  }, [userId]);

  useEffect(() => {
    if (!roomName || !userName || !jitsiContainerRef.current) return;

    const loadJitsiScript = () => {
      if (window.JitsiMeetExternalAPI) {
        startConference();
      } else {
        let script = document.getElementById("jitsi-script");
        if (!script) {
          script = document.createElement("script");
          script.id = "jitsi-script";
          script.src = "https://meet.jit.si/external_api.js";
          script.async = true;
          script.onload = startConference;
          script.onerror = () => console.error("Lỗi khi tải Jitsi script");
          document.body.appendChild(script);
        } else {
          script.onload = startConference;
        }
      }
    };

    const startConference = () => {
      if (jitsiApiRef.current || !jitsiContainerRef.current) return;

      jitsiApiRef.current = new window.JitsiMeetExternalAPI("meet.jit.si", {
        roomName,
        parentNode: jitsiContainerRef.current,
        width: "100%",
        height: containerHeight,
        userInfo: { displayName: userName },
        configOverwrite: {
          prejoinPageEnabled: false,
          startWithAudioMuted: true,
          startWithVideoMuted: true,
          requireDisplayName: false,
        },
        interfaceConfigOverwrite: {
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          DEFAULT_REMOTE_DISPLAY_NAME: "Người tham gia",
          DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
          TOOLBAR_BUTTONS: [
            "microphone",
            "camera",
            "hangup",
            "chat",
            "etherpad",
            "settings",
            "desktop",
            "raisehand",
            "videoquality",
            "feedback",
            "shortcuts",
            "closedcaptions",
          ],
        },
      });

      jitsiApiRef.current.addEventListener("videoConferenceJoined", () => {
        setHasLeft(false);
      });

      jitsiApiRef.current.addEventListener("readyToClose", () => {
        handleConferenceLeft();
      });

      // Xử lý khi người dùng đóng tab hoặc tải lại trang
      const handleBeforeUnload = () => {
        handleConferenceLeft();
      };

      window.addEventListener("beforeunload", handleBeforeUnload);

      return () => {
        window.removeEventListener("beforeunload", handleBeforeUnload);
      };
    };

    loadJitsiScript();

    return () => {
      if (jitsiApiRef.current) {
        jitsiApiRef.current.dispose();
        jitsiApiRef.current = null;
      }
    };
  }, [roomName, userName, handleConferenceLeft, hasLeft, containerHeight]);

  useEffect(() => {
    const updateHeight = () => {
      setContainerHeight(window.innerHeight - 100);
    };

    window.addEventListener("resize", updateHeight);
    return () => window.removeEventListener("resize", updateHeight);
  }, []);

  return (
    <div
      ref={jitsiContainerRef}
      style={{
        width: "100%",
        height: containerHeight,
        marginTop: "6rem",
        maxWidth: "1200px",
        margin: "auto",
      }}
    />
  );
};

export default Classroom;
