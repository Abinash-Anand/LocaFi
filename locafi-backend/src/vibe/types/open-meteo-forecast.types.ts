/** Subset of Open-Meteo forecast JSON (https://open-meteo.com/en/docs). */
export interface OpenMeteoCurrentWeather {
  temperature?: number;
  weathercode?: number;
  /** 1 = day, 0 = night (when present). */
  is_day?: number;
}

export interface OpenMeteoForecastResponse {
  current_weather?: OpenMeteoCurrentWeather;
}
