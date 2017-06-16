
class RadixRouter extends getDependency("express").Router {
    constructor() {
        super();
    }

    onGet(path, ...args) {
        super.get(path, ...args.map(arg => function (request, response, next) {
            controlFlowCall(arg)(request, response, next)
                .catch(errors => {
                    next(errors);
                })
            ;
        }));
        return this;
    }

    onPost(path, ...args) {
        super.post(path, ...args.map(arg => function (request, response, next) {
            controlFlowCall(arg)(request, response, next)
                .catch(errors => {
                    next(errors);
                })
            ;
        }));
        return this;
    }

    onPut(path, ...args) {
        super.put(path, ...args.map(arg => function (request, response, next) {
            controlFlowCall(arg)(request, response, next)
                .catch(errors => {
                    next(errors);
                })
            ;
        }));
        return this;
    }

    onAll(path, ...args) {
        super.all(path, ...args.map(arg => function (request, response, next) {
            controlFlowCall(arg)(request, response, next)
                .catch(errors => {
                    next(errors);
                })
            ;
        }));
        return this;
    }

    onDelete(path, ...args) {
        super.delete(path, ...args.map(arg => function (request, response, next) {
            controlFlowCall(arg)(request, response, next)
                .catch(errors => {
                    next(errors);
                })
            ;
        }));
        return this;
    }

    onRoute(path) {
        var route = super.route(path);

        route.onGet = function (...args) {
            route.get(...args.map(arg => function (request, response, next) {
                controlFlowCall(arg)(request, response, next)
                    .catch(errors => {
                        next(errors);
                    })
                ;
            }));
            return route;
        };
        route.onPost = function (...args) {
            route.post(...args.map(arg => function (request, response, next) {
                controlFlowCall(arg)(request, response, next)
                    .catch(errors => {
                        next(errors);
                    })
                ;
            }));
            return route;
        };
        route.onAll = function (...args) {
            route.all(...args.map(arg => function (request, response, next) {
                controlFlowCall(arg)(request, response, next)
                    .catch(errors => {
                        next(errors);
                    })
                ;
            }));
            return route;
        };
        route.onPut = function (...args) {
            route.put(...args.map(arg => function (request, response, next) {
                controlFlowCall(arg)(request, response, next)
                    .catch(errors => {
                        next(errors);
                    })
                ;
            }));
            return route;
        };
        route.onDelete = function (...args) {
            route.delete(...args.map(arg => function (request, response, next) {
                controlFlowCall(arg)(request, response, next)
                    .catch(errors => {
                        next(errors);
                    })
                ;
            }));
            return route;
        };

        return route;
    }
}