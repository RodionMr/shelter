const { src, dest, series, watch } = require('gulp')
const sass = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat')
const autoprefix = require('gulp-autoprefixer')
const csso = require('gulp-csso')
const include = require('gulp-file-include')
const sync = require('browser-sync').create()
const imagemin = require('gulp-imagemin');
const styles = [
    'src/assets/styles/normalize.scss',
    'src/assets/styles/assets.scss',
    'src/assets/styles/burger-icon.scss',
    'src/pages/main/*.scss',
    'src/pages/pets/*.scss'
]

function js() {
    return src('src/*.js')
        .pipe(dest('dist'));
}

function jsons() {
    return src('src/assets/*.json')
        .pipe(dest('dist'));
}

function fonts() {
    return src(['src/assets/fonts/arial/*.{ttf,woff,woff2}', 'src/assets/fonts/georgia/*.{ttf,woff,woff2}'])
        .pipe(dest('dist/fonts'))
}


function img() {
    return src(['src/assets/images/*.{jpg,png,gif,svg,webp}', 'src/assets/icons/*.{jpg,png,gif,svg}'])
        .pipe(imagemin())
        .pipe(dest('dist/images'));
}

function html() {
    return src('src/pages/main/*.html')
        .pipe(include())
        .pipe(dest('dist'))
        .pipe(src('src/pages/pets/*.html'))
        .pipe(include({
            prefix: '@@',
            basepath: '@file'
        }))
        .pipe(dest('dist/pets'))
}

function scss() {
    return src(styles)
        .pipe(sass())
        .pipe(autoprefix())
        .pipe(csso())
        .pipe(concat('style.css'))
        .pipe(dest('dist'))
}

function serve() {
    sync.init(
        {
            server: './dist'
        }
    )
    watch(['src/pages/main/*.html', 'src/pages/pets/*.html'], series(html)).on('all', sync.reload)
    watch(styles, series(scss)).on('all', sync.reload)
    watch('src/*.js', series(js)).on('all', sync.reload)
}

exports.build = series(scss, html, img, js, jsons, fonts)
exports.serve = series(scss, html, img, js, jsons, fonts, serve)