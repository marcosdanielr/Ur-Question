import { useEffect, useState } from "react";
import { database } from "../services/firebase";
import { useAuth } from "./useAuth";

type MessageType = {
  id: string;
  user: {
    name: string;
    avatar: string; 
  }
  content: string;
  isAnswered: boolean;
  isHighlighted: boolean;  
  likeCount: number;
  likeId: string | undefined;
}

type FirebaseMessages = Record<string, {
  user: {
    name: string;
    avatar: string; 
  }
  content: string;
  isAnswered: boolean;
  isHighlighted: boolean;
  likes: Record<string, {
    userId: string;
  }>
}>


export function useRoom(roomId: string) {
  const {user} = useAuth();
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [roomName, setRoomName] = useState('');

  useEffect(() => {
    const roomRef = database.ref(`rooms/${roomId}`);

    roomRef.on('value', room => {
      const databaseRoom = room.val();
      const firebaseMessages: FirebaseMessages = databaseRoom.messages ?? {};
      const parsedMessages = Object.entries(firebaseMessages).map(([key, value]) => {
        return {
          id: key,
          content: value.content,
          user: value.user,
          isHighlighted: value.isHighlighted,
          isAnswered: value.isAnswered,
          likeCount: Object.values(value.likes ?? {}).length,
          likeId: Object.entries(value.likes ?? {}).find(([key, like]) => like.userId === user?.id)?.[0],
        }    
      });
      setRoomName(databaseRoom.roomName);
      setMessages(parsedMessages);
    })

    return() => {
      roomRef.off('value');
    }
    
  }, [roomId, user?.id]);

  return {messages, roomName}
}