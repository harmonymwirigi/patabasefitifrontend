// File: frontend/src/pages/Messages/Conversation.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getConversationMessages, sendMessage, markConversationAsRead } from '../../api/messages';
import { useAuth } from '../../hooks/useAuth';
import MessageComposer from '../../components/messages/MessageComposer';

const Conversation: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { token, user } = useAuth();
  
  const [messages, setMessages] = useState<any[]>([]);
  const [otherUser, setOtherUser] = useState<any>(null);
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (token && conversationId) {
      fetchMessages();
      markAsRead();
    }
  }, [token, conversationId]);

  const fetchMessages = async () => {
    if (!token || !conversationId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await getConversationMessages(token, conversationId);
      setMessages(data.messages);
      setOtherUser(data.other_user);
      setProperty(data.property);
    } catch (err) {
      console.error('Error fetching messages:', err);
      setError('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async () => {
    if (!token || !conversationId) return;
    
    try {
      await markConversationAsRead(token, conversationId);
    } catch (err) {
      console.error('Error marking conversation as read:', err);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!token || !conversationId || !content.trim()) return;
    
    try {
      const newMessage = await sendMessage(token, {
        conversation_id: conversationId,
        content,
      });
      
      setMessages([...messages, newMessage]);
      scrollToBottom();
    } catch (err) {
      console.error('Error sending message:', err);
      setError('Failed to send message');
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      hour: 'numeric',
      minute: 'numeric',
      day: 'numeric',
      month: 'short',
    }).format(date);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          to="/messages"
          className="inline-flex items-center text-blue-600 hover:text-blue-800"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Messages
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
          {error}
        </div>
      )}
      
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {/* Conversation header */}
        <div className="bg-gray-50 p-4 border-b">
          <div className="flex items-center">
            {otherUser?.profile_image ? (
              <img
                src={`/uploads/${otherUser.profile_image}`}
                alt={otherUser?.full_name}
                className="h-10 w-10 rounded-full object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center">
                <span className="text-blue-600 font-medium">
                  {otherUser?.full_name?.charAt(0).toUpperCase() || '?'}
                </span>
              </div>
            )}
            
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900">
                {otherUser?.full_name || 'User'}
              </p>
              
              {property && (
                <p className="text-xs text-gray-500">
                  Re: {property.title}
                </p>
              )}
            </div>
          </div>
        </div>
        
        {/* Messages list */}
        <div className="p-4 h-96 overflow-y-auto">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender_id === user?.id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs sm:max-w-md rounded-lg px-4 py-2 ${
                      message.sender_id === user?.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.sender_id === user?.id ? 'text-blue-200' : 'text-gray-500'
                      }`}
                    >
                      {formatDate(message.created_at)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
        
        {/* Message composer */}
        <div className="p-4 border-t">
          <MessageComposer
            conversationId={conversationId}
            onSend={handleSendMessage}
          />
        </div>
      </div>
    </div>
  );
};

export default Conversation;