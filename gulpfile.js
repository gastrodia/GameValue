var gulp = require('gulp');
var watch = require('gulp-watch');
var less = require('gulp-less-sourcemap');
var lessImport = require('gulp-less-import');

gulp.task('build:less', function () {
  var less_files = './src/components/**/*.less';
  watch(less_files, function () {
    gulp.src(less_files)
      .pipe(less({
          sourceMap: {
              sourceMapRootpath: '../../src/components' // Optional absolute or relative path to your LESS files
          }
      }))
      .pipe(gulp.dest('./dist/css'));
  });

});

gulp.task('default',['build:less']);
