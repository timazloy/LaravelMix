const mix = require('laravel-mix');

const SVGSpritemapPlugin = require('svg-spritemap-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const ImageminPlugin = require('imagemin-webpack-plugin').default;
const imageminMozjpeg = require('imagemin-mozjpeg');

require('laravel-mix-webp');
require('laravel-mix-polyfill');

mix
    .sass('resources/scss/index.scss', 'public/css')
    .js('resources/js/app.js', 'public/js')
        .vue()
    .options({
        processCssUrls: false, // Отключаем автоматическое обновление URL в CSS
        postCss: [
            // Добавляем вендорные префиксы в CSS
            require('autoprefixer')({
                cascade: false, // Отключаем выравнивание вендорных префиксов
            }),
            // Группируем стили по медиа-запросам
            require('postcss-sort-media-queries'),
        ],
    })
    .polyfill({
        enabled: true,
        useBuiltIns: "usage",
        targets: "firefox 50, IE 11"
    })
    .webpackConfig({
        plugins: [
            // Создаем svg-спрайт с иконками
            new SVGSpritemapPlugin(
                'resources/img/icons/*.svg', // Путь относительно каталога с webpack.mix.js
                {
                    output: {
                        filename: 'sprite.svg', // Путь относительно каталога public/
                        svg4everybody: false, // Отключаем плагин "SVG for Everybody"
                        svg: {
                            sizes: false // Удаляем инлайновые размеры svg
                        },
                        chunk: {
                            keep: true, // Включаем, чтобы при сборке не было ошибок из-за отсутствия spritemap.js
                        },
                        svgo: {
                            plugins : [
                                {
                                    'removeStyleElement': false // Удаляем из svg теги <style>
                                },
                                {
                                    'removeAttrs': {
                                        attrs: ["fill", "stroke"] // Удаляем часть атрибутов для управления стилями из CSS
                                    }
                                },
                            ]
                        },
                    },
                    sprite: {
                        prefix: 'icon-', // Префикс для id иконок в спрайте, будет иметь вид 'icon-имя_файла_с_иконкой'
                        generate: {
                            title: false, // Не добавляем в спрайт теги <title>
                        },
                    },
                }
            ),
            // Копируем картинки из каталога ресурсов в публичный каталог
            new CopyWebpackPlugin({
                patterns: [
                    {
                        from: 'resources/img', // Путь относительно каталога с webpack.mix.js
                        to: 'img', // Путь относительно каталога public/,
                        globOptions: {
                            ignore: ["**/icons/**"], // Игнорируем каталог с иконками
                        },
                    },
                ],
            }),
            // Оптимизируем качество изображений
            new ImageminPlugin({
                test: /\.(jpe?g|png|gif)$/i,
                plugins: [
                    imageminMozjpeg({
                        quality: 80,
                        progressive: true,
                    }),
                ],
            }),
        ],
    })
    // Создаем WEBP версии картинок
    .ImageWebp({
        from: 'resources/img', // Путь относительно каталога с webpack.mix.js
        to: 'public/img', // Путь относительно каталога с webpack.mix.js
        imageminWebpOptions: {
            quality: 70
        }
    })

    .browserSync('lar')


if (mix.inProduction()) {
    mix.version();
}
