function radix_loadRoutersOnto(parentRouter, routersAsObj) {
    for (var routerBase in routersAsObj) {
        let router = routersAsObj[routerBase];
        // console.log("router");
        // console.log(router);
        if (typeof router == 'object'){
            radix.helpers.log("Loading onto " + routerBase).iLog();
            let myNewRouter = new RadixRouter();
            radix_loadRoutersOnto(myNewRouter, router);
            parentRouter.use(routerBase, myNewRouter);
            radix.helpers.dLog();
        } else if (typeof router == 'function'){
            radix.helpers.log("Loading onto " + routerBase + " router [" + router.name + "]");
            parentRouter.use(routerBase, router());
        } else {
            throw `${typeof router} routers are not supported`;
        }
    }
};
