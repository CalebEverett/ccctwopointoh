var gulp = require('gulp'),
    gutil = require('gulp-util'),
    browserify = require('gulp-browserify'),
    compass = require('gulp-compass'),
    connect = require('gulp-connect'),
    gulpif = require('gulp-if'),
    uglify = require('gulp-uglify'),
    jsonminify = require('gulp-jsonminify'),
    imagemin = require('gulp-imagemin'),
    pngcrush = require('imagemin-pngcrush'),
    concat = require('gulp-concat');
    watch = require('gulp-watch');
/*  webserver = require('gulp-webserver');
    livereload = require('gulp-livereload'),
    lr = require('tiny-lr'),
    server = lr();*/

var env = 'development',
    jsSources,
    sassSources,
    jsonSources,
    outputDir = 'builds/',
    sassStyle = 'expanded';//'compressed', 'nested'

jsSourcesHeader = [ 'js/header/fonts.js',
                  ];  
                    
jsSourcesFooter = [ 'js/footer/navigation.js',
                    'js/footer/skip-link-focus.js'
                  ];  

jsSources = [jsSourcesHeader,jsSourcesFooter
            ];

sassSources = [ 'sass/style.scss',
                'sass/susy-test.scss'
              ];

gulp.task('js', function() {
  gulp.src(jsSourcesHeader)
    .pipe(concat('scriptHeader.js'))
    .pipe(browserify())
    .pipe(gulpif(env === 'production', uglify()))
    .pipe(gulp.dest(outputDir + 'js'))
  gulp.src(jsSourcesFooter)
    .pipe(concat('scriptFooter.js'))
    .pipe(browserify())
    .pipe(gulpif(env === 'production', uglify()))
    .pipe(gulp.dest(outputDir + 'js'))  
    .pipe(connect.reload())
});

gulp.task('move', function() {
  gulp.src(outputDir +'css/style.css')
    .pipe(gulp.dest('./'))
    .pipe(connect.reload())
});

gulp.task('compass', function() {
  gulp.src(sassSources)
    .pipe(compass({
      sass: 'sass',
      image: outputDir + 'images',
      css: outputDir + 'css',
      style: sassStyle,
      require: ['susy','breakpoint']
    })
    .on('error', gutil.log))
//    .pipe(gulp.dest(outputDir))
    .pipe(connect.reload())

});

gulp.task('watch', function() {
  gulp.watch(jsSources, ['js']);
  gulp.watch('sass/**/*.scss', ['compass']);
  gulp.watch('js/*.json', ['json']);
  gulp.watch('images/**/*.*', ['images']);
  gulp.watch(outputDir + 'css/style.css', ['move']);
  gulp.watch('./*.php', connect.reload());
});

gulp.task('connect', function() {
  connect.server({
    root: outputDir,
    livereload: true,
  });
});

gulp.task('images', function() {
  gulp.src('images/**/*.*')
    .pipe(gulpif(env === 'production', imagemin({
      progressive: true,
      svgoPlugins: [{ removeViewBox: false }],
      use: [pngcrush()]
    })))
    .pipe(gulpif(env === 'production', gulp.dest(outputDir + 'images')))
    .pipe(connect.reload())
});

gulp.task('json', function() {
  gulp.src('js/*.json')
    .pipe(gulpif(env === 'production', jsonminify()))
    .pipe(gulpif(env === 'production', gulp.dest(outputDir + 'js')))
    .pipe(connect.reload())
});

gulp.task('default', ['js', 'compass', 'move', 'images', 'connect', 'watch']);