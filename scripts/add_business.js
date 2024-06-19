const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// Middleware to parse application/json
app.use(bodyParser.json());

// Serve static files (CSS, images, etc.)
app.use(express.static(path.join(__dirname, 'public')));

// Endpoint to handle form submission
app.post('/submit-form', (req, res) => {
    const formData = req.body;

    // Read existing JSON data from file
    let rawData = fs.readFileSync('businesses.json');
    let businesses = JSON.parse(rawData);

    // Append new data to businesses array
    businesses.push({
        title: formData.text1,
        description: formData.text4,
        image: formData.imageLink,
        address: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zip}`,
        type: ''  // Assuming you may want to populate this later
    });

    // Write updated data back to JSON file
    fs.writeFileSync('businesses.json', JSON.stringify(businesses, null, 2));

    // Respond with success message
    res.send('Form data saved successfully.');
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
