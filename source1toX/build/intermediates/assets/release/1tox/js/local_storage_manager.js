window.fakeStorage = {
  _data: {},

  setItem: function (id, val) {
    return this._data[id] = String(val);
  },

  getItem: function (id) {
    return this._data.hasOwnProperty(id) ? this._data[id] : undefined;
  },

  removeItem: function (id) {
    return delete this._data[id];
  },

  clear: function () {
    return this._data = {};
  }
};

function LocalStorageManager() {
  this.bestScoreKey      = "bestScore";
  this.gameStateKey      = "gameState";
  this.gameStatesStackKey = "gameStatesStack"; 
  this.modeKey = "mode"; 
  this.startlevelKey = "startlevel"; 

  var supported = this.localStorageSupported();
  this.storage = supported ? window.localStorage : window.fakeStorage;
}

LocalStorageManager.prototype.localStorageSupported = function () {
  var testKey = "test";
  var storage = window.localStorage;

  try {
    storage.setItem(testKey, "1");
    storage.removeItem(testKey);
    return true;
  } catch (error) {
    return false;
  }
};

// Best score getters/setters
LocalStorageManager.prototype.getBestScore = function () {
  return this.storage.getItem(this.bestScoreKey) || 0;
};

LocalStorageManager.prototype.setBestScore = function (score) {
  this.storage.setItem(this.bestScoreKey, score);
};

LocalStorageManager.prototype.getMode = function () {
  return this.storage.getItem(this.modeKey) || "both";
};

LocalStorageManager.prototype.setMode = function (mode) {
  this.storage.setItem(this.modeKey, mode);
};

LocalStorageManager.prototype.getStartlevel = function () {
  return this.storage.getItem(this.startlevelKey) || "4";
};

LocalStorageManager.prototype.setStartlevel = function (level) {
  this.storage.setItem(this.startlevelKey, level);
};

// Game state getters/setters and clearing
LocalStorageManager.prototype.getGameState = function () {
  return null;
  var stateJSON = this.storage.getItem(this.gameStateKey);
  return stateJSON ? JSON.parse(stateJSON) : null;
};

LocalStorageManager.prototype.setGameState = function (gameState) {
  return null;
  this.storage.setItem(this.gameStateKey, JSON.stringify(gameState));
};

LocalStorageManager.prototype.clearGameState = function () {
  this.storage.removeItem(this.gameStateKey);
  this.storage.removeItem(this.gameStatesStackKey);    
};

// Game states stack push and pop operations and stack length
LocalStorageManager.prototype.popGameState = function () {
  var gameStatesStackJSON = this.storage.getItem(this.gameStatesStackKey);
  var gameStatesStack = gameStatesStackJSON ? JSON.parse(gameStatesStackJSON) : [ ];
  var previousGameState = null;
  var currentGameState = this.storage.getItem(this.gameStateKey);

  // Do not allow the stack to underflow  
  if(gameStatesStack.length > 0) {
    previousGameState   = gameStatesStack.pop();
    // The current state will be first item popped
    // So you pop once more to get the previous state  
    if(currentGameState.indexOf(previousGameState) >= 0) {
      previousGameState   = gameStatesStack.pop();
    }
  }

  // Always keep one item on the stack the current state
  if(gameStatesStack.length == 0)  {
     gameStatesStack.push(previousGameState);
  }

  this.storage.setItem(this.gameStatesStackKey, JSON.stringify(gameStatesStack));
  return previousGameState ? JSON.parse(previousGameState) : null;
};

LocalStorageManager.prototype.pushGameState = function (gameState) {
  var gameStatesStackJSON = this.storage.getItem(this.gameStatesStackKey);
  var gameStatesStack = gameStatesStackJSON ? JSON.parse(gameStatesStackJSON) : [ ];

  if(typeof gameStatesStack !== 'undefined') {
    if(gameStatesStack.length > 50) {
      gameStatesStack.shift();
    }
  }
  
  gameStatesStack.push(JSON.stringify(gameState));

  this.storage.setItem(this.gameStatesStackKey, JSON.stringify(gameStatesStack));
};

LocalStorageManager.prototype.getLengthOfGameStatesStack = function () {
  var gameStatesStackJSON = this.storage.getItem(this.gameStatesStackKey);
  var gameStatesStack = gameStatesStackJSON ? JSON.parse(gameStatesStackJSON) : [ ];

  return gameStatesStack.length;
};
