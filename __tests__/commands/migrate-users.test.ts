import {
  requestAuthOConfiguration,
  requestEmail,
  requestMigrationDetails,
  requestConnection,
} from '../../lib/utils/request-prerequiste-data';
import { getManagementToken } from '../../lib/utils/get-management-token';
import getUserByEmail from '../../lib/utils/get-user-by-email';
import importUsers from '../../lib/utils/import-users';
import { migrateUsers } from '../../lib/commands/migrate-users';
import getUsersByConnection from '../../lib/utils/get-users-by-connection';

jest.mock('../../lib/utils/get-management-token');
jest.mock('../../lib/utils/get-user-by-email');
jest.mock('../../lib/utils/get-users-by-connection');
jest.mock('../../lib/utils/request-prerequiste-data');
jest.mock('../../lib/utils/import-users');
jest.mock('../../lib/utils/with-graceful-exit', () => jest.fn((fn) => fn));

describe('Migrate users', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should migrate a single user by email', async () => {
    (requestAuthOConfiguration as jest.Mock).mockResolvedValueOnce({
      domain: 'source.auth0.com',
      clientId: 'sourceClientId',
      clientSecret: 'sourceSecret',
    });
    (getManagementToken as jest.Mock).mockResolvedValueOnce('sourceToken');
    (requestEmail as jest.Mock).mockResolvedValueOnce('user@example.com');
    (getUserByEmail as jest.Mock).mockResolvedValueOnce({
      user_id: 'auth0|123',
      email: 'user@example.com',
      name: 'Test User',
    });

    (requestMigrationDetails as jest.Mock).mockResolvedValueOnce({
      fields: ['user_id', 'email', 'name'],
      upsert: true,
    });
    (requestAuthOConfiguration as jest.Mock).mockResolvedValueOnce({
      domain: 'dest.auth0.com',
      clientId: 'destClientId',
      clientSecret: 'destSecret',
    });

    (getManagementToken as jest.Mock).mockResolvedValueOnce('destToken');

    (requestConnection as jest.Mock).mockResolvedValueOnce('destConnectionId');

    const importUsersMock = importUsers as jest.Mock;

    await migrateUsers();

    expect(importUsersMock).toHaveBeenCalledWith(
      expect.objectContaining({
        users: [{ user_id: '123', email: 'user@example.com', name: 'Test User' }],
        token: 'destToken',
        connectionId: 'destConnectionId',
        tenantDomain: 'dest.auth0.com',
        isUpsert: true,
      })
    );
  });

  it('should log user not found when email is invalid', async () => {
    (requestAuthOConfiguration as jest.Mock).mockResolvedValueOnce({
      domain: 'source.auth0.com',
      clientId: 'sourceClientId',
      clientSecret: 'sourceSecret',
    });
    (getManagementToken as jest.Mock).mockResolvedValueOnce('sourceToken');
    (requestEmail as jest.Mock).mockResolvedValueOnce('user@example.com');
    (getUserByEmail as jest.Mock).mockResolvedValueOnce(null);

    (requestMigrationDetails as jest.Mock).mockResolvedValueOnce({
      fields: ['user_id', 'email', 'name'],
      upsert: true,
    });

    await expect(migrateUsers()).rejects.toThrow('User not found!');
  });

  it('should migrate users by connection', async () => {
    (requestAuthOConfiguration as jest.Mock).mockResolvedValueOnce({
      domain: 'source.auth0.com',
      clientId: 'sourceClientId',
      clientSecret: 'sourceSecret',
    });
    (getManagementToken as jest.Mock).mockResolvedValueOnce('sourceToken');
    (requestConnection as jest.Mock).mockResolvedValueOnce('srcConnectionId');
    (getUsersByConnection as jest.Mock).mockResolvedValueOnce([
      {
        user_id: 'auth0|123',
        email: 'user123@example.com',
        name: 'Test User',
      },
      {
        user_id: 'auth0|456',
        email: 'user456@example.com',
        name: 'Test User',
      },
    ]);

    (requestMigrationDetails as jest.Mock).mockResolvedValueOnce({
      fields: ['user_id', 'email', 'name'],
      upsert: true,
    });
    (requestAuthOConfiguration as jest.Mock).mockResolvedValueOnce({
      domain: 'dest.auth0.com',
      clientId: 'destClientId',
      clientSecret: 'destSecret',
    });

    (getManagementToken as jest.Mock).mockResolvedValueOnce('destToken');

    (requestConnection as jest.Mock).mockResolvedValueOnce('destConnectionId');
    const importUsersMock = importUsers as jest.Mock;

    await migrateUsers();

    expect(importUsersMock).toHaveBeenCalledWith(
      expect.objectContaining({
        users: [
          {
            user_id: '123',
            email: 'user123@example.com',
            name: 'Test User',
          },
          {
            user_id: '456',
            email: 'user456@example.com',
            name: 'Test User',
          },
        ],
        token: 'destToken',
        connectionId: 'destConnectionId',
        tenantDomain: 'dest.auth0.com',
        isUpsert: true,
      })
    );
  });
});
