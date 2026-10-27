"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import io, { Socket } from "socket.io-client";
import { useAuth } from "./use-auth";

interface Message {
  id: string;
  groupId: string;
  senderId: string;
  text: string;
  mentions?: { userId: string; username: string }[];
  status: string;
  createdAt: string;
  sender?: { id: string; name: string };
}

interface UserTyping {
  userId: string;
  groupId: string;
  isTyping: boolean;
}

interface MemberJoined {
  userId: string;
  groupId: string;
}

interface MemberLeft {
  userId: string;
  groupId: string;
}

interface UseCommunitySocketReturn {
  socket: ReturnType<typeof io> | null;
  connected: boolean;
  joinGroup: (groupId: string) => void;
  leaveGroup: (groupId: string) => void;
  sendMessage: (groupId: string, text: string, mentionIds?: string[]) => void;
  sendTyping: (groupId: string, isTyping: boolean) => void;
  onNewMessage: (callback: (message: Message) => void) => () => void;
  onUserTyping: (callback: (data: UserTyping) => void) => () => void;
  onMemberJoined: (callback: (data: MemberJoined) => void) => () => void;
  onMemberLeft: (callback: (data: MemberLeft) => void) => () => void;
  onMessageRead: (callback: (data: { messageId: string; userId: string }) => void) => () => void;
}

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL?.replace("/api/v1", "") || "http://localhost:3001";

export function useCommunitySocket(): UseCommunitySocketReturn {
  const { user } = useAuth();
  const [socket, setSocket] = useState<ReturnType<typeof io> | null>(null);
  const [connected, setConnected] = useState(false);
  const tokenRef = useRef<string | null>(null);

  // Initialize socket
  useEffect(() => {
    if (!user) return;

    // Get token from localStorage
    const token = localStorage.getItem("auth_token");
    if (!token) return;
    tokenRef.current = token;

    // Create socket connection
    const newSocket = io(`${SOCKET_URL}/community`, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    newSocket.on("connect", () => {
      console.log("Community socket connected:", newSocket.id);
      setConnected(true);
    });

    newSocket.on("disconnect", (reason: string) => {
      console.log("Community socket disconnected:", reason);
      setConnected(false);
    });

    newSocket.on("connect_error", (error: Error) => {
      console.error("Community socket connection error:", error.message);
      setConnected(false);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, [user]);

  // Join group room
  const joinGroup = useCallback((groupId: string) => {
    if (socket?.connected) {
      socket.emit("joinGroup", { groupId });
    }
  }, [socket]);

  // Leave group room
  const leaveGroup = useCallback((groupId: string) => {
    if (socket?.connected) {
      socket.emit("leaveGroup", { groupId });
    }
  }, [socket]);

  // Send message
  const sendMessage = useCallback((groupId: string, text: string, mentionIds: string[] = []) => {
    if (socket?.connected) {
      socket.emit("sendMessage", { groupId, text, mentionIds });
    }
  }, [socket]);

  // Send typing indicator
  const sendTyping = useCallback((groupId: string, isTyping: boolean) => {
    if (socket?.connected) {
      socket.emit("typing", { groupId, isTyping });
    }
  }, [socket]);

  // Event listeners with cleanup
  const onNewMessage = useCallback((callback: (message: Message) => void) => {
    if (!socket) return () => {};
    socket.on("newMessage", callback);
    return () => socket.off("newMessage", callback);
  }, [socket]);

  const onUserTyping = useCallback((callback: (data: UserTyping) => void) => {
    if (!socket) return () => {};
    socket.on("userTyping", callback);
    return () => socket.off("userTyping", callback);
  }, [socket]);

  const onMemberJoined = useCallback((callback: (data: MemberJoined) => void) => {
    if (!socket) return () => {};
    socket.on("memberJoined", callback);
    return () => socket.off("memberJoined", callback);
  }, [socket]);

  const onMemberLeft = useCallback((callback: (data: MemberLeft) => void) => {
    if (!socket) return () => {};
    socket.on("memberLeft", callback);
    return () => socket.off("memberLeft", callback);
  }, [socket]);

  const onMessageRead = useCallback((callback: (data: { messageId: string; userId: string }) => void) => {
    if (!socket) return () => {};
    socket.on("messageRead", callback);
    return () => socket.off("messageRead", callback);
  }, [socket]);

  return {
    socket,
    connected,
    joinGroup,
    leaveGroup,
    sendMessage,
    sendTyping,
    onNewMessage,
    onUserTyping,
    onMemberJoined,
    onMemberLeft,
    onMessageRead,
  };
}