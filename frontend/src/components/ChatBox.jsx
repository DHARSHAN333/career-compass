import { useState } from 'react';
import { sendChatMessage } from '../services/api.js';
import './ChatBox.css';

function ChatBox({ analysisId, analysis }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Hi! I\'m your AI career advisor. Ask me anything about improving your resume, developing skills, or preparing for this job role.'
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const suggestedQuestions = [
    "What skills should I prioritize learning?",
    "How can I make my resume stronger?",
    "Am I ready for this job?",
    "What certifications would help me?",
    "How should I highlight my projects?"
  ];

  const handleSend = async (question) => {
    const messageToSend = question || input;
    if (!messageToSend.trim()) return;

    const userMessage = { role: 'user', content: messageToSend };
    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const response = await sendChatMessage(analysisId, messageToSend);
      const assistantMessage = { role: 'assistant', content: response.response };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error. Please try again or rephrase your question.' 
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionClick = (question) => {
    handleSend(question);
  };

  return (
    <div className="chat-box">
      {/* Chat Messages */}
      <div className="chat-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message message-${msg.role}`}>
            <div className="message-avatar">
              {msg.role === 'user' ? '👤' : '🤖'}
            </div>
            <div className="message-content">
              <div className="message-role">
                {msg.role === 'user' ? 'You' : 'AI Career Advisor'}
              </div>
              <div className="message-text">{msg.content}</div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="message message-assistant">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="message-role">AI Career Advisor</div>
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Questions (only show if no user messages yet) */}
      {messages.filter(m => m.role === 'user').length === 0 && (
        <div className="suggested-questions">
          <p className="suggested-label">Try asking:</p>
          <div className="question-buttons">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                className="question-btn"
                onClick={() => handleQuestionClick(question)}
                disabled={loading}
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Input Area */}
      <div className="chat-input-container">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !loading && handleSend()}
          placeholder="Ask me anything about your career..."
          className="chat-input"
          disabled={loading}
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          className="send-button"
        >
          {loading ? '⏳' : '📤'}
        </button>
      </div>
    </div>
  );
}

export default ChatBox;
