import axios from "axios";
import FormData from "form-data";
import { Readable } from "stream";
import logger from "./logger";

type IImportUsersArguments = {
  users: any[];
  token: string;
  connectionId: string;
  tenantDomain: string;
  isUpsert: boolean;
};

async function waitForJobCompletion(
  jobId: string,
  token: string,
  tenantDomain: string,
  intervalMs = 5000,
  timeoutMs = 300000
): Promise<any> {
  const start = Date.now();

  while (Date.now() - start < timeoutMs) {
    const response = await axios.get(
      `https://${tenantDomain}/api/v2/jobs/${jobId}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const status = response.data.status;
    if (status === "completed" || status === "failed") {
      return response.data;
    }

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  throw new Error("Timed out waiting for import job to complete.");
}

async function importUsers({
  users,
  token,
  connectionId,
  tenantDomain,
  isUpsert,
}: IImportUsersArguments): Promise<void> {
  const jsonBuffer = Buffer.from(JSON.stringify(users, null, 2));
  const stream = Readable.from(jsonBuffer);

  const form = new FormData();
  form.append("users", stream, {
    filename: "users.json",
    contentType: "application/json",
  });
  form.append("connection_id", connectionId);
  form.append("upsert", isUpsert.toString());

  const response = await axios.post(
    `https://${tenantDomain}/api/v2/jobs/users-imports`,
    form,
    {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const jobId = response.data.id;
  logger.info(
    `📤 Import job started. Waiting for completion (Job ID: ${jobId})...`
  );

  const finalStatus = await waitForJobCompletion(jobId, token, tenantDomain);

  logger.info("📋 Import Job Summary");
  logger.info("----------------------");
  logger.info(`Job ID: ${finalStatus.id}`);
  logger.info(`Status: ${finalStatus.status}`);
  logger.info(`Type: ${finalStatus.type}`);
  logger.info(`Created At: ${finalStatus.created_at}`);
  logger.info(`Connection ID: ${finalStatus.connection_id}`);
  logger.info(`Users Processed: ${finalStatus.summary.total}`);
  logger.info(`Users Inserted: ${finalStatus.summary.inserted}`);
  logger.info(`Users Updated: ${finalStatus.summary.updated}`);
  logger.info(`Users Failed: ${finalStatus.summary.failed}`);
}

export default importUsers;
