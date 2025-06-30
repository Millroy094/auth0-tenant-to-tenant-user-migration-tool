import axios from "axios";

export async function getManagementToken(
  domain: string,
  clientId: string,
  clientSecret: string
): Promise<string> {
  const response = await axios.post(`https://${domain}/oauth/token`, {
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
    audience: `https://${domain}/api/v2/`,
  });

  return response.data.access_token;
}
