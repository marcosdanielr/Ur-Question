import { FormEvent, useState } from 'react';
import { useHistory } from 'react-router-dom';

import { useAuth } from '../hooks/useAuth';
import { database } from '../services/firebase';
import { Button } from '../components/button';
import ilustrationImg from '../assets/images/illustration.svg';
import logoImg from '../assets/images/logo.svg';
import googleIconImg from '../assets/images/google-icon.svg';
import loginImg from '../assets/images/log-in.svg';
import '../styles/auth.scss';

export function Home(){
  const history = useHistory();
  const {user, signInWithGoogle} = useAuth();
  const [roomCode, setRoomCode] = useState(''); 

  async function handleEnterRoom(event: FormEvent){
    event.preventDefault();
  }

  async function handleCreateRoom(){
    if (!user ){
      await signInWithGoogle()
    }

    history.push('/rooms/create');
  }

  async function handleJoinRoom(event: FormEvent){
    event.preventDefault();    

    if (roomCode.trim() === '') {
      return;
    }

    const roomRef = await database.ref(`rooms/${roomCode}`).get();

    if (!roomRef.exists()){
      alert('Sala não existente');
      return;
    }

    if (roomRef.val().closedAt) {
      alert('A sala está encerrada');
      return;
    }

    history.push(`/rooms/${roomCode}`);
  }

  return (
    <div id="page-auth">
      <aside>
        <img src={ilustrationImg} alt="Ilustração" />
        <strong>Ur Question: Mensagens, Perguntas &amp; Respostas</strong>
        <p>Crie sua sala de perguntas, respostas e mensagens ou participe de alguma</p>
      </aside>
      <main>
        <div className="main-content">
          <img src={logoImg} alt="Logotipo Your Question" />
          <button className="create-room" onClick={handleCreateRoom}>
            <img src={googleIconImg} alt="Ícone do Google" />
            Crie sua sala com o Google
          </button>
          <div className="separator">ou entre em uma sala</div>
          <form onSubmit={handleJoinRoom}>
            <input
            type="text" 
            placeholder="Digite o código da sala"
            onChange={event => setRoomCode(event.target.value)}
            value={roomCode}
            />
            <Button type="submit">
              <img src={loginImg} alt="Entrar na sala" />
              Entrar na sala
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}