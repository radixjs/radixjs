function E2eFeature(nameArg, urlArg, testsArg, optDelayArg) {
    var tests = testsArg;
    var name = nameArg;
    var url = urlArg;
    var delay = optDelayArg;
    var lastResults = {description: "No test have been done"};
    var testsDone = 0;
    var lastTime;
    var taggedResults = {};

    this.testFeature = function testFeature(mute) {
        let startTime = Date.now();
        lastResults = {};
        testsDone = 0;
        const review = this.review;
        return controlFlowCall(function*() {
            yield* radix.dapis.e2e.fcs.on(url);
            let lastTestResult = true;
            for (var test of tests) {
                if (test.params.linked) {
                    console.log(taggedResults);
                    if (test.params.dependsOf) {
                        if (!taggedResults[test.params.dependsOf]) {
                            continue;
                        }
                    } else if (!lastTestResult) {
                        continue;
                    }
                }
                lastResults[test.name] = typeof (yield test.execute()) == "object";
                if (test.params.invert) {
                    lastResults[test.name] = !lastResults[test.name];
                }
                lastTestResult = lastResults[test.name];
                if (test.params.tag) {
                    taggedResults[test.params.tag] = lastTestResult;
                }
                testsDone += 1;
                if (test.params.essential && !lastResults[test.name]) {
                    break;
                }
                if (delay) {
                    yield* radix.dapis.e2e.fcs.sleep(delay);
                }
            }
            lastTime = Date.now() - startTime;
            if(!mute){
                review();
            }
        })();
    };

    this.review = function review() {
        console.log();
        let failedTests = [];
        for (let testName in lastResults) {
            if (lastResults[testName] === false)
                failedTests.push(testName);
        }
        const colors = radix.helpers.colors;
        const prefix = colors.LIGHTBLUE + " | ";
        const taggedPrefix = prefix + colors.BLUE + "* ";
        const failedPrefix = prefix + colors.RED + "* ";
        console.log(colors.LIGHTBLUE + `Feature [${nameArg}] has been tested`);
        console.log(prefix + colors.PURPLE + `Test time: ${lastTime / 1000}s`);
        console.log(prefix);
        console.log(prefix + colors.BLUE + `Total of tests to do: ${tests.length}`);
        console.log(prefix + colors.BLUE + `Total of tests done: ${testsDone}`);
        console.log(prefix);
        console.log(prefix + colors.GREEN + `Total of successful tests: ${testsDone - failedTests.length}`);
        console.log(prefix + colors.GREEN + `Success rate: ${(1 - (failedTests.length / testsDone)) * 100}%`);
        console.log(prefix);
        console.log(prefix + colors.RED + `Total of failed tests: ${failedTests.length}`);
        console.log(prefix + colors.RED + `Fail rate: ${(failedTests.length / testsDone) * 100}%` + colors.RESET);
        if (failedTests.length) {
            console.log(prefix + colors.RED + "Failed tests:");
            for(let test of failedTests){
                console.log(failedPrefix + test);
            }
        }
        if (Object.keys(taggedResults).length) {
            console.log(prefix);
            console.log(prefix + colors.BLUE + "Tagged tests:");
        }
        for (let testName in taggedResults) {
            console.log(`${taggedPrefix}Test "${testName}": ${taggedResults[testName] ? colors.GREEN + "Successful" : colors.RED + "Failed"}`, colors.RESET);
        }
        console.log(colors.LIGHTBLUE + `End of review for [${nameArg}] test.`, colors.RESET);
    };

    this.getReviewData = function review() {
        let reviewData = {};
        let failedTests = [];
        for (let testName in lastResults) {
            if (lastResults[testName] === false)
                failedTests.push(testName);
        }
        reviewData.name = nameArg;
        reviewData.time = lastTime;
        reviewData.totalOfPlannedTests = tests.length;
        reviewData.totalTestsDone = testsDone;
        reviewData.successfulTests = testsDone - failedTests.length;
        reviewData.successRate = (1 - (failedTests.length / testsDone)) * 100;
        reviewData.totalOfFailedTests = failedTests.length;
        reviewData.failedTests = failedTests;
        reviewData.failRate = (failedTests.length / testsDone) * 100;
        reviewData.taggedResults = taggedResults;
        return reviewData;
    }
}