// This file stays on Vercel's servers - users NEVER see this
const fetch = require('node-fetch');

// Your webhook URL stored as environment variable in Vercel
const DISCORD_WEBHOOK = process.env.DISCORD_WEBHOOK;

// Optional: Add an API key for authentication
const API_KEY = process.env.API_KEY || 'your-secret-api-key';

module.exports = async (req, res) => {
    // Enable CORS if needed
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    
    // Handle OPTIONS request for CORS
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // Only allow POST requests
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    // Check API key
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${API_KEY}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }
    
    try {
        const { content, username, avatar_url, embeds } = req.body;
        
        // Build Discord webhook payload
        const payload = {};
        
        if (content) payload.content = content;
        if (username) payload.username = username;
        if (avatar_url) payload.avatar_url = avatar_url;
        if (embeds) payload.embeds = embeds;
        
        // Send to Discord
        const response = await fetch(DISCORD_WEBHOOK, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload)
        });
        
        if (response.ok) {
            return res.status(200).json({ success: true });
        } else {
            const error = await response.text();
            return res.status(response.status).json({ 
                success: false, 
                error: 'Discord API error',
                details: error
            });
        }
        
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ 
            success: false, 
            error: 'Internal server error' 
        });
    }
};
