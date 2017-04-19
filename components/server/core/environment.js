function radix_core_environment(){
    console.log();
    console.time('|-| Prepared');
    console.log("|-| Preparing $project environment...");
    console.log(" | ");

    let env = require(require('path').join(__dirname, '/config/environments.json'));
    let node_env;
    if(process.argv[3] && process.argv[4]){
        switch (process.argv[3]) {
            case "in":
                node_env = process.argv[4] || process.env.NODE_ENV || 'development';
                break;
            default:
                node_env = 'development';
                break;
        }
    } else {
        node_env = 'development';
    }
    if (env[node_env]) {
        $project.env.data = env[node_env];
        $project.env.name = node_env;
    } else {
        $project.env.data = env['default'];
        $project.env.name = 'default';
    }
    console.log(" | Fetching configuration data for [" + node_env + "] environment...");
    console.log(" |  | Data for [" + $project.env.name + "] environment fetched.");
    console.log(" |  | Description: " + $project.env.data.description);
    console.log(" |<- Fetched");
    console.log(" |");
    console.timeEnd('|-| Prepared');
    console.log();

    radix_core_requirements();
}
