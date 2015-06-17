/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
 */

'use strict';

require('should');
var assert = require('assert');
var Template = require('./app');
var template;

describe('template view', function () {
  beforeEach(function () {
    template = new Template();
    template.create('doc');
    template.create('include');
    template.doc('abc', {content: 'This is a document'});
    template.include('xyz', {content: 'This is an include.'});
  });

  describe('.getViews', function () {
    it('should get a view type from `template.views`.', function () {
      assert.equal(typeof template.getViews('partials'), 'object');
      assert.equal(typeof template.getViews('layouts'), 'object');
      assert.equal(typeof template.getViews('pages'), 'object');
    });
  });

  describe('should decorate custom `.get` methods onto template subtypes:', function () {
    it('should get a `doc` with the `.getDoc()` method:', function () {
      assert.equal(typeof template.getDoc('abc'), 'object');
      template.getDoc('abc').should.have.property('content', 'This is a document');
      template.getDoc('abc').should.have.property('path', 'abc');
    });

    it('should get an `include` with the `.getInclude()` method:', function () {
      assert.equal(typeof template.getInclude('xyz'), 'object');
      template.getInclude('xyz').should.have.property('content', 'This is an include.');
      template.getInclude('xyz').should.have.property('path', 'xyz');
    });
  });
});
