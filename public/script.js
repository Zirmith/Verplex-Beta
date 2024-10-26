// Fetch schedule information and update display
fetch('/api/schedule')
    .then(response => response.json())
    .then(schedule => {
        // Convert 24-hour times to 12-hour format with AM/PM
        function formatTime(time) {
            let [hours, minutes] = time.split(':').map(Number);
            let period = hours >= 12 ? 'PM' : 'AM';
            hours = hours % 12 || 12;  // Convert to 12-hour format, making sure 0 becomes 12
            return `${hours}:${String(minutes).padStart(2, '0')} ${period}`;
        }

        const startTimeFormatted = formatTime(schedule.startTime);
        const stopTimeFormatted = formatTime(schedule.stopTime);
        
        const scheduleInfo = `Online from ${startTimeFormatted} to ${stopTimeFormatted} (${schedule.timezone})`;
        document.getElementById('schedule-info').textContent = scheduleInfo;

        // Check if bot is overdue
        const [startHours, startMinutes] = schedule.startTime.split(':').map(Number);
        const now = new Date();
        const currentHours = now.getHours();
        const currentMinutes = now.getMinutes();

        // Calculate time until the bot goes online
        const startTime = new Date(now);
        startTime.setHours(startHours, startMinutes, 0, 0); // Set to today at start time

        if (currentHours > startHours || (currentHours === startHours && currentMinutes >= startMinutes)) {
            // Now past the start time
            overdueCheck(schedule);
        } else {
            // Calculate the remaining time until the bot goes online
            const timeDiff = startTime - now; // Difference in milliseconds
            updateCountdown(timeDiff);
        }
    });

// Update countdown display
function updateCountdown(timeDiff) {
    const totalSeconds = Math.ceil(timeDiff / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const countdownText = `Time until next event: ${hours}h ${minutes}m ${seconds}s`;
    document.getElementById('countdown').textContent = countdownText;

    // Repeat countdown update every second
    setTimeout(() => {
        const updatedTimeDiff = timeDiff - 1000; // Reduce by 1 second
        if (updatedTimeDiff > 0) {
            updateCountdown(updatedTimeDiff);
        } else {
           
            updateStatus(); // Refresh the status
        }
    }, 1000);
}

// Check if the bot is overdue
function overdueCheck(schedule) {
    fetch('/api/bot/status')
        .then(response => response.json())
        .then(status => {
            if (!status.isOnline) {
                document.getElementById('status-info').textContent = "The bot is overdue!";
            } else {
                const statusText = "Verplex is currently online.";
                document.getElementById('status-info').textContent = statusText;
            }
        });
}

// Fetch and update bot status
function updateStatus() {
    fetch('/api/bot/status')
        .then(response => response.json())
        .then(status => {
            const statusText = status.isOnline ? "Verplex is currently online." : "Verplex is currently offline.";
            document.getElementById('status-info').textContent = statusText;

            // Add Anime.js animation for status update
            anime({
                targets: '#status-info',
                scale: [0.9, 1],
                duration: 500,
                easing: 'easeInOutQuad',
            });
        });
}

updateStatus();
setInterval(updateStatus, 30000);
