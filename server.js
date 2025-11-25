const express = require('express');
const path = require('path');
const { v4: uuidv4 } = require('uuid'); // Library to generate unique IDs
const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory storage for secrets
// Note: On Render free tier, if the server restarts (sleeps), these are lost.
const secrets = new Map();

// 1. API to Create a Secret
app.post('/api/create', (req, res) => {
    const { text } = req.body;
    
    if (!text) {
        return res.status(400).json({ error: 'Text is required' });
    }

    const id = uuidv4(); // Generate unique ID like "a1b2-c3d4..."
    secrets.set(id, text);
    
    // Return the full URL to the client
    const protocol = req.protocol;
    const host = req.get('host');
    const secretUrl = `${protocol}://${host}/view/${id}`;

    res.json({ url: secretUrl });
});

// 2. Route to VIEW the secret (One-time only)
app.get('/view/:id', (req, res) => {
    const id = req.params.id;

    if (secrets.has(id)) {
        // 1. Retrieve the secret
        const secretMessage = secrets.get(id);
        
        // 2. DELETE the secret immediately (Self-destruct)
        secrets.delete(id);

        // 3. Send an HTML page displaying the secret
        res.send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Top Secret</title>
                <style>
                    body { background: #1a1a1a; color: #0f0; font-family: monospace; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
                    .container { border: 2px solid #0f0; padding: 40px; max-width: 600px; text-align: center; box-shadow: 0 0 20px #0f0; }
                    h1 { margin-top: 0; }
                    .message { font-size: 24px; margin: 20px 0; word-wrap: break-word; }
                    .warning { color: #ff4444; font-size: 14px; margin-top: 30px; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>CONFIDENTIAL MESSAGE</h1>
                    <div class="message">${secretMessage}</div>
                    <div class="warning">⚠️ This message has been destroyed. If you reload, it will be gone forever.</div>
                </div>
            </body>
            </html>
        `);
    } else {
        // Secret does not exist or was already viewed
        res.status(404).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Gone</title>
                <style>
                    body { background: #000; color: #555; font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; }
                    h1 { font-size: 40px; }
                </style>
            </head>
            <body>
                <h1>404 | Message not found or already destroyed.</h1>
            </body>
            </html>
        `);
    }
});

app.listen(port, () => {
    console.log(`Secret server running on port ${port}`);
});
