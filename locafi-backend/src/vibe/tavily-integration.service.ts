import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { TavilySearchResponse } from './types/tavily-search.types';

const TAVILY_SEARCH_URL = 'https://api.tavily.com/search';

/** Placeholder until TAVILY_API_KEY is set in the environment. */
const TAVILY_API_KEY_PLACEHOLDER = 'TAVILY_API_KEY_PLACEHOLDER';

@Injectable()
export class TavilyIntegrationService {
  constructor(private readonly http: HttpService) {}

  buildLocalQuery(lat: number, lng: number): string {
    return (
      `Find up to 3 local cafes, retail deals, or live events happening right now near coordinates [${lat}, ${lng}] in the Stuttgart metropolitan area. ` +
      `For each recommendation, provide prices in EUR. Only use amounts explicitly shown as €, EUR, or euro/Euros in sources; do not guess or convert from other currencies. ` +
      `Also identify the neighborhood or district for these coordinates (Stadtteil, Stadtbezirk, or well-known area) and state it clearly in your answer.`
    );
  }

  async searchNearCoordinates(lat: number, lng: number): Promise<TavilySearchResponse> {
    const apiKey = process.env.TAVILY_API_KEY ?? TAVILY_API_KEY_PLACEHOLDER;
    const body = {
      api_key: apiKey,
      query: this.buildLocalQuery(lat, lng),
      search_depth: 'basic' as const,
      max_results: 5,
      topic: 'general' as const,
      country: 'germany',
      include_answer: true,
    };

    const response$ = this.http
      .post<TavilySearchResponse>(TAVILY_SEARCH_URL, body, {
        headers: { 'Content-Type': 'application/json' },
      })
      .pipe(map((res) => res.data));

    return firstValueFrom(response$);
  }
}
