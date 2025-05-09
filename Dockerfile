FROM denoland/deno:alpine

WORKDIR /app

COPY . .

CMD ["deno", "run", "--allow-net", "--allow-env","--allow-read","--unstable-cron", "app.ts"]