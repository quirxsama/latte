#!/usr/bin/env node

/**
 * Security Secret Generator
 * Generates cryptographically secure secrets for JWT and session management
 */

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

// Generate secure random secrets
const generateSecret = (length = 64) => {
  return crypto.randomBytes(length).toString('hex');
};

// Generate multiple secrets
const secrets = {
  JWT_SECRET: generateSecret(64),
  SESSION_SECRET: generateSecret(64),
  ENCRYPTION_KEY: generateSecret(32),
  API_KEY: generateSecret(32)
};

console.log('🔐 Generated Secure Secrets:');
console.log('================================');
console.log();

Object.entries(secrets).forEach(([key, value]) => {
  console.log(`${key}=${value}`);
});

console.log();
console.log('📋 Copy these to your .env file');
console.log('⚠️  NEVER commit these secrets to version control!');
console.log();

// Optionally write to a secure file
const secretsFile = path.join(__dirname, '..', '.env.secrets');
const envContent = Object.entries(secrets)
  .map(([key, value]) => `${key}=${value}`)
  .join('\n');

try {
  fs.writeFileSync(secretsFile, envContent + '\n');
  console.log(`✅ Secrets written to: ${secretsFile}`);
  console.log('📝 Add this file to your .gitignore');
} catch (error) {
  console.error('❌ Failed to write secrets file:', error.message);
}

console.log();
console.log('🛡️  Security Best Practices:');
console.log('- Use different secrets for development and production');
console.log('- Rotate secrets regularly (every 90 days)');
console.log('- Store production secrets in secure environment variables');
console.log('- Never log or expose secrets in application code');
console.log('- Use environment-specific .env files (.env.development, .env.production)');
