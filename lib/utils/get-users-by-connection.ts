import axios from 'axios';

interface IGetUsersByConnectionParams {
  domain: string;
  token: string;
  connection: string;
  page?: number;
  perPage?: number;
  accumulatedUsers?: any[];
}

export default async function getUsersByConnection({
  domain,
  token,
  connection,
  page = 0,
  perPage = 100,
  accumulatedUsers = [],
}: IGetUsersByConnectionParams): Promise<any[]> {
  const response = await axios.get(`https://${domain}/api/v2/users`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
    params: {
      q: `identities.connection:"${connection}"`,
      search_engine: 'v3',
      per_page: perPage,
      page,
    },
  });

  const users = response.data;
  const allUsers = [...accumulatedUsers, ...users];

  if (users.length < perPage) {
    return allUsers;
  }

  return getUsersByConnection({
    domain,
    token,
    connection,
    page: page + 1,
    perPage,
    accumulatedUsers: allUsers,
  });
}
