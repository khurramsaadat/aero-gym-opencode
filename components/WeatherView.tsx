"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudMoon,
  CloudRain,
  CloudSnow,
  CloudSun,
  Droplets,
  Eye,
  Gauge,
  Loader2,
  MapPin,
  Moon,
  Navigation,
  Search,
  Sun,
  Sunrise,
  Sunset,
  Thermometer,
  Umbrella,
  Wind,
  X,
} from "lucide-react";
import type { AirQuality, GeoLocation, WeatherData, WeatherIcon } from "@/lib/weather";
import {
  aqiInfo,
  clockLabel,
  dayLabel,
  DEFAULT_LOCATION,
  fetchWeather,
  hourLabel,
  loadSavedLocation,
  locationLabel,
  moonPhase,
  saveLocation,
  searchLocations,
  visibilityLabel,
  weatherInfo,
} from "@/lib/weather";

type LoadStatus = "locating" | "loading" | "ready" | "error";

const AZIMUTHS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];

function compass(degrees: number): string {
  return AZIMUTHS[Math.round(((degrees % 360) / 45)) % 8];
}

function WeatherGlyph({
  icon,
  isDay,
  className,
}: {
  icon: WeatherIcon;
  isDay: boolean;
  className?: string;
}) {
  const classes = className ?? "h-6 w-6";
  switch (icon) {
    case "clear":
      return isDay ? <Sun className={classes} aria-hidden /> : <Moon className={classes} aria-hidden />;
    case "partly":
      return isDay ? (
        <CloudSun className={classes} aria-hidden />
      ) : (
        <CloudMoon className={classes} aria-hidden />
      );
    case "cloudy":
      return <Cloud className={classes} aria-hidden />;
    case "fog":
      return <CloudFog className={classes} aria-hidden />;
    case "drizzle":
      return <CloudDrizzle className={classes} aria-hidden />;
    case "rain":
      return <CloudRain className={classes} aria-hidden />;
    case "snow":
      return <CloudSnow className={classes} aria-hidden />;
    case "thunder":
      return <CloudLightning className={classes} aria-hidden />;
  }
}

/**
 * Weather page (PRD §4.4): geolocation with a saved-city fallback, city
 * search, current conditions, eight detail tiles, air quality, a 48h
 * hourly strip, the 7-day range forecast, and sun and moon data.
 */
export function WeatherView() {
  const [location, setLocation] = useState<GeoLocation | null>(null);
  const [data, setData] = useState<WeatherData | null>(null);
  const [status, setStatus] = useState<LoadStatus>("locating");
  const [error, setError] = useState("");
  const [geoHint, setGeoHint] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<GeoLocation[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchNote, setSearchNote] = useState("");

  const load = useCallback(async (next: GeoLocation) => {
    setLocation(next);
    setStatus("loading");
    setError("");
    try {
      const weather = await fetchWeather(next);
      setData(weather);
      setStatus("ready");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load the forecast.");
      setStatus("error");
    }
  }, []);

  // First paint: saved city, else geolocation, else the fallback city.
  useEffect(() => {
    const saved = loadSavedLocation();
    if (saved) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void load(saved);
      return;
    }
    let settled = false;
    const start = (next: GeoLocation) => {
      if (settled) return;
      settled = true;
      void load(next);
    };
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      start(DEFAULT_LOCATION);
      return;
    }
    const timer = window.setTimeout(() => start(DEFAULT_LOCATION), 9000);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        window.clearTimeout(timer);
        start({
          name: "Your location",
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => {
        window.clearTimeout(timer);
        setGeoHint("Location access is off, showing the default city.");
        start(DEFAULT_LOCATION);
      },
      { timeout: 8000, maximumAge: 10 * 60 * 1000 },
    );
    return () => {
      settled = true;
      window.clearTimeout(timer);
    };
  }, [load]);

  const useMyLocation = () => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      setGeoHint("This browser cannot share a location.");
      return;
    }
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next: GeoLocation = {
          name: "Your location",
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        };
        saveLocation(next);
        setGeoHint("");
        void load(next);
      },
      () => {
        setGeoHint("Location access is off, search for a city instead.");
        setStatus(data ? "ready" : "error");
      },
      { timeout: 8000, maximumAge: 5 * 60 * 1000 },
    );
  };

  const runSearch = async (value: string) => {
    setSearchNote("");
    setSearching(true);
    try {
      const found = await searchLocations(value);
      setResults(found);
      if (found.length === 0) setSearchNote("No cities match that search.");
    } catch {
      setSearchNote("City search is unavailable right now.");
    } finally {
      setSearching(false);
    }
  };

  const pickLocation = (next: GeoLocation) => {
    saveLocation(next);
    setSearchOpen(false);
    setQuery("");
    setResults([]);
    setSearchNote("");
    setGeoHint("");
    void load(next);
  };

  const current = data?.current;
  const today = data?.daily[0];
  const moon = useMemo(() => moonPhase(), []);
  const weekRange = useMemo(() => {
    if (!data || data.daily.length === 0) return { min: 0, max: 1 };
    return {
      min: Math.min(...data.daily.map((d) => d.min)),
      max: Math.max(...data.daily.map((d) => d.max)),
    };
  }, [data]);

  const nowInfo = current ? weatherInfo(current.code) : null;
  const subtitle = location
    ? locationLabel(location) ||
      `${location.latitude.toFixed(2)}, ${location.longitude.toFixed(2)}`
    : "Choose a location";

  return (
    <div className="flex flex-col gap-3">
      {/* Location bar */}
      <section className="rounded-2xl border border-card-border bg-card p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex min-w-0 items-center gap-2">
            <MapPin className="h-4 w-4 shrink-0 text-accent" aria-hidden />
            <div className="min-w-0">
              <h1 className="truncate font-display text-lg font-bold text-foreground">
                {location?.name ?? "Weather"}
              </h1>
              <p className="truncate text-[11px] text-muted-2">{subtitle}</p>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <button
              type="button"
              onClick={useMyLocation}
              aria-label="Use my location"
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-card-border bg-background text-muted-2 transition-colors hover:border-accent hover:text-accent-text"
            >
              <Navigation className="h-4 w-4" aria-hidden />
            </button>
            <button
              type="button"
              onClick={() => setSearchOpen((open) => !open)}
              aria-label="Search for a city"
              aria-expanded={searchOpen}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-card-border bg-background text-muted-2 transition-colors hover:border-accent hover:text-accent-text"
            >
              {searchOpen ? <X className="h-4 w-4" aria-hidden /> : <Search className="h-4 w-4" aria-hidden />}
            </button>
          </div>
        </div>

        {geoHint && <p className="mt-2 text-[11px] text-muted-2">{geoHint}</p>}

        {searchOpen && (
          <div className="mt-3">
            <form
              onSubmit={(event) => {
                event.preventDefault();
                void runSearch(query);
              }}
              className="flex gap-1.5"
            >
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-2" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search a city"
                  aria-label="City name"
                  className="w-full rounded-xl border border-card-border bg-background py-2 pl-8 pr-2 text-sm text-foreground placeholder:text-muted-2 focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent-soft"
                />
              </div>
              <button
                type="submit"
                className="rounded-xl bg-accent px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-accent-contrast transition-opacity hover:opacity-90"
              >
                Search
              </button>
            </form>
            {searching && (
              <p className="mt-2 flex items-center gap-1.5 text-[11px] text-muted-2">
                <Loader2 className="h-3 w-3 animate-spin" aria-hidden />
                Looking up cities...
              </p>
            )}
            {searchNote && !searching && (
              <p className="mt-2 text-[11px] text-muted-2">{searchNote}</p>
            )}
            {results.length > 0 && (
              <ul className="mt-2 divide-y divide-card-border rounded-xl border border-card-border">
                {results.map((result) => (
                  <li key={`${result.name}-${result.latitude}-${result.longitude}`}>
                    <button
                      type="button"
                      onClick={() => pickLocation(result)}
                      className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left transition-colors hover:bg-card-border"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-foreground">
                          {result.name}
                        </span>
                        <span className="block truncate text-[10px] text-muted-2">
                          {locationLabel(result) || "Coordinates only"}
                        </span>
                      </span>
                      <span className="text-[10px] text-muted-2">
                        {result.latitude.toFixed(1)}, {result.longitude.toFixed(1)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </section>

      {status === "locating" && (
        <section className="flex items-center gap-2 rounded-2xl border border-card-border bg-card px-4 py-6 text-sm text-muted-2">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Finding your location...
        </section>
      )}

      {status === "loading" && (
        <section className="flex items-center gap-2 rounded-2xl border border-card-border bg-card px-4 py-6 text-sm text-muted-2">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
          Loading the forecast...
        </section>
      )}

      {status === "error" && (
        <section className="rounded-2xl border border-dashed border-card-border bg-card px-4 py-6 text-center">
          <Cloud className="mx-auto h-8 w-8 text-muted-2" aria-hidden />
          <p className="mt-2 text-sm font-semibold text-foreground">Forecast unavailable</p>
          <p className="mt-1 text-xs text-muted-2">{error || "Check your connection and try again."}</p>
          <button
            type="button"
            onClick={() => void load(location ?? DEFAULT_LOCATION)}
            className="mt-3 rounded-full border border-accent-soft bg-accent-soft px-4 py-1.5 text-[11px] font-bold uppercase tracking-wider text-accent-text"
          >
            Try again
          </button>
        </section>
      )}

      {status === "ready" && current && today && nowInfo && (
        <>
          {/* Current conditions */}
          <section className="relative overflow-hidden rounded-2xl border border-card-border bg-card p-4">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent-soft/70 via-transparent to-transparent" />
            <div className="relative flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-2">
                  {current.isDay ? "Daytime" : "Night"} now
                </p>
                <p className="mt-1 font-display text-5xl font-bold leading-none text-foreground">
                  {Math.round(current.temperature)}
                  <span className="align-top text-2xl">°C</span>
                </p>
                <p className="mt-1 text-sm font-semibold text-foreground">{nowInfo.label}</p>
                <p className="text-[11px] text-muted-2">
                  Feels like {Math.round(current.apparent)}°C · Gusts {Math.round(current.windGusts)} km/h
                </p>
              </div>
              <div className="text-right">
                <WeatherGlyph icon={nowInfo.icon} isDay={current.isDay} className="ml-auto h-16 w-16 text-accent" />
                <p className="mt-2 text-xs font-semibold text-foreground">
                  H {Math.round(today.max)}° / L {Math.round(today.min)}°
                </p>
              </div>
            </div>
            <div className="relative mt-3 flex items-center gap-4 border-t border-card-border pt-3 text-[11px] text-muted-2">
              <span className="flex items-center gap-1.5">
                <Sunrise className="h-3.5 w-3.5 text-accent" aria-hidden />
                {clockLabel(today.sunrise)}
              </span>
              <span className="flex items-center gap-1.5">
                <Sunset className="h-3.5 w-3.5 text-accent" aria-hidden />
                {clockLabel(today.sunset)}
              </span>
              <span className="ml-auto">{new Date(current.time).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}</span>
            </div>
          </section>

          {/* Detail tiles */}
          <section className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            <DetailTile icon={<Droplets className="h-4 w-4" />} label="Humidity" value={`${Math.round(current.humidity)}%`} />
            <DetailTile
              icon={<Wind className="h-4 w-4" />}
              label="Wind"
              value={`${Math.round(current.windSpeed)} km/h`}
              note={`${compass(current.windDirection)} · ${Math.round(current.windDirection)}°`}
            />
            <DetailTile
              icon={<Eye className="h-4 w-4" />}
              label="Visibility"
              value={visibilityLabel(data.hourly[0]?.visibility ?? null)}
            />
            <DetailTile
              icon={<Sun className="h-4 w-4" />}
              label="UV index"
              value={today.uvMax === null ? "n/a" : today.uvMax.toFixed(1)}
              note={uvNote(today.uvMax)}
            />
            <DetailTile
              icon={<Thermometer className="h-4 w-4" />}
              label="Dew point"
              value={
                data.hourly[0]?.dewPoint === null || data.hourly[0]?.dewPoint === undefined
                  ? "n/a"
                  : `${Math.round(data.hourly[0].dewPoint)}°C`
              }
            />
            <DetailTile
              icon={<Gauge className="h-4 w-4" />}
              label="Pressure"
              value={`${Math.round(current.pressure)} hPa`}
            />
            <DetailTile
              icon={<Cloud className="h-4 w-4" />}
              label="Cloud cover"
              value={`${Math.round(current.cloudCover)}%`}
            />
            <DetailTile
              icon={<Umbrella className="h-4 w-4" />}
              label="Rain chance"
              value={today.rainChance === null ? "n/a" : `${Math.round(today.rainChance)}%`}
              note={`${current.rain.toFixed(1)} mm now`}
            />
          </section>

          {/* Air quality */}
          <AirQualitySection air={data.air} />

          {/* Hourly */}
          <section className="rounded-2xl border border-card-border bg-card p-3">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-sm font-bold text-foreground">
                <Wind className="h-4 w-4 text-accent" aria-hidden />
                Next 48 hours
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-2">
                Hourly
              </span>
            </div>
            <div className="mt-2 flex gap-2 overflow-x-auto pb-1">
              {data.hourly.map((hour, index) => {
                const info = weatherInfo(hour.code);
                return (
                  <div
                    key={hour.time}
                    className="flex w-16 shrink-0 flex-col items-center gap-1 rounded-xl border border-card-border bg-background py-2"
                  >
                    <span className="text-[10px] font-semibold text-muted-2">
                      {index === 0 ? "Now" : hourLabel(hour.time)}
                    </span>
                    <WeatherGlyph icon={info.icon} isDay={hour.isDay} className="h-5 w-5 text-accent" />
                    <span className="text-xs font-bold text-foreground">
                      {Math.round(hour.temperature)}°
                    </span>
                    <span className="text-[9px] text-muted-2">{Math.round(hour.rainChance)}%</span>
                  </div>
                );
              })}
            </div>
          </section>

          {/* 7-day forecast */}
          <section className="rounded-2xl border border-card-border bg-card p-3">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-sm font-bold text-foreground">
                <Sun className="h-4 w-4 text-accent" aria-hidden />
                7-day forecast
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-widest text-muted-2">
                Range
              </span>
            </div>
            <ul className="mt-2 divide-y divide-card-border">
              {data.daily.map((day) => {
                const info = weatherInfo(day.code);
                const span = Math.max(1, weekRange.max - weekRange.min);
                const left = ((day.min - weekRange.min) / span) * 100;
                const width = Math.max(8, ((day.max - day.min) / span) * 100);
                return (
                  <li key={day.date} className="flex items-center gap-2 py-2">
                    <span className="w-10 shrink-0 text-[11px] font-bold uppercase tracking-wider text-muted-2">
                      {dayLabel(day.date)}
                    </span>
                    <WeatherGlyph icon={info.icon} isDay className="h-4 w-4 shrink-0 text-accent" />
                    <span className="w-8 shrink-0 text-right text-[11px] text-muted-2">
                      {Math.round(day.min)}°
                    </span>
                    <span className="relative h-1.5 flex-1 overflow-hidden rounded-full bg-card-border">
                      <span
                        className="absolute h-full rounded-full bg-gradient-to-r from-accent/40 to-accent"
                        style={{ left: `${left}%`, width: `${width}%` }}
                      />
                    </span>
                    <span className="w-8 shrink-0 text-[11px] font-semibold text-foreground">
                      {Math.round(day.max)}°
                    </span>
                    <span className="w-8 shrink-0 text-right text-[9px] text-muted-2">
                      {day.rainChance === null ? "-" : `${Math.round(day.rainChance)}%`}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* Sun and moon */}
          <section className="grid gap-2 sm:grid-cols-2">
            <div className="rounded-2xl border border-card-border bg-card p-3">
              <h2 className="flex items-center gap-2 font-display text-sm font-bold text-foreground">
                <Sun className="h-4 w-4 text-accent" aria-hidden />
                Sun
              </h2>
              <div className="mt-2 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-muted-2">
                    <Sunrise className="h-3.5 w-3.5" aria-hidden />
                    Sunrise
                  </span>
                  <span className="font-semibold text-foreground">{clockLabel(today.sunrise)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-muted-2">
                    <Sunset className="h-3.5 w-3.5" aria-hidden />
                    Sunset
                  </span>
                  <span className="font-semibold text-foreground">{clockLabel(today.sunset)}</span>
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-card-border bg-card p-3">
              <h2 className="flex items-center gap-2 font-display text-sm font-bold text-foreground">
                <Moon className="h-4 w-4 text-accent" aria-hidden />
                Moon
              </h2>
              <div className="mt-2 space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-2">Phase</span>
                  <span className="font-semibold text-foreground">{moon.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-2">Illumination</span>
                  <span className="font-semibold text-foreground">{moon.illumination}%</span>
                </div>
              </div>
            </div>
          </section>

          <p className="px-1 text-[10px] text-muted-2">
            Weather and air quality by{" "}
            <a
              href="https://open-meteo.com/"
              target="_blank"
              rel="noopener noreferrer"
              className="underline decoration-accent/40 underline-offset-2 hover:text-accent-text"
            >
              Open-Meteo
            </a>
            . Times are shown in the location&apos;s timezone.
          </p>
        </>
      )}
    </div>
  );
}

function uvNote(uv: number | null): string {
  if (uv === null) return "not modelled";
  if (uv < 3) return "low";
  if (uv < 6) return "moderate";
  if (uv < 8) return "high";
  if (uv < 11) return "very high";
  return "extreme";
}

function DetailTile({
  icon,
  label,
  value,
  note,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  note?: string;
}) {
  return (
    <div className="rounded-2xl border border-card-border bg-card px-3 py-2.5">
      <span className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-muted-2">
        <span className="text-accent">{icon}</span>
        {label}
      </span>
      <p className="mt-1 font-display text-base font-bold leading-none text-foreground">{value}</p>
      {note && <p className="mt-1 truncate text-[10px] text-muted-2">{note}</p>}
    </div>
  );
}

function AirQualitySection({ air }: { air: AirQuality | null }) {
  if (!air || air.aqi === null) {
    return (
      <section className="rounded-2xl border border-card-border bg-card p-3">
        <h2 className="font-display text-sm font-bold text-foreground">Air quality</h2>
        <p className="mt-2 text-xs text-muted-2">
          Air quality data is not available for this location right now.
        </p>
      </section>
    );
  }
  const info = aqiInfo(air.aqi);
  const rows = [
    { label: "PM2.5", value: air.pm25, unit: "µg/m³" },
    { label: "PM10", value: air.pm10, unit: "µg/m³" },
    { label: "NO2", value: air.no2, unit: "µg/m³" },
    { label: "O3", value: air.ozone, unit: "µg/m³" },
  ];
  return (
    <section className="rounded-2xl border border-card-border bg-card p-3">
      <div className="flex items-start justify-between gap-2">
        <h2 className="font-display text-sm font-bold text-foreground">Air quality</h2>
        <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${info.className}`}>
          {info.label} · {Math.round(air.aqi)}
        </span>
      </div>
      <p className="mt-1 text-[11px] text-muted-2">{info.note}</p>
      <div className="mt-2 grid grid-cols-2 gap-1.5 sm:grid-cols-4">
        {rows.map((row) => (
          <div key={row.label} className="rounded-xl border border-card-border bg-background px-2 py-1.5">
            <span className="text-[9px] font-bold uppercase tracking-widest text-muted-2">
              {row.label}
            </span>
            <p className="text-sm font-bold text-foreground">
              {row.value === null ? "n/a" : Math.round(row.value)}
              <span className="ml-0.5 text-[9px] font-medium text-muted-2">{row.unit}</span>
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
