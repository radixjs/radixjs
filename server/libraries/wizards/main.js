function radix_dapis_wizards() {
    let wizards = {};
    let standards = wizards.standards = {};

    /*
     Standards
     Wizards for standards will often be used to simplify the implementation
     of a norm
     */
    standards.ehgf13Arg = function ehgf13Arg(arg, request, defaultValue) {
        var value;
        if (typeof arg == "function") {
            value = arg(request);
        } else if (typeof arg == "undefined") {
            value = defaultValue;
        } else {
            value = arg;
        }
        return value;
    };

    standards.ehgf14Arg = function ehgf14Arg(arg, request, defaultValue) {
        if (Object.getPrototypeOf(arg) == Object.getPrototypeOf(function*(){})) {
            return controlFlowCall(arg)(request);
        } else {
            return new Promise((resolve, reject) => {
                if (typeof arg == "function") {
                    resolve(arg(request));
                } else if (typeof arg == "undefined") {
                    resolve(defaultValue);
                } else {
                    resolve(arg);
                }
            });
        }
    };

    return wizards;
}
