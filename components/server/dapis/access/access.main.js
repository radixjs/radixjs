function radix_dapis_access() {
    return {
        pehgs: {
            restrictTo(limitArg, failureRedirectArg) {
                return function*(request, response, next) {
                    let limit = radix.dapis.wizards.standards.ehgf13Arg(limitArg, request, false);
                    let failureRedirect = radix.dapis.wizards.standards.ehgf13Arg(failureRedirectArg, request, false);

                    if (request.user) {
                        if (request.user.admin || !limit) {
                            next();
                        } else if ((yield* radix.dapis.groups.fcs.getUsersBestRights(request.user._id)) <= limit) {
                            next();
                        } else {
                            response.statusCode = 401;
                            if(failureRedirect){
                                response.redirect(failureRedirect);
                            } else {
                                next(401);
                            }
                        }
                    } else {
                        response.statusCode = 401;
                        if(failureRedirect){
                            response.redirect(failureRedirect);
                        } else {
                            next(401);
                        }
                    }
                }
            },
            logout() {
                return function*(request, response, next) {
                    request.logout();
                    next();
                }
            },
            login(successRedirect, failureRedirect) {
                return function*(request, response, next) {
                    return getDependency('passport').authenticate('local', {
                        successRedirect: successRedirect,
                        failureRedirect: failureRedirect,
                        failureFlash: true
                    })(request, response, next);
                }
            },
        },
        ehgs: {
            me() {
                return function*(request, response, next) {
                    response.send(request.user || {});
                }
            },
        }
    };
}
