'use strict';

var gulp            = require('gulp');
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
var environment     = 'development';
var isProduction    = () => environment === 'production';
var tsProject       = typescript.createProject({ noImplicitAny: true });

gulp.task('default', ['clean'], function(cb){
    runSequence(['compile-ts', 'ts-lint', 'views', 'sass'], cb);
});

gulp.task('production', ['set-production'], function(cb) {
    runSequence('default', cb);
});

gulp.task('serve', ['default', 'watch'], function() {
    browserSync.init({
        server: {
            baseDir: config.buildFolder
        },
        ui: false,
        online: false
    });
});

gulp.task('clean', function(cb) {
    del(config.buildFolder).then(function() {
        cb();
    });
});

gulp.task('compile-ts', function () {
    var tsResult = gulp.src(config.typescriptSource)
        .pipe(sourcemaps.init())
        .pipe(typescript(tsProject));

    return tsResult.js
        .pipe(gulpIf(isProduction(), concat(config.jsOutput)))
        .pipe(gulpIf(isProduction(), uglify()))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(config.buildFolder));
});

gulp.task('sass', function() {
    var sassOptions = {};
    if (isProduction()) {
        sassOptions.outputStyle = 'compressed';
    }

    return gulp.src(config.scssSource)
        .pipe(gulpIf(isProduction(), sourcemaps.init()))
        .pipe(gulpIf(isProduction(), concat(config.styleOutput)))
        .pipe(sass(sassOptions))
        .pipe(gulpIf(isProduction(), sourcemaps.write('.')))
        .pipe(gulp.dest(config.buildFolder))
        .pipe(browserSync.stream());
});

gulp.task('ts-lint', function () {
    return gulp.src(config.typescriptSource)
        .pipe(tslint())
        .pipe(tslint.report('prose',  {
            emitError: false // task never completes if true
        }));
});

gulp.task('views', function() {
    return gulp.src(config.htmlSource)
        .pipe(gulpIf(isProduction(), htmlReplace({
            js: config.jsOutput,
            css: config.styleOutput
        })))
        .pipe(gulp.dest(config.buildFolder));
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

gulp.task('set-production', function() {
    environment = 'production';
});
