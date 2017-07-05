function radix_dapis_access() {
    return {
        pehgs: {
            restrictTo(limitArg, failureRedirectArg) {
                return function*(request, response, next) {
                    let limit = $libraries.wizards.standards.ehgf13Arg(limitArg, request, false);
                    let failureRedirect = $libraries.wizards.standards.ehgf13Arg(failureRedirectArg, request, false);

                    let failHandler = function(){
                        response.statusCode = 401;
                        if(failureRedirect){
                            response.redirect(failureRedirect);
                        } else {
                            next(401);
                        }
                    };

                    if (request.user) {
                        if(request.user.rights > limitArg){
                            failHandler();
                        } else {
                            next();
                        }
                    } else {
                        failHandler();
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
        },
        isAuth: function(request){
            return Boolean(request.user);
        }
    };
}
