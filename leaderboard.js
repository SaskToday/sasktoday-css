/* Script for ad leader-board container on top */

$(document).ready(function () {
    // Define the interval duration and stop time
    const intervalDuration = 100; // Check every 100ms
    const stopAfter = 10000; // Stop after 10 seconds (10,000ms)

    let elapsedTime = 0;

    const interval = setInterval(function () {
        // Check if the span element has the class "slot-fixed"
        if ($("#leaderboard-container > div > span").hasClass("slot-fixed")) {
            $("header").css("z-index", 17);
        }

        // Increment elapsed time and stop the interval after a certain time
        elapsedTime += intervalDuration;
        if (elapsedTime >= stopAfter) {
            clearInterval(interval);
        }
    }, intervalDuration);
});
