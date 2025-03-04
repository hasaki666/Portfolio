const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs').promises;

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    next();
});

const fileDisplay = async (url) => {
    try {
        const files = await fs.readdir(url);
        // Ensure files is an array before sorting
        return Array.isArray(files) ? files.sort((a, b) => a.length - b.length) : [];
    } catch (error) {
        console.error(`Error reading directory ${url}:`, error);
        return []; // Always return an empty array on error
    }
};

app.get('/api', async (req, res) => {
    const assetPath = './assets/img';
    const url = req.query.url;

    // Validate url parameter
    if (!url || typeof url !== 'string') {
        return res.status(400).json({ error: 'Missing or invalid "url" parameter in the query string.' });
    }

    const fullPath = `${assetPath}/${url}`;

    try {
        const arr = await fileDisplay(fullPath);

        // If no files found, return an empty array
        if (!Array.isArray(arr) || arr.length === 0) {
            return res.json([]);
        }

        const allFile = [];

        for (const element of arr) {
            if (!element || typeof element !== 'string') continue; // Skip invalid elements

            const subPath = `${fullPath}/${element}`;
            const fileList = await fileDisplay(subPath);

            if (Array.isArray(fileList) && fileList.length > 0) {
                const previewFile = fileList.find(fi => fi.includes('index'));
                const detailFiles = fileList
                    .filter(fi => !fi.includes('index'))
                    .map(fi => `${subPath}/${fi}`);

                allFile.push({
                    id: allFile.length + 1,
                    previewFile: previewFile ? `${subPath}/${previewFile}` : null,
                    detailFiles
                });
            }
        }

        res.json(allFile);
    } catch (error) {
        console.error('Error processing request:', error);
        res.status(500).json({ error: `Internal Server Error: ${error.message}` });
    }
});

app.listen(9000, () => {
    console.log('Server started on port 9000');
});