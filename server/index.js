const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const contactRoutes = require('./routes/contactRoutes');
const messagingRoutes = require('./routes/messagingRoutes');
const mediaRoutes = require('./routes/mediaRoutes');
const {generateUserToken} = require('./utils/getStreamUtils');

const app = express();
require('dotenv').config();
app.use(bodyParser.json());

// Routes
app.use('/auth', authRoutes);
app.use('/contacts', contactRoutes);
app.use('/messages', messagingRoutes);
app.use('/media', mediaRoutes);

// Twilio Token Route
app.get('/token', (req, res) => {
    const { userID } = req.query;

    if (!userID) {
        return res.status(400).send('Identity is required');
    }

    try {
        const token = generateUserToken(userID);
        res.json({ token });
    } catch (error) {
        console.error('Error generating user token:', error);
        res.status(500).json({ error: 'Failed to generate token', details: error.message });
    }
})

// Health Check Route
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date(),
    });
});


// Server Initialization
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));