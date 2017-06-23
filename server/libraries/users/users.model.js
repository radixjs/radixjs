function radix_models_users() {
    const mongoose = getDependency('mongoose');
    const Schema = mongoose.Schema;
    const Hash = require('password-hash');

    let users = new Schema({
        username: {type: String, required: true, unique: true},
        password: {
            type: String, required: true, set: function (newValue) {
                return Hash.isHashed(newValue) ? newValue : Hash.generate(newValue);
            }
        },
        rights: {type: Number, default: 5}
    });

    users.statics.authenticate = function (username, password, callback) {
        let admin = $project.config.main.admin;
        if (username === admin.login &&
            getDependency('sha256')(password) === admin.password
        ) {
            callback(null, {admin: "true", id: "admin"});
        } else {
            this.findOne({username: username}).then(user => {
                if (user && Hash.verify(password, user.password)) {
                    callback(null, user);
                } else {
                    callback(null, null);
                }
            }).catch(err => {
                callback(null, null);
            })
        }
    };

    let conv = $libraries.wizards.standards.ehgf13Arg;
    let model = mongoose.model('radix_users', users);
    let popQuery = [];

    model.fcs = {
        create: function* create(leanInstance) {
            let ins = yield (new model(leanInstance)).save()
                .catch(e => e)
            ;
            if (ins.errmsg) {
                return yield ins;
            }
            return yield model.populate(ins, popQuery);
        },
        byId: function (id) {
            return {
                get: function* get() {
                    return yield model.findById(id).populate(popQuery)
                        .catch(e => e)
                        ;
                },
                delete: function*() {
                    return yield model.findByIdAndRemove(id)
                        .catch(e => e)
                        ;
                },
                update: function* update(leanInstance) {
                    return yield model.findByIdAndUpdate(id, leanInstance, {new: true})
                        .catch(e => e)
                        ;
                }
            }
        },
        byUsername: function (username) {
            return {
                get: function* get() {
                    return yield model.findOne({username}).populate(popQuery)
                        .catch(e => e)
                        ;
                },
                delete: function*() {
                    return yield model.findOneAndRemove({username})
                        .catch(e => e)
                        ;
                },
                update: function* update(leanInstance) {
                    return yield model.findOneAndUpdate({username}, leanInstance, {new: true})
                        .catch(e => e)
                        ;
                }
            }
        },
        byRights: function (rights) {
            return {
                get: function* get() {
                    return yield model.find({rights}).populate(popQuery).lean()
                        .catch(e => e)
                        ;
                },
                delete: function*() {
                    return yield model.find({rights}).remove()
                        .catch(e => e)
                        ;
                },
                update: function* update(leanInstance) {
                    return yield model.update({rights}, leanInstance, {multi: true})
                        .catch(e => e)
                        ;
                },
                count: function* update() {
                    return yield model.count({rights})
                        .catch(e => e)
                        ;
                }
            }
        },
        get: function* get(page, length) {
            return yield model.find().skip(page * length).limit(length).lean()
                .catch(e => e)
                ;
        }
    };

    model.ehgs = {
        create(leanInstance){
            return function*(request, response, next) {
                try {
                    let data = yield* model.fcs.create(
                        conv(leanInstance, request, false)
                    );
                    return response.send(data);
                } catch (e) {
                    next(e);
                }
            }
        },
        byId(id){
            return {
                get(){
                    return function*(request, response, next) {
                        try {
                            let data = yield* model.fcs.byId(
                                conv(id, request, false)
                            ).get();
                            return response.send(data);
                        } catch (e) {
                            next(e);
                        }
                    }
                },
                delete(){
                    return function*(request, response, next) {
                        try {
                            let data = yield* model.fcs.byId(
                                conv(id, request, false)
                            ).delete();
                            return response.send(data);
                        } catch (e) {
                            next(e);
                        }
                    }
                },
                update(leanInstance){
                    return function*(request, response, next) {
                        try {
                            let data = yield* model.fcs.byId(
                                conv(id, request, false)
                            ).update(
                                conv(leanInstance, request, false)
                            );
                            return response.send(data);
                        } catch (e) {
                            next(e);
                        }
                    }
                }
            }
        },
        byUsername(username){
            return {
                get(){
                    return function*(request, response, next) {
                        let data;
                        try {
                            data = yield* model.fcs.byUsername(
                                conv(username, request, false)
                            ).get();
                        } catch (e) {
                            next(e);
                        }
                        return response.send(data);
                    }
                },
                delete(){
                    return function*(request, response, next) {
                        let data;
                        try {
                            data = yield* model.fcs.byUsername(
                                conv(username, request, false)
                            ).delete();
                            return response.send(data);
                        } catch (e) {
                            next(e);
                        }
                    }
                },
                update(leanInstance){
                    return function*(request, response, next) {
                        let data;
                        try {
                            data = yield* model.fcs.byUsername(
                                conv(username, request, false)
                            ).update(
                                conv(leanInstance, request, false)
                            );
                            return response.send(data);
                        } catch (e) {
                            next(e);
                        }
                    }
                }
            }
        },
        byRights(rights){
            return {
                get(){
                    return function*(request, response, next) {
                        try {
                            let data = yield* model.fcs.byRights(
                                conv(rights, request, false)
                            ).get();
                            response.send(data);
                        } catch (e) {
                            next(e);
                        }
                    }
                },
                delete(){
                    return function*(request, response, next) {
                        try {
                            let data = yield* model.fcs.byRights(
                                conv(rights, request, false)
                            ).delete();
                            response.send(data);
                        } catch (e) {
                            next(e);
                        }
                    }
                },
                update(leanInstance){
                    return function*(request, response, next) {
                        try {
                            let data = yield* model.fcs.byRights(
                                conv(rights, request, false)
                            ).update(
                                conv(leanInstance, request, false)
                            );
                            response.send(data);
                        } catch (e) {
                            next(e);
                        }
                    }
                },
                count: function* update() {
                    return yield model.count({rights});
                }
            }
        },
        get(page, length){
            return function*(request, response, next) {
                return response.send(yield* model.fcs.get(
                    conv(page, request, false),
                    conv(length, request, false)
                ));
            }
        }
    };

    model.pehgs = {
        create(leanInstance){
            return function*(request, response, next) {
                try {
                    let data = yield* model.fcs.create(
                        conv(leanInstance, request, false)
                    );
                    request.pehUsers = data;
                    next();
                } catch (e) {
                    next(e);
                }
            }
        },
        byId(id){
            return {
                get(){
                    return function*(request, response, next) {
                        try {
                            let data = yield* model.fcs.byId(
                                conv(id, request, false)
                            ).get();
                            request.pehUsers = data;
                            next();
                        } catch (e) {
                            next(e);
                        }
                    }
                },
                delete(){
                    return function*(request, response, next) {
                        try {
                            let data = yield* model.fcs.byId(
                                conv(id, request, false)
                            ).delete();
                            request.pehUsers = data;
                            next();
                        } catch (e) {
                            next(e);
                        }
                    }
                },
                update(leanInstance){
                    return function*(request, response, next) {
                        try {
                            let data = yield* model.fcs.byId(
                                conv(id, request, false)
                            ).update(
                                conv(leanInstance, request, false)
                            );
                            request.pehUsers = data;
                            next();
                        } catch (e) {
                            next(e);
                        }
                    }
                }
            }
        },
        byUsername(username){
            return {
                get(){
                    return function*(request, response, next) {
                        let data;
                        try {
                            data = yield* model.fcs.byUsername(
                                conv(username, request, false)
                            ).get();
                            request.pehUsers = data;
                            next();
                        } catch (e) {
                            next(e);
                        }
                    }
                },
                delete(){
                    return function*(request, response, next) {
                        let data;
                        try {
                            data = yield* model.fcs.byUsername(
                                conv(username, request, false)
                            ).delete();
                            request.pehUsers = data;
                            next();
                        } catch (e) {
                            next(e);
                        }
                    }
                },
                update(leanInstance){
                    return function*(request, response, next) {
                        let data;
                        try {
                            data = yield* model.fcs.byUsername(
                                conv(username, request, false)
                            ).update(
                                conv(leanInstance, request, false)
                            );
                            request.pehUsers = data;
                            next();
                        } catch (e) {
                            next(e);
                        }
                    }
                }
            }
        },
        byRights(rights){
            return {
                get(){
                    return function*(request, response, next) {
                        try {
                            let data = yield* model.fcs.byRights(
                                conv(rights, request, false)
                            ).get();
                            request.pehUsers = data;
                            next();
                        } catch (e) {
                            next(e);
                        }
                    }
                },
                delete(){
                    return function*(request, response, next) {
                        try {
                            let data = yield* model.fcs.byRights(
                                conv(rights, request, false)
                            ).delete();
                            request.pehUsers = data;
                            next();
                        } catch (e) {
                            next(e);
                        }
                    }
                },
                update(leanInstance){
                    return function*(request, response, next) {
                        try {
                            let data = yield* model.fcs.byRights(
                                conv(rights, request, false)
                            ).update(
                                conv(leanInstance, request, false)
                            );
                            request.pehUsers = data;
                            next();
                        } catch (e) {
                            next(e);
                        }
                    }
                },
                count: function* update() {
                    return yield model.count({rights});
                }
            }
        },
        get(page, length){
            return function*(request, response, next) {
                let data = yield* model.fcs.get(
                    conv(page, request, false),
                    conv(length, request, false)
                );
                request.pehUsers = data;
                next();
            }
        }
    };

    return model;
}
