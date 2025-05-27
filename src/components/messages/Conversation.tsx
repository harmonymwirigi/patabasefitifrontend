// frontend/src/pages/Messages/Conversation.tsx
// Fixed import - using correct function name
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { getConversation } from '../../api/messages'; // Correct import
import MessageThread from '../../components/messages/MessageThread';

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
  last_message?: any;
  unread_count: number;
  updated_at: string;
}

const ConversationPage: React.FC = () => {
  const { conversationId } = useParams<{ conversationId: string }>();
  const { token } = useAuth();
  const navigate = useNavigate();
  
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (conversationId && token) {
      fetchConversation();
    }
  }, [conversationId, token]);

  const fetchConversation = async () => {
    if (!conversationId || !token) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getConversation(token, conversationId);
      setConversation(data);
    } catch (err: any) {
      console.error('Error fetching conversation:', err);
      setError('Failed to load conversation');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/messages');
  };

  const handleConversationUpdate = () => {
    // Refresh conversation data if needed
    fetchConversation();
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !conversation) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-4">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {error || 'Conversation not found'}
          </h2>
          <p className="text-gray-600 mb-4">
            This conversation may have been deleted or you don't have access to it.
          </p>
          <button
            onClick={handleBack}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Back to Messages
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-white">
      <MessageThread
        conversationId={conversationId!}
        conversation={conversation}
        onBack={handleBack}
        onConversationUpdate={handleConversationUpdate}
      />
    </div>
  );
};

export default ConversationPage;