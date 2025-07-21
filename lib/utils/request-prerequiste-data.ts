import inquirer from "inquirer";
import getConnections from "./get-connections";
import type {RoleToMigrate} from "../types";

interface IAuth0Config {
  domain: string;
  clientId: string;
  clientSecret: string;
}

function extractDomain(input: string): string | false {
  try {
    const url = new URL(input.includes("://") ? input : `https://${input}`);
    return url.hostname.includes(".auth0.com") ? url.hostname : false;
  } catch {
    return false;
  }
}

export async function requestAuthOConfiguration(
  type: "source" | "destination"
): Promise<IAuth0Config> {
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "domain",
      message: `Enter your Auth0 ${type} domain (e.g., your-tenant.auth0.com):`,
      filter: extractDomain,
      validate: (input) =>
        extractDomain(input)
          ? true
          : "Please enter a valid Auth0 domain (e.g., your-tenant.auth0.com).",
    },
    {
      type: "input",
      name: "clientId",
      message: `Enter your Auth0 ${type} Client ID:`,
      validate: (input) => (input ? true : "Client ID is required."),
    },
    {
      type: "password",
      name: "clientSecret",
      message: `Enter your Auth0 ${type} Client Secret:`,
      mask: "*",
      validate: (input) => (input ? true : "Client Secret is required."),
    },
  ]);

  return answers;
}

export async function requestConnection(
  type: "source" | "destination",
  domain: string,
  token: string,
  returnType: "id" | "name"
): Promise<string> {
  const connections = await getConnections(domain, token);

  const choices = connections.map((conn: any) => ({
    name: `${conn.name} (${conn.strategy})`,
    value: conn[returnType],
  }));

  const answers = await inquirer.prompt([
    {
      type: "list",
      name: "sourceConnection",
      message: `Select the Auth0 ${type} connection:`,
      choices,
    },
  ]);

  return answers.sourceConnection;
}

export async function requestEmail(): Promise<string> {
  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "emailAddress",
      message:
        "Enter the email address of the user you want to import (leave blank to import all users from a connection):",
      validate: (input) =>
        !input || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input)
          ? true
          : "Please enter a valid email address or leave blank.",
    },
  ]);

  return answers.emailAddress;
}

export async function requestMigrationDetails(): Promise<{
  fields: string[];
  upsert: boolean;
}> {
  const userFields = [
    {
      name: "email",
      value: "email",
      checked: true,
      disabled: "Selected by default",
    },
    { name: "user_id", value: "user_id" },
    { name: "email_verified", value: "email_verified" },
    { name: "username", value: "username" },
    { name: "phone_number", value: "phone_number" },
    { name: "phone_verified", value: "phone_verified" },
    { name: "given_name", value: "given_name" },
    { name: "family_name", value: "family_name" },
    { name: "name", value: "name" },
    { name: "nickname", value: "nickname" },
    { name: "picture", value: "picture" },
    { name: "created_at", value: "created_at" },
    { name: "updated_at", value: "updated_at" },
    { name: "identities", value: "identities" },
    { name: "app_metadata", value: "app_metadata" },
    { name: "user_metadata", value: "user_metadata" },
    { name: "last_login", value: "last_login" },
    { name: "logins_count", value: "logins_count" },
    { name: "multifactor", value: "multifactor" },
  ];

  const answers = await inquirer.prompt([
    {
      type: "checkbox",
      name: "fields",
      message: "Select the Auth0 user fields you want to migrate :",
      choices: userFields,
    },

    {
      type: "confirm",
      name: "upsert",
      message: "Do you want to upsert users (update if they already exist)?",
      default: false,
    },
  ]);

  return { fields: [...answers.fields, "email"], upsert: answers.upsert };
}

export async function selectRolesToMigrate(roles: RoleToMigrate[]): Promise<RoleToMigrate[]> {
  const answers = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'roles',
      message: 'Select the Auth0 roles you want to migrate :',
      choices: roles.map((role) => ({ name: role.name, value: role })),
    },
  ]);

  return answers.roles;
}
