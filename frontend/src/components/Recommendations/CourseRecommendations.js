import React, { useState, useRef, useEffect } from 'react';
import { recommendationAPI, chatAPI } from '../../services/api';

// Move styles outside component since it's static and never changes
const styles = `
  .ai-course-chat-container {
    max-width: 540px;
    margin: 40px auto;
    background: #fff;
    border-radius: 18px;
    box-shadow: 0 4px 32px rgba(0,0,0,0.08);
    display: flex;
    flex-direction: column;
    min-height: 600px;
    font-family: 'Segoe UI', Arial, sans-serif;
    overflow: hidden;
  }
  .ai-course-chat-header {
    display: flex;
    align-items: center;
    padding: 24px 28px 16px 28px;
    border-bottom: 1px solid #f0f0f0;
    background: #f9fafb;
  }
  .ai-course-avatar {
    font-size: 2.2rem;
    margin-right: 18px;
  }
  .ai-course-header-text h1 {
    margin: 0;
    font-size: 1.3rem;
    font-weight: 700;
    color: #2d3748;
  }
  .ai-course-header-text p {
    margin: 2px 0 0 0;
    font-size: 1rem;
    color: #718096;
  }
  .ai-course-messages {
    flex: 1;
    overflow-y: auto;
    padding: 24px 18px 12px 18px;
    background: #f7fafc;
  }
  .ai-course-message {
    display: flex;
    align-items: flex-end;
    margin-bottom: 18px;
  }
  .ai-course-message.ai-course-user {
    flex-direction: row-reverse;
  }
  .ai-course-message-avatar {
    font-size: 1.7rem;
    margin: 0 10px;
    user-select: none;
  }
  .ai-course-message-content {
    max-width: 75%;
    display: flex;
    flex-direction: column;
    align-items: flex-start;
  }
  .ai-course-message.ai-course-user .ai-course-message-content {
    align-items: flex-end;
  }
  .ai-course-message-bubble {
    background: #e2e8f0;
    color: #2d3748;
    padding: 12px 16px;
    border-radius: 16px;
    font-size: 1.05rem;
    margin-bottom: 4px;
    word-break: break-word;
    box-shadow: 0 1px 4px rgba(0,0,0,0.03);
    transition: background 0.2s;
  }
  .ai-course-message-bubble.ai-course-bot {
    background: #edf2fa;
    color: #2d3748;
  }
  .ai-course-message-bubble.ai-course-user {
    background: #3182ce;
    color: #fff;
  }
  .ai-course-message-bubble.ai-course-error {
    background: #fff5f5;
    color: #c53030;
    border: 1px solid #feb2b2;
  }
  .ai-course-message-time {
    font-size: 0.82rem;
    color: #a0aec0;
    margin-top: 2px;
    margin-left: 4px;
    margin-right: 4px;
  }
  .ai-course-message.ai-course-user .ai-course-message-time {
    margin-left: 0;
    margin-right: 4px;
  }
  .ai-course-typing-dots {
    display: inline-flex;
    align-items: center;
    margin-right: 8px;
  }
  .ai-course-typing-dots .ai-course-dot {
    width: 6px;
    height: 6px;
    margin: 0 2px;
    background: #a0aec0;
    border-radius: 50%;
    animation: ai-course-blink 1.2s infinite both;
  }
  .ai-course-typing-dots .ai-course-dot:nth-child(2) {
    animation-delay: 0.2s;
  }
  .ai-course-typing-dots .ai-course-dot:nth-child(3) {
    animation-delay: 0.4s;
  }
  @keyframes ai-course-blink {
    0%, 80%, 100% { opacity: 0.2; }
    40% { opacity: 1; }
  }
  .ai-course-example-prompts {
    background: #f1f5f9;
    padding: 18px 28px;
    border-top: 1px solid #e2e8f0;
    text-align: center;
  }
  .ai-course-example-text {
    color: #64748b;
    font-size: 1rem;
    margin-bottom: 10px;
  }
  .ai-course-example-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: center;
  }
  .ai-course-example-btn {
    background: #e2e8f0;
    color: #2d3748;
    border: none;
    border-radius: 14px;
    padding: 8px 18px;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.18s;
  }
  .ai-course-example-btn:hover:not(:disabled) {
    background: #cbd5e1;
  }
  .ai-course-example-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .ai-course-input {
    border-top: 1px solid #e2e8f0;
    background: #f9fafb;
    padding: 16px 24px;
  }
  .ai-course-input-container {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .ai-course-message-input {
    flex: 1;
    border: 1px solid #cbd5e1;
    border-radius: 14px;
    padding: 10px 14px;
    font-size: 1.05rem;
    outline: none;
    background: #fff;
    transition: border 0.18s;
  }
  .ai-course-message-input:focus {
    border-color: #3182ce;
  }
  .ai-course-send-button {
    background: #3182ce;
    color: #fff;
    border: none;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    font-size: 1.3rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: background 0.18s;
  }
  .ai-course-send-button:disabled {
    background: #a0aec0;
    cursor: not-allowed;
  }
  .ai-course-clear-btn {
    background: transparent;
    color: #718096;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 6px 12px;
    font-size: 0.85rem;
    cursor: pointer;
    transition: all 0.2s;
    margin-left: 8px;
  }
  .ai-course-clear-btn:hover {
    background: #f7fafc;
    color: #4a5568;
    border-color: #cbd5e1;
  }
  .ai-course-clear-btn:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  .ai-course-loading-spinner {
    text-align: center;
    padding: 40px;
    color: #718096;
  }
  .ai-course-recommendations {
    margin-top: 12px;
    max-width: 100%;
  }
  .ai-course-grid {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }
  .ai-course-card {
    display: flex;
    background: #fff;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
    transition: box-shadow 0.2s;
  }
  .ai-course-card:hover {
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  }
  .ai-course-icon {
    font-size: 2rem;
    margin-right: 16px;
    flex-shrink: 0;
  }
  .ai-course-details {
    flex: 1;
  }
  .ai-course-details h4 {
    margin: 0 0 8px 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: #2d3748;
  }
  .ai-course-description {
    margin: 0 0 12px 0;
    font-size: 0.95rem;
    color: #4a5568;
    line-height: 1.4;
  }
  .ai-course-tags {
    display: flex;
    gap: 8px;
    margin-bottom: 12px;
  }
  .ai-course-category,
  .ai-course-level {
    font-size: 0.85rem;
    padding: 4px 8px;
    border-radius: 8px;
    font-weight: 500;
  }
  .ai-course-category {
    background: #e6fffa;
    color: #234e52;
  }
  .ai-course-level {
    background: #ebf8ff;
    color: #2c5282;
  }
  .ai-course-link {
    color: #3182ce;
    text-decoration: none;
    font-size: 0.95rem;
    font-weight: 500;
  }
  .ai-course-link:hover {
    text-decoration: underline;
  }
  @media (max-width: 700px) {
    .ai-course-chat-container {
      max-width: 100vw;
      min-height: 100vh;
      border-radius: 0;
    }
    .ai-course-chat-header, .ai-course-input, .ai-course-example-prompts {
      padding-left: 12px;
      padding-right: 12px;
    }
    .ai-course-messages {
      padding-left: 8px;
      padding-right: 8px;
    }
    .ai-course-card {
      flex-direction: column;
      text-align: center;
    }
    .ai-course-icon {
      margin-right: 0;
      margin-bottom: 8px;
    }
  }
`;

const CourseRecommendations = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [chatLoading, setChatLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const examplePrompts = [
    "I want to become a full-stack web developer",
    "I'm interested in data science and machine learning",
    "Help me start a career in mobile app development",
    "I want to learn about digital marketing",
    "I'm a beginner and want to learn programming"
  ];

  // Inject styles into the document head (only once)
  // Since styles is now static and doesn't change, we can use empty dependency array
  useEffect(() => {
    if (!document.getElementById('ai-course-recommendations-styles')) {
      const styleTag = document.createElement('style');
      styleTag.id = 'ai-course-recommendations-styles';
      styleTag.innerHTML = styles;
      document.head.appendChild(styleTag);
    }
  }, []); // Empty dependency array is now safe since styles is static

  // Load chat history on component mount
  useEffect(() => {
    loadChatHistory();
  }, []);

  const loadChatHistory = async () => {
    setChatLoading(true);
    try {
      const chatHistory = await chatAPI.getChatHistory();
      // Convert timestamp strings back to Date objects
      const messagesWithDates = chatHistory.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }));
      setMessages(messagesWithDates);
    } catch (error) {
      console.error('Error loading chat history:', error);
      // Fallback to default message if loading fails
      setMessages([
        {
          id: 1,
          type: 'bot',
          content: "👋 Hi there! I'm your AI learning assistant. Tell me about your career goals, interests, or what you'd like to learn, and I'll recommend the perfect courses for you!",
          timestamp: new Date()
        }
      ]);
    } finally {
      setChatLoading(false);
    }
  };

  // Save messages to database whenever they change
  const saveMessages = async (newMessages) => {
    try {
      await chatAPI.saveChatHistory(newMessages);
    } catch (error) {
      console.error('Error saving chat:', error);
      // Could show a toast notification here
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || loading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInputValue('');
    setLoading(true);

    try {
      const response = await recommendationAPI.getRecommendations(userMessage.content);
      console.log('API Response:', response);
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.recommendation || 'Here are some recommendations for you:',
        courses: response.recommendedCourses || [],
        timestamp: new Date()
      };

      const finalMessages = [...newMessages, botMessage];
      setMessages(finalMessages);
      
      // Save to database
      await saveMessages(finalMessages);
      
    } catch (err) {
      console.error('API Error:', err);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: "I'm sorry, I encountered an issue getting your recommendations. Could you please try again?",
        error: true,
        timestamp: new Date()
      };
      
      const finalMessages = [...newMessages, errorMessage];
      setMessages(finalMessages);
      
      // Save even error messages
      await saveMessages(finalMessages);
      
    } finally {
      setLoading(false);
    }
  };

  const handleExampleClick = (example) => {
    if (loading) return;
    setInputValue(example);
    inputRef.current?.focus();
  };

  const clearChatHistory = async () => {
    if (loading || chatLoading) return;
    
    setChatLoading(true);
    try {
      await chatAPI.clearChatHistory();
      
      const initialMessage = {
        id: 1,
        type: 'bot',
        content: "👋 Hi there! I'm your AI learning assistant. Tell me about your career goals, interests, or what you'd like to learn, and I'll recommend the perfect courses for you!",
        timestamp: new Date()
      };
      
      setMessages([initialMessage]);
    } catch (error) {
      console.error('Error clearing chat:', error);
      // Could show error toast here
    } finally {
      setChatLoading(false);
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    });
  };

  if (chatLoading) {
    return (
      <div className="ai-course-chat-container">
        <div className="ai-course-loading-spinner">
          <div className="ai-course-typing-dots">
            <div className="ai-course-dot"></div>
            <div className="ai-course-dot"></div>
            <div className="ai-course-dot"></div>
          </div>
          <p>Loading your chat history...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ai-course-chat-container">
      {/* Header */}
      <div className="ai-course-chat-header">
        <div className="ai-course-avatar">
          ✨
        </div>
        <div className="ai-course-header-text">
          <h1>AI Course Advisor</h1>
          <p>Your personalized learning companion</p>
        </div>
        <button 
          onClick={clearChatHistory}
          disabled={loading || chatLoading}
          className="ai-course-clear-btn"
          title="Clear chat history"
        >
          🗑️ Clear
        </button>
      </div>

      {/* Messages */}
      <div className="ai-course-messages">
        {messages.map((message) => (
          <div key={message.id} className={`ai-course-message ${message.type === 'user' ? 'ai-course-user' : ''}`}>
            {/* Avatar */}
            <div className="ai-course-message-avatar">
              {message.type === 'bot' ? '🤖' : '👤'}
            </div>

            {/* Message Content */}
            <div className="ai-course-message-content">
              <div className={`ai-course-message-bubble ai-course-${message.type} ${message.error ? 'ai-course-error' : ''}`}>
                {message.content.split('\n').map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>

              {/* Course Cards */}
              {message.courses && Array.isArray(message.courses) && message.courses.length > 0 && (
                <div className="ai-course-recommendations">
                  <div className="ai-course-grid">
                    {message.courses.map((course, index) => (
                      <div key={course._id || course.id || index} className="ai-course-card">
                        <div className="ai-course-icon">
                          📚
                        </div>
                        <div className="ai-course-details">
                          <h4>{course.title || 'Untitled Course'}</h4>
                          <p className="ai-course-description">
                            {course.description && course.description.length > 100 
                              ? course.description.substring(0, 100) + '...'
                              : course.description || 'No description available'
                            }
                          </p>
                          <div className="ai-course-tags">
                            <span className="ai-course-category">{course.category || 'General'}</span>
                            <span className="ai-course-level">{course.level || 'All Levels'}</span>
                          </div>
                          <a href={`/courses/${course._id || course.id}`} className="ai-course-link">
                            📖 View Course
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className={`ai-course-message-time ${message.type === 'user' ? 'ai-course-user' : ''}`}>
                {formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        ))}

        {loading && (
          <div className="ai-course-message">
            <div className="ai-course-message-avatar">
              🤖
            </div>
            <div className="ai-course-message-content">
              <div className="ai-course-message-bubble ai-course-bot">
                <div className="ai-course-typing-dots">
                  <div className="ai-course-dot"></div>
                  <div className="ai-course-dot"></div>
                  <div className="ai-course-dot"></div>
                </div>
                AI is thinking...
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Example Prompts */}
      {messages.length === 1 && (
        <div className="ai-course-example-prompts">
          <p className="ai-course-example-text">Or try one of these examples:</p>
          <div className="ai-course-example-buttons">
            {examplePrompts.map((example, index) => (
              <button
                key={index}
                onClick={() => handleExampleClick(example)}
                disabled={loading}
                className="ai-course-example-btn"
              >
                {example}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="ai-course-input">
        <div className="ai-course-input-container">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Ask me about courses, career paths, or learning goals..."
            disabled={loading}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            className="ai-course-message-input"
          />
          <button
            onClick={handleSubmit}
            disabled={loading || !inputValue.trim()}
            className="ai-course-send-button"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseRecommendations;