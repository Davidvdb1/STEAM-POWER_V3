/**
 * Geeft { lat, lon } terug op basis van een straat + stad + postcode.
 * We gebruiken de openbare Nominatim-API van OpenStreetMap.
 */
export async function geocodeAddress(street, city, postal) {
    const url = `https://nominatim.openstreetmap.org/search` +
                `?street=${encodeURIComponent(street)}` +
                `&city=${encodeURIComponent(city)}` +
                `&postalcode=${encodeURIComponent(postal)}` +
                `&format=json&limit=1`;

    try {
        const res = await fetch(url, {
            // Een User-Agent header voorkomt dat Nominatim je request weigert
            headers: { "User-Agent": "Steam-Power-Sim/1.0 (https://example.com)" }
        });
        if (!res.ok) throw new Error(res.statusText);

        const data = await res.json();
        if (!data.length) throw new Error("Geen coördinaten gevonden");

        return {
            lat:  parseFloat(data[0].lat),
            lon:  parseFloat(data[0].lon)
        };
    } catch (err) {
        console.error("Geocode-fout:", err);
        // Fallback: Leuven
        return { lat: 50.8798, lon: 4.7005 };
    }
}
