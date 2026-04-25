/** Relevant subset of Nominatim reverse JSON (https://nominatim.org/release-docs/develop/api/Output/). */
export interface NominatimReverseResponse {
  address?: {
    suburb?: string;
    neighbourhood?: string;
    village?: string;
    city?: string;
    town?: string;
    county?: string;
  };
}
