import { SEO_CITIES } from "@/lib/seoData";

export type ProgrammaticCity = {
  slug: string;
  name: string;
  state: string;
  stateCode: string;
  tier: 1 | 2 | 3;
  region: string;
  rank: number;
};

const STATE_CODE_BY_STATE: Record<string, string> = {
  "Uttar Pradesh": "UP",
  Delhi: "Delhi",
  Maharashtra: "MH",
  Karnataka: "KA",
  Telangana: "TS",
  "Tamil Nadu": "TN",
  "West Bengal": "WB",
  Gujarat: "GJ",
  Rajasthan: "RJ",
  "Madhya Pradesh": "MP",
  Bihar: "BR",
  Punjab: "PB",
  Haryana: "HR",
  "Andhra Pradesh": "AP",
  Jharkhand: "JH",
  Assam: "AS",
  Chandigarh: "CH",
  Odisha: "OD",
  Kerala: "KL",
  Uttarakhand: "UK",
  "Chhattisgarh": "CG",
  Puducherry: "PY",
  "Jammu and Kashmir": "JK",
};

function tierFromRank(rank: number): ProgrammaticCity["tier"] {
  if (rank <= 10) return 1;
  if (rank <= 60) return 2;
  return 3;
}

export const CITIES: ProgrammaticCity[] = SEO_CITIES.map((city) => ({
  slug: city.slug,
  name: city.name,
  state: city.state,
  stateCode: STATE_CODE_BY_STATE[city.state] || city.state,
  tier: tierFromRank(city.rank),
  region: city.region,
  rank: city.rank,
}));

export function getProgrammaticCity(slug: string) {
  const normalized = slug.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return CITIES.find((city) => city.slug === normalized) || null;
}
