import axios from "axios";
import FormData from "form-data";
import dotenv from "dotenv";
import { Readable } from "stream";

dotenv.config();

type IImportUsersArguments = {
  users: any[];
  token: string;
  connectionId: string;
  tenantDomain: string;
};

async function importUsers({
  users,
  token,
  connectionId,
  tenantDomain,
}: IImportUsersArguments): Promise<void> {
  const jsonBuffer = Buffer.from(JSON.stringify(users, null, 2));
  const stream = Readable.from(jsonBuffer);

  const form = new FormData();
  form.append("users", stream, {
    filename: "users.json",
    contentType: "application/json",
  });
  form.append("connection_id", connectionId);
  form.append("upsert", "false");

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

  console.log("📋 Import Job Summary");
  console.log("----------------------");
  console.log(`Job ID: ${response.data.id}`);
  console.log(`Status: ${response.data.status}`);
  console.log(`Type: ${response.data.type}`);
  console.log(`Created At: ${response.data.created_at}`);
  console.log(`Connection ID: ${response.data.connection_id}`);
  if (response.data.status === "completed") {
    console.log(`Users Processed: ${response.data.users_processed}`);
    console.log(`Users Inserted: ${response.data.users_inserted}`);
    console.log(`Users Failed: ${response.data.users_failed}`);
    if (response.data.location) {
      console.log(`Error Report: ${response.data.location}`);
    }
  }
}

export default importUsers;
