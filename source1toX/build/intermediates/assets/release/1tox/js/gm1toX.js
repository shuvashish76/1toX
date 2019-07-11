function GameManager(size, InputManager, Actuator, StorageManager) {
  this.size           = size; // Size of the grid
  this.storageManager = new StorageManager;
  this.inputManager   = new InputManager();
  this.actuator       = new Actuator;

  this.cells          = document.querySelectorAll(".grid-cell");

  this.bgcolor_plain  = "#bbada0";
  this.bgcolor_blue   = "#ab8dc0";
  this.bgcolor_red    = "#eb8da0";
  this.bgcolor_green  = "#8bcd80";

  this.inputManager.on("click", this.click.bind(this));
  this.inputManager.on("restart", this.restart.bind(this));
  this.inputManager.on("restartWithConfirmation", this.restartWithConfirmation.bind(this));
  this.inputManager.on("keepPlaying", this.keepPlaying.bind(this));
  this.inputManager.on("resetBest", this.resetBest.bind(this));
  this.inputManager.on("toggleSettings", this.toggleSettings.bind(this));
  this.inputManager.on("saveSettings", this.saveSettings.bind(this));

  this.bestScore = this.storageManager.getBestScore(),

  this.level = null;
  this.timelevel = 1;

  this.gamemode = this.storageManager.getMode();
  this.level = this.storageManager.getStartlevel();

  this.boxes = [];

  this.grid        = new Grid(this.size);
  this.score       = 0;

  this.showtime    = [ 0, 0, 0, 0, 1000, 1000, 1000, 1300, 1600, 1800, 2000, 2300, 2400, 2500 ];

  this.fast_click  = 2000;

  this.setup();
}

// clicked on a tile
GameManager.prototype.click = function (index) {
  if (this.action == "wait") {
    if (this.boxes.indexOf(index) != -1) this.open_box(index);
  }
};

GameManager.prototype.open_box = function (index) {
  if (this.cell_state[index] == 0) {
    this.cell_state[index] = 1;
    if (this.numbers[index] == this.next) {
      this.cells[index].style.backgroundColor = this.bgcolor_green;
      this.show_number(this.cells[index], this.next);
      if (this.next == 1) {   // Starts from 2 on
        this.now = Math.floor( Date.now() / 1000);
        this.add_score(this.next*(this.level-3), fast=false);
      }
      else {
        diff = Date.now() - this.now;
        if (diff < this.fast_click) {
          value = Math.floor((1+(this.fast_click-diff)/this.fast_click)*this.next*(this.level-3)*(1+this.timelevel/5.0));
          this.add_score(value, fast=true);
        }
        else {
          value = Math.floor(this.next*(this.level-3)*(1+this.timelevel/5.0));
          this.add_score(value, fast=false);
        }
        this.now = Date.now();
      }
      this.next++;
      if (this.next > this.level) {
        this.timeout = 0;
        this.action = "won";
        this.main();
      }
    }
    else {
      this.cells[index].style.backgroundColor = this.bgcolor_red;
      this.timeout = 0;
      this.action = "lost";
      this.over = true;
      this.show_all_numbers();
      this.main();
    }
  }
};

GameManager.prototype.show_boxes = function () {
  self = this;
  this.boxes.forEach(function (item) {
    self.color_box(this.cells[item]);
  });
};

GameManager.prototype.show_all_numbers = function () {
  for (let i=0; i<this.boxes.length; i++) {
    this.show_number(this.cells[this.boxes[i]], this.numbers[this.boxes[i]]);
  }
};

GameManager.prototype.hide_all_numbers = function () {
  self = this;
  this.boxes.forEach(function (item) {
    self.hide_number(this.cells[item]);
  });
};

GameManager.prototype.color_box = function (cell) {
  cell.style.backgroundColor = this.bgcolor_blue;
  cell.style.border = "solid 1px black";
};

GameManager.prototype.show_number = function (cell, n) {
  cell.innerHTML = n;
};

GameManager.prototype.hide_number = function (cell) {
  cell.innerHTML = "";
  cell.style.backgroundColor = this.bgcolor_plain;
};

GameManager.prototype.add_score = function (n, fast) {
  this.score += n;
  this.actuator.updateScore(this.score, fast);
  if (this.bestScore < this.score) {
    this.storageManager.setBestScore(this.score);
    this.actuate();
  }
};

GameManager.prototype.get_box_positions = function () {
  this.boxes = [];
  for (i=0; i<this.level; i++) {
    num = Math.floor(Math.random() * this.size*this.size);
    while (this.boxes.indexOf(num) != -1) {
      num = Math.floor(Math.random() * this.size*this.size);
    }
    this.boxes[i] = num;
  }
};

// Restart the game
GameManager.prototype.restart = function () {
  this.storageManager.clearGameState();
  this.actuator.continueGame(); // Clear the game won/lost message
  this.gamemode = this.storageManager.getMode();
  this.level = this.storageManager.getStartlevel();
  this.timelevel = 1;
  this.score = 0;
  this.setup();
};

// Restart the game after user confirmation
GameManager.prototype.restartWithConfirmation = function () {
    // Open confirm message
    this.oldaction = this.action;
    this.action = "wait";
    this.actuator.promptRestart();
};

GameManager.prototype.keepPlaying = function () {
  this.keepPlaying = true;
  this.actuator.continueGame(); // Clear the game won/lost message
  this.actuate();
  this.action = this.oldaction;
  this.main();
};

// Return true if the game is lost, or has won and the user hasn't kept playing
GameManager.prototype.isGameTerminated = function () {
  return this.over || (this.won && !this.keepPlaying);
};

// Set up the game
GameManager.prototype.setup = function () {
  this.over        = false;
  this.won         = false;
  this.keepPlaying = false;

  this.bestScore = this.storageManager.getBestScore();

  // undo all changes
  self = this;
  this.cells.forEach(function (item) {
    item.style.backgroundColor = self.bgcolor_plain;
    item.style.border = "";
  });
  this.hide_all_numbers();

  this.number_list = [...Array(20).keys()].slice(1);

  if (this.level == 4 && this.bestScore == 0)
    this.boxes = [14, 15, 20, 21]; // start for level 4
  else
    this.get_box_positions();

  this.next        = 1;

  this.cell_state  = new Array(this.cells.length).fill(0);

  this.numbers     = this.get_numbers(this.level);

  // Update the actuator
  this.actuate();

  this.maintime    = null;
  this.timeout     = 0;

  this.action = "counter";
  this.counter = 3;
  this.main();
};

GameManager.prototype.clearBoard = function () {
  this.over        = false;
  this.won         = false;
  this.keepPlaying = false;

  self = this;
  this.cells.forEach(function (item) {
    item.style.backgroundColor = self.bgcolor_plain;
    item.style.border = "";
  });
  this.hide_all_numbers();
  this.actuator.clearMessage();
};

// Sends the updated grid to the actuator
GameManager.prototype.actuate = function () {
  this.actuator.actuate(this.grid, {
    level:      this.level,
    timelevel:  this.timelevel,
    score:      this.score,
    over:       this.over,
    won:        this.won,
    bestScore:  this.storageManager.getBestScore(),
    terminated: this.isGameTerminated(),
    keepPlaying: this.keepPlaying
  });

};

// Represent the current game as an object
GameManager.prototype.serialize = function () {
  return {
    grid:        this.grid.serialize(),
    score:       this.score,
    over:        this.over,
    won:         this.won,
    keepPlaying: this.keepPlaying
  };
};

GameManager.prototype.get_numbers = function (n) {
  var a = [];
  var c = {};
  for (let i=1; i<=n; i++) a.push(i);
  arr = this.shuffle(a)
  for (i=0; i<arr.length; i++) {
    c[this.boxes[i]] = arr[i];
  }
  return c;
};

GameManager.prototype.shuffle = function (array) {
  for (let i = array.length - 1; i > 0; i--) {
      let j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
  }
  return array
};

GameManager.prototype.nextlevel = function () {
  if (this.gamemode == "numbers") {
    this.level++;
  }
  else if (this.gamemode == "time") {
    this.timelevel++;
  }
  else if (this.gamemode == "both") {
    r = Math.floor(Math.random() * 10); // 0-9
    if (this.timelevel == 1 || r > 7)
      this.timelevel += (this.timelevel == 1) ? 2 : 1;
    else if (this.timelevel == 1 && r == 0) {
      this.level++;
      this.timelevel = 1;
    }
    else {
      this.level++;
      this.timelevel = 1;
    }
  }
  else if (this.gamemode == "skip") {
  }
  else if (this.gamemode == "monkey") {
  }
};

GameManager.prototype.main = function (timestamp) {
  if (!this.maintime) this.maintime = timestamp;

  var progress = timestamp - this.maintime;
  if (progress > this.timeout) {
    this.maintime = null;

    if (this.action == "counter") {
      this.timeout = 1000;
      if (this.counter < 1) { // get out of loop
        this.actuator.clearMessage();
        this.timeout = 0;
        this.counter = 0;
        this.action = "boxes";
      }
      else {
        this.actuator.counter(this.counter);
        this.counter--;
      }
    }
    else if (this.action == "boxes") {
      this.show_boxes();
      this.timeout = 1000;
      this.action = "pause";
    }
    else if (this.action == "pause") {
      this.timeout = 100;
      this.action = "numbers";
    }
    else if (this.action == "numbers") {
      this.show_all_numbers();
      this.timeout = this.showtime[this.level]*(1.0-0.2*this.timelevel);
      if (this.timeout == null) {
        this.timeout = 3000;
      }
      this.action = "show";
    }
    else if (this.action == "show") {
      this.hide_all_numbers();
      this.action = "wait";
    }
    else if (this.action == "wait") {
      return // kill timer
    }
    else if (this.action == "won") {
      this.actuator.message(true);
      this.timeout = 3000;
      this.nextlevel();
      this.actuator.updateLevel(this.level, this.timelevel);
      this.action = "setup";
    }
    else if (this.action == "lost") {
      this.actuator.message(false);
      this.timeout = 0;
      return
    }
    else if (this.action == "setup") {
      this.actuator.clearMessage();
      this.setup();
      return
    }
  }
  self = this;
  window.requestAnimationFrame(function (timestamp) { self.main(timestamp); });
}

GameManager.prototype.resetBest = function () {
  this.storageManager.setBestScore(0);
  this.actuate();
};

GameManager.prototype.saveSettings = function () {
  mode = document.querySelector('input[name="mode"]:checked').value;
  startlevel = document.querySelector('input[name="startlevel"]:checked').value;
  this.storageManager.setMode(mode);
  this.storageManager.setStartlevel(startlevel);
  // ... and play
  this.actuator.toggleSettings();
  this.restart();
};

GameManager.prototype.toggleSettings = function () {
  this.action = "wait";
  this.clearBoard();
  this.actuator.showSettings();
};
