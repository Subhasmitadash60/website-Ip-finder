import { DnsRecord, DnsResponse, IpLookupResult } from '../types';

export const DNS_TYPE_MAP: Record<number, string> = {
  1: 'A',
  2: 'NS',
  5: 'CNAME',
  6: 'SOA',
  12: 'PTR',
  15: 'MX',
  16: 'TXT',
  28: 'AAAA',
  33: 'SRV',
  257: 'CAA',
};

export const COMMON_DNS_TYPES = ['A', 'AAAA', 'MX', 'NS', 'TXT', 'SOA', 'CNAME', 'CAA'];

/**
 * Normalizes input string to extract clean domain/hostname or IP
 */
export function cleanDomain(input: string): string {
  let value = input.trim();
  if (!value) {
    throw new Error('Please enter a website URL or domain name.');
  }

  // Remove leading/trailing quotes or brackets
  value = value.replace(/^["'\[]+|["'\]]+$/g, '');

  // If already an IPv4 or IPv6, return directly
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (ipv4Regex.test(value)) {
    return value;
  }

  // Add protocol prefix if missing for URL parser
  if (!/^https?:\/\//i.test(value)) {
    value = 'https://' + value;
  }

  try {
    const url = new URL(value);
    let hostname = url.hostname.trim().toLowerCase();

    // Strip port if present
    hostname = hostname.split(':')[0];

    // Remove leading 'www.' if user typed www
    hostname = hostname.replace(/^www\./, '');

    if (!hostname || hostname.length < 2) {
      throw new Error('Invalid domain name provided.');
    }

    return hostname;
  } catch {
    throw new Error('Please enter a valid website URL or domain name (e.g. google.com).');
  }
}

/**
 * Fetch IP intelligence and geolocation
 */
export async function fetchIpIntelligence(target: string): Promise<IpLookupResult> {
  const cleanTarget = cleanDomain(target);

  try {
    const response = await fetch(`https://ipwho.is/${encodeURIComponent(cleanTarget)}`);
    if (!response.ok) {
      throw new Error(`Lookup service responded with HTTP ${response.status}`);
    }
    const data: IpLookupResult = await response.json();
    if (!data.success && data.message) {
      throw new Error(data.message);
    }
    return data;
  } catch (err: any) {
    // Fallback attempt with alternative free provider
    try {
      const fallbackResp = await fetch(`https://api.country.is/${encodeURIComponent(cleanTarget)}`);
      if (fallbackResp.ok) {
        const fbData = await fallbackResp.json();
        return {
          ip: fbData.ip || cleanTarget,
          success: true,
          country: fbData.country,
          country_code: fbData.country,
          connection: {
            isp: 'Public Network',
            org: 'Identified via fallback provider',
          },
        };
      }
    } catch {
      // Continue to throw primary error
    }
    throw new Error(err.message || 'Unable to resolve network information for this domain.');
  }
}

/**
 * Fetch DNS records using Google DoH or Cloudflare DoH
 */
export async function fetchDnsRecords(domain: string, types: string[] = COMMON_DNS_TYPES): Promise<DnsRecord[]> {
  const records: DnsRecord[] = [];
  const cleanHost = cleanDomain(domain);

  const lookupPromises = types.map(async (type) => {
    try {
      // Primary: Google DNS-over-HTTPS
      const res = await fetch(`https://dns.google/resolve?name=${encodeURIComponent(cleanHost)}&type=${type}`, {
        headers: { Accept: 'application/dns-json' },
      });

      if (!res.ok) return;
      const data: DnsResponse = await res.json();

      if (data.Answer && data.Answer.length > 0) {
        data.Answer.forEach((ans) => {
          const typeName = typeof ans.type === 'number' ? (DNS_TYPE_MAP[ans.type] || `TYPE_${ans.type}`) : type;
          records.push({
            name: ans.name,
            type: ans.type,
            typeName: typeName || type,
            TTL: ans.TTL,
            data: ans.data,
          });
        });
      }
    } catch (err) {
      // Try Cloudflare DoH fallback for this type
      try {
        const cfRes = await fetch(`https://cloudflare-dns.com/dns-query?name=${encodeURIComponent(cleanHost)}&type=${type}`, {
          headers: { Accept: 'application/dns-json' },
        });
        if (cfRes.ok) {
          const cfData: DnsResponse = await cfRes.json();
          if (cfData.Answer) {
            cfData.Answer.forEach((ans) => {
              const typeName = typeof ans.type === 'number' ? (DNS_TYPE_MAP[ans.type] || `TYPE_${ans.type}`) : type;
              records.push({
                name: ans.name,
                type: ans.type,
                typeName: typeName || type,
                TTL: ans.TTL,
                data: ans.data,
              });
            });
          }
        }
      } catch {
        // Silently skip if type has no records
      }
    }
  });

  await Promise.allSettled(lookupPromises);
  return records;
}

/**
 * Estimate latency / response ping from user client
 */
export async function measureLatency(domain: string): Promise<number | null> {
  const cleanHost = cleanDomain(domain);
  const startTime = performance.now();

  try {
    // Attempt favicon or root ping with cache busting & no-cors mode
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    await fetch(`https://${cleanHost}/favicon.ico?_t=${Date.now()}`, {
      mode: 'no-cors',
      cache: 'no-cache',
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return Math.round(performance.now() - startTime);
  } catch {
    // Return DNS fetch roundtrip time if HTTPS fetch fails due to CORS or mixed content
    try {
      const dnsStart = performance.now();
      await fetch(`https://dns.google/resolve?name=${encodeURIComponent(cleanHost)}&type=A`);
      return Math.round(performance.now() - dnsStart);
    } catch {
      return null;
    }
  }
}

/**
 * Fetch RDAP (Registration Data Access Protocol) for WHOIS domain info
 */
export async function fetchRdapInfo(domain: string): Promise<any | null> {
  const cleanHost = cleanDomain(domain);
  try {
    const res = await fetch(`https://rdap.org/domain/${encodeURIComponent(cleanHost)}`);
    if (res.ok) {
      return await res.json();
    }
  } catch {
    // Fail gracefully
  }
  return null;
}
