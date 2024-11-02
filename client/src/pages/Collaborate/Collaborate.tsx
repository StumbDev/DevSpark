import React from 'react';
import { useParams } from 'react-router-dom';
import CollaborativeEditor from '../../components/CollaborativeEditor/CollaborativeEditor';

const Collaborate: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>();
  
  return (
    <div className="collaborate-page">
      <CollaborativeEditor
        roomId={roomId || 'default'}
        initialContent="// Start coding here..."
      />
    </div>
  );
};

export default Collaborate; 