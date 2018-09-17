'use strict';

var gulp = require('gulp'),
  uglify = require('gulp-uglify'),
  rename = require('gulp-rename'),
    sass = require('gulp-sass'),
    maps = require('gulp-sourcemaps'),
     del = require('del'),
  useref = require('gulp-useref'),
     iff = require('gulp-if'),
     htmlmin = require('gulp-htmlmin'),
    csso = require('gulp-csso'),
   pages = require('gulp-gh-pages'),
   imagemin = require('gulp-imagemin'),
   browserSync = require('browser-sync').create();
;

var options = {
  src: './app/',
  dist: './dist/'
}


gulp.task('compileSass', function() {
  return gulp.src(options.src + 'scss/**/*.scss')
    .pipe(maps.init())
    .pipe(sass())
    .pipe(maps.write('./'))
    .pipe(gulp.dest(options.src + 'css/'));
});

gulp.task('html', ['compileSass'], function() {
  var assets = useref.assets();
  return gulp.src(options.src + 'index.html')
              .pipe(assets)
              .pipe(iff('*.css', csso()))
              .pipe(assets.restore())
              .pipe(useref())
              .pipe(gulp.dest(options.dist));
});

gulp.task('uglify', function() {
  gulp.src('app/js/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('dist/js'));
});

gulp.task('watchFiles', function() {
  gulp.watch(options.src + 'scss/**/*.scss', ['compileSass']);
});

gulp.task('assets', function(){
  return gulp.src([options.src + 'images/**/*',
                   options.src + 'fonts/**/*'], {base: options.src})
          .pipe(gulp.dest(options.dist));
});

// watch sass
gulp.task('serve', ['compileSass', 'watchFiles']);

gulp.task('clean', function() {
  del([options.dist]);
  // delete compiles css and map
  del([options.src + 'css/main.css*']);
});

gulp.task('sass', function() {
  return gulp.src('app/scss/**/*.scss') // Gets all files ending with .scss in app/scss
    .pipe(sass())
    .pipe(gulp.dest('app/css'))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('watch', ['browserSync', 'sass'], function (){
  gulp.watch('app/scss/**/*.scss', ['sass']);
  gulp.watch('app/*.html', browserSync.reload);
  gulp.watch('app/js/**/*.js', browserSync.reload);
});

gulp.task('browserSync', function() {
  browserSync.init({
    server: {
      baseDir: 'app'
    },
  });
});

gulp.task('imagemin', () =>
    gulp.src('app/images/*')
        .pipe(imagemin())
        .pipe(gulp.dest('dist/images'))
);


gulp.task('minify', function() {
  return gulp.src('app/**/*.html')
    .pipe(htmlmin({collapseWhitespace: true}))
    .pipe(gulp.dest('dist'));
});


gulp.task('build', ['html', 'minify', 'assets', 'uglify', 'imagemin']);

gulp.task('deploy', function(){
  return gulp.src(options.dist + '**/*')
    .pipe(pages());
});

gulp.task('default', ['clean'], function(){
  gulp.start('build');
});
