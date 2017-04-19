function radix_dapis_e2e() {
    let webdriver = require('selenium-webdriver');
    let By = webdriver.By;
    let until = webdriver.until;

    let driver;
    let currentUrl = "none";
    let eHandler = e => console.log("\033[37m" + e + "\033[0m");

    let thisDapi = {
        selenium: webdriver,
        driver: {},
        featureFactory(obj){
            return new E2eFeature(obj.name, obj.url, obj.tests, obj.delay || false);
        },
        init(){
            thisDapi.driver = new webdriver.Builder().withCapabilities(thisDapi.selenium.Capabilities.chrome()).build();
            return thisDapi;
        },
        fcs: {
            on: function*(url) {
                let driver = thisDapi.driver;
                currentUrl = url;
                driver.get(url);
            },
            testFormMulti: function*(formId, array, submitSelector, delayBeforeSubmit) {
                let url = currentUrl;
                let errors = [];
                for (let obj of array) {
                    yield* thisDapi.fcs.on(url);
                    errors.push(yield* thisDapi.fcs.testFormOnce(formId, obj, submitSelector));
                }
                return errors;
            },
            testFormOnce: function*(formId, obj, submitSelector, delayBeforeSubmit) {
                radix.helpers.lastLogLevel = 1;
                console.log("");
                console.log(`Testing form (${formId}) on ${currentUrl}`);
                radix.helpers.log("Populating fields").iLog();
                let driver = thisDapi.driver;
                let prefix = "#" + formId;
                for (let key in obj) {
                    radix.helpers.log(`Populating [${key}] with "${obj[key]}"`);
                    try {
                        let elem = yield driver.findElement(By.css(prefix + " [name=\"" + key + "\"]"));
                        let tag = yield elem.getTagName();
                        if (tag == "input") {
                            let type = yield elem.getAttribute("type");
                            // console.log(type);
                            switch (type) {
                                case "checkbox":
                                    if (obj[key]) {
                                        yield elem.click();
                                    }
                                    break;
                                case "radio":
                                    let radios = yield driver.findElements(By.css(prefix + " [name=\"" + key + "\"]"));
                                    for (let radio of radios) {
                                        let value = yield radio.getAttribute("value");
                                        if (value == obj[key]) {
                                            radio.click();
                                        }
                                    }
                                    break;
                                default:
                                    yield elem.sendKeys(obj[key]);
                                    break;
                            }
                        } else if (tag == "select") {
                            yield elem.click();
                            let children = yield elem.findElements(By.tagName("option"));
                            let chosenChild;
                            for (let child of children) {
                                let text = yield child.getText();
                                if (text == obj[key]) {
                                    child.click();
                                    break;
                                }
                            }
                        }
                    } catch (e) {
                        console.log("\033[31m" + e + "\033[0m");
                    }
                }
                radix.helpers.cLog("Fields populated");
                yield* thisDapi.fcs.sleep(delayBeforeSubmit);
                radix.helpers.log("Submitting form");
                let element = driver.findElement(By.css(submitSelector));
                let submitted;
                submitted = (typeof (yield driver.wait(until.elementIsEnabled(element), 4000).catch(eHandler)) == "object");
                if (submitted) {
                    submitted = (typeof (yield element.click().catch(eHandler)) == "object");
                }
                if (!submitted) {
                    radix.helpers.log("\033[37m" + `Error on the element identified by css selector "${submitSelector}"` + "\033[0m");
                }
                radix.helpers.cLog(`Form submitted: ${submitted}`);
                console.log("Form tested");
                return submitted;
            },
            testForm: function*(formId, obj, submitSelector, delayBeforeSubmit) {
                return Array.isArray(obj) ?
                    yield* thisDapi.fcs.testFormMulti(formId, obj, submitSelector, delayBeforeSubmit) :
                    yield* thisDapi.fcs.testFormOnce(formId, obj, submitSelector, delayBeforeSubmit)
            },
            sendKeys: function*(txt) {
                return yield thisDapi.driver.switchTo().activeElement().sendKeys(txt);
            },
            is: {
                on: function*(substr) {
                    let driver = thisDapi.driver;
                    return typeof (yield driver.wait(until.urlContains(substr))) == "object";
                },
                elementVisible: function*(selector) {
                    radix.helpers.lastLogLevel = 1;
                    console.log("");
                    console.log(`Checking if (${selector}) is visible`);
                    let driver = thisDapi.driver;
                    let result = typeof (yield driver.findElement(By.css(selector)).isDisplayed().catch(eHandler)) == "object";
                    if (result) {
                        console.log(`(${selector}) is visible`);
                    } else {
                        eHandler(`(${selector}) is not visible`)
                    }
                    return result;
                },
            },
            clickOn: {
                element: function*(selector) {
                    radix.helpers.lastLogLevel = 1;
                    console.log("");
                    console.log(`Trying to click on (${selector})`);
                    let driver = thisDapi.driver;
                    let success = typeof (yield driver.findElement(By.css(selector)).click().catch(eHandler)) == "object";
                    if (!success) {
                        eHandler("Apparently operation failed");
                    } else {
                        console.log("Success")
                    }
                    return success;
                },
                elements: function*(selectorArray, delay) {
                    for (let selector of selectorArray) {
                        yield* thisDapi.fcs.clickOnElement(selector);
                        if (delay) {
                            yield* thisDapi.fcs.sleep(delay)
                        }
                    }
                }
            },
            sleep: function*(time) {
                return yield new Promise(function (resolve, reject) {
                    setTimeout(_ => resolve({allGood: "all good"}), time);
                });
            },
            waitUntil: {
                _gen: function*(func, selector, delay) {
                    let driver = thisDapi.driver;
                    let elem = yield driver.findElement(By.css(selector));
                    let result = yield driver.wait(until[func](elem), delay).catch(eHandler);
                    return typeof result == "object";
                },
                _genWithParam: function*(func, selector, param, delay) {
                    let driver = thisDapi.driver;
                    let elem = yield driver.findElement(By.css(selector));
                    let result = yield driver.wait(until[func](elem, param), delay).catch(eHandler);
                    return typeof result == "object";
                },
                elementIs: {
                    enabled: function*(selector, delay) {
                        console.log();
                        console.log(Boolean(delay) ?
                            `Waiting for (${selector}) to be enabled` :
                            `Waiting for (${selector}) to be enabled but will continue after ${delay}`
                        );
                        let result = yield* thisDapi.fcs.waitUntil._gen("elementIsEnabled", selector, delay);
                        result = Boolean(result);
                        console.log(`Success: ${result}`);
                        return result;
                    },
                    disabled: function*(selector, delay) {
                        console.log();
                        console.log(Boolean(delay) ?
                            `Waiting for (${selector}) to be disabled` :
                            `Waiting for (${selector}) to be disabled but will continue after ${delay}`
                        );
                        let result = yield* thisDapi.fcs.waitUntil._gen("elementIsDisabled", selector, delay);
                        result = Boolean(result);
                        console.log(`Success: ${result}`);
                        return result;
                    },
                    visible: function*(selector, delay) {
                        console.log();
                        console.log(Boolean(delay) ?
                            `Waiting for (${selector}) to be visible but will continue after ${delay}` :
                            `Waiting for (${selector}) to be visible`
                        );
                        let result = yield* thisDapi.fcs.waitUntil._gen("elementIsVisible", selector, delay);
                        result = Boolean(result);
                        console.log(`Success: ${result}`);
                        return result;
                    },
                    notVisible: function*(selector, delay) {
                        console.log();
                        console.log(Boolean(delay) ?
                            `Waiting for (${selector}) to not be visible` :
                            `Waiting for (${selector}) to not be visible but will continue after ${delay}`
                        );
                        let result = yield* thisDapi.fcs.waitUntil._gen("elementIsVisible", selector, delay);
                        result = Boolean(result);
                        console.log(`Success: ${result}`);
                        return result;
                    },
                    selected: function*(selector, delay) {
                        console.log();
                        console.log(Boolean(delay) ?
                            `Waiting for (${selector}) to be selected` :
                            `Waiting for (${selector}) to be selected but will continue after ${delay}`
                        );
                        let result = yield* thisDapi.fcs.waitUntil._gen("elementIsVisible", selector, delay);
                        result = Boolean(result);
                        console.log(`Success: ${result}`);
                        return result;
                    },
                    notSelected: function*(selector, delay) {
                        console.log();
                        console.log(Boolean(delay) ?
                            `Waiting for (${selector}) to not be selected` :
                            `Waiting for (${selector}) to not be selected but will continue after ${delay}`
                        );
                        let result = yield* thisDapi.fcs.waitUntil._gen("elementIsNotSelected", selector, delay);
                        result = Boolean(result);
                        console.log(`Success: ${result}`);
                        return result;
                    },
                },
                elementText: {
                    contains: function*(selector, text, delay) {
                        console.log();
                        console.log(Boolean(delay) ?
                            `Waiting for (${selector})'s text to contain |${text}| but will continue after ${delay}` :
                            `Waiting for (${selector})'s text to contain |${text}|.`
                        );
                        let result = yield* thisDapi.fcs.waitUntil._genWithParam("elementTextContains", selector, text, delay);
                        result = Boolean(result);
                        console.log(`Success: ${result}`);
                        return result;
                    },
                    equals: function*(selector, text, delay) {
                        console.log();
                        console.log(Boolean(delay) ?
                            `Waiting for (${selector})'s text to equals |${text}|.` :
                            `Waiting for (${selector})'s text to equals |${text}| but will continue after ${delay}`
                        );
                        let result = yield* thisDapi.fcs.waitUntil._genWithParam("elementTextIs", selector, text, delay);
                        result = Boolean(result);
                        console.log(`Success: ${result}`);
                        return result;
                    },
                    matches: function*(selector, regex, delay) {
                        console.log();
                        console.log(Boolean(delay) ?
                            `Waiting for (${selector})'s text to match |${regex}|` :
                            `Waiting for (${selector})'s text to match |${regex}| but will continue after ${delay}`
                        );
                        let result = yield* thisDapi.fcs.waitUntil._genWithParam("elementTextMatches", selector, regex, delay);
                        result = Boolean(result);
                        console.log(`Success: ${result}`);
                        return result;
                    },
                },
                elementValue: {
                    matches: function*(selector, regex, delay) {
                        console.log();
                        console.log(Boolean(delay) ?
                            `Waiting for (${selector})'s value to match |${regex}| but will continue after ${delay}ms` :
                            `Waiting for (${selector})'s value to match |${regex}|`
                        );
                        let driver = thisDapi.driver;
                        let elem = yield driver.findElement(By.css(selector));
                        let cond = function () {
                            return elem.getAttribute("value")
                                .then(value => {
                                    if (value) {
                                        return value.match(regex);
                                    } else {
                                        return false;
                                    }
                                })
                        };
                        let result = delay ?
                            (yield driver.wait(cond, delay)) :
                            (yield driver.wait(cond));
                        result = Boolean(result);
                        console.log(`Success: ${result}`);
                        return result;
                    },
                    equals: function*(selector, text, delay) {
                        console.log();
                        console.log(Boolean(delay) ?
                            `Waiting for (${selector})'s value to equal |${text}|` :
                            `Waiting for (${selector})'s value to equal |${text}| but will continue after ${delay}`
                        );
                        let driver = thisDapi.driver;
                        let elem = yield driver.findElement(By.css(selector));
                        console.log(yield elem.getAttribute("value"));
                        let result = yield driver.wait(function () {
                            return elem.getAttribute("value")
                                .then(value => {
                                    return value == text;
                                })
                        }, delay);
                        result = Boolean(result);
                        console.log(`Success: ${result}`);
                        return result;
                    },
                },
                title: {
                    contains: function*(text, delay) {
                        let driver = thisDapi.driver;
                        console.log();
                        console.log(delay ?
                            `Waiting for title's value to contain |${text}| but will continue after ${delay}ms` :
                            `Waiting for title's value to contain |${text}|`
                        );
                        console.log(yield driver.getTitle());
                        let result = delay ?
                            (yield driver.wait(until.titleContains(text), delay).catch(eHandler)) :
                            (yield driver.wait(until.titleContains(text)).catch(eHandler));
                        result = Boolean(result);
                        console.log(`Success: ${result}`);
                        return result;
                    },
                    matches: function*(text, delay) {
                        let driver = thisDapi.driver;
                        console.log();
                        console.log(Boolean(delay) ?
                            `Waiting for title's value to matches |${text}|` :
                            `Waiting for title's value to matches |${text}| but will continue after ${delay}`
                        );

                        let result = delay ?
                            (yield driver.wait(until.titleMatches(text), delay).catch(eHandler)) :
                            (yield driver.wait(until.titleMatches(text)).catch(eHandler));
                        result = Boolean(result);
                        console.log(`Success: ${result}`);
                        return result;
                    },
                    equals: function*(text, delay) {
                        let driver = thisDapi.driver;
                        console.log();
                        console.log(Boolean(delay) ?
                            `Waiting for title's value to equals |${text}|` :
                            `Waiting for title's value to equals |${text}| but will continue after ${delay}`
                        );

                        let result = delay ?
                            (yield driver.wait(until.titleIs(text), delay).catch(eHandler)) :
                            (yield driver.wait(until.titleIs(text)).catch(eHandler));
                        result = Boolean(result);
                        console.log(`Success: ${result}`);
                        return result;
                    },
                }
            },
            close: function*() {
                return yield thisDapi.driver.quit();
            }
        }
    };
    return thisDapi;
}
