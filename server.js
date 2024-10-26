const express = require('express');
require('dotenv').config()
const botRoutes = require('./routes/botRoutes');
const path = require('path');
const { startBot } = require('./bot/verplex'); // Import startBot function


const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/api/bot', botRoutes);

// Schedule API endpoint
app.get('/api/schedule', (req, res) => {
    res.json({
        startTime: process.env.START_TIME,
        stopTime: process.env.STOP_TIME,
        timezone: process.env.TIMEZONE
    });
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
