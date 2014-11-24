/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014 Jon Schlinkert, contributors
 * Licensed under the MIT License (MIT)
 */

'use strict';

var fs = require('fs');
var path = require('path');
var should = require('should');
var consolidate = require('consolidate');
var Template = require('..');
var template = new Template();


describe('template.render()', function () {
  beforeEach(function (done) {
    template = new Template();
    done();
  });

  describe('`this` object:', function () {
    it('should expose `this` to the .render() method:', function (done) {
      template.render('<%= name %>', {name: 'Jon Schlinkert'}, function (err, content) {
        if (err) console.log(err);
        this.should.have.properties(['cache', 'options', 'engines', 'delims']);
        done();
      });
    });
  });

  describe('when an un-cached string is passed to `.render()`:', function () {
    it('should detect the engine from `ext` (with dot) on locals:', function (done) {
      template.render('<%= name %>', {name: 'Jon Schlinkert', ext: '.html'}, function (err, content) {
        if (err) console.log(err);
        content.should.equal('Jon Schlinkert');
        done();
      });
    });

    it('should detect the engine from `ext` (without dot) on locals:', function (done) {
      template.render('<%= name %>', {name: 'Jon Schlinkert', ext: 'html'}, function (err, content) {
        if (err) console.log(err);
        content.should.equal('Jon Schlinkert');
        done();
      });
    });

    it('should detect the engine from `engine` (with dot) on locals:', function (done) {
      template.render('<%= name %>', {name: 'Jon Schlinkert', engine: '.html'}, function (err, content) {
        if (err) console.log(err);
        content.should.equal('Jon Schlinkert');
        done();
      });
    });

    it('should detect the engine from `engine` (without dot) on locals:', function (done) {
      template.render('<%= name %>', {name: 'Jon Schlinkert', engine: 'html'}, function (err, content) {
        if (err) console.log(err);
        content.should.equal('Jon Schlinkert');
        done();
      });
    });
  });

  describe('when the name of a cached template is passed to `.render()`:', function () {
    it('should find the template and render it:', function (done) {
      template.page('aaa.md', '<%= name %>', {name: 'Jon Schlinkert'});

      template.render('aaa.md', function (err, content) {
        if (err) console.log(err);
        content.should.equal('Jon Schlinkert');
        done();
      });
    });

    it('should render the first matching template if dupes are found:', function (done) {
      template.page('aaa.md', '<%= name %>', {name: 'Brian Woodward'});
      template.create('post', 'posts', { isRenderable: true });
      template.post('aaa.md', '<%= name %>', {name: 'Jon Schlinkert'});

      template.render('aaa.md', function (err, content) {
        if (err) console.log(err);
        content.should.equal('Brian Woodward');
        done();
      });
    });
  });

  describe('engine render:', function () {
    it('should determine the engine from the `path` on the given object:', function (done) {
      var file = {path: 'a/b/c.md', content: '<%= name %>', locals: {name: 'Jon Schlinkert'}};

      template.render(file, function (err, content) {
        if (err) console.log(err);
        content.should.equal('Jon Schlinkert');
        done();
      });
    });

    it('should determine the engine from the `path` on the given object:', function (done) {
      var file = {path: 'a/b/c.md', content: '<%= name %>'};

      template.render(file, {name: 'Jon Schlinkert'}, function (err, content) {
        if (err) console.log(err);
        content.should.equal('Jon Schlinkert');
        done();
      });
    });

    it('should render content with an engine from [consolidate].', function (done) {
      template.engine('hbs', consolidate.handlebars);
      var hbs = template.getEngine('hbs');

      hbs.render('{{name}}', {name: 'Jon Schlinkert'}, function (err, content) {
        if (err) console.log(err);
        content.should.equal('Jon Schlinkert');
        done();
      });
    });

    it('should use `file.path` to determine the correct consolidate engine to render content:', function (done) {
      template.engine('hbs', consolidate.handlebars);
      template.engine('swig', consolidate.swig);
      template.engine('tmpl', consolidate.lodash);

      var files = [
        {path: 'fixture.hbs', content: '<title>{{title}}</title>', locals: {title: 'Handlebars'}},
        {path: 'fixture.tmpl', content: '<title><%= title %></title>', locals: {title: 'Lo-Dash'}},
        {path: 'fixture.swig', content: '<title>{{title}}</title>', locals: {title: 'Swig'}}
      ];

      files.forEach(function(file) {
        template.render(file, function (err, content) {
          if (err) console.log(err);

          if (file.path === 'fixture.hbs') {
            content.should.equal('<title>Handlebars</title>');
          }
          if (file.path === 'fixture.tmpl') {
            content.should.equal('<title>Lo-Dash</title>');
          }
          if (file.path === 'fixture.swig') {
            content.should.equal('<title>Swig</title>');
          }
        });
      });

      done();
    });

    it('should use the key of a cached template to determine the consolidate engine to use:', function (done) {
      template.engine('hbs', consolidate.handlebars);
      template.engine('swig', consolidate.swig);
      template.engine('tmpl', consolidate.lodash);

      template.page('a.hbs', {content: '<title>{{title}}</title>', title: 'Handlebars'});
      template.page('b.tmpl', {content: '<title><%= title %></title>', title: 'Lo-Dash'});
      template.page('d.swig', {content: '<title>{{title}}</title>', title: 'Swig'});

      Object.keys(template.views.pages).forEach(function(file) {
        template.render(file, function (err, content) {
          if (err) console.log(err);

          if (file.path === 'fixture.hbs') {
            content.should.equal('<title>Handlebars</title>');
          }
          if (file.path === 'fixture.tmpl') {
            content.should.equal('<title>Lo-Dash</title>');
          }
          if (file.path === 'fixture.swig') {
            content.should.equal('<title>Swig</title>');
          }
        });
      });

      done();
    });
  });
});