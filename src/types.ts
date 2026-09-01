export interface IpLookupResult {
  ip: string;
  success: boolean;
  type?: string;
  continent?: string;
  continent_code?: string;
  country?: string;
  country_code?: string;
  country_flag?: {
    emoji?: string;
    unicode?: string;
  };
  region?: string;
  region_code?: string;
  city?: string;
  latitude?: number;
  longitude?: number;
  is_eu?: boolean;
  postal?: string;
  calling_code?: string;
  capital?: string;
  borders?: string;
  flag?: {
    img?: string;
    emoji?: string;
    emoji_unicode?: string;
  };
  connection?: {
    asn?: number;
    org?: string;
    isp?: string;
    domain?: string;
  };
  timezone?: {
    id?: string;
    abbr?: string;
    is_dst?: boolean;
    offset?: number;
    utc?: string;
    current_time?: string;
  };
  security?: {
    anonymous?: boolean;
    proxy?: boolean;
    vpn?: boolean;
    tor?: boolean;
    hosting?: boolean;
  };
  message?: string;
}

export interface DnsRecord {
  name: string;
  type: number | string;
  typeName: string;
  TTL: number;
  data: string;
}

export interface DnsResponse {
  Status: number;
  TC: boolean;
  RD: boolean;
  RA: boolean;
  AD: boolean;
  CD: boolean;
  Question: Array<{ name: string; type: number }>;
  Answer?: Array<{ name: string; type: number; TTL: number; data: string }>;
  Authority?: Array<{ name: string; type: number; TTL: number; data: string }>;
}

export interface RdapResponse {
  handle?: string;
  ldhName?: string;
  status?: string[];
  entities?: Array<{
    roles?: string[];
    vcardArray?: any[];
    handle?: string;
  }>;
  events?: Array<{
    eventAction?: string;
    eventDate?: string;
  }>;
  nameservers?: Array<{
    ldhName?: string;
  }>;
}

export interface SearchHistoryItem {
  id: string;
  domain: string;
  ip: string;
  country?: string;
  countryCode?: string;
  timestamp: number;
}

export interface AnalysisState {
  domain: string;
  ipData: IpLookupResult | null;
  dnsRecords: DnsRecord[];
  dnsLoading: boolean;
  latencyMs: number | null;
  timestamp: number;
}
