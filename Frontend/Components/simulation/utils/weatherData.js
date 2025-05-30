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
