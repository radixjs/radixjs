
var dependencies = {};

function getDependency(dependencyArg) {
    if (!dependencies) {
        dependencies = {};
    }
    if(typeof dependencyArg == "string"){
        if (!dependencies[dependencyArg]) {
            dependencies[dependencyArg] = require(dependencyArg);
        }
        return dependencies[dependencyArg];
    }
    else if(typeof dependencyArg == "function"){
        if (!dependencies[dependencyArg.name]) {
            dependencies[dependencyArg.name] = dependencyArg();
        }
        return dependencies[dependencyArg.name];
    }
    else {
        throw "Dependency injection not supported for type " + typeof dependencyArg ;
    }
}

function updateDependency(dependencyArg){
    if (!dependencies) {
        dependencies = {};
    }
    if(typeof dependencyArg == "string"){
        dependencies[dependencyArg] = require(dependencyArg);
        return dependencies[dependencyArg];
    }
    else if(typeof dependencyArg == "function"){
        dependencies[dependencyArg.name] = dependencyArg();
        return dependencies[dependencyArg.name];
    }
    else {
        throw "Dependency injection not supported for type " + typeof dependencyArg ;
    }
}