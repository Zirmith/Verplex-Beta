const mineflayer = require('mineflayer');
const { pathfinder, Movements, goals } = require('mineflayer-pathfinder');
const pvp = require('mineflayer-pvp').plugin;
const schedule = require('node-schedule');
require('dotenv').config();

let bot;
let isOnline = false;

// Convert time string in HH:MM format to hours and minutes
function convertTo24Hour(timeStr) {
    const parts = timeStr.split(':');
    if (parts.length !== 2) {
        console.error(`Invalid time format: ${timeStr}. Expected format: HH:MM`);
        return { hours: 0, minutes: 0 }; // Default to 00:00 if format is invalid
    }

    const [hours, minutes] = parts.map(Number);
    
    // Validate hours and minutes
    if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
        console.error(`Invalid time value: ${timeStr}. Hours must be 0-23 and minutes must be 0-59.`);
        return { hours: 0, minutes: 0 };
    }

    return { hours, minutes };
}

// Create the bot
function createBot() {
    bot = mineflayer.createBot({
        host: process.env.MC_HOST,
        port: parseInt(process.env.MC_PORT, 10),
        username: process.env.MC_USERNAME,
        password: process.env.MC_PASSWORD, // Ensure this is valid or remove if unnecessary
        auth: process.env.MC_AUTH || 'microsoft'
    });

    bot.loadPlugin(pathfinder);
    bot.loadPlugin(pvp);

    bot.on('spawn', () => {
        console.log('Verplex is online!');
        isOnline = true;
    });

    bot.on('end', () => {
        console.log('Verplex has disconnected.');
        isOnline = false;
    });

    bot.on('error', (err) => {
        console.error('Error occurred:', err);
    });
}

// Start and stop functions for the bot
function startBot() {
    if (!isOnline) {
        console.log('Starting bot...');
        createBot();
    } else {
        console.log('Bot is already online.');
    }
}

function stopBot() {
    if (isOnline) {
        console.log('Stopping bot...');
        bot.quit();
        isOnline = false;
    } else {
        console.log('Bot is already offline.');
    }
}

// Schedule Verplex’s operation based on environment variables
const { hours: startHours, minutes: startMinutes } = convertTo24Hour(process.env.START_TIME);
const { hours: stopHours, minutes: stopMinutes } = convertTo24Hour(process.env.STOP_TIME);
const timezone = process.env.TIMEZONE;

// Log scheduled times
console.log(`Scheduled to start at ${startHours}:${String(startMinutes).padStart(2, '0')} (${timezone})`);
console.log(`Scheduled to stop at ${stopHours}:${String(stopMinutes).padStart(2, '0')} (${timezone})`);

// Countdown function
function startCountdown(action, hours, minutes) {
    const now = new Date();
    const targetTime = new Date();
    targetTime.setHours(hours, minutes, 0, 0); // Set target time to the specified hour and minute

    const countdownInterval = setInterval(() => {
        const currentTime = new Date();
        const remainingTime = targetTime - currentTime;

        if (remainingTime <= 0) {
            clearInterval(countdownInterval);
            console.log(`${action} executed at ${new Date().toLocaleString('en-US', { timeZone: timezone })}`);
            if (action === 'Start') {
                startBot();
            } else {
                stopBot();
            }
            return;
        }

        const seconds = Math.floor((remainingTime / 1000) % 60);
        const minutes = Math.floor((remainingTime / 1000 / 60) % 60);
        const hours = Math.floor((remainingTime / (1000 * 60 * 60)) % 24);

        console.log(`${action} in ${hours}h ${minutes}m ${seconds}s`);
    }, 1000); // Update every second
}

// Scheduling jobs
schedule.scheduleJob(
    { hour: startHours, minute: startMinutes, tz: timezone },
    () => {
        startCountdown('Start', startHours, startMinutes);
    }
);

schedule.scheduleJob(
    { hour: stopHours, minute: stopMinutes, tz: timezone },
    () => {
        startCountdown('Stop', stopHours, stopMinutes);
    }
);

// Watcher function to always check the current time against the scheduled times
setInterval(() => {
    const now = new Date();
    const currentHours = now.getHours();
    const currentMinutes = now.getMinutes();

    // Check if it's time to start the bot
    if (currentHours === startHours && currentMinutes === startMinutes && !isOnline) {
        startCountdown('Start', startHours, startMinutes);
    }

    // Check if it's time to stop the bot
    if (currentHours === stopHours && currentMinutes === stopMinutes && isOnline) {
        startCountdown('Stop', stopHours, stopMinutes);
    }
}, 60000); // Check every minute

// Export functions for use in server.js
module.exports = { isOnline, startBot, stopBot };
