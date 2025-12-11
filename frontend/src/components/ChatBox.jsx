import { useState } from 'react';
import { sendChatMessage } from '../services/api.js';

function ChatBox({ analysisId, analysis }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: `Hi! I'm your AI career advisor. I've analyzed your resume and the job description you're applying for. I can answer questions about:
• Your specific skills and experience
• How well you match this role
• What skills you should develop
• How to improve your resume
• Interview preparation tips

Ask me anything about your career or this job application!`
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const suggestedQuestions = [
    "What are my strongest qualifications for this role?",
    "Which skills from my resume match the job requirements?",
    "What experience should I highlight in my interview?",
    "How can I address the missing skills in my application?",
    "What projects from my resume are most relevant?"
  ];

  const handleSend = async (question) => {
    const messageToSend = question || input;
    if (!messageToSend.trim()) return;

    const userMessage = { role: 'user', content: messageToSend };
    setMessages([...messages, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Prepare context from analysis data
      const context = {
        resumeText: analysis.resumeText || '',
        jobDescription: analysis.jobDescription || '',
        matchScore: analysis.matchScore || analysis.score || 0,
        skills: analysis.skills || { matched: [], missing: [] },
        gaps: analysis.gaps || [],
        recommendations: analysis.recommendations || []
      };

      // Build chat history (exclude system message, only user/assistant exchanges)
      const chatHistory = messages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .slice(1) // Skip initial welcome message
        .map(m => ({ role: m.role, content: m.content }));

      const response = await sendChatMessage(analysisId, messageToSend, context, chatHistory);
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
    <div className="card p-6">
      {/* Chat Messages */}
      <div className="mb-6 space-y-4 max-h-96 overflow-y-auto">
        {messages.map((msg, index) => (
          <div key={index} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center text-xl ${
              msg.role === 'user' 
                ? 'bg-blue-100 dark:bg-blue-900/30' 
                : 'bg-purple-100 dark:bg-purple-900/30'
            }`}>
              {msg.role === 'user' ? '👤' : '🤖'}
            </div>
            <div className={`flex-1 ${msg.role === 'user' ? 'text-right' : ''}`}>
              <div className={`text-xs font-semibold mb-1 ${
                msg.role === 'user' 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-purple-600 dark:text-purple-400'
              }`}>
                {msg.role === 'user' ? 'You' : 'AI Career Advisor'}
              </div>
              <div className={`inline-block px-4 py-3 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100'
              }`}>
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-xl">
              🤖
            </div>
            <div>
              <div className="text-xs font-semibold text-purple-600 dark:text-purple-400 mb-1">
                AI Career Advisor
              </div>
              <div className="inline-block px-4 py-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                  <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggested Questions (only show if no user messages yet) */}
      {messages.filter(m => m.role === 'user').length === 0 && (
        <div className="mb-6">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedQuestions.map((question, index) => (
              <button
                key={index}
                className="px-4 py-2 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-lg text-sm transition-colors disabled:opacity-50"
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
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && !loading && handleSend()}
          placeholder="Ask me anything about your career..."
          className="input-field flex-1"
          disabled={loading}
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !input.trim()}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '⏳' : '📤'}
        </button>
      </div>
    </div>
  );
}

export default ChatBox;
