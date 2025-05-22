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
 * GET /weather/regen?lat=...&lon=...
 * Haalt hoeveelheid regen op van de afgelopen 1 of 3 uur en interpreteert de intensiteit.
 */
router.get('/regen', async (req, res) => {
    const { lat, lon } = req.query;
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!lat || !lon) {
        return res.status(400).json({ error: 'Geef zowel latitude (lat) als longitude (lon) mee in de query.' });
    }

    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        const response = await axios.get(url);
        const data = response.data;

        const regen1u = data?.rain?.['1h'] ?? 0;
        const regen3u = data?.rain?.['3h'] ?? 0;

        // Interpretatie van intensiteit
        let intensiteit;
        if (regen1u === 0) intensiteit = 'geen';
        else if (regen1u <= 2.5) intensiteit = 'licht';
        else if (regen1u <= 7.6) intensiteit = 'matig';
        else intensiteit = 'hevige regen';

        res.json({
            latitude: lat,
            longitude: lon,
            regen_mm_1u: regen1u,
            regen_mm_3u: regen3u,
            intensiteit
        });
    } catch (error) {
        console.error('Fout bij ophalen regenhoeveelheid:', error);
        res.status(500).json({ error: 'Interne fout bij ophalen regenhoeveelheid.' });
    }
});

module.exports = router;