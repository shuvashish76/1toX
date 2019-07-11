function KeyboardInputManager() {
  this.events = {};

  if (window.navigator.msPointerEnabled) {
    //Internet Explorer 10 style
    this.eventTouchstart    = "MSPointerDown";
    this.eventTouchmove     = "MSPointerMove";
    this.eventTouchend      = "MSPointerUp";
  } else {
    this.eventTouchstart    = "touchstart";
    this.eventTouchmove     = "touchmove";
    this.eventTouchend      = "touchend";
  }

  this.listen();
}

KeyboardInputManager.prototype.on = function (event, callback) {
  if (!this.events[event]) {
    this.events[event] = [];
  }
  this.events[event].push(callback);
};

KeyboardInputManager.prototype.emit = function (event, data) {
  var callbacks = this.events[event];
  if (callbacks) {
    callbacks.forEach(function (callback) {
      callback(data);
    });
  }
};

KeyboardInputManager.prototype.listen = function () {
  var self = this;

  cells = document.querySelectorAll(".grid-cell");
  cells.forEach(function (element, index) {
    element.addEventListener("click", function() { self.emit("click", index); })
  });

  // Respond to button presses
  this.bindButtonPress(".retry-button", this.restart);
  this.bindButtonPress(".restart-button", this.restartWithConfirmation);
  this.bindButtonPress(".keep-playing-button", this.keepPlaying);
  this.bindButtonPress(".confirm-button", this.restart);    
  this.bindButtonPress(".cancel-button", this.keepPlaying);
  this.bindButtonPress("#save-button", this.saveSettings);
  this.bindButtonPress("#reset-best-button", this.resetBest);
  this.bindButtonPress("#settingsbtn", this.toggleSettings);
};

KeyboardInputManager.prototype.restart = function (event) {
  event.preventDefault();
  this.emit("restart");
};

KeyboardInputManager.prototype.restartWithConfirmation = function (event) {
  event.preventDefault();
  this.emit("restartWithConfirmation");
};

KeyboardInputManager.prototype.keepPlaying = function (event) {
  event.preventDefault();
  this.emit("keepPlaying");
};

KeyboardInputManager.prototype.bindButtonPress = function (selector, fn) {
  var button = document.querySelector(selector);
  button.addEventListener("click", fn.bind(this));
  button.addEventListener(this.eventTouchend, fn.bind(this));
};

KeyboardInputManager.prototype.saveSettings = function (event) {
  event.preventDefault();
  this.emit("saveSettings");
};

KeyboardInputManager.prototype.resetBest = function (event) {
  event.preventDefault();
  this.emit("resetBest");
};

KeyboardInputManager.prototype.toggleSettings = function (event) {
  event.preventDefault();
  this.emit("toggleSettings");
};
