const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from the 'public' directory

app.post('/submit', (req, res) => {
    const formData = req.body;

    fs.readFile('../dataFiles/businesses.json', (err, data) => {
        let json = [];
        if (!err) {
            json = JSON.parse(data);
        }
        json.push(formData);

        fs.writeFile('data.json', JSON.stringify(json, null, 2), (err) => {
            if (err) {
                res.status(500).json({ error: 'Failed to save data' });
            } else {
                res.json({ message: 'Data saved successfully' });
            }
        });
    });
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
