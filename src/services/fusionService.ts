import axios from "axios";
import { getCache, putCache, putHistory } from "./dbService";

const SWAPI_ROOT = "https://swapi.dev/api";
const OPEN_METEO = "https://api.open-meteo.com/v1/forecast";

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutos

type FusionOptions = { limit?: number };

export async function getFusionCachedOrFetch(opts: FusionOptions = { limit: 5 }) {
  const key = `fusion:limit:${opts.limit ?? 5}`;
  // 1) check cache
  const cached = await getCache(key);
  if (cached) {
    const age = Date.now() - new Date(cached.cachedAt).getTime();
    if (age <= CACHE_TTL_MS) {
      return { fromCache: true, cachedAt: cached.cachedAt, data: cached.data };
    }
  }

  // 2) not cached -> fetch from SWAPI
  const people = await fetchPeople(opts.limit || 5);
  const fused = await Promise.all(
    people.map(async (p) => {
      const homeworld = p.homeworld ? await fetchUrl(p.homeworld) : null;
      const planetName = homeworld?.name ?? null;
      const coords = planetName ? planetCoordinates[planetName.toLowerCase()] : null;
      let weather = null;
      if (coords) {
        weather = await fetchWeather(coords.lat, coords.lon);
      }
      return {
        name: p.name,
        height: Number(p.height) || null,
        mass: parseMass(p.mass),
        homeworld: { name: planetName, population: parsePopulation(homeworld?.population) },
        weather
      };
    })
  );

  const now = new Date().toISOString();
  await putHistory({
    pk: "FUSION",
    sk: `#${now}`,
    data: fused,
    createdAt: now
  });
  await putCache(key, { cachedAt: now, data: fused });

  return { fromCache: false, cachedAt: now, data: fused };
}

async function fetchPeople(limit: number) {
  const res = await axios.get(`${SWAPI_ROOT}/people/?page=1`);
  return (res.data.results as any[]).slice(0, limit);
}
async function fetchUrl(url: string) {
  const res = await axios.get(url);
  return res.data;
}
async function fetchWeather(lat: number, lon: number) {
  const res = await axios.get(OPEN_METEO, {
    params: { latitude: lat, longitude: lon, hourly: "temperature_2m", timezone: "UTC" }
  });
  return res.data;
}
function parseMass(v: string) {
  if (!v || v === "unknown") return null;
  return Number(v.replace(",", "")) || null;
}
function parsePopulation(v: any) {
  if (!v || v === "unknown") return null;
  const num = Number(String(v).replace(",", ""));
  return isNaN(num) ? null : num;
}
