const axios = require('axios');

const apiClient = axios.create({
    baseURL: process.env.BACKEND_API_URL || 'http://localhost:5000/api/internal/ussd',
    headers: {
        'Content-Type': 'application/json',
        'x-ussd-secret': process.env.USSD_SECRET
    }
});

module.exports = apiClient;
