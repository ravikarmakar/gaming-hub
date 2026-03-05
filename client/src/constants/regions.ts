export const REGIONS = [
    { value: "INDIA", label: "India (IND)" },
    { value: "NA", label: "North America (NA)" },
    { value: "EU", label: "Europe (EU)" },
    { value: "ASIA", label: "Asia (ASIA)" },
    { value: "SEA", label: "Southeast Asia (SEA)" },
    { value: "SA", label: "South America (SA)" },
    { value: "OCE", label: "Oceania (OCE)" },
    { value: "MENA", label: "Middle East & North Africa (MENA)" },
    { value: "GLOBAL", label: "Global (GLOBAL)" },
] as const;

export type RegionValue = typeof REGIONS[number]["value"];
