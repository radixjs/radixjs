function radix_dapis_groups() {
    let Groups = getDependency(radix_models_groups);
    let Users = getDependency(radix_models_users);
    let thisDapi = {
        actions: {
            ENABLE: 1,
            DISABLE: 2,
            MAKEPOWERFULL: 3,
            STRIPPOWERS: 4,
        },
        fcs: {
            create: function*(leanInstance) {
                return yield (new Groups(leanInstance)).save();
            },
            update: function*(id, leanInstance) {
                return yield Groups.findByIdAndUpdate(id, leanInstance, {new: true});
            },
            get: function*(id) {
                return yield Groups.findById(id).populate("users").populate("admins");
            },
            getAll: function*(page, pageLength) {
                return yield (
                    (typeof page == 'number' && pageLength) ?
                        Groups.find({}).populate("users").sort("_id").skip(page * pageLength).limit(pageLength) : //true
                        Groups.find({}).populate("users").sort("_id") //false
                );
            },
            getByName: function*(name, page, pageLength){
                return yield (
                    (typeof page == 'number' && pageLength) ?
                        Groups.find({name: name}).populate("users").skip(page * pageLength).limit(pageLength) : //true
                        Groups.find({name: name}).populate("users") //false
                );
            },
            getEnabled: function*(page, pageLength) {
                return yield (
                    (typeof page == 'number' && pageLength) ?
                        Groups.find({enabled: true}).skip(page * pageLength).limit(pageLength) : //true
                        Groups.find({enabled: true}) //false
                );
            },
            getByRights: function*(rights, page, pageLength) {
                return yield (
                    (typeof page == 'number' && pageLength) ?
                        Groups.find({rights: rights}).skip(page * pageLength).limit(pageLength) : //true
                        Groups.find({rights: rights}) //false
                );
            },
            delete: function*(id) {
                return yield Groups.findByIdAndRemove(id);
            },

            addUser: function*(parentId, userId) {
                let parent = yield Groups.findById(parentId);

                if (parent.users) {
                    parent.users.push(userId);
                    return yield parent.save();
                } else {
                    return {};
                }
            },
            addUsers: function*(parentId, userIds) {
                let parent = yield Groups.findById(parentId);
                if (parent.users) {
                    parent.users.concat(userIds);
                    return yield parent.save();
                } else {
                    return {};
                }
            },
            addAdmin: function*(parentId, adminId) {
                let parent = yield Groups.findById(parentId);
                if (parent.admins) {
                    parent.admins.push(adminId);
                    return yield parent.save();
                } else {
                    return {};
                }
            },
            removeAdmin: function*(parentId, adminId) {
                let parent = yield Groups.findById(parentId);
                if (parent.admins) {
                    parent.admins = parent.admins.filter(admin => admin != adminId);
                    return yield parent.save();
                } else {
                    return {};
                }
            },
            removeUser: function*(parentId, userID) {
                let parent = yield Groups.findById(parentId);
                if (parent.users) {
                    parent.users = parent.users.filter(users => users != userID);
                    return yield parent.save();
                } else {
                    return {};
                }
            },
            getUsersBestRights: function*(userId) {
                let differentRights = yield mapPromises({
                    groupBased: Groups.find({users: userId, power: true, enabled: true}).exec(),
                    user: Users.findById(userId).exec()
                });
                let rightsArray = differentRights.groupBased.map(group => group.rights);
                rightsArray.push(differentRights.user.rights);
                let bestRights = Math.min(...rightsArray);
                return bestRights;
            },
            getUsersGroups: function*(userId) {
                return yield Groups.find({users: userId, enabled: true}).exec();
            },
            groupHasUser: function*(userId, groupId) {
                return Boolean((yield Groups.count({users: userId, _id: groupId}).exec()));
            },
            isUserInAGroupNamed: function*(userId, groupName) {
                return Boolean((yield Groups.count({users: userId, name: groupName}).exec()));
            },
            action: function*(id, action) {
                switch (action) {
                    case thisDapi.actions.DISABLE:
                        return yield Groups.findByIdAndUpdate(id, {enabled: false}, {new: true});
                        break;
                    case thisDapi.actions.ENABLE:
                        return yield Groups.findByIdAndUpdate(id, {enabled: true}, {new: true});
                        break;
                    case thisDapi.actions.STRIPPOWERS:
                        return yield Groups.findByIdAndUpdate(id, {power: false}, {new: true});
                        break;
                    case thisDapi.actions.MAKEPOWERFULL:
                        return yield Groups.findByIdAndUpdate(id, {power: true}, {new: true});
                        break;
                }
            },

        },
        ehgs: {
            create(leanInstanceArg) {
                return function*(request, response, next) {
                    let leanInstance = radix.dapis.wizards.standards.ehgf13Arg(leanInstanceArg, request, false);
                    response.send(yield* thisDapi.fcs.create(leanInstance));
                };
            },
            update(idArg, leanInstanceArg) {
                return function*(request, response, next) {
                    let leanInstance = radix.dapis.wizards.standards.ehgf13Arg(leanInstanceArg, request, false);
                    let id = radix.dapis.wizards.standards.ehgf13Arg(idArg, request, false);
                    response.send(yield* thisDapi.fcs.update(id, leanInstance));
                };
            },
            get(idArg){
                return function*(request, response, next) {
                    let id = radix.dapis.wizards.standards.ehgf13Arg(idArg, request, false);
                    response.send(yield* thisDapi.fcs.get(id));
                };
            },
            getAll(pageArg, pageLengthArg){
                return function*(request, response, next) {
                    let page = radix.dapis.wizards.standards.ehgf13Arg(pageArg, request, false);
                    let pageLength = radix.dapis.wizards.standards.ehgf13Arg(pageLengthArg, request, false);
                    response.send(yield* thisDapi.fcs.getAll(page, pageLength));
                };
            },
            getByName(nameArg, pageArg, pageLengthArg){
                return function*(request, response, next) {
                    let name = radix.dapis.wizards.standards.ehgf13Arg(nameArg, request, false);
                    let page = radix.dapis.wizards.standards.ehgf13Arg(pageArg, request, false);
                    let pageLength = radix.dapis.wizards.standards.ehgf13Arg(pageLengthArg, request, false);
                    response.send(yield* thisDapi.fcs.getByName(name, page, pageLength));
                };
            },
            getEnabled(pageArg, pageLengthArg){
                return function*(request, response, next) {
                    let page = radix.dapis.wizards.standards.ehgf13Arg(pageArg, request, false);
                    let pageLength = radix.dapis.wizards.standards.ehgf13Arg(pageLengthArg, request, false);
                    response.send(yield* thisDapi.fcs.getEnabled(page, pageLength));
                };
            },
            getByRights(rightsArg, pageArg, pageLengthArg){
                return function*(request, response, next) {
                    let rights = radix.dapis.wizards.standards.ehgf13Arg(rightsArg, request, false);
                    let page = radix.dapis.wizards.standards.ehgf13Arg(pageArg, request, false);
                    let pageLength = radix.dapis.wizards.standards.ehgf13Arg(pageLengthArg, request, false);
                    response.send(yield* thisDapi.fcs.getByRights(rights, page, pageLength));
                };
            },
            delete(idArg){
                return function*(request, response, next) {
                    let id = radix.dapis.wizards.standards.ehgf13Arg(idArg, request, false);
                    response.send(yield* thisDapi.fcs.delete(id));
                };
            },

            addUser(parentIdArg, userIdArg){
                return function*(request, response, next) {
                    let parentId = radix.dapis.wizards.standards.ehgf13Arg(parentIdArg, request, false);
                    let userId = radix.dapis.wizards.standards.ehgf13Arg(userIdArg, request, false);
                    response.send(yield* thisDapi.fcs.addUser(parentId, userId));
                };
            },
            addUsers(parentIdArg, userIdsArg){
                return function*(request, response, next) {
                    let parentId = radix.dapis.wizards.standards.ehgf13Arg(parentIdArg, request, false);
                    let userIds = radix.dapis.wizards.standards.ehgf13Arg(userIdsArg, request, false);
                    response.send(yield* thisDapi.fcs.addUsers(parentId, userIds));
                };
            },
            addAdmin(parentIdArg, userIdArg){
                return function*(request, response, next) {
                    let parentId = radix.dapis.wizards.standards.ehgf13Arg(parentIdArg, request, false);
                    let userId = radix.dapis.wizards.standards.ehgf13Arg(userIdArg, request, false);
                    response.send(yield* thisDapi.fcs.addAdmin(parentId, userId));
                };
            },
            removeAdmin(parentIdArg, userIdArg){
                return function*(request, response, next) {
                    let parentId = radix.dapis.wizards.standards.ehgf13Arg(parentIdArg, request, false);
                    let userId = radix.dapis.wizards.standards.ehgf13Arg(userIdArg, request, false);
                    response.send(yield* thisDapi.fcs.removeAdmin(parentId, userId));
                };
            },
            removeUser(parentIdArg, userIdArg){
                return function*(request, response, next) {
                    let parentId = radix.dapis.wizards.standards.ehgf13Arg(parentIdArg, request, false);
                    let userId = radix.dapis.wizards.standards.ehgf13Arg(userIdArg, request, false);
                    response.send(yield* thisDapi.fcs.removeUser(parentId, userId));
                };
            },
            getUsersBestRights(userIdArg){
                return function*(request, response, next) {
                    let userId = radix.dapis.wizards.standards.ehgf13Arg(userIdArg, request, false);
                    response.send(yield* thisDapi.fcs.getUsersBestRights(userId));
                };
            },
            getUsersGroups(userIdArg){
                return function*(request, response, next) {
                    let userId = radix.dapis.wizards.standards.ehgf13Arg(userIdArg, request, false);
                    response.send(yield* thisDapi.fcs.getUsersGroups(userId));
                };
            },
            groupHasUser(userIdArg, groupIdArg){
                return function*(request, response, next) {
                    let userId = radix.dapis.wizards.standards.ehgf13Arg(userIdArg, request, false);
                    let groupId = radix.dapis.wizards.standards.ehgf13Arg(groupIdArg, request, false);
                    response.send(yield* thisDapi.fcs.groupHasUser(userId, groupId));
                };
            },
            isUserInAGroupNamed(userIdArg, groupNameArg){
                return function*(request, response, next) {
                    let userId = radix.dapis.wizards.standards.ehgf13Arg(userIdArg, request, false);
                    let groupName = radix.dapis.wizards.standards.ehgf13Arg(groupNameArg, request, false);
                    response.send(yield* thisDapi.fcs.isUserInAGroupNamed(userId, groupName));
                };
            },
            action(idArg, actionArg){
                return function*(request, response, next) {
                    let id = radix.dapis.wizards.standards.ehgf13Arg(idArg, request, false);
                    let action = radix.dapis.wizards.standards.ehgf13Arg(actionArg, request, false);
                    response.send(yield* thisDapi.fcs.action(id, action));
                };
            },
        }
    };
    return thisDapi;
}
