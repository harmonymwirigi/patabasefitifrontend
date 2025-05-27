// frontend/src/api/analytics.ts
// Analytics API functions for owner dashboard
import axios from 'axios';
import { API_BASE_URL } from '../config/constants';

// Create axios instance with auth interceptor
const createAnalyticsApi = (token: string) => {
  const analyticsApi = axios.create({
    baseURL: `${API_BASE_URL}/analytics`,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  });
  
  return analyticsApi;
};

export interface OwnerAnalyticsParams {
  timeRange?: string;
  propertyType?: string;
}

export interface OwnerAnalytics {
  totalProperties: number;
  availableProperties: number;
  rentedProperties: number;
  verifiedProperties: number;
  pendingVerifications: number;
  totalViews: number;
  totalFavorites: number;
  totalContacts: number;
  monthlyRevenue: number;
  averageRent: number;
  topPerformingProperty?: {
    id: number;
    title: string;
    views: number;
    favorites: number;
    contacts: number;
  };
  recentActivity: Array<{
    type: 'view' | 'favorite' | 'contact' | 'verification';
    description: string;
    propertyTitle: string;
    timeAgo: string;
    timestamp: string;
  }>;
  viewsOverTime: Array<{
    date: string;
    views: number;
    favorites: number;
    contacts: number;
  }>;
  engagementMetrics: {
    views: number;
    favorites: number;
    contacts: number;
  };
}

export const getOwnerAnalytics = async (
  token: string, 
  params: OwnerAnalyticsParams = {}
): Promise<OwnerAnalytics> => {
  try {
    const analyticsApi = createAnalyticsApi(token);
    const response = await analyticsApi.get('/owner', { params });
    return response.data;
  } catch (error: any) {
    console.error('Error fetching owner analytics:', error);
    
    // Return mock data as fallback
    const mockData: OwnerAnalytics = {
      totalProperties: 0,
      availableProperties: 0,
      rentedProperties: 0,
      verifiedProperties: 0,
      pendingVerifications: 0,
      totalViews: 0,
      totalFavorites: 0,
      totalContacts: 0,
      monthlyRevenue: 0,
      averageRent: 0,
      recentActivity: [],
      viewsOverTime: [],
      engagementMetrics: {
        views: 0,
        favorites: 0,
        contacts: 0
      }
    };
    
    return mockData;
  }
};

export const getPropertyInsights = async (
  token: string,
  propertyId: number,
  timeRange: string = '30'
) => {
  try {
    const analyticsApi = createAnalyticsApi(token);
    const response = await analyticsApi.get(`/property/${propertyId}`, {
      params: { timeRange }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching property insights:', error);
    throw error;
  }
};

export const getMarketAnalytics = async (
  token: string,
  city?: string,
  propertyType?: string
) => {
  try {
    const analyticsApi = createAnalyticsApi(token);
    const response = await analyticsApi.get('/market', {
      params: { city, propertyType }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching market analytics:', error);
    throw error;
  }
};

export const getCompetitorAnalysis = async (
  token: string,
  propertyId: number
) => {
  try {
    const analyticsApi = createAnalyticsApi(token);
    const response = await analyticsApi.get(`/competitor/${propertyId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching competitor analysis:', error);
    throw error;
  }
};