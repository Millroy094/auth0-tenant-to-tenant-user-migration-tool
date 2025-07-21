import axios from 'axios';

async function getRoles(domain: string, token: string) {
  const response = await axios.get(`https://${domain}/api/v2/roles`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  return response.data;
}

export default getRoles;
