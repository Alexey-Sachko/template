'use strict'

var autoprefixerList = [
	'Chrome >= 45',
	'Firefox ESR',
	'Edge >= 12',
	'Explorer >= 10',
	'iOS >= 9',
	'Safari >= 9',
	'Android >= 4.4',
	'Opera >= 30'
];

var path = {
	build: {
		html:  'assets/build/',
    js:    'assets/build/js/',
    css:   'assets/build/css/',
    img:   'assets/build/img/',
    fonts: 'assets/build/fonts/'
	},
	src: {
    html:  'assets/src/*.html',
    js:    'assets/src/js/main.js',
    style: 'assets/src/style/main.scss',
    img:   'assets/src/img/**/*.*',
    fonts: 'assets/src/fonts/**/*.*'
  },
  watch: {
    html:  'assets/src/**/*.html',
    js:    'assets/src/js/**/*.js',
    css:   'assets/src/style/**/*.scss',
    img:   'assets/src/img/**/*.*',
    fonts: 'assets/srs/fonts/**/*.*'
  },
  clean: 	 './assets/build'
};

var config = {
	server: {
		baseDir: './assets/build'
	},
	notify: false
};

var gulp 					 = require('gulp'),
		browserSync 	 = require('browser-sync'),
		plumber				 = require('gulp-plumber'),
		rigger				 = require('gulp-rigger'),
		sourcemaps		 = require('gulp-sourcemaps'),
		sass 					 = require('gulp-sass'),
		autoprefixer 	 = require('gulp-autoprefixer'),
		cleanCSS			 = require('gulp-clean-css'),
		uglify				 = require('gulp-uglify'),
		cache					 = require('gulp-cache'),
		imagemin			 = require('gulp-imagemin'),
		jpegrecompress = require('imagemin-jpeg-recompress'),
		pngquant			 = require('imagemin-pngquant'),
		del						 = require('del');

gulp.task('serve', function() {
	browserSync(config);
});

gulp.task('html:build', function() {
	return gulp.src(path.src.html)
		.pipe(plumber())
		.pipe(rigger())
		.pipe(gulp.dest(path.build.html))
		.pipe(browserSync.reload({stream: true}));
});

gulp.task('css:build', function() {
	return gulp.src(path.src.style)
		.pipe(plumber())
		.pipe(sourcemaps.init())
		.pipe(sass())
		.pipe(autoprefixer({
			browsers: autoprefixerList
		}))
		.pipe(cleanCSS())
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(path.build.css))
		.pipe(browserSync.reload({stream: true}));
});

gulp.task('js:build', function() {
	return gulp.src(path.src.js)
		.pipe(plumber())
		.pipe(rigger())
		.pipe(sourcemaps.init())
		.pipe(uglify())
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest(path.build.js))
		.pipe(browserSync.reload({stream: true}));
});

gulp.task('fonts:build', function() {
	return gulp.src(path.src.fonts)
		.pipe(gulp.dest(path.build.fonts));
});

gulp.task('image:build', function() {
	return gulp.src(path.src.img)
		.pipe(cache(imagemin([
			imagemin.gifsicle({interlaced: true}),
			jpegrecompress({
				progressive: true,
				max: 90,
				min: 80
			}),
			pngquant(),
			imagemin.svgo({plugins: [{removeViewBox: false}]})
		])))
		.pipe(gulp.dest(path.build.img));
});

gulp.task('clean:build', function(cb) {
	del.sync(path.clean);
	cb();
});

gulp.task('cache:clear', function(cb) {
	cache.clearAll();
	cb();
});

gulp.task('build', gulp.series('clean:build', gulp.parallel(
	'html:build',
	'css:build',
	'js:build',
	'fonts:build',
	'image:build'
)));

gulp.task('watch', function() {
	gulp.watch(path.watch.html, gulp.series('html:build'));
	gulp.watch(path.watch.css, gulp.series('css:build'));
	gulp.watch(path.watch.js, gulp.series('js:build'));
	gulp.watch(path.watch.img, gulp.series('image:build'));
	gulp.watch(path.watch.fonts, gulp.series('fonts:build'));
});

gulp.task('default', gulp.series(
	'clean:build',
	'build',
	gulp.parallel('watch', 'serve')
));