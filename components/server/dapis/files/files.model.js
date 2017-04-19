function radix_models_files(){
    var mongoose = getDependency('mongoose'),
        Promise = getDependency('es6-promise').Promise,
        fs = getDependency('fs'),
        multer = getDependency('multer'),
        path = getDependency("path");

    var Schema = mongoose.Schema;

    var model = new Schema({
        name: {type: String},
        caption: {type: String},
        type: {type: String},
        rights: {type: Number},
        path: {type: String},
        filename: {type: String},
        token: {type: String},
        birthdate: { type : Date, default: Date.now }
    });

    return mongoose.model('radix_files', model);
}
