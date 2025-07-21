import axios from 'axios';

export default async function getUserRoles(
  domain: string,
  token: string,
  userId: string
): Promise<any[]> {
  const response = await axios.get(
    `https://${domain}/api/v2/users/${encodeURIComponent(userId)}/roles`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
}
