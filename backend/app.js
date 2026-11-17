require('dotenv').config();
// Force restart
const express = require('express')
const cors = require('cors');
const cookieParser = require('cookie-parser');
const app = express()
const port = 3001
const host = process.env.HOST || '0.0.0.0';
const routes = require('./routes')

const localOrigin = 'http://localhost:3000';

app.set('trust proxy', 1); // trust first proxy

const allowedOrigins = [localOrigin];
if (process.env.FRONTEND_URL) {
    allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true
}));

const path = require('path');
// ...
app.use(express.json())
app.use(express.urlencoded({ extended: true })); // Handle URL-encoded bodies for simple forms
app.use(cookieParser());
app.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
app.use('/api', routes);

app.listen(port, host, () => {
    console.log(`Ruang Ayah App listening on ${host}:${port}`)
    console.log(`CORS Policy allows origins: ${allowedOrigins.join(', ')}`)
})
