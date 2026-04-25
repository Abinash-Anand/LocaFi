export interface CityContext {
  locationName: string;
  weather: string;
  vibeScore: number;
}

export type VibeOfferTag = 'Food' | 'Event' | 'Retail';

export interface VibeOffer {
  id: string;
  title: string;
  merchantName: string;
  distanceMeters: number;
  originalPrice: number;
  dsvDiscountPrice: number;
  /** True when prices are a Stuttgart market-average placeholder (no EUR found in sources). */
  pricingIsEstimated?: boolean;
  tag: VibeOfferTag;
  expiryMinutes: number;
}

export interface WalletState {
  balance: number;
  dsvRewardPoints: number;
  userId: string;
}
