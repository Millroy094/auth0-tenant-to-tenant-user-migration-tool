import axios from 'axios';

async function getUsersInRole(domain: string, token: string, roleId: string) {
  const response = await axios.get(`https://${domain}/api/v2/roles/${roleId}/users`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export default getUsersInRole;
