const express = require("express");
const axios = require("axios");
const path = require("path");

const app = express();
const PORT = 3000;

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/api/lokasi", async (req, res) => {
    const kota = req.query.kota;
    if (!kota) return res.status(400).json({ message: "Masukkan nama lokasi" });

    const apiKey = "dZTH3fXf1nmwRv4HcgEB"; 
    const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(kota)}.json?key=${apiKey}`;

    try {
        const response = await axios.get(url);
        const data = response.data;

        if (!data.features || data.features.length === 0) {
            return res.status(404).json({ message: "Lokasi tidak ditemukan" });
        }

        const place = data.features[0];
        let negara = "-", provinsi = "-", kecamatan = "-";

        if (place.context) {
            place.context.forEach(ctx => {
                const id = ctx.id.toLowerCase();
                if (id.includes('country')) negara = ctx.text;
                if (id.includes('region') || id.includes('province')) provinsi = ctx.text;
                if (id.includes('county') || id.includes('subdistrict') || id.includes('locality')) {
                    kecamatan = ctx.text;
                }
            });
        }

        if (negara === '-' && place.place_type.includes('country')) negara = place.text;
        if (provinsi === '-' && place.place_type.includes('region')) provinsi = place.text;
        if (kecamatan === "-") kecamatan = place.text || kota;

        res.json({
            negara: negara,
            provinsi: provinsi,
            kecamatan: kecamatan,
            longitude: place.geometry.coordinates[0],
            latitude: place.geometry.coordinates[1]
        });

    } catch (error) {
        console.error("Detail Error:", error.response?.data || error.message);
        res.status(500).json({ message: "Gagal mengambil data dari MapTiler" });
    }
});

app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});