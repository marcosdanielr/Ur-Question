import { FormEvent, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { Message } from '../components/message';
import '../styles/room.scss';
import { database } from '../services/firebase';
import logoImg from '../assets/images/logo.svg';
import likeImg from '../assets/images/like.svg';
import checkImg from '../assets/images/check.svg';
import answerImg from '../assets/images/answer.svg';
import deleteImg from '../assets/images/delete.svg';
import { Button } from '../components/button';
import { RoomCode } from '../components/roomCode';
import { useAuth } from '../hooks/useAuth';
import { useRoom } from '../hooks/useRoom';

type RoomParams = {
  id: string;
}

export function AdminRoom(){
  const history = useHistory();
  const {user, signInWithGoogle} = useAuth();
  const params = useParams<RoomParams>();
  const [newMessage, setNewMessage] = useState('');
  const roomId = params.id;
  const {roomName, messages} = useRoom(roomId);

  async function handleEndRoom() {
    await database.ref(`rooms/${roomId}`).update({
      closedAt: new Date(),
    })    

    history.push('/');
  }

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

  async function handleDeleteMessage(messageId: string) {
    if (window.confirm('Você tem certeza que deseja excluir esta mensagem?')) {
      await database.ref(`rooms/${roomId}/messages/${messageId}`).remove();
    }
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

  async function handleMessageAsAnswered(messageId: string) {
    await database.ref(`rooms/${roomId}/messages/${messageId}`).update({
      isAnswered: true,  
    });

  }

  async function handleHighlightMessage(messageId: string) {
    await database.ref(`rooms/${roomId}/messages/${messageId}`).update({
      isHighlighted: true,
    });
  }

  async function loginWithGoogle(){   
    await signInWithGoogle()  
}

  return (
    <div id="pageroom">
      <header>
        <div className="content">
          <img src={logoImg} alt="Your Question logo" />
          <div>
          <RoomCode code={roomId}/>
          <Button isOutlined onClick={handleEndRoom}>Encerrar sala</Button>
          </div>
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
            onClick={() => handleLikeMessage(message.id, message.likeId)}>               

            { message.likeCount > 0 && <span>{message.likeCount}</span> }

          <img src={likeImg} alt="Marcar como gostei" />
          </button>

          {!message.isAnswered && (
          <>
            <button
            type="button"
            onClick={() => handleHighlightMessage(message.id)}>
          <img src={checkImg} alt="Marcar como lida" />
          </button>

          <button
            type="button"
            onClick={() => handleMessageAsAnswered(message.id)}>
          <img src={answerImg} alt="Marcar mensagem ou pergunta como respondida" />
          </button>
          </>
          )}

          <button
            type="button"
            onClick={() => handleDeleteMessage(message.id)}>
          <img src={deleteImg} alt="Excluir mensagem" />
          </button>         
          </Message>
          );
        })}     
      </main>
    </div>
  )
}