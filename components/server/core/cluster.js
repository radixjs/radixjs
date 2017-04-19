function* radix_core_cluster() {
    var cluster = require('cluster');

    process.on('SIGINT', function () {
        console.log("Caught interrupt signal");
        console.log("[-] Shutting down app");
        console.time("[-] Shut down");
        for (var id in cluster.workers) {
            radix.helpers.log(`Killing worker ${id}`, 1);
            cluster.workers[id].kill();
        }
        console.timeEnd("[-] Shut down");

        process.exit(0);
    });

    if (cluster.isMaster && $project.env.data.nodeCluster) {

        // Count the machine's CPUs
        var cpuCount = require('os').cpus().length;
        var workerCount = 0;
        var wantedWorkers = cpuCount < $project.env.data.threads ? cpuCount : $project.env.data.threads || 1;

        //Used to store
        let clusterCaptureSystem = {};

        var clusterGenerator = function*() {
            for (let i = 0; i < wantedWorkers; i++) {
                let worker = cluster.fork();
                yield new Promise((resolve, reject) => {
                    worker.on('message', function (message) {
                        let w = worker;
                        //console.log(radix.helpers.colors.PURPLE + "MASTER: Recieved message from " + w.id);
                        //console.log(" | " + message + radix.helpers.colors.RESET);
                        if (message == "done") {
                            workerCount += 1;
                        }
                        if (message.cmd && message.value) {
                            switch (message.cmd) {
                                case "canI":
                                    let smes = {
                                        cmd: "youCan",
                                        value: !(clusterCaptureSystem[message.value]),
                                        tag: message.value,
                                    };
                                    // console.log(smes);
                                    worker.send(smes);
                                    break;
                                case "iHave":
                                    clusterCaptureSystem[message.value] = true;
                                    break;
                            }
                        }
                        resolve();
                    })
                })
            }
        };

        controlFlowCall(clusterGenerator)()
            .then(data => {
                console.log(radix.helpers.colors.PURPLE + "MASTER: All generated" + radix.helpers.colors.RESET)
            })
            .catch(errors => {
                console.log("Fatal Error")
            })
        ;

        // Listen for dying workers
        cluster.on('exit', function (worker) {
            if (workerCount < wantedWorkers * 2) {
                console.log(`Workers: ${workerCount}`);
                // Replace the dead worker, we're not sentimental
                console.log('Worker %d died :(', worker.id);
                cluster.fork();
                workerCount += 1;
                setTimeout(function () {
                    workerCount = 0;
                    radix.helpers.aLog("Security buffer cleared");
                    crashTimer = false;
                }, 30000);
            } else {
                console.log(`Workers: ${workerCount}`);
                controlFlowCall(hooks_crash)();
            }


        });

        setTimeout(function () {
            workerCount = 0;
            radix.helpers.aLog("Security buffer cleared");
        }, 30000);

// Code to run if we're in a worker process
    } else if (!$project.env.data.nodeCluster) {
        yield* radix_core_network(false);
    } else {
        yield* radix_core_workerReceive(cluster.worker);
    }
}
