import { FormEvent, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';

//import { AuthContext } from '../contexts/AuthContext';
import { database } from '../services/firebase';
import { useAuth } from '../hooks/useAuth';
import { Button } from '../components/button';
import ilustrationImg from '../assets/images/illustration.svg';
import logoImg from '../assets/images/logo.svg';
import '../styles/auth.scss';

export function CreateRoom(){
 const { user } = useAuth();
 const history = useHistory();
 const [createRoom, setCreateRoom] = useState('');

 async function handleCreateRoom(event: FormEvent){
   event.preventDefault();

   if (createRoom.trim() === '') {
     return;
   }

   const roomRef = database.ref('rooms');

   const firebaseRoom = await roomRef.push({
     roomName: createRoom,
     userId: user?.id,
   })

   history.push(`/rooms/${firebaseRoom.key}`)
 }

  return (
    <div id="page-auth">
      <aside>     
        <img src={ilustrationImg} alt="Ilustração" />
        <strong>Utilize a sala para o que desejar</strong>
        <p>Utilize a sala de mensagens, perguntas e respostas para compartilhar conhecimentos, divertir-se, organizar algum evento, etc.</p>
      </aside>
      <main>
        <div className="main-content">
          <img src={logoImg} alt="Logotipo Your Question" />       
          <h2>Crie uma nova sala</h2>      
          <form onSubmit={handleCreateRoom}>
            <input
            type="text" 
            placeholder="Digite o nome da sala"
            onChange={event => setCreateRoom(event.target.value)}
            value={createRoom}
            />
            <Button type="submit">
              Criar sala
            </Button>
          </form>
          <p>
            Caso deseje entrar em uma sala existente, <Link to="/">clique aqui</Link>
          </p>
        </div>
      </main>
    </div>
  );
}