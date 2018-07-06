// Copyright 2016 caicloud authors. All rights reserved.
"use strict";

const path = require("path");
const gulp = require("gulp");
const plumber = require("gulp-plumber");
const less = require("gulp-less"); // less文件
const minifycss = require("gulp-minify-css"); // css压缩
const uglify = require("gulp-uglify");

const verPath = "../";

gulp.task("img", function() {
  const list = [`${verPath}/src/img/**/*`];
  return gulp.src(list).pipe(gulp.dest(`${verPath}/build/img/`));
});

/**
 * less文件转css
 */
gulp.task("less", function() {
  const list = [
    `${verPath}/src/less/index.less`,
    // caicloud-ui 的样式也编译成 css 文件。在 index.ejs 单独引入。
    path.join(__dirname, "../node_modules/caicloud-ui/dist/less/all.less")
  ];
  return (gulp
      .src(list)
      // plumber 插件可以捕获 less 错误
      .pipe(
        plumber({
          errorHandler: function() {
            this.emit("end");
          }
        })
      )
      .pipe(less())
      .pipe(gulp.dest(`${verPath}/build/css/`))
      .on("end", () => {
        console.log("done", Date.now());
      }) );
});

/**
 * 开发阶段，监听 less 文件的变动。
 */
gulp.task("watch", function() {
  // 需要打包的 less 文件
  const list = [
    `${verPath}/src/less/*.less`,
    // caicloud-ui 的样式也编译成 css 文件。在 index.ejs 单独引入。
    path.join(__dirname, "../node_modules/caicloud-ui/dist/less/*.less")
  ];

  gulp.run("requirejs");
  gulp.run("img");
  gulp.run("less");
  gulp.watch(list, ["less"]);
});

/**
 * 拷贝压缩 requirejs
 */
gulp.task("requirejs", function() {
  const requirejs = [`../node_modules/requirejs/require.js`];
  return gulp
    .src(requirejs)
    .pipe(uglify())
    .pipe(gulp.dest(`${verPath}/build/`));
});

/**
 * 压缩CSS
 */
gulp.task("min_css", ["less"], function() {
  const dir = `${verPath}/build/css/`;
  const arr = [
    `${dir}index.css`,
    `${dir}p.*.css`,
    `${dir}all.css` // caicloud-ui 的 css 文件
  ];

  return gulp
    .src(arr)
    .pipe(minifycss())
    .pipe(gulp.dest(dir));
});

gulp.task("default", function() {
  gulp.run("img");
  gulp.run("min_css");
});
