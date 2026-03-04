export const REGIONS = [
    { value: "india", label: "India (IND)" },
    { value: "na", label: "North America (NA)" },
    { value: "eu", label: "Europe (EU)" },
    { value: "asia", label: "Asia (ASIA)" },
    { value: "sea", label: "Southeast Asia (SEA)" },
    { value: "sa", label: "South America (SA)" },
    { value: "oce", label: "Oceania (OCE)" },
    { value: "mena", label: "Middle East & North Africa (MENA)" },
    { value: "latam", label: "Latin America (LATAM)" },
    { value: "brazil", label: "Brazil (BR)" },
] as const;

export type RegionValue = typeof REGIONS[number]["value"];
