function radix_crashServer() {
    var debug = getDependency('debug')('test:app');
    var http = getDependency('http');
    var https = getDependency('https');
    var fs = getDependency('fs');
    var express = getDependency('express');

    var crashApp = express();
    crashApp.get('*', function (request, response, next) {
        response.send("This app is in maintenance")
    });
    if (radix.globals.environment.https){
        var privateKey = fs.readFileSync(radix.globals.environment.privateKeyPath, "utf8");
        var certificate = fs.readFileSync(radix.globals.environment.certificatePath, "utf8");
        var ca = [];
        for (var caPath of radix.globals.environment.caPaths) {
            ca.push(fs.readFileSync(caPath, "utf8"));
        }
        var credentials = {key: privateKey, cert: certificate, secure: true, ca: ca};
        crashApp.set('port', $project.env.data.httpsPort);
        var crashServer = https.createServer(credentials, crashApp);
        crashServer.listen($project.env.data.httpsPort);
        console.log((new Date()).toLocaleString() + " CATCH SERVER LAUNCHED ON PORT " + $project.env.data.rport);
    } else {
        console.log((new Date()).toLocaleString() + " CATCH SERVER LAUNCHED ON PORT " + $project.env.data.rport);
        crashApp.listen($project.env.data.rport);
    }
}
