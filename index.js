
/**
 * Module dependencies
 */

var Player = require('./player')

/**
 * Creates a new slant player attached to
 * `el'
 *
 * @api public
 * @param {Element} el
 * @param {Object} opts
 */

module.exports = slant;
function slant (el, opts) {
  return new Player(el, opts);
}
