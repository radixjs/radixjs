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
        handler: (mod, ...args) => {
            if (mod.settings.name) {
                switch (args[0]) {
                    case "schema":
                        writeToFile("./schemas/" + (mod.settings.path || mod.settings.name + ".gen.schema.js"), `module.exports = {
    $$name: "${mod.settings.name}",
    foo: {type: String, required: true, identifier: true},
    bar: {type: String},
    ano: {ref: "${mod.settings.name}", identifier: true, populate: []}
};`).then(data => console.log(`Schema ${mod.settings.name} generated!`));
                        break;
                    case "schema/users":
                        writeToFile("./schemas/" + (mod.settings.path || mod.settings.name + ".gen.schema.js"), `module.exports = {
    $$name: "users",
    username: {type: String, required: true, identifier: true, unique: true},
    password: {type: String, required: true},
    rights: {type: Number, identifier: true}
};`).then(data => console.log(`Schema ${mod.settings.name} generated!`));
                        break;
                    case "router":
                    case "router/normal":
                        writeToFile("./routers/" + (mod.settings.path || mod.settings.name + ".gen.router.js"), `function ${mod.settings.name}Router(){
    let router = new RadixRouter;
    let plug = $libraries.useful.ehgs.plug;

    router.onGet("/", plug("Hello world"));

    return router;
}
                        `).then(data => console.log(`Router ${mod.settings.name} generated!`))
                        break;
                    case "router/users":
                        writeToFile("./routers/" + (mod.settings.path || mod.settings.name + ".gen.router.js"), `function ${mod.settings.name}Router(){
    let router = new RadixRouter;

    //some useful functions
    let parseJson = $libraries.useful.pehgs.parseJson;
    let redirect = $libraries.useful.pehgs.quickRedirect;
    let ternary = $libraries.useful.pehgs.ternary;
    let plug = $libraries.useful.ehgs.plug;

    //users dependencies
    let restrictTo = $libraries.access.pehgs.restrictTo;
    let login = $libraries.access.pehgs.login;
    let logout = $libraries.access.pehgs.logout;
    let handlers = $libraries.users.ehgs;

    //Reusable extractors for dynamic args
    let bodyExtractor = r => r.body;
    let idExtractor = r => r.params.id;

    router.onPost("/", handlers.create(r => {
        return {
            username: r.body.username,
            password: r.body.password,
            rights: 5
        }
    }));

    //Routes
    router.onRoute("/me")
        .onGet(plug(r => r.user || {}))
        .onPut(
             restrictTo(5),
             parseJson(),
             handlers.update(r => r.user._id, bodyExtractor)
        )
    ;

    router.onRoute("/access")
        .onPost(login("./success", "/"))
        .onGet(logout(), redirect("/"))
    ;

    router.onAll("/success",
        // if user is admin redirect to /admin else redirect to /
        ternary(r => r.user.rights > 3, redirect("/admin"), redirect("/"))
    );

    router.onGet("/pages/:page", handlers.getPaged(r => r.params.page, 20));

    router.onRoute("/byId/:id")
        .onAll(restrictTo(2)) //restrict to admins
    	.onGet(handlers.get(idExtractor))
    	.onPut(handlers.update(idExtractor, bodyExtractor))
    	.onDelete(handlers.remove(idExtractor))
    ;

    return router;
};
                        `).then(data => console.log(`Router ${mod.settings.name} managing users and access generated!`))
                        break;
                    case "router/upload":
                        writeToFile("./routers/" + (mod.settings.path || mod.settings.name + ".gen.router.js"), `function ${mod.settings.name}Router(){
    let router = new RadixRouter;
    let plug = $libraries.useful.ehgs.plug;
    let upload = $libraries.files.pehgs.upload;
    let restrictTo = $libraries.access.pehgs.restrictTo;
    let handlers = $libraries.files.ehgs;

    //Reusable extractors for dynamic args
    let bodyExtractor = r => r.body;
    let idExtractor = r => r.params.id;

    router.onPost("/", upload(), plug(r => r.peh));

    router.onGet("/pages/:page", handlers.getPaged(r => r.params.page, 20));

    router.onRoute("/byId/:id")
        .onAll(restrictTo(2)) //restrict to admins
    	.onGet(handlers.get(idExtractor))
    	.onPut(handlers.update(idExtractor, bodyExtractor))
    	.onDelete(handlers.delete(idExtractor))
    ;

    return router;
}
                        `).then(data => console.log(`Router ${mod.settings.name} managing uploads and files generated!`))
                        break;
                    case "model":
                        writeToFile("./models/" + (mod.settings.path || mod.settings.name + ".gen.model.js"), `function ${mod.settings.name}Model(){
    const mongoose = getDependency('mongoose');
    const Schema = mongoose.Schema;
    const conv = $libraries.wizards.standards.ehgf13Arg;

    let structure = {
        foo: {type: String, required: true},
        bar: {type: String, required: true}
    };

    var schema = new Schema(structure);

    let model = mongoose.model("${mod.settings.name}", schema);

    model.fcs = {
        create: function* create(leanInstance){
            return yield (new model(leanInstance)).save();
        },
        byId: function(id) {
            return {
                get: function* get(){
                    return yield model.findById(id);
                },
                delete: function* (){
                    return yield model.findByIdAndRemove(id);
                },
                update: function* update(leanInstance){
                    return yield model.findByIdAndUpdate(id, leanInstance, {new: true});
                }
            }
        },
        get: function* get(page, length){
            return yield model.find().skip(page*length).limit(length).lean();
        }
    };

    model.ehgs = {
        create(leanInstance){
            return function*(request, response, next){
                let data;
                try {
                    data = yield* model.fcs.create(
                        conv(leanInstance, request, false)
                    )
                } catch(e) {
                    next(500);
                }
                return response.send(data);
            }
        },
        get(page, length){
            return function*(request, response, next){
                return response.send(yield* model.fcs.get(
                    conv(page, request, false),
                    conv(length, request, false)
                ));
            }
        },
        byId(id){
            return {
                get(){
                    return function*(request, response, next){
                        let data;
                        try {
                            data = yield* model.fcs.byId(
                                conv(id, request, false)
                            ).get();
                            return response.send(data);
                        } catch(e) {
                            next(500);
                        }
                    }
                },
                delete(){
                    return function*(request, response, next){
                        let data;
                        try {
                            data = yield* model.fcs.byId(
                                conv(id, request, false)
                            ).delete();
                            return response.send(data);
                        } catch(e) {
                            next(500);
                        }
                    }
                },
                update(leanInstance){
                    return function*(request, response, next){
                        let data;
                        try {
                            data = yield* model.fcs.byId(
                                conv(id, request, false)
                            ).update(
                                conv(leanInstance, request, false)
                            );
                            return response.send(data);
                        } catch(e) {
                            next(500);
                        }
                    }
                }
            }
        },
    };

    return model;
}
                        `).then(data => console.log(`Model ${mod.settings.name} generated!`))
                        break;
                    case "component/style":
                        let rootPath = "./front/stylesheets/";
                        if (mod.settings.language != "scss" && mod.settings.language != "sass") {
                            console.log("Component does not support this language");
                            break;
                        }
                        let sassMod = `@import _global
/* Extra Small Devices, Phones */
@media only screen and (max-width : 480px)
  @import _mobile



/* Small Devices, Tablets */
@media only screen and (max-width : 768px) and (min-width: 481px)
  @import _tablet


/* Medium Devices, Desktops */
@media only screen and (max-width : 1024px) and (min-width: 769px)
  @import _desktop

/* Large Devices, Wide Screens */
@media only screen and (min-width: 1025px)
  @import _wide
`;
                        let scssMod = `@import "_global";

/* Extra Small Devices, Phones */
@media only screen and (max-width : 480px) {
  @import "_mobile";
}


/* Small Devices, Tablets */
@media only screen and (max-width : 768px) and (min-width: 481px) {
  @import "_tablet";
}


/* Medium Devices, Desktops */
@media only screen and (max-width : 1024px) and (min-width: 769px)  {
  @import "_desktop";
}

/* Large Devices, Wide Screens */
@media only screen and (min-width: 1025px)  {
  @import "_wide";
}`;
                        if (mod.settings.path) {
                            rootPath = path.join(rootPath, mod.settings.path);
                        }
                        let basePath = path.join(rootPath, mod.settings.name);
                        mdir(basePath);
                        let extension = mod.settings.language || "scss";
                        Promise.all([
                            writeToFile(path.join(basePath, "_desktop." + extension), ""),
                            writeToFile(path.join(basePath, "_global." + extension), ""),
                            writeToFile(path.join(basePath, "_mobile." + extension), ""),
                            writeToFile(path.join(basePath, "_tablet." + extension), ""),
                            writeToFile(path.join(basePath, "_wide." + extension), ""),
                            writeToFile(path.join(basePath, "main." + extension), (mod.settings.language == "sass" ? sassMod : scssMod))
                        ]).then(_ => {
                            console.log("Component generated");
                        }).catch(error => {
                            console.log(error);
                        });
                        break;
                    default:
                        console.log("Can not generate this kind of ressource")
                }
            } else {
                switch (args[0]) {
                    case "crud":
                        if (mod.settings.source) {
                            const mongoose = require('mongoose');
                            const Schema = mongoose.Schema;
                            const basePath = "/schemas/";

                            let test;
                            try {
                                test = require(path.join(process.cwd(), basePath, mod.settings.source));
                            } catch (all) {
                                console.log("A problem occured oppening " + path.join("[PSD]/schemas/", mod.settings.source));
                                break;
                            }
                            let object = {};
                            let populateFields = [];
                            let identifiers = [];
                            let mIdentifiers = [];
                            let fieldSets = [];
                            if (!test.$$name) {
                                console.log("Error no name for schema");
                                break;
                            }
                            for (let i in test) {
                                if (i.substr(0, 2) == "$$") continue;
                                let a = object[i] = {};
                                for (let key in test[i]) {
                                    switch (key) {
                                        case "ref":
                                            a.ref = test[i][key];
                                            a.type = Schema.ObjectId;
                                            if (test[i]["populate"]) {
                                                populateFields.push({path: i, select: test[i]["populate"].join(" ")});
                                            }
                                            break;
                                        case "fieldSet":
                                            fieldSets.push(i);
                                            break;
                                        case "identifier":
                                            if (test[i]["unique"]) {
                                                identifiers.push(i);
                                            } else {
                                                mIdentifiers.push(i);
                                            }
                                        case "populate":
                                            break;
                                        default:
                                            a[key] = test[i][key];
                                    }
                                }
                            }
                            let file = path.join("./models/", mod.settings.path || (test.$$name + ".gen.model.js"));
                            let file2 = path.join("./routers/", mod.settings.path || (test.$$name + ".gen.router.js"));
                            let content = "";
                            content += `function ${test.$$name}Model(){
    const mongoose = require('mongoose');
    const Schema = mongoose.Schema;
    const conv = $libraries.wizards.standards.ehgf13Arg;

    let structure = ${formatSchema(object)};

    let schema = new Schema(structure);
    let model = mongoose.model("${test.$$name}", schema);
    let popQuery = [${populateFields.map(e => `{path: '${e.path}', select: '${e.select}'}`).join(", ")}];

    model.fcs = {
        create: function* create(leanInstance){
            let ins = yield (new model(leanInstance)).save();
			return yield model.populate(ins, popQuery);
        },
        byId: function(id) {
            return {
                get: function* get(){
                    return yield model.findById(id).populate(popQuery);
                },
                delete: function* (){
                    return yield model.findByIdAndRemove(id);
                },
                update: function* update(leanInstance){
                    return yield model.findByIdAndUpdate(id, leanInstance, {new: true});
                }
            }
        },${generateFcs(identifiers, mIdentifiers)}
        get: function* get(page, length){
            return yield model.find().skip(page*length).limit(length).lean();
        }${(()=>{
                if(fieldSets.length) {
                    let str = `,        
        fieldSet: {`;
                    str += fieldSets.map(key =>`
            ${key}: function* (){
                return yield model.distinct("${key}");
            }`).join(",");
                    str += `
        }`;
                    return str;
                } else {
                    return "";
                }
            })()}
    };

    model.ehgs = {
        create(leanInstance){
            return function*(request, response, next){
                try {
                    let data = yield* model.fcs.create(
                        conv(leanInstance, request, false)
                    );
                    return response.send(data);
                } catch(e) {
                    next(500);
                }
            }
        },
        byId(id){
            return {
                get(){
                    return function*(request, response, next){
                        try {
                            let data = yield* model.fcs.byId(
                                conv(id, request, false)
                            ).get();
                            return response.send(data);
                        } catch(e) {
                            next(500);
                        }
                    }
                },
                delete(){
                    return function*(request, response, next){
                        try {
                            let data = yield* model.fcs.byId(
                                conv(id, request, false)
                            ).delete();
                            return response.send(data);
                        } catch(e) {
                            next(500);
                        }
                    }
                },
                update(leanInstance){
                    return function*(request, response, next){
                        try {
                            let data = yield* model.fcs.byId(
                                conv(id, request, false)
                            ).update(
                                conv(leanInstance, request, false)
                            );
                            return response.send(data);
                        } catch(e) {
                            next(500);
                        }
                    }
                }
            }
        },${generateEhgs(identifiers, mIdentifiers)}
        get(page, length){
            return function*(request, response, next){
                return response.send(yield* model.fcs.get(
                    conv(page, request, false),
                    conv(length, request, false)
                ));
            }
        }${(()=>{
            if(fieldSets.length) {
                let str = `,        
        fieldSet: {`;
                str += fieldSets.map(key =>`
            ${key}: function*(request, response, next){
                return response.send(yield* model.fcs.fieldSet.${key}());
            }`).join(",");
                str += `
        }`;
                return str;
            } else {
                return "";
            }
        })()}
    };
    
    model.pehgs = {
        create(leanInstance){
            return function*(request, response, next){
                try {
                    let data = yield* model.fcs.create(
                        conv(leanInstance, request, false)
                    );
                    request.peh${capitalizeFirstLetter(test.$$name)} = data;
                    next();
                } catch(e) {
                    next(500);
                }
            }
        },
        byId(id){
            return {
                get(){
                    return function*(request, response, next){
                        try {
                            let data = yield* model.fcs.byId(
                                conv(id, request, false)
                            ).get();
                            request.peh${capitalizeFirstLetter(test.$$name)} = data;
                            next();
                        } catch(e) {
                            next(500);
                        }
                    }
                },
                delete(){
                    return function*(request, response, next){
                        try {
                            let data = yield* model.fcs.byId(
                                conv(id, request, false)
                            ).delete();
                            request.peh${capitalizeFirstLetter(test.$$name)} = data;
                            next();
                        } catch(e) {
                            next(500);
                        }
                    }
                },
                update(leanInstance){
                    return function*(request, response, next){
                        try {
                            let data = yield* model.fcs.byId(
                                conv(id, request, false)
                            ).update(
                                conv(leanInstance, request, false)
                            );
                            request.peh${capitalizeFirstLetter(test.$$name)} = data;
                            next();
                        } catch(e) {
                            next(500);
                        }
                    }
                }
            }
        },${generatePehgs(identifiers, mIdentifiers, capitalizeFirstLetter(test.$$name))}
        get(page, length){
            return function*(request, response, next){
                let data = yield* model.fcs.get(
                    conv(page, request, false),
                    conv(length, request, false)
                );
                request.peh${capitalizeFirstLetter(test.$$name)} = data;
                next();
            }
        }${(()=>{
                                if(fieldSets.length) {
                                    let str = `,        
        fieldSet: {`;
                                    str += fieldSets.map(key =>`
            ${key}: function*(request, response, next){
                let data = yield* model.fcs.fieldSet.${key}();
                request.peh${capitalizeFirstLetter(test.$$name)} = data;
                next();
            }`).join(",");
                                    str += `
        }`;
                                    return str;
                                } else {
                                    return "";
                                }
                            })()}
    };

    return model;
}`;
                            writeToFile(file, content)
                                .then(data => {
                                    console.log(`${file} was generated`);
                                    console.log(`Remember to rename file and register it in the model hook`);

                                    let content2 = "";
                                    content2 += `function ${test.$$name}Router(){
    let router = new RadixRouter;

//====> Change following line depending on how you registered the model
    let handlers = $project.models.${test.$$name}.ehgs;
    let parseJSON = $libraries.useful.pehgs.parseJson;
    let limit = $libraries.access.pehgs.restrictTo;


    let bodyInjector    = ${test.$$dataInjector || "request => request.body"};
    let idInjector      = request => request.params.identifier;

    router.onRoute("/")
        .onPost(
            limit(2),
            parseJSON(),
            handlers.create(bodyInjector)
        )
    ;

    router.onGet("/byPage/:page", handlers.get(r => r.params.page, 50));

    router.onRoute("/byId/:identifier")
        .onAll(limit(2))
        .onGet(handlers.byId(idInjector).get())
        .onPut(parseJSON(), handlers.byId(idInjector).update(bodyInjector))
        .onDelete(handlers.byId(idInjector).delete())
    ;
    ${generateRoutes(identifiers, mIdentifiers)}

    return router;
}
`;
                                    return writeToFile(file2, content2);
                                })
                                .then(_ => {
                                    console.log();
                                    console.log(`${file2} was generated`);
                                    console.log(`Remember to rename file and register it in the router hook`);
                                })
                                .catch(error => {
                                    console.log("Something went wrong");
                                    console.log(error);
                                })

                        } else {
                            console.log("No source specified");
                        }
                        break;
                    default:
                        console.log("Can not generate this kind of ressource")
                }
            }
            process.exit();
        }
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
            'node_modules/radixjs/components/server/**/*.js'
        ], out: '/'
    },
    independent: {
        in: [
            "package.json",
            "radixfile.json",
            'node_modules/radixjs/components/bs/ressources/launch.js'
        ],
        out: "./"
    },
    config: {
        in: "config/**/**",
        out: "config/"
    },
    static: {
        in: 'assets/**/*',
        out: '/public/'
    },
    stylesheets: {
        in: [
            'front/stylesheets/**/*.scss',
            'front/stylesheets/**/*.sass',
            'front/stylesheets/**/*.css'
        ],
        out: '/assets/stylesheets/',
        root: "/"
    },
    views: {
        in: 'views/**/*',
        out: '/views/'
    },
    javascript: {
        in: "front/javascript/**/**.js",
        out: "/assets/javascript",
        root: "/"
    },
    multiple: {
        in_js: "front/multiple/**/**.js",
        in_ts: "front/multiple/**/**.ts",
        in_pug: "front/multiple/**/**.pug",
        in_css: [
            "front/multiple/**/**.scss",
            "front/multiple/**/**.sass"
        ],
        in_static: [
            "front/multiple/**/**.**",
            "!front/multiple/**/**.pug",
            "!front/multiple/**/**.scss",
            "!front/multiple/**/**.sass",
            "!front/multiple/**/**.ts",
            "!front/multiple/**/**.js"
        ],
        out: "/assets/multiple/"
    },
    typescript: {in: "front/typescript/**/**.ts", out: "/assets/javascript/compiled"}
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
        'routers/**/*.js'
    ],
    'dev': 'app/server/**/**.*',
    'static': 'public/**/*',
    'stylesheets': [
        'front/stylesheets/**/**.**',
        "config/bundling.json"
    ],
    'multiple': "front/multiple/**/**",
    'views': 'views/**/**',
    'javascript': [
        'front/javascript/**/**.js',
        "config/bundling.json"
    ],
    'typescript': 'front/typescript/**/**.ts',
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
                .pipe(debug())
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
            let files = bundle.files.map(file => path.join(cwd, io.javascript.root, file));
            if (bundle.async) {
                streams.push(new Promise(function (res, rej) {
                    gulp.src(files)
                        .pipe(debug())
                        .pipe(sourcemaps.init())
                        .pipe(rollupmep({
                            format: "amd",
                            sourceMap: true
                        }))
                        .pipe(concat(bundle.output))
                        //only uglifyjs if gulp is ran with '--type production'
                        .pipe(gutil.env.type === 'production' ? traceur() : gutil.noop())
                        .pipe(gutil.env.type === 'production' ? uglifyjs() : gutil.noop())
                        .pipe(sourcemaps.write('./'))
                        .pipe(gulp.dest(path.join(prefix, io.javascript.out)))
                        .on('error', rej)
                        .on('end', res)
                }));
            } else {
                streams.push(new Promise(function (res, rej) {
                    gulp.src(files)
                        .pipe(debug())
                        .pipe(sourcemaps.init())
                        .pipe(concat(bundle.output))
                        .pipe(gutil.env.type === 'production' ? traceur() : gutil.noop())
                        .pipe(gutil.env.type === 'production' ? uglifyjs() : gutil.noop())
                        .pipe(sourcemaps.write('./'))
                        .pipe(gulp.dest(path.join(prefix, io.javascript.out)))
                        .on('error', rej)
                        .on('end', res)
                }));
            }
        }

        return Promise.all(streams).then(bsreload);

        // stream.on('end', browserSync.reload);
    },
    'build-mjs': function (mod) {
        return new Promise(function (res, rej) {
            let prefix = mod.prefix;
            let stream = gulp.src(io.multiple.in_js)
                .pipe(debug())
                .pipe(sourcemaps.init())
                //only uglifyjs if gulp is ran with '--type production'
                .pipe(gutil.env.type === 'production' ? traceur() : gutil.noop())
                .pipe(gutil.env.type === 'production' ? uglifyjs() : gutil.noop())
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
                .pipe(debug())
                .pipe(sourcemaps.init())
                .pipe(typescript(typescriptMultipleConfig))
                //only uglifyjs if gulp is ran with '--type production'
                .pipe(gutil.env.type === 'production' ? traceur() : gutil.noop())
                .pipe(gutil.env.type === 'production' ? uglifyjs() : gutil.noop())
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
                .pipe(debug())
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
                .pipe(debug())
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
                .pipe(debug())
                .pipe(gutil.env.type === 'production' ? gutil.noop() : sourcemaps.init())
                .pipe(sass().on('error', sass.logError))
                .pipe(postcss(processors))
                .pipe(gutil.env.type === 'production' ? minifyCss() : gutil.noop())
                .pipe(gutil.env.type === 'production' ? gutil.noop() : sourcemaps.write('./'))
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
                .pipe(debug())
                .pipe(sourcemaps.init())
                .pipe(concat('index.js'))
                // has to be fixed
                // .pipe(gutil.env.type === 'production' ? traceur() : gutil.noop())
                // //only uglifyjs if gulp is ran with '--type production'
                // .pipe(gutil.env.type === 'production' ? uglifyjs() : gutil.noop())
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
                    .pipe(debug())
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

            streams.push(new Promise((res, rej) => {
                gulp.src(files)
                    .pipe(debug())
                    .pipe(mod.settings.environment === 'production' ? gutil.noop() : sourcemaps.init())
                    .pipe(sass().on('error', sass.logError))
                    .pipe(concat(bundle.output))
                    .pipe(postcss(processors))
                    .pipe(gutil.env.type === 'production' ? minifyCss() : gutil.noop())
                    .pipe(gutil.env.type === 'production' ? gutil.noop() : sourcemaps.write('./'))
                    .pipe(gulp.dest(path.join(prefix, io.stylesheets.out)))
                    .on('error', rej)
                    .on('end', res)
                ;
            }));
        }

        return Promise.all(streams).then(bsreload);
    },
    'build-ts': function (mod) {
        return new Promise(function (res, rej) {
            let prefix = mod.prefix;
            var stream = gulp.src(io.typescript.in)
                .pipe(debug())
                .pipe(sourcemaps.init())
                .pipe(typescript(typescriptMainConfig))
                //only uglifyjs if gulp is ran with '--type production'
                .pipe(gutil.env.type === 'production' ? traceur() : gutil.noop())
                .pipe(gutil.env.type === 'production' ? uglifyjs() : gutil.noop())
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
                .pipe(debug())
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
                .pipe(debug())
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


//local


function formatSchema(object) {
    const mongoose = require('mongoose');
    const Schema = mongoose.Schema;

    let str = "{";
    let i = 0;
    for (let key in object) {
        i++;
        if (i > 1) str += ",";
        str += "\n        ";
        str += key + (object[key].array ? ": [{" : ": {");
        let j = 0;
        for (prop in object[key]) {
            j++;
            if (prop == "type") {
                if (j > 1) str += ", ";
                str += prop + ": ";
                switch (object[key]["type"]) {
                    case Schema.ObjectId:
                        str += "Schema.ObjectId";
                        break;
                    default:
                        str += object[key]["type"].name;
                }
            } else if (prop == "array") {
            } else {
                if (j > 1) str += ", ";
                str += prop + ": ";
                if (typeof object[key][prop] == "function") {
                    let strf = object[key][prop];
                    str += strf.toString();
                } else {
                    switch (prop) {
                        case "get":
                        case "set":
                        case "validate":
                            str += object[key][prop].toString();
                            break;
                        case "default":
                            if(typeof object[key][prop] !== "string"){
                                str += object[key][prop].toString();
                                break;
                            }
                        default:
                            str += "'";
                            str += object[key][prop].toString();
                            str += "'";

                    }
                }
            }
        }
        str += (object[key].array ? "}]" : "}")
    }
    str += "\n    }";
    return str;
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function generateFcs(identifiers, mIdentifiers) {
    let str = "";
    for (let identifier of identifiers) {
        str += `
        by${capitalizeFirstLetter(identifier)}: function(${identifier}) {
            return {
                get: function* get(){
                    return yield model.findOne({${identifier}}).populate(popQuery);
                },
                delete: function* (){
                    return yield model.findOneAndRemove({${identifier}});
                },
                update: function* update(leanInstance){
                    return yield model.findOneAndUpdate({${identifier}}, leanInstance, {new: true});
                }
            }
        },`
    }
    for (let identifier of mIdentifiers) {
        str += `
        by${capitalizeFirstLetter(identifier)}: function(${identifier}) {
            return {
                get: function* get(){
                    return yield model.find({${identifier}}).populate(popQuery).lean();
                },
                delete: function* (){
                    return yield model.find({${identifier}}).remove();
                },
                update: function* update(leanInstance){
                    return yield model.update({${identifier}}, leanInstance, { multi: true });
                }
            }
        },`
    }
    return str;
}

function generateEhgs(identifiers, mIdentifiers) {
    let str = "";
    for (let identifier of identifiers) {
        let tap = capitalizeFirstLetter(identifier);
        str += `
        by${tap}(${identifier}){
            return {
                get(){
                    return function*(request, response, next){
                        let data;
                        try {
                            data = yield* model.fcs.by${tap}(
                                conv(${identifier}, request, false)
                            ).get();
                        } catch(e) {
                            next(500);
                        }
                        return response.send(data);
                    }
                },
                delete(){
                    return function*(request, response, next){
                        let data;
                        try {
                            data = yield* model.fcs.by${tap}(
                                conv(${identifier}, request, false)
                            ).delete();
                            return response.send(data);
                        } catch(e) {
                            next(500);
                        }
                    }
                },
                update(leanInstance){
                    return function*(request, response, next){
                        let data;
                        try {
                            data = yield* model.fcs.by${tap}(
                                conv(${identifier}, request, false)
                            ).update(
                                conv(leanInstance, request, false)
                            );
                            return response.send(data);
                        } catch(e) {
                            next(500);
                        }
                    }
                }
            }
        },`
    }
    for (let identifier of mIdentifiers) {
        let tap = capitalizeFirstLetter(identifier);
        str += `
        by${tap}(${identifier}){
            return {
                get(){
                    return function*(request, response, next){
                        try {
                            let data = yield* model.fcs.by${tap}(
                                conv(${identifier}, request, false)
                            ).get();
                            response.send(data);
                        } catch(e) {
                            next(500);
                        }
                    }
                },
                delete(){
                    return function*(request, response, next){
                        try {
                            let data = yield* model.fcs.by${tap}(
                                conv(${identifier}, request, false)
                            ).delete();
                            response.send(data);
                        } catch(e) {
                            next(500);
                        }
                    }
                },
                update(leanInstance){
                    return function*(request, response, next){
                        try {
                            let data = yield* model.fcs.by${tap}(
                                conv(${identifier}, request, false)
                            ).update(
                                conv(leanInstance, request, false)
                            );
                            response.send(data);
                        } catch(e) {
                            next(500);
                        }
                    }
                }
            }
        },`
    }
    return str;
}
function generatePehgs(identifiers, mIdentifiers, name) {
    let str = "";
    for (let identifier of identifiers) {
        let tap = capitalizeFirstLetter(identifier);
        str += `
        by${tap}(${identifier}){
            return {
                get(){
                    return function*(request, response, next){
                        let data;
                        try {
                            data = yield* model.fcs.by${tap}(
                                conv(${identifier}, request, false)
                            ).get();
                            request.peh${name} = data;
                            next();
                        } catch(e) {
                            next(500);
                        }
                    }
                },
                delete(){
                    return function*(request, response, next){
                        let data;
                        try {
                            data = yield* model.fcs.by${tap}(
                                conv(${identifier}, request, false)
                            ).delete();
                            request.peh${name} = data;
                            next();
                        } catch(e) {
                            next(500);
                        }
                    }
                },
                update(leanInstance){
                    return function*(request, response, next){
                        let data;
                        try {
                            data = yield* model.fcs.by${tap}(
                                conv(${identifier}, request, false)
                            ).update(
                                conv(leanInstance, request, false)
                            );
                            request.peh${name} = data;
                            next();
                        } catch(e) {
                            next(500);
                        }
                    }
                }
            }
        },`
    }
    for (let identifier of mIdentifiers) {
        let tap = capitalizeFirstLetter(identifier);
        str += `
        by${tap}(${identifier}){
            return {
                get(){
                    return function*(request, response, next){
                        try {
                            let data = yield* model.fcs.by${tap}(
                                conv(${identifier}, request, false)
                            ).get();
                            request.peh${name} = data;
                            next();
                        } catch(e) {
                            next(500);
                        }
                    }
                },
                delete(){
                    return function*(request, response, next){
                        try {
                            let data = yield* model.fcs.by${tap}(
                                conv(${identifier}, request, false)
                            ).delete();
                            request.peh${name} = data;
                            next();
                        } catch(e) {
                            next(500);
                        }
                    }
                },
                update(leanInstance){
                    return function*(request, response, next){
                        try {
                            let data = yield* model.fcs.by${tap}(
                                conv(${identifier}, request, false)
                            ).update(
                                conv(leanInstance, request, false)
                            );
                            request.peh${name} = data;
                            next();
                        } catch(e) {
                            next(500);
                        }
                    }
                }
            }
        },`
    }
    return str;
}

function generateRoutes(identifiers, mIdentifiers) {
    let str = "";

    for (let identifier of identifiers.concat(mIdentifiers)) {
        let res = capitalizeFirstLetter(identifier);
        str += `
    router.onRoute("/by${res}/:identifier")
        .onAll(limit(2))
        .onGet(handlers.by${res}(idInjector).get())
        .onPut(parseJSON(), handlers.by${res}(idInjector).update(bodyInjector))
        .onDelete(handlers.by${res}(idInjector).delete())
    ;
        `
    }

    return str;
}

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
