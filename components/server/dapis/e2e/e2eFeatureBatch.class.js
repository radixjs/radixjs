function E2eFeatureBatch(batchObj) {
    this.batchObj = batchObj;
    this.features = {};

    for(let featureData of batchObj){
        this.features[featureData.name || "unnamed"] = radix.dapis.e2e.featureFactory(featureData);
    }

    this.testAllFeatures = function testAllFeatures(mute) {
        let self = this;
        return controlFlowCall(function*() {
            for (let featureName in self.features) {
                let feature = self.features[featureName];
                yield feature.testFeature(true);
                let data = feature.getReviewData();
                if(data.failedTests.length){
                    break;
                }
            }
            if (!mute) {
                self.review();
            }
        })();
    };

    this.testFeature = function testFeature(featureName, mute) {
        let self = this;
        return controlFlowCall(function*() {
            let feature = self.features[featureName];
            if(feature){
                yield feature.testFeature(mute);
            } else {
                throw "Feature does not exist";
            }
        })();
    };

    this.review = function review() {
        let failedTaskCount = 0;
        for(let featureName in this.features){
            this.features[featureName].review();
            failedTaskCount += this.features[featureName].getReviewData().failedTests.length;
        }
        console.log(radix.helpers.colors.RED + "Total of failed tests: " + failedTaskCount + radix.helpers.colors.RESET);
    };
}