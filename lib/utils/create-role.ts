import axios from 'axios';

type CreateRoleParams = {
  roleName: string;
  roleDescription: string;
  token: string;
  domain: string;
};

async function createRole({ roleName, roleDescription, token, domain }: CreateRoleParams) {
  const response = await axios.post(
    `https://${domain}/api/v2/roles`,
    {
      name: roleName,
      description: roleDescription,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
}

export default createRole;
