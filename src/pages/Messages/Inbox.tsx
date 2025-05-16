// File: frontend/src/pages/Messages/Inbox.tsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getConversations } from '../../api/messages';
import { useAuth } from '../../hooks/useAuth';

const Inbox: React.FC = () => {
  const { token, user } = useAuth();
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConversations();
  }, [token]);

  const fetchConversations = async () => {
    if (!token) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await getConversations(token);
      setConversations(data);
    } catch (err) {
      console.error('Error fetching conversations:', err);
      setError('Failed to load messages');
    } finally {
      setLoading(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Messages</h1>
      
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchConversations}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      ) : conversations.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <h3 className="mt-4 text-xl font-medium text-gray-900">No messages yet</h3>
          <p className="mt-2 text-gray-600 max-w-md mx-auto">
            When you contact property owners or receive messages, they will appear here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <ul className="divide-y divide-gray-200">
            {conversations.map((conversation) => (
              <li key={conversation.id}>
                <Link
                  to={`/messages/${conversation.id}`}
                  className={`block px-6 py-4 hover:bg-gray-50 ${
                    !conversation.is_read && conversation.last_sender_id !== user?.id
                      ? 'bg-blue-50'
                      : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {conversation.other_user.profile_image ? (
                        <img
                          src={`/uploads/${conversation.other_user.profile_image}`}
                          alt={conversation.other_user.full_name}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-blue-200 flex items-center justify-center">
                          <span className="text-blue-600 font-medium">
                            {conversation.other_user.full_name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">
                          {conversation.other_user.full_name}
                        </p>
                        
                        {conversation.property && (
                          <p className="text-xs text-gray-500">
                            Re: {conversation.property.title}
                          </p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <span className="text-xs text-gray-500">
                        {formatDate(conversation.last_message_date)}
                      </span>
                      
                      {!conversation.is_read && conversation.last_sender_id !== user?.id && (
                        <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          New
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <p className="mt-2 text-sm text-gray-600 truncate">
                    {conversation.last_message}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default Inbox;