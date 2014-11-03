
var tpl = require('./views/controls.html')
  , dom = require('domify')
  , events = require('events')
  , emitter = require('emitter')

/**
 * `Controls' constructor
 *
 * @api public
 * @param {Frame} frame
 * @param {Object} opts
 */

module.exports = Controls
function Controls (frame, opts) {
  if (!(this instanceof Controls)) {
    return new Controls(frame, opts);
  }

  this.frame = frame;
  this.el = dom(tpl);
  this.events = events(this.el, this);
  this.events.bind('click .play', 'onplayclick');
  this.events.bind('click .pause', 'onplayclick');
  this.events.bind('click .mute', 'onplaymute');
  console.log(this.events)
}

// inherit from emitter
emitter(Controls.prototype);

/**
 * Plays the frame. Usually called from
 * the `onplayclick' event handler
 *
 * @api public
 */

Controls.prototype.play = function () {
  this.el.querySelector('.play').classList.add('hidden');
  this.el.querySelector('.pause').classList.remove('hidden');
  this.frame.play();
  this.emit('play');
  return this;
};

/**
 * Pausesthe frame. Usually called from
 * the `onplayclick' event handler
 *
 * @api public

 */
Controls.prototype.pause = function () {
  this.el.querySelector('.pause').classList.add('hidden');
  this.el.querySelector('.play').classList.remove('hidden');
  this.frame.pause();
  this.emit('pause');
  return this;
};

/**
 * Toggles control playback
 *
 * @api public
 */

Controls.prototype.toggle = function () {
  return this.frame.video.paused ? this.play() : this.pause();
};

/**
 * `onplayclick' event handler
 *
 * @api private
 * @param {Event} e
 */

Controls.prototype.onplayclick = function (e) {
  var play = this.el.querySelector('.play');
  var paused = Boolean(this.frame.video.pause);
  e.preventDefault();

  console.log('click')

  if (true == paused) {
    play.classList.remove('pause')
  } else {
    play.classList.add('pause')
  }

  this.toggle();
};

/**
 * `onplaymute' event handler
 *
 * @api private
 * @param {Event} e
 */

Controls.prototype.onplaymute = function (e) {

};

