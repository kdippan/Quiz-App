#!/usr/bin/env node
/* scripts/dev.js - Development helper script */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting Quiz App in development mode...\n');

// Check if .env file exists
const fs = require('fs');
const envPath = path.join(__dirname, '../.env');

if (!fs.existsSync(envPath)) {
    console.log('⚠️  Warning: .env file not found!');
    console.log('📋 Please copy .env.example to .env and set your OPENROUTER_KEY\n');
}

// Start the development server
const serverProcess = spawn('npm', ['run', 'start'], {
    stdio: 'inherit',
    shell: true,
    cwd: path.join(__dirname, '..')
});

serverProcess.on('close', (code) => {
    console.log(`\n🔴 Server exited with code ${code}`);
});

// Handle cleanup
process.on('SIGINT', () => {
    console.log('\n🛑 Shutting down development server...');
    serverProcess.kill('SIGINT');
    process.exit(0);
});

process.on('SIGTERM', () => {
    serverProcess.kill('SIGTERM');
    process.exit(0);
});