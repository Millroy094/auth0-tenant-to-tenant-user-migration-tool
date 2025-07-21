#!/usr/bin/env node

import { Command } from 'commander';
import setupMigrateUsersCommand from './commands/migrate-users';
import setupMigrateUserRolesCommand from './commands/migrate-user-roles';

import pkg from '../package.json';

const program = new Command();

program
  .name('auth0-tenant-to-tenant-user-migration-tool')
  .description('An Auth0 Tenant to Tenant User Migration Tool')
  .version(pkg.version);

setupMigrateUsersCommand(program);
setupMigrateUserRolesCommand(program);

program.parse();
