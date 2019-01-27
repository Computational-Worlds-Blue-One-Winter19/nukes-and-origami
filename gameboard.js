function updateScoreBy(hitValue) {
    // Get the element that is displaying the player's current score
    const score = document.getElementById("user-score");
    // Get the text inside the element (the score)
    const currentScore = score.textContent;
    
    // Update the user's score by the entities score value
    score.textContent = parseInt(currentScore) + hitValue;
    addLife();
};

/**
 * Adds a heart icon to the lives-icon-container
 * 
 * 
 */
function addLife(color) {
    var container = document.getElementById("lives-icon-container");
    container.appendChild(createHeart(color));
};

/**
 * Removes a heart icons from the lives-icon-container if their are heart icons present
 */
function removeLife() {
    // Find the container holding all the heart icons
    const container = document.getElementById("lives-icon-container");
    if (container.hasChildNodes()) {
        container.removeChild(container.lastChild) 
    }
};

function initializeLives() {
    addLife("red");
    addLife("aqua");
    addLife("orange");
}

function createHeart(color) { 
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", 24);
    svg.setAttribute("height", 24);
    
    //Create a path in SVG's namespace
    const path = document.createElementNS("http://www.w3.org/2000/svg", 'path');

    //Set path's data
    path.setAttribute("d","M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z");
    path.setAttribute("fill", `${color}`);

    svg.appendChild(path);
    return svg;
};

function showPausedMessage() {
    const pausedMessage = document.getElementById("pause-message");
    pausedMessage.style.display = 'block';
};

function hidePausedMessage() {
    const pausedMessage = document.getElementById("pause-message");
    pausedMessage.style.display = 'none';
};