# Context

> This document explains how data is passed to templates, related methods, and tips for getting the results you need

Context can be thought of as "the data that is passed to templates" (see a [better definition](#what-is-context) below), but knowing more about how context is created and the options available for modifying it will also help you:

- formulate strategies for creating more composable, resuable data (and templates),
- understand how to prevent or resolve potential _data conflicts_
-

**Jump ahead:**

<!-- toc -->

- [What is context?](#what-is-context-)
- [.mergeContext](#-mergecontext)
- [Context objects](#context-objects)
  * [Cached objects](#cached-objects)
  * [Runtime objects](#runtime-objects)
  * [Custom merge function](#custom-merge-function)
- [preferLocals](#preferlocals)
- [Helper context](#helper-context)
- [Helper context](#helper-context)

_(Table of contents generated by [verb])_

<!-- tocstop -->

## What is context?

You can think of _context_ as:

 > An object that is created at runtime from one or more data sources, for the purposes of being passed to the render method to resovle template values


## .mergeContext

Context is built at runtime by the `.mergeContext()` method, which combines data from multiple sources before passing it to templates. This method may be [overridden if necessary](#custom-merge-function).

**Example:**

```js
template.page('abc', {content: '---\ntitle: About\n---\nThis is <%= title %>.' }, {title: 'Home'});
```


## Context objects

Context is created from several different objects, some of which are only available at [runtime](#runtime-objects), and some of which are [cached](#cached-objects).


### Cached objects

Cached objects are either created by the `template.data()` method, a template "view" method, such as `template.page()`, or by directly adding/modifying an object.

  - `template.locals`
  - `template.data`: typically from [front-matter](), but can be directly populated
  - `locals`


### Runtime objects

Runtime context is created from the following objects:


  - `this.cache`
  - `this.cache.data`
  - `this.cache._locals`
  - `this.options`
  - value returned from `.mergePartials()`


### Custom merge function

If you want the `.mergeContext()` function to behave differently, just pass a custom function on the options:

```js
template.option('mergeContext', function(template, locals) {
  // to get you started with your custom logic
  console.log(template);
  console.log(locals);
  console.log(this);
});
```

In your `.mergeContext()` function, pay special attention to these objects:

  - `this.cache`
  - `this.cache.data`
  - `this.options`


## preferLocals

By default, the `data` object on a template is given preference over the `locals` object. To reverse this, do:

```js
this.enabled('preferLocals');
```

## Helper context

```js
module.exports = function include(name, locals) {
  // `this`
  var app = this.app;

  // `template.option()`
  var opts = this.options;

  // `template.include()`
  var includes = this.views.includes;

  // runtime context returned from the `mergeContext` function
  var ctx = this.context;

  // get the include to render
  var template = includes[name];
  //=> {'foo.md': {path: 'includes/foo.md', content: '...', data: {...}}}

  app.render(template, locals, function(err, content) {
    // do stuff with content
  });
};
```
```js
this.views = {};
this.views.pages = {};
this.views.includes = {};

this.options = {};
template.option('foo', 'bar');

this.cache = {};
template.set()
template.get()

this.cache.data = {};
template.data('foo', 'bar');
template.data('data/*.json');


// 1. Front matter data
// 2. template locals
template.partial('aaa.md', '---\ntitle: zzz\n---\na<%= title %>c', { title: 'aaa'});

// 1. Front matter data
// 2. template locals
// 3. Helper locals
template.page('aaa.md', '---\ntitle: zzz\n---\na<%= partial("aaa.md", {title: "blah"}) %>c', { title: 'bbb'});

// Render locals
template.render({'aaa.md': {path: '...'}}, {title: 'alalala'}, function (err, content) {
  // content
});

template.option('mergeContext', function () {
  // do stuff
});

function render(template, locals, cb) {
  var ctx = this.mergeContext(template, locals);
  cb();
};

// Render locals
template.helper('partial', function (name, locals) {
  var template = this.app.lookup(name);
  var ctx = this.app.mergeContext(template, locals);

});

template.locals({foo: {title: 'bar'}});
//=> this.cache.locals.foo = {title: 'bar'};

template.data({ aaa: 'xyz'});
template.data('includes/*.json');
//=> this.cache.data.aaa = {title: 'zzz'};

this.cache.data = {title: 'zzz'};
this.cache.locals.aaa = {title: 'bbb'};

this.views.partials.aaa = {path: './aaa.md', data: {title: 'salslakj'}, locals: {title: 'aaa'}};
this.views.pages.aaa = {path: './aaa.md', data: {title: 'zzz'}};
this.views.pages.bbb = {path: './bbb.md', data: {title: 'xxx'}};
```


## Helper context