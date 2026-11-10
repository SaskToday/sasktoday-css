// Handle back/forward cache (bfcache) restoration
window.addEventListener('pageshow', function(event) {
    if (event.persisted) {
        // Page was restored from bfcache (back button)
        // Remove any existing spinner modals
        const existingSpinner = document.querySelector('div[style*="position: fixed"]');
        if (existingSpinner && existingSpinner.textContent.includes('Submitting your vote')) {
            existingSpinner.remove();
        }
        // Don't run auto-submit again
        return;
    }
});

// Function to show success banner
function showSuccessBanner() {
    // Check if banner already exists
    if (document.getElementById('poll-success-banner')) {
        return;
    }

    // Add CSS animation styles
    if (!document.getElementById('banner-animation-styles')) {
        const style = document.createElement('style');
        style.id = 'banner-animation-styles';
        style.textContent = `
            @keyframes slideUp {
                from {
                    transform: translateY(100%);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            @keyframes slideDown {
                from {
                    transform: translateY(0);
                    opacity: 1;
                }
                to {
                    transform: translateY(100%);
                    opacity: 0;
                }
            }
            .poll-details-your {
                color: #d34c00;
                font-weight: 700;
            }
        `;
        document.head.appendChild(style);
    }

    // Create banner
    const banner = document.createElement('div');
    banner.id = 'poll-success-banner';
    banner.style.cssText = `
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        background: #10b981;
        color: white;
        padding: 16px 20px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        font-family: Arial, sans-serif;
        animation: slideUp 0.4s ease-out;
    `;

    // Create message container
    const messageContainer = document.createElement('div');
    messageContainer.style.cssText = `
        display: flex;
        align-items: center;
        gap: 12px;
    `;

    // Create checkmark icon
    const checkmark = document.createElement('div');
    checkmark.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
    `;
    checkmark.style.display = 'flex';

    // Create message text
    const message = document.createElement('span');
    message.textContent = 'Your vote has been successfully submitted!';
    message.style.fontSize = '16px';
    message.style.fontWeight = '500';

    messageContainer.appendChild(checkmark);
    messageContainer.appendChild(message);

    // Create close button
    const closeButton = document.createElement('button');
    closeButton.innerHTML = '&times;';
    closeButton.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 28px;
        cursor: pointer;
        padding: 0;
        width: 32px;
        height: 32px;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.8;
        transition: opacity 0.2s;
    `;
    closeButton.onmouseover = () => closeButton.style.opacity = '1';
    closeButton.onmouseout = () => closeButton.style.opacity = '0.8';

    // Close banner function
    const closeBanner = () => {
        banner.style.animation = 'slideDown 0.3s ease-in';
        setTimeout(() => {
            banner.remove();
        }, 300);
    };

    closeButton.onclick = closeBanner;

    // Auto-close after 6 seconds
    setTimeout(closeBanner, 6000);

    // Assemble banner
    banner.appendChild(messageContainer);
    banner.appendChild(closeButton);
    document.body.appendChild(banner);
}

// Check if we're on a results page after submission
document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const pollPath = window.location.pathname;
    // Use the base poll path (without /vote) for the submission key
    const basePollPath = pollPath.replace(/\/vote$/, '');
    const submissionKey = 'autosubmit_' + basePollPath;

    console.log('=== POLL SUCCESS BANNER DEBUG ===');
    console.log('Current URL:', window.location.href);
    console.log('Poll path:', pollPath);
    console.log('Base poll path:', basePollPath);
    console.log('Submission key:', submissionKey);
    console.log('Session storage value:', sessionStorage.getItem(submissionKey));
    console.log('Is poll page:', window.location.pathname.includes('/polls/'));

    // Check if we should show the success banner
    // Only show on results page (without /vote) after auto-submit
    const isVotingPage = pollPath.endsWith('/vote');
    const isResultsPage = !isVotingPage && window.location.pathname.includes('/polls/');

    if (isResultsPage) {
        console.log('On results page, checking for auto-submit...');

        // Check if this is the results page (common indicators)
        const resultsElement = document.querySelector('.poll-results, .results, [class*="result"]');
        const hasResultsText = document.body.textContent.includes('Results') ||
                               document.body.textContent.includes('Thank you for voting') ||
                               document.body.textContent.includes('Thank you for your vote');
        const noRadioButtons = !document.querySelector('input[type="radio"]');
        const hasProgressBars = document.querySelector('.progress, [class*="progress"], [class*="bar"]');
        const hasPercentages = /%/.test(document.body.textContent);

        console.log('Results element found:', !!resultsElement);
        console.log('Has results text:', hasResultsText);
        console.log('No radio buttons:', noRadioButtons);
        console.log('Has progress bars:', !!hasProgressBars);
        console.log('Has percentages:', hasPercentages);

        // Only show banner if we auto-submitted AND this looks like a results page
        const wasAutoSubmitted = sessionStorage.getItem(submissionKey);
        const looksLikeResults = resultsElement || hasResultsText || noRadioButtons || (hasProgressBars && hasPercentages);

        console.log('Was auto-submitted:', !!wasAutoSubmitted);
        console.log('Looks like results:', looksLikeResults);

        if (wasAutoSubmitted && looksLikeResults) {
            console.log('✓ Showing success banner!');
            showSuccessBanner();

            // Smooth scroll to poll results section
            // Use requestAnimationFrame to ensure DOM is painted
            requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                    const pollResults = document.querySelector('.theme-green, .poll-details-option');
                    if (pollResults) {
                        // Find the parent container (the .theme-green div)
                        const resultsContainer = pollResults.classList.contains('theme-green')
                            ? pollResults
                            : pollResults.closest('.theme-green');

                        if (resultsContainer) {
                            console.log('Scrolling to poll results...');
                            resultsContainer.scrollIntoView({
                                behavior: 'smooth',
                                block: 'center'
                            });
                        }
                    }
                });
            });
        } else if (!wasAutoSubmitted) {
            console.log('✗ Not showing banner - no auto-submit detected');
        } else {
            console.log('✗ Not showing banner - results indicators not found');
        }
    } else if (isVotingPage) {
        console.log('✗ On voting page - banner will show after redirect to results');
    } else {
        console.log('✗ Not showing banner - not a poll page');
    }

    // Only run auto-submit on poll pages with the select parameter
    if (!window.location.pathname.includes('/polls/')) {
        return; // Exit if not a poll page
    }

    const selectedOption = urlParams.get('select');

    if (selectedOption) {
        // Use base poll path for the submission key (without /vote)
        const basePollPath = pollPath.replace(/\/vote$/, '');
        const submissionKey = 'autosubmit_' + basePollPath;

        // Check if we've already auto-submitted for this specific poll
        if (sessionStorage.getItem(submissionKey)) {
            // Already auto-submitted, silently exit
            return;
        }

        // Mark as auto-submitted FIRST (before anything else)
        sessionStorage.setItem(submissionKey, 'true');

        // Remove the query parameter from the URL to prevent infinite loop on back button
        const newUrl = new URL(window.location);
        newUrl.searchParams.delete('select');
        window.history.replaceState({}, document.title, newUrl.toString());

        const radioButtons = document.querySelectorAll('input[type="radio"]');
        let foundMatch = false;

        radioButtons.forEach(radio => {
            let labelText = '';
            if (radio.labels && radio.labels.length > 0) {
                labelText = radio.labels[0].textContent.trim();
            } else {
                const parent = radio.parentElement;
                if (parent) {
                    labelText = parent.textContent.trim();
                }
            }

            const radioValue = radio.value || '';

            if (labelText.toLowerCase().includes(selectedOption.toLowerCase()) ||
                radioValue.toLowerCase() === selectedOption.toLowerCase()) {

                radio.checked = true;
                foundMatch = true;

                // Show spinner animation while submitting
                const parentElement = radio.closest('div, li, tr, label');
                let spinnerContainer;

                if (parentElement) {
                    // Create spinner container with data attribute for easy cleanup
                    spinnerContainer = document.createElement('div');
                    spinnerContainer.setAttribute('data-poll-spinner', 'true');
                    spinnerContainer.style.cssText = `
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        background: rgba(0, 0, 0, 0.8);
                        color: white;
                        padding: 20px;
                        border-radius: 8px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 15px;
                        z-index: 10000;
                        font-family: Arial, sans-serif;
                    `;

                    // Create spinner
                    const spinner = document.createElement('div');
                    spinner.style.cssText = `
                        width: 40px;
                        height: 40px;
                        border: 4px solid #333;
                        border-top: 4px solid #fff;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                    `;

                    // Add CSS animation (only if not already added)
                    if (!document.getElementById('poll-spinner-animation')) {
                        const style = document.createElement('style');
                        style.id = 'poll-spinner-animation';
                        style.textContent = `
                            @keyframes spin {
                                0% { transform: rotate(0deg); }
                                100% { transform: rotate(360deg); }
                            }
                        `;
                        document.head.appendChild(style);
                    }

                    // Add text
                    const text = document.createElement('div');
                    text.textContent = 'Submitting your vote...';
                    text.style.fontSize = '16px';

                    spinnerContainer.appendChild(spinner);
                    spinnerContainer.appendChild(text);
                    document.body.appendChild(spinnerContainer);
                }

                // Find and submit the form
                const form = radio.closest('form');
                if (form) {
                    // Small delay to show the spinner before submitting
                    setTimeout(() => {
                        form.submit();
                    }, 500);
                }
            }
        });

        // Optional: Log if no match was found (for debugging)
        if (!foundMatch) {
            console.log('No matching poll option found for:', selectedOption);
        }
    }
});
