const User = require('../model/userModel');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { promisify } = require('util');

const scryptAsync = promisify(crypto.scrypt);

function getJwtSecret() {
    const secret = process.env.JWT_SECRET;
    if (!secret || secret === 'your_jwt_secret_key') {
        throw new Error('JWT_SECRET is missing or still using the example value. Set a strong secret in .env.');
    }
    return secret;
}

function createToken(user) {
    return jwt.sign(
        { id: user._id.toString(), email: user.email },
        getJwtSecret(),
        { expiresIn: process.env.JWT_EXPIRES_IN || '1h' }
    );
}

async function hashPassword(password) {
    const salt = crypto.randomBytes(16).toString('hex');
    const derivedKey = await scryptAsync(password, salt, 64);
    return `${salt}:${derivedKey.toString('hex')}`;
}

async function verifyPassword(password, storedHash) {
    // Supports older accounts created before password hashing was added.
    // Remove this legacy comparison after migrating existing plaintext passwords.
    if (!storedHash || !storedHash.includes(':')) {
        return password === storedHash;
    }

    const [salt, key] = storedHash.split(':');
    const derivedKey = await scryptAsync(password, salt, 64);
    const storedKey = Buffer.from(key, 'hex');

    return storedKey.length === derivedKey.length &&
        crypto.timingSafeEqual(storedKey, derivedKey);
}

async function registerUser(req, res) {
    try {
        const { name, email, password } = req.body || {};

        if (!name || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide name, email and password.'
            });
        }

        if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string') {
            return res.status(400).json({ success: false, message: 'All fields must be strings.' });
        }

        if (password.length < 8) {
            return res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const existingUser = await User.findOne({ email: normalizedEmail });

        if (existingUser) {
            return res.status(409).json({ success: false, message: 'User already exists. Please log in.' });
        }

        const hashedPassword = await hashPassword(password);
        const user = await User.create({
            name: name.trim(),
            email: normalizedEmail,
            password: hashedPassword
        });

        const token = createToken(user);

        return res.status(201).json({
            success: true,
            message: 'User registered successfully.',
            token,
            tokenType: 'Bearer',
            expiresIn: process.env.JWT_EXPIRES_IN || '1h',
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Registration error:', error);

        if (error.code === 11000) {
            return res.status(409).json({ success: false, message: 'Email is already registered.' });
        }

        if (error.message.includes('JWT_SECRET')) {
            return res.status(500).json({ success: false, message: error.message });
        }

        return res.status(500).json({ success: false, message: 'Error registering user.' });
    }
}

async function loginUser(req, res) {
    try {
        const { email, password } = req.body || {};

        if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
            return res.status(400).json({ success: false, message: 'Please provide a valid email and password.' });
        }

        const user = await User.findOne({ email: email.trim().toLowerCase() });

        if (!user || !(await verifyPassword(password, user.password))) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        const token = createToken(user);

        return res.status(200).json({
            success: true,
            message: 'Login successful.',
            token,
            tokenType: 'Bearer',
            expiresIn: process.env.JWT_EXPIRES_IN || '1h',
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        if (error.message.includes('JWT_SECRET')) {
            return res.status(500).json({ success: false, message: error.message });
        }
        return res.status(500).json({ success: false, message: 'Error logging in.' });
    }
}

module.exports = { registerUser, loginUser };
