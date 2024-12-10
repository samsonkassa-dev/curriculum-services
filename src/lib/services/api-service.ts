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
  getBaseData: async (type: BaseDataType) => {
    const response = await api.get(`/api/${type}`);
    return response.data;
  },

  // Add new base data item
  addBaseData: async (type: BaseDataType, data: Omit<BaseDataItem, 'id'>) => {
    const response = await api.post(`/api/${type}`, data);
    return response.data;
  },

  // Update existing base data item
  updateBaseData: async (type: BaseDataType, id: string, data: Partial<BaseDataItem>) => {
    const response = await api.patch(`/api/${type}/${id}`, data);
    return response.data;
  },

  // Delete base data item
  deleteBaseData: async (type: BaseDataType, id: string) => {
    const response = await api.delete(`/api/${type}/${id}`);
    return response.data;
  },
}; 