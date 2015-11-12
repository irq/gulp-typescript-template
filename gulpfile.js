'use strict';

var gulp            = require('gulp');
var gutil           = require('gulp-util');
var sourcemaps      = require('gulp-sourcemaps');
var typescript      = require('gulp-typescript');
var tslint          = require('gulp-tslint');
var sass            = require('gulp-sass');
var htmlReplace     = require('gulp-html-replace');
var gulpIf          = require('gulp-if');
var concat          = require('gulp-concat');
var uglify          = require('gulp-uglify');
var runSequence     = require('run-sequence');
var del             = require('del');
var browserSync     = require('browser-sync').create();

var config          = require('./gulpfile.config.json');
var tsProject       = typescript.createProject('tsconfig.json');

gulp.task('default', ['clean'], function(cb){
    runSequence(['compile-ts', 'vendor-js', 'ts-lint', 'views', 'sass', 'images'], cb);
});

gulp.task('serve', ['default', 'watch'], function() {
    browserSync.init({
        server: {
            baseDir: config.buildRoot
        },
        ui: false,
        online: false
    });
});

gulp.task('clean', function(cb) {
    del(config.buildRoot).then(function() {
        cb();
    });
});

gulp.task('compile-ts', function () {
    var tsResult = gulp.src(config.typescriptSource, { base: config.sourceRoot })
        .pipe(sourcemaps.init())
        .pipe(typescript(tsProject));

    return tsResult.js
        .pipe(gulpIf(gutil.env.production, concat(config.jsOutputName)))
        .pipe(gulpIf(gutil.env.production, uglify()))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(config.buildRoot));
});

gulp.task('vendor-js', function () {
    if(gutil.env.production) {
        return gulp.src(config.jsVendorSource)
            .pipe(sourcemaps.init())
            .pipe(concat(config.jsVendorOutputName))
            .pipe(uglify())
            .pipe(sourcemaps.write('.'))
            .pipe(gulp.dest(config.buildRoot));
    } else {
        return gulp.src(config.jsVendorSource, { base: config.sourceRoot })
            .pipe(gulp.dest(config.buildRoot));
    }
});

gulp.task('images', function () {
    return gulp.src(config.imagesSource, { base: config.sourceRoot })
        .pipe(gulp.dest(config.buildRoot));
});

gulp.task('sass', function() {
    var sassOptions = {};
    if (gutil.env.production) {
        sassOptions.outputStyle = 'compressed';
    }

    return gulp.src(config.scssSource, { base: config.sourceRoot })
        .pipe(gulpIf(gutil.env.production, sourcemaps.init()))
        .pipe(gulpIf(gutil.env.production, concat(config.styleOutputName))) // concat??
        .pipe(sass(sassOptions))
        .pipe(gulpIf(gutil.env.production, sourcemaps.write('.')))
        .pipe(gulp.dest(config.buildRoot))
        .pipe(browserSync.stream());
});

gulp.task('views', function() {
    return gulp.src(config.htmlSource, { base: config.sourceRoot })
        .pipe(gulpIf(gutil.env.production, htmlReplace({
            js: config.jsOutputName,
            jsVendor: config.jsVendorOutputName,
            css: config.styleOutputName
        })))
        .pipe(gulp.dest(config.buildRoot));
});

gulp.task('ts-lint', function () {
    return gulp.src(config.typescriptSource)
        .pipe(tslint())
        .pipe(tslint.report('prose',  {
            emitError: false // task never completes if true
        }));
});

gulp.task('watch', function() {
    gulp.watch(config.htmlSource, function(){
        runSequence('views', 'bs-reload');
    });
    gulp.watch(config.typescriptSource, function(){
        runSequence(['ts-lint', 'compile-ts'], 'bs-reload');
    });
    gulp.watch(config.scssSource, ['sass']);
});

gulp.task('bs-reload', function () {
    browserSync.reload();
});
