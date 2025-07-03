import { getData } from './api.tsx';

export interface IndustryFocus {
  _id: string;
  name: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Fetch all active industry focuses for use in dropdowns
 */
export const getIndustryFocuses = async (): Promise<IndustryFocus[]> => {
  const response = await getData('industry-focus');
  if (response.error) {
    throw new Error(response.error.message);
  }
  return response.data;
};

/**
 * Fetch all industry focuses (including inactive) for admin use
 */
export const getIndustryFocusesAdmin = async (): Promise<IndustryFocus[]> => {
  const response = await getData('industry-focus/admin');
  if (response.error) {
    throw new Error(response.error.message);
  }
  return response.data;
}; 