// frontend/src/pages/Messages/Inbox.tsx
// Enhanced inbox with success notifications and better UX
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getConversations, createConversation } from '../../api/messages';
import ConversationList from '../../components/messages/ConversationList';
import MessageThread from '../../components/messages/MessageThread';
import NewMessageModal from '../../components/messages/NewMessageModal';

interface Conversation {
  id: string;
  participants: Array<{
    id: number;
    full_name: string;
    profile_image?: string;
  }>;
  property?: {
    id: number;
    title: string;
  };
  last_message?: {
    id: number;
    content: string;
    sender_id: number;
    created_at: string;
    is_read: boolean;
  };
  unread_count: number;
  updated_at: string;
}

// Success/Error notification component
const Notification: React.FC<{
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
}> = ({ type, message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000); // Auto-close after 5 seconds

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-md p-4 rounded-lg shadow-lg ${
      type === 'success' 
        ? 'bg-green-100 border border-green-400 text-green-700' 
        : 'bg-red-100 border border-red-400 text-red-700'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {type === 'success' ? (
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
          <span className="font-medium">{message}</span>
        </div>
        <button
          onClick={onClose}
          className="ml-4 text-gray-400 hover:text-gray-600"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const Inbox: React.FC = () => {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  useEffect(() => {
    if (token) {
      fetchConversations();
    }
  }, [token]);

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
  };

  const hideNotification = () => {
    setNotification(null);
  };

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getConversations(token!);
      setConversations(data);
      
      // Auto-select first conversation on desktop
      if (data.length > 0 && window.innerWidth >= 768) {
        setSelectedConversation(data[0].id);
      }
    } catch (err: any) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const handleConversationSelect = (conversationId: string) => {
    setSelectedConversation(conversationId);
    
    // On mobile, navigate to conversation page
    if (window.innerWidth < 768) {
      navigate(`/messages/${conversationId}`);
    }
  };

  const handleNewConversation = async (
    receiverId: number, 
    propertyId?: number, 
    initialMessage?: string
  ) => {
    try {
      console.log('handleNewConversation called with:', { receiverId, propertyId, initialMessage });
      
      // Comprehensive validation
      if (!receiverId) {
        throw new Error('Receiver ID is required');
      }

      if (typeof receiverId !== 'number') {
        throw new Error('Receiver ID must be a number');
      }

      if (receiverId <= 0) {
        throw new Error('Invalid receiver ID - must be positive');
      }

      if (receiverId === user?.id) {
        throw new Error('Cannot send message to yourself');
      }

      if (propertyId !== undefined && propertyId <= 0) {
        throw new Error('Invalid property ID');
      }

      console.log('Validation passed, creating conversation...');

      const conversation = await createConversation(
        token!, 
        receiverId, 
        propertyId, 
        initialMessage
      );

      console.log('Conversation created successfully:', conversation);

      // Show success notification
      const participantName = conversation.participants.find(p => p.id !== user?.id)?.full_name || 'User';
      
      if (initialMessage) {
        showNotification('success', `Message sent to ${participantName} successfully!`);
      } else {
        showNotification('success', `Conversation started with ${participantName}!`);
      }

      // Refresh conversations
      await fetchConversations();
      
      // Select the new conversation
      setSelectedConversation(conversation.id);
      setShowNewMessage(false);

    } catch (err: any) {
      console.error('Error creating conversation:', err);
      
      // Show specific error message
      let errorMessage = 'Failed to start conversation';
      
      if (err.message) {
        errorMessage = err.message;
      } else if (err.response?.data?.detail) {
        errorMessage = err.response.data.detail;
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      }
      
      showNotification('error', errorMessage);
    }
  };

  const selectedConversationData = conversations.find(c => c.id === selectedConversation);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-50">
      {/* Notification */}
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={hideNotification}
        />
      )}

      {/* Sidebar - Conversation List */}
      <div className={`bg-white border-r border-gray-200 ${
        selectedConversation ? 'hidden md:block' : 'block'
      } md:w-1/3 lg:w-1/4 xl:w-1/3 w-full`}>
        {/* Header */}
        <div className="border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
            <button
              onClick={() => setShowNewMessage(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2 transition-colors"
              title="New Message"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto">
          {error ? (
            <div className="p-4 text-center">
              <div className="text-red-600 mb-2">{error}</div>
              <button
                onClick={fetchConversations}
                className="text-blue-600 hover:text-blue-800 text-sm"
              >
                Try Again
              </button>
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-6 text-center">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No conversations yet</h3>
              <p className="text-gray-600 mb-4">Start a conversation by contacting a property owner or tenant.</p>
              <button
                onClick={() => setShowNewMessage(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
              >
                Start New Conversation
              </button>
            </div>
          ) : (
            <ConversationList
              conversations={conversations}
              selectedConversation={selectedConversation}
              onConversationSelect={handleConversationSelect}
              currentUserId={user?.id}
            />
          )}
        </div>
      </div>

      {/* Main Content - Message Thread */}
      <div className={`flex-1 flex flex-col ${
        selectedConversation ? 'block' : 'hidden md:flex'
      }`}>
        {selectedConversation && selectedConversationData ? (
          <MessageThread
            conversationId={selectedConversation}
            conversation={selectedConversationData}
            onBack={() => setSelectedConversation(null)}
            onConversationUpdate={fetchConversations}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <svg className="w-24 h-24 mx-auto text-gray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="text-xl font-medium text-gray-900 mb-2">Welcome to Messages</h3>
              <p className="text-gray-600 max-w-sm mx-auto">
                Select a conversation from the sidebar to start chatting, or create a new conversation.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* New Message Modal */}
      <NewMessageModal
        isOpen={showNewMessage}
        onClose={() => setShowNewMessage(false)}
        onCreateConversation={handleNewConversation}
      />
    </div>
  );
};

export default Inbox;