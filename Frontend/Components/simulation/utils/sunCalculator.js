import SunCalc from '../solar.js';

/**
 * Gets the sun position for a location and updates scene elements accordingly
 * @param {string} street - Street address
 * @param {string} city - City name
 * @param {string} postal - Postal code
 * @param {Date} date - Date to calculate sun position for
 * @returns {Promise<{azimuth: number, altitude: number}>} The sun's position
 */
export async function getSunPosition(street, city, postal, date = new Date()) {
    try {
        return await SunCalc.getSolarPositionForLocation(street, city, postal, date);
    } catch (error) {
        console.error("Error getting sun position:", error);
        // Default values if calculation fails
        return { azimuth: 0, altitude: Math.PI / 4 };
    }
}

/**
 * Converts sun position (azimuth, altitude) to cartesian coordinates
 * @param {number} azimuth - The sun's azimuth angle
 * @param {number} altitude - The sun's altitude angle
 * @param {number} distance - Distance from origin
 * @returns {BABYLON.Vector3} Cartesian coordinates
 */
export function sunPositionToCartesian(azimuth, altitude, distance = 4) {
    const x = Math.cos(altitude) * Math.sin(azimuth);
    const y = Math.sin(altitude);
    const z = Math.cos(altitude) * Math.cos(azimuth);
    
    return new BABYLON.Vector3(x * distance, y * distance, z * distance);
}
