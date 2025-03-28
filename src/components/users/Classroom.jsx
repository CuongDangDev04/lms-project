import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import classroomService from "../../services/ClassService";
import DailyIframe from "@daily-co/daily-js";
import useUserId from "../../hooks/useUserId";
import { getUserById } from "../../services/userServices";
const Classroom = () => {
  const { classroomId } = useParams();
  const [roomUrl, setRoomUrl] = useState("");
  const videoCallRef = useRef(null);
  const callFrameRef = useRef(null);
  const userId = useUserId();
  const [username, setUsername] = useState(null);
  const navigate = useNavigate();
  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      try {
        const user = await getUserById(userId);
        setUsername(user.username);
        console.log("User info:", user);
      } catch (error) {
        console.error("Lỗi khi lấy user:", error);
      }
    };

    fetchUser();
    // const checkUserInClass =async () =>{
    //   if(!userId || !classroomId) return;
    //   const data =

    // }
    // checkUserInClass();
  }, [userId, classroomId]);
  useEffect(() => {
    const fetchRoom = async () => {
      if (!classroomId) return;
      const data = await classroomService.joinClassroom(classroomId);
      if (data?.roomUrl) {
        setRoomUrl(data.roomUrl);
      }
    };
    fetchRoom();
  }, [classroomId]);

  useEffect(() => {
    if (!roomUrl || !username || callFrameRef.current) return;

    const callFrame = DailyIframe.createFrame(videoCallRef.current, {
      showLeaveButton: true,
      showFullscreenButton: true,
      showParticipantsBar: true,
      iframeStyle: {
        width: "100%",
        height: "100vh",
        border: "none",
      },
    });

    callFrame.join({ url: roomUrl, userName: username || "Guest" });
    callFrameRef.current = callFrame;
    callFrame.on("left-meeting", () => {
      navigate(`/CourseDetail/${classroomId}`);
    });

    return () => callFrame.destroy(); // Cleanup khi component unmount
  }, [roomUrl, username, navigate, classroomId]);
  return (
    <div className="fixed top-0 left-0 w-full h-full bg-white z-50">
      <div ref={videoCallRef} className="w-full h-full"></div>
    </div>
  );
};

export default Classroom;
