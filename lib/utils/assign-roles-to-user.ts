import axios from 'axios';

async function assignRolesToUser(domain: string, token: string, userId: string, roleIds: string[]) {
  await axios.post(
    `https://${domain}/api/v2/users/${userId}/roles`,
    {
      roles: roleIds,
    },
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );
}

export default assignRolesToUser;
