const express = require('express');
const axios = require('axios');
const energyDataService = require('../service/energyDataService');
const middleware = require('../util/middleware');


const router = express.Router();

router.post('/', async (req, res) => {
    try {
        const energyData = await energyDataService.create(req.body);
        res.status(200).json({ message: 'Energy data created', energyData });
    } catch (error) {
        console.error('Error creating energy data:', error);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({ error: error.message });
    }
});
/**
 * GET /windkracht?lat=...&lon=...
 * Haalt windsnelheid en windkracht (Beaufort) op voor gegeven coördinaten.
 */
//TODO logs straks verwijderen

router.get('/windkracht', async (req, res) => {
    const { lat, lon } = req.query;
    console.log('Windkracht endpoint aangeroepen');
    console.log('lat:', lat, 'lon:', lon);
    const apiKey = process.env.OPENWEATHER_API_KEY;

    if (!lat || !lon) {
        return res.status(400).json({ error: 'Geef zowel latitude (lat) als longitude (lon) mee in de query.' });
    }

    try {
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
        const response = await axios.get(url);

        const windSpeed = response.data?.wind?.speed;
        console.log('Full API response:', response.data);
        if (windSpeed === undefined) {
            return res.status(500).json({ error: 'Kon windsnelheid niet ophalen.' });
        }

        const thresholds = [0.3, 1.5, 3.3, 5.4, 7.9, 10.7, 13.8, 17.1, 20.7, 24.4, 28.4, 32.6];
        const beaufort = thresholds.findIndex(t => windSpeed < t);

        console.log('WindSpeed:', windSpeed);
        console.log('Beaufort:', beaufort === -1 ? 12 : beaufort);

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
 * GET /windrichting?lat=...&lon=...
 * Haalt windrichting op in graden en tekstuele richting.
 */
router.get('/windrichting', async (req, res) => {
    const { lat, lon } = req.query;
    console.log('Windrichting endpoint aangeroepen');
    console.log('lat:', lat, 'lon:', lon);
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

        // Richting bepalen
        const richtingen = ["N", "NO", "O", "ZO", "Z", "ZW", "W", "NW"];
        const index = Math.round(degrees / 45) % 8;
        const richting = richtingen[index];

        console.log('Windrichting:', degrees, '° →', richting);

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
router.get('/:groupId', async (req, res) => {
    try {
        const energyData = await energyDataService.getAllByGroup(req.params.groupId);
        res.status(200).json(energyData);
    } catch (error) {
        console.error(`Error fetching energy data for group ${req.params.groupId}:`, error);
        const statusCode = error.statusCode || 500;
        res.status(statusCode).json({ error: error.message });
    }
});

module.exports = router;