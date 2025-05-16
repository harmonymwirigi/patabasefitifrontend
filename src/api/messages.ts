// File: frontend/src/api/messages.ts
// Status: COMPLETE
// Dependencies: axios, config/constants

import axios from 'axios';
import { API_BASE_URL } from '../config/constants';

// Create axios instance with auth interceptor
const createMessageApi = (token: string) => {
  const messageApi = axios.create({
    baseURL: `${API_BASE_URL}/messages`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  
  return messageApi;
};

interface SendMessageParams {
  receiver_id: number;
  content: string;
  property_id?: number;
  conversation_id?: string;
}

export const sendMessage = async (token: string, messageData: SendMessageParams) => {
  const messageApi = createMessageApi(token);
  const response = await messageApi.post('/', messageData);
  return response.data;
};

export const getConversations = async (token: string) => {
  const messageApi = createMessageApi(token);
  const response = await messageApi.get('/');
  return response.data;
};

export const getConversationMessages = async (token: string, conversationId: string) => {
  const messageApi = createMessageApi(token);
  const response = await messageApi.get(`/${conversationId}`);
  return response.data;
};

export const markConversationAsRead = async (token: string, conversationId: string) => {
  const messageApi = createMessageApi(token);
  const response = await messageApi.put(`/${conversationId}/read`);
  return response.data;
};

export const deleteConversation = async (token: string, conversationId: string) => {
  const messageApi = createMessageApi(token);
  await messageApi.delete(`/${conversationId}`);
  return true;
};