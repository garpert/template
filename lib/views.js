'use strict';

var util = require('util');
var path = require('path');
var recent = require('recent');
var Collection = require('./collection');
var utils = require('./utils');
var View = require('./view');

/**
 * Create an instance of `Views`.
 *
 * @api public
 */

function Views() {
  Collection.apply(this, arguments);
  utils.defineProp(this, 'data', {});
}

util.inherits(Views, Collection);

/**
 * Views prototype methods
 */

utils.object.delegate(Views.prototype, {

  /**
   * Set a view on the collection.
   */

  set: function (key, val) {
    this.app.keep(val.path, key, this.options.collection);
    this[key] = new View(val, this, this.app);
    return this;
  },

  /**
   * Load views onto the collection.
   */

  loader: function(/*options, stack*/) {
    var set = this.app.loaders.set;
    var args = [].slice.call(arguments);
    var name = this.options.collection;
    set.apply(set, [name].concat(args));
    return this;
  },

  /**
   * Render a view in the collection.
   *
   * @param  {String|Object} `view` View key or object.
   * @param  {Object} `locals`
   * @param  {Function} `fn`
   * @return {Object}
   */

  render: function (view/*, locals, fn*/) {
    var args = [].slice.call(arguments, 1);
    var app = this.app;
    if (typeof view === 'string') {
      view = this[view];
    }
    app.render.apply(app, [view].concat(args));
    return this;
  },

  /**
   * Set view types for the collection.
   *
   * @param {String} `plural` e.g. `pages`
   * @param {Object} `options`
   * @api private
   */

  viewType: function() {
    this.options.viewType = utils.arrayify(this.options.viewType || []);
    if (this.options.viewType.length === 0) {
      this.options.viewType.push('renderable');
    }
    return this.options.viewType;
  },

  /**
   * Rename template keys.
   */

  renameKey: function (fp, fn) {
    if (typeof fn !== 'function') {
      fn = this.options.renameKey;
    }
    if (typeof fn !== 'function') {
      fn = path.basename;
    }
    return fn(fp);
  },


  /**
   * Filter views by the given `prop`, using the specified `pattern` and `options.
   *
   * @param  {String} `prop` The property to sort by.
   * @param  {String|Object|Array|Function} `pattern` Function, glob patterns, object, array, or string pattern to use for pre-filtering views.
   * @param  {Object} `options`
   * @option  {Object} `limit` [options]
   * @option  {Object} `limit` [options]
   * @return {Object}
   */

  filter: function (prop, pattern, options) {
    options = options || {};
    var views = this;
    var res = Object.create(this);

    var matcher = pattern ? utils.isMatch(pattern, options) : null;

    for (var key in views) {
       if (views.hasOwnProperty(key)) {
        var file = views[key];
        if (prop === 'key') {
          if (matcher) {
            if (matcher(path.relative(process.cwd(), key))) {
              res[key] = file;
            }
          } else {
            res[key] = file;
          }
        } else {
          var val = utils.get(file, prop);
          if (prop === 'path' || prop === 'cwd') {
            val = path.relative(process.cwd(), val);
          }
          if (utils.hasValues(val)) {
            if (matcher) {
              if (matcher(val)) {
                res[key] = file;
              }
            } else {
              res[key] = file;
            }
          }
        }
      }
    }
    return res;
  },

  /**
   * Return the most recent items from a collection. By default, one of
   * the following properties will be used for sorting, and in the order
   * specified: `key`, `path`, or `data.date`.
   *
   * @param  {String} `prop` The property to sort by.
   * @param  {String|Object|Array|Function} `pattern` Function, glob patterns, object, array, or string pattern to use for pre-filtering files.
   * @param  {Object} `options` Options to pass to [micromatch] if glob patterns are used.
   * @return {Object}
   */

  recent: function(prop, pattern, options) {
    var views = this.filter.apply(this, arguments) || this;
    var res = recent(views, options);
    return this.forward(res);
  }
});

/**
 * Expose `Views`
 */

module.exports = Views;