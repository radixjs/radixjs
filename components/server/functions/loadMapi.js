function loadModule(moduleArg, settings) {
    if (!dependencies) {
        dependencies = {};
    }
    if (typeof moduleArg == "string") {
        if (!dependencies[moduleArg]) {
            dependencies[moduleArg] = require(moduleArg);
            var myDependency = dependencies[moduleArg];
            if (myDependency.__NAME && myDependency.__VERSION && myDependency.__AUTHOR && myDependency.__RADIXVERSIONS && myDependency.load) {
                // if (myDependency.__RADIXVERSIONS.indexOf(radix.globals.version) > -1){
                if (myDependency.__RADIXVERSIONS.map(version => checkVersion(radix.globals.version, version)).filter(e => e).length){
                    $modules[myDependency.__NAME] = myDependency;
                    $project.modulesList.add(myDependency.__NAME);
                    myDependency.load(radix, settings);
                } else {
                    throw "Dependency is not compatible with this app version";
                }
            } else {
                console.log(myDependency.__NAME + " " + myDependency.__VERSION + " " + myDependency.__AUTHOR + " " + myDependency.load);
                delete dependencies[moduleArg];
                throw "Dependency is not compatible";
            }
        }
        return dependencies[moduleArg];
    }
    else {
        throw "Dependency injection not supported for type " + typeof moduleArg;
    }
}
