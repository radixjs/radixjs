function* radix_core_authentication() {

    var passport = getDependency('passport');

    radix.helpers.log("Loading strategy");
    var authStrategy = yield* hooks_strategy();

    passport.use(authStrategy);
    passport.serializeUser(controlFlowCall(hooks_serializer));
    passport.deserializeUser(controlFlowCall(hooks_deserializer));
    var app = radix.globals.expressApp;
    app.use(getDependency('connect-flash')());
    app.use(passport.initialize());
    app.use(passport.session());
}
