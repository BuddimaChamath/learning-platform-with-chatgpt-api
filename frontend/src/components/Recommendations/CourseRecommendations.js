import React, { useState, useRef, useEffect } from 'react';
import { recommendationAPI, chatAPI } from '../../services/api';

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