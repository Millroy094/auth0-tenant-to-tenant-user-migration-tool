# 🚀 Auth0 Tenant-to-Tenant User Migration Tool

A Node.js CLI tool to help you **migrate users from one Auth0 tenant to another** securely and interactively.

---

## ✨ Features

- Migrate users between Auth0 tenants
- Interactive CLI prompts using Inquirer
- Secure handling of credentials
- No need to pass credentials via command line

### 🆕 New Features

- **Interactive Field Selection**: During the migration process, you'll be prompted to choose which user fields to include—giving you full control over the data being transferred.
- **Upsert Option**: You can now choose whether to update existing users or create new ones during migration, all through a simple interactive prompt.

## ⚙️ Prerequisites

Before using this tool, you need to:

1. **Create a Machine-to-Machine Application** in your Auth0 dashboard.
2. **Grant it the following permissions**:
   - `read:users`
   - `create:users`
   - `update:users`
   - `read:connections`
3. **Note the following credentials**:
   - **Client ID**
   - **Client Secret**
   - **Auth0 Domain** (e.g., `your-tenant.auth0.com`)

These credentials will be used by the CLI to authenticate and perform operations on your behalf.

## 📥 Installation

Install the CLI globally using npm:

```bash
npm install -g auth0-tenant-to-tenant-user-migration-tool
```

---

## 🛠️ Usage

To start the migration process, simply run:

```bash
migrate-auth0-tenant-users
```

The CLI will prompt you to enter:
- Source tenant domain, client ID, and client secret
- Target tenant domain, client ID, and client secret

All inputs are securely handled using Inquirer.

---

## 📄 Example

```bash
migrate-auth0-tenant-users
```

You’ll be prompted to enter:

- Source Tenant Domain: `source-tenant.auth0.com`  
- Source Client ID: `abc123`  
- Source Client Secret: `shhhItsASecret`  
- Target Tenant Domain: `target-tenant.auth0.com`  
- Target Client ID: `xyz789`  
- Target Client Secret: `anotherSecret`

The CLI will then begin migrating users from the source tenant to the target tenant.

---

## 📃 License

This project is licensed under the MIT License. 

---
