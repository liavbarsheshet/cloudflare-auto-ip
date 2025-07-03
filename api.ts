export type TRecord = { id: string; name: string; ttl: number; content: string; proxied: boolean };

export class CloudflareAPI {
  private readonly baseUrl = "https://api.cloudflare.com/client/v4";
  private readonly headers: Headers;

  constructor(private token: string) {
    this.headers = new Headers({
      Authorization: `Bearer ${this.token}`,
      "Content-Type": "application/json",
    });
  }

  async testToken(): Promise<boolean> {
    const res = await fetch(`${this.baseUrl}/user/tokens/verify`, {
      method: "GET",
      headers: this.headers,
    });

    const data = await res.json();

    return data.success;
  }

  async getZones(allowedZones: string[]): Promise<Array<{ id: string; name: string }>> {
    const res = await fetch(`${this.baseUrl}/zones`, { headers: this.headers });

    const data = await res.json();

    if (!data.success) {
      throw new Error("Failed to fetch zones: " + JSON.stringify(data.errors));
    }

    return data.result.filter(
      (zone: { name: string; status: string }) => allowedZones.includes(zone.name) && zone.status === "active"
    );
  }

  async getARecords(zoneId: string): Promise<Array<TRecord>> {
    const res = await fetch(`${this.baseUrl}/zones/${zoneId}/dns_records?type=A`, {
      headers: this.headers,
    });

    const data = await res.json();

    if (!data.success) throw new Error("Failed to fetch A records: " + JSON.stringify(data.errors));

    return data.result;
  }

  async updateARecord(zoneId: string, record: TRecord, newIp: string): Promise<void> {
    const body = {
      type: "A",
      name: record.name,
      content: newIp,
      ttl: record.ttl ?? 1,
      proxied: record.proxied,
    };

    const res = await fetch(`${this.baseUrl}/zones/${zoneId}/dns_records/${record.id}`, {
      method: "PUT",
      headers: this.headers,
      body: JSON.stringify(body),
    });

    const data = await res.json();

    if (!data.success) throw new Error(`Failed to update A record '${record.name}': ${JSON.stringify(data.errors)}`);
  }
}

export async function getWanIp(): Promise<string | undefined> {
  const res = await fetch("https://api.ipify.org?format=text");

  if (!res.ok) return undefined;

  const ip = (await res.text()).trim();

  if (!ip.match(/^(\d{1,3}\.){3}\d{1,3}$/)) return undefined;

  return ip;
}
