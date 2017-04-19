function mapPromises(promiseObj) {
    let obj = {};
    let promiseArray = [];
    let indexReferer = [];
    for (let index in promiseObj) {
        if (typeof promiseObj[index] == "object" && typeof promiseObj[index].then == "function") {
            indexReferer.push(index);
            promiseArray.push(promiseObj[index]);
        } else {
            obj[index] = promiseObj[index];
        }
    }
    return Promise.all(promiseArray)
        .then(data => {
            for (let index = 0; index < data.length; index++) {
                obj[indexReferer[index]] = data[index];
            }
            return obj;
        })
        ;
}