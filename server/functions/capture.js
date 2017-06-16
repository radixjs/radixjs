function radixCapture(gen, tag) {
    return new Promise(function (resolve, reject) {
        if (radix.globals.WORKER) {
            let captureTask = {
                gen,
                resolve
            };
            _receiveQueue.push(captureTask);
            radix.globals.WORKER.send({cmd: "canI", value: tag})
        } else {
            reject("cluster not enabled");
        }
    });
}
