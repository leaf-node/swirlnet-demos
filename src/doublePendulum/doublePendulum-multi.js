// Copyright 2016 Andrew Engelbrecht
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


/*global Promise */

var testDoublePendulum, multiTestDoublePendulum;

testDoublePendulum = require('./doublePendulum.js');

multiTestDoublePendulum = function (net, options) {

    "use strict";

    var promiseChain, makeChainableTest;

    makeChainableTest = function (isUpright, polePushes) {

        return function (prevResults) {

            var nextResultsPromise;

            options.isUpright = isUpright;
            options.polePushes = polePushes;

            nextResultsPromise = testDoublePendulum(net, options);

            return nextResultsPromise.then(function (nextResults) {
                if (options.calculateBehavior) {
                    return {"fitness": prevResults.fitness + nextResults.fitness, "behavior": prevResults.behavior.concat(nextResults.behavior)};
                }
                return {"fitness": prevResults.fitness + nextResults.fitness};
            });
        };
    };

    promiseChain = Promise.resolve({"fitness": 0, "behavior": []});

    promiseChain = promiseChain.then(makeChainableTest(true,  [0, 0]));

    promiseChain = promiseChain.then(makeChainableTest(true,  [0.1, 0]));
    promiseChain = promiseChain.then(makeChainableTest(true,  [0, 0.1]));
    promiseChain = promiseChain.then(makeChainableTest(true,  [-0.1, 0]));
    promiseChain = promiseChain.then(makeChainableTest(true,  [0, -0.1]));

    promiseChain = promiseChain.then(makeChainableTest(true,  [0.3, 0]));
    promiseChain = promiseChain.then(makeChainableTest(true,  [0, 0.3]));
    promiseChain = promiseChain.then(makeChainableTest(true,  [-0.3, 0]));
    promiseChain = promiseChain.then(makeChainableTest(true,  [0, -0.3]));

    return promiseChain;
};

module.exports = multiTestDoublePendulum;

