import axios from "axios";

export default async function getConnections(domain: string, token: string) {
  const response = await axios.get(`https://${domain}/api/v2/connections`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      strategy: "auth0",
    },
  });

  return response.data;
}
