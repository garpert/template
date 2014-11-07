/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert, Brian Woodward, contributors.
 * Licensed under the MIT license.
 */

'use strict';

var should = require('should');
var Template = require('..');
var template;


describe('.getType()', function() {
  beforeEach(function() {
    template = new Template();
  });

  it('should get all built-in templates of `type: renderable`:', function () {
    template.page('abc.md', '<%= abc %>');
    template.getType('renderable').should.be.an.object;
    template.getType('renderable').should.have.property('pages');
    template.getType('renderable').pages.should.have.property('abc.md');
  });

  it('should get all custom templates of `type: renderable`:', function () {
    template.create('post', { isRenderable: true });
    template.post('xyz.md', '<%= abc %>');
    template.getType('renderable').should.be.an.object;
    template.getType('renderable').should.have.property('posts');
    template.getType('renderable').posts.should.have.property('xyz.md');
  });

  it('should get all templates of built-in `type: partial`:', function () {
    template.create('include', { isPartial: true });
    template.partial('abc.md', '<%= abc %>');
    template.include('xyz.md', '<%= abc %>');

    template.getType('partial').should.be.an.object;
    template.getType('partial').should.have.property('partials');
    template.getType('partial').should.have.property('includes');
    template.getType('partial').partials.should.have.property('abc.md');
    template.getType('partial').includes.should.have.property('xyz.md');
  });

  it('should get all templates of custom `type: partial`:', function () {
    template.create('include', { isPartial: true });
    template.include('xyz.md', '<%= abc %>');

    template.getType('partial').should.be.an.object;
    template.getType('partial').should.have.property('includes');
    template.getType('partial').includes.should.have.property('xyz.md');
  });

  it('should get all templates of `type: layout`:', function () {
    template.create('block', { isLayout: true });
    template.layout('abc.md', '<%= abc %>');
    template.block('xyz.md', '<%= abc %>');

    template.getType('layout').should.be.an.object;
    template.getType('layout').should.have.property('layouts');
    template.getType('layout').should.have.property('blocks');
    template.getType('layout').layouts.should.have.property('abc.md');
    template.getType('layout').blocks.should.have.property('xyz.md');
  });
});
