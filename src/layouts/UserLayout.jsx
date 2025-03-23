import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { toast, ToastContainer } from "react-toastify";
import { io } from "socket.io-client";
import LoadingBar from "../components/users/LoadingBar";
import Navbar from "../components/users/Navbar";
const BASE_URL = import.meta.env.VITE_API_BASE_URL; 
const socket = io(BASE_URL);

import SideBarMobile from "../components/users/SideBarMobile";
const UserLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isInMessagePage = /^\/courseDetail\/\d+(\/messages)?$/.test(
    location.pathname
  );
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUserId(parsedUser?.id);
    }
  }, []);

  useEffect(() => {
    if (userId) {
      socket.emit("registerUser", userId);
    }
  }, [userId]);
  useEffect(() => {
    socket
      .off("tagNotification")
      .on("tagNotification", ({ sender, sendTo, classroomId }) => {
        if (!isInMessagePage && sender !== userId && sendTo == userId) {
          toast.info(`Bạn được tag trong lớp học!`, {
            position: "top-right",
            autoClose: 5000,
            className: "cursor-pointer",
            onClick: () => {
              navigate(`/courseDetail/${classroomId}/messages`);
              toast.dismiss();
            },
          });
        }
      });

    socket
      .off("toastNotification")
      .on("toastNotification", ({ message, notificationType }) => {
        let toastOptions = {
          position: "top-right",
          autoClose: 5000,
        };

        switch (notificationType) {
          case "tag":
            break;
          case "classroom":
            toast(`${message}`, {
              ...toastOptions,
              className: "classroom-toast",
            });
            break;
          case "system":
            toast(` ${message}`, {
              ...toastOptions,
              className: "system-toast",
            });
            break;
          default:
            toast(message, toastOptions);
        }
      });

    return () => {
      socket.off("tagNotification");
      socket.off("toastNotification");
    };
  }, [isInMessagePage, userId, navigate, location.pathname]);

  return (
    <>
      <LoadingBar />
      <Navbar />
      <Outlet />
      <SideBarMobile />
    </>
  );
};

export default UserLayout;
