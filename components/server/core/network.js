function* radix_core_network(worker) {
    radix.globals.WORKER = worker;
    var __env__ = $project.env.data;
    radix.globals.environment = __env__;
    //Module dependencies.
    var debug = getDependency('debug')('test:app');
    var http = getDependency('http');
    var http2 = getDependency('spdy');
    var https = getDependency('https');
    var fs = getDependency('fs');
    var express = getDependency('express');
    var path = getDependency("path");

    radix.globals.expressApp = express();
    var port = __env__.port;
    radix.globals.expressApp.set('port', port);

    if(__env__.http2){

        var privateKey = fs.readFileSync(path.join("./config", __env__.privateKeyPath), "utf8");
        var certificate = fs.readFileSync(path.join("./config", __env__.certificatePath), "utf8");
        var ca = __env__.caPaths.map(caPath => fs.readFileSync(path.join("./config", caPath), "utf8"));
        var credentials = {
            key: privateKey,
            cert: certificate,
            secure: true,
            ca: ca
        };

        if(__env__.rport){
            var redirectServer = express();
            redirectServer.get('*', function (req, res) {
                res.redirect('https://' + __env__.domain + ":" + port + req.url)
            });
            radix.globals.redirectServer = redirectServer.listen(__env__.rport);
        } else {
            radix.globals.redirectServer = __env__.rport;
        }

        radix.globals.server = http2.createServer(credentials, radix.globals.expressApp);

    } else if (__env__.https) {

        var privateKey = fs.readFileSync(path.join("./config", __env__.privateKeyPath), "utf8");
        var certificate = fs.readFileSync(path.join("./config", __env__.certificatePath), "utf8");
        var ca = __env__.caPaths.map(caPath => fs.readFileSync(path.join("./config", caPath), "utf8"));
        var credentials = {
            key: privateKey,
            cert: certificate,
            secure: true,
            ca: ca
        };

        if(__env__.rport){
            var redirectServer = express();
            redirectServer.get('*', function (req, res) {
                res.redirect('https://' + __env__.domain + ":" + port + req.url)
            });
            radix.globals.redirectServer = redirectServer.listen(__env__.rport);
        } else {
            radix.globals.redirectServer = __env__.rport;
        }

        radix.globals.server = https.createServer(credentials, radix.globals.expressApp);

    } else {
        radix.globals.server = http.createServer(radix.globals.expressApp);
    }

    yield* radix_core_express();

    //Listen on provided port, on all network interfaces.
    radix.globals.server.listen(port);
    radix.globals.server.on('error', function (error) {
        if (error.syscall !== 'listen') {
            throw error;
        }

        // handle specific listen errors with friendly messages
        switch (error.code) {
            case 'EACCES':
                console.error('Port requires elevated privileges');
                process.exit(1);
                break;
            case 'EADDRINUSE':
                console.error('Port is already in use');
                process.exit(1);
                break;
            default:
                throw error;
        }
    });
    radix.globals.server.on('listening', function () {
        var addr = radix.globals.server.address();
        var bind = typeof addr === 'string'
            ? 'pipe ' + addr
            : 'port ' + addr.port;
        radix.helpers.aLog('\033[32mListening on ' + bind + "\033[0m");
        if(worker){
            worker.process.send("done");
        }

        controlFlowCall(function*() {
            radix.helpers.lastLogLevel = 1;
            console.log(radix.globals.WORKER.id + " |-| Executing Radix start hook");
            yield* hooks_start();
            console.log(radix.globals.WORKER.id + " |-| Radix start hook executed");

            if ($project.env.name === 'tests') {
                yield radixCapture(radix.dapis.e2e.init, "e2eInit");
                yield radixCapture(launchTestsHook, "tests");
            }
        })()

    });
}
