
/**
 * Module dependencies
 */

var three = require('./vendor/three')
  , tpl = require('./views/frame.html')
  , dom = require('domify')
  , emitter = require('emitter')
  , events = require('events')
  , raf = require('raf')

/**
 * `Frame' consructor
 *
 * @api public
 * @param {Object} opts
 */

module.exports = Frame;
function Frame (opts) {
  if (!(this instanceof Frame)) {
    return new Frame(opts);
  }

  var self = this;

  this.opts = (opts = opts || {});
  this.events = {};

  opts.fov = opts.fov || 40;

  // init view
  this.el = dom(tpl);
  this.video = this.el.querySelector('video');
  this.video.style.display = 'none';
  this.video.preload = opts.preload;
  this.video.autoplay = opts.autoplay;
  this.src(opts.src);

  if (opts.parent) {
    opts.parent.appendChild(this.el);
  }

  // event delagation
  this.events = {};

  // init video events
  this.events.video = events(this.video, this);
  this.events.video.bind('canplaythrough');
  this.events.video.bind('progress');
  this.events.video.bind('timeupdate');
  this.events.video.bind('ended');

  // init dom element events
  this.events.element = events(this.el, this);
  this.events.element.bind('mousemove');
  this.events.element.bind('mousewheel');
  this.events.element.bind('mousedown');
  this.events.element.bind('mouseup');

  opts.width = parseInt(opts.width || getComputedStyle(this.el).width);
  opts.height = parseInt(opts.height || getComputedStyle(this.el).height);

  // init scene
  this.scene = new three.Scene();

  // init camera
  this.camera = new three.PerspectiveCamera(
    opts.fov,
    (opts.width / opts.height) | 0,
    0.1, 1000);

  // init renderer
  this.renderer = new three.WebGLRenderer();
  this.renderer.setSize(opts.width, opts.height);
  this.renderer.autoClear = false;
  this.renderer.setClearColor(0x333333, 1);

  // init video texture
  this.texture = new three.Texture(this.video);
  this.texture.format = three.RGBFormat;
  this.texture.minFilter = three.LinearFilter;
  this.texture.magFilter = three.LinearFilter;
  this.texture.generateMipmaps = false;

  this.geo = new three.SphereGeometry(500, 80, 50);
  this.material = new three.MeshBasicMaterial({map: this.texture});
  this.mesh = new three.Mesh(this.geo, this.material);
  this.mesh.scale.x = -1; // mesh

  // attach renderer to instance node container
  this.el.querySelector('.container').appendChild(this.renderer.domElement);

  // viewport state
  this.state = {
    percentloaded: 0,
    timestamp: Date.now(),
    dragstart: {},
    event: null,
    theta: 0,
    width: opts.width,
    height: opts.height,
    phi: 0,
    lat: 0,
    lon: 0,
    fov: opts.fov
  };

  // add mesh to scene
  this.scene.add(this.mesh);

  raf(function loop () {
    self.refresh();
    raf(loop);
  });
}

// mixin `Emitter'
emitter(Frame.prototype);

/**
 * Handle `oncanplaythrough' event
 *
 * @api private
 * @param {Event} e
 */

Frame.prototype.oncanplaythrough = function (e) {
  if (true == this.opts.autoplay) {
    this.video.play();
  }

  this.emit('canplaythrough', e);
  this.emit('ready');
};

/**
 * Handle `onprogress' event
 *
 * @api private
 * @param {Event} e
 */

Frame.prototype.onprogress = function (e) {
  var video = this.video;
  var percent = 0;

  try {
    percent = video.buffered.end(0) / video.duration;
  } catch (e) {
    try {
      percent = video.bufferedBytes / video.bytesTotal;
    } catch (e) { }
  }

  e.percent = percent;
  this.state.percentloaded = percent;
  this.emit('progress', e);
  this.emit('state', this.state);
};

/**
 * Handle `ontimeupdate' event
 *
 * @api private
 * @param {Event} e
 */

Frame.prototype.ontimeupdate = function (e) {
  e.percent = this.video.currentTime / this.video.duration * 100;
  this.state.percentloaded = e.percent;
  this.emit('timeupdate', e);
  this.emit('state', this.state);
};

/**
 * Handle `onended' event
 *
 * @api private
 * @param {Event} e
 */

Frame.prototype.onended = function (e) {
  this.emit('end');
  this.emit('ended');
};

/**
 * Handle `onmousedown' event
 *
 * @api private
 * @param {Event} e
 */

Frame.prototype.onmousedown = function (e) {
  this.state.dragstart.x = e.pageX;
  this.state.dragstart.y = e.pageY;
  this.state.mousedown = true;
  this.emit('mousedown', e);
  this.emit('state', this.state);
};

/**
 * Handle `onmouseup' event
 *
 * @api private
 * @param {Event} e
 */

Frame.prototype.onmouseup = function (e) {
  this.state.mousedown = false;
  this.emit('mouseup', e);
  this.emit('state', this.state);
};

/**
 * Handle `onmousemove' event
 *
 * @api private
 * @param {Event} e
 */

Frame.prototype.onmousemove = function (e) {
  var x = 0;
  var y = 0;

  if (true == this.state.mousedown) {
    x = e.pageX - this.state.dragstart.x;
    y = e.pageY - this.state.dragstart.y;

    this.state.dragstart.x = e.pageX;
    this.state.dragstart.y = e.pageY;

    this.state.lon += x;
    this.state.lat -= y;
  }

  this.emit('mousemove', e);
  this.emit('state', this.state);
};

/**
 * Handle `onmousewheel' event
 *
 * @api private
 * @param {Event} e
 */

Frame.prototype.onmousewheel = function (e) {
  var min = 3;
  var max = 100;
  var vel = -0.05; // velocity

  e.preventDefault();

  if (null != e.wheelDeltaY) { // chrome
    this.state.fov -= e.wheelDeltaY * vel;
  } else if (null != e.wheelDelta ) { // ie
    this.state.fov -= event.wheelDelta * vel;
  } else if (null != e.detail) { // firefox
    this.state.fov += e.detail * 1.0;
  }

  if (this.state.fov < min) {
    this.state.fov = min;
  } else if (this.fov > max) {
    this.state.fov = max;
  }

  this.camera.setLens(this.state.fov);

  this.emit('mousewheel', e);
  this.emit('state', this.state);
};

/**
 * Sets frame size
 *
 * @api public
 * @param {Number} width
 * @param {Number} height
 */

Frame.prototype.size = function (width, height) {
  this.renderer.setSize(
    (this.state.width = width),
    (this.state.height = height));
  return this;
};

/**
 * Sets or gets video src
 *
 * @api public
 * @param {String} src - optional
 */

Frame.prototype.src = function (src) {
  return (src ?
    ((this.video.src = src), this) :
    this.video.src);
};

/**
 * Plays video frame
 *
 * @api public
 */

Frame.prototype.play = function () {
  this.video.play();
  this.emit('play');
  return this;
};

/**
 * Pauses video frame
 *
 * @api public
 */

Frame.prototype.pause = function () {
  this.video.pause();
  this.emit('pause');
  return this;
};

/**
 * Pauses video frame
 *
 * @api public
 */

Frame.prototype.refresh = function () {
  var now = Date.now();
  if (now - this.state.timestamp >= 32) {
    this.state.timestamp = now;
    this.texture.needsUpdate = true;
  }
  this.emit('refresh');
  this.emit('state', this.state);
  return this.draw();
};

Frame.prototype.use = function (fn) {
  fn(this);
  return this;
};

Frame.prototype.draw = function () {
  var camera = this.camera;
  var scene = this.scene;
  var renderer = this.renderer;

  var theta = this.state.theta = this.state.lon * Math.PI / 180;
  var lat = this.state.lat = Math.max(-85, Math.min(85, this.state.lat));
  var phi = this.state.phi = (90 - this.state.lat) * Math.PI / 180;

  var x = 500 * Math.sin(this.state.phi) * Math.cos(this.state.theta);
  var y = 500 * Math.cos(this.state.phi);
  var z = 500 * Math.sin(this.state.phi) * Math.sin(this.state.theta);

  var vec = new three.Vector3(x, y, z);
  camera.lookAt(vec);
  camera.position.x = -x;
  camera.position.y = -y;
  camera.position.z = -z;

  renderer.clear();
  renderer.render(scene, camera);

  this.emit('draw');
  this.emit('state', this.state);
  return this;
};

