console.log("Default build system enhancement module added");

//Requires and declares
const gulp = require('gulp'),
    gutil = require('gulp-util'),
    path = require('path'),
    rollup = require('gulp-rollup'),
    rollupmep = require('gulp-rollup-mep'),
    debug = require('gulp-debug'),
    uglifyjs = require('gulp-uglify'),
    concat = require('gulp-concat'),
    sass = require('gulp-sass'),
    sourcemaps = require('gulp-sourcemaps'),
    rename = require("gulp-rename"),
    minifyCss = require('gulp-cssnano'),
    del = require('del'),
    fs = require('fs'),
    debounce = require('gulp-debounce'),
    cwd = process.cwd(),
    browserSync = require('browser-sync'),
    nodemon = require('gulp-nodemon'),
    typescript = require('gulp-typescript'),
    pug = require('gulp-pug'),
    bundling = require(path.join(cwd, './config/bundling.json')),
    traceur = require('gulp-traceur'),
    env = require(path.join(cwd, './config/environments.json')),
    typescriptMainConfig = typescript.createProject('tsconfig.json'),
    typescriptMultipleConfig = typescript.createProject('tsconfig.json'),
    postcss = require('gulp-postcss'),
    autoprefixer = require('autoprefixer'),
    exec = require('child_process').exec,
    cssnano = require('cssnano');


exports.before = (mod, ...args) => {
    mod.settings = {};
};

exports.lex = {
    for: {
        length: 1,
        handler: (mod, ...args) => {
            mod.settings.environment = args[0];
        }
    },
    debug: {
        length: 0,
        handler: (mod) => {
            mod.settings.debug = true;
        }
    },
    only: {
        length: 1,
        handler: (mod, ...args) => {
            mod.settings.spec = args[0];
        }
    },
    language: {
        length: 1,
        handler: (mod, ...args) => {
            mod.settings.language = args[0];
        }
    },
    build: {
        length: 0,
        handler: (mod, ...args) => {
            mod.task = "build";
            if (mod.settings.spec) {
                mod.task += "-" + mod.settings.spec;
            }
        }
    },
    watch: {
        length: 0,
        handler: (mod, ...args) => {
            mod.task = "watch";
            if (mod.settings.spec) {
                mod.task += "-" + mod.settings.spec;
            }
        }
    },
    serve: {
        length: 0,
        handler: (mod, ...args) => {
            mod.task = "serve";
        }
    },
    called: {
        length: 1,
        handler: (mod, ...args) => {
            mod.settings.name = args[0];
        }
    },
    path: {
        length: 1,
        handler: (mod, ...args) => {
            mod.settings.path = args[0];
        }
    },
    from: {
        length: 1,
        handler: (mod, ...args) => {
            mod.settings.source = args[0];
        }
    },
    generate: {
        length: 1,
        handler: require("./generate")
    }
};

exports.after = (mod, ...args) => {
    var node_env = mod.settings.environment = mod.settings.environment || "development";
    mod.prefix = path.join(process.cwd(), "dist/", node_env.toString());
    mod.environment = env[node_env];
};

io = {
    server: {
        in: [
            'app/**/*.js',
            'routers/**/*.js',
            'models/**/*.js',
            'hooks/**/*.js',
            'node_modules/radixjs/server/**/*.js'
        ], out: '/'
    },
    independent: {
        in: [
            "package.json",
            "radixfile.json",
            'node_modules/radixjs/bs/ressources/launch.js'
        ],
        out: "./"
    },
    config: {
        in: "config/**/**",
        out: "config/"
    },
    static: {
        in: [
            'assets/**/*',
            //not stylesheets
            '!assets/stylesheets/**/*.scss',
            '!assets/stylesheets/**/*.sass',
            '!assets/stylesheets/**/*.css',
            //not multiple
            "!assets/multiple/**/**.**",
            //not js
            "!assets/javascript/**/**.js"
        ],
        out: '/public/'
    },
    stylesheets: {
        in: [
            'assets/stylesheets/**/*.scss',
            'assets/stylesheets/**/*.sass',
            'assets/stylesheets/**/*.css',
        ],
        out: '/public/stylesheets/',
        root: "/"
    },
    views: {
        in: 'views/**/*',
        out: '/views/'
    },
    javascript: {
        in: "assets/javascript/**/**.js",
        out: "/public/javascript",
        root: "/"
    },
    multiple: {
        in_js: "assets/multiple/**/**.js",
        in_ts: "assets/multiple/**/**.ts",
        in_pug: "assets/multiple/**/**.pug",
        in_css: [
            "assets/multiple/**/**.scss",
            "assets/multiple/**/**.sass"
        ],
        in_static: [
            "assets/multiple/**/**.**",
            "!assets/multiple/**/**.pug",
            "!assets/multiple/**/**.scss",
            "!assets/multiple/**/**.sass",
            "!assets/multiple/**/**.ts",
            "!assets/multiple/**/**.js"
        ],
        out: "/public/multiple/"
    },
    typescript: {in: "assets/typescript/**/**.ts", out: "/public/javascript/compiled"}
};

//Create Void infrastructure
var mdir = function (path) {
    try {
        fs.mkdirSync(path);
    } catch (e) {
        //console.log(e);
    }
};

function execute(command) {
    return new Promise(function (resolve, reject) {
        var pro = exec(command, function (error, stdout, stderr) {
            resolve({
                error,
                stdout,
                stderr
            })
        });
    });
}

var writeToFile = function (filename, contents) {
    return new Promise(function (resolve, reject) {
        fs.writeFile(filename, contents, function (errors) {
            if (errors) {
                reject(errors);
            } else {
                resolve();
            }
        });
    });
};

var readFile = function (path) {
    return new Promise(function (resolve, reject) {
        fs.readFile(path, 'utf8', function (err, data) {
            if (err) {
                reject(err);
            } else {
                resolve(data);
            }
        });
    });
};

let watch = {
    'server': [
        'app/**/*.js',
        'hooks/**/*.js',
        'models/**/*.js',
        'routers/**/*.js',
        'radixFile.json',
        "config/environments.json"
    ],
    'dev': 'app/server/**/**.*',
    'static': [
        'public/**/*',
        'radixFile.json'
    ],
    'stylesheets': [
        'assets/stylesheets/**/**.**',
        "config/bundling.json"
    ],
    'multiple': "assets/multiple/**/**",
    'views': 'views/**/**',
    'javascript': [
        'assets/javascript/**/**.js',
        "config/bundling.json"
    ],
    'typescript': 'assets/typescript/**/**.ts',
};

exports.tasks = {
    'build-arch': function (mod) {
        let prefix = mod.prefix;
        mdir("dist");
        mdir(prefix);
        mdir(path.join(prefix, "/uploads"));
        mdir(path.join(prefix, "/suploads"));


        var streamI = gulp.src(io.independent.in)
            .pipe(gulp.dest(path.join(prefix, io.independent.out)));
        var streamC = gulp.src(io.config.in)
            .pipe(gulp.dest(path.join(prefix, io.config.out)));
        return Promise.resolve();
    },
    'build-js': function (mod) {
        let prefix = mod.prefix;
        let bundles = bundling[mod.settings.environment || "development"] ? bundling[mod.settings.environment || "development"] : bundling.default || {};
        if (bundling.global) {
            bundles.js = bundles.js.concat(bundling.global.js || []);
        }
        let streams = [];
        streams.push(new Promise(function (res, rej) {
            gulp.src(io.javascript.in)
                .pipe(mod.settings.debug ? debug() : gutil.noop())
                .pipe(sourcemaps.init())
                //only uglifyjs if gulp is ran with '--type production'
                .pipe(mod.settings.environment === 'production' ? traceur() : gutil.noop())
                .pipe(mod.settings.environment === 'production' ? uglifyjs() : gutil.noop())
                .pipe(sourcemaps.write('./'))
                .pipe(gulp.dest(path.join(prefix, io.javascript.out)))
                .on('error', rej)
                .on('end', res)
            ;
        }));

        for (let bundle of (bundles.js || [])) {
            let files = bundle.files.map(file => path.join(cwd, file));
            let asyncF = null;
            if (bundle.async) {
                asyncF = function (res, rej) {
                    gulp.src(files)
                        .pipe(sourcemaps.init())
                        .pipe(rollupmep({
                            format: "amd",
                            sourceMap: true
                        }))
                        .pipe(concat(bundle.output))
                        //only uglifyjs if gulp is ran with '--type production'
                        .pipe(mod.settings.environment === 'production' ? traceur() : gutil.noop())
                        .pipe(mod.settings.environment === 'production' ? uglifyjs() : gutil.noop())
                        .pipe(sourcemaps.write('./'))
                        .pipe(gulp.dest(path.join(prefix, io.javascript.out)))
                        .on('error', rej)
                        .on('end', res)
                };
            } else {
                asyncF = function (res, rej) {
                    gulp.src(files)
                        .pipe(sourcemaps.init())
                        .pipe(concat(bundle.output))
                        .pipe(mod.settings.environment === 'production' ? traceur() : gutil.noop())
                        .pipe(mod.settings.environment === 'production' ? uglifyjs() : gutil.noop())
                        .pipe(sourcemaps.write('./'))
                        .pipe(gulp.dest(path.join(prefix, io.javascript.out)))
                        .on('error', rej)
                        .on('end', res)
                };
            }
            streams.push((new Promise(asyncF)).then(_ => console.log(`
${mod.settings.environment} bundle ${bundle.output}
\t${bundle.files.join("\n\t")}
            `)));
        }

        return Promise.all(streams).then(bsreload);

        // stream.on('end', browserSync.reload);
    },
    'build-mjs': function (mod) {
        return new Promise(function (res, rej) {
            let prefix = mod.prefix;
            let stream = gulp.src(io.multiple.in_js)
                .pipe(mod.settings.debug ? debug() : gutil.noop())
                .pipe(sourcemaps.init())
                //only uglifyjs if gulp is ran with '--type production'
                .pipe(mod.settings.environment === 'production' ? traceur() : gutil.noop())
                .pipe(mod.settings.environment === 'production' ? uglifyjs() : gutil.noop())
                .pipe(sourcemaps.write('./'))
                .pipe(gulp.dest(path.join(prefix, io.multiple.out)))
                .on('error', rej)
            ;

            stream.on('end', res);
        }).then(bsreload)
    },
    'build-mts': function (mod) {
        return new Promise(function (res, rej) {
            let prefix = mod.prefix;
            var stream = gulp.src(io.multiple.in_ts)
                .pipe(mod.settings.debug ? debug() : gutil.noop())
                .pipe(sourcemaps.init())
                .pipe(typescript(typescriptMultipleConfig))
                //only uglifyjs if gulp is ran with '--type production'
                .pipe(mod.settings.environment === 'production' ? traceur() : gutil.noop())
                .pipe(mod.settings.environment === 'production' ? uglifyjs() : gutil.noop())
                .pipe(sourcemaps.write('./'))
                .pipe(gulp.dest(path.join(prefix, io.multiple.out)))
                .on('error', rej)
            ;

            stream.on('end', res);
        }).then(bsreload)
    },
    'build-mviews': function (mod) {
        return new Promise(function (res, rej) {
            let prefix = mod.prefix;
            var stream = gulp.src(io.multiple.in_pug)
                .pipe(mod.settings.debug ? debug() : gutil.noop())
                .pipe(pug())
                .pipe(gulp.dest(path.join(prefix, io.multiple.out)))
                .on('error', rej)
            ;

            stream.on('end', res);
        }).then(bsreload)
    },
    'build-mstatic': function (mod) {
        return new Promise(function (res, rej) {
            let prefix = mod.prefix;
            gulp.src(io.multiple.in_static)
                .pipe(mod.settings.debug ? debug() : gutil.noop())
                .pipe(gulp.dest(path.join(prefix, io.multiple.out)))
                .on('error', rej)
                .on('end', res)
            ;
        }).then(bsreload)
    },
    'build-mcss': function (mod) {
        return new Promise(function (res, rej) {
            let prefix = mod.prefix;
            var processors = [
                autoprefixer(),
            ];
            var stream = gulp.src(io.multiple.in_css)
                .pipe(mod.settings.debug ? debug() : gutil.noop())
                .pipe(debounce({wait: 1000}))
                .pipe(mod.settings.environment === 'production' ? gutil.noop() : sourcemaps.init())
                .pipe(sass().on('error', sass.logError))
                .pipe(postcss(processors))
                .pipe(mod.settings.environment === 'production' ? minifyCss() : gutil.noop())
                .pipe(mod.settings.environment === 'production' ? gutil.noop() : sourcemaps.write('./'))
                .pipe(gulp.dest(path.join(prefix, io.multiple.out)))
                .on('error', rej)
            ;

            stream.on('end', res);
        }).then(bsreload)
    },
    'build-serverPure': function (mod) {
        return new Promise(function (res, rej) {
            let prefix = mod.prefix;
            return gulp.src(io.server.in)
                .pipe(mod.settings.debug ? debug() : gutil.noop())
                .pipe(sourcemaps.init())
                .pipe(concat('index.js'))
                // has to be fixed
                // .pipe(mod.settings.environment === 'production' ? traceur() : gutil.noop())
                // //only uglifyjs if gulp is ran with '--type production'
                // .pipe(mod.settings.environment === 'production' ? uglifyjs() : gutil.noop())
                .pipe(sourcemaps.write('./'))
                .pipe(gulp.dest(path.join(prefix, io.server.out)))
                .on('error', rej)
                .on('end', res)
                ;
        });
    },
    'build-css': function (mod) {
        let prefix = mod.prefix;
        let bundles = bundling[mod.settings.environment || "development"] ? bundling[mod.settings.environment || "development"] : bundling.default || {};
        if (bundling.global) {
            bundles.css = bundles.css.concat(bundling.global.css || []);
        }
        var processors = [
            autoprefixer(),
        ];
        let streams = [];
        streams.push(new Promise((res, rej) => {
                gulp.src(io.stylesheets.in)
                    .pipe(mod.settings.debug ? debug() : gutil.noop())
                    .pipe(debounce({wait: 1000}))
                    .pipe(mod.settings.environment === 'production' ? gutil.noop() : sourcemaps.init())
                    .pipe(sass().on('error', sass.logError))
                    .pipe(postcss(processors))
                    .pipe(mod.settings.environment === 'production' ? minifyCss() : gutil.noop())
                    .pipe(mod.settings.environment ? gutil.noop() : sourcemaps.write('./'))
                    .pipe(gulp.dest(path.join(prefix, io.stylesheets.out)))
                    .on('error', rej)
                    .on('end', res)
            }
        ));

        for (let bundle of (bundles.css || [])) {
            let files = bundle.files.map(file => path.join(cwd, io.stylesheets.root, file));

            streams.push((new Promise((res, rej) => {
                gulp.src(files)
                    .pipe(debounce({wait: 1000}))
                    .pipe(mod.settings.environment === 'production' ? gutil.noop() : sourcemaps.init())
                    .pipe(sass().on('error', sass.logError))
                    .pipe(concat(bundle.output))
                    .pipe(postcss(processors))
                    .pipe(mod.settings.environment === 'production' ? minifyCss() : gutil.noop())
                    .pipe(mod.settings.environment === 'production' ? gutil.noop() : sourcemaps.write('./'))
                    .pipe(gulp.dest(path.join(prefix, io.stylesheets.out)))
                    .on('error', rej)
                    .on('end', res)
                ;
            }))
                .then(_ => console.log(`
${mod.settings.environment} bundle ${bundle.output}
\t${bundle.files.join("\n\t")}
            `)));
        }

        return Promise.all(streams).then(bsreload);
    },
    'build-ts': function (mod) {
        return new Promise(function (res, rej) {
            let prefix = mod.prefix;
            var stream = gulp.src(io.typescript.in)
                .pipe(mod.settings.debug ? debug() : gutil.noop())
                .pipe(sourcemaps.init())
                .pipe(typescript(typescriptMainConfig))
                //only uglifyjs if gulp is ran with '--type production'
                .pipe(mod.settings.environment === 'production' ? traceur() : gutil.noop())
                .pipe(mod.settings.environment === 'production' ? uglifyjs() : gutil.noop())
                .pipe(sourcemaps.write('./'))
                .pipe(gulp.dest(path.join(prefix, io.typescript.out)))
                .on('error', rej)
            ;

            stream.on('end', res);
        }).then(bsreload)
    },
    'build-views': function (mod) {
        return new Promise(function (res, rej) {
            let prefix = mod.prefix;
            var stream = gulp.src(io.views.in)
                .pipe(mod.settings.debug ? debug() : gutil.noop())
                .pipe(gulp.dest(path.join(prefix, io.views.out)))
                .on('error', rej)
            ;

            stream.on('end', res);
        }).then(bsreload)
    },
    'build-static': function (mod) {
        return new Promise(function (res, rej) {
            let prefix = mod.prefix;
            gulp.src(io.static.in)
                .pipe(mod.settings.debug ? debug() : gutil.noop())
                .pipe(gulp.dest(path.join(prefix, io.static.out)))
                .on('error', rej)
                .on('end', res)
            ;
        }).then(bsreload)
    },
    'build-multiple': [
        'build-mjs',
        'build-mts',
        'build-mviews',
        'build-mstatic',
        'build-mcss'
    ],
    'build-server': ['build-arch', 'build-serverPure'],
    'build-front': ['build-arch', 'build-js', 'build-static', 'build-css', 'build-views', 'build-ts'],
    'build-all': ['build-front', 'build-server', 'build-multiple'],

    //watch tasks
    'watch-css': {
        files: watch.stylesheets,
        tasks: ["build-css"]
    },
    'watch-server': {
        files: watch.server,
        tasks: ['build-server']
    },
    'watch-server-dev': {
        files: [...watch.server, watch.dev],
        tasks: ['build-server']
    },
    'watch-js': {
        files: watch.javascript,
        tasks: ['build-js']
    },
    'watch-ts': {
        files: watch.typescript,
        tasks: ['build-ts']
    },
    'watch-views': {
        files: watch.views,
        tasks: ['build-views']
    },
    'watch-static': {
        files: watch.static,
        tasks: ['build-static']
    },
    'watch-multiple': {
        files: watch.multiple,
        tasks: ['build-multiple']
    },
    'watch-front': ['watch-static', 'watch-views', 'watch-js', 'watch-ts', 'watch-css'],
    'watch-all': ['watch-front', 'watch-server', 'watch-multiple'],
    'watch-dev': ['watch-front', 'watch-server', 'watch-server-dev'],

    //Nodemon
    'nodemonPure': function (mod) {
        return new Promise((res, rej) => {
            var started = false;

            return nodemon({
                script: 'radix.js',
                ext: 'js',
                args: ["launch", mod.settings.environment ? "in " + mod.settings.environment : ""],
                watch: watch.server,
                tasks: ['build-all']
            }).on('start', function () {
                res();
                if (!started) {
                    started = true;
                }
            }).on('restart', function () {

            });
        });
    },
    'nodemon': ['watch-all', 'nodemonPure'],

    //Nodemon dev
    'nodemonPureDev': function (mod) {

        var started = false;

        return nodemon({
            script: 'radix.js',
            ext: 'js',
            args: ["launch", mod.settings.environment ? "in " + mod.settings.environment : ""],
            watch: [watch.server, watch.dev],
            tasks: ['build-all']
        }).on('start', function () {
            if (!started) {
                started = true;
            }
        }).on('restart', function () {

        });
        return Promise.resolve();
    },
    'nodemon-dev': ['watch-all', 'nodemonPureDev'],

    //browser_sync
    'browser-sync': function (mod) {
        var env = require(path.join(process.cwd(), '/config/environments.json'));
        var node_env = mod.settings.environment || 'development';

        var _ = env[node_env];

        browserSync.init(null, {
            proxy: (_.https || _.http2 ? "https://localhost:" : "http://localhost:") + (_.port.toString()),
            files: ["public/**/*.*"],
            browser: _.browser || "",
            port: _.bsport
        });
        return Promise.resolve();
    },

    'ltools': ["nodemon", "browser-sync"],
    'ltools-dev': ['nodemon-dev', 'browser-sync'],

    //serve
    'serve-normal': {tasks: ['build-all', 'ltools'], sequence: true},
    'serve-dev': {tasks: ['build-all', 'ltools-dev'], sequence: true}
};

exports.build = ['build-all'];
exports.watch = ['watch-all'];
exports.serve = ['serve-normal'];

var bsreload_monitor = true;

function bsreload() {
    if (bsreload_monitor) {
        bsreload_monitor = false;
        setTimeout(function () {
            browserSync.reload();
            bsreload_monitor = true;
        }, 1000);
    }
}
