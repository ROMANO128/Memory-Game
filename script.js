document.addEventListener('DOMContentLoaded', function() {
  const GAME_NODE = document.querySelector("#game-board");
  const WINNING_TEXT = document.querySelector("#victory-message");
  const RESTART_GAME_BUTTON = document.querySelector("#new-game-button");
  const NEXT_ROUND_BUTTON = document.createElement("button");
  NEXT_ROUND_BUTTON.textContent = "Next Round";
  NEXT_ROUND_BUTTON.addEventListener("click", startNextRound);
  NEXT_ROUND_BUTTON.style.display = "none";
  document.querySelector(".container").appendChild(NEXT_ROUND_BUTTON); // Changed to ".container"

  const FIELD_SIZE_SELECT = document.querySelector("#field-size");
  const DIFFICULTY_SELECT = document.querySelector("#difficulty");
  const PLAYER_MODE_SELECT = document.querySelector("#player-mode");
  const START_GAME_BUTTON = document.querySelector("#start-game-button"); // Moved inside DOMContentLoaded
  const VISIBLE_CARD_CLASSNAME = "visible";
  const CARD_FLIP_TIMEOUT_MS = 500;
  const ROUNDS_SELECT = document.querySelector("#rounds");
  let totalRounds = parseInt(ROUNDS_SELECT.value);
  let previousScores = []; // Зберігаємо результати попередніх раундів

  ROUNDS_SELECT.addEventListener("change", () => {
      totalRounds = parseInt(ROUNDS_SELECT.value);
  });

  const CARD_ELEMENTS = {
      4: ["🍓", "🍉", "🍌", "🍏", "🥝", "🍇", "🥥", "🍍"],
      6: ["🍓", "🍉", "🍌", "🍏", "🥝", "🍇", "🥥", "🍍", "🍑", "🫐", "🥭", "🍈", "🍋", "🍊", "🥑", "🌶️", "🥨", "🍗"],
  };

  let CARDS_AMOUNT = getFieldSize() * getFieldSize(); // Default value for cards amount
  let GAME_TIMER;
  let VISIBLE_CARDS = [];
  let currentPlayer = 1; // Default to player 1
  let playerScores = [0, 0]; // Array to store scores for each player
  let startTime; // Variable to store game start time
  let playerNames = ["Player 1", "Player 2"];
  let roundResults = [];
  let winnerIndex;

  START_GAME_BUTTON.addEventListener("click", startGame);
  RESTART_GAME_BUTTON.addEventListener("click", startGame);
  FIELD_SIZE_SELECT.addEventListener("change", updateCardAmount);

  const PLAYER1_NAME_INPUT = document.querySelector("#player1-name");
  const PLAYER2_NAME_INPUT = document.querySelector("#player2-name");

  function resetPlayerScores() {
      playerScores = [0, 0]; // Скинути рахунок гравців до початкового стану
  }


  function getFieldSize() {
      return parseInt(FIELD_SIZE_SELECT.value);
  }

  function updateScoreDisplay() {
      const scoreDisplay = document.querySelector("#score-display");
      if (PLAYER_MODE_SELECT.value === "1player") {
          scoreDisplay.textContent = "";
      } else {
          scoreDisplay.textContent = `${playerNames[0]} Score: ${playerScores[0]} | ${playerNames[1]} Score: ${playerScores[1]}`;
      }
  }


  function startGame() {
      [GAME_NODE, WINNING_TEXT].forEach((element) => (element.innerHTML = ""));
      GAME_NODE.innerHTML = "";
      let roundResults = [];

      const fieldSize = getFieldSize();
      const CARD_VALUES = generateArrayWithPairs(
          CARD_ELEMENTS[fieldSize],
          CARDS_AMOUNT
      );

      if (CARD_VALUES === null) return;

      CARD_VALUES.forEach(renderCard);

      VISIBLE_CARDS = [];
      currentPlayer = 1;
      startTime = Date.now();

      clearInterval(GAME_TIMER);

      const renderedCards = document.querySelectorAll(".card");
      renderedCards.forEach((card) => card.classList.add(VISIBLE_CARD_CLASSNAME));

      setTimeout(() => {
          renderedCards.forEach((card) =>
              card.classList.remove(VISIBLE_CARD_CLASSNAME)
          );
          startTimer();
      }, CARD_FLIP_TIMEOUT_MS * 2);

      // Якщо обрано більше одного раунду, показуємо кнопку для початку наступного раунду
      if (totalRounds > 1) {
          NEXT_ROUND_BUTTON.style.display = "block";
      }
  }

  function handleCardClick(card) {
      if (card.classList.contains(VISIBLE_CARD_CLASSNAME)) {
          return;
      }

      if (PLAYER_MODE_SELECT.value === "1player") {
          handleSinglePlayerCardClick(card);
      } else {
          handleTwoPlayersCardClick(card);
      }
  }

  function handleSinglePlayerCardClick(card) {
      const checkVictory = () => {
          const visibleCardsNodes = document.querySelectorAll(
              `.${VISIBLE_CARD_CLASSNAME}`
          );

          const isVictory = visibleCardsNodes.length === CARDS_AMOUNT;
          const victoryMessage = `Congratulations, you won! Time taken: ${formatTime(
              Date.now() - startTime
          )}`;

          if (isVictory) {
              clearInterval(GAME_TIMER);
              WINNING_TEXT.textContent = victoryMessage;
              previousScores.push(playerScores.slice()); // Зберігаємо результати попереднього раунду
          }
      };

      card
          .querySelector(".card-inner")
          .addEventListener("transitionend", checkVictory);

      card.classList.add(VISIBLE_CARD_CLASSNAME);

      VISIBLE_CARDS.push(card);

      if (VISIBLE_CARDS.length % 2 !== 0) {
          return;
      }

      const [prelastCard, lastCard] = VISIBLE_CARDS.slice(-2);

      if (lastCard.textContent !== prelastCard.textContent) {
          VISIBLE_CARDS = VISIBLE_CARDS.slice(0, VISIBLE_CARDS.length - 2);

          setTimeout(() => {
              [lastCard, prelastCard].forEach((card) =>
                  card.classList.remove(VISIBLE_CARD_CLASSNAME)
              );
          }, CARD_FLIP_TIMEOUT_MS);
      }
  }

  function handleTwoPlayersCardClick(card) {
      const checkVictory = () => {
          const visibleCardsNodes = document.querySelectorAll(
              `.${VISIBLE_CARD_CLASSNAME}`
          );

          const isVictory = visibleCardsNodes.length === CARDS_AMOUNT;
          const victoryMessage = `Player ${currentPlayer} wins!`;

          if (isVictory) {
              clearInterval(GAME_TIMER);
              WINNING_TEXT.textContent = victoryMessage;
              previousScores.push(playerScores.slice()); // Зберігаємо результати попереднього раунду
          }
      };

      card
          .querySelector(".card-inner")
          .addEventListener("transitionend", checkVictory);

      card.classList.add(VISIBLE_CARD_CLASSNAME);

      VISIBLE_CARDS.push(card);

      if (VISIBLE_CARDS.length % 2 !== 0) {
          return;
      }

      const [prelastCard, lastCard] = VISIBLE_CARDS.slice(-2);

      if (lastCard.textContent !== prelastCard.textContent) {
          VISIBLE_CARDS = VISIBLE_CARDS.slice(0, VISIBLE_CARDS.length - 2);

          setTimeout(() => {
              [lastCard, prelastCard].forEach((card) =>
                  card.classList.remove(VISIBLE_CARD_CLASSNAME)
              );
              switchPlayer(); // Switch to the next player's turn
          }, CARD_FLIP_TIMEOUT_MS);
      } else {
          incrementScore(currentPlayer); // Increment score for the current player
          updateScoreDisplay(); // Update score display
      }
  }

  function switchPlayer() {
      currentPlayer = currentPlayer === 1 ? 2 : 1; // Switch between Player 1 and Player 2
  }

  function incrementScore(player) {
      playerScores[player - 1] += 1; // Increment score for the respective player
  }

  function updateGridColumns(fieldSize) {
      const gameBoard = document.querySelector("#game-board");

      gameBoard.style.gridTemplateColumns = `repeat(${fieldSize}, 1fr)`;
  }

  function updateCardAmount() {
      const selectedSize = parseInt(FIELD_SIZE_SELECT.value);
      CARDS_AMOUNT = selectedSize * selectedSize;

      updateGridColumns(selectedSize);

      startGame(); // Restart game with new field size
  }

  function startTimer() {
      clearInterval(GAME_TIMER); // Clear previous timer

      const selectedDifficulty = DIFFICULTY_SELECT.value;
      let timerDuration;

      switch (selectedDifficulty) {
          case "easy":
              timerDuration = 180; // 3 minutes in seconds
              break;
          case "normal":
              timerDuration = 120; // 2 minutes in seconds
              break;
          case "hard":
              timerDuration = 60; // 1 minute in seconds
              break;
          default:
              timerDuration = 180; // Default to easy
              break;
      }

      let timeLeft = timerDuration;

      GAME_TIMER = setInterval(() => {
          timeLeft -= 1;
          if (timeLeft < 0) {
              clearInterval(GAME_TIMER);
              WINNING_TEXT.textContent = "Time's up! Try again.";
          } else {
              const minutes = Math.floor(timeLeft / 60);
              const seconds = timeLeft % 60;
              WINNING_TEXT.textContent = `Time: ${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
          }
      }, 1000);
  }

  function formatTime(ms) {
      const minutes = Math.floor(ms / 60000);
      const seconds = ((ms % 60000) / 1000).toFixed(0);
      return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  }

  function generateArrayWithPairs(arr, fieldSize) {
      if (!arr || arr.length * 2 !== fieldSize) {
          const errorMessage =
              "Unable to create an array with pairs from the specified array and size.";

          console.error(errorMessage);
          return null;
      }

      const randomArray = [];
      const elementCounts = {};

      for (const item of arr) {
          elementCounts[item] = 0;
      }

      while (randomArray.length < fieldSize) {
          const randomIndex = Math.floor(Math.random() * arr.length);
          const randomElement = arr[randomIndex];

          if (elementCounts[randomElement] < 2) {
              randomArray.push(randomElement);
              elementCounts[randomElement]++;
          }
      }

      return randomArray;
  }

  function renderCard(cardText = "") {
      const card = document.createElement("div");
      card.classList.add("card");

      const cardInner = document.createElement("div");
      cardInner.classList.add("card-inner");

      const cardFront = document.createElement("div");
      cardFront.classList.add("card-front");

      const cardBack = document.createElement("div");
      cardBack.classList.add("card-back");

      cardFront.textContent = "?";
      cardBack.textContent = cardText;

      cardInner.appendChild(cardFront);
      cardInner.appendChild(cardBack);

      card.appendChild(cardInner);

      card.addEventListener("click", handleCardClick.bind(this, card));

      GAME_NODE.appendChild(card);
  }

  function startNextRound() {
      // Генеруємо новий набір карт для наступного раунду
      const newCardValues = generateNewCardValues();

      // Оновлюємо картки з новими значеннями
      const cards = document.querySelectorAll(".card");
      cards.forEach((card, index) => {
          card.querySelector(".card-back").textContent = newCardValues[index];
      });

      startGame(); // Починаємо наступний раунд
      // Після початку наступного раунду, ховаємо кнопку для початку наступного раунду
      NEXT_ROUND_BUTTON.style.display = "none";
      // Оновлюємо відображення результатів попередніх раундів
      updatePreviousScoresDisplay();
      displayRoundResults();
  }

  function updatePreviousScoresDisplay() {
      const previousScoresDisplay = document.querySelector("#previous-scores");
      previousScoresDisplay.innerHTML = ""; // Clear previous results

      // Display the winner's name and scores for each round
      previousScores.forEach((roundData, index) => {
          const roundNumber = index + 1;
          const roundWinner = roundData.winner;
          const roundScores = roundData.scores.join(" - ");
          const roundResult = document.createElement("li");
          roundResult.textContent = `Round ${roundNumber}: Winner - ${roundWinner}, Scores - ${roundScores}`;
          previousScoresDisplay.appendChild(roundResult);
      });
  }

  function generateNewCardValues() {
      const fieldSize = getFieldSize();
      return generateArrayWithPairs(CARD_ELEMENTS[fieldSize], CARDS_AMOUNT);
  }
});
