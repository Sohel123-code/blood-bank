import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import bloodBanksData from "../../b.json";
import requestsData from "../data/requests.json";
import deliveryBoysData from "../data/delivery.json";

// Leaflet type declarations
declare global {
  interface Window {
    L: any;
  }
}

/**
 * Delivery Request Interface
 */
interface DeliveryRequest {
  id?: string;
  name: string;
  phone: string;
  aadhar?: string;
  blood_required: string;
  urgency: string;
  quantity_units?: number;
  units_needed?: number;
  reason?: string;
  location?: string;
  hospital_name?: string;
  department?: string;
  accepted_at?: string;
  type: "user" | "hospital";
  userLocation?: { lat: number; lon: number; address: string };
  deliveryStatus?: "pending" | "accepted" | "in_transit" | "delivered";
  deliveryBoyId?: string;
  nearestBloodBank?: { name: string; location: string; coords: { lat: number; lon: number; address: string }; distance: number };
  routeInfo?: { distance: number; duration: number };
}

/**
 * Blood Bank Interface
 */
interface BloodBank {
  name: string;
  state: string;
  district: string;
  location: string;
  phone: string;
  blood_groups_available: string[];
  availability: string;
  last_updated: string;
}

/**
 * Delivery Boy Interface
 */
interface DeliveryBoy {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  status: string;
  lat: number;
  lng: number;
}

/**
 * DeliveryDashboard - Professional Delivery Portal with Advanced Map Integration
 * 
 * Features:
 * - Displays accepted requests from blood bank
 * - Interactive map integration (Leaflet)
 * - Automatic nearest blood bank detection (≤10km)
 * - Route calculation and rendering
 * - Distance and duration display
 * - Delivery status tracking
 */
const DeliveryDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [deliveryRequests, setDeliveryRequests] = useState<DeliveryRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<DeliveryRequest | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ car?: { distance: number; duration: number }; bike?: { distance: number; duration: number }; air?: { distance: number; duration: number } } | null>(null);
  const [mapEnabled, setMapEnabled] = useState(false);
  const [directionsEnabled, setDirectionsEnabled] = useState(false);
  const mapRef = useRef<any>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<{ [key: string]: any }>({}); // Delivery-related markers (user, blood bank)
  const routeLayerRef = useRef<any>(null);
  const bikeMarkersRef = useRef<{ [key: string]: any }>({}); // Delivery boys bike markers
  const bikeAnimationIntervalsRef = useRef<{ [key: string]: any }>({});
  const allBloodBanksRef = useRef<Array<BloodBank & { coords?: { lat: number; lon: number; address: string } }>>([]);
  const currentDeliveryRequestRef = useRef<DeliveryRequest | null>(null); // Track current active delivery
  const geocodeCacheRef = useRef<Map<string, { lat: number; lon: number; address: string }>>(new Map()); // Cache geocoded locations

  useEffect(() => {
    const deliveryId = sessionStorage.getItem("deliveryId");
    if (!deliveryId) {
      navigate("/delivery/login");
      return;
    }

    // Load all data in parallel for faster initialization
    Promise.all([
      Promise.resolve(loadAcceptedRequests()),
      Promise.resolve(loadBloodBanks()),
    ]).then(() => {
      // Pre-geocode in background immediately after data loads
      preGeocodeCommonBanks();
    });
  }, [navigate]);


  /**
   * Load all blood banks from b.json
   */
  const loadBloodBanks = () => {
    try {
      const allBanks: BloodBank[] = [];
      Object.values(bloodBanksData).forEach((stateBanks: any) => {
        if (Array.isArray(stateBanks)) {
          allBanks.push(...stateBanks);
        }
      });
      allBloodBanksRef.current = allBanks;
    } catch (error) {
      console.error("Error loading blood banks:", error);
    }
  };

  /**
   * Pre-geocode common blood bank locations in background for faster lookup - OPTIMIZED
   */
  const preGeocodeCommonBanks = async () => {
    if (allBloodBanksRef.current.length === 0) return;
    
    // Pre-geocode first 30 banks that don't have coordinates yet (increased for better coverage)
    const banksToGeocode = allBloodBanksRef.current
      .filter(bank => !bank.coords)
      .slice(0, 30);
    
    if (banksToGeocode.length === 0) return;
    
    // Process in larger batches for faster pre-loading (non-blocking)
    const batchSize = 5;
    const batches = [];
    
    for (let i = 0; i < banksToGeocode.length; i += batchSize) {
      batches.push(banksToGeocode.slice(i, i + batchSize));
    }
    
    // Process all batches in parallel (non-blocking)
    batches.forEach(async (batch) => {
      await Promise.all(
        batch.map(async (bank) => {
          try {
            const coords = await geocodeLocation(bank.location);
            if (coords) {
              (bank as any).coords = coords;
            }
          } catch (error) {
            // Silent fail for background pre-loading
          }
        })
      );
    });
  };

  /**
   * Create custom bike icon (Rapido style)
   */
  const createBikeIcon = (L: any, status: string) => {
    const isAvailable = status === "Available";
    const iconColor = isAvailable ? "#00D9FF" : "#FF6B6B"; // Blue for available, Red for on delivery
    
    const bikeIconHtml = `
      <div class="bike-icon-container" style="
        width: 45px;
        height: 45px;
        background: ${iconColor};
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 10px rgba(0,0,0,0.4);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        animation: bikePulse 2s infinite;
      ">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 1px 2px rgba(0,0,0,0.3));">
          <path d="M5 20.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zm0-5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM19 20.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7zm0-5a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zM12 5.5c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-2.5 4.5L8.5 8.5l-1.5 1.5L5.5 8l-1 1 2 2 1.5-1.5zm5 0L13.5 8.5l-1.5 1.5L10.5 8l-1 1 2 2 1.5-1.5zm-1.5 2.5L12 11l-1 1v2h2v-2z"/>
        </svg>
      </div>
      <style>
        @keyframes bikePulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.15); opacity: 0.85; }
        }
      </style>
    `;

    return L.divIcon({
      className: 'bike-marker',
      html: bikeIconHtml,
      iconSize: [45, 45],
      iconAnchor: [22.5, 22.5],
    });
  };

  /**
   * Load delivery boys from delivery.json and display on map - OPTIMIZED
   */
  const loadDeliveryBoys = () => {
    if (!mapRef.current) return;

    const L = window.L;
    if (!L) return;

    try {
      const deliveryBoys: DeliveryBoy[] = deliveryBoysData as DeliveryBoy[];

      // Only clear if markers already exist (avoid unnecessary work)
      if (Object.keys(bikeMarkersRef.current).length > 0) {
        Object.values(bikeMarkersRef.current).forEach((marker: any) => {
          if (marker && mapRef.current) {
            mapRef.current.removeLayer(marker);
          }
        });
        bikeMarkersRef.current = {};

        // Clear existing animation intervals
        Object.values(bikeAnimationIntervalsRef.current).forEach((interval: any) => {
          if (interval) clearInterval(interval);
        });
        bikeAnimationIntervalsRef.current = {};
      }

      if (deliveryBoys.length === 0) return;

      // Batch create markers for better performance
      const markers: any[] = [];
      const markerGroup = new L.FeatureGroup();

      deliveryBoys.forEach((boy: DeliveryBoy) => {
        const bikeIcon = createBikeIcon(L, boy.status);
        const bikeMarker = L.marker([boy.lat, boy.lng], { 
          icon: bikeIcon,
          riseOnHover: true, // Better UX
        })
          .bindPopup(
            `<strong>${boy.name}</strong><br/>` +
            `ID: ${boy.id}<br/>` +
            `Phone: ${boy.phone}<br/>` +
            `Vehicle: ${boy.vehicle}<br/>` +
            `Status: <span style="color: ${boy.status === "Available" ? "#00D9FF" : "#FF6B6B"}">${boy.status}</span>`
          );

        bikeMarkersRef.current[boy.id] = bikeMarker;
        markers.push(bikeMarker);
        markerGroup.addLayer(bikeMarker);

        // Add moving animation (non-blocking)
        requestAnimationFrame(() => {
          animateBikeMarker(bikeMarker, boy);
        });
      });

      // Add all markers at once for better performance
      markerGroup.addTo(mapRef.current);

      // Fit map to show all delivery boys (use requestAnimationFrame for smooth update)
      if (markers.length > 0) {
        requestAnimationFrame(() => {
          if (mapRef.current && markers.length > 0) {
            mapRef.current.fitBounds(markerGroup.getBounds().pad(0.2));
          }
        });
      }
    } catch (error) {
      console.error("Error loading delivery boys:", error);
    }
  };

  /**
   * Animate bike marker to simulate movement (like Rapido)
   */
  const animateBikeMarker = (marker: any, boy: DeliveryBoy) => {
    const baseLat = boy.lat;
    const baseLng = boy.lng;
    let currentLat = baseLat;
    let currentLng = baseLng;
    let angle = Math.random() * Math.PI * 2; // Random starting direction
    const speed = 0.0003; // Movement speed (smaller = slower)
    let step = 0;
    let directionChangeCounter = 0;

    const interval = setInterval(() => {
      if (!mapRef.current || !marker) {
        clearInterval(interval);
        return;
      }

      // Calculate new position in a wandering pattern
      const latOffset = Math.sin(angle) * speed;
      const lngOffset = Math.cos(angle) * speed;
      
      currentLat += latOffset;
      currentLng += lngOffset;

      // Keep bikes within a reasonable area (stay near original position)
      const maxDistance = 0.005; // Max distance from original position (~500m)
      const distanceFromBase = Math.sqrt(
        Math.pow(currentLat - baseLat, 2) + Math.pow(currentLng - baseLng, 2)
      );

      if (distanceFromBase > maxDistance) {
        // Turn back towards base
        angle = Math.atan2(baseLat - currentLat, baseLng - currentLng) + (Math.random() - 0.5) * 0.5;
      }

      // Update marker position smoothly
      marker.setLatLng([currentLat, currentLng]);

      // Change direction occasionally for more realistic movement
      directionChangeCounter++;
      if (directionChangeCounter >= 15) {
        angle += (Math.random() - 0.5) * 1.2; // Random direction change
        directionChangeCounter = 0;
      }

      step++;
    }, 1500); // Update every 1.5 seconds for smoother animation

    bikeAnimationIntervalsRef.current[boy.id] = interval;
  };

  /**
   * Load accepted requests from blood bank (stored in localStorage) - OPTIMIZED
   */
  const loadAcceptedRequests = () => {
    try {
      const savedAccepted = localStorage.getItem("acceptedRequests");
      if (savedAccepted) {
        const data = JSON.parse(savedAccepted);
        const requests: DeliveryRequest[] = [];

        // Convert accepted users to delivery requests (optimized batch processing)
        if (data.accepted_users && Array.isArray(data.accepted_users)) {
          const userRequests = data.accepted_users.map((user: any, index: number) => ({
            id: `user-${index}-${Date.now()}`,
            name: user.name,
            phone: user.phone,
            aadhar: user.aadhar,
            blood_required: user.blood_required,
            urgency: user.urgency,
            quantity_units: user.quantity_units,
            reason: user.reason,
            location: user.location,
            accepted_at: user.accepted_at,
            type: "user" as const,
            deliveryStatus: "pending" as const,
          }));
          requests.push(...userRequests);
        }

        // Convert accepted hospitals to delivery requests (optimized batch processing)
        if (data.accepted_hospitals && Array.isArray(data.accepted_hospitals)) {
          const hospitalRequests = data.accepted_hospitals.map((hospital: any, index: number) => ({
            id: `hospital-${index}-${Date.now()}`,
            name: hospital.hospital_name,
            phone: hospital.phone,
            blood_required: hospital.blood_required,
            urgency: hospital.urgency,
            units_needed: hospital.units_needed,
            location: hospital.location,
            department: hospital.department,
            accepted_at: hospital.accepted_at,
            type: "hospital" as const,
            deliveryStatus: "pending" as const,
          }));
          requests.push(...hospitalRequests);
        }

        setDeliveryRequests(requests);
      }
    } catch (error) {
      console.error("Error loading accepted requests:", error);
    }
  };

  /**
   * Initialize Leaflet map - OPTIMIZED for faster loading
   */
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Load CSS and JS in parallel for faster initialization
    const loadLeaflet = async () => {
      const cssLink = document.querySelector('link[href*="leaflet"]');
      const hasJs = !!window.L;

      // Load CSS and JS in parallel if not already loaded
      const promises: Promise<void>[] = [];

      if (!cssLink) {
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        link.crossOrigin = "anonymous";
        document.head.appendChild(link);
        // CSS loads asynchronously, no need to wait
      }

      if (!hasJs) {
        promises.push(
          new Promise<void>((resolve) => {
            const script = document.createElement("script");
            script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
            script.async = true;
            script.crossOrigin = "anonymous";
            script.onload = () => resolve();
            script.onerror = () => {
              console.error("Failed to load Leaflet");
              resolve(); // Continue even if script fails
            };
            document.head.appendChild(script);
          })
        );
      }

      // Wait only for JS if needed
      if (promises.length > 0) {
        await Promise.all(promises);
      }

      const L = window.L;
      if (!L || !mapContainerRef.current) return;

      // Initialize map immediately
      try {
        mapRef.current = L.map(mapContainerRef.current, {
          zoomControl: true,
          preferCanvas: true, // Better performance for many markers
        }).setView([17.7, 83.25], 12);

        // Add tile layer with performance optimizations
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: '© OpenStreetMap contributors',
          maxZoom: 19,
          updateWhenIdle: false, // Don't update tiles when panning
          updateWhenZooming: false, // Don't update tiles when zooming
          keepBuffer: 2, // Keep fewer tiles in memory
        }).addTo(mapRef.current);

        // Load delivery boys immediately after map is ready (no delay)
        requestAnimationFrame(() => {
          loadDeliveryBoys();
        });
      } catch (error) {
        console.error("Error initializing map:", error);
      }
    };

    // Start loading immediately
    loadLeaflet();
  }, []);

  /**
   * Update map size when enabled - OPTIMIZED
   */
  useEffect(() => {
    if (mapRef.current) {
      // Use requestAnimationFrame for smoother updates
      requestAnimationFrame(() => {
        mapRef.current?.invalidateSize();
        if (mapEnabled) {
          loadDeliveryBoys();
        }
      });
    }
  }, [mapEnabled]);

  /**
   * Geocode location string to coordinates with caching and improved error handling
   */
  const geocodeLocation = async (location: string): Promise<{ lat: number; lon: number; address: string } | null> => {
    if (!location || location.trim() === "") {
      return null;
    }

    const normalizedLocation = location.trim().toLowerCase();
    
    // Check cache first
    if (geocodeCacheRef.current.has(normalizedLocation)) {
      return geocodeCacheRef.current.get(normalizedLocation)!;
    }

    try {
      // Add "India" to city names for better geocoding results
      let searchQuery = location.trim();
      if (!searchQuery.toLowerCase().includes("india") && !searchQuery.includes(",")) {
        searchQuery = `${searchQuery}, India`;
      }

      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1&countrycodes=in`,
        {
          headers: {
            'User-Agent': 'BloodBankDeliveryApp/1.0'
          }
        }
      );
      
      if (!response.ok) {
        throw new Error(`Geocoding API error: ${response.status}`);
      }

      const data = await response.json();
      if (data && data.length > 0) {
        const result = {
          lat: parseFloat(data[0].lat),
          lon: parseFloat(data[0].lon),
          address: data[0].display_name || location,
        };
        
        // Cache the result
        geocodeCacheRef.current.set(normalizedLocation, result);
        
        return result;
      }
    } catch (error) {
      console.error("Geocoding error:", error);
    }
    return null;
  };

  /**
   * Calculate haversine distance between two coordinates (in meters)
   */
  const haversineDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371000; // Earth radius in meters
    const toRad = (v: number) => v * Math.PI / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  };

  /**
   * Quick approximate distance check (faster than haversine for filtering)
   */
  const quickDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    // Simple approximation - much faster than haversine
    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;
    return Math.sqrt(dLat * dLat + dLon * dLon) * 111000; // Rough conversion to meters
  };

  /**
   * Find nearest blood bank within 10km from user location based on availability
   * OPTIMIZED: Parallel processing, early termination, and smart filtering
   */
  const findNearestBloodBank = async (
    userCoords: { lat: number; lon: number; address: string },
    requiredBloodGroup: string
  ): Promise<{ name: string; location: string; coords: { lat: number; lon: number; address: string }; distance: number } | null> => {
    const MAX_DISTANCE = 10000; // 10km in meters
    const MAX_CANDIDATES = 30; // Limit candidates for faster processing
    const EARLY_TERMINATION_DISTANCE = 2000; // Stop if we find one within 2km

    // Step 1: Quick filter - only banks with required blood group and available
    const candidateBanks = allBloodBanksRef.current.filter(bank => {
      const hasBloodGroup = bank.blood_groups_available.includes(requiredBloodGroup);
      const isAvailable = bank.availability !== "Critical";
      return hasBloodGroup && isAvailable;
    });

    if (candidateBanks.length === 0) {
      return null;
    }

    // Step 2: Pre-filter by approximate distance (fast check)
    // Use already geocoded banks first, then estimate distance for others
    const banksWithCoords: Array<{ bank: typeof candidateBanks[0]; coords: { lat: number; lon: number; address: string }; approximateDistance: number }> = [];
    const banksNeedingGeocode: typeof candidateBanks = [];

    for (const bank of candidateBanks) {
      if (bank.coords) {
        const approxDist = quickDistance(userCoords.lat, userCoords.lon, bank.coords.lat, bank.coords.lon);
        if (approxDist <= MAX_DISTANCE * 1.5) { // 1.5x buffer for approximation
          banksWithCoords.push({ bank, coords: bank.coords, approximateDistance: approxDist });
        }
      } else {
        banksNeedingGeocode.push(bank);
      }
    }

    // Sort by approximate distance
    banksWithCoords.sort((a, b) => a.approximateDistance - b.approximateDistance);

    // Step 3: Process already geocoded banks first (fast path)
    let nearestBank: { name: string; location: string; coords: { lat: number; lon: number; address: string }; distance: number } | null = null;
    let minDistance = Infinity;

    for (const { bank, coords } of banksWithCoords.slice(0, MAX_CANDIDATES)) {
      const distance = haversineDistance(userCoords.lat, userCoords.lon, coords.lat, coords.lon);
      
      if (distance <= MAX_DISTANCE && distance < minDistance) {
        minDistance = distance;
        nearestBank = {
          name: bank.name,
          location: bank.location,
          coords: coords,
          distance: distance,
        };

        // Early termination if very close
        if (distance <= EARLY_TERMINATION_DISTANCE) {
          return nearestBank;
        }
      }
    }

    // Step 4: If no good match found, geocode remaining banks in parallel (limited batch)
    if (!nearestBank && banksNeedingGeocode.length > 0) {
      const batchSize = 5; // Process 5 at a time to avoid overwhelming API
      const batches = [];
      
      for (let i = 0; i < Math.min(banksNeedingGeocode.length, MAX_CANDIDATES); i += batchSize) {
        batches.push(banksNeedingGeocode.slice(i, i + batchSize));
      }

      for (const batch of batches) {
        // Parallel geocoding for this batch
        const geocodePromises = batch.map(async (bank) => {
          try {
            const geocoded = await geocodeLocation(bank.location);
            if (geocoded) {
              (bank as any).coords = geocoded;
              return { bank, coords: geocoded };
            }
          } catch (error) {
            console.error(`Geocoding failed for ${bank.name}:`, error);
          }
          return null;
        });

        const results = await Promise.all(geocodePromises);

        // Check results immediately
        for (const result of results) {
          if (!result) continue;

          const distance = haversineDistance(userCoords.lat, userCoords.lon, result.coords.lat, result.coords.lon);
          
          if (distance <= MAX_DISTANCE && distance < minDistance) {
            minDistance = distance;
            nearestBank = {
              name: result.bank.name,
              location: result.bank.location,
              coords: result.coords,
              distance: distance,
            };

            // Early termination if very close
            if (distance <= EARLY_TERMINATION_DISTANCE) {
              return nearestBank;
            }
          }
        }

        // If we found a good match, stop processing more batches
        if (nearestBank && minDistance <= 5000) {
          break;
        }
      }
    }

    return nearestBank;
  };

  /**
   * Calculate route using GraphHopper API (from maps.html)
   * Updated to preserve bike markers
   */
  const calculateRouteWithInfo = async (
    start: { lat: number; lon: number; address: string },
    end: { lat: number; lon: number; address: string }
  ) => {
    if (!mapRef.current) return;

    const L = window.L;
    if (!L) return;

    try {
      const apiKey = "0ebab54e-01f7-44eb-8cfe-c69419361bb6";

      // Clear only delivery-related markers (preserve bike markers)
      Object.keys(markersRef.current).forEach((key: string) => {
        if (markersRef.current[key] && mapRef.current) {
          mapRef.current.removeLayer(markersRef.current[key]);
        }
      });
      markersRef.current = {};

      if (routeLayerRef.current) {
        mapRef.current.removeLayer(routeLayerRef.current);
        routeLayerRef.current = null;
      }

      // Add start and end markers
      const startMarker = L.marker([start.lat, start.lon])
        .addTo(mapRef.current)
        .bindPopup(`<strong>Start:</strong> ${start.address}`)
        .openPopup();
      markersRef.current["start"] = startMarker;

      const endMarker = L.marker([end.lat, end.lon])
        .addTo(mapRef.current)
        .bindPopup(`<strong>Destination:</strong> ${end.address}`);
      markersRef.current["end"] = endMarker;

      // Calculate car route
      const carUrl = `https://graphhopper.com/api/1/route?point=${start.lat},${start.lon}&point=${end.lat},${end.lon}&vehicle=car&locale=en&points_encoded=false&key=${apiKey}`;
      const carResponse = await fetch(carUrl);
      const carJson = await carResponse.json();

      if (!carJson.paths || carJson.paths.length === 0) {
        alert("No route found.");
        return;
      }

      const carPath = carJson.paths[0];
      const coords = carPath.points.coordinates.map((c: number[]) => [c[1], c[0]]);
      
      // Add route polyline
      routeLayerRef.current = L.polyline(coords, { color: "blue", weight: 5 }).addTo(mapRef.current);
      mapRef.current.fitBounds(routeLayerRef.current.getBounds());

      const carDistance = carPath.distance;
      const carDuration = carPath.time;

      // Calculate bike route
      let bikeDistance: number | null = null;
      let bikeDuration: number | null = null;
      try {
        const bikeUrl = `https://graphhopper.com/api/1/route?point=${start.lat},${start.lon}&point=${end.lat},${end.lon}&vehicle=bike&locale=en&points_encoded=false&key=${apiKey}`;
        const bikeRes = await fetch(bikeUrl);
        const bikeJson = await bikeRes.json();
        if (bikeJson.paths && bikeJson.paths.length > 0) {
          bikeDistance = bikeJson.paths[0].distance;
          bikeDuration = bikeJson.paths[0].time;
        }
      } catch (e) {
        console.error("Bike route calculation failed:", e);
      }

      // Calculate air distance (haversine)
      const airDistance = haversineDistance(start.lat, start.lon, end.lat, end.lon);
      const bikeAvgKmh = 15;
      
      // Ensure bikeDistance is not null
      const finalBikeDistance = bikeDistance ?? (carDistance ?? airDistance);
      const finalBikeDuration = bikeDuration ?? ((finalBikeDistance / 1000) / bikeAvgKmh * 3600 * 1000);

      const airAvgKmh = 800;
      const airDuration = (airDistance / 1000) / airAvgKmh * 3600 * 1000;

      // Update route info state
      setRouteInfo({
        car: { distance: carDistance, duration: carDuration },
        bike: { distance: finalBikeDistance, duration: finalBikeDuration },
        air: { distance: airDistance, duration: airDuration },
      });
    } catch (error) {
      console.error("Route calculation error:", error);
      alert("Could not calculate route. Please try again.");
    }
  };

  /**
   * Format distance in meters to readable format
   */
  const formatDistance = (meters: number | null | undefined): string => {
    if (meters == null || meters === undefined || isNaN(meters)) return "—";
    const km = meters / 1000;
    return km < 1 ? `${Math.round(meters)} m` : `${km.toFixed(1)} km`;
  };

  /**
   * Format duration in milliseconds to readable format
   */
  const formatDuration = (ms: number | null | undefined): string => {
    if (ms == null || ms === undefined || !isFinite(ms) || isNaN(ms)) return "—";
    const totalSec = Math.round(ms / 1000);
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    if (h > 0) return `${h}h ${m}m`;
    if (m > 0) return `${m}m ${s}s`;
    return `${s}s`;
  };

  /**
   * Handle accepting a delivery request
   * Gets user location from requests.json, enables map, and finds nearest blood bank
   */
  const handleAcceptDelivery = async (request: DeliveryRequest) => {
    const deliveryId = sessionStorage.getItem("deliveryId");
    if (!deliveryId) {
      alert("Please login again.");
      navigate("/delivery/login");
      return;
    }

    // Show loading
    const loadingMsg = document.createElement("div");
    loadingMsg.textContent = "Loading user location and finding nearest blood bank...";
    loadingMsg.style.cssText = "position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 1rem; border-radius: 0.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 10000;";
    document.body.appendChild(loadingMsg);

    try {
      // Step 1: Get user location from requests.json (users column) or request object
      let userLocationString = request.location;
      
      // If location is not in request, try to find it from requests.json
      if (!userLocationString && request.type === "user") {
        const userFromRequests = (requestsData.users as any[]).find(
          (u: any) => u.name === request.name && u.phone === request.phone
        );
        if (userFromRequests && userFromRequests.location) {
          userLocationString = userFromRequests.location;
        }
      }

      // For hospitals, location should be in the request
      if (!userLocationString && request.type === "hospital") {
        userLocationString = request.location;
      }

      // If still no location, try to use name as fallback
      if (!userLocationString) {
        // Try to extract location from name or use a default
        userLocationString = request.name || "Hyderabad, India";
      }

      // Step 2: Geocode user location (optimized - single attempt with smart fallback)
      let coords = await geocodeLocation(userLocationString);
      
      // Quick fallback if first attempt fails
      if (!coords) {
        // Try with India appended if not already included
        if (!userLocationString.includes("India")) {
          coords = await geocodeLocation(`${userLocationString}, India`);
        }
        
        // If still fails and it's a user request, try city name
        if (!coords && request.type === "user") {
          const userFromRequests = (requestsData.users as any[]).find(
            (u: any) => u.name === request.name && u.phone === request.phone
          );
          if (userFromRequests && userFromRequests.location) {
            const cityName = userFromRequests.location.split(",")[0].trim();
            coords = await geocodeLocation(`${cityName}, Andhra Pradesh, India`);
          }
        }
      }

      // Final fallback: use a default location (Hyderabad center)
      if (!coords) {
        console.warn(`Could not geocode location: ${userLocationString}, using default location`);
        coords = {
          lat: 17.3850,
          lon: 78.4867,
          address: `${userLocationString} (approximate location)`,
        };
      }

      // Step 3: Enable map
      setMapEnabled(true);
      if (mapRef.current) {
        mapRef.current.invalidateSize(); // Ensure map is properly sized
      }

      // Step 4: Find nearest blood bank based on availability (optimized parallel processing)
      const requiredBloodGroup = request.blood_required;
      
      // Update loading message
      loadingMsg.textContent = "Finding nearest blood bank...";
      
      const nearestBank = await findNearestBloodBank(coords, requiredBloodGroup);

      // Update request status
      const updatedRequest: DeliveryRequest = {
        ...request,
        deliveryStatus: "accepted",
        deliveryBoyId: deliveryId,
        userLocation: coords,
        nearestBloodBank: nearestBank || undefined,
      };

      setDeliveryRequests((prev) =>
        prev.map((r) => (r.id === request.id ? updatedRequest : r))
      );

      setSelectedRequest(updatedRequest);

      // Step 5: Show user location and nearest blood bank on map (without disturbing bike markers)
      if (mapRef.current) {
        await showLocationOnMap(coords, updatedRequest);
      }

      // Step 6: If nearest bank found, automatically calculate and show route (maps.html integration)
      if (nearestBank) {
        setDirectionsEnabled(true);
        currentDeliveryRequestRef.current = updatedRequest;
        
        // Update loading message
        loadingMsg.textContent = "Calculating route...";
        
        // Automatically calculate and display route from blood bank to user location
        // Don't await - let it run in background while showing results
        calculateRouteFromBloodBankToUser(nearestBank.coords, coords, updatedRequest).catch(err => {
          console.error("Route calculation error:", err);
        });
        
        console.log(`User location found: ${coords.address}`);
        console.log(`Nearest available blood bank: ${nearestBank.name}, Distance: ${formatDistance(nearestBank.distance)}`);
      } else {
        setDirectionsEnabled(false);
        console.warn(`No blood bank with ${requiredBloodGroup} available within 10km of ${coords.address}`);
      }
    } catch (error) {
      console.error("Error accepting delivery:", error);
      alert("An error occurred while accepting the delivery. Please try again.");
    } finally {
      document.body.removeChild(loadingMsg);
    }
  };

  /**
   * Show location on map with marker (preserves bike markers)
   */
  const showLocationOnMap = async (coords: { lat: number; lon: number; address: string }, request: DeliveryRequest) => {
    if (!mapRef.current) return;

    const L = window.L;
    if (!L) return;

    // Remove only delivery-related markers (not bike markers)
    if (markersRef.current[request.id || ""]) {
      mapRef.current.removeLayer(markersRef.current[request.id || ""]);
      delete markersRef.current[request.id || ""];
    }
    if (markersRef.current[`${request.id}-bank`]) {
      mapRef.current.removeLayer(markersRef.current[`${request.id}-bank`]);
      delete markersRef.current[`${request.id}-bank`];
    }
    if (markersRef.current["start"]) {
      mapRef.current.removeLayer(markersRef.current["start"]);
      delete markersRef.current["start"];
    }
    if (markersRef.current["end"]) {
      mapRef.current.removeLayer(markersRef.current["end"]);
      delete markersRef.current["end"];
    }

    // Create custom icons for better visibility
    const userIcon = L.divIcon({
      className: 'user-marker',
      html: `<div style="
        width: 40px;
        height: 40px;
        background: #EF4444;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 18px;
      ">📍</div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    const bankIcon = L.divIcon({
      className: 'bank-marker',
      html: `<div style="
        width: 40px;
        height: 40px;
        background: #10B981;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        font-size: 18px;
      ">🏥</div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 20],
    });

    // Add user/destination marker with custom icon
    const marker = L.marker([coords.lat, coords.lon], { icon: userIcon })
      .addTo(mapRef.current)
      .bindPopup(
        `<strong>📍 ${request.type === "user" ? request.name : request.hospital_name}</strong><br/>` +
        `Blood Group: ${request.blood_required}<br/>` +
        `Units: ${request.quantity_units || request.units_needed}<br/>` +
        `Urgency: <span style="color: ${request.urgency === "High" ? "#EF4444" : request.urgency === "Medium" ? "#F59E0B" : "#10B981"}">${request.urgency}</span><br/>` +
        `Location: ${coords.address}`
      )
      .openPopup();

    markersRef.current[request.id || ""] = marker;

    // Add nearest blood bank marker if available
    if (request.nearestBloodBank) {
      const bankMarker = L.marker([request.nearestBloodBank.coords.lat, request.nearestBloodBank.coords.lon], { icon: bankIcon })
        .addTo(mapRef.current)
        .bindPopup(
          `<strong>🏥 ${request.nearestBloodBank.name}</strong><br/>` +
          `Location: ${request.nearestBloodBank.location}<br/>` +
          `Distance: ${formatDistance(request.nearestBloodBank.distance)}<br/>` +
          `Blood Group Available: ${request.blood_required}`
        );
      markersRef.current[`${request.id}-bank`] = bankMarker;

      // Fit map to show both markers while preserving bike markers visibility
      const group = new L.FeatureGroup([marker, bankMarker]);
      mapRef.current.fitBounds(group.getBounds().pad(0.15));
    } else {
      // Fit map to marker
      mapRef.current.setView([coords.lat, coords.lon], 13);
    }
  };

  /**
   * Calculate and display route from blood bank to user (maps.html integration)
   * This function integrates the route calculation from maps.html
   */
  const calculateRouteFromBloodBankToUser = async (
    bloodBankCoords: { lat: number; lon: number; address: string },
    userCoords: { lat: number; lon: number; address: string },
    _request: DeliveryRequest
  ) => {
    if (!mapRef.current) return;

    const L = window.L;
    if (!L) return;

    try {
      const apiKey = "0ebab54e-01f7-44eb-8cfe-c69419361bb6";

      // Remove existing route (but keep bike markers)
      if (routeLayerRef.current) {
        mapRef.current.removeLayer(routeLayerRef.current);
        routeLayerRef.current = null;
      }

      // Remove old start/end markers if they exist (but keep user and bank markers)
      if (markersRef.current["route-start"]) {
        mapRef.current.removeLayer(markersRef.current["route-start"]);
        delete markersRef.current["route-start"];
      }
      if (markersRef.current["route-end"]) {
        mapRef.current.removeLayer(markersRef.current["route-end"]);
        delete markersRef.current["route-end"];
      }

      // Calculate car route (from maps.html)
      const carUrl = `https://graphhopper.com/api/1/route?point=${bloodBankCoords.lat},${bloodBankCoords.lon}&point=${userCoords.lat},${userCoords.lon}&vehicle=car&locale=en&points_encoded=false&key=${apiKey}`;
      const carResponse = await fetch(carUrl);
      const carJson = await carResponse.json();

      if (!carJson.paths || carJson.paths.length === 0) {
        console.warn("No route found from blood bank to user location");
        return;
      }

      const carPath = carJson.paths[0];
      const coords = carPath.points.coordinates.map((c: number[]) => [c[1], c[0]]);
      
      // Add route polyline with distinct color
      routeLayerRef.current = L.polyline(coords, { 
        color: "#3B82F6", 
        weight: 6,
        opacity: 0.8
      }).addTo(mapRef.current);

      const carDistance = carPath.distance;
      const carDuration = carPath.time;

      // Calculate bike route (from maps.html)
      let bikeDistance: number | null = null;
      let bikeDuration: number | null = null;
      try {
        const bikeUrl = `https://graphhopper.com/api/1/route?point=${bloodBankCoords.lat},${bloodBankCoords.lon}&point=${userCoords.lat},${userCoords.lon}&vehicle=bike&locale=en&points_encoded=false&key=${apiKey}`;
        const bikeRes = await fetch(bikeUrl);
        const bikeJson = await bikeRes.json();
        if (bikeJson.paths && bikeJson.paths.length > 0) {
          bikeDistance = bikeJson.paths[0].distance;
          bikeDuration = bikeJson.paths[0].time;
        }
      } catch (e) {
        console.error("Bike route calculation failed:", e);
      }

      // Calculate air distance (haversine)
      const airDistance = haversineDistance(bloodBankCoords.lat, bloodBankCoords.lon, userCoords.lat, userCoords.lon);
      const bikeAvgKmh = 15;
      
      const finalBikeDistance = bikeDistance ?? (carDistance ?? airDistance);
      const finalBikeDuration = bikeDuration ?? ((finalBikeDistance / 1000) / bikeAvgKmh * 3600 * 1000);

      const airAvgKmh = 800;
      const airDuration = (airDistance / 1000) / airAvgKmh * 3600 * 1000;

      // Update route info state (from maps.html)
      setRouteInfo({
        car: { distance: carDistance, duration: carDuration },
        bike: { distance: finalBikeDistance, duration: finalBikeDuration },
        air: { distance: airDistance, duration: airDuration },
      });

      // Fit map to show route while preserving bike markers
      if (routeLayerRef.current) {
        const bounds = routeLayerRef.current.getBounds();
        // Include bike markers in bounds if they're nearby
        const allMarkers = Object.values(bikeMarkersRef.current).filter((m: any) => m && bounds.contains(m.getLatLng()));
        if (allMarkers.length > 0) {
          const featureGroup = new L.FeatureGroup([routeLayerRef.current, ...allMarkers]);
          mapRef.current.fitBounds(featureGroup.getBounds().pad(0.1));
        } else {
          mapRef.current.fitBounds(bounds.pad(0.1));
        }
      }

      console.log("Route calculated successfully from blood bank to user location");
    } catch (error) {
      console.error("Route calculation error:", error);
    }
  };

  /**
   * Handle Start Delivery - Main workflow
   */
  const handleStartDelivery = async (request: DeliveryRequest) => {
    if (!request.userLocation) {
      alert("User location not available. Please accept the delivery first.");
      return;
    }

    // Show loading
    const loadingMsg = document.createElement("div");
    loadingMsg.textContent = "Finding nearest blood bank and calculating route...";
    loadingMsg.style.cssText = "position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 1rem; border-radius: 0.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); z-index: 10000;";
    document.body.appendChild(loadingMsg);

    try {
      // Step 1: Find nearest blood bank within 10km with availability check
      const nearestBank = await findNearestBloodBank(request.userLocation, request.blood_required);

      if (!nearestBank) {
        alert("No blood bank found within 10km of the user location. Delivery cannot be processed.");
        document.body.removeChild(loadingMsg);
        return;
      }

      // Step 2: Update request with nearest blood bank info
      const updatedRequest: DeliveryRequest = {
        ...request,
        nearestBloodBank: nearestBank,
        deliveryStatus: "in_transit",
      };

      setDeliveryRequests((prev) =>
        prev.map((r) => (r.id === request.id ? updatedRequest : r))
      );

      setSelectedRequest(updatedRequest);

      // Step 3: Calculate and render route from blood bank to user
      await calculateRouteWithInfo(nearestBank.coords, request.userLocation);

      // Step 4: Show success message
      alert(`Nearest blood bank found: ${nearestBank.name}\nDistance: ${formatDistance(nearestBank.distance)}\nRoute calculated successfully!`);
    } catch (error) {
      console.error("Error starting delivery:", error);
      alert("An error occurred while starting delivery. Please try again.");
    } finally {
      document.body.removeChild(loadingMsg);
    }
  };

  /**
   * Update delivery status
   */
  const updateDeliveryStatus = (requestId: string, status: DeliveryRequest["deliveryStatus"]) => {
    setDeliveryRequests((prev) =>
      prev.map((r) => (r.id === requestId ? { ...r, deliveryStatus: status } : r))
    );
  };

  /**
   * Handle logout
   */
  const handleLogout = () => {
    sessionStorage.removeItem("deliveryId");
    sessionStorage.removeItem("deliveryName");
    navigate("/delivery/login");
  };

  // Show content immediately, don't block on loading
  // if (loading) {
  //   return (
  //     <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "50vh" }}>
  //       <div>Loading...</div>
  //     </div>
  //   );
  // }

  const pendingRequests = deliveryRequests.filter((r) => r.deliveryStatus === "pending");
  const acceptedRequests = deliveryRequests.filter((r) => r.deliveryStatus === "accepted" || r.deliveryStatus === "in_transit");
  const deliveredRequests = deliveryRequests.filter((r) => r.deliveryStatus === "delivered");

  return (
    <section className="modules fade-up" style={{ paddingTop: "2rem", paddingBottom: "2rem" }}>
      <div className="container">
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2rem" }}>
          <div>
            <h1 style={{ margin: 0, fontSize: "2rem" }}>Delivery Dashboard</h1>
            <p style={{ margin: "0.5rem 0 0 0", color: "var(--gray-700)" }}>
              Welcome, {sessionStorage.getItem("deliveryName") || "Delivery Agent"}
            </p>
          </div>
          <button className="btn btn-ghost" onClick={handleLogout}>
            Logout
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem" }}>
          {/* Left Panel - Requests List */}
          <div>
            {/* Pending Requests */}
            {pendingRequests.length > 0 && (
              <div style={{ marginBottom: "2rem" }}>
                <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Pending Deliveries</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {pendingRequests.map((request) => (
                    <div
                      key={request.id}
                      style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: "0.5rem",
                        padding: "1rem",
                        backgroundColor: "white",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "0.5rem" }}>
                        <div>
                          <h3 style={{ margin: 0, fontSize: "1.125rem" }}>
                            {request.type === "user" ? request.name : request.hospital_name}
                          </h3>
                          <p style={{ margin: "0.25rem 0", color: "var(--gray-700)", fontSize: "0.875rem" }}>
                            {request.type === "user" ? "User Request" : "Hospital Request"}
                          </p>
                        </div>
                        <span
                          style={{
                            padding: "0.25rem 0.75rem",
                            borderRadius: "9999px",
                            fontSize: "0.75rem",
                            fontWeight: 600,
                            backgroundColor:
                              request.urgency === "High"
                                ? "#fee2e2"
                                : request.urgency === "Medium"
                                ? "#fef3c7"
                                : "#d1fae5",
                            color:
                              request.urgency === "High"
                                ? "#991b1b"
                                : request.urgency === "Medium"
                                ? "#92400e"
                                : "#065f46",
                          }}
                        >
                          {request.urgency}
                        </span>
                      </div>
                      <div style={{ marginBottom: "0.75rem", fontSize: "0.875rem", color: "var(--gray-700)" }}>
                        <p style={{ margin: "0.25rem 0" }}>
                          <strong>Blood Group:</strong> {request.blood_required}
                        </p>
                        <p style={{ margin: "0.25rem 0" }}>
                          <strong>Units:</strong> {request.quantity_units || request.units_needed}
                        </p>
                        {request.location && (
                          <p style={{ margin: "0.25rem 0" }}>
                            <strong>Location:</strong> {request.location}
                          </p>
                        )}
                        <p style={{ margin: "0.25rem 0" }}>
                          <strong>Phone:</strong> {request.phone}
                        </p>
                      </div>
                      <button
                        className="btn btn-primary"
                        onClick={() => handleAcceptDelivery(request)}
                        style={{ width: "100%" }}
                      >
                        Accept Delivery
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Accepted/In Transit Requests */}
            {acceptedRequests.length > 0 && (
              <div style={{ marginBottom: "2rem" }}>
                <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Active Deliveries</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {acceptedRequests.map((request) => (
                    <div
                      key={request.id}
                      style={{
                        border: "1px solid #3b82f6",
                        borderRadius: "0.5rem",
                        padding: "1rem",
                        backgroundColor: "#eff6ff",
                      }}
                    >
                      <div style={{ marginBottom: "0.75rem" }}>
                        <h3 style={{ margin: 0, fontSize: "1.125rem" }}>
                          {request.type === "user" ? request.name : request.hospital_name}
                        </h3>
                        <p style={{ margin: "0.25rem 0", color: "var(--gray-700)", fontSize: "0.875rem" }}>
                          {request.userLocation?.address || request.location || "Location not available"}
                        </p>
                        {request.nearestBloodBank && (
                          <div style={{ marginTop: "0.5rem", padding: "0.5rem", backgroundColor: "white", borderRadius: "0.25rem", fontSize: "0.875rem" }}>
                            <p style={{ margin: "0.25rem 0" }}>
                              <strong>Nearest Blood Bank:</strong> {request.nearestBloodBank.name}
                            </p>
                            <p style={{ margin: "0.25rem 0" }}>
                              <strong>Distance:</strong> {formatDistance(request.nearestBloodBank.distance)}
                            </p>
                          </div>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "0.75rem", flexWrap: "wrap" }}>
                        <button
                          className="btn btn-ghost"
                          onClick={() => {
                            if (request.userLocation) {
                              showLocationOnMap(request.userLocation, request);
                            }
                          }}
                          style={{ flex: 1, minWidth: "120px" }}
                        >
                          View on Map
                        </button>
                        {request.deliveryStatus === "accepted" && request.nearestBloodBank && directionsEnabled && (
                          <button
                            className="btn btn-primary"
                            onClick={async () => {
                              if (request.nearestBloodBank && request.userLocation) {
                                await calculateRouteWithInfo(request.nearestBloodBank.coords, request.userLocation);
                                setRouteInfo(prev => prev); // Trigger re-render
                              }
                            }}
                            style={{ flex: 1, minWidth: "120px" }}
                          >
                            Get Directions
                          </button>
                        )}
                        {request.deliveryStatus === "accepted" && (
                          <button
                            className="btn btn-primary"
                            onClick={() => handleStartDelivery(request)}
                            style={{ flex: 1, minWidth: "120px" }}
                          >
                            Start Delivery
                          </button>
                        )}
                        {request.deliveryStatus === "in_transit" && (
                          <span style={{ flex: 1, padding: "0.5rem", textAlign: "center", backgroundColor: "#dbeafe", borderRadius: "0.25rem", fontSize: "0.875rem", fontWeight: 600, color: "#1e40af" }}>
                            In Transit
                          </span>
                        )}
                        <button
                          className="btn btn-primary"
                          onClick={() => updateDeliveryStatus(request.id || "", "delivered")}
                          style={{ flex: 1, minWidth: "120px" }}
                        >
                          Mark Delivered
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Delivered Requests */}
            {deliveredRequests.length > 0 && (
              <div>
                <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Completed Deliveries</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                  {deliveredRequests.map((request) => (
                    <div
                      key={request.id}
                      style={{
                        border: "1px solid #10b981",
                        borderRadius: "0.5rem",
                        padding: "1rem",
                        backgroundColor: "#f0fdf4",
                        opacity: 0.8,
                      }}
                    >
                      <h3 style={{ margin: 0, fontSize: "1.125rem" }}>
                        {request.type === "user" ? request.name : request.hospital_name}
                      </h3>
                      <p style={{ margin: "0.25rem 0", color: "var(--gray-700)", fontSize: "0.875rem" }}>
                        Delivered ✓
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {deliveryRequests.length === 0 && (
              <div style={{ textAlign: "center", padding: "3rem", color: "var(--gray-700)" }}>
                <p>No delivery requests available.</p>
                <p style={{ fontSize: "0.875rem" }}>Accepted requests from blood bank will appear here.</p>
              </div>
            )}
          </div>

          {/* Right Panel - Map */}
          <div>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "1rem" }}>Delivery Map</h2>
            <div
              ref={mapContainerRef}
              id="delivery-map"
              style={{
                width: "100%",
                height: "500px",
                border: "1px solid #e5e7eb",
                borderRadius: "0.5rem",
                backgroundColor: "#f3f4f6",
              }}
            />
            
            {/* Route Information Card (from maps.html) */}
            {routeInfo && (
              <div
                style={{
                  marginTop: "1rem",
                  padding: "1rem",
                  backgroundColor: "white",
                  borderRadius: "0.5rem",
                  border: "1px solid #e0e0e0",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
                }}
              >
                <h3 style={{ margin: "0 0 0.75rem 0", fontSize: "1rem" }}>Estimated Travel Details</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.5rem" }}>
                  <div style={{ background: "#f9fafb", border: "1px solid #ececec", borderRadius: "0.375rem", padding: "0.5rem" }}>
                    <div style={{ fontWeight: 600, fontSize: "0.75rem", marginBottom: "0.25rem", color: "#333" }}>Car</div>
                    <div style={{ fontSize: "0.75rem", color: "#555" }}>
                      {formatDistance(routeInfo.car?.distance)} • {formatDuration(routeInfo.car?.duration)}
                    </div>
                  </div>
                  <div style={{ background: "#f9fafb", border: "1px solid #ececec", borderRadius: "0.375rem", padding: "0.5rem" }}>
                    <div style={{ fontWeight: 600, fontSize: "0.75rem", marginBottom: "0.25rem", color: "#333" }}>Bike</div>
                    <div style={{ fontSize: "0.75rem", color: "#555" }}>
                      {formatDistance(routeInfo.bike?.distance)} • {formatDuration(routeInfo.bike?.duration)}
                    </div>
                  </div>
                  <div style={{ background: "#f9fafb", border: "1px solid #ececec", borderRadius: "0.375rem", padding: "0.5rem" }}>
                    <div style={{ fontWeight: 600, fontSize: "0.75rem", marginBottom: "0.25rem", color: "#333" }}>Air</div>
                    <div style={{ fontSize: "0.75rem", color: "#555" }}>
                      {formatDistance(routeInfo.air?.distance)} • {formatDuration(routeInfo.air?.duration)}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedRequest && selectedRequest.userLocation && !routeInfo && (
              <div style={{ marginTop: "1rem", padding: "1rem", backgroundColor: "white", borderRadius: "0.5rem", border: "1px solid #e5e7eb" }}>
                <h3 style={{ margin: "0 0 0.5rem 0", fontSize: "1rem" }}>Selected Delivery</h3>
                <p style={{ margin: "0.25rem 0", fontSize: "0.875rem" }}>
                  <strong>To:</strong> {selectedRequest.type === "user" ? selectedRequest.name : selectedRequest.hospital_name}
                </p>
                <p style={{ margin: "0.25rem 0", fontSize: "0.875rem" }}>
                  <strong>Address:</strong> {selectedRequest.userLocation.address}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default DeliveryDashboard;
