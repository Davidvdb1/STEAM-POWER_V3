const express = require('express');
const axios = require('axios');

const router = express.Router();

/**
 * GET /weather/windkracht?lat=...&lon=...
 */
router.get('/windkracht', async (req, res) => {
    const { lat, lon } = req.query;
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!lat || !lon) {
        return res.status(400).json({ error: 'Geef zowel latitude (lat) als longitude (lon) mee in de query.' });
    }

    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        const response = await axios.get(url);
        const windSpeed = response.data?.wind?.speed;

        if (windSpeed === undefined) {
            return res.status(500).json({ error: 'Kon windsnelheid niet ophalen.' });
        }

        const thresholds = [0.3, 1.5, 3.3, 5.4, 7.9, 10.7, 13.8, 17.1, 20.7, 24.4, 28.4, 32.6];
        const beaufort = thresholds.findIndex(t => windSpeed < t);

        res.json({
            latitude: lat,
            longitude: lon,
            wind_speed_m_s: windSpeed,
            beaufort: beaufort === -1 ? 12 : beaufort
        });
    } catch (error) {
        console.error('Fout bij ophalen windkracht:', error);
        res.status(500).json({ error: 'Interne fout bij ophalen windkracht.' });
    }
});

/**
 * GET /weather/windrichting?lat=...&lon=...
 */
router.get('/windrichting', async (req, res) => {
    const { lat, lon } = req.query;
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!lat || !lon) {
        return res.status(400).json({ error: 'Geef zowel latitude (lat) als longitude (lon) mee in de query.' });
    }

    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        const response = await axios.get(url);
        const degrees = response.data?.wind?.deg;

        if (degrees === undefined) {
            return res.status(500).json({ error: 'Kon windrichting niet ophalen.' });
        }

        const richtingen = ["N", "NO", "O", "ZO", "Z", "ZW", "W", "NW"];
        const index = Math.round(degrees / 45) % 8;
        const richting = richtingen[index];

        res.json({
            latitude: lat,
            longitude: lon,
            wind_direction_deg: degrees,
            wind_direction_text: richting
        });
    } catch (error) {
        console.error('Fout bij ophalen windrichting:', error);
        res.status(500).json({ error: 'Interne fout bij ophalen windrichting.' });
    }
});
/**
 * GET /weather/regen?lat=...&lon=...&uren=6 (uren is optioneel, standaard = 1)
 * Haalt totale regenhoeveelheid op van de afgelopen X uur (max 48 uur terug) via One Call API 3.0.
 * Als men het aantal uren niet opgeeft, wordt standaard 1 uur gebruikt.
 * vb:
 * http://localhost:3000/weather/regen?lat=45.53&lon=10.04&uren=6
 * of http://localhost:3000/weather/regen?lat=45.53&lon=10.04
 */
router.get('/regen', async (req, res) => {
    const { lat, lon } = req.query;
    const apiKey = process.env.OPENWEATHER_API_KEY;

    // Optionele parameter: standaard = 1
    const urenAantal = parseInt(req.query.uren || '1', 10);

    // Validatie
    if (!lat || !lon) {
        return res.status(400).json({ error: 'Geef zowel latitude (lat) als longitude (lon) mee in de query.' });
    }
    if (isNaN(urenAantal) || urenAantal <= 0 || urenAantal > 48) {
        return res.status(400).json({ error: 'Parameter "uren" moet een getal zijn tussen 1 en 48.' });
    }

    try {
        const url = `https://api.openweathermap.org/data/3.0/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        const response = await axios.get(url);
        const hourly = response.data?.hourly;

        if (!hourly || hourly.length < urenAantal) {
            return res.status(500).json({ error: `Niet genoeg uurlijkse data beschikbaar (${hourly.length}u).` });
        }

        const geselecteerdeUren = hourly.slice(0, urenAantal);

        const totaalRegen = geselecteerdeUren.reduce((totaal, uur) => {
            return totaal + (uur.rain?.['1h'] ?? 0);
        }, 0);

        // Simpele intensiteitsclassificatie
        let intensiteit;
        if (totaalRegen === 0) intensiteit = 'geen';
        else if (totaalRegen <= urenAantal) intensiteit = 'licht';
        else if (totaalRegen <= urenAantal * 2.5) intensiteit = 'matig';
        else intensiteit = 'hevige regen';

        res.json({
            latitude: lat,
            longitude: lon,
            uren: urenAantal,
            regen_mm: parseFloat(totaalRegen.toFixed(1)),
            intensiteit
        });
    } catch (error) {
        console.error('Fout bij ophalen regen:', error);
        res.status(500).json({ error: 'Interne fout bij ophalen regen.' });
    }
});

module.exports = router;