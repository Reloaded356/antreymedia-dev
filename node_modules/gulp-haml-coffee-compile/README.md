#Gulp-Haml-Coffee

## Usage
#### Install
    npm install gulp-haml-coffee-compile --save

## Examples

```javascript

// Gulpfile.js
// Require the needed packages
var gulp = require('gulp');
var hamlc = require('gulp-haml-coffee-compile');


// Get one .hamlc file and render
gulp.task('one', function () {
  gulp.src('./haml/file.hamlc')
    .pipe(hamlc())
    .pipe(gulp.dest('./html'));
});


// Get all .hamlc files in one folder and render
gulp.task('one', function () {
  gulp.src('./haml/views/*.hamlc')
    .pipe(hamlc())
    .pipe(gulp.dest('./haml/views'));
});



// Get and render all .hamlc files recursively
gulp.task('hamlc', function () {
  gulp.src('./haml/**/*.hamlc')
    .pipe(hamlc())
    .pipe(gulp.dest('./haml'));
});


// Default gulp task to run
gulp.task('default', function(){
  gulp.run('haml', 'one');
});

```

## Options

`opts.compile.includePath`

Type: `boolean` Default: `false`

Specifies whether or not to include the relative path in automatic generated name.

When enabled, you'll get results like window.HAML['path/to/template'] instead of window.HAML['template'].



`opts.compile.pathRelativeTo`

Type: `string` Default: `"./"`

Specifies the base directory to start looking for files.

If `./src/javascripts/demo` it's passed, you'll get results like window.HAML['templates/hello'] instead of window.HAML['src/javascripts/demo/templates/hello'].



`opts`


The rest of the options are passed straight through to the [haml-coffee](https://npmjs.org/package/haml-coffee) module.


## **Copyright**

Copyright (c) 2015 Emilio Forrer. See LICENSE.txt for further details.
