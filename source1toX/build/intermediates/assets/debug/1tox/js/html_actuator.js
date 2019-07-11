function HTMLActuator() {
  this.tileContainer    = document.querySelector(".tile-container");
  this.scoreContainer   = document.querySelector(".score-container");
  this.levelContainer   = document.querySelector(".level-container");
  this.bestContainer    = document.querySelector(".best-container");
  this.messageContainer = document.querySelector(".game-message");
  this.settingsContainer = document.querySelector(".game-settings");

  this.score = 0;
  this.level = 4;
}

HTMLActuator.prototype.actuate = function (grid, metadata) {
  var self = this;

  window.requestAnimationFrame(function () {
    self.clearContainer(self.tileContainer);

    self.updateLevel(metadata.level, metadata.timelevel);
    self.updateScore(metadata.score);
    self.updateBestScore(metadata.bestScore);

    if (metadata.terminated) {
      if (metadata.over) {
        if (metadata.won && !metadata.keepPlaying){
            // last move won , and no more move ;
            self.message(true);
            return;
        }
        self.message(false); // You lose
      } else if (metadata.won) {
        self.message(true); // You win!
      }
    }

  });
};

HTMLActuator.prototype.showSettings = function () {
  this.clearMessage();
  this.settingsContainer.style.display = "block";
};

HTMLActuator.prototype.toggleSettings = function () {
  this.clearMessage();
  if (this.settingsContainer.style.display == "none")
    this.settingsContainer.style.display = "block";
  else
    this.settingsContainer.style.display = "none";
};

HTMLActuator.prototype.continueGame = function () {
  this.clearMessage();
};

HTMLActuator.prototype.clearContainer = function (container) {
  while (container.firstChild) {
    container.removeChild(container.firstChild);
  }
};

HTMLActuator.prototype.applyClasses = function (element, classes) {
  element.setAttribute("class", classes.join(" "));
};

HTMLActuator.prototype.normalizePosition = function (position) {
  return { x: position.x + 1, y: position.y + 1 };
};

HTMLActuator.prototype.positionClass = function (position) {
  position = this.normalizePosition(position);
  return "tile-position-" + position.x + "-" + position.y;
};

HTMLActuator.prototype.updateScore = function (score, fast) {
  this.clearContainer(this.scoreContainer);

  var difference = score - this.score;
  this.score = score;

  this.scoreContainer.textContent = this.score;

  if (difference > 0) {
    var addition = document.createElement("div");
    var classname = fast ? "score-addition-fast" : "score-addition";
    addition.classList.add(classname);
    addition.textContent = "+" + difference;

    this.scoreContainer.appendChild(addition);
  }
};

HTMLActuator.prototype.updateLevel = function (level, timelevel) {
  this.clearContainer(this.levelContainer);

  var difference = level - this.level;
  this.level = level;

  this.levelContainer.textContent = this.level;

  // draw circles in level box
  for (let i=1; i<timelevel; i++) {
    right = (4 + ((i+1)%2)*8) + 'px';
    up = (48 - Math.round(i/2)*8) + 'px';
    var ball = document.createElement("span");
    ball.classList.add("dot");
    ball.style.right = right;
    ball.style.top = up;
    this.levelContainer.appendChild(ball);
  }

  if (difference > 0) {
    var addition = document.createElement("div");
    addition.classList.add("level-addition");
    addition.textContent = "+" + difference;

    this.levelContainer.appendChild(addition);
  }
};

HTMLActuator.prototype.updateBestScore = function (bestScore) {
  this.bestContainer.textContent = bestScore;
};

HTMLActuator.prototype.message = function (won) {
  var type    = won ? "game-won" : "game-over";
  var message = won ? "\u2714" : "Game over!"; // check

  this.messageContainer.classList.add(type);
  this.messageContainer.getElementsByTagName("p")[0].textContent = message;
};

HTMLActuator.prototype.promptRestart = function () {
  var message = "Restart?";
  this.messageContainer.classList.add("restart-game");
  this.messageContainer.getElementsByTagName("p")[0].textContent = message;
};

HTMLActuator.prototype.clearMessage = function () {
  // IE only takes one value to remove at a time.
  this.messageContainer.classList.remove("game-won");
  this.messageContainer.classList.remove("game-over");
  this.messageContainer.classList.remove("restart-game");
  this.messageContainer.classList.remove("counter");
};

HTMLActuator.prototype.counter = function (n) {
  var message = n;
  this.messageContainer.classList.add("counter");
  this.messageContainer.getElementsByTagName("p")[0].textContent = message;
};
