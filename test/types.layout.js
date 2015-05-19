/*!
 * template <https://github.com/jonschlinkert/template>
 *
 * Copyright (c) 2014-2015, Jon Schlinkert, Brian Woodward.
 * Licensed under the MIT License (MIT)
 */

'use strict';

var should = require('should');
var Template = require('./app');
var template;

describe('template layout:', function () {
  beforeEach(function () {
    template = new Template();
  });

  describe('default template types:', function () {
    it('should use layouts with `page`s:', function (done) {
      template.layout('sidebar', '<nav></nav>\n{% body %}', {layout: 'default'});
      template.layout('default', 'default!\n{% body %}\ndefault!');

      var expected = [
        'default!',
        '<nav></nav>',
        'This is a page!',
        'default!'
      ].join('\n');

      template.renderTemplate({content: 'This is a page!', layout: 'sidebar'}, function(err, content) {
        if (err) return done(err);
        content.should.eql(expected);
        done();
      });
    });

    it('should use layouts with pages:', function (done) {
      template.layout('sidebar', '<nav></nav>\n{% body %}', {layout: 'default'});
      template.layout('default', 'default!\n{% body %}\ndefault!');
      template.page('home', {content: 'This is a page!', layout: 'sidebar'});

      var expected = [
        'default!',
        '<nav></nav>',
        'This is a page!',
        'default!'
      ].join('\n');

      template.render('home', function(err, content) {
        if (err) return done(err);
        content.should.eql(expected);
        done();
      });
    });

    it('should use layouts with `partial`s:', function (done) {
      template.layout('default', 'default!\n{% body %}\ndefault!');
      template.partial('alert', '<div>Heads up! This is an alert.</div>', {layout: 'default'});
      template.page('home.md', {content: 'This is a page!\n<%= partial("alert") %>'});

      var expected = [
        'This is a page!',
        'default!',
        '<div>Heads up! This is an alert.</div>',
        'default!'
      ].join('\n');

      template.render('home.md', function(err, content) {
        if (err) return done(err);
        content.should.eql(expected);
        done();
      });
    });

    it('should nest layouts with `partial`s:', function (done) {
      template.layout('a', 'AAA!\n{% body %}\nAAA!', {layout: 'b'});
      template.layout('b', 'BBB!\n{% body %}\nBBB!');
      template.partial('alert', '<div>Heads up! This is an alert.</div>', {layout: 'a'});
      template.page('home.md', {content: '<%= partial("alert") %>'});

      var expected = [
        'BBB!',
        'AAA!',
        '<div>Heads up! This is an alert.</div>',
        'AAA!',
        'BBB!'
      ].join('\n');

      template.render('home.md', function(err, content) {
        if (err) return done(err);
        content.should.eql(expected);
        done();
      });
    });
  });

  describe('custom template types:', function () {
    it('should use layouts with custom template types:', function (done) {
      template.create('doc', { isRenderable: true });

      template.layout('sidebar', '<nav></nav>\n{% body %}', {layout: 'default'});
      template.layout('default', 'default!\n{% body %}\ndefault!');
      template.doc('home', 'This is the home page.', {layout: 'sidebar'});

      var expected = [
        'default!',
        '<nav></nav>',
        'This is the home page.',
        'default!'
      ].join('\n');

      template.render('home', function(err, content) {
        if (err) return done(err);
        content.should.eql(expected);
        done();
      });
    });
  });
});
