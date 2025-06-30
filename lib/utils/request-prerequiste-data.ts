import inquirer from "inquirer";
import getConnections from "./get-connections";

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
