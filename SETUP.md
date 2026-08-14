# Postiz Self-Hosted Local Stack & Whitelist Portal Setup Guide

Welcome! This document provides instructions for setting up, running, and managing this custom self-hosted fork of Postiz. It is configured to lock down public registration while letting you manage an authorized email whitelist, and is linked to a cloud-hosted dashboard.

---

## 🚀 Quick Start (New PC Setup)

To spin up the entire local stack on a new PC, follow these steps:

### 1. Prerequisites
Ensure you have **Docker Desktop** installed and running on your machine.

### 2. Run the Stack
Run Docker Compose in the root of the repository. This will pull/build the database containers, build the custom Postiz app container from the local source code, and run everything in the background:
```powershell
docker compose up -d
```
*(On container start, database migrations and the Prisma schema changes are applied automatically).*

---

## 🔌 Port & Console Endpoints

Once the containers are running, you can access the following consoles locally:

| Console | Local URL | Description |
| :--- | :--- | :--- |
| **Postiz Web App** | [http://localhost:4007](http://localhost:4007) | Main scheduling and post management dashboard |
| **Temporal UI** | [http://localhost:8080](http://localhost:8080) | Workflow engine monitor and background worker control |
| **Sentry Spotlight** | [http://localhost:8969](http://localhost:8969) | Local event log and error debugging dashboard |

---

## 🔒 User Management & Whitelisting

This fork restricts registrations to a whitelisted group of emails managed by you.

### 1. Create the First Admin Account
If this is a fresh setup with an empty database:
1. Navigate to [http://localhost:4007](http://localhost:4007) and sign up with your Email and Password.
2. Promoting your account to **SuperAdmin** requires running a database update query. Execute this in your shell:
   ```powershell
   "UPDATE public.`"User`" SET `"isSuperAdmin`" = true WHERE email = 'your-email@example.com';" | docker exec -i postiz-postgres psql -U postiz-user -d postiz-db-local
   ```

### 2. Authorize Other Users
1. Log in to [http://localhost:4007](http://localhost:4007) as a SuperAdmin.
2. Click the **Manage Whitelist** button in the top admin control bar, or visit [http://localhost:4007/admin/whitelist](http://localhost:4007/admin/whitelist).
3. Enter the email address you wish to authorize and click **Authorize**.
4. Now, if that user tries to sign up on your instance, they will be permitted. Any other email addresses not on the whitelist will be blocked with a `"Registration is disabled"` error.

---

## ☁️ Google Cloud Run Portal Dashboard

We have hosted a lightweight Control Center portal on GCP that groups access to your local consoles:
* **GCP Portal URL**: [https://postiz-control-center-wvhdsxryjq-uc.a.run.app](https://postiz-control-center-wvhdsxryjq-uc.a.run.app)
* **GCP Project ID**: `postiz-504613`

### Features:
- Provides single-click redirection to all three local services.
- Executes client-side connection probes (pings) from your browser. It will display a pulsing green **Online** status if your local Docker stack is running, and red **Offline** if it is stopped.
- Cloud Run automatically **scales to zero** when the page is closed, generating no idle hosting costs.

---

## 🧠 Codebase Intelligence (Graphify & Antigravity)

This repository is integrated with **`graphify`** for structural analysis and codebase navigation:
* **Pre-built Graph**: The knowledge graph directory `graphify-out/` is committed to the repository.
* **Auto-Updates**: Git hooks are automatically configured when you run `pnpm install` (via the postinstall script). When you commit code changes, the pre-commit hook runs `graphify` to incrementally update the AST graph database and automatically stage it (`git add graphify-out/`), ensuring your remote repository is always up-to-date.
* **Antigravity Integration**: Antigravity configuration files are saved in `.agents/rules/graphify.md`. When opening this repository with Antigravity on *any* computer, the agent will immediately consume the graph to answer codebase layout and architecture questions with 100% accuracy.

