function loadMapi(mapiArg, settings) {
    if (!dependencies) {
        dependencies = {};
    }
    if (typeof mapiArg == "string") {
        if (!dependencies[mapiArg]) {
            dependencies[mapiArg] = require(mapiArg);
            var myDependency = dependencies[mapiArg];
            if (myDependency.__NAME && myDependency.__VERSION && myDependency.__AUTHOR && myDependency.__RADIXVERSIONS && myDependency.load) {
                // if (myDependency.__RADIXVERSIONS.indexOf(radix.globals.version) > -1){
                if (myDependency.__RADIXVERSIONS.map(version => checkVersion(radix.globals.version, version)).filter(e => e).length){
                    $project.mapis[myDependency.__NAME] = myDependency;
                    $project.mapisList.add(myDependency.__NAME);
                    myDependency.load(radix, settings);
                } else {
                    throw "Dependency is not compatible with this app version";
                }
            } else {
                console.log(myDependency.__NAME + " " + myDependency.__VERSION + " " + myDependency.__AUTHOR + " " + myDependency.load);
                delete dependencies[mapiArg];
                throw "Dependency is not compatible";
            }
        }
        return dependencies[mapiArg];
    }
    else {
        throw "Dependency injection not supported for type " + typeof mapiArg;
    }
}
