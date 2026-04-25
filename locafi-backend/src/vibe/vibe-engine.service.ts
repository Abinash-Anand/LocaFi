import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';
import { createHash } from 'crypto';
import { firstValueFrom } from 'rxjs';
import { map } from 'rxjs/operators';
import { CityContext, VibeOffer, VibeOfferTag } from '../models/interfaces';
import { TavilyIntegrationService } from './tavily-integration.service';
import { NominatimReverseResponse } from './types/nominatim-reverse.types';
import { OpenMeteoForecastResponse } from './types/open-meteo-forecast.types';
import { TavilySearchResponse, TavilySearchResultItem } from './types/tavily-search.types';

const NOMINATIM_REVERSE_URL = 'https://nominatim.openstreetmap.org/reverse';
const OPEN_METEO_FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

/** OSM policy: identify the application (https://operations.osmfoundation.org/policies/nominatim/). */
const NOMINATIM_USER_AGENT = 'LocaFi/1.0 (DSV Gruppe Hackathon; contact: hackathon@locafi.local)';

export interface ContextResponseDto {
  context: CityContext;
  offers: VibeOffer[];
}

@Injectable()
export class VibeEngineService {
  private readonly logger = new Logger(VibeEngineService.name);

  constructor(
    private readonly tavily: TavilyIntegrationService,
    private readonly http: HttpService,
  ) {}

  async getContextWithOffers(lat: number, lng: number): Promise<ContextResponseDto> {
    try {
      const tavilyResponse = await this.tavily.searchNearCoordinates(lat, lng);
      const offers = this.mapTavilyResultsToOffers(tavilyResponse.results ?? []);
      const context = await this.buildCityContext(lat, lng, tavilyResponse, offers.length);
      return { context, offers };
    } catch (err: unknown) {
      const error = err as { response?: { data?: unknown }; message?: string };
      console.error('[Tavily Debug]', error.response?.data ?? error.message ?? String(err));
      this.logger.warn(`Tavily search failed, returning empty offers: ${this.formatTavilyError(err)}`);
      const context = await this.buildFallbackContext(lat, lng);
      return { context, offers: [] };
    }
  }

  private formatTavilyError(err: unknown): string {
    if (axios.isAxiosError(err)) {
      return `${err.message} status=${err.response?.status ?? 'n/a'}`;
    }
    if (err instanceof Error) {
      return err.message;
    }
    return String(err);
  }

  private async buildFallbackContext(lat: number, lng: number): Promise<CityContext> {
    const weather =
      (await this.fetchOpenMeteoWeatherFormatted(lat, lng)) ?? 'Weather data temporarily unavailable';
    const fromOsm = await this.getNeighborhoodFromCoords(lat, lng);
    const locationName = fromOsm ?? this.fallbackLocationLabel(lat, lng);
    return {
      locationName,
      weather,
      vibeScore: 50,
    };
  }

  private async buildCityContext(
    lat: number,
    lng: number,
    tavily: TavilySearchResponse,
    offerCount: number,
  ): Promise<CityContext> {
    const locationName = await this.resolveLocationName(lat, lng, tavily);
    const weather =
      (await this.fetchOpenMeteoWeatherFormatted(lat, lng)) ?? 'Weather data temporarily unavailable';
    const baseScore = Math.min(95, 55 + offerCount * 8 + (tavily.answer?.length ? 5 : 0));
    const vibeScore = Math.round(baseScore);
    return { locationName, weather, vibeScore };
  }

  /**
   * Current conditions from Open-Meteo, e.g. "22°C, Mostly Sunny".
   */
  private async fetchOpenMeteoWeatherFormatted(lat: number, lng: number): Promise<string | null> {
    try {
      const data$ = this.http
        .get<OpenMeteoForecastResponse>(OPEN_METEO_FORECAST_URL, {
          params: {
            latitude: lat,
            longitude: lng,
            current_weather: true,
          },
          timeout: 12_000,
        })
        .pipe(map((res) => res.data));

      const data = await firstValueFrom(data$);
      const cw = data.current_weather;
      if (!cw) {
        return null;
      }

      const temp = cw.temperature;
      const code = cw.weathercode;
      if (temp === undefined || code === undefined || !Number.isFinite(temp) || !Number.isFinite(code)) {
        return null;
      }

      const rounded = Math.round(temp);
      const label = weatherCodeToReadableLabel(Math.round(code), cw.is_day);
      return `${rounded}°C, ${label}`;
    } catch {
      return null;
    }
  }

  /**
   * OpenStreetMap Nominatim reverse geocode. Returns a display name from address fields, or null if
   * the request fails or no suitable field is present (caller may fall back to Tavily parsing or coordinates).
   */
  async getNeighborhoodFromCoords(lat: number, lng: number): Promise<string | null> {
    try {
      const data$ = this.http
        .get<NominatimReverseResponse>(NOMINATIM_REVERSE_URL, {
          params: {
            format: 'json',
            lat,
            lon: lng,
            zoom: 16,
          },
          headers: {
            'User-Agent': NOMINATIM_USER_AGENT,
            'Accept-Language': 'de,en;q=0.9',
          },
          timeout: 12_000,
        })
        .pipe(map((res) => res.data));

      const data = await firstValueFrom(data$);
      const addr = data.address;
      if (addr) {
        /** Prefer fine-grained place names (suburb / neighbourhood / town) before whole city. */
        const candidates = [
          addr.neighbourhood,
          addr.suburb,
          addr.quarter,
          addr.city_district,
          addr.hamlet,
          addr.village,
          addr.town,
          addr.municipality,
          addr.city,
          addr.county,
        ];
        for (const c of candidates) {
          if (typeof c === 'string' && c.trim().length > 0) {
            return c.trim();
          }
        }
      }

      if (typeof data.name === 'string' && data.name.trim().length > 0) {
        return data.name.trim();
      }

      return null;
    } catch {
      return null;
    }
  }

  private async resolveLocationName(
    lat: number,
    lng: number,
    tavily: TavilySearchResponse,
  ): Promise<string> {
    const fromOsm = await this.getNeighborhoodFromCoords(lat, lng);
    if (fromOsm) {
      return fromOsm;
    }

    const fromTavily = this.parseLocationNameFromTavily(tavily);
    if (fromTavily) {
      return fromTavily;
    }

    return this.fallbackLocationLabel(lat, lng);
  }

  /**
   * Derives a label from Tavily answer/results only (no coordinate fallback).
   */
  private parseLocationNameFromTavily(tavily: TavilySearchResponse): string | null {
    const fromAnswer = this.extractNeighborhoodFromText(tavily.answer ?? '');
    if (fromAnswer) {
      return fromAnswer;
    }

    const resultsText =
      tavily.results?.map((r) => `${r.title ?? ''} ${r.content ?? ''}`).join('\n') ?? '';
    return this.extractNeighborhoodFromText(resultsText);
  }

  private fallbackLocationLabel(lat: number, lng: number): string {
    return `Near ${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  }

  private extractNeighborhoodFromText(text: string): string | null {
    const normalized = text.replace(/\s+/g, ' ').trim();
    if (!normalized) {
      return null;
    }

    const patterns: RegExp[] = [
      /\bNEIGHBORHOOD\s*[:\-]\s*([^\n.!]{2,80})/i,
      /\bneighborhood\s*[:\-]\s*([^\n.!]{2,80})/i,
      /\bdistrict\s*[:\-]\s*([^\n.!]{2,80})/i,
      /\bStadtteil\s*[:\-]\s*([^\n.!]{2,80})/i,
      /\bStadtbezirk\s*[:\-]\s*([^\n.!]{2,80})/i,
      /\bViertel\s*[:\-]\s*([^\n.!]{2,80})/i,
      /\barea\s+name\s*[:\-]\s*([^\n.!]{2,80})/i,
      /(?:located in|part of|lies in|situated in)\s+([A-ZÄÖÜa-zäöüß][A-Za-zäöüß0-9\- ]{1,60}?)(?=\s*[,.;]|\s+and\s|\s+which|\s+where|\s+is\s|\s+are\s|\.|!|\n|$)/i,
      /(?:coordinates?|these coordinates)\s+(?:are|is|fall within|correspond to|map to)\s+([^.!\n]{3,70})/i,
    ];

    for (const re of patterns) {
      const m = normalized.match(re);
      const raw = m?.[1]?.trim();
      if (!raw) {
        continue;
      }
      const cleaned = this.sanitizeNeighborhoodName(raw);
      if (cleaned && cleaned.length >= 2) {
        return cleaned;
      }
    }

    const bold = normalized.match(/\*\*([^*]{2,60})\*\*/);
    if (bold?.[1]) {
      const cleaned = this.sanitizeNeighborhoodName(bold[1]);
      if (cleaned && !/(€|EUR|\d+\s*%|cafe|café|restaurant|event|deal)/i.test(cleaned)) {
        return cleaned;
      }
    }

    return null;
  }

  private sanitizeNeighborhoodName(raw: string): string {
    let s = raw.replace(/\*\*/g, '').replace(/^["'([{]+|["')\]}]+$/g, '').trim();
    s = s.replace(/\s{2,}/g, ' ');
    if (s.length > 72) {
      s = s.slice(0, 69).trimEnd() + '...';
    }
    return s;
  }

  private mapTavilyResultsToOffers(results: TavilySearchResultItem[]): VibeOffer[] {
    return results.slice(0, 5).map((item, index) => this.mapOneResult(item, index));
  }

  private mapOneResult(item: TavilySearchResultItem, index: number): VibeOffer {
    const text = `${item.title} ${item.content}`.toLowerCase();
    const tag = this.inferTag(text);
    const merchantName = this.extractMerchantName(item);
    const { originalPrice, dsvDiscountPrice, pricingIsEstimated } = this.extractPrices(item.content);

    return {
      id: this.stableOfferId(item.url, index),
      title: item.title?.trim() || 'Local highlight',
      merchantName,
      distanceMeters: 0,
      originalPrice,
      dsvDiscountPrice,
      pricingIsEstimated,
      tag,
      expiryMinutes: 60,
    };
  }

  private stableOfferId(url: string, index: number): string {
    const hash = createHash('sha256').update(`${url}:${index}`).digest('hex').slice(0, 16);
    return `vibe-${hash}`;
  }

  private extractMerchantName(item: TavilySearchResultItem): string {
    try {
      const host = new URL(item.url).hostname.replace(/^www\./, '');
      const brand = host.split('.')[0];
      return brand ? brand.charAt(0).toUpperCase() + brand.slice(1) : 'Local merchant';
    } catch {
      const fromTitle = item.title?.split(/[-|–—]/)[0]?.trim();
      return fromTitle && fromTitle.length < 60 ? fromTitle : 'Local merchant';
    }
  }

  private inferTag(text: string): VibeOfferTag {
    if (/(concert|event|festival|theater|theatre|show|live music|jazz|club night|exhibition)/.test(text)) {
      return 'Event';
    }
    if (/(sale|deal|discount|shop|store|retail|fashion|market|mall)/.test(text)) {
      return 'Retail';
    }
    if (/(cafe|coffee|restaurant|bar|bistro|bakery|brunch|food|kitchen|dining)/.test(text)) {
      return 'Food';
    }
    return 'Food';
  }

  /**
   * Parses EUR amounts from snippet text (€ / EUR). If none found, uses a fixed market-average placeholder
   * and flags {@link VibeOffer.pricingIsEstimated}.
   */
  private extractPrices(content: string): {
    originalPrice: number;
    dsvDiscountPrice: number;
    pricingIsEstimated: boolean;
  } {
    const eurMatches = [
      ...content.matchAll(/(?:€|EUR)\s*([\d]+(?:[.,]\d{1,2})?)|([\d]+(?:[.,]\d{1,2})?)\s*(?:€|EUR)\b/gi),
    ];
    const amounts = eurMatches
      .map((m) => parseFloat((m[1] ?? m[2] ?? '0').replace(',', '.')))
      .filter((n) => !Number.isNaN(n) && n > 0);

    if (amounts.length >= 2) {
      const high = Math.max(amounts[0], amounts[1]);
      const low = Math.min(amounts[0], amounts[1]);
      return {
        originalPrice: roundMoney(high),
        dsvDiscountPrice: roundMoney(low),
        pricingIsEstimated: false,
      };
    }
    if (amounts.length === 1) {
      const base = amounts[0];
      return {
        originalPrice: roundMoney(base),
        dsvDiscountPrice: roundMoney(base * 0.8),
        pricingIsEstimated: false,
      };
    }

    const marketAverageEur = 12.5;
    return {
      originalPrice: marketAverageEur,
      dsvDiscountPrice: roundMoney(marketAverageEur * 0.8),
      pricingIsEstimated: true,
    };
  }
}

function roundMoney(n: number): number {
  return Math.round(n * 100) / 100;
}

/** WMO Weather interpretation codes (WW) used by Open-Meteo. */
function weatherCodeToReadableLabel(code: number, isDay?: number): string {
  if (code === 0) {
    return isDay === 0 ? 'Clear' : 'Clear';
  }

  const map: Record<number, string> = {
    1: 'Cloudy',
    2: 'Partly Cloudy',
    3: 'Overcast',
    45: 'Foggy',
    48: 'Foggy',
    51: 'Light Drizzle',
    53: 'Drizzle',
    55: 'Heavy Drizzle',
    56: 'Freezing Drizzle',
    57: 'Freezing Drizzle',
    61: 'Light Rain',
    63: 'Rain',
    65: 'Heavy Rain',
    66: 'Freezing Rain',
    67: 'Freezing Rain',
    71: 'Light Snow',
    73: 'Snow',
    75: 'Heavy Snow',
    77: 'Snow Grains',
    80: 'Rain Showers',
    81: 'Rain Showers',
    82: 'Heavy Rain Showers',
    85: 'Snow Showers',
    86: 'Heavy Snow Showers',
    95: 'Thunderstorm',
    96: 'Thunderstorm',
    99: 'Thunderstorm',
  };

  if (map[code] !== undefined) {
    return map[code];
  }

  if (code >= 51 && code <= 55) {
    return 'Drizzle';
  }
  if (code >= 61 && code <= 65) {
    return 'Rain';
  }
  if (code >= 71 && code <= 77) {
    return 'Snow';
  }
  if (code >= 80 && code <= 82) {
    return 'Rain Showers';
  }
  if (code >= 85 && code <= 86) {
    return 'Snow Showers';
  }
  if (code >= 95 && code <= 99) {
    return 'Thunderstorm';
  }

  return 'Unknown';
}
