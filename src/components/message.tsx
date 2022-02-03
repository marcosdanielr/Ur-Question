import { ReactNode } from 'react';
import cn from 'classnames';
import '../styles/message.scss';

type MessageProps = {
  content: string;
  user: {
    name: string
    avatar: string;
  };
  children?: ReactNode;
  isAnswered?: boolean;
  isHighlighted?: boolean;
}

export function Message({
  content, 
  user, 
  isAnswered = false, 
  isHighlighted = false, 
  children}: MessageProps) {
  return (
    <div className={cn(
      'message',
      { answered: isAnswered },
      { highlighted: isHighlighted && !isAnswered },
    )}>

      <p>{content}</p>
      <footer>
        <div className="user-info">
          <img src={user.avatar} alt={user.name} />
          <span>{user.name}</span>
        </div>
        <div>
          {children}          
        </div>
      </footer>
    </div>
  )
}