import { Link } from 'react-router-dom';
import { FormEvent, useState } from 'react';
import { useParams } from 'react-router-dom';

import { Message } from '../components/message';
import '../styles/room.scss';
import { database } from '../services/firebase';
import logoImg from '../assets/images/logo.svg';
import likeImg from '../assets/images/like.svg';
import { Button } from '../components/button';
import { RoomCode } from '../components/roomCode';
import { useAuth } from '../hooks/useAuth';
import { useRoom } from '../hooks/useRoom';

type RoomParams = {
  id: string;
}

export function Room(){
  const {user, signInWithGoogle} = useAuth();
  const params = useParams<RoomParams>();
  const [newMessage, setNewMessage] = useState('');
  const roomId = params.id;
  const {roomName, messages} = useRoom(roomId)

  async function handleSendMessage(event: FormEvent) {
    event.preventDefault();

    if (newMessage.trim() === '') {
      return;
    }

    if(!user) {
      throw new Error("Você precisa estar logado");
    }

    const message = {
      content: newMessage,
      user: {
        name: user.name,
        avatar: user.avatar,
      },
      isHighlighted: false,
      isAnswered: false,
    };
    
    await database.ref(`rooms/${roomId}/messages`).push(message);

    setNewMessage('');

  }

  async function handleLikeMessage(messageId: string, likeId: string | undefined) {
    if (likeId) {
      await database.ref(`rooms/${roomId}/messages/${messageId}/likes/${likeId}`).remove()
    } else {
      await database.ref(`rooms/${roomId}/messages/${messageId}/likes`).push({
        userId: user?.id,
      })
    }
  }

  async function loginWithGoogle(){   
      await signInWithGoogle()  
  } 

  return (
    <div id="pageroom">
      <header>
        <div className="content">
          <img src={logoImg} alt="Your Question logo" />
          <RoomCode code={roomId}/>
        </div>
      </header>

      <main>
        <div className="room-title">
          <h1>Sala: {roomName}</h1>
          { messages.length > 0 && <span>{messages.length} mensagens/perguntas</span>}
        </div>

        <form onSubmit={handleSendMessage}>
          <textarea 
            placeholder="Deixe aqui sua pergunta ou mensagem"    
            onChange={event => setNewMessage(event.target.value)} 
            value={newMessage}    
          />

          <div className="form-footer">
            { user ? (
              <div className="user-info">
                <img src={user.avatar} alt={user.name}/>
                <span>{user.name}</span>
              </div>
            ) : (
              <span>Para enviar uma mensagem ou pergunta, <button onClick={loginWithGoogle}>faça login</button>.</span>
            )}
            <Button type="submit" disabled={!user}>Enviar</Button>
          </div>
        </form>       
        {messages.map(message => {
          return (
            <Message 
            key={message.id}
            content={message.content}
            user={message.user}
            isAnswered={message.isAnswered}
            isHighlighted={message.isHighlighted}>  
            
              <button
                className={`like-button ${message.likeId ? 'liked' : ''}`}
                type='button'
                aria-label='Marcar como gostei'
                onClick={() => handleLikeMessage(message.id, message.likeId)}        
                >                              

                { message.likeCount > 0 && <span>{message.likeCount}</span> }
                
                <img src={likeImg} alt="Marcar como gostei" />
              </button>
            </Message>
          );
        })}     
      </main>
    </div>
  )
}