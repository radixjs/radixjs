function loadModule(moduleArg, settings) {
    if (!dependencies) {
        dependencies = {};
    }
    if (typeof moduleArg == "string") {
        if (!dependencies[moduleArg]) {
            dependencies[moduleArg] = require(moduleArg);
            let myDependency = dependencies[moduleArg];
            let data;
            if(data = myDependency.__DATA){
                if(data.name && data.version && data.author && data.compatibility){
                    if(data.compatibility.map(version => checkVersion(radix.globals.version, version)).filter(e => e).length){
                        $modules[data.name] = myDependency;
                        $project.modulesList.add(data.name);
                        myDependency.load(radix, settings);
                    } else {
                        throw "Dependency is not compatible with this app version";
                    }
                } else {
                    throw "The exported __DATA must contain the following keys [name, version, author, compatibility]"
                }
            } else {
                throw "Each module must have an exported __DATA variable";
            }
        }
        return dependencies[moduleArg];
    }
    else {
        throw "Dependency injection not supported for type " + typeof moduleArg;
    }
}
