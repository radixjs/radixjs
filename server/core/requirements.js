function radix_core_requirements() {
    console.log("|-| Requirements");
    radix.helpers.iLog().log();
    console.time("|-| Requirements");
    radix.helpers.log("Starting verification").iLog();
    controlFlowCall(hooks_requirements)()
        .then(data => {
            radix.helpers.cLog("Requirements checked out");
            console.timeEnd("|-| Requirements");
            console.log();
            controlFlowCall(radix_core_cluster)(); //Do not need to catch this because cluster manages the crashes;
        })
        .catch(error => {
            radix.helpers.cLog("Requirements could not be verified");
            radix.helpers.log("Results being");
            radix.helpers.iLog().log(error);
            radix.helpers.cLog("End of results");
            console.timeEnd("|-| Requirements");
            console.log();
            controlFlowCall(hooks_crash)(error)
                .then(data => {
                    console.log(data);
                })
                .catch(errors => {
                    console.log(errors);
                });
        });

}
