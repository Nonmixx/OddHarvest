import { useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, Marker, Polyline, TileLayer, useMap } from "react-leaflet";
import type { LatLngBoundsExpression, LatLngExpression } from "leaflet";
import { Button } from "@/components/ui/button";
import { LocateFixed, RefreshCw } from "lucide-react";

type LngLat = { lng: number; lat: number };

type RouteInfo = {
  distanceMeters: number;
  durationSeconds: number;
  geometry: LatLngExpression[];
};

function metersToKm(meters: number) {
  return meters / 1000;
}

async function fetchOsrmRoute(origin: LngLat, destination: LngLat, signal: AbortSignal): Promise<RouteInfo> {
  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${origin.lng},${origin.lat};${destination.lng},${destination.lat}` +
    `?overview=full&geometries=geojson&steps=false`;

  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error(`OSRM route failed (${res.status})`);
  const json = (await res.json()) as {
    routes?: Array<{
      distance: number;
      duration: number;
      geometry: { coordinates: [number, number][] };
    }>;
  };

  const route = json.routes?.[0];
  if (!route) throw new Error("OSRM route missing");

  const geometry: LatLngExpression[] = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
  return { distanceMeters: route.distance, durationSeconds: route.duration, geometry };
}

function FitToRoute({ points }: { points: LatLngExpression[] }) {
  const map = useMap();
  useEffect(() => {
    if (!points.length) return;
    const bounds = points as unknown as LatLngBoundsExpression;
    map.fitBounds(bounds, { padding: [24, 24] });
  }, [map, points]);
  return null;
}

export type DriverRouteMapProps = {
  driver: LngLat;
  pickup: LngLat;
  dropoff: LngLat;
  target: "pickup" | "dropoff";
  onRouteInfo?: (info: { distanceKm: number; etaMinutes: number } | null) => void;
};

export default function DriverRouteMap({ driver, pickup, dropoff, target, onRouteInfo }: DriverRouteMapProps) {
  const [route, setRoute] = useState<RouteInfo | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const mapRef = useRef<ReturnType<typeof useMap> | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const destination = target === "pickup" ? pickup : dropoff;

  const center: LatLngExpression = useMemo(() => [driver.lat, driver.lng], [driver.lat, driver.lng]);
  const driverPos: LatLngExpression = useMemo(() => [driver.lat, driver.lng], [driver.lat, driver.lng]);
  const pickupPos: LatLngExpression = useMemo(() => [pickup.lat, pickup.lng], [pickup.lat, pickup.lng]);
  const dropoffPos: LatLngExpression = useMemo(() => [dropoff.lat, dropoff.lng], [dropoff.lat, dropoff.lng]);

  const routeColor = target === "pickup" ? "hsl(var(--primary))" : "hsl(var(--accent))";

  const refreshRoute = useMemo(
    () => async () => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      setIsLoading(true);
      setError(null);

      try {
        const next = await fetchOsrmRoute(driver, destination, controller.signal);
        setRoute(next);
        const distanceKmRaw = metersToKm(next.distanceMeters);
        const distanceKm = Math.round(distanceKmRaw * 10) / 10;
        onRouteInfo?.({
          distanceKm,
          etaMinutes: Math.max(1, Math.round(next.durationSeconds / 60)),
        });
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
        const message = e instanceof Error ? e.message : "Failed to load route";
        setError(message);
        setRoute(null);
        onRouteInfo?.(null);
      } finally {
        setIsLoading(false);
      }
    },
    [destination, driver, onRouteInfo]
  );

  // Fetch route whenever the driver moves a meaningful amount or target changes.
  const lastFetchKey = useRef<string>("");
  useEffect(() => {
    const key = `${target}:${driver.lat.toFixed(5)},${driver.lng.toFixed(5)}->${destination.lat.toFixed(5)},${destination.lng.toFixed(5)}`;
    if (key === lastFetchKey.current) return;
    lastFetchKey.current = key;
    void refreshRoute();
  }, [destination.lat, destination.lng, driver.lat, driver.lng, refreshRoute, target]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const routePoints = route?.geometry ?? [];

  return (
    <div className="relative z-0 isolate w-full h-64 sm:h-80 rounded-2xl border border-border overflow-hidden bg-muted/20 [&_.leaflet-container]:z-0 [&_.leaflet-control-container]:z-[20]">
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom
        className="h-full w-full"
        whenCreated={(map) => {
          mapRef.current = map;
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <Marker position={driverPos} />
        <Marker position={pickupPos} />
        <Marker position={dropoffPos} />

        {routePoints.length > 1 ? (
          <>
            <Polyline positions={routePoints} pathOptions={{ color: routeColor, weight: 6, opacity: 0.9 }} />
            <FitToRoute points={routePoints} />
          </>
        ) : null}
      </MapContainer>

      <div className="absolute top-3 right-3 z-[30] flex gap-2">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="rounded-full shadow-sm"
          onClick={() => {
            const map = mapRef.current;
            if (!map) return;
            map.setView(center, Math.max(map.getZoom(), 15), { animate: true });
          }}
        >
          <LocateFixed className="h-4 w-4 mr-1" /> Center
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="rounded-full shadow-sm"
          disabled={isLoading}
          onClick={() => void refreshRoute()}
        >
          <RefreshCw className="h-4 w-4 mr-1" /> Route
        </Button>
      </div>

      {error ? (
        <div className="absolute bottom-3 left-3 right-3 bg-background/95 backdrop-blur rounded-lg px-3 py-2 text-xs border border-border">
          <span className="text-destructive font-medium">Route error:</span> {error}
        </div>
      ) : null}
    </div>
  );
}

