/**
 * Checks a response for earned achievements and displays notifications if any were earned
 * 
 * @param {Object} response - The API response object containing achievement data
 * @param {HTMLElement} [container = document.body] - The HTML element to append the notification to
 * @returns {void}
 */
export function handleAchievements(response, container = document.body) {
  if (!response?.newlyEarnedAchievements?.length) {
    return;
  }

  // Show notification for each earned achievement
  response.newlyEarnedAchievements.forEach(achievement => {
    if (achievement) {
      showAchievementNotification(achievement, container);
    }
  });
}


/**
 * Displays an achievement notification to the user
 * 
 * @param {Object} achievement - The achievement object
 * @param {string} achievement.title - Achievement title
 * @param {string} achievement.description - Achievement description
 * @param {number} achievement.reward - Coin reward amount
 * @param {HTMLElement} [container=document.body] - The element to append the notification element to
 */
function showAchievementNotification(achievement, container = document.body) {
  // Create and add notification element
  const notification = createNotificationElement(achievement);
  
  // Add styles if not already present
  ensureStylesExist(container);
  
  // Add the notification element to the DOM
  container.appendChild(notification);

  // Enable animations and auto-close functionality
  setupNotificationAnimations(notification, container);
}


/**
 * Creates the notification DOM element
 * 
 * @param {Object} achievement - The achievement data
 * @param {string} achievement.title - Achievement title
 * @param {string} achievement.description - Achievement description
 * @param {number} achievement.reward - Coin reward amount
 * @returns {HTMLElement} The notification element
 */
function createNotificationElement(achievement) {
  const notification = document.createElement('div');
  notification.className = 'achievement-notification';
  notification.innerHTML = `
    <div class="achievement-content">
      <p class="achievement-title">Doelstelling behaald: ${achievement.title}</p>
      <p class="achievement-description">${achievement.description || ''}</p>
      <p class="achievement-reward">Beloning: <img class="coin-icon" src="Assets/images/pixelCoin.png" alt="Coins"/>${achievement.reward || 0}</p>
    </div>
    <span class="close-btn">&times;</span>
  `;
  return notification;
}


/**
 * Ensures the notification styles exist in the document
 * 
 * @param {HTMLElement} container - The element to append the notification element to
 */
function ensureStylesExist(container) {
  if (document.getElementById('achievement-notification-styles')) {
    return; // Styles already exist
  }
  
  const styles = document.createElement('style');
  styles.id = 'achievement-notification-styles';
  styles.textContent = getStylesText();
  
  // Add styles to the appropriate container
  if (container === document.body) {
    document.head.appendChild(styles); // Better to add to head for global styles
  } else {
    container.appendChild(styles);
  }
}


/**
 * Handles notification animations and removal
 * 
 * @param {HTMLElement} notification - The notification element
 * @param {HTMLElement} container - The element to append the notification element to
 */
function setupNotificationAnimations(notification, container) {
  // Show animation (2 requestAnimationFrames because the first one is needed to ensure the notification has reached its initial state)
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      notification.classList.add('show');
    });
  });
  
  // Add close button functionality
  setupCloseButtonFunctionality(notification);
  
  // Auto-close after 8 seconds
  setupAutoClose(notification, container, 8000);
}


/**
 * Sets up the close button click handler
 * 
 * @param {HTMLElement} notification - The notification element
 */
function setupCloseButtonFunctionality(notification) {
  const closeBtn = notification.querySelector('.close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      closeNotification(notification);
    });
  }
}


/**
 * Sets up auto-close functionality
 * 
 * @param {HTMLElement} notification - The notification element
 * @param {HTMLElement} container - The element to append the notification element to
 * @param {number} delay - Delay in milliseconds before auto-closing
 */
function setupAutoClose(notification, container, delay) {
  setTimeout(() => {
    if (container.contains(notification)) {
      closeNotification(notification);
    }
  }, delay);
}


/**
 * Closes the notification with animation
 * 
 * @param {HTMLElement} notification - The notification to close
 */
function closeNotification(notification) {
  notification.classList.remove('show');
  
  // Wait for animation to complete before removing from DOM
  setTimeout(() => {
    if (notification.parentNode) {
      notification.remove();
    }
  }, 1000); // Match the longest transition time (transform: 1s)
}


/**
 * Returns the CSS styles for notifications
 * 
 * @returns {string} The CSS text
 */
function getStylesText() {
  return `
    .achievement-notification {
      /*
        Positions the notification popup at the top center of the game container
        dynamically adjusts width and height based on content and horizontally centers it
      */
      position: absolute;
      top: 10px;
      left: 50%;
      transform: translateX(-50%) translateY(-10px);
      min-width: 60%;
      max-width: 95%;
      width: auto;
      min-height: 10%;
      height: auto;

      background-color: rgba(50, 50, 50, 0.9);
      color: white;
      border-radius: 10px;
      box-shadow: 0 4px 8px rgba(0,0,0,0.5);
      z-index: 1000;
      font-family: "PixelFont";

      /* 
        Popup starts at 0% opacity and 10px above the game container
        Then ater 100ms it transitions to full opacity and its original position
        This creates a smooth fade-in and slide-down effect
        Works together with the .achievement-notification.show class
      */
      opacity: 0;
      transition: opacity 0.5s ease-out, transform 1s ease-out;
    }
      
    /* When the .show class is added (100ms), the notification becomes fully visible and slides down to its final position */
    .achievement-notification.show {
      opacity: 1;
      transform: translateX(-50%) translateY(0);
    }
      
    /* Positions and adds padding to the inner html content of the notification popup */
    .achievement-content {
      width: calc(100% - 20px); /* Adjust width to account for total amount of padding */
      padding: 10px;
      text-align: center;
    }
      
    /* Shared styles for the achievement title, description, and reward */
    .achievement-title, 
    .achievement-description,
    .achievement-reward {
      margin: 5px 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    /* Custom font size for title*/
    .achievement-title {
      font-size: 16px;
    }

    /* Custom font size for description and reward */
    .achievement-description, 
    .achievement-reward {
      font-size: 14px;
    }

    /* Style for the coin icon */
    .coin-icon {
      height: 18px;
      vertical-align: bottom;
      margin: 0 2px 0 0;
    }

    /* Style for the close button */
    .close-btn {
      position: absolute;
      top: 5px;
      right: 15px;
      font-size: 20px;
      cursor: pointer;
      color: white;
    }
  `;
}
