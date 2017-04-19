function E2eTest(name, generator, params) {
    this.name = name;
    this.generator = generator;
    this.params = params || {};

    this.execute = function execute(){
        let self = this;
        return controlFlowCall(function* () {
            let result = yield* self.generator;
            return result;
        })();
    };

    this.invert = function(bool){
        this.params.invert = bool;
        return this;
    };

    this.essential = function(bool){
        this.params.essential = bool;
        return this;
    };

    this.linked = function(bool){
        this.params.linked = bool;
        return this;
    };

    this.dependsOf = function(tag){
        this.params.dependsOf = tag;
        return this;
    };

    this.tag = function(tag){
        this.params.tag = tag;
        return this;
    };
}