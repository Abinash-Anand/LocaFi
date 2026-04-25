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

  /**
   * Short query to stay under Tavily length limits; neighborhood comes from Nominatim upstream.
   */
  buildLocalQuery(locationName: string): string {
    const name = (locationName ?? 'Stuttgart').trim() || 'Stuttgart';
    return `Local cafes and deals in ${name}, Stuttgart`;
  }

  async searchNearCoordinates(_lat: number, _lng: number, locationNameForQuery: string): Promise<TavilySearchResponse> {
    const apiKey = process.env.TAVILY_API_KEY ?? TAVILY_API_KEY_PLACEHOLDER;
    const body = {
      api_key: apiKey,
      query: this.buildLocalQuery(locationNameForQuery),
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
