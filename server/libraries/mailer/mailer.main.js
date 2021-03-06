function radix_dapis_mailer() {
    let thisDapi = {
        sendMails(mails) {
            return new Promise(function (resolve, reject) {
                let nodemail = getDependency("nodemailer");
                let mailConfig = $project.config.mailer;

                let transport = nodemail.createTransport(mailConfig);
                let work = [];
                mails.forEach(function (mail) {
                    work.push(transport.sendMail(mail));
                });
                Promise.all(work).then(data => {
                    resolve(data);
                }, errArg => {
                    reject(errArg)
                });
            });
        },
        pehgs: {
            sendMail(fromArg, toArg, mailArg){
                return function*(request, response, next) {
                    let from = $libraries.wizards.standards.ehgf13Arg(fromArg, request, null);
                    let to = $libraries.wizards.standards.ehgf13Arg(toArg, request, null);
                    let mail = $libraries.wizards.standards.ehgf13Arg(mailArg, request, null);
                    thisDapi.sendMails([{
                        from,
                        to,
                        subject: mail.subject,
                        html: mail.html,
                        text: mail.text
                    }]);
                    next();
                }
            },
        }
    };
    return thisDapi;
}
