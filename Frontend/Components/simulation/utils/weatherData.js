/* --------------------------------------------------------------
 *  WATER-ENERGIE  –  basis­fysica & helpers
 * --------------------------------------------------------------*/
export const RHO = 1_000;     // kg m-3
export const G   = 9.81;      // m s-2
export const ETA = 0.60;      // totaal rendement rad + generator

/* Debiet Q (m³/s) en statische hoogte H (m) per vaste locatie */
export const LOC_SPECS = {
  1: { Q: 0.080, H: 2.5 },   // BENEDEN
  2: { Q: 0.060, H: 1.8 },   // MIDDEN
  3: { Q: 0.040, H: 1.2 }    // BOVEN
};

/**
 * Bereken water­vermogen P (W en kW) bij positie 1-3 en diepte-offset d (m).
 *   P = ρ · g · Q · (H + d) · η
 */
export function calcHydroPower(position = 1, depth = 0) {
  const { Q, H } = LOC_SPECS[position] ?? LOC_SPECS[1];
  const P = RHO * G * Q * (H + depth) * ETA;  // watt
  return { W: P, kW: P / 1_000 };
}

/* === Rotor-constanten ============================================= */
export const ROTOR_RADIUS_M = 1.5;                     // pas aan indien nodig
const ROTOR_AREA = Math.PI * ROTOR_RADIUS_M ** 2;      // m²

/**
 * Fetches the current wind direction for a given location
 * @param {number} lat - Latitude (defaults to Leuven)
 * @param {number} lon - Longitude (defaults to Leuven)
 * @returns {Promise<number>} Wind direction in degrees
 */
export async function fetchWindDirection(lat = 50.8798, lon = 4.7005) {
    try {
        const response = await fetch(`http://localhost:3000/weather/windrichting?lat=${lat}&lon=${lon}`);
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const data = await response.json();
        return data.wind_direction_deg;
    } catch (error) {
        console.error("Error fetching wind direction:", error);
        return 0; // Default direction if fetch fails
    }
}
/**
 * Haalt windsnelheid bij je backend op
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<number>} m/s
 */
export async function fetchWindSpeed(lat = 50.8798, lon = 4.7005) {  //default
  const res = await fetch(`http://localhost:3000/weather/windkracht?lat=${lat}&lon=${lon}`);
  if (!res.ok) throw new Error('Failed to fetch wind speed');
  const json = await res.json();
  return json.wind_speed_m_s;
}

const ETA_BY_BLADES = { 0:0.0, 1:0.25, 2:0.35, 3:0.45, 4:0.50, 5:0.52 };
/**
 * Bereken specifiek wind-energie­vermogen uit snelheid.
 * ρ  = luchtdichtheid (kg/m³) – default 1.225
 * η  = totaal rendement (0-1) – default 0.40
 * @param {number} v          windsnelheid (m/s)
 * @param {number} blades     aantal wieken (1-5)
 * @param {number} rho        lucht­dichtheid (kg/m³) – default 1.225
 * @returns {number}          kWh per m² per uur
 */
export function calcWindPowerKwh(v, blades = 3, rho = 1.225) {
  const eta   = ETA_BY_BLADES[blades] ?? 0.45;     // fallback 3-blads
  const watts = 0.5 * rho * eta * v ** 3;          // W per m²
  return +(watts / 1_000);              // kWh/m²/u
}

/**
 * Zelfde berekening maar in Wh/m²/u i.p.v. kWh.
 * @param {number} v       windsnelheid (m/s)
 * @param {number} blades  aantal wieken (1-5)
 * @param {number} rho     luchtdichtheid (kg/m³)
 * @returns {number}       Wh per m² per uur
 */
export function calcWindPowerWh(v, blades = 3, rho = 1.225) {
  return calcWindPowerKwh(v, blades, rho) * 1000;    // 1 kWh = 1000 Wh
}

/**
 * Windspecifiek vermogen ⇒ totaal Wh per TURBINE per uur.
 * @param {number} v       windsnelheid (m/s)
 * @param {number} blades  aantal wieken (1-5)
 * @param {number} rho     luchtdichtheid (kg/m³) – default 1.225
 * @returns {number}       Wh per uur (totaal voor deze turbine)
 */
export function calcWindPowerWhTurbine(v, blades = 3, rho = 1.225) {
  const eta   = ETA_BY_BLADES[blades] ?? 0.45;       // rendement
  const wPerM2 = 0.5 * rho * eta * v ** 3;           // W/m²
  const watts  = wPerM2 * ROTOR_AREA;                // W ( = Wh/u )
  return watts;                                      // Wh per uur
}
/**
 * Pas windsnelheid aan op yaw-mismatch Δ (graden).
 * v_eff = v · cos(Δ)   (Δ van 0 – 180 °)
 */
export function yawAdjustedSpeed(v, deltaDeg) {
  const f = Math.cos(Math.abs(deltaDeg) * Math.PI / 180);
  return v * Math.max(f, 0);       // nooit negatief
}
/**
 * Kleinste hoek tussen twee richtingen a en b (graden)
 * retourneert altijd 0-180°
 */
export function angularDiffDeg(a, b) {
  return Math.abs((((a - b) % 360) + 540) % 360 - 180);
}