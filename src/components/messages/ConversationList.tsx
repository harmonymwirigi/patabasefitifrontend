// frontend/src/components/messages/ConversationList.tsx
// Component to display list of conversations in sidebar
import React from 'react';
import { formatDistanceToNow } from 'date-fns';

interface Participant {
  id: number;
  full_name: string;
  profile_image?: string;
}

interface LastMessage {
  id: number;
  content: string;
  sender_id: number;
  created_at: string;
  is_read: boolean;
}

interface Property {
  id: number;
  title: string;
}

interface Conversation {
  id: string;
  participants: Participant[];
  property?: Property;
  last_message?: LastMessage;
  unread_count: number;
  updated_at: string;
}

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversation: string | null;
  onConversationSelect: (conversationId: string) => void;
  currentUserId?: number;
}

const ConversationList: React.FC<ConversationListProps> = ({
  conversations,
  selectedConversation,
  onConversationSelect,
  currentUserId
}) => {
  const getOtherParticipant = (participants: Participant[]) => {
    return participants.find(p => p.id !== currentUserId) || participants[0];
  };

  const formatLastMessageTime = (timestamp: string) => {
    try {
      return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
    } catch {
      return '';
    }
  };

  const truncateMessage = (message: string, maxLength: number = 50) => {
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength) + '...';
  };

  return (
    <div className="divide-y divide-gray-200">
      {conversations.map((conversation) => {
        const otherParticipant = getOtherParticipant(conversation.participants);
        const isSelected = conversation.id === selectedConversation;
        const hasUnread = conversation.unread_count > 0;

        return (
          <div
            key={conversation.id}
            onClick={() => onConversationSelect(conversation.id)}
            className={`p-4 cursor-pointer transition-colors ${
              isSelected 
                ? 'bg-blue-50 border-r-2 border-blue-600' 
                : 'hover:bg-gray-50'
            }`}
          >
            <div className="flex items-start space-x-3">
              {/* Avatar */}
              <div className="flex-shrink-0">
                {otherParticipant.profile_image ? (
                  <img
                    src={`/uploads/${otherParticipant.profile_image}`}
                    alt={otherParticipant.full_name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center">
                    <span className="text-gray-600 font-medium text-lg">
                      {otherParticipant.full_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                
                {/* Online status indicator */}
                <div className="relative -mt-3 -mr-1 flex justify-end">
                  <div className="w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                </div>
              </div>

              {/* Conversation Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className={`text-sm font-medium ${
                    hasUnread ? 'text-gray-900' : 'text-gray-700'
                  } truncate`}>
                    {otherParticipant.full_name}
                  </h3>
                  
                  <div className="flex items-center space-x-2">
                    {conversation.last_message && (
                      <span className="text-xs text-gray-500">
                        {formatLastMessageTime(conversation.last_message.created_at)}
                      </span>
                    )}
                    
                    {hasUnread && (
                      <span className="bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {conversation.unread_count > 99 ? '99+' : conversation.unread_count}
                      </span>
                    )}
                  </div>
                </div>

                {/* Property Info */}
                {conversation.property && (
                  <div className="flex items-center mt-1">
                    <svg className="w-3 h-3 text-gray-400 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2H4zm0 2h12v8H4V6z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs text-gray-500 truncate">
                      {conversation.property.title}
                    </span>
                  </div>
                )}

                {/* Last Message */}
                {conversation.last_message ? (
                  <div className="mt-1">
                    <p className={`text-sm ${
                      hasUnread ? 'font-medium text-gray-900' : 'text-gray-600'
                    } truncate`}>
                      {conversation.last_message.sender_id === currentUserId ? 'You: ' : ''}
                      {truncateMessage(conversation.last_message.content)}
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 italic mt-1">
                    No messages yet
                  </p>
                )}
              </div>
            </div>

            {/* Message status indicators */}
            {conversation.last_message && conversation.last_message.sender_id === currentUserId && (
              <div className="flex justify-end mt-2">
                <div className="flex items-center space-x-1">
                  {conversation.last_message.is_read ? (
                    <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ConversationList;