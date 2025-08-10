import { getFusionCachedOrFetch } from "./fusionService";
jest.setTimeout(20000);

test("fusion service returns an array-like data", async () => {
  const res = await getFusionCachedOrFetch({ limit: 2 });
  expect(res).toHaveProperty("data");
  expect(Array.isArray(res.data)).toBe(true);
  expect(res.data.length).toBeGreaterThan(0);
});
