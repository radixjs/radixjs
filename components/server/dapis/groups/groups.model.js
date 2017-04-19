function radix_models_groups() {
    var mongoose = getDependency('mongoose');
    var Schema = mongoose.Schema;
    var id = Schema.ObjectId;

    var myShema = new Schema({
        //Strings
        name: {type: String},

        //Numbers
        rights: {type: Number},

        //booleans
        enabled: {type: Boolean},
        power: {type: Boolean},

        //arrays
        users: [{type: id, ref: "radix_users"}],
        admins: [{type: id, ref: "radix_users"}],

    });

    return mongoose.model('radix_groups', myShema);
}
