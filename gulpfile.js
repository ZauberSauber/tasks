"use strict";
// npm install plugin --save-dev to add in depend

var gulp = require("gulp"),                     
    postcss = require("gulp-postcss"),          // PostCSS gulp plugin to pipe CSS through several plugins, but parse CSS only once
    autoprefixer = require("autoprefixer"),     // prefixes CSS with Autoprefixer
    browserSync = require("browser-sync"),      // keeps multiple browsers & devices in sync when building applications
    reload = browserSync.reload,
    minify = require("gulp-csso"),              // minifies CSS
    uglify = require('gulp-uglify'),            // minifies JavaScript
    babel = require('gulp-babel'),              // compiles ES6 written JS files to previous version of ES
    rename = require("gulp-rename"),            // renames files
    run = require("run-sequence"),              // runs a sequence of gulp tasks in the specified order
    del = require("del"),                       // deletes files and folders
    pump = require('pump')                     // pipes streams together and destroys all of them if one of them closes


/**
* Чистота - залог здоровья
*/
gulp.task("clean", () => {
  del.sync(["build"]);
});

/**
* Собирает и пересобирает скрипты
*/
gulp.task('js', () => {
  pump([
    gulp.src('src/js/main.js'),
    babel({ presets: ['es2015'] }),
    uglify(),
    rename('main.min.js'),
    gulp.dest('build/js'),
    reload({stream:true})
  ])
});

/**
* Собирает и пересобирает стили
*/
gulp.task("style", () => {
  pump([
    gulp.src("src/css/style.css"),
    postcss([
      autoprefixer({browsers: [
        "last 1 version",
        "last 2 Chrome versions",
        "last 2 Firefox versions",
        "last 2 Opera versions",
        "last 2 Edge versions"
      ]})
    ]),
    minify(),
    rename("style.min.css"),
    gulp.dest("build/css"),
    reload({stream: true})
  ])
});



/**
* rebuild html files for watcher
*/
gulp.task("html", () => {
  pump([
    gulp.src("src/index.html"),
    gulp.dest("build"),
    reload({stream:true})
  ])
});


/**
* Запускает веб-сервер
*/
gulp.task("serve", () => {
  browserSync({
    server: {
      baseDir: "./build",
      index: "index.html"
    }
  })

  gulp.watch("src/css/**", ["style"]);
  gulp.watch("src/**",["html"]);
  gulp.watch("src/js/**",["js"]);
});


gulp.task("build", cb => {
  run(
    "clean",
    "html",
    "style",
    "js",
    cb
  )
});