function* radix_core_express() {
    console.log();
    console.log("|-| Initializing express...");
    console.log(" | ");
    console.time("|-| Express init");
    radix.helpers.log("Importing dependencies", 1).iLog();

    let store = $project.env.data.store == "mongo" ? 'connect-mongo' : 'connect-redis';

    var express = getDependency('express'),
        session = getDependency('express-session'),
        path = getDependency('path'),
        logger = getDependency('morgan'),
        cookieParser = getDependency('cookie-parser'),
        bodyParser = getDependency('body-parser'),
        SStore = getDependency(store)(session),
        mongoose = getDependency('mongoose');

    radix.helpers.cLog("Dependencies imported");

    radix.helpers.log("Setting up mongoDB and mongoose").iLog();
    radix.helpers.log("Connection to mongoDB initialized").iLog();
    radix.helpers.log($project.config.mongo.url);
    // Connect to mongoDB
    yield new Promise((res, rej) => {
        mongoose.connect($project.config.mongo.url, {
            user: $project.config.mongo.user,
            pass: $project.config.mongo.password
        }, function (err) {
            if (err) {
                radix.helpers.cLog("Failed to connect MongoDB: " + err);
                rej("Failed to connect MongoDB: " + err);
            } else {
                radix.helpers.cLog("Connected to MongoDB");
                res();
            }
        });
    });
    radix.helpers.log("Injecting ES6 Promises into Mongoose");
    mongoose.Promise = Promise;
    radix.helpers.cLog("MongoDB set up");

    let sstoreSettings = {};
    if($project.env.data.store == "mongo"){
        sstoreSettings = {mongooseConnection: mongoose.connection};
    } else {
        sstoreSettings = $project.config.redis;
    }

    let sessionOpt = {};
    if($project.env.data.nodeCluster){
        sessionOpt = {
            store: new SStore(sstoreSettings),
            secret: 'a4f8071f-c873-4447-8ee2',
            proxy: true,
            resave: false,
            saveUninitialized: true,
            cookie: {secure: radix.globals.environment.https || radix.globals.environment.http2}
        };
    }

    radix.helpers.log("Setting up Express app").iLog();

    radix.helpers.log("Extracting app from global");
    //create app
    var app = radix.globals.expressApp;

    radix.helpers.log("Setting up view Engine");
    // view engine setup
    app.set('views', path.join(__dirname, './views'));
    app.set('view engine', 'pug');
    app.engine('html', getDependency('ejs').renderFile);
    app.set('view cache', $project.env.data.viewCache);
    radix.helpers.log("View cache " + ($project.env.data.viewCache ? "enabled" : "disabled"), 3);

    radix.helpers.log("Loading Radix MAPIs", 3);
    radix.helpers.iLog();
    let mapis = yield* hooks_mapis();

    for(let i in mapis){
        loadMapi(i, mapis[i]);
    };

    radix.helpers.lastLogLevel = 4;
    radix.helpers.cLog("Radix MAPIs Loaded");

    radix.helpers.log("Setting up default Middleware");
    if ($project.env.name === 'development' || $project.env.name === 'tests') {
        var prefix = radix.globals.WORKER ? (radix.globals.WORKER.id || "") : "";
        logger.format('radix', prefix + '\033[96m | ASYNC|->\033[0m :remote-addr - :remote-user [:date[clf]] \033[95m":method :url HTTP/:http-version" :status :res[content-length]\033[0m');
        app.use(logger("radix"));
    }

    radix.helpers.log("Setting up redirections");
    $project.redirects = yield* hooks_redirects();
    app.use(function (request, response, next) {
        var keys = Object.keys($project.redirects)
            .filter(element => (new RegExp(element)).test(request.headers.host));
        if (keys.length) {
            controlFlowCall($project.redirects[keys[0]].ehg())(request, response, next)
        } else {
            next();
        }
    });


    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({extended: false}));
    app.use(cookieParser());

    radix.helpers.log("Setting up Public Folders");
    app.use(express.static(path.join(__dirname, 'public')));
    app.use('/node_modules', express.static(path.join(__dirname, '../../node_modules')));
    app.use('/assets', express.static(path.join(__dirname, './assets')));
    app.use('/uploads', express.static(path.join(__dirname, './uploads')));


    radix.helpers.log("Setting up Express session");
    app.use(session(sessionOpt));

    //app and app dependencies
    radix.helpers.log("Setting up Radix other core Hooks").iLog();
    radix.helpers.log("Loading custom middleware", 3).iLog();

    let midlwr = yield* hooks_middleware();
    $project.middleware = midlwr.map(eh => controlFlowCall(eh));
    for (let middleware of $project.middleware) {
        app.use(middleware);
        radix.helpers.log("Added [" + middleware.name + "] to app.");
    }
    radix.helpers.cLog("Middleware loaded");
    radix.globals.mongoose = mongoose;
    radix.helpers.log("Loading authentication", 3);
    yield* radix_core_authentication();
    radix.helpers.log("Adding app models", 3).iLog();
    let modelList = yield* hooks_models();
    for (let modelName in modelList) {
        radix.helpers.log(`Model ${modelName} added`);
        $project.models[modelName] = modelList[modelName]();
    }
    radix.helpers.cLog("Models added");
    radix.helpers.log("Loading Radix DAPIs", 3);

    //Adding projects routers onto app
    radix.helpers.log("Loading app's routers", 3).iLog();
    $project.controllers = yield* hooks_routers();
    radix_loadRoutersOnto(app, $project.controllers);
    radix.helpers.cLog("App routers loaded");

    radix.helpers.log("", 3);

    radix.helpers.log("Loading Radix's 404 and error handlers");
    // catch 404 and forward to error handler
    app.use(function (request, response, next) {
        response.statusCode = 404;
        throw "404";
    });
    let catches = $project.catches = yield* hooks_catch();
    app.use(
        function (err, request, response, next) {
            request.errors = err;
            if (response.statusCode) {
                if (catches[response.statusCode.toString()]) {
                    controlFlowCall(catches[response.statusCode.toString()])(request, response, () => response.send(err));
                } else if (catches.default) {
                    controlFlowCall(catches.default)(request, response, next);
                } else {
                    response.status(500).send(err.toString());
                }
            } else {
                response.statusCode = 500;
                if (catches.default) {
                    controlFlowCall(catches.default)(request, response, next);
                } else {
                    response.send(err.toString());
                }
            }
        }
    );

    radix.helpers.cLog("Radix Core Hooks called");
    radix.helpers.cLog("Express app configured");

    console.timeEnd("|-| Express init");
    console.log();
    return app;
}
