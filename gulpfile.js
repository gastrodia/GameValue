var gulp = require('gulp');
var watch = require('gulp-watch');
var less = require('gulp-less-sourcemap');

gulp.task('build:less', function () {
  watch('./less/**/*.less', function () {
    gulp.src('./less/**/*.less')
      .pipe(less({
          sourceMap: {
              sourceMapRootpath: '../../less' // Optional absolute or relative path to your LESS files
          }
      }))
      .pipe(gulp.dest('./dist/css'));
  });
});


gulp.task('default',['build:less']);
