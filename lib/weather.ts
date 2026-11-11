// Aero Gym - weather data (PRD §4.4) via Open-Meteo (free, no API key).
// Forecast, air quality and geocoding live here so the view stays presentational.

export interface GeoLocation {
  name: string;
  region?: string;
  country?: string;
  latitude: number;
  longitude: number;
}

/** Fallback city when geolocation is unavailable or denied. */
export const DEFAULT_LOCATION: GeoLocation = {
  name: "Islamabad",
  region: "Islamabad Capital Territory",
  country: "Pakistan",
  latitude: 33.6844,
  longitude: 73.0479,
};

export const LOCATION_STORAGE_KEY = "workout-weather-location";

const FORECAST_URL = "https://api.open-meteo.com/v1/forecast";
const AIR_URL = "https://air-quality-api.open-meteo.com/v1/air-quality";
const GEOCODE_URL = "https://geocoding-api.open-meteo.com/v1/search";

export type WeatherIcon =
  | "clear"
  | "partly"
  | "cloudy"
  | "fog"
  | "drizzle"
  | "rain"
  | "snow"
  | "thunder";

export interface WeatherInfo {
  label: string;
  icon: WeatherIcon;
}

const CODE_MAP: Record<number, WeatherInfo> = {
  0: { label: "Clear sky", icon: "clear" },
  1: { label: "Mainly clear", icon: "clear" },
  2: { label: "Partly cloudy", icon: "partly" },
  3: { label: "Overcast", icon: "cloudy" },
  45: { label: "Fog", icon: "fog" },
  48: { label: "Freezing fog", icon: "fog" },
  51: { label: "Light drizzle", icon: "drizzle" },
  53: { label: "Drizzle", icon: "drizzle" },
  55: { label: "Heavy drizzle", icon: "drizzle" },
  56: { label: "Freezing drizzle", icon: "drizzle" },
  57: { label: "Freezing drizzle", icon: "drizzle" },
  61: { label: "Light rain", icon: "rain" },
  63: { label: "Rain", icon: "rain" },
  65: { label: "Heavy rain", icon: "rain" },
  66: { label: "Freezing rain", icon: "rain" },
  67: { label: "Freezing rain", icon: "rain" },
  71: { label: "Light snow", icon: "snow" },
  73: { label: "Snow", icon: "snow" },
  75: { label: "Heavy snow", icon: "snow" },
  77: { label: "Snow grains", icon: "snow" },
  80: { label: "Light showers", icon: "rain" },
  81: { label: "Rain showers", icon: "rain" },
  82: { label: "Violent showers", icon: "rain" },
  85: { label: "Snow showers", icon: "snow" },
  86: { label: "Heavy snow showers", icon: "snow" },
  95: { label: "Thunderstorm", icon: "thunder" },
  96: { label: "Thunderstorm with hail", icon: "thunder" },
  99: { label: "Thunderstorm with hail", icon: "thunder" },
};

export function weatherInfo(code: number): WeatherInfo {
  return CODE_MAP[code] ?? { label: "Unsettled", icon: "cloudy" };
}

export interface CurrentWeather {
  time: string;
  temperature: number;
  apparent: number;
  humidity: number;
  isDay: boolean;
  code: number;
  precipitation: number;
  rain: number;
  cloudCover: number;
  pressure: number;
  windSpeed: number;
  windDirection: number;
  windGusts: number;
}

export interface HourlyWeather {
  time: string;
  temperature: number;
  code: number;
  rainChance: number;
  isDay: boolean;
  visibility: number | null;
  dewPoint: number | null;
}

export interface DailyWeather {
  date: string;
  code: number;
  max: number;
  min: number;
  sunrise: string;
  sunset: string;
  uvMax: number | null;
  rainChance: number | null;
}

export interface AirQuality {
  aqi: number | null;
  pm25: number | null;
  pm10: number | null;
  no2: number | null;
  ozone: number | null;
}

export interface WeatherData {
  current: CurrentWeather;
  hourly: HourlyWeather[];
  daily: DailyWeather[];
  air: AirQuality | null;
}

interface ForecastResponse {
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    apparent_temperature: number;
    is_day: number;
    precipitation: number;
    rain: number;
    weather_code: number;
    cloud_cover: number;
    pressure_msl: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    wind_gusts_10m: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
    precipitation_probability: Array<number | null>;
    is_day: number[];
    visibility: Array<number | null>;
    dew_point_2m: Array<number | null>;
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    sunrise: string[];
    sunset: string[];
    uv_index_max: Array<number | null>;
    precipitation_probability_max: Array<number | null>;
  };
}

interface AirResponse {
  current?: {
    us_aqi: number | null;
    pm2_5: number | null;
    pm10: number | null;
    nitrogen_dioxide: number | null;
    ozone: number | null;
  };
}

interface GeocodeResponse {
  results?: Array<{
    name: string;
    latitude: number;
    longitude: number;
    country?: string;
    admin1?: string;
  }>;
}

async function getJson<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) throw new Error(`Weather request failed (${res.status})`);
  return (await res.json()) as T;
}

/** Forecast + air quality for a coordinate, hourly trimmed to the next 48h. */
export async function fetchWeather(location: GeoLocation): Promise<WeatherData> {
  const latitude = location.latitude.toFixed(4);
  const longitude = location.longitude.toFixed(4);

  const forecastParams = new URLSearchParams({
    latitude,
    longitude,
    timezone: "auto",
    forecast_days: "7",
    wind_speed_unit: "kmh",
    current:
      "temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,rain,weather_code,cloud_cover,pressure_msl,wind_speed_10m,wind_direction_10m,wind_gusts_10m",
    hourly:
      "temperature_2m,weather_code,precipitation_probability,is_day,visibility,dew_point_2m",
    daily:
      "weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max",
  });
  const airParams = new URLSearchParams({
    latitude,
    longitude,
    timezone: "auto",
    current: "us_aqi,pm2_5,pm10,nitrogen_dioxide,ozone",
  });

  const [forecast, air] = await Promise.all([
    getJson<ForecastResponse>(`${FORECAST_URL}?${forecastParams.toString()}`),
    getJson<AirResponse>(`${AIR_URL}?${airParams.toString()}`).catch(() => null),
  ]);

  const startHour = forecast.current.time.slice(0, 13);
  const startIndex = Math.max(
    0,
    forecast.hourly.time.findIndex((time) => time.startsWith(startHour)),
  );

  const hourly: HourlyWeather[] = forecast.hourly.time
    .slice(startIndex, startIndex + 48)
    .map((time, offset) => {
      const i = startIndex + offset;
      return {
        time,
        temperature: forecast.hourly.temperature_2m[i],
        code: forecast.hourly.weather_code[i],
        rainChance: forecast.hourly.precipitation_probability[i] ?? 0,
        isDay: forecast.hourly.is_day[i] === 1,
        visibility: forecast.hourly.visibility?.[i] ?? null,
        dewPoint: forecast.hourly.dew_point_2m?.[i] ?? null,
      };
    });

  const daily: DailyWeather[] = forecast.daily.time.map((date, i) => ({
    date,
    code: forecast.daily.weather_code[i],
    max: forecast.daily.temperature_2m_max[i],
    min: forecast.daily.temperature_2m_min[i],
    sunrise: forecast.daily.sunrise[i],
    sunset: forecast.daily.sunset[i],
    uvMax: forecast.daily.uv_index_max?.[i] ?? null,
    rainChance: forecast.daily.precipitation_probability_max?.[i] ?? null,
  }));

  return {
    current: {
      time: forecast.current.time,
      temperature: forecast.current.temperature_2m,
      apparent: forecast.current.apparent_temperature,
      humidity: forecast.current.relative_humidity_2m,
      isDay: forecast.current.is_day === 1,
      code: forecast.current.weather_code,
      precipitation: forecast.current.precipitation,
      rain: forecast.current.rain,
      cloudCover: forecast.current.cloud_cover,
      pressure: forecast.current.pressure_msl,
      windSpeed: forecast.current.wind_speed_10m,
      windDirection: forecast.current.wind_direction_10m,
      windGusts: forecast.current.wind_gusts_10m,
    },
    hourly,
    daily,
    air: air?.current
      ? {
          aqi: air.current.us_aqi,
          pm25: air.current.pm2_5,
          pm10: air.current.pm10,
          no2: air.current.nitrogen_dioxide,
          ozone: air.current.ozone,
        }
      : null,
  };
}

/** City search through the Open-Meteo geocoder. */
export async function searchLocations(query: string): Promise<GeoLocation[]> {
  const name = query.trim();
  if (name.length < 2) return [];
  const params = new URLSearchParams({
    name,
    count: "5",
    language: "en",
    format: "json",
  });
  const data = await getJson<GeocodeResponse>(`${GEOCODE_URL}?${params.toString()}`);
  return (data.results ?? []).map((result) => ({
    name: result.name,
    region: result.admin1,
    country: result.country,
    latitude: result.latitude,
    longitude: result.longitude,
  }));
}

export function loadSavedLocation(): GeoLocation | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LOCATION_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as GeoLocation;
    if (typeof parsed?.latitude !== "number" || typeof parsed?.longitude !== "number") {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function saveLocation(location: GeoLocation): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));
  } catch {
    /* storage unavailable - the session still works */
  }
}

export function locationLabel(location: GeoLocation): string {
  return [location.region, location.country].filter(Boolean).join(", ");
}

/** Approximate lunar phase from the synodic month, good to a day. */
export function moonPhase(date: Date = new Date()): { name: string; illumination: number } {
  const synodic = 29.530588853;
  const referenceNewMoon = Date.UTC(2000, 0, 6, 18, 14);
  const elapsedDays = (date.getTime() - referenceNewMoon) / 86_400_000;
  const age = ((elapsedDays % synodic) + synodic) % synodic;
  const illumination = Math.round(((1 - Math.cos((2 * Math.PI * age) / synodic)) / 2) * 100);
  const names = [
    "New moon",
    "Waxing crescent",
    "First quarter",
    "Waxing gibbous",
    "Full moon",
    "Waning gibbous",
    "Last quarter",
    "Waning crescent",
  ];
  const index = Math.round((age / synodic) * 8) % 8;
  return { name: names[index], illumination };
}

export function aqiInfo(aqi: number): { label: string; className: string; note: string } {
  if (aqi <= 50) {
    return {
      label: "Good",
      className: "border-[#16A34A]/40 bg-[#16A34A]/10 text-[#15803D]",
      note: "Air quality is satisfactory for outdoor training.",
    };
  }
  if (aqi <= 100) {
    return {
      label: "Moderate",
      className: "border-[#CA8A04]/40 bg-[#CA8A04]/10 text-[#A16207]",
      note: "Acceptable for most people. Sensitive runners should watch effort.",
    };
  }
  if (aqi <= 150) {
    return {
      label: "Unhealthy for sensitive groups",
      className: "border-[#EA580C]/40 bg-[#EA580C]/10 text-[#C2410C]",
      note: "Consider a shorter session or indoor work.",
    };
  }
  if (aqi <= 200) {
    return {
      label: "Unhealthy",
      className: "border-[#DC2626]/40 bg-[#DC2626]/10 text-[#B91C1C]",
      note: "Move training indoors and keep the windows closed.",
    };
  }
  if (aqi <= 300) {
    return {
      label: "Very unhealthy",
      className: "border-[#7C3AED]/40 bg-[#7C3AED]/10 text-[#6D28D9]",
      note: "Avoid outdoor exertion.",
    };
  }
  return {
    label: "Hazardous",
    className: "border-[#7F1D1D]/40 bg-[#7F1D1D]/10 text-[#991B1B]",
    note: "Stay indoors with filtered air.",
  };
}

export function hourLabel(time: string): string {
  const hour = Number(time.slice(11, 13));
  if (Number.isNaN(hour)) return time;
  const suffix = hour >= 12 ? "PM" : "AM";
  const display = hour % 12 === 0 ? 12 : hour % 12;
  return `${display} ${suffix}`;
}

export function dayLabel(date: string): string {
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-US", { weekday: "short" });
}

export function clockLabel(time: string): string {
  return time.slice(11, 16);
}

export function visibilityLabel(meters: number | null): string {
  if (meters === null || Number.isNaN(meters)) return "n/a";
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${Math.round(meters)} m`;
}
