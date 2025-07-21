import { requestAuthOConfiguration, selectRolesToMigrate } from '../utils/request-prerequiste-data';
import { getManagementToken } from '../utils/get-management-token';
import getRoles from '../utils/get-roles';
import assignRolesToUser from '../utils/assign-roles-to-user';
import getUsersInRole from '../utils/get-users-in-role';
import getUserByEmail from '../utils/get-user-by-email';
import getUserRoles from '../utils/get-user-roles';
import createRole from '../utils/create-role';
import type { Role, RoleToMigrate } from '../types';
import type { Command } from 'commander';
import withGracefulExit from '../utils/with-graceful-exit';

const getTokens = async () => {
  const {
    domain: sourceDomain,
    clientId: sourceClientId,
    clientSecret: sourceClientSecret,
  } = await requestAuthOConfiguration('source');

  const {
    domain: destinationDomain,
    clientId: destinationClientId,
    clientSecret: destinationClientSecret,
  } = await requestAuthOConfiguration('destination');

  const [sourceToken, destinationToken] = await Promise.all([
    getManagementToken(sourceDomain, sourceClientId, sourceClientSecret),
    getManagementToken(destinationDomain, destinationClientId, destinationClientSecret),
  ]);

  return { sourceDomain, destinationDomain, sourceToken, destinationToken };
};

const getMatchingRoles = async (
  sourceDomain: string,
  destinationDomain: string,
  sourceToken: string,
  destinationToken: string
) => {
  const [sourceRoles, destinationRoles] = (await Promise.all([
    getRoles(sourceDomain, sourceToken),
    getRoles(destinationDomain, destinationToken),
  ])) as [Role[], Role[]];

  const rolesToMigrate = sourceRoles.reduce((acc: RoleToMigrate[], srcRole) => {
    const match = destinationRoles.find((destRole) => srcRole.name === destRole.name);
    acc.push({
      name: srcRole.name,
      description: match?.description ?? srcRole.description,
      sourceRoleId: srcRole.id,
      destinationRoleId: match?.id ?? '',
    });
    return acc;
  }, []);

  return selectRolesToMigrate(rolesToMigrate);
};

const buildUserRoleMap = async (
  selectedRoles: RoleToMigrate[],
  sourceDomain: string,
  destinationDomain: string,
  sourceToken: string,
  destinationToken: string
) => {
  const userRoleMap = new Map<string, string[]>();
  const missingUsers: string[] = [];

  for (const role of selectedRoles) {
    try {
      console.log(`Processing role: ${role.name}`);

      const destinationRole = !role.destinationRoleId
        ? ((await createRole({
            roleName: role.name,
            roleDescription: role.description,
            token: destinationToken,
            domain: destinationDomain,
          })) as Role)
        : { id: role.destinationRoleId, name: role.name, description: role.description };

      const usersInRole = await getUsersInRole(sourceDomain, sourceToken, role.sourceRoleId);

      for (const user of usersInRole) {
        const { email, user_id: sourceUserId } = user;

        if (!email || missingUsers.includes(sourceUserId)) continue;

        let destinationUser: { user_id: string } | null = null;
        try {
          destinationUser = await getUserByEmail(destinationDomain, destinationToken, email);
        } catch {
          missingUsers.push(sourceUserId);
          continue;
        }

        if (!destinationUser?.user_id) {
          missingUsers.push(sourceUserId);
          continue;
        }

        const destinationUserId = destinationUser.user_id;
        const currentUserRoles = await getUserRoles(
          destinationDomain,
          destinationToken,
          destinationUserId
        );
        const alreadyHasRole = currentUserRoles.some((r: Role) => r.name === role.name);
        if (alreadyHasRole) continue;

        const existingRoles = userRoleMap.get(destinationUserId) || [];
        userRoleMap.set(destinationUserId, [...new Set([...existingRoles, destinationRole.id])]);
      }
    } catch (err) {
      console.error(`Error processing role ${role.name}:`, err);
    }
  }

  return userRoleMap;
};

const assignRolesInBatches = async (
  userRoleMap: Map<string, string[]>,
  destinationDomain: string,
  destinationToken: string,
  batchSize = 10
) => {
  const entries = Array.from(userRoleMap.entries());
  const total = entries.length;
  let completed = 0;

  for (let i = 0; i < total; i += batchSize) {
    const batch = entries.slice(i, i + batchSize);

    await Promise.all(
      batch.map(([userId, roleIds]) =>
        assignRolesToUser(destinationDomain, destinationToken, userId, roleIds)
          .then(() => {
            completed++;
            console.log(`Assigned roles to user ${userId} (${completed}/${total})`);
          })
          .catch((err) => {
            completed++;
            console.error(`Failed to assign roles to user ${userId} (${completed}/${total}):`, err);
          })
      )
    );
  }
};

export const migrateUserRoles = async () => {
  const { sourceDomain, destinationDomain, sourceToken, destinationToken } = await getTokens();
  const selectedRoles = await getMatchingRoles(
    sourceDomain,
    destinationDomain,
    sourceToken,
    destinationToken
  );
  const userRoleMap = await buildUserRoleMap(
    selectedRoles,
    sourceDomain,
    destinationDomain,
    sourceToken,
    destinationToken
  );

  console.log(`🚀 Assigning roles to ${userRoleMap.size} users...`);
  await assignRolesInBatches(userRoleMap, destinationDomain, destinationToken);
  console.log('🎉 Migration complete.');
};

const setupMigrateUserRolesCommand = (program: Command) => {
  program
    .command('migrate-user-roles')
    .description('Migrate user roles between tenants')
    .action(withGracefulExit(migrateUserRoles));
};

export default setupMigrateUserRolesCommand;
