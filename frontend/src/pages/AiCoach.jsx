import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Send, 
  Bot, 
  User, 
  Sparkles, 
  MessageSquare,
  Zap,
  Heart,
  Target,
  TrendingUp,
  Clock,
  Trash2,
  ChefHat,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { aiCoachAPI } from '../services/api';

const AiCoach = () => {
  const { user } = useAuth();
  
  // Load messages from localStorage or use default
  const getInitialMessages = () => {
    try {
      const savedMessages = localStorage.getItem('aicoach_messages');
      if (savedMessages) {
        const parsed = JSON.parse(savedMessages);
        // Ensure we have valid messages and convert timestamp strings back to Date objects
        if (parsed.length > 0) {
          const messagesWithDates = parsed.map(msg => ({
            ...msg,
            timestamp: new Date(msg.timestamp)
          }));
          return messagesWithDates;
        }
      }
    } catch (error) {
      console.error('Error loading saved messages:', error);
      // Clear corrupted data
      localStorage.removeItem('aicoach_messages');
    }
    
    // Return default welcome message
    return [
      {
        id: 1,
        type: 'bot',
        content: `Hello ${user?.firstName || 'there'}! 👋 I'm your Fitness AI. I'm here to help you with workout routines, nutrition advice, healthy recipes, fitness goals, and any questions about using FitMe+. How can I assist you today?`,
        timestamp: new Date()
      }
    ];
  };

  const [messages, setMessages] = useState(() => {
    const initialMessages = getInitialMessages();
    console.log('Initial messages loaded:', initialMessages);
    return initialMessages;
  });
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestedQuestions, setSuggestedQuestions] = useState([]);
  const [showRecipes, setShowRecipes] = useState(false);
  const [currentRecipes, setCurrentRecipes] = useState(null);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  /**
   * Clean text to remove any remaining formatting characters
   */
  const cleanDisplayText = (text) => {
    if (!text) return '';
    
    // Remove any remaining asterisks and other markdown formatting
    let cleaned = text.replace(/\*\*/g, ''); // Remove bold formatting (**)
    cleaned = cleaned.replace(/\*/g, ''); // Remove italic formatting (*)
    cleaned = cleaned.replace(/#{1,6}\s/g, ''); // Remove headers
    cleaned = cleaned.replace(/```[\w]*\n?/g, ''); // Remove code block markers with optional language
    cleaned = cleaned.replace(/```/g, ''); // Remove remaining code block markers
    cleaned = cleaned.replace(/`/g, ''); // Remove inline code formatting
    cleaned = cleaned.replace(/^\s*[-*+]\s/gm, '• '); // Convert markdown lists to bullet points
    
    // Clean up extra whitespace
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');
    cleaned = cleaned.trim();
    
    return cleaned;
  };

  // Save messages to localStorage whenever messages change
  useEffect(() => {
    try {
      // Only save if we have valid messages
      if (messages && messages.length > 0) {
        const messagesToSave = messages.map(msg => ({
          ...msg,
          timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp
        }));
        localStorage.setItem('aicoach_messages', JSON.stringify(messagesToSave));
      }
    } catch (error) {
      console.error('Error saving messages:', error);
    }
  }, [messages]);

  // Fetch personalized suggestions on component mount
  useEffect(() => {
    fetchSuggestedQuestions();
  }, []);

  const fetchSuggestedQuestions = async () => {
    try {
      // Debug: Check if user is authenticated and token exists
      const token = localStorage.getItem('fitme_token');
      console.log('Debug: Token exists:', !!token);
      console.log('Debug: User authenticated:', !!user);
      console.log('Debug: User object:', user);
      
      if (!token || !user) {
        console.warn('No authentication token or user found');
        setSuggestedQuestions([
          "How do I set up my workout routine?",
          "What's a good beginner workout plan?",
          "Can you suggest healthy recipes for weight loss?",
          "How can I track my nutrition?",
          "What exercises are best for building muscle?",
          "How do I stay motivated?",
          "Can you create a meal plan for me?",
          "What's the best way to track progress?"
        ]);
        return;
      }
      
      const response = await aiCoachAPI.getSuggestions();
      if (response.success) {
        setSuggestedQuestions(response.suggestions);
      }
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      
      // If 401 error, try using bypass endpoint temporarily
      if (error.response?.status === 401) {
        console.error('Authentication failed - trying bypass endpoint');
        try {
          const bypassResponse = await fetch('http://localhost:8000/api/aicoach/suggestions-bypass');
          if (bypassResponse.ok) {
            const data = await bypassResponse.json();
            if (data.success) {
              setSuggestedQuestions(data.suggestions);
              return;
            }
          }
        } catch (bypassError) {
          console.error('Bypass endpoint also failed:', bypassError);
        }
        setError('Please login to access AI Coach features');
      }
      
      // Use default suggestions if API fails
      setSuggestedQuestions([
        "How do I set up my workout routine?",
        "What's a good beginner workout plan?",
        "Can you suggest healthy recipes for weight loss?",
        "How can I track my nutrition?",
        "What exercises are best for building muscle?",
        "How do I stay motivated?",
        "Can you create a meal plan for me?",
        "What's the best way to track progress?"
      ]);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    setError(null);
    setShowRecipes(false);

    try {
      // Build conversation history for context
      const conversationHistory = messages.slice(-10).map(msg => ({
        role: msg.type === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      // Call the AI Coach API through FastAPI backend
      const response = await aiCoachAPI.chat(inputMessage, conversationHistory);

      if (response.success) {
        // Clean the response text before displaying
        const cleanedResponse = cleanDisplayText(response.response);
        
        const botResponse = {
          id: Date.now() + 1,
          type: 'bot',
          content: cleanedResponse,
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, botResponse]);

        // If recipes were generated, show them
        if (response.recipes && response.recipes.length > 0) {
          setCurrentRecipes(response.recipes);
          setShowRecipes(true);
        }
      } else {
        throw new Error(response.message || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      let errorMessage = "I'm having trouble connecting right now. ";
      
      if (error.response?.status === 500 && error.response?.data?.error?.includes('GEMINI_API_KEY')) {
        errorMessage += "The AI service is not properly configured. Please contact the administrator.";
      } else if (error.response?.status === 429) {
        errorMessage += "We've hit the rate limit. Please try again in a few moments.";
      } else if (error.response?.status === 401) {
        errorMessage += "Your session has expired. Please log in again.";
        // Redirect to login page after a short delay
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        errorMessage += "Please try again later or check your internet connection.";
      }

      const errorResponse = {
        id: Date.now() + 1,
        type: 'bot',
        content: errorMessage,
        isError: true,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorResponse]);
      setError(errorMessage);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestedQuestion = (question) => {
    setInputMessage(question);
    inputRef.current?.focus();
  };

  const clearChat = () => {
    const defaultMessages = [
      {
        id: 1,
        type: 'bot',
        content: `Hello ${user?.firstName || 'there'}! 👋 I'm your Fitness AI. I'm here to help you with workout routines, nutrition advice, healthy recipes, fitness goals, and any questions about using FitMe+. How can I assist you today?`,
        timestamp: new Date()
      }
    ];
    
    setMessages(defaultMessages);
    setShowRecipes(false);
    setCurrentRecipes(null);
    setError(null);
    
    // Clear from localStorage
    try {
      localStorage.removeItem('aicoach_messages');
    } catch (error) {
      console.error('Error clearing saved messages:', error);
    }
  };

  const formatTime = (timestamp) => {
    try {
      // Ensure timestamp is a Date object
      const date = timestamp instanceof Date ? timestamp : new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch (error) {
      console.error('Error formatting time:', error);
      return '';
    }
  };

  const RecipeCard = ({ recipe }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow"
    >
      <h4 className="font-semibold text-gray-900 mb-2">{recipe.name}</h4>
      <p className="text-sm text-gray-600 mb-3">{recipe.description}</p>
      
      <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">Prep: {recipe.prepTime}</span>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-gray-600">Cook: {recipe.cookTime}</span>
        </div>
      </div>

      <div className="flex gap-3 mb-3 text-sm">
        <span className="text-gray-900 font-medium">{recipe.calories} cal</span>
        <span className="text-gray-600">P: {recipe.protein}</span>
        <span className="text-gray-600">C: {recipe.carbs}</span>
        <span className="text-gray-600">F: {recipe.fat}</span>
      </div>

      <div className="space-y-2">
        <div>
          <h5 className="font-medium text-gray-900 text-sm mb-1">Ingredients:</h5>
          <ul className="text-sm text-gray-600 list-disc list-inside">
            {recipe.ingredients?.map((ingredient, idx) => (
              <li key={idx}>{ingredient}</li>
            ))}
          </ul>
        </div>
        
        <div>
          <h5 className="font-medium text-gray-900 text-sm mb-1">Instructions:</h5>
          <ol className="text-sm text-gray-600 list-decimal list-inside">
            {recipe.instructions?.map((instruction, idx) => (
              <li key={idx}>{instruction}</li>
            ))}
          </ol>
        </div>
      </div>

      {recipe.tags && (
        <div className="flex gap-2 mt-3">
          {recipe.tags.map((tag, idx) => (
            <span key={idx} className="px-2 py-1 bg-[#FFF8ED] text-gray-900 text-xs rounded-full">
              {tag}
            </span>
          ))}
        </div>
      )}
    </motion.div>
  );

  return (
    <div className="min-h-screen p-4 sm:p-6" style={{ backgroundColor: '#FAF7F2' }}>
      <div className="max-w-6xl mx-auto">
        {/* Page Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <div className="flex items-center gap-4">
            <Bot className="w-8 h-8 text-gray-900" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Fitness AI</h1>
              <p className="text-gray-600 mt-1">Your personal AI assistant for fitness and wellness</p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Suggested Questions Sidebar */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-[600px] flex flex-col">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-gray-900" />
                <h3 className="font-semibold text-gray-900">Suggested Questions</h3>
              </div>
              <div className="space-y-2 flex-1 overflow-y-auto">
                {suggestedQuestions.map((question, index) => (
                  <motion.button
                    key={index}
                    onClick={() => handleSuggestedQuestion(question)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full text-left p-3 text-sm text-gray-600 hover:text-gray-900 hover:bg-[#FFF8ED] rounded-lg transition-colors border border-gray-100 hover:border-[#EADFD0]"
                  >
                    {question}
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Chat Interface */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="lg:col-span-3"
          >
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex flex-col h-[600px]">
              {/* Chat Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Bot className="w-6 h-6 text-gray-900" />
                    <div>
                      <h3 className="font-semibold text-gray-900">Fitness AI</h3>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-gray-500">Online and ready to help</span>
                      </div>
                    </div>
                  </div>
                  <motion.button
                    onClick={clearChat}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                    title="Clear chat history"
                  >
                    <Trash2 className="w-4 h-4" />
                    Clear Chat
                  </motion.button>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      className={`flex gap-3 ${message.type === 'user' ? 'justify-end' : ''}`}
                    >
                      {message.type === 'bot' && (
                        <div className="w-8 h-8 flex items-center justify-center flex-shrink-0">
                          <Bot className="w-5 h-5 text-gray-900" />
                        </div>
                      )}
                      
                      <div className={`max-w-[80%] ${message.type === 'user' ? 'order-first' : ''}`}>
                        <div className={`rounded-2xl px-4 py-3 ${
                          message.type === 'user' 
                            ? 'bg-gray-900 text-white' 
                            : message.isError 
                              ? 'bg-red-50 text-red-900 border border-red-200'
                              : 'bg-gray-100 text-gray-900'
                        }`}>
                          {message.isError && (
                            <div className="flex items-center gap-2 mb-2">
                              <AlertCircle className="w-4 h-4" />
                              <span className="font-medium text-sm">Error</span>
                            </div>
                          )}
                          <p className="text-sm leading-relaxed whitespace-pre-line">
                            {message.content}
                          </p>
                        </div>
                        <p className={`text-xs text-gray-500 mt-1 ${
                          message.type === 'user' ? 'text-right' : 'text-left'
                        }`}>
                          {formatTime(message.timestamp)}
                        </p>
                      </div>

                      {message.type === 'user' && (
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center flex-shrink-0">
                          <User className="w-5 h-5 text-gray-600" />
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                {/* Recipe Cards */}
                {showRecipes && currentRecipes && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <ChefHat className="w-5 h-5 text-gray-900" />
                      <h3 className="font-semibold text-gray-900">Suggested Recipes</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {currentRecipes.map((recipe, index) => (
                        <RecipeCard key={index} recipe={recipe} />
                      ))}
                    </div>
                  </motion.div>
                )}

                {/* Typing Indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex gap-3"
                  >
                    <div className="w-8 h-8 flex items-center justify-center">
                      <Bot className="w-5 h-5 text-gray-900" />
                    </div>
                    <div className="bg-gray-100 rounded-2xl px-4 py-3">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </motion.div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-6 border-t border-gray-200">
                <div className="relative">
                  <input
                    ref={inputRef}
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    placeholder="Ask about workouts, nutrition, recipes, or fitness tips..."
                    className="w-full pr-12 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#EADFD0] focus:border-transparent transition-all duration-200"
                    disabled={isTyping}
                  />
                  <motion.button
                    onClick={handleSendMessage}
                    disabled={!inputMessage.trim() || isTyping}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-label="Send message"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-5 h-5" />
                  </motion.button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Press Enter to send • Ask about workouts, nutrition, recipes, or app features
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AiCoach;