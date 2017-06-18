const fs = require("fs");

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

module.exports = function (mod, ...args) {
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
            case "router":
            case "router/normal":
                writeToFile("./routers/" + (mod.settings.path || mod.settings.name + ".gen.router.js"), `function ${mod.settings.name}Router(){
    let router = new RadixRouter();
    let plug = $libraries.useful.ehgs.plug;

    router.onGet("/", plug("Hello world"));

    return router;
}
                        `).then(data => console.log(`Router ${mod.settings.name} generated!`))
                break;
            case "router/access":
                writeToFile("./routers/" + (mod.settings.path || mod.settings.name + ".gen.router.js"), `function ${mod.settings.name}Router(){
    let router = new RadixRouter();

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
    let router = new RadixRouter();
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
        }${(() => {
                        if (fieldSets.length) {
                            let str = `,        
        fieldSet: {`;
                            str += fieldSets.map(key => `
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
        }${(() => {
                        if (fieldSets.length) {
                            let str = `,        
        fieldSet: {`;
                            str += fieldSets.map(key => `
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
        }${(() => {
                        if (fieldSets.length) {
                            let str = `,        
        fieldSet: {`;
                            str += fieldSets.map(key => `
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
    let router = new RadixRouter();

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
                            return writeToFile(file2, content2)
                                .then(_ => {
                                    process.exit();
                                });
                        })
                        .then(_ => {
                            console.log();
                            console.log(`${file2} was generated`);
                            console.log(`Remember to rename file and register it in the router hook`);
                            process.exit();
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
};