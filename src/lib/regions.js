// Country → region, for market CPA inheritance.
//
// A country with no explicit rate takes its region's, so pricing LATAM once
// covers Colombia, Bolivia, Ecuador, Peru and Chile — and prices the next
// LATAM country the day it starts producing deposits, instead of counting its
// deposits as worthless until someone notices.
//
// Grouped by what an FTD is worth to a buyer, not by geography: Mexico and
// Brazil sell at similar prices, Germany and Japan at similar ones, and those
// two sets are nothing alike. Tier 1 is deliberately separate from Europe for
// that reason — Norway does not price like Romania.
//
// Countries absent here fall to "Other", which can also carry a rate.

export const REGIONS = ["LATAM", "Europe", "Tier 1", "Africa", "Asia", "MENA", "Other"];

const MEMBERS = {
  LATAM: [
    "Mexico", "Brazil", "Argentina", "Colombia", "Chile", "Peru", "Ecuador",
    "Bolivia", "Uruguay", "Paraguay", "Venezuela", "Costa Rica", "Panama",
    "Guatemala", "Honduras", "Nicaragua", "El Salvador", "Dominican Republic",
    "Puerto Rico", "Cuba",
  ],
  "Tier 1": [
    "United States", "Canada", "United Kingdom", "Australia", "New Zealand",
    "Ireland", "Germany", "France", "Netherlands", "Belgium", "Switzerland",
    "Austria", "Sweden", "Norway", "Denmark", "Finland", "Japan", "South Korea",
    "Singapore", "Italy", "Spain",
  ],
  Europe: [
    "Portugal", "Poland", "Czechia", "Czech Republic", "Slovakia", "Hungary",
    "Romania", "Bulgaria", "Greece", "Croatia", "Serbia", "Slovenia",
    "Bosnia and Herzegovina", "Albania", "North Macedonia", "Montenegro",
    "Ukraine", "Moldova", "Lithuania", "Latvia", "Estonia", "Iceland",
    "Luxembourg", "Malta", "Cyprus",
  ],
  Africa: [
    "Nigeria", "Kenya", "Ghana", "South Africa", "Tanzania", "Uganda", "Zambia",
    "Cameroon", "Ivory Coast", "Côte d'Ivoire", "Senegal", "Angola",
    "Mozambique", "Ethiopia", "Rwanda", "Zimbabwe", "Botswana", "Congo",
    "Democratic Republic of the Congo",
  ],
  Asia: [
    "India", "Indonesia", "Philippines", "Vietnam", "Thailand", "Malaysia",
    "Bangladesh", "Pakistan", "Sri Lanka", "Nepal", "Cambodia", "Myanmar",
    "China", "Hong Kong", "Taiwan", "Kazakhstan", "Uzbekistan",
  ],
  MENA: [
    "Turkey", "United Arab Emirates", "Saudi Arabia", "Qatar", "Kuwait",
    "Bahrain", "Oman", "Jordan", "Lebanon", "Egypt", "Morocco", "Tunisia",
    "Algeria", "Iraq", "Israel",
  ],
};

const LOOKUP = new Map();
for (const [region, countries] of Object.entries(MEMBERS)) {
  for (const country of countries) LOOKUP.set(country.toLowerCase(), region);
}

export const regionForCountry = (country) =>
  LOOKUP.get(String(country || "").trim().toLowerCase()) || "Other";

// The rate that applies to a country, and where it came from. Callers show the
// source so an inherited number is never mistaken for one somebody chose.
export const resolveCpa = (country, rateByCountry, rateByRegion) => {
  const explicit = rateByCountry?.get?.(country);
  if (Number(explicit) > 0) return { cpa: Number(explicit), source: "country", region: null };
  const region = regionForCountry(country);
  const inherited = rateByRegion?.get?.(region);
  if (Number(inherited) > 0) return { cpa: Number(inherited), source: "region", region };
  return { cpa: 0, source: "none", region };
};
