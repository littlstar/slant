
/**
 * Module dependencies
 */

var Player = require('slant-player')
  , Emitter = require('emitter')
  , overlay = require('overlay')
  , events = require('events')
  , dom = require('domify')
  , raf = require('raf')
  , tpl = require('./template.html')
  , k = require('k')

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

  this.playing = false;
  this.parent = parent;
  this.player = null;
  this.opts = opts;
  this.el = dom(tpl);
  this.k = k(window);

  this.events = events(this.el, this);

  this._overlay = null;
  this._loading = null;
}

// inherit `Emitter'
Emitter(SlantVideo.prototype);

/**
 * Renders video player to instance element
 *
 * @api public
 */

SlantVideo.prototype.render = function () {
  var self = this;
  if (false == this.parent.contains(this.el)) {
    // render
    this.parent.appendChild(this.el);

    // show loading
    this.loading();

    this.opts = this.opts || {};
    this.opts.frame = this.opts.frame || {};

    this.opts.width = this.opts.width || this.width();
    this.opts.height = this.opts.height || this.height();

    this.player = new Player(this.el, this.opts);
    this.player.frame.on('ready', function () {
      raf(function () { self.loading(false); });
    });

    this.player.render();
    this.player.frame.size(this.width(), this.height());
    this.player.frame.on('seek', function () {
      self.loading();
    });

    this.player.frame.on('timeupdate', function () {
      self.loading(false);
    });

    this.player.frame.video.onerrror = function (e) {
      console.error(e);
    };

    this.player.frame.on('playing', function (e) {
      self.player.controls.play(true);
    });

    this.player.frame.on('pause', function (e) {
      self.player.controls.pause(true);
    });

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
  this.playing = true;
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
  this.playing = false;
  this.emit('pause');
  return this;
};

/**
 * Stops video
 *
 * @api public
 */

SlantVideo.prototype.stop = function () {
  this.seek(0);
  this.pause();
  return this;
};

/**
 * Replays video
 *
 * @api public
 */

SlantVideo.prototype.replay  = function () {
  this.seek(0);
  this.play();
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
 * Show overlay
 *
 * @api public
 * @param {Object|Boolean} opts - optional
 */

SlantVideo.prototype.overlay = function (opts) {
  if (false === opts) {
    if (null != this._overlay) {
      this._overlay.remove();
      this._overlay = null;
    }
  } else {
    // remove any existing overlays
    this.overlay(false);

    // ensure `opts' is an object
    opts = 'object' == typeof opts ? opts : {};

    // set target defaulting to instance node
    opts.target = opts.target || this.el;

    // init
    this._overlay = overlay(opts);

    // set body if defined
    if ('string' == typeof opts.body) {
      this._overlay.el.innerHTML = opts.body;
    } else if (opts.body instanceof Element) {
      this._overlay.el.appendChild(opts.body);
    }

    // show
    this._overlay.show();
    this.emit('overlay', this._overlay);
  }

  return this;
};

/**
 * Toggles loading view
 *
 * @api public
 * @param {Boolean} show
 */

SlantVideo.prototype.loading = function (show) {
  if (false == show) {
    this.overlay(false);
  } else {
    this.overlay(false).overlay({
      body: require('./loading.html')
    });
  }

  return this;
};
