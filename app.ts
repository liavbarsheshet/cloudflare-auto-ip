import { delay } from "https://deno.land/std@0.224.0/async/delay.ts";
import { CloudflareAPI, getWanIp, TRecord } from "./api.ts";
import "https://deno.land/std@0.224.0/dotenv/load.ts";
import log from "./log.ts";

/** List of Cloudflare zone identifiers, parsed from the environment. */
const ZONES_ARRAY: string[] = Deno.env.get("ZONES_ARRAY") ? JSON.parse(Deno.env.get("ZONES_ARRAY") ?? "[]") : [];

/** Cron schedule string (default: every 1 hour). */
const CRON_SCHEDULE: string = Deno.env.get("CRON_SCHEDULE") ?? "0 * * * *";

/** Whether to execute the task immediately upon initialization. */
const IMMEDIATE_RUN: boolean = Deno.env.get("IMMEDIATE_RUN") === "true";

/** Cloudflare API token for authentication. */
const API_KEY: string | undefined = Deno.env.get("CLOUDFLARE_API_TOKEN");

/** Cloudflare API token for authentication. */
const DELAY: number = parseInt(Deno.env.get("DELAY") ?? "300") ?? 300;

log.info("Starting Cloudflare IP Updater...");

if (!API_KEY) {
  log.error("CLOUDFLARE_API_TOKEN is not set. Exiting.");
  Deno.exit(1);
}

if (!ZONES_ARRAY.length) {
  log.error("ZONES_ARRAY is not set. Exiting.");
  Deno.exit(1);
}

/** Cloudflare API class */
const api = new CloudflareAPI(API_KEY);

/** A schedule task.. */
const task = async () => {
  log.task("Testing API token...");

  if (!(await api.testToken())) {
    log.error("Invalid API token. Exiting.");
    Deno.exit(1);
  }

  log.completed("API token is valid.");

  await delay(DELAY);

  log.task("Fetching zones...");

  await delay(DELAY);

  const zones: Array<{ id: string; name: string }> = await api.getZones(ZONES_ARRAY);

  if (!zones.length) {
    log.warn("No zones were found. Will try again later...");
    return;
  }

  log.completed(`Found ${zones.length} matching zones.`);

  log.task("Getting Machine Wan IP...");

  await delay(DELAY);

  const wanIP = await getWanIp();

  if (!wanIP) {
    log.warn("Failed to get WAN IP. Will try again later...");
    return;
  }

  log.completed(`Machine WAN IP: ${wanIP}`);

  let updated: number = 0;
  let same: number = 0;
  let failed: number = 0;

  for (const zone of zones) {
    let records: Array<TRecord> = [];

    log.task(`Fetching A records for zone ${zone.name}...`);

    await delay(DELAY);

    try {
      records = await api.getARecords(zone.id);
    } catch (err) {
      log.error(`Failed to fetch A records for zone ${zone.name}: ${err}`);
      ++failed;
      continue;
    }

    if (!records.length) {
      log.warn(`No A records found for zone ${zone.name}. Will try again later...`);
      continue;
    }

    log.completed(`Found ${records.length} A records for zone ${zone.name}.`);

    for (const record of records) {
      if (record.content === wanIP) {
        log.info(`Record ${record.name} already points to the correct IP (${wanIP}).`);
        ++same;
        continue;
      }

      log.task(`Updating record ${record.name} to point to ${wanIP}...`);

      await delay(DELAY);

      try {
        await api.updateARecord(zone.id, record, wanIP);
        ++updated;
        log.completed(`Record ${record.name} updated successfully.`);
      } catch (err) {
        --failed;
        log.error(`Failed to update record ${record.name}: ${err}`);
      }
    }
  }

  log.completed("Finished updating available records.");
  log.info(`Updated ${updated} records successfully.`);
  log.info(`Failed to update ${failed} records.`);
  log.info(`${same} records remained the same.`);
  await delay(DELAY);
  log.info("Waiting for next scheduled run...");
};

/** Wrapper for task... */
const scheduleTask = async () => {
  try {
    await task();
  } catch (err) {
    if (err instanceof Error) log.error(err.message);
    else if (typeof err === "string") log.error(err);
    else log.error("An unexpected error occurred. Will try again later...");
  }
};

// Schedule the task to run at start.
if (IMMEDIATE_RUN) scheduleTask();

Deno.cron("CLOUDFLARE-IP-UPDATE", CRON_SCHEDULE, scheduleTask);
