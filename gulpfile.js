// grab our gulp packages
var gulp  = require('gulp'),
    gutil = require('gulp-util');

// create a default task and just log a message
gulp.task('default', function() {
  return gutil.log('Gulp is running!')
});


var gulp = require('gulp'),
  del = require('del'),
  changed = require('gulp-changed'),
  sass = require('gulp-sass'),
  sourcemaps = require('gulp-sourcemaps'),
  autoprefixer = require('gulp-autoprefixer'),
  concat = require('gulp-concat'),
  uglify = require('gulp-uglify'),
  gulpFilter = require('gulp-filter'),
  globSync = require('globs').sync,
  coffee = require('gulp-coffee'),
  exec = require('child_process').exec,
  include = require('gulp-include'),
  rename = require('gulp-rename'),
  hamlc = require('gulp-haml-coffee-compile'),
  replace = require('gulp-replace'),
  rev = require('gulp-rev'),
  minimist = require('minimist'),
  gulpif = require('gulp-if'),
  cssc = require('gulp-css-condense'),
  path = require('path'),
  intercept = require('gulp-intercept'),
  fs = require('fs'),
  notify = require('gulp-notify'),
  plumber = require('gulp-plumber'),
  compiledCoffeeNamespaces = /(admin)|(controllers)|(cells)|(common)/,
  gutil = require('gulp-util'),
  // s3Headers = {'Cache-Control': 'max-age=3153600, no-transform, public'},
  // s3UploadBasePath = 'cache/assets',
  gzip = require('gulp-gzip'),
  convertEncoding = require('gulp-convert-encoding'),
  options = minimist(process.argv.slice(2), {
    string: 'env',
    string: 'gemPath',
    default: { env: 'development' }
  }),





  getSassPaths = function() {
    var glob = '/**/**',
      paths = ['./app/cells' + glob, './vendor/assets/bower_components' + glob, options.gemPath + glob];
    return globSync(paths);
  },

  getSassFiles = function() {
    var glob = '/**/*.scss',
      paths = ['./app/cells' + glob, './vendor/assets/bower_components' + glob, options.gemPath + glob];
    return globSync(paths);
  },

  getCoffeeFiles = function() {
    var glob = '/**/*.coffee',
        paths = ['./app' + glob, './vendor/assets/bower_components' + glob, options.gemPath + glob],
        filter = function(path) {
          return !path.match(/test|spec|coffee\-rails/)
        };
    return globSync(paths).filter(filter);
  },

  getFontPaths= function() {
    var glob = '/**/fonts/**/*',
        paths = ['./app' + glob, './vendor/assets/bower_components' + glob, options.gemPath + glob],
        filter = function(path) {
          return path.match(/\.(eot|svg|ttf|woff)/) && !path.match(/test|spec|rdoc/)
        };
    return globSync(paths).filter(filter);
  },



  production = function() {
    return (options.env || '').toLowerCase() === 'production';
  };


gulp.task('clean-js', function() {
  return del(['./public/assets/js', './app/assets/javascripts/coffee-js/**'])
});

gulp.task('clean-css', function() {
  return del(['./public/assets/css'])
});

gulp.task('clean-fonts', function() {
  return del(['./public/assets/fonts'])
});


gulp.task('clean', ['clean-js', 'clean-css', 'clean-fonts'], function() {
  return del(['./public/assets/*.json'])
});

gulp.task('sass', ['clean-css'], function (cb) {
  // return getSassPaths(function(x) {
    var includePaths = getSassPaths(),
      srcPath  = './app/assets/stylesheets/*.scss',
      destPath = './public/assets/css',
      filter = gulpFilter(['*.css', '!*.map'], {restore: true}),
      sassConfig = {
        errLogToConsole: true,
        includePaths: includePaths
      };
    if(!production()) {
      sassConfig.sourceMap ='scss';
      sassConfig.sourceComments ='map';
    }
    return gulp.src(srcPath)
      .pipe(gulpif(!production(), sourcemaps.init()))
      .pipe(sass(sassConfig).on('error', sass.logError))

      .pipe(replace(/\"\)\)/g, '")'))

      // background: url(image-path("comfy/admin/cms/icon_move.gif"));
      // background: url("//s3.amazonaws.com/Suitehop/cache/assets/images/icon_page.gif");
      .pipe(gulpif(production(), cssc({safe: true})))
      .pipe(gulpif(!production(), sourcemaps.write('.')))
      .pipe(filter)
      .pipe(autoprefixer({
        browsers: ['last 2 versions']
      }))
      .pipe(filter.restore)
      .pipe(gulp.dest(destPath))
      .pipe(notify({sound: 'Pop', onLast: true, title: 'Gulp', message: 'CSS is done!'}))
      // .on('end', cb);
  });

gulp.task('coffee', ['clean-js'], function(cb) {
  var files = getCoffeeFiles(),
    onError = function(err) {
      notify.onError({
          title:    'Gulp',
          subtitle: 'Failure!',
          message:  'Error: <%= error.message %>',
          sound:    'Blow'
      })(err);
      console.error(err);
      this.emit('end');
    },
    createNamespace = function(file) {
        var directory = path.dirname(file.path)
          namespaces = directory.split(compiledCoffeeNamespaces),
          namespace = (namespaces.filter(function(x, i) {
            return i > 0 && x !== undefined && x.length && x.indexOf('/') === -1
          }).join('/') || '');
        namespace = namespace ? (namespace + directory.split(namespace)[1]) : namespace;
        namespace = namespace.replace(/javascripts$/, '');
        return './app/assets/javascripts/coffee-js' + (namespace ? '/' + namespace : '');
    };
    gulp.src(files)
      // .pipe(sourcemaps.init())
      .pipe(plumber({errorHandler: onError}))
      .pipe(include())
      .pipe(coffee({bare: true}))
      .pipe((rename(function(file) {
        file.basename = file.basename.replace('.js', '')
      })))
      .pipe(gulpif(!production(), sourcemaps.write('.')))
      .pipe(gulp.dest(createNamespace))
      .on('end', cb);
});

gulp.task('hamlc', ['clean-js'], function (cb) {
  var files = globSync('./app/assets/javascripts/templates/**/*.hamlc');
  return gulp.src(files)
    .pipe(hamlc({namespace: 'window.JST', compile: {includePath: true, pathRelativeTo: 'app/assets/javascripts/templates/'}}))
    .pipe(concat('templates.js'))
    .pipe(replace(/(JST\[\')(\/?\_?)|(\/)\_/g, '$1$3'))
    .pipe(gulp.dest('./app/assets/javascripts/coffee-js'))
    // .on('end', cb);
});

gulp.task('js', ['hamlc', 'coffee'], function (cb) {
  var srcPath  = "./app/assets/javascripts/**/*-manifest.js",
    destPath = "./public/assets/js";
  return gulp.src(srcPath)
    .pipe((rename(function(file) {
      file.basename = file.basename.replace('-manifest', '')
    })))
    .pipe(intercept(function(file) {
      // Finding require_gem directives and replacing for gulp-include
      var required = file.contents.toString().match(/\/\/=\srequire_gem\s(.*\.js)/g);
      if(required) {
        required.forEach(function(match) {
          var tempPath = (match.replace(/\/\/=\srequire_gem\s(.*\.js)/, options.gemPath + '/$1')),
            parts = tempPath.split(':'),
            gemName = parts[0],
            fileName = parts[1],
            glob = gemName + `**/**/${fileName}`,
            globs = globSync(glob),
            includePath = globs[0];
            if(includePath) {
              includePath = path.relative('./app/assets/javascripts', includePath);
            }
            switch(true) {
              case (match.match(/\*\.js$/) || []).length === 1:
                includePath = includePath.replace(includePath.substr(includePath.lastIndexOf('/')), '/*.js')
                includePath = `//= include ${includePath}`;
                break;
              case globs.length === 1:
                includePath = `//= include ${includePath}`;
                break;
              default:
                throw `More than one match found for '${match}' for  ${file.path}.`
            }
            if(includePath) {
              file.contents = new Buffer(file.contents.toString().replace(match, includePath));
            }
        })
      }
      return file;
    }))
    // .pipe(gulp.dest(destPath))
    // .pipe(sourcemaps.init())
    .pipe(include())
    .pipe(replace(/\.on\(\'page\:load\sready\'\,\s/g, '.ready('))
    .pipe(gulpif(production(), uglify().on('error', gutil.log)))
    // .pipe(sourcemaps.write('.'))
    .pipe(gulp.dest(destPath))
    .pipe(notify({sound: 'Pop', onLast: true, title: 'Gulp', message: 'JavasScript is done!'}))
    // .on('end', cb);
});

gulp.task('fonts', ['clean-fonts'], function(cb) {

  return gulp.src(getFontPaths())
    .pipe(gulp.dest('./public/assets/fonts'))
    // drop all the fonts into a single directory...
    // .pipe(gulp.dest(function(file) {
    //   var fileName = path.basename(file.path)
    //   var ns = file.path.split('fonts/');
    //   ns = ns[ns.length - 1].replace(fileName, '');
    //   console.log(ns)
    //   return `./public/assets/fonts/${ns}`
    // }))

    .pipe(notify({sound: 'Pop', onLast: true, title: 'Gulp', message: 'Fonts are done!'}))
    // .on('end', cb);
});


gulp.task('default', ['clean', 'js', 'sass', 'fonts'], function(cb) {
  var files = ['./public/assets/js/*.js', './public/assets/css/*.css'],
    stream, awsOptions;
  if(production()) {

    stream = gulp.src(files, { base: './public/assets' })
      .pipe(gulp.dest('./public/assets'))
      .pipe(rev())
      .pipe(gzip())
      // .pipe(s3(awsConfig, awsOptions))
      // .pipe(gulp.dest('./public/assets'))

      .pipe(rev.manifest('../../public/assets/manifest-' + (new Date()).getTime() + '.json'))
      .pipe(gulp.dest('./app/assets'))
      .on('error', console.log);

  } else {
    stream = gulp.src(files);
  }
  return stream.pipe(notify({sound: 'Glass',onLast: true, title: 'Gulp', message: 'Assets are done!'}));
})

gulp.task('watch', ['default'], function(cb) {
  // notify("Watching for changes...").write('');
  // gulp.watch('./gulpfile.js', ['default'])
  gulp.watch('./app/assets/stylesheets/**/*', ['sass']);
  gulp.watch(getSassFiles(), ['sass']);
  gulp.watch(getCoffeeFiles(), ['coffee', 'js'])
  gulp.watch(['./app/assets/javascripts/**/*', '!./app/assets/javascripts/coffee-js/**/*'], ['js']);
});
