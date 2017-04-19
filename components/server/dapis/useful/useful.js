function radix_dapis_useful() {
    let thisDapi = {
        ehgs: {
            quickRender(pageArg, injectorArg){
                return function*(request, response, next) {
                    let page = radix.dapis.wizards.standards.ehgf13Arg(pageArg, request, false);
                    let injector = radix.dapis.wizards.standards.ehgf13Arg(injectorArg, request, r => false);
                    response.render(page, {user: request.user || false, page: page, environment: $project.env, data: injector});
                }
            },
            plug(messageArg){
                return function*(request, response, next) {
                    let message = radix.dapis.wizards.standards.ehgf13Arg(messageArg, request, false);
                    response.send(message);
                }
            },
        },
        pehgs: {
            parseJson(arrayArg){
                return function*(request, response, next) {
                    let array = radix.dapis.wizards.standards.ehgf13Arg(arrayArg, request, "body");
                    for (var index in request[array]) {
                        try {
                            request[array][index] = JSON.parse(request[array][index])
                        } catch (e) {
                            next(500);
                            return -1;
                        }
                    }
                    next();
                }
            },
            quickRedirect(urlArg){
                return function*(request, response, next) {
                    let url = radix.dapis.wizards.standards.ehgf13Arg(urlArg, request, false);
                    response.redirect(url);
                }
            },
            setHeader(fieldArg, valueArg){
                return function* (request, response, next) {
                    let field = radix.dapis.wizards.standards.ehgf13Arg(fieldArg, request, false);
                    let value = radix.dapis.wizards.standards.ehgf13Arg(valueArg, request, false);
                    response.set(field, value);
                    next();
                }
            },
            ternary(boolArg, ehgIfTrue, ehgIfFalse){
                return function* (request, response, next) {
                    let bool = radix.dapis.wizards.standards.ehgf13Arg(boolArg, request, false);
                    if(bool){
                        if(ehgIfFalse) {
                            yield* ehgIfTrue(request, response, next);
                        } else {
                            next();
                        }
                    } else {
                        if(ehgIfFalse) {
                            yield* ehgIfFalse(request, response, next);
                        } else {
                            next();
                        }
                    }
                }
            }
        }
    };
    return thisDapi;
}
