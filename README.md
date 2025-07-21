# 🚀 Auth0 Tenant-to-Tenant User Migration Tool

A Node.js CLI tool to help you **migrate users from one Auth0 tenant to another** securely and interactively. You will also able to migrate your roles and apply them to users in the new tenant. The assignment follows a fail proof approach where if a role doesn't exist it will be created, if it does it will be reused.

---

## ✨ Features

- Migrate users between Auth0 tenants
- Migrate user roles between Auth0 tenants
- Interactive CLI prompts using Inquirer

## ⚙️ Prerequisites

To use this tool, you must create a **Machine-to-Machine Application** in Auth0 for both the **source** and **destination** tenants. These applications must be granted specific permissions to interact with the Auth0 Management API.

### ✅ Steps to Set Up

1. **Log in to your Auth0 Dashboard**  
   Go to https://manage.auth0.com and select the appropriate tenant.

2. **Create a Machine-to-Machine Application**
   - Navigate to **Applications → Applications**.
   - Click **"Create Application"**.
   - Name it (e.g., `Migration Tool App`).
   - Choose **"Machine to Machine Applications"**.
   - Click **"Create"**.

3. **Authorize the Application to Use the Management API**
   - After creating the app, you'll be prompted to authorize it to use the **Auth0 Management API**.
   - Click **"Authorize"**.

 **Grant the Required Permissions (Scopes)**

   To enable secure and complete migration of users and roles between tenants, ensure your **Machine-to-Machine Applications** have the following **Auth0 Management API scopes**:

   | Scope                       | Source Tenant | Destination Tenant |
   |-----------------------------|---------------|--------------------|
   | `read:connections`          | ✅             | ✅                  |
   | `read:users`                | ✅             | ✅                  |
   | `update:users`              | ❌             | ✅                  |
   | `create:users`              | ❌             | ✅                  |
   | `delete:users_app_metadata` | ❌             | ✅                  |
   | `create:users_app_metadata` | ❌             | ✅                  |
   | `update:users_app_metadata` | ❌             | ✅                  |
   | `read:roles`                | ✅             | ✅                  |
   | `create:roles`              | ❌             | ✅                  |
   | `read:role_members`         | ✅             | ❌                  |
   | `assign:roles`              | ❌             | ✅                  |

   > ⚠️ **Note:** These scopes must be granted when authorizing the Machine-to-Machine Application to access the Auth0 Management API for each tenant.

---

## 📥 Installation

Install the CLI globally using npm:

```bash
npm install -g auth0-tenant-to-tenant-user-migration-tool
```

---

## 🛠️ Usage

To start the migration process, simply run:

```bash
migrate-auth0-tenant-users migrate-users // For user migration
migrate-auth0-tenant-users migrate-user-roles // For user roles migration
```

The CLI will prompt you to enter:
- Source tenant domain, client ID, and client secret
- Target tenant domain, client ID, and client secret

All inputs are securely handled using Inquirer.

---

## 📃 License

This project is licensed under the MIT License. 

---
