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
  const mockedRequestAuthOConfiguration = requestAuthOConfiguration as jest.Mock;
  const mockedGetManagementToken = getManagementToken as jest.Mock;
  const mockedRequestMigrationDetails = requestMigrationDetails as jest.Mock;
  const mockedGetUserByEmail = getUserByEmail as jest.Mock;
  const mockedRequestEmail = requestEmail as jest.Mock;
  const mockedRequestConnection = requestConnection as jest.Mock;
  const mockedImportUsers = importUsers as jest.Mock;
  const mockedGetUsersByConnection = getUsersByConnection as jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should migrate a single user by email', async () => {
    mockedRequestAuthOConfiguration.mockResolvedValueOnce({
      domain: 'source.auth0.com',
      clientId: 'sourceClientId',
      clientSecret: 'sourceSecret',
    });
    mockedGetManagementToken.mockResolvedValueOnce('sourceToken');
    mockedRequestEmail.mockResolvedValueOnce('user@example.com');
    mockedGetUserByEmail.mockResolvedValueOnce({
      user_id: 'auth0|123',
      email: 'user@example.com',
      name: 'Test User',
    });

    mockedRequestMigrationDetails.mockResolvedValueOnce({
      fields: ['user_id', 'email', 'name'],
      upsert: true,
    });
    mockedRequestAuthOConfiguration.mockResolvedValueOnce({
      domain: 'dest.auth0.com',
      clientId: 'destClientId',
      clientSecret: 'destSecret',
    });

    mockedGetManagementToken.mockResolvedValueOnce('destToken');

    mockedRequestConnection.mockResolvedValueOnce('destConnectionId');

    await migrateUsers();

    expect(mockedImportUsers).toHaveBeenCalledWith(
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
    mockedRequestAuthOConfiguration.mockResolvedValueOnce({
      domain: 'source.auth0.com',
      clientId: 'sourceClientId',
      clientSecret: 'sourceSecret',
    });
    mockedGetManagementToken.mockResolvedValueOnce('sourceToken');
    mockedRequestEmail.mockResolvedValueOnce('user@example.com');
    mockedGetUserByEmail.mockResolvedValueOnce(null);

    mockedRequestMigrationDetails.mockResolvedValueOnce({
      fields: ['user_id', 'email', 'name'],
      upsert: true,
    });

    await expect(migrateUsers()).rejects.toThrow('User not found!');
  });

  it('should migrate users by connection', async () => {
    mockedRequestAuthOConfiguration.mockResolvedValueOnce({
      domain: 'source.auth0.com',
      clientId: 'sourceClientId',
      clientSecret: 'sourceSecret',
    });
    mockedGetManagementToken.mockResolvedValueOnce('sourceToken');
    mockedRequestConnection.mockResolvedValueOnce('srcConnectionId');
    mockedGetUsersByConnection.mockResolvedValueOnce([
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

    mockedRequestMigrationDetails.mockResolvedValueOnce({
      fields: ['user_id', 'email', 'name'],
      upsert: true,
    });
    mockedRequestAuthOConfiguration.mockResolvedValueOnce({
      domain: 'dest.auth0.com',
      clientId: 'destClientId',
      clientSecret: 'destSecret',
    });

    mockedGetManagementToken.mockResolvedValueOnce('destToken');

    mockedRequestConnection.mockResolvedValueOnce('destConnectionId');

    await migrateUsers();

    expect(mockedImportUsers).toHaveBeenCalledWith(
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
