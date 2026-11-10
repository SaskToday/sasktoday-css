$(document).ready(function() {
    // Find the first GAM unit for the Community Badge Move
    var $firstWidget = $('.sc-community-badge-ad-unit').first();

    // Move it to the very top of #details-body
    $('#details-body').prepend($firstWidget);
});
