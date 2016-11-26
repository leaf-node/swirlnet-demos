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


/*jslint unparam: true */

var phyzzie, assert, testDoublePendulum, multiTestDoublePendulum;

phyzzie = require('phyzzie');
assert = require('assert');

// tests a net in double pendulum experiment
testDoublePendulum = function (net, options) {

    "use strict";

    var ticks, interactionCallback,
        fitnessRecord, behavior,
        forceNormalization, maxTickCount,
        things, colors, phyzzieOptions,
        calculateFitness, resultsPromise;

    assert(typeof net === "object" || net === null, "doublePendulum.js: error: network parameter must be an object or null");
    assert(typeof options === "object", "doublePendulum.js: error: options parameter must be an object");

    assert(typeof options.withVelocities === "boolean", "doublePendulum.js: error: withVelocities option must be a boolean");
    assert(typeof options.isUpright === "boolean", "doublePendulum.js: error: isUpright option must be a boolean");
    assert(typeof options.calculateBehavior === "boolean", "doublePendulum.js: error: calculateBehavior option must be a boolean");
    assert(typeof options.simulationDuration === "number", "doublePendulum.js: error: simulationDuration option must be a number");
    assert(typeof options.display === "boolean", "doublePendulum.js: error: display option must be a boolean");
    assert(typeof options.polePushesCallback === "function" || options.polePushesCallback === undefined,
            "doublePendulum.js: error: polePushesCallback option must be a function or undefined.");

    if (options.isUpright) {
        things = JSON.stringify(require('./things/thingsUpright.json'));
    } else {
        things = JSON.stringify(require('./things/thingsDownward.json'));
    }

    colors = JSON.stringify(require('./things/colors.json'));

    phyzzieOptions = {};
    phyzzieOptions.sim = {};
    phyzzieOptions.sim.interactionsPerSecond   = 60;
    phyzzieOptions.sim.simStepsPerInteraction  = 1;
    phyzzieOptions.sim.iterationsPerSimStep    = 10;
    phyzzieOptions.sim.maxStepMilliseconds     = 100;
    phyzzieOptions.graphics = {};
    phyzzieOptions.graphics.display            = options.display;

    //phyzzieOptions.graphics.height             = 600;
    //phyzzieOptions.graphics.width              = 800;
    //phyzzieOptions.graphics.scale              = 300;
    //phyzzieOptions.graphics.lineWidth          = 1;
    //phyzzieOptions.graphics.targetDiv          = "draw";
    //phyzzieOptions.graphics.renderOptions      = {"transparent": true};


    fitnessRecord = [];
    behavior = [];

    forceNormalization  = 0.01;

    maxTickCount = phyzzieOptions.sim.interactionsPerSecond * options.simulationDuration;

    ticks               = 0;

    interactionCallback = function (things, deltaSimTime, resolve) {

        var p0, a1, a2, v0, av1, av2, inputs, outputs, force,
            sin1, cos1, sin2, cos2, centerCloseness, fitnessPoint, fitness,
            i, remainingBehaviorPoints, polePushes;

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

        if (options.polePushesCallback !== undefined) {

            polePushes = options.polePushesCallback(ticks, phyzzieOptions.sim.interactionsPerSecond);

            things.pendulum1.push([polePushes[0] * forceNormalization, 0]);
            things.pendulum2.push([polePushes[1] * forceNormalization, 0]);
        }

        if (net !== null) {

            if (options.withVelocities) {
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
        fitnessPoint *= Math.pow((cos1 + 1.001) / 2.001, 2);
        fitnessPoint *= Math.pow((cos2 + 1.001) / 2.001, 2);
        // reward for nearness to center
        fitnessPoint *= centerCloseness;
        // reward for slow motion 
        fitnessPoint *= Math.pow(1 - ((Math.abs(v0 / 0.3) > 0.9) ? 0.9 : Math.abs(v0 / 0.3)), 2);
        fitnessPoint *= Math.pow(1 - ((Math.abs(av1 / 10) > 0.9) ? 0.9 : Math.abs(av1 / 10)), 2);
        fitnessPoint *= Math.pow(1 - ((Math.abs(av2 / 10) > 0.9) ? 0.9 : Math.abs(av2 / 10)), 2);
        // reward for slow accel
        fitnessPoint *= 1 - Math.abs(force / (forceNormalization + 0.001));

        fitnessRecord.push(fitnessPoint);

        if (options.calculateBehavior && ticks % phyzzieOptions.sim.interactionsPerSecond === 0) {

            behavior = behavior.concat((cos1 + 1) / 2, (cos2 + 1) / 2);
            behavior = behavior.concat((sin1 + 1) / 2, (sin2 + 1) / 2);
        }

        // it's been long enough
        if (fitnessPoint === 0 || ticks >= maxTickCount) {

            fitness = calculateFitness(fitnessRecord);

            if (options.calculateBehavior) {

                assert(options.simulationDuration !== Infinity, "doublePendulum: simulation duration must not be infinite when calculating behaviors.");

                remainingBehaviorPoints = Math.floor(options.simulationDuration) - Math.floor(ticks / phyzzieOptions.sim.interactionsPerSecond);

                for (i = 0; i < remainingBehaviorPoints; i += 1) {

                    behavior = behavior.concat([0, 0, 0, 0]);
                }

                resolve({"fitness": fitness, "behavior": behavior});

            } else {

                resolve({"fitness": fitness});
            }

            return false;
        }

        ticks += 1;

        return true;
    };

    calculateFitness = function (fitnessRecord) {

        var fitness;
        fitness = fitnessRecord.reduce(function (a, b) { return a + b; }) / phyzzieOptions.sim.interactionsPerSecond;
        return fitness;
    };


    if (net !== null) {
        net.flush();
    }

    // asynchronous
    // calls interactionCallback
    resultsPromise = phyzzie(things, colors, interactionCallback, phyzzieOptions);

    return resultsPromise;
};

module.exports = testDoublePendulum;

