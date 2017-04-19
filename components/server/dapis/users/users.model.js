
function radix_models_users(){
    var mongoose = getDependency('mongoose');
    var Schema = mongoose.Schema;
    var Hash = require('password-hash');
    var conf = getDependency("../../config/dapi/access.json");

    var users = new Schema({
        username: {type: String, required: true, unique: true},
        password: {type: String, required: true, set: function(newValue) {
            return Hash.isHashed(newValue) ? newValue : Hash.generate(newValue);
        }},
        rights: {type: Number, default: 5}
    });

    users.statics.authenticate = function(username, password, callback) {
        if (username == conf.adminUser.login.value &&
            getDependency('sha256')(password) == conf.adminUser.password.value
        ) {
            callback(null, {admin : "true", id: "admin"});
        } else {
            this.findOne({ username: username }).then(user => {
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

    return mongoose.model('radix_users', users);
}
