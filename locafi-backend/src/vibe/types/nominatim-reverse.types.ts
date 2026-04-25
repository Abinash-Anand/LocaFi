/** Relevant subset of Nominatim reverse JSON (https://nominatim.org/release-docs/develop/api/Output/). */
export interface NominatimReverseResponse {
  name?: string;
  address?: {
    neighbourhood?: string;
    suburb?: string;
    quarter?: string;
    city_district?: string;
    hamlet?: string;
    village?: string;
    town?: string;
    municipality?: string;
    city?: string;
    county?: string;
  };
}
