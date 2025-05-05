# cloudflare-auto-ip

Automatically updates DNS A records on Cloudflare with your server’s current public (WAN) IP address.  
Ideal for dynamic‑IP hosts—no more manually logging into Cloudflare to correct your DNS!

---

## ✨ Features

- **Automatic WAN IP discovery** using [ipify](https://api.ipify.org)
- **Per‑zone filtering** – update only the zones you define
- **Customizable schedule** – powered by cron expressions
- **Optional immediate execution** at startup
- **Lightweight** – runs in Deno with no external dependencies
- **Docker-ready** for easy deployment

---

## 🛠️ Notes

- Deno must be installed on your machine, can be found on this [link](https://docs.deno.com/runtime/getting_started/installation/).
- Your Cloudflare token must have `Zone.DNS` write access to the specified zones.
- The app uses the [ipify](https://api.ipify.org) service to detect your WAN IP.
- Logs are printed to stdout for use with Docker logging or monitoring.

---

## 📦 Environment Variables

You can provide environment variables via a `.env` file, shell, or Docker Compose. Here's what each one does:

| Variable               | Description                                                                                        | Default     | Required |
| ---------------------- | -------------------------------------------------------------------------------------------------- | ----------- | -------- |
| `CLOUDFLARE_API_TOKEN` | Your Cloudflare API token with `Zone.DNS` edit permissions.                                        | _none_      | ✅       |
| `ZONES_ARRAY`          | JSON array of zone names (domains) you want to update, e.g. `["example.com", "home.example.com"]`. | `[]`        | ✅       |
| `CRON_SCHEDULE`        | Cron expression for how often to check and update your IP. Supports 5-field standard cron format.  | `0 * * * *` | ❌       |
| `IMMEDIATE_RUN`        | Whether to run the IP update immediately on startup (`"true"` or `"false"`).                       | `true`      | ❌       |
| `DELAY`                | Delay (in milliseconds) between API requests to avoid rate limits or batching conflicts.           | `3000`      | ❌       |

---

## 🚀 Usage

### 1. Clone the repo

```bash
git clone https://github.com/liavbarsheshet/cloudflare-auto-ip
cd cloudflare-auto-ip
```

### 2. Configure environment

Create a `.env` file or pass the environment variables through your system or Docker Compose.

### 3. Run It

```bash
deno run --allow-read --allow-net --allow-env --unstable-cron ./app.ts
```

---

## 🐳 Docker Support

This project includes a ready-to-use `Dockerfile` and `docker-compose.yaml` for automated deployment.  
You can use them as-is to schedule and run the updater in a containerized environment.

---

## 📄 License

MIT

---

## ✍️ Author

[Liav Barsheshet, LBDevelopments](https://github.com/liavbarsheshet)
