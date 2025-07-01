#!/usr/bin/env node

import pick from "lodash/pick";
import { getManagementToken } from "./utils/get-management-token";
import findUserByEmail from "./utils/get-user-by-email";
import getUsersByConnection from "./utils/get-users-by-connection";
import {
  requestAuthOConfiguration,
  requestConnection,
  requestEmail,
  requestMigrationDetails,
} from "./utils/request-prerequiste-data";
import importUsers from "./utils/import-users";

process.once("SIGINT", () => {
  console.log("\n🛑 Gracefully shutting down...");
  process.exit(0);
});

const migrateUsers = async (): Promise<void> => {
  const {
    domain: sourceDomain,
    clientId: sourceClientId,
    clientSecret: sourceClientSecret,
  } = await requestAuthOConfiguration("source");

  const sourceToken = await getManagementToken(
    sourceDomain,
    sourceClientId,
    sourceClientSecret
  );

  let exportedUsers: any[] = [];

  const emailAddress = await requestEmail();

  if (emailAddress) {
    const foundUsers = await findUserByEmail(
      sourceDomain,
      sourceToken,
      emailAddress
    );
    if (foundUsers.length > 0) {
      exportedUsers = exportedUsers.concat(foundUsers);
    }
  } else {
    const sourceConnection = await requestConnection(
      "source",
      sourceDomain,
      sourceToken,
      "name"
    );

    const foundUsers = await getUsersByConnection({
      domain: sourceDomain,
      connection: sourceConnection,
      token: sourceToken,
    });

    if (foundUsers.length > 0) {
      exportedUsers = exportedUsers.concat(foundUsers);
    }
  }

  if (exportedUsers.length > 0) {
    const { fields: fieldsToExtract, upsert } = await requestMigrationDetails();

    const {
      domain: destinationDomain,
      clientId: destinationClientId,
      clientSecret: destinationClientSecret,
    } = await requestAuthOConfiguration("destination");

    const destinationToken = await getManagementToken(
      destinationDomain,
      destinationClientId,
      destinationClientSecret
    );

    const usersToImport = exportedUsers.map((user) => {
      const newUser = pick(user, fieldsToExtract);
      return {
        ...newUser,
        ...(newUser.user_id && {
          user_id: newUser.user_id.replace("auth0|", ""),
        }),
      };
    });

    const destinationConnectionId = await requestConnection(
      "destination",
      destinationDomain,
      destinationToken,
      "id"
    );

    await importUsers({
      users: usersToImport,
      token: destinationToken,
      connectionId: destinationConnectionId,
      tenantDomain: destinationDomain,
      isUpsert: upsert,
    });
  } else {
    console.log("⚠️ No users found to migrate.");
  }
};

migrateUsers().catch((err) => {
  if (err.message === "User force closed the prompt with SIGINT") {
    console.log("\n🛑 Migration cancelled by user.");
  } else {
    console.error("❌ An error occurred during migration:", err);
  }
  process.exit(1);
});
