
/**
 * Module dependencies
 */

var Player = require('slant-player')
  , dom = require('domify')
  , Emitter = require('emitter')
  , Dialog = require('./dialog')
  , tpl = require('./template.html')

/**
 * Creates a new slant player attached to
 * `el'
 *
 * @api public
 * @param {Element} el
 * @param {Object} opts - optional
 */

module.exports = slant;
function slant (el, opts) {
  return slant.createPlayer();
}

/**
 * Creates a new `SlantVideo' player
 *
 * @api public
 * @param {Element} el
 * @param {Object} opts - optional
 */

slant.createPlayer = function (el, opts) {
  return new SlantVideo(el, opts);
};

/**
 * `SlantVideo' constructor
 *
 * @api public
 * @param {Element} parent
 * @param {Object} opts - optional
 */

function SlantVideo (parent, opts) {
  if (!(this instanceof SlantVideo)) {
    return new SlantVideo(parent, opts);
  }

  opts = opts || {};
  this.el = dom(tpl);
  this.parent = parent;
  this.opts = opts;
  this.player = null;
}

// inherit `Emitter'
Emitter(SlantVideo.prototype);

/**
 * Renders video player to instance element
 *
 * @api public
 */

SlantVideo.prototype.render = function () {
  if (false == this.parent.contains(this.el)) {
    this.parent.appendChild(this.el);
    this.opts.width = this.width();
    this.opts.height = this.height();
    this.player = new Player(this.el, this.opts);
    this.player.render();
    this.player.frame.size(this.width(), this.height());
    this.emit('render');
  }
  return this;
};

/**
 * Set or get video player height
 *
 * @api public
 * @param {Number} height - optional
 */

SlantVideo.prototype.height = function (height) {
  if (null == height) {
    return parseFloat(getComputedStyle(this.el, null).height);
  }

  if ('number' == typeof height) {
    this.el.style.height = height + 'px';
  } else {
    this.el.style.height = height;
  }
  return this;
};

/**
 * Set or get video player width
 *
 * @api public
 * @param {Number} width - optional
 */

SlantVideo.prototype.width = function (width) {
  if (null == width) {
    return parseFloat(getComputedStyle(this.el, null).width);
  }

  if ('number' == typeof width) {
    this.el.style.width = width + 'px';
  } else {
    this.el.style.width = width;
  }
  return this;
};

/**
 * Installs plugin
 *
 * @api public
 * @param {Function} fn
 */

SlantVideo.prototype.use = function (fn) {
  fn(this);
  this.emit('plugin', fn);
  return this;
};

/**
 * Plays video player
 *
 * @api public
 */

SlantVideo.prototype.play = function () {
  this.player.play();
  this.emit('play');
  return this;
};

/**
 * Pauses video player
 *
 * @api public
 */

SlantVideo.prototype.pause = function () {
  this.player.pause();
  this.emit('pause');
  return this;
};

/**
 * Seeks video player in seconds
 *
 * @api public
 * @param {Number} seconds
 */

SlantVideo.prototype.seek = function (seconds) {
  this.player.seek(seconds);
  this.emit('seek', seconds);
  return this;
};

/**
 * Sets video player volume level
 *
 * @api public
 * @param {Number} level
 */

SlantVideo.prototype.volume = function (level) {
  this.player.volume(level);
  this.emit('volume', level);
  return this;
};

/**
 * Mutes video player
 *
 * @api public
 */

SlantVideo.prototype.mute = function () {
  this.player.mute();
  this.emit('mute');
  return this;
};

/**
 * Shows video player
 *
 * @api public
 */

SlantVideo.prototype.show = function () {
  delete this.el.style.display;
  this.emit('show');
  return this;
};

/**
 * Hides video player
 *
 * @api public
 */

SlantVideo.prototype.hide = function () {
  this.el.style.display = 'none';
  this.emit('hide');
  return this;
};

/**
 * Shows video player dialog with optional
 * title and body
 *
 * @api public
 * @param {String} title - optional
 * @param {String} body
 */

SlantVideo.prototype.dialog = function (title, body) {

  this.emit('dialog');
  return this;
};

/**
 * Toggles loading view
 *
 * @api public
 * @param {Boolean} show
 */

SlantVideo.prototype.loading = function (show) {
  return this;
};
