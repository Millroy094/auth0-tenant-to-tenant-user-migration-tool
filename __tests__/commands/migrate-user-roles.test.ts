import { migrateUserRoles } from '../../lib/commands/migrate-user-roles';
import {
  requestAuthOConfiguration,
  selectRolesToMigrate,
} from '../../lib/utils/request-prerequiste-data';
import { getManagementToken } from '../../lib/utils/get-management-token';
import getRoles from '../../lib/utils/get-roles';
import getUsersInRole from '../../lib/utils/get-users-in-role';
import getUserByEmail from '../../lib/utils/get-user-by-email';
import getUserRoles from '../../lib/utils/get-user-roles';
import assignRolesToUser from '../../lib/utils/assign-roles-to-user';

jest.mock('../../lib/utils/request-prerequiste-data');
jest.mock('../../lib/utils/get-management-token');
jest.mock('../../lib/utils/get-roles');
jest.mock('../../lib/utils/get-users-in-role');
jest.mock('../../lib/utils/get-user-by-email');
jest.mock('../../lib/utils/get-user-roles');
jest.mock('../../lib/utils/create-role');
jest.mock('../../lib/utils/assign-roles-to-user');

describe('migrateUserRoles', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should migrate user roles end-to-end', async () => {
    (requestAuthOConfiguration as jest.Mock)
      .mockResolvedValueOnce({
        domain: 'source.auth0.com',
        clientId: 'sourceClientId',
        clientSecret: 'sourceSecret',
      })
      .mockResolvedValueOnce({
        domain: 'dest.auth0.com',
        clientId: 'destClientId',
        clientSecret: 'destSecret',
      });

    (getManagementToken as jest.Mock)
      .mockResolvedValueOnce('sourceToken')
      .mockResolvedValueOnce('destToken');

    (getRoles as jest.Mock)
      .mockResolvedValueOnce([{ id: 'srcRole1', name: 'Admin', description: 'Admin role' }])
      .mockResolvedValueOnce([{ id: 'destRole1', name: 'Admin', description: 'Admin role' }]);

    (selectRolesToMigrate as jest.Mock).mockResolvedValueOnce([
      {
        name: 'Admin',
        description: 'Admin role',
        sourceRoleId: 'srcRole1',
        destinationRoleId: 'destRole1',
      },
    ]);

    (getUsersInRole as jest.Mock).mockResolvedValueOnce([
      { user_id: 'auth0|123', email: 'user@example.com' },
    ]);

    (getUserByEmail as jest.Mock).mockResolvedValueOnce({ user_id: 'auth0|456' });

    (getUserRoles as jest.Mock).mockResolvedValueOnce([]);

    (assignRolesToUser as jest.Mock).mockResolvedValueOnce(undefined);

    await migrateUserRoles();

    expect(assignRolesToUser).toHaveBeenCalledWith('dest.auth0.com', 'destToken', 'auth0|456', [
      'destRole1',
    ]);
  });
});
