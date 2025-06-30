# 🚀 Auth0 Tenant-to-Tenant User Migration Tool

A Node.js CLI tool to help you **migrate users from one Auth0 tenant to another** securely and interactively.

---

## ✨ Features

- Migrate users between Auth0 tenants
- Interactive CLI prompts using Inquirer
- Secure handling of credentials
- No need to pass credentials via command line

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
