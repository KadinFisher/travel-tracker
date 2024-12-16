import { useSearchParams } from "react-router-dom";

export function useUrlPosition() {
  const [searchParams] = useSearchParams();

  // Extract latitude and longitude from the URL query parameters
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");

  // Return the values as numbers if they exist, otherwise null
  return [lat ? Number(lat) : null, lng ? Number(lng) : null];
}