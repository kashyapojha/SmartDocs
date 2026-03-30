// frontend/src/hooks/useCollaboration.js
import { useEffect, useRef, useState } from "react";
import { SOCKET_IO_URL } from "../config/api";
import io from "socket.io-client";

export const useCollaboration = (documentId, userId, userName) => {
  const socketRef = useRef(null);
  const [activeUsers, setActiveUsers] = useState([]);
  const [cursors, setCursors] = useState({});

  useEffect(() => {
    // Connect to Socket.IO server
    socketRef.current = io(SOCKET_IO_URL);

    // Join document room
    socketRef.current.emit("join-document", documentId, userId);

    // Listen for user joining
    socketRef.current.on("user-joined", (data) => {
      setActiveUsers(data.activeUsers);
      console.log("User joined:", data.activeUsers);
    });

    // Listen for content updates
    socketRef.current.on("content-updated", (data) => {
      if (data.userId !== userId) {
        // Another user updated - trigger callback
        window.dispatchEvent(
          new CustomEvent("remote-content-change", {
            detail: data,
          })
        );
      }
    });

    // Listen for cursor updates
    socketRef.current.on("cursor-updated", (data) => {
      setCursors((prev) => ({
        ...prev,
        [data.userId]: {
          position: data.position,
          color: data.color,
        },
      }));
    });

    // Listen for user leaving
    socketRef.current.on("user-left", (data) => {
      setActiveUsers(data.activeUsers);
      setCursors((prev) => {
        const updated = { ...prev };
        delete updated[data.userId];
        return updated;
      });
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit("leave-document", documentId, userId);
        socketRef.current.disconnect();
      }
    };
  }, [documentId, userId]);

  // Send content update to other users
  const sendContentUpdate = (content) => {
    if (socketRef.current) {
      socketRef.current.emit("document-change", documentId, userId, content);
    }
  };

  // Send cursor position to other users
  const sendCursorPosition = (position, color = "#3b82f6") => {
    if (socketRef.current) {
      socketRef.current.emit("cursor-move", documentId, userId, position, color);
    }
  };

  return {
    activeUsers,
    cursors,
    sendContentUpdate,
    sendCursorPosition,
    socket: socketRef.current,
  };
};
