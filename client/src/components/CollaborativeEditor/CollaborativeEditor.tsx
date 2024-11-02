import React, { useEffect, useRef, useState } from 'react';
import { Editor } from '@monaco-editor/react';
import './CollaborativeEditor.scss';

interface User {
  username: string;
  cursor?: {
    line: number;
    column: number;
  };
}

interface CollaborativeEditorProps {
  roomId: string;
  initialContent: string;
  language?: string;
}

const CollaborativeEditor: React.FC<CollaborativeEditorProps> = ({
  roomId,
  initialContent,
  language = 'typescript'
}) => {
  const [content, setContent] = useState(initialContent);
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<string[]>([]);
  const wsRef = useRef<WebSocket | null>(null);
  const editorRef = useRef<any>(null);

  useEffect(() => {
    const ws = new WebSocket(`ws://localhost:8001`);
    wsRef.current = ws;

    ws.onopen = () => {
      ws.send(JSON.stringify({
        type: 'join',
        room: roomId,
        username: localStorage.getItem('username') || 'Anonymous'
      }));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      handleWebSocketMessage(data);
    };

    return () => {
      ws.close();
    };
  }, [roomId]);

  const handleWebSocketMessage = (data: any) => {
    switch (data.type) {
      case 'user_joined':
      case 'user_left':
        updateUsers(data);
        break;
      case 'cursor':
        updateUserCursor(data);
        break;
      case 'edit':
        applyEdits(data);
        break;
      case 'chat':
        addChatMessage(data);
        break;
    }
  };

  const updateUsers = (data: any) => {
    setUsers(prev => {
      if (data.type === 'user_joined') {
        return [...prev, { username: data.username }];
      } else {
        return prev.filter(user => user.username !== data.username);
      }
    });
  };

  const updateUserCursor = (data: any) => {
    setUsers(prev => 
      prev.map(user => 
        user.username === data.username 
          ? { ...user, cursor: data.position }
          : user
      )
    );
  };

  const applyEdits = (data: any) => {
    if (editorRef.current) {
      editorRef.current.executeEdits(null, data.changes);
    }
  };

  const addChatMessage = (data: any) => {
    setMessages(prev => [...prev, `${data.username}: ${data.message}`]);
  };

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
    
    editor.onDidChangeCursorPosition((e: any) => {
      wsRef.current?.send(JSON.stringify({
        type: 'cursor',
        position: {
          line: e.position.lineNumber,
          column: e.position.column
        }
      }));
    });
  };

  return (
    <div className="collaborative-editor">
      <div className="editor-container">
        <Editor
          height="70vh"
          defaultLanguage={language}
          value={content}
          onMount={handleEditorDidMount}
          onChange={(value) => setContent(value || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
          }}
        />
      </div>
      
      <div className="collaboration-sidebar">
        <div className="users-list">
          <h3>Active Users</h3>
          <ul>
            {users.map(user => (
              <li key={user.username}>
                {user.username}
                {user.cursor && (
                  <span className="cursor-position">
                    Line: {user.cursor.line}, Col: {user.cursor.column}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="chat-section">
          <h3>Chat</h3>
          <div className="messages">
            {messages.map((msg, i) => (
              <div key={i} className="message">{msg}</div>
            ))}
          </div>
          <input
            type="text"
            placeholder="Type a message..."
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                const input = e.target as HTMLInputElement;
                wsRef.current?.send(JSON.stringify({
                  type: 'chat',
                  message: input.value
                }));
                input.value = '';
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CollaborativeEditor; 