function Redirect(baseUrl, propagateLocalUrl) {
    this.baseUrl = baseUrl;
    if (baseUrl.substr(-1) == "/") {
        this.baseUrl = this.baseUrl.substr(0, this.baseUrl.length - 1);
    }
    this.propagate = Boolean(propagateLocalUrl);

    this.getUrlUsingRequest = function (request) {
        let thisUrl = this.baseUrl;
        if (this.propagate && request.originalUrl) {
            thisUrl += request.originalUrl;
        }
        return thisUrl;
    };

    this.ehg = function () {
        let _this = this;
        return function*(request, response, next) {
            let thisUrl = _this.getUrlUsingRequest(request);
            response.status(301).redirect(thisUrl)
        }
    }
}
