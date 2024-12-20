import axios from 'axios';
import { BaseDataItem, BaseDataType } from '@/types/base-data';

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const baseDataApi = {
  // Fetch base data for a specific type
  getBaseData: async (type: BaseDataType, headers: { Authorization: string }) => {
    const response = await api.get(`/${type}`, { headers });
    return response.data;
  },

  // Add new base data item
  addBaseData: async (type: BaseDataType, headers: { Authorization: string }, data: Omit<BaseDataItem, 'id'>) => {
    const response = await api.post(`/${type}`, data, { headers });
    return response.data;
  },

  // Update existing base data item
  updateBaseData: async (type: BaseDataType, id: string, headers: { Authorization: string }, data: Partial<BaseDataItem>) => {
    const response = await api.patch(`/${type}/${id}`, data, { headers });
    return response.data;
  },

  // Delete base data item
  deleteBaseData: async (type: BaseDataType, id: string, headers: { Authorization: string }) => {
    const response = await api.delete(`/${type}/${id}`, { headers });
    return response.data;
  },
}; 