import axios from 'axios';
import logger from './logger';

export default async function getUserByEmail(domain: string, token: string, email: string) {
  try {
    const response = await axios.get(`https://${domain}/api/v2/users-by-email`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        email,
      },
    });

    return response.data.length > 0 ? response.data[0] : null;
  } catch (error: any) {
    logger.error('Error fetching user by email:', error.response?.data || error.message);
    throw error;
  }
}
