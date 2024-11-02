import React, { useState, useRef } from 'react';
import { Editor } from '@monaco-editor/react';
import './AIEditor.scss';

interface AIEditorProps {
  language?: string;
}

const AIEditor: React.FC<AIEditorProps> = ({ language = 'typescript' }) => {
  const [code, setCode] = useState<string>('// Start coding here...');
  const [suggestion, setSuggestion] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const editorRef = useRef<any>(null);

  const handleEditorDidMount = (editor: any) => {
    editorRef.current = editor;
  };

  const requestSuggestion = async () => {
    if (!editorRef.current) return;

    const currentPosition = editorRef.current.getPosition();
    const model = editorRef.current.getModel();
    const context = model.getValueInRange({
      startLineNumber: Math.max(1, currentPosition.lineNumber - 10),
      startColumn: 1,
      endLineNumber: currentPosition.lineNumber,
      endColumn: currentPosition.column,
    });

    setIsLoading(true);
    try {
      const response = await fetch('/api/ai/suggest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          context,
          language,
          cursorPosition: currentPosition,
        }),
      });

      const data = await response.json();
      setSuggestion(data.suggestion);
    } catch (error) {
      console.error('Failed to get AI suggestion:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applySuggestion = () => {
    if (!editorRef.current || !suggestion) return;

    const position = editorRef.current.getPosition();
    editorRef.current.executeEdits('ai-suggestion', [{
      range: {
        startLineNumber: position.lineNumber,
        startColumn: position.column,
        endLineNumber: position.lineNumber,
        endColumn: position.column,
      },
      text: suggestion,
    }]);
    setSuggestion('');
  };

  return (
    <div className="ai-editor">
      <div className="editor-container">
        <Editor
          height="70vh"
          defaultLanguage={language}
          value={code}
          onMount={handleEditorDidMount}
          onChange={(value) => setCode(value || '')}
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            suggestOnTriggerCharacters: true,
          }}
        />
        {isLoading && (
          <div className="loading-indicator">
            Getting AI suggestion...
          </div>
        )}
        {suggestion && (
          <div className="suggestion-popup">
            <pre>{suggestion}</pre>
            <div className="suggestion-actions">
              <button onClick={applySuggestion}>Apply</button>
              <button onClick={() => setSuggestion('')}>Dismiss</button>
            </div>
          </div>
        )}
      </div>
      <div className="ai-sidebar">
        <div className="ai-controls">
          <button 
            className="button-primary"
            onClick={requestSuggestion}
            disabled={isLoading}
          >
            Get AI Suggestion (Ctrl+Space)
          </button>
        </div>
        <div className="ai-hints">
          <h3>AI Assistant Tips</h3>
          <ul>
            <li>Press Ctrl+Space for suggestions</li>
            <li>Type // followed by a comment for specific suggestions</li>
            <li>Select code and press Ctrl+Space for context-aware help</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AIEditor; 