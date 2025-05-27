// frontend/src/components/messages/MessageBubble.tsx
// Individual message bubble component
import React from 'react';

interface Sender {
  id: number;
  full_name: string;
  profile_image?: string;
}

interface Message {
  id: number;
  conversation_id: string;
  sender_id: number;
  receiver_id: number;
  content: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  sender: Sender;
}

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
  showTime: boolean;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  showAvatar,
  showTime
}) => {
  const formatTime = (timestamp: string) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-2`}>
      <div className={`flex max-w-xs lg:max-w-md ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`flex-shrink-0 ${isOwn ? 'ml-2' : 'mr-2'}`}>
          {showAvatar && !isOwn ? (
            message.sender.profile_image ? (
              <img
                src={`/uploads/${message.sender.profile_image}`}
                alt={message.sender.full_name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                <span className="text-gray-600 text-xs font-medium">
                  {message.sender.full_name.charAt(0).toUpperCase()}
                </span>
              </div>
            )
          ) : (
            <div className="w-8 h-8" /> // Spacer for alignment
          )}
        </div>

        {/* Message Content */}
        <div className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'}`}>
          {/* Sender Name (for received messages) */}
          {showAvatar && !isOwn && (
            <span className="text-xs text-gray-500 mb-1 px-3">
              {message.sender.full_name}
            </span>
          )}

          {/* Message Bubble */}
          <div
            className={`relative px-4 py-2 rounded-2xl shadow-sm ${
              isOwn
                ? 'bg-blue-600 text-white rounded-br-md'
                : 'bg-gray-100 text-gray-900 rounded-bl-md'
            }`}
          >
            <p className="text-sm whitespace-pre-wrap break-words">
              {message.content}
            </p>

            {/* Message tail */}
            <div
              className={`absolute top-0 w-3 h-3 ${
                isOwn
                  ? 'right-0 transform translate-x-1 bg-blue-600'
                  : 'left-0 transform -translate-x-1 bg-gray-100'
              }`}
              style={{
                clipPath: isOwn
                  ? 'polygon(0 0, 100% 0, 0 100%)'
                  : 'polygon(100% 0, 0 0, 100% 100%)'
              }}
            />
          </div>

          {/* Time and Status */}
          {showTime && (
            <div className={`flex items-center mt-1 px-3 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
              <span className="text-xs text-gray-500">
                {formatTime(message.created_at)}
              </span>

              {/* Read status for own messages */}
              {isOwn && (
                <div className={`ml-1 flex items-center`}>
                  {message.is_read ? (
                    <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessageBubble;