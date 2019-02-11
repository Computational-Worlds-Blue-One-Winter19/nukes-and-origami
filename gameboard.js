const lifeColor = ['red', 'blue', 'aqua', 'oragne', 'green'];

/**
 * Updates the score board to reflect the user's current score
 * @param {Int} currentScore
 */
function updateScoreBoard(currentScore) {
  // Get the element that is displaying the player's current score
  const score = document.getElementById('user-score');

  // Update the user's score by the entities score value
  score.textContent = currentScore;
}

/**
 * Creates a svg element with a width and height of 24px that can be added to the dom
 * The given color represent the filled color that the heart icon will use
 * @param {String} color
 */
function createHeart(color) {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', 24);
  svg.setAttribute('height', 24);

  // Create a path in SVG's namespace
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');

  // Set path's data
  path.setAttribute('d', 'M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z');
  path.setAttribute('fill', `${color}`);

  svg.appendChild(path);
  return svg;
}

/**
 * Retrieves and returns a random color from the lifeColor array
 */
function getRandomColor() {
  return lifeColor[Math.floor(Math.random() * lifeColor.length)];
}

/**
  * Adds a heart icon to the lives-icon-container found in index.html
  * @param {String} color The name of the color that the heart icon will used
  */
function addLife(color) {
  const container = document.getElementById('lives-icon-container');
  if (!color) {
    color = getRandomColor();
  }
  container.appendChild(createHeart(color));
}

/**
 * Removes a heart icons from the lives-icon-container if their are heart icons present
 */
function removeLifeFromBoard() {
  // Find the container holding all the heart icons
  const container = document.getElementById('lives-icon-container');
  if (container.hasChildNodes()) {
    container.removeChild(container.lastChild);
  }
}

/**
 * Initializes the score board lives by drawing a out all the heart icons that represent a players's
 * life
 * @param {Int} lives A heart icon will be drawn for each number of lives that is given
 */
function initializeScoreBoardLives(lives) {
  for (let i = 0; i < lives; i += 1) {
    addLife(lifeColor[i]);
  }
  // addPowerUp('./img/shield-icon.png');
  // addPowerUp('./img/rapid-bullet.png');
}


/**
 * Message Types: pause-message, game-over-message
 *
 * Using the above message types, the respective message will be shown in the dom
 * @param {String} type
 */
function showMessage(line1, line2) {
  const message = document.getElementById("message-overlay");
  message.style.display = 'block';
  document.getElementById("message-line1").innerHTML = line1;
  document.getElementById("message-line2").innerHTML = line2;
}

/**
 * Message Types: pause-message, game-over-message
 *
 * Using the above message type, the respective message will be hidden from the dom
 * @param {String} type
 */
function hideMessage(type) {
  const message = document.getElementById("message-overlay");
  message.style.display = 'none';
}

// Inventory related functions
function addPowerUp(src, type) {
  console.log('Inside the addPowerUp');
  const img = new Image();
  img.src = src;
  img.className = type;

  const container = document.getElementById('inventory');

  container.appendChild(img);
}

function removePowerUp(type) {
  // Need to get the parent element to be able to remove the power up icons
  const parent = document.getElementById('inventory');


  // Find all the images with the respective class type
  const container = document.getElementsByClassName(type);

  // If we find any go ahead and remove the last one
  if (container.length) {
    parent.removeChild(container[container.length - 1]);
  }
}
