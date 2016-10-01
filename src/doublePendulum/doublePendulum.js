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
/*jslint unparam: true */

var phyzzie, testDoublePendulum, getDoublePendulumTester,
    getMultiDoublePendulumTester;

phyzzie = require('phyzzie');

// tests a net in double pendulum experiment
testDoublePendulum = function (net, withVelocities, isUpright, polePushes, calculateBehavior, simulationDuration, display) {

    "use strict";

    var ticks, interactionCallback,
        fitnessRecord, behavior,
        forceNormalization, maxTickCount,
        things, colors, options,
        calculateFitness, resultsPromise;


    if (isUpright) {
        things = JSON.stringify(require('./things/thingsUpright.json'));
    } else {
        things = JSON.stringify(require('./things/thingsDownward.json'));
    }

    colors = JSON.stringify(require('./things/colors.json'));

    options = {};
    options.sim = {};
    options.sim.interactionsPerSecond   = 60;
    options.sim.simStepsPerInteraction  = 1;
    options.sim.maxStepMilliseconds     = 100;
    options.graphics = {};
    options.graphics.display            = display;

    //options.graphics.height             = 600;
    //options.graphics.width              = 800;
    //options.graphics.scale              = 300;
    //options.graphics.lineWidth          = 1;
    //options.graphics.targetDiv          = "#draw";
    //options.graphics.renderOptions      = {"transparent": true};


    fitnessRecord = [];
    behavior = [];

    forceNormalization  = 0.01;

    maxTickCount = options.sim.interactionsPerSecond * simulationDuration;

    ticks               = 0;

    interactionCallback = function (things, deltaSimTime, resolve) {

        var p0, a1, a2, v0, av1, av2, inputs, outputs, force,
            sin1, cos1, sin2, cos2, centerCloseness, fitnessPoint, fitness,
            i, remainingBehaviorPoints;

        ticks += 1;

        p0 = things.base.getPosition();
        v0 = things.base.getVelocity()[0];

        a1 = things.pendulum1.getAngle();
        a2 = things.pendulum2.getAngle();

        av1 = things.pendulum1.getAngularVelocity();
        av2 = things.pendulum2.getAngularVelocity();


        sin1 = Math.sin(a1);
        cos1 = Math.cos(a1);

        sin2 = Math.sin(a2);
        cos2 = Math.cos(a2);

        if (ticks === 1) {

            things.pendulum1.push([polePushes[0] * forceNormalization, 0]);
            things.pendulum2.push([polePushes[1] * forceNormalization, 0]);
        }

        if (net !== undefined) {

            if (withVelocities) {
                inputs = [p0[0], sin1, cos1, sin2, cos2, v0, av1, av2];
            } else {
                inputs = [p0[0], sin1, cos1, sin2, cos2];
            }

            net.setInputs(inputs);
            net.step();
            outputs = net.getOutputs();

            force = (outputs[0] - 0.5) * 2 * forceNormalization;

            things.base.push([force, 0]);
        }

        centerCloseness = 1 - Math.abs(p0[0]);
        centerCloseness = (centerCloseness < 0.1) ? 0.1 : centerCloseness;

        fitnessPoint  = 1;
        // not fallen off ledge
        fitnessPoint *= (p0[1] > 0) ? 1 : 0;

        // reward for more pendulum uprightness
        fitnessPoint *= (cos1 + 1.001) / 2.001;
        fitnessPoint *= (cos2 + 1.001) / 2.001;
        // reward for nearness to center
        fitnessPoint *= centerCloseness;
        // reward for slow motion 
        fitnessPoint *= 1 - ((Math.abs(v0 / 0.3) > 0.9) ? 0.9 : Math.abs(v0 / 0.3));
        fitnessPoint *= 1 - ((Math.abs(av1 / 10) > 0.9) ? 0.9 : Math.abs(av1 / 10));
        fitnessPoint *= 1 - ((Math.abs(av2 / 10) > 0.9) ? 0.9 : Math.abs(av2 / 10));
        // reward for slow accel
        fitnessPoint *= 1 - Math.abs(force / (forceNormalization + 0.001));

        fitnessRecord.push(fitnessPoint);

        if (calculateBehavior && ticks % options.sim.interactionsPerSecond === 1) {

            behavior = behavior.concat((cos1 + 1) / 2, (cos2 + 1) / 2);
            behavior = behavior.concat((sin1 + 1) / 2, (sin2 + 1) / 2);
        }

        // it's been long enough
        if (fitnessPoint === 0 || ticks >= maxTickCount) {

            fitness = calculateFitness(fitnessRecord);

            if (calculateBehavior) {

                console.assert(simulationDuration !== Infinity, "doublePendulum: simulation duration must not be infinite when calculating behaviors.");

                // this is hackish
                remainingBehaviorPoints = Math.floor(simulationDuration - ticks / options.sim.interactionsPerSecond);

                // hackish too
                for (i = 0; i < remainingBehaviorPoints; i += 1) {

                    behavior = behavior.concat([0, 0]);
                }

                resolve({"fitness": fitness, "behavior": behavior});

            } else {

                resolve({"fitness": fitness});
            }

            return false;
        }

        return true;
    };

    calculateFitness = function (fitnessRecord) {

        var fitness;
        fitness = fitnessRecord.reduce(function (a, b) { return a + b; }) / options.sim.interactionsPerSecond;
        return fitness;
    };


    if (net !== undefined) {
        net.flush();
    }

    // asynchronous
    // calls interactionCallback
    resultsPromise = phyzzie(things, colors, interactionCallback, options);

    return resultsPromise;
};

getDoublePendulumTester = function (withVelocities, isUpright, polePushes, calculateBehavior) {

    "use strict";

    return function (net, simulationDuration, display) {
        return testDoublePendulum(net, withVelocities, isUpright, polePushes, calculateBehavior, simulationDuration, display);
    };
};

getMultiDoublePendulumTester = function (withVelocities, calculateBehavior) {

    "use strict";

    return function (net, simulationDuration, display) {

        var promiseChain, makeChainableTest;

        makeChainableTest = function (isUpright, polePushes) {

            return function (prevResults) {
                var nextResultsPromise;

                nextResultsPromise = testDoublePendulum(net, withVelocities, isUpright, polePushes, calculateBehavior, simulationDuration, display);

                return nextResultsPromise.then(function (nextResults) {
                    if (calculateBehavior) {
                        return {"fitness": prevResults.fitness + nextResults.fitness, "behavior": prevResults.behavior.concat(nextResults.behavior)};
                    }
                    return {"fitness": prevResults.fitness + nextResults.fitness};
                });
            };
        };

        promiseChain = Promise.resolve({"fitness": 0, "behavior": []});

        promiseChain = promiseChain.then(makeChainableTest(false, [0, 0]));
        promiseChain = promiseChain.then(makeChainableTest(true,  [0, 0]));

        promiseChain = promiseChain.then(makeChainableTest(true,  [0.1, 0]));
        promiseChain = promiseChain.then(makeChainableTest(true,  [0, 0.1]));
        promiseChain = promiseChain.then(makeChainableTest(true,  [-0.1, 0]));
        promiseChain = promiseChain.then(makeChainableTest(true,  [0, -0.1]));

        promiseChain = promiseChain.then(makeChainableTest(true,  [0.3, 0]));
        promiseChain = promiseChain.then(makeChainableTest(true,  [0, 0.3]));
        promiseChain = promiseChain.then(makeChainableTest(true,  [-0.3, 0]));
        promiseChain = promiseChain.then(makeChainableTest(true,  [0, -0.3]));

        promiseChain = promiseChain.then(makeChainableTest(true,  [1, 0]));
        promiseChain = promiseChain.then(makeChainableTest(true,  [0, 1]));
        promiseChain = promiseChain.then(makeChainableTest(true,  [-1, 0]));
        promiseChain = promiseChain.then(makeChainableTest(true,  [0, -1]));

        return promiseChain;
    };
};

module.exports.getDoublePendulumTester = getDoublePendulumTester;
module.exports.getMultiDoublePendulumTester = getMultiDoublePendulumTester;

