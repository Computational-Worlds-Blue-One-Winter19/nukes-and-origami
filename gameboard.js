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
}

/**
 * This function shows a 2 line message to the player.
 */
function showMessage(line1, line2, isBlinking) {
  const message = document.getElementById('message-overlay');
  message.style.display = 'block';

  if (isBlinking) {
    message.className += ' blinking';
  }
  document.getElementById('message-line1').innerHTML = line1;
  document.getElementById('message-line2').innerHTML = line2;
}

function showStaticMessage(type) {
  const pausedMessage = document.getElementById(`${type}`);
  pausedMessage.style.display = 'block';
}

/**
 * Message Types: pause-message, game-over-message
 *
 * Using the above message type, the respective message will be hidden from the dom
 * @param {String} type
 */
function hideMessage(type) {
  const message = document.getElementById(`${type}`);
  message.style.display = 'none';
  message.classList.remove('blinking');
}


/**
 * For messages shown to represent item feedback, such as the reversed-message for controls
 * sets all of them to display none.
 *
 * This presents overlapping messages from being shown at the same time.
 */
function clearMessageBoard() {
  const messages = document.getElementsByClassName('indicator');

  for (let index = 0; index < messages.length; index += 1) {
    messages[index].style.display = 'none';
  }
}

/**
 * Shows a control message with the given text as the content
 * A control message is shown at the center bottom of the screen
 * @param {String} content The message that will be shown to the user
 */
function showControlMessage(content) {
  clearMessageBoard();
  const message = document.getElementById('control-message');
  message.innerHTML = content;

  message.style.display = 'block';

  // setTimeout(() => { message.style.display = 'none'; }, 2000);
}

/**
 * Hides a control messages from the players view
 */
function hideControlMessage() {
  const message = document.getElementById('control-message');
  message.style.display = 'none';
}

/**
 * Starts the game by spawning enemies, initializing the scoreboard lives and
 * setting the focus to the canvas
 * @param {NukesAndOrigami} game The game that will be started
 */
function startGame(game, sceneName) {
  game.initializeSceneManager(sceneName);


  // Initilize the game board
  initializeScoreBoardLives(game.lives);

  hideMessage('intro-message');
  document.getElementById('gameWorld').focus();
}


function addEvent(element, evnt, funct) {
  if (element.attachEvent) { return element.attachEvent(`on${evnt}`, funct); }
  return element.addEventListener(evnt, funct, false);
}

/**
 * Given a playerScore object creates a table row that is appended
 * to the leaderboard table
 *
 * The HTML row resembles the following
 * <tr>
 *   <td>1</td>      // Rank
 *   <td>Alvin</td>  // Player Name
 *   <td>5000</td>   // Score
 * </tr>
 * @param {Object} playerScore
 */
function appendTableRow(playerScore) {
  const {
    name,
    rank,
    score,
  } = playerScore;

  // Get a reference to the table
  const tableRef = document.getElementById('leaderboard-body');

  // Insert a row at the end of the table
  const newRow = tableRef.insertRow(-1);

  // Insert a cell in the row at index 0 (Position/Rank)
  const rankCell = newRow.insertCell(0);

  // Append a text node to the cell
  const rankText = document.createTextNode(rank);
  rankCell.appendChild(rankText);

  // Insert a cell in the row at index 1 (Name)
  const nameCell = newRow.insertCell(1);

  // Append a text node to the cell
  const nameText = document.createTextNode(name);
  nameCell.appendChild(nameText);

  // Insert a cell in the row at index 2 (Score)
  const scoreCell = newRow.insertCell(2);

  // Append a text node to the cell
  const scoreText = document.createTextNode(score);
  scoreCell.appendChild(scoreText);
}


async function saveLeaderBoardScore(name, score) {
  const requestData = {
    name,
    score,
  };

  await fetch('https://us-central1-nukes-and-origami.cloudfunctions.net/postScore', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestData),
  })
    .then(response => response.json())
    .then(json => console.log(`Response ${JSON.stringify(json)}`))
    .catch(e => console.log(`Error Posting Score: ${e}`));
}

/**
 * Makes an asycn fetch call using the given URl
 * @param {String} url
 */
async function fetchAsync(url) {
  console.log('Inisde the fetch');
  const response = await fetch(url);
  // const data
  return response.json();
}

function getUserName() {
  Cookies.set('name', 'value');
}

function resetLeaderBoard() {
  // const new_tbody = document.createElement('tbody');
  // populate_with_new_rows(new_tbody);
  // const old_tbody = document.getElementById('leaderboard-body');
  const node = document.getElementById('leaderboard-body');
  while (node.hasChildNodes()) {
    node.removeChild(node.lastChild);
  }
}

function resetLevelCollection() {
  const node = document.getElementById('collection');
  while (node.hasChildNodes()) {
    node.removeChild(node.lastChild);
  }
}

function highlightUserScore(userRank) {
  console.log(`${JSON.stringify(userRank)}`);
  const table = document.getElementById('leaderboard-table');
  for (let i = 0, row; row = table.rows[i]; i++) {
    // iterate through rows
    // rows would be accessed using the "row" variable assigned in the for loop
    for (let j = 0, col; col = row.cells[j]; j++) {
      if (col.cellIndex === 0 && parseInt(col.innerHTML) === userRank.rank) {
        console.log('Found the cell');
        row.className = 'highlight';
        row.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      console.log(`The col is ${col.innerText}`);
      // iterate through columns
      // columns would be accessed using the "col" variable assigned in the for loop
    }
  }
  // Get all the rows in the table
}

/**
 * Using the given data object parses each player score and the userRank
 * in order to load the data onto the leaderboard table
 * @param {Object} data
 */
function loadLeaderboard(data) {
  console.log(`${JSON.stringify(data)}`);
  const {
    leaderboard, userRank,
  } = data;

  // Attach listener to the checkScore button that uses the userRank data
  addEvent(
    document.getElementById('checkScore'),
    'click',
    () => { highlightUserScore(userRank); },
  );

  addEvent(
    document.getElementById('closeLeaderboard'),
    'click',
    () => { resetLeaderBoard(); },
  );

  for (let index = 0; index < leaderboard.length; index += 1) {
    const playerScore = leaderboard[index];

    appendTableRow(playerScore);
    // appendTableRow(playerScore);
    // appendTableRow(playerScore);
  }

  // Get an instance of the modalName
  const modalElem = document.getElementById('modalLeaderboard');
  const instance = M.Modal.getInstance(modalElem);
  instance.open();
}

function getAndLoadLeaderboard(userName) {
  fetchAsync(`https://us-central1-nukes-and-origami.cloudfunctions.net/getScores?name=${userName}`).then((data) => {
    loadLeaderboard(data);
  });
}

/**
 * Initializes the leaderboard, modal, and the checkScore button
 */
function initLeaderboard() {
  // Initialize the modal
  const elems = document.querySelectorAll('.modal');
  const instances = M.Modal.init(elems, {});

  // Get the users name from the cookie, we don't need to check if its undefined since the url can
  // handle it just fine
  const userName = Cookies.get('name');
  console.log(`The name retrieved is ${userName}`);

  addEvent(
    document.getElementById('openLeaderboard'),
    'click',
    () => { getAndLoadLeaderboard(userName); },
  );
}

/**
 * Attaches an on click listener to the submit name button
 * @param {NukesAndOrgami} game The game that will be started after the user clicks submit
 */
function initSubmitNameButton(game) {
  addEvent(
    document.getElementById('submit'),
    'click',
    () => {
      // Handle the submit button being clicked

      // Get an instance of the modalName
      const modalElem = document.getElementById('modalName');
      const instance = M.Modal.getInstance(modalElem);

      // Get the name entered by the user
      const textInput = document.getElementById('user_name');
      const userName = textInput.value;
      if (userName) {
        // Text is not empty save it onto the cookie
        // Save the value onto a cookie
        Cookies.set('name', userName);

        // Close the modal
        instance.close();

        startGame(game);
      }
    },
  );
}

function loadLevelsOntoCollection(levels, game, modalInstance) {
  // Get the collection
  const collection = document.getElementById('collection');
  // Just in case remove any child nodes
  resetLevelCollection();

  for (let index = 0; index < levels.length; index += 1) {
    // Get the name of the level (key) and its value
    const levelName = Object.keys(levels[index])[0];
    const levelValue = levels[index][levelName];

    // <a href="#!" class="collection-item">Level One</a>
    // const mydiv = document.getElementById('myDiv');
    const aTag = document.createElement('a');
    aTag.setAttribute('href', '#!'); // null attribute
    aTag.innerHTML = levelName;
    aTag.className = 'collection-item';
    addEvent(
      aTag,
      'click',
      () => {
        startGame(game, levelValue);
        modalInstance.close();
        console.log(`Clicked ${levelValue}`);
      },
    );
    collection.appendChild(aTag);

    console.log(`The name and value are ${levelName} ${levelValue}`);
  }
}

function initStartGameButton(game) {
  addEvent(
    document.getElementById('start-button'),
    'click',
    () => {
      // Check if we have the user's name saved
      if (!Cookies.get('name')) {
        const modalElem = document.getElementById('modalName');
        const instanceName = M.Modal.getInstance(modalElem);
        // Open the modal
        instanceName.open();

        // Autofocus the input field
        const textInput = document.getElementById('user_name');

        // Auto focus the text input field
        textInput.focus();
      } else {
        // Returning user and we already have a named saved onto the cookie

        // Get all the levels saved onto the cookie
        const data = Cookies.get();
        const levels = [];
        for (const key in data) {
          if (key.includes('Level') || key.includes('Water')) {
            // Key is related to a level
            console.log('Found level data');

            levels.push({ [key]: data[key] });
          }
          const datum = data[key];
          console.log(`${JSON.stringify(datum)}`);
        }

        // If levels is empty no levels found saved in the cookie
        console.log(`${JSON.stringify(levels)}`);
        if (levels.length > 1) { // No need to show the modal if the only loadable level is #1
          // Init the level modal
          const modalLevel = document.getElementById('modalLevel');
          const instanceLevel = M.Modal.getInstance(modalLevel);

          // Load the levels onto the modal
          loadLevelsOntoCollection(levels, game, instanceLevel);

          instanceLevel.open();
        } else {
          // No level data found in the cookies start at level one
          startGame(game, 'water55');
        }
      }
    },
  );
}


/**
 * Initializes of the intro messge
 * @param {NukesAndOrigami} game The game that will be started after the user clicks on the
 * start button
 */
function initIntroMessage(game) {
  showStaticMessage('intro-message');
  // Add an event click listener for the submit name button
  initSubmitNameButton(game);

  // Add an event click listener for the start game button
  initStartGameButton(game);

  // While we are initing the intro message we'll also init the leaderboard
  initLeaderboard();
}

// Inventory related functions
function addPowerUp(src, type) {
  const img = new Image();
  img.src = src;
  img.className = type;

  const container = document.getElementById('inventory');

  container.appendChild(img);
}

function addItem(src, type, container) {
  const img = new Image();
  img.src = src;
  img.className = type;

  const elementContainer = document.getElementById(container);

  elementContainer.appendChild(img);
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

/**
 * Removes an item from the dom.
 *
 * @param {String} type The type of item that will be removed from the dom.
 * @param {String} container The container holding the item that will be removed.
 */
function removeItem(type, container) {
  // Need to get the parent element to be able to remove the power up icons
  const parent = document.getElementById(container);


  // Find all the images with the respective class type
  const containerElement = document.getElementsByClassName(type);
  // If we find any go ahead and remove the last one
  if (containerElement.length) {
    parent.removeChild(containerElement[containerElement.length - 1]);
  }
}

/**
 * Starts a timer that will last the given time, once the timer has finished
 * the callBack will be called
 * A reference of the given weapon will be passed to the callback
 * @param {} time
 * @param {*} callBack
 * @param {*} weapon
 */
function startTimer(time, callBack, weapon) {
  // Get the svg element
  const circleElement = document.getElementById('circle');
  circleElement.style.animationDuration = `${time}s`;
  circleElement.style.display = 'block';

  // Get the element that will show the numbers
  const countdownNumberElement = document.getElementById('countdown-number-regular');
  let countdown = time;

  countdownNumberElement.textContent = countdown;

  // const timer = null;

  // When we active the callBack we'll need to remove the time as well
  const finished = (timer) => {
    stopTimer(timer);
    callBack(weapon);
  };
  // Sets the number being shown in the timer
  weapon.timer = setInterval(() => {
    countdown = --countdown <= 0 ? finished(weapon.timer) : countdown;

    countdownNumberElement.textContent = countdown;
  }, 1000);
}

function stopRollTimer(timer) {
  console.log('Stoping roll timer');
  const circleElement = document.getElementById('circle-roll');
  circleElement.className += 'paused';
  const countdownNumberElement = document.getElementById('countdown-number');

  circleElement.style.display = 'none';
  countdownNumberElement.textContent = '0';
  // Stop the intercal from running
  clearInterval(timer);
}

function startRollTimer(time) {
  console.log('Starting roll timer');
  // Get the svg element
  const circleElement = document.getElementById('circle-roll');
  circleElement.style.animationDuration = `${time}s`;
  circleElement.style.display = 'block';
  circleElement.classList.remove('paused');

  // Get the element that will show the numbers
  const countdownNumberElement = document.getElementById('countdown-number');
  let countdown = time;

  countdownNumberElement.textContent = countdown;

  let timer = null;

  // When we active the callBack we'll need to remove the time as well
  const finished = (timer) => {
    stopRollTimer(timer);
    // callBack(weapon);
  };
  // Sets the number being shown in the timer
  timer = setInterval(() => {
    countdown -= 0.5;
    if (countdown <= 0) {
      stopRollTimer(timer);
    }
    { console.log(`Countdown is ${countdown}`); }
    countdownNumberElement.textContent = countdown;
  }, 500);
}

function stopTimer(timer) {
  const circleElement = document.getElementById('circle');
  const countdownNumberElement = document.getElementById('countdown-number-regular');

  circleElement.style.display = 'none';
  countdownNumberElement.textContent = '';
  // Stop the intercal from running
  clearInterval(timer);
}
