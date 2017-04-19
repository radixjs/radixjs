var crashTimer = {};

var $project = {};
$project.models = {};
$project.env = {};
$project.middleware = {};
$project.mapis = {};
$project.mapisList = new Set();

var radix = {};
radix.globals = {};
radix.globals.server = {};
radix.globals.expressApp = {};
radix.globals.redirectServer = {};
radix.globals.environment = {};
radix.globals.mongoose = {};
radix.globals.version = "2.0.0";

radix.dapis = {};
radix.models = {};
radix.classes = {};
radix.helpers = {};
radix.functions = {};
radix.project = {};

exports.init = function init() {
    //Classes
    radix.classes.RadixRouter = RadixRouter;
    radix.classes.Redirect = Redirect;
    radix.classes.Injector = Injector;

    //Dapis
    radix.dapis.wizards = radix_dapis_wizards();
    radix.dapis.access = radix_dapis_access();
    radix.dapis.users = radix_dapis_users();
    radix.dapis.groups = radix_dapis_groups();
    radix.dapis.files = radix_dapis_files();
    radix.dapis.mailer = radix_dapis_mailer();
    radix.dapis.useful = radix_dapis_useful();
    radix.dapis.e2e = radix_dapis_e2e();

    //Models
    radix.models.users = getDependency(radix_models_users);
    radix.models.groups = getDependency(radix_models_groups);
    radix.models.files = getDependency(radix_models_files);

    //functions
    radix.functions.controlFlowCall = controlFlowCall;
    radix.functions.mapPromises = mapPromises;
    radix.functions.loadMapi = loadMapi;
    radix.functions.getDependency = getDependency;
    radix.functions.updateDependency = updateDependency;
    radix.functions.isPromise = isPromise;
    radix.functions.loadRoutersOnto = radix_loadRoutersOnto;
    radix.functions.capture = radixCapture;

    //Libraries
    radix_logging(radix.helpers);

    //Project
    radix.project = $project;

    //Routers: THe object containing them is initialized here but populated later
    radix.routers = {};

    //Project configuration
    $project.config = {
        mongo: getDependency(require('path').join(__dirname, './config/mongo.json')),
        redis: getDependency(require('path').join(__dirname, './config/redis.json'))
    };

    radix_core_environment();
};
