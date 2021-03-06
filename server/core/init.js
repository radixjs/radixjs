var crashTimer = {};

var $project = {
    models: {},
    env: {},
    middleware: {},
    moduleList: new Set()
};

var $modules = {};

var $libraries = {
    models: {}
};

var radix = {};
radix.globals = {};
radix.globals.server = {};
radix.globals.expressApp = {};
radix.globals.redirectServer = {};
radix.globals.environment = {};
radix.globals.mongoose = {};
radix.globals.version = "2.0.0";

radix.models = {};
radix.classes = {};
radix.helpers = {};
radix.functions = {};
radix.project = {};

exports.init = function init() {
    //Classes
    radix.classes.RadixRouter = RadixRouter;
    radix.classes.Redirect = Redirect;

    //Dapis
    $libraries.wizards = radix_dapis_wizards();
    $libraries.access = radix_dapis_access();
    $libraries.Users = getDependency(radix_models_users);
    $libraries.mailer = radix_dapis_mailer();
    $libraries.useful = radix_dapis_useful();

    //Models
    $libraries.models.users = $libraries.Users;

    //functions
    radix.functions.controlFlowCall = controlFlowCall;
    radix.functions.mapPromises = mapPromises;
    radix.functions.loadModule = loadModule;
    radix.functions.getDependency = getDependency;
    radix.functions.updateDependency = updateDependency;
    radix.functions.isPromise = isPromise;
    radix.functions.loadRoutersOnto = radix_loadRoutersOnto;
    radix.functions.capture = radixCapture;

    //Libraries
    radix_logging(radix.helpers);

    //Project
    radix.project = $project;
    radix.libraries = $libraries;
    radix.modules = $modules;

    //Project configuration
    $project.config = {
        radixfile: getDependency(require("path").join(process.cwd(), "radixfile.json"))
    };
    $project.config.main = $project.config.radixfile;
    $project.config.mongo = $project.config.radixfile.mongo;
    $project.config.redis = $project.config.radixfile.redis;
    $project.config.mailer = getDependency("./config/libraries/mailer.json");

    radix_core_environment();
};
