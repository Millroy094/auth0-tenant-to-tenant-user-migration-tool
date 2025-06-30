#!/usr/bin/env node

import pick from "lodash/pick";
import { getManagementToken } from "./utils/get-management-token";
import findUserByEmail from "./utils/get-user-by-email";
import getUsersByConnection from "./utils/get-users-by-connection";
import {
  requestAuthOConfiguration,
  requestConnection,
  requestEmail,
} from "./utils/request-prerequiste-data";
import importUsers from "./utils/import-users";

const FIELDS_TO_EXTRACT = [
  "user_id",
  "email",
  "email_verified",
  "name",
  "family_name",
  "given_name",
  "user_metadata",
  "app_metadata",
];

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
    const {
      domain: destinationDomain,
      clientId: destinationClientId,
      clientSecret: destinationClientSecret,
    } = await requestAuthOConfiguration("source");

    const destinationToken = await getManagementToken(
      destinationDomain,
      destinationClientId,
      destinationClientSecret
    );

    const usersToImport = exportedUsers.map((user) => {
      const newUser = pick(user, FIELDS_TO_EXTRACT);
      return { ...newUser, user_id: newUser.user_id.replace("auth0|", "") };
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
    });
  }
};

migrateUsers().catch((err) => {
  console.error("An error occurred:", err);
});
