// frontend/src/api/messages.ts
// API functions for messaging system
import axios from 'axios';
import { API_BASE_URL } from '../config/constants';

// Create axios instance with auth interceptor
const createMessagesApi = (token: string) => {
  const messagesApi = axios.create({
    baseURL: `${API_BASE_URL}/messages`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  
  return messagesApi;
};

export interface CreateConversationRequest {
  receiver_id: number;
  property_id?: number;
  initial_message?: string;
}

export interface SendMessageRequest {
  conversation_id: string;
  receiver_id: number;
  content: string;
}

export interface Conversation {
  id: string;
  participants: Array<{
    id: number;
    full_name: string;
    email: string;
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
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: number;
  conversation_id: string;
  sender_id: number;
  receiver_id: number;
  content: string;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  updated_at: string;
  sender: {
    id: number;
    full_name: string;
    email: string;
    profile_image?: string;
  };
}

// Get all conversations for current user
export const getConversations = async (token: string): Promise<Conversation[]> => {
  try {
    const messagesApi = createMessagesApi(token);
    const response = await messagesApi.get('/conversations');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
};

// Get messages for a specific conversation
export const getMessages = async (token: string, conversationId: string): Promise<Message[]> => {
  try {
    const messagesApi = createMessagesApi(token);
    const response = await messagesApi.get(`/conversations/${conversationId}/messages`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    throw error;
  }
};

// Create a new conversation
export const createConversation = async (
  token: string, 
  receiverId: number, 
  propertyId?: number,
  initialMessage?: string
): Promise<Conversation> => {
  try {
    const messagesApi = createMessagesApi(token);
    const response = await messagesApi.post('/conversations', {
      receiver_id: receiverId,
      property_id: propertyId,
      initial_message: initialMessage
    });
    return response.data;
  } catch (error: any) {
    console.error('Error creating conversation:', error);
    throw error;
  }
};

// Send a message
export const sendMessage = async (
  token: string,
  conversationId: string,
  receiverId: number,
  content: string
): Promise<Message> => {
  try {
    const messagesApi = createMessagesApi(token);
    const response = await messagesApi.post('/send', {
      conversation_id: conversationId,
      receiver_id: receiverId,
      content: content
    });
    return response.data;
  } catch (error: any) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Mark a message as read
export const markMessageAsRead = async (token: string, messageId: number): Promise<void> => {
  try {
    const messagesApi = createMessagesApi(token);
    await messagesApi.put(`/${messageId}/read`);
  } catch (error: any) {
    console.error('Error marking message as read:', error);
    throw error;
  }
};

// Mark all messages in a conversation as read
export const markConversationAsRead = async (token: string, conversationId: string): Promise<void> => {
  try {
    const messagesApi = createMessagesApi(token);
    await messagesApi.put(`/conversations/${conversationId}/read`);
  } catch (error: any) {
    console.error('Error marking conversation as read:', error);
    throw error;
  }
};

// Delete a message
export const deleteMessage = async (token: string, messageId: number): Promise<void> => {
  try {
    const messagesApi = createMessagesApi(token);
    await messagesApi.delete(`/${messageId}`);
  } catch (error: any) {
    console.error('Error deleting message:', error);
    throw error;
  }
};

// Get conversation by ID
export const getConversation = async (token: string, conversationId: string): Promise<Conversation> => {
  try {
    const messagesApi = createMessagesApi(token);
    const response = await messagesApi.get(`/conversations/${conversationId}`);
    return response.data;
  } catch (error: any) {
    console.error('Error fetching conversation:', error);
    throw error;
  }
};

// Search conversations
export const searchConversations = async (token: string, query: string): Promise<Conversation[]> => {
  try {
    const messagesApi = createMessagesApi(token);
    const response = await messagesApi.get(`/conversations/search?q=${encodeURIComponent(query)}`);
    return response.data;
  } catch (error: any) {
    console.error('Error searching conversations:', error);
    throw error;
  }
};

// Get unread message count
export const getUnreadCount = async (token: string): Promise<{ total_unread: number }> => {
  try {
    const messagesApi = createMessagesApi(token);
    const response = await messagesApi.get('/unread-count');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching unread count:', error);
    throw error;
  }
};