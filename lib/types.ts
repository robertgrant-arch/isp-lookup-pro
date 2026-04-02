export interface Provider {
  provider_id: number;
  brand_name: string;
  technology: number;
  technology_label: string;
  technology_category: TechCategory;
  max_download_speed: number;
  max_upload_speed: number;
  low_latency: boolean;
  business_residential_code: string;
}

export type TechCategory = 'fiber' | 'cable' | 'dsl' | 'satellite' | 'fixed_wireless' | 'other';

export interface LocationResult {
  location_id: string;
  address: string;
  unit: string | null;
  city: string;
  state: string;
  zip: string;
  latitude: number;
  longitude: number;
}

export interface LookupResponse {
  address: string;
  location_id: string;
  latitude: number;
  longitude: number;
  providers: Provider[];
  cached: boolean;
  timestamp: string;
}

export interface ApiKey {
  key: string;
  label: string;
  created_at: string;
  last_used: string | null;
  requests_today: number;
  requests_total: number;
  rate_limit: number;
  last_reset: string;
  active: boolean;
}

export interface UsageStats {
  key: string;
  label: string;
  requests_today: number;
  requests_total: number;
  rate_limit: number;
  remaining_today: number;
  last_used: string | null;
  created_at: string;
  active: boolean;
}
