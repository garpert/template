'use strict';

/* deps: mocha */
var util = require('util');
var assert = require('assert');
var should = require('should');
var forOwn = require('for-own');
var Base = require('../lib/base');
var Item = require('../lib/item');
var View = require('../lib/view');
var List = require('../lib/list');
var Collection = require('../lib/collection');

describe('List', function () {
  it('should create a new instance of List:', function () {
    var list = new List();
    assert.equal(list instanceof List, true);
    assert.equal(list instanceof Base, true);
  });

  it('should contain an `options` property', function () {
    var list = new List({});
    assert.deepEqual(list.options, {});
    assert.equal(list.hasOwnProperty('options'), true);
  });

  it('should contain an `app` property', function () {
    var list = new List({app: {}});
    assert.deepEqual(list.app, {});
    assert.equal(list.hasOwnProperty('app'), true);
  });

  it('should contain a `data` property', function () {
    var list = new List({app: {}});
    assert.deepEqual(list.data, {});
    assert.equal(list.hasOwnProperty('data'), true);
  });

  it('should contain a `_cache` property', function () {
    var list = new List({app: {}});
    assert.deepEqual(list._cache, {});
    assert.equal(list.hasOwnProperty('_cache'), true);
  });

  it('should cache a function call', function () {
    var list = new List();
    function foo (bar) {
      return function () {
        return bar;
      };
    };

    var bar1 = list.fragmentCache('foo', foo('bar1'));
    var bar2 = list.fragmentCache('foo', foo('bar2'));
    assert.equal(bar1, 'bar1');
    assert.equal(bar2, 'bar1');
    assert.equal(bar2, bar1);
  });

  it('should set properties on the object', function () {
    var list = new List();
    list.set('foo', 'bar');
    assert.equal(list.foo, 'bar');
  });

  it('should get properties from the object', function () {
    var list = new List();
    list.set('foo', 'bar');
    assert.equal(list.get('foo'), 'bar');
  });

  it('should clone the entire object', function () {
    var list = new List();
    list.set('foo', 'bar');
    var clone = list.clone();
    assert.equal(clone.get('foo'), list.get('foo'));
    assert.deepEqual(clone, list);
  });

  it('should set an option', function () {
    var list = new List();
    list.option('foo', 'bar');
    assert.deepEqual(list.options, {foo: 'bar'});
  });

  it('should get an option', function () {
    var list = new List({foo: 'bar'});
    assert.equal(list.option('foo'), 'bar');
  });

  it('should emit an `option` event when setting an option', function () {
    var list = new List();
    list.on('option', function (key, val) {
      assert.equal(key, 'foo');
      assert.equal(val, 'bar');
    });
    list.option('foo', 'bar');
  });

  it('should `enable` an option', function () {
    var list = new List();
    list.enable('foo');
    assert.equal(list.option('foo'), true);
  });

  it('should `disable` an option', function () {
    var list = new List();
    list.disable('foo');
    assert.equal(list.option('foo'), false);
  });

  it('should check if an option is `enabled`', function () {
    var list = new List();
    list.enable('foo');
    list.disable('bar');
    assert.equal(list.enabled('foo'), true);
    assert.equal(list.enabled('bar'), false);
  });

  it('should check if an option is `disabled`', function () {
    var list = new List();
    list.enable('foo');
    list.disable('bar');
    assert.equal(list.disabled('foo'), false);
    assert.equal(list.disabled('bar'), true);
  });

  it('should pick an option from the local `options`', function () {
    var list = new List({foo: 'bar'});
    assert.equal(list.pickOption('foo'), 'bar');
  });

  it('should pick an option from the `app.options`', function () {
    var app = new List({foo: 'bar'});
    var list = new List({app: app});
    assert.equal(list.pickOption('foo'), 'bar');
  });

  it('should `use` a function passing the object and options to the function', function () {
    var list = new List({foo: 'bar'});
    list.use(function (obj, options) {
      assert.deepEqual(obj, list);
      assert.deepEqual(list.options, options);
      assert.deepEqual(this.options, options);
      assert.deepEqual(this.options, list.options);
    });
  });

  it('should omit keys from object', function () {
    var list = new List();
    list.set('foo', 'bar');
    list.set('bar', 'baz');
    list.set('baz', 'bang');
    var clone = list.omit(['bar']);
    assert.equal(typeof clone.bar, 'undefined');
    assert.equal(clone.foo, 'bar');
    assert.equal(clone.baz, 'bang');
  });

  it('should pick only the keys from object', function () {
    var list = new List();
    list.set('foo', 'bar');
    list.set('bar', 'baz');
    list.set('baz', 'bang');
    var clone = list.pick(['bar']);
    assert.equal(clone.bar, 'baz');
    assert.equal(typeof clone.foo, 'undefined');
    assert.equal(typeof clone.baz, 'undefined');
  });

  it('should iterator over `own` keys on object using forOwn', function () {
    var list = new List();
    list.set('foo', 'bar');
    list.set('bar', 'baz');
    list.set('baz', 'bang');
    var keys = ['items', 'foo', 'bar', 'baz'];
    var vals = [list.items, 'bar', 'baz', 'bang'];
    list.forOwn(function (val, key) {
      var expectedKey = keys.shift();
      var expectedVal = vals.shift();
      assert.equal(key, expectedKey);
      assert.equal(val, expectedVal);
    });
  });

  it('should iterator over all keys on object using forIn', function () {
    var list = new List();
    list.set('foo', 'bar');
    list.set('bar', 'baz');
    list.set('baz', 'bang');
    var keys = ['items', 'foo', 'bar', 'baz'];
    var len = keys.length
      + Object.keys(List.prototype).length
      + Object.keys(Base.prototype).length;

    var count = 0;
    list.forIn(function (val, key) {
      count++;
    });
    assert.equal(count, len);
  });

  it('should visit all properties on an object and call the specified method', function () {
    var list = new List();
    var obj = {
      foo: 'bar',
      bar: 'baz',
      baz: 'bang'
    };
    list.visit('set', obj);
    assert.equal(list.get('foo'), 'bar');
    assert.equal(list.get('bar'), 'baz');
    assert.equal(list.get('baz'), 'bang');
  });

  it('should visit all properties on all objects in an array and call the specified method', function () {
    var list = new List();
    var arr = [
      {foo: 'bar', bar: 'baz', baz: 'bang'},
      {bang: 'boom', boom: 'beep'},
      {beep: 'boop', boop: 'bop'}
    ];
    list.visit('set', arr);
    assert.equal(list.get('foo'), 'bar');
    assert.equal(list.get('bar'), 'baz');
    assert.equal(list.get('baz'), 'bang');
    assert.equal(list.get('bang'), 'boom');
    assert.equal(list.get('boom'), 'beep');
    assert.equal(list.get('beep'), 'boop');
    assert.equal(list.get('boop'), 'bop');
  });

  it('should forward method from List to another object', function () {
    var list = new List();
    var obj = {};
    list.forward(obj, ['set', 'get']);
    obj.set('foo', 'bar');
    assert.equal(obj.get('foo'), 'bar');
    assert.equal(list.get('foo'), 'bar');
    assert.equal(list.foo, 'bar');
    assert.equal(obj.foo, null);
  });

  it('should mixin a function by adding it to the List prototype', function () {
    var list = new List();
    list.mixin('upper', function (prop) {
      var val = this.get(prop);
      if (typeof val === 'string') {
        return val.toUpperCase();
      }
      return val;
    });
    list.set('foo', 'bar');
    assert.equal(typeof list.upper, 'function');
    assert.equal(list.upper('foo'), 'BAR');

    var base2 = new List();
    base2.set('bar', 'baz');
    assert.equal(typeof base2.upper, 'function');
    assert.equal(base2.upper('bar'), 'BAZ');
  });

  it('should add items to an items array', function () {
    var collection = new Collection();
    var list = new List();
    list.item('foo', createItem({name: 'foo', content: 'foo'}, {collection: collection}));
    list.item('bar', createItem({name: 'bar', content: 'bar'}, {collection: collection}));
    list.item('baz', createItem({name: 'baz', content: 'baz'}, {collection: collection}));
    list.item('bang', createItem({name: 'bang', content: 'bang'}, {collection: collection}));
    assert.equal(Array.isArray(list.items), true);
    assert.equal(list.items.length, 4);
  });

  it('should add item keys/index to an object', function () {
    var collection = new Collection();
    var list = new List();
    list.item('foo', createItem({name: 'foo', content: 'foo'}, {collection: collection}));
    list.item('bar', createItem({name: 'bar', content: 'bar'}, {collection: collection}));
    list.item('baz', createItem({name: 'baz', content: 'baz'}, {collection: collection}));
    list.item('bang', createItem({name: 'bang', content: 'bang'}, {collection: collection}));
    assert.equal(typeof list.keyMap, 'object');
    assert.equal(Object.keys(list.keyMap).length, 4);
  });

  it('should get the current items on the list', function () {
    var collection = new Collection();
    var list = new List();
    list.item('foo', createItem({name: 'foo', content: 'foo'}, {collection: collection}));
    list.item('bar', createItem({name: 'bar', content: 'bar'}, {collection: collection}));
    list.item('baz', createItem({name: 'baz', content: 'baz'}, {collection: collection}));
    list.item('bang', createItem({name: 'bang', content: 'bang'}, {collection: collection}));
    var keys = list.keyMap;
    assert.deepEqual(Object.keys(keys), ['foo', 'bar', 'baz', 'bang']);
    forOwn(keys, function (item, key) {
      assert.deepEqual(list.items[item], list.item(key));
    });
  });

  it('should set the items on the list', function () {
    var collection = new Collection();
    var items = {};
    items.foo = createItem({name: 'foo', content: 'foo'}, {collection: collection});
    items.bar = createItem({name: 'bar', content: 'bar'}, {collection: collection});
    items.baz = createItem({name: 'baz', content: 'baz'}, {collection: collection});
    items.bang = createItem({name: 'bang', content: 'bang'}, {collection: collection});
    var list = new List({items: items});
    assert.deepEqual(Object.keys(items), ['foo', 'bar', 'baz', 'bang']);
    assert.deepEqual(Object.keys(list.keyMap), ['foo', 'bar', 'baz', 'bang']);
    forOwn(items, function (item, key) {
      assert.deepEqual(item, list.item(key));
    });
  });

  it('should sort the items by the key', function () {
    var collection = new Collection();
    var list = new List();
    list.item('foo', createItem({name: 'foo', content: 'foo'}, {collection: collection}));
    list.item('bar', createItem({name: 'bar', content: 'bar'}, {collection: collection}));
    list.item('baz', createItem({name: 'baz', content: 'baz'}, {collection: collection}));
    list.item('bang', createItem({name: 'bang', content: 'bang'}, {collection: collection}));
    assert.deepEqual(Object.keys(list.keyMap), ['foo', 'bar', 'baz', 'bang']);
    list.sortBy();
    assert.deepEqual(Object.keys(list.keyMap), ['bang', 'bar', 'baz', 'foo']);
  });

  it('should sort the items a property', function () {
    var collection = new Collection();
    var list = new List();
    list.item('foo', createItem({name: 'a-foo', content: 'foo'}, {collection: collection}));
    list.item('bar', createItem({name: 'y-bar', content: 'bar'}, {collection: collection}));
    list.item('baz', createItem({name: 'x-baz', content: 'baz'}, {collection: collection}));
    list.item('bang', createItem({name: 'w-bang', content: 'bang'}, {collection: collection}));
    assert.deepEqual(Object.keys(list.keyMap), ['foo', 'bar', 'baz', 'bang']);
    list.sortBy('name');
    assert.deepEqual(Object.keys(list.keyMap), ['foo', 'bang', 'baz', 'bar']);
  });

  it('should be chainable', function () {
    var collection = new Collection();
    var list = new List();
    list.item('foo', createItem({name: 'a-foo', order: '20', content: 'foo'}, {collection: collection}));
    list.item('bar', createItem({name: 'y-bar', order: '10', content: 'bar'}, {collection: collection}));
    list.item('baz', createItem({name: 'x-baz', order: '30', content: 'baz'}, {collection: collection}));
    list.item('bang', createItem({name: 'w-bang', order: '40', content: 'bang'}, {collection: collection}));
    assert.deepEqual(Object.keys(list.keyMap), ['foo', 'bar', 'baz', 'bang']);
    list
      .sortBy('name')
      .sortBy('order');
    assert.deepEqual(Object.keys(list.keyMap), ['bar', 'foo', 'baz', 'bang']);
  });

  it.skip('should group the items by a property', function () {
    // instantiate `Collection`, so we can borrow collection methods in list items
    var collection = new Collection();
    var list = new List();
    var opts = {collection: collection};

    list.item('post-1.md', createItem({categories: {one: ['A']}, name: 'Post 1', content: 'Post 1'}, opts));
    list.item('post-2.md', createItem({categories: {one: ['A'], two: ['B', 'C']}, name: 'Post 2', content: 'Post 2'}, opts));
    list.item('post-3.md', createItem({categories: {one: ['B'], two: ['C', 'D']}, name: 'Post 3', content: 'Post 3'}, opts));
    list.item('post-4.md', createItem({categories: {three: ['B'], four: ['E', 'F', 'G']}, name: 'Post 4', content: 'Post 4'}, opts));
    list.item('post-5.md', createItem({categories: {four: ['C', 'F']}, name: 'Post 5', content: 'Post 5'}, opts));
    list.item('post-6.md', createItem({categories: {four: ['F', 'G']}, name: 'Post 6', content: 'Post 6'}, opts));

    var groups = list.groupBy('categories', function (obj, key) {
      return obj.categories;
    });

    var categoryKeys = Object.keys(groups);
    assert.equal(categoryKeys.length, 4);
    categoryKeys.forEach(function (key, i) {
      var category = groups[key];
      // console.log(category.items[0])

      // make sure that all the items in the list
      // are equal to the items in the categories
      for (var key in category) {
        if (category.hasOwnProperty(key)) {
          var item = category[key];
      console.log(item)
          // assert.deepEqual(item, list.getItem(item.key));
        }
      }
    });
  });

  it('should paginate items in the list', function () {
    var view = new View(createView(), createViewOptions());
    var collection = new Collection();
    var list = new List();
    list.item('post-1.md', createItem({categories: {one: ['A']}, name: 'Post 1', content: 'Post 1'}, {collection: collection}));
    list.item('post-2.md', createItem({categories: {one: ['A'], two: ['B', 'C']}, name: 'Post 2', content: 'Post 2'}, {collection: collection}));
    list.item('post-3.md', createItem({categories: {one: ['B'], two: ['C', 'D']}, name: 'Post 3', content: 'Post 3'}, {collection: collection}));
    list.item('post-4.md', createItem({categories: {three: ['B'], four: ['E', 'F', 'G']}, name: 'Post 4', content: 'Post 4'}, {collection: collection}));
    list.item('post-5.md', createItem({categories: {four: ['C', 'F']}, name: 'Post 5', content: 'Post 5'}, {collection: collection}));
    list.item('post-6.md', createItem({categories: {four: ['F', 'G']}, name: 'Post 6', content: 'Post 6'}, {collection: collection}));
    list.item('post-7.md', createItem({categories: {four: ['F', 'G']}, name: 'Post 7', content: 'Post 7'}, {collection: collection}));


    var pages = list.paginate(view, {limit: 2});
    assert.equal(pages.items.length, 4);
    assert.deepEqual(pages.keyMap, {'page-1': 0, 'page-2': 1, 'page-3': 2, 'page-4': 3});

    pages.forEach(function (page, i) {
      switch (i) {
        case 0:
          assert.equal(page.data.pagination.items.length, 2);
          assert.deepEqual(page.data.pagination.keyMap, {'post-1.md': 0, 'post-2.md': 1});
          break;
        case 1:
          assert.equal(page.data.pagination.items.length, 2);
          assert.deepEqual(page.data.pagination.keyMap, {'post-3.md': 0, 'post-4.md': 1});
          break;
        case 2:
          assert.equal(page.data.pagination.items.length, 2);
          assert.deepEqual(page.data.pagination.keyMap, {'post-5.md': 0, 'post-6.md': 1});
          break;
        case 3:
          assert.equal(page.data.pagination.items.length, 1);
          assert.deepEqual(page.data.pagination.keyMap, {'post-7.md': 0});
          break;
      }

      // make sure that all the items in the list
      // are equal to the items in the categories
      page.data.pagination.forEach(function (item) {
        assert.deepEqual(item, list.item(item.key));
      });
    });
  });

  it.skip('should group and paginate the items by a property', function () {
    var view = new View(createView(), createViewOptions());
    var collection = new Collection();
    var list = new List();
    list.item('post-1.md', createItem({categories: {one: ['A']}, name: 'Post 1', content: 'Post 1'}, {collection: collection}));
    list.item('post-2.md', createItem({categories: {one: ['A'], two: ['B', 'C']}, name: 'Post 2', content: 'Post 2'}, {collection: collection}));
    list.item('post-3.md', createItem({categories: {one: ['B'], two: ['C', 'D']}, name: 'Post 3', content: 'Post 3'}, {collection: collection}));
    list.item('post-4.md', createItem({categories: {three: ['B'], four: ['E', 'F', 'G']}, name: 'Post 4', content: 'Post 4'}, {collection: collection}));
    list.item('post-5.md', createItem({categories: {four: ['C', 'F']}, name: 'Post 5', content: 'Post 5'}, {collection: collection}));
    list.item('post-6.md', createItem({categories: {four: ['F', 'G']}, name: 'Post 6', content: 'Post 6'}, {collection: collection}));
    var categoryGroups = list.groupBy('categories', function (categories) {
      if (categories == null) return;
      return Object.keys(categories);
    });
    var categoryKeys = Object.keys(categoryGroups);
    assert.equal(categoryKeys.length, 4);
    assert.deepEqual(categoryKeys, ['one', 'two', 'three', 'four']);

    categoryKeys.forEach(function (key, i) {
      var category = categoryGroups[key];
      var pages = category.paginate(view, {limit: 2});
      pages.forEach(function (page) {
        page.data.pagination.forEach(function (post) {
          assert.deepEqual(post, list.item(post.key));
        });
      });
    });
  });

});

function createApp (app) {
  app = app || new Base({});
  app.handleView = function () {};
  return app;
}

function createItem(obj, options) {
  var item = new Item(options);
  item.visit('set', obj);
  return item;
}

function createView (view) {
  view = view || {};
  view.path = view.path || 'list.hbs';
  view.content = view.content || 'list';
  return view;
}

function createViewOptions (options) {
  options = options || {};
  options.app = options.app || createApp();
  options.collection = options.collection || new Base({app: options.app, collection: 'lists'});
  return options;
}

