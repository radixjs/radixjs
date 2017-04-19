function radix_authentication_strategy(){
    var User = getDependency(radix_models_users);
    var PassportLocalStrategy = getDependency('passport-local');


    return new PassportLocalStrategy({
        usernameField: 'username',
        passwordField: 'password',
        passReqToCallback: true
    }, function(req, username, password, done) {
        User.authenticate(username, password, function(error, user){
            // You can write any kind of message you'd like.
            // The message will be displayed on the next page the user visits.
            // We're currently not displaying any success message for logging in.
            console.log(error);
            done(error, user, error ? { message: error.message } : null);
        });
    });
}
