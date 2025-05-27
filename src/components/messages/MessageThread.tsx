// frontend/src/components/messages/MessageThread.tsx
// Component to display message thread and handle message sending
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { getMessages, sendMessage, markMessageAsRead } from '../../api/messages';
import MessageBubble from './MessageBubble';
import MessageComposer from './MessageComposer';
import { formatDistanceToNow } from 'date-fns';

interface Message {
  id: number;
  conversation_id: string;
  sender_id: number;
  receiver_id: number;
  content: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  sender: {
    id: number;
    full_name: string;
    profile_image?: string;
  };
}

interface Participant {
  id: number;
  full_name: string;
  profile_image?: string;
}

interface Property {
  id: number;
  title: string;
}

interface Conversation {
  id: string;
  participants: Participant[];
  property?: Property;
  last_message?: any;
  unread_count: number;
  updated_at: string;
}

interface MessageThreadProps {
  conversationId: string;
  conversation: Conversation;
  onBack: () => void;
  onConversationUpdate: () => void;
}

const MessageThread: React.FC<MessageThreadProps> = ({
  conversationId,
  conversation,
  onBack,
  onConversationUpdate
}) => {
  const { token, user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messageContainerRef = useRef<HTMLDivElement>(null);

  // Get the other participant
  const otherParticipant = conversation.participants.find(p => p.id !== user?.id) || conversation.participants[0];

  useEffect(() => {
    if (conversationId && token) {
      fetchMessages();
    }
  }, [conversationId, token]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Mark messages as read when component mounts or conversation changes
    if (conversationId && token && user) {
      markMessagesAsRead();
    }
  }, [conversationId, token, user]);

  const fetchMessages = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getMessages(token!, conversationId);
      setMessages(data);
    } catch (err: any) {
      console.error('Error fetching messages:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  const markMessagesAsRead = async () => {
    try {
      // Find unread messages from other participants
      const unreadMessages = messages.filter(
        msg => !msg.is_read && msg.sender_id !== user?.id
      );

      for (const message of unreadMessages) {
        await markMessageAsRead(token!, message.id);
      }

      if (unreadMessages.length > 0) {
        // Refresh conversations to update unread count
        onConversationUpdate();
        // Refresh messages to update read status
        fetchMessages();
      }
    } catch (err) {
      console.error('Error marking messages as read:', err);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || !token || sending) return;

    setSending(true);
    try {
      const newMessage = await sendMessage(token, conversationId, otherParticipant.id, content);
      
      // Add the new message to the list
      setMessages(prev => [...prev, newMessage]);
      
      // Update conversation list
      onConversationUpdate();
      
      // Scroll to bottom
      setTimeout(scrollToBottom, 100);
    } catch (err: any) {
      console.error('Error sending message:', err);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  const formatDate = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return '';
    }
  };

  // Group messages by date
  const groupMessagesByDate = (messages: Message[]) => {
    const groups: { [key: string]: Message[] } = {};
    
    messages.forEach(message => {
      const date = new Date(message.created_at).toDateString();
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(message);
    });
    
    return groups;
  };

  const messageGroups = groupMessagesByDate(messages);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 bg-white">
        <div className="flex items-center">
          {/* Back button (mobile) */}
          <button
            onClick={onBack}
            className="md:hidden mr-3 p-1 rounded-full hover:bg-gray-100"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Participant Avatar */}
          <div className="flex-shrink-0">
            {otherParticipant.profile_image ? (
              <img
                src={`/uploads/${otherParticipant.profile_image}`}
                alt={otherParticipant.full_name}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-600 font-medium">
                  {otherParticipant.full_name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Participant Info */}
          <div className="ml-3 flex-1">
            <h2 className="text-lg font-semibold text-gray-900">
              {otherParticipant.full_name}
            </h2>
            
            {conversation.property && (
              <div className="flex items-center text-sm text-gray-500">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" clipRule="evenodd" />
                </svg>
                <span>{conversation.property.title}</span>
              </div>
            )}
          </div>

          {/* Options Menu */}
          <div className="flex items-center space-x-2">
            <button className="p-2 rounded-full hover:bg-gray-100 text-gray-600">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div 
        ref={messageContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4"
        style={{ scrollBehavior: 'smooth' }}
      >
        {error ? (
          <div className="text-center py-8">
            <div className="text-red-600 mb-2">{error}</div>
            <button
              onClick={fetchMessages}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              Try Again
            </button>
          </div>
        ) : Object.keys(messageGroups).length === 0 ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No messages yet</h3>
            <p className="text-gray-600">
              Start the conversation by sending a message below.
            </p>
          </div>
        ) : (
          Object.entries(messageGroups).map(([date, dateMessages]) => (
            <div key={date}>
              {/* Date Separator */}
              <div className="flex items-center justify-center py-2">
                <div className="bg-gray-100 rounded-full px-3 py-1">
                  <span className="text-xs text-gray-600 font-medium">
                    {formatDate(dateMessages[0].created_at)}
                  </span>
                </div>
              </div>

              {/* Messages for this date */}
              <div className="space-y-2">
                {dateMessages.map((message, index) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    isOwn={message.sender_id === user?.id}
                    showAvatar={
                      index === 0 || 
                      dateMessages[index - 1].sender_id !== message.sender_id
                    }
                    showTime={
                      index === dateMessages.length - 1 ||
                      dateMessages[index + 1].sender_id !== message.sender_id
                    }
                  />
                ))}
              </div>
            </div>
          ))
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Message Composer */}
      <div className="border-t border-gray-200 bg-white">
        <MessageComposer
          onSendMessage={handleSendMessage}
          disabled={sending}
          placeholder={`Message ${otherParticipant.full_name}...`}
        />
      </div>
    </div>
  );
};

export default MessageThread;