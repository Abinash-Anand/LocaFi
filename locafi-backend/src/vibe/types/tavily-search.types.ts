export interface TavilySearchResultItem {
  title: string;
  url: string;
  content: string;
  score?: number;
}

export interface TavilySearchResponse {
  query?: string;
  answer?: string;
  results?: TavilySearchResultItem[];
  response_time?: number;
}
