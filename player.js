
/**
 * Module dependencies
 */

var tpl = require('./views/player.html')
  , dom = require('domify')
  , Frame = require('./frame')
  , Controls = require('./controls')
  , emitter = require('emitter')

/**
 * `Player' constructor
 *
 * @api public
 * @param {Element} el
 * @param {Object} opts
 */

module.exports = Player;
function Player (el, opts) {
  if (!(this instanceof Player)) {
    return new Player(opts);
  }

  var style = getComputedStyle(el);
  var width = opts.width || parseInt(style.width);
  var height = opts.height || parseInt(style.height);

  // init node
  this.el = dom(tpl);
  el.appendChild(this.el);

  // init video frame
  this.frame = new Frame({
    parent: this.el,
    height: height,
    width: width,
    src: opts.src
  });

  // init frame controls
  this.controls = new Controls(this.frame, {});

  // render controls
  this.el.appendChild(this.controls.el);
}

// mixin `Emitter'
emitter(Player.prototype);

/**
 * Player active video
 *
 * @api public
 */

Player.prototype.play = function () {
  this.controls.play();
  return this;
};

/**
 * Pause active video
 *
 * @api public
 */

Player.prototype.pause = function () {
  this.controls.pause();
  return this;
};

/**
 * Use plugin with player
 *
 * @api public
 * @param {Function} fn
 */

Player.prototype.use = function (fn) {
  fn(this);
  return this;
};

/**
 * Show video player
 *
 * @api public
 */

Player.prototype.show = function () {
  this.el.style.display = '';
  return this;
};

/*
 * Hide video player
 *
 * @api public
 */

Player.prototype.hide = function () {
  this.el.style.display = 'none';
  return this;
};
