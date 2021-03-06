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


var phyzzie, assert, testDoublePole;

phyzzie = require('phyzzie');
assert = require('assert');

// tests a net in double pole experiment
testDoublePole = function (net, options) {

    "use strict";

    var elapsedSimTime, interactionCallback,
        fitnessRecord, forceNormalization,
        things, colors, phyzzieOptions,
        calculateFitness, resultsPromise;

    assert(typeof net === "object" || net === null, "doublePendulum.js: error: network parameter must be an object or null");
    assert(typeof options === "object", "doublePendulum.js: error: options parameter must be an object");

    assert(typeof options.withVelocities === "boolean", "doublePendulum.js: error: withVelocities option must be a boolean");
    assert(typeof options.simulationDuration === "number", "doublePendulum.js: error: simulationDuration option must be a number");
    assert(typeof options.display === "boolean", "doublePendulum.js: error display option must be a boolean");


    things = JSON.stringify(require('./things/things.json'));
    colors = JSON.stringify(require('./things/colors.json'));

    phyzzieOptions = {};
    phyzzieOptions.sim = {};
    phyzzieOptions.sim.interactionsPerSecond   = 60;
    phyzzieOptions.sim.simStepsPerInteraction  = 1;
    phyzzieOptions.sim.iterationsPerSimStep    = 10;
    phyzzieOptions.sim.maxStepMilliseconds     = 100;
    phyzzieOptions.graphics = {};
    phyzzieOptions.graphics.display            = options.display;

    phyzzieOptions.graphics.height             = 350;
    phyzzieOptions.graphics.width              = 300;
    phyzzieOptions.graphics.scale              = 300;
    phyzzieOptions.graphics.lineWidth          = 1;
    phyzzieOptions.graphics.targetDiv          = "drawPole";
    phyzzieOptions.graphics.renderOptions      = {"transparent": true};


    fitnessRecord = [];
    forceNormalization = 0.005;

    elapsedSimTime      = 0;

    interactionCallback = function (things, deltaSimTime, resolve) {

        var p0, a1, a2, v0, v1, v2, inputs, outputs, force,
            fallen_over, centerCloseness, fitnessPoint;

        elapsedSimTime += deltaSimTime;

        p0 = things.base.getPosition();
        a1 = things.pole1.getAngle();
        a2 = things.pole2.getAngle();

        v0 = things.base.getVelocity()[0];
        v1 = things.pole1.getVelocity()[0] - v0;
        v2 = things.pole2.getVelocity()[0] - v0;

        if (a1 > Math.PI) {
            a1 -= 2 * Math.PI;
        }
        if (a2 > Math.PI) {
            a2 -= 2 * Math.PI;
        }


        if (net !== null) {

            if (options.withVelocities) {
                inputs = [p0[0], a1, a2, v0, v1, v2];
            } else {
                inputs = [p0[0], a1, a2];
            }

            net.setInputs(inputs);
            net.step();
            outputs = net.getOutputs();

            force = (outputs[0] - 0.5) * 2 * forceNormalization;

            things.base.push([force, 0]);
        }


        fallen_over = Math.PI * 3 / 4;

        centerCloseness = 1 - Math.abs(p0[0]);
        centerCloseness = (centerCloseness > 0.1) ? centerCloseness : 0.1;

        fitnessPoint  = 1;
        // not fallen off ledge
        fitnessPoint *= (p0[1] > 0) ? 1 : 0;
        // pole not fallen over
        fitnessPoint *= (Math.abs(a1) < fallen_over) ? 1 : 0;
        fitnessPoint *= (Math.abs(a2) < fallen_over) ? 1 : 0;

        // reward for more pole uprightness
        fitnessPoint *= ((fallen_over - Math.abs(a1)) / fallen_over);
        fitnessPoint *= ((fallen_over - Math.abs(a2)) / fallen_over);
        // reward for nearness to center
        fitnessPoint *= centerCloseness;
        // reward for slow motion 
        fitnessPoint *= 1 - ((Math.abs(v0 / 0.3) > 0.9) ? 0.9 : Math.abs(v0 / 0.3));
        // reward for slow accel
        fitnessPoint *= 1 - Math.abs(force / forceNormalization);

        fitnessRecord.push(fitnessPoint);


        // game over
        if (fitnessPoint === 0) {
            resolve({"fitness": calculateFitness(fitnessRecord)});
            return false;
        }
        // long enough
        if (elapsedSimTime > options.simulationDuration) {
            resolve({"fitness": calculateFitness(fitnessRecord)});
            return false;
        }

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

module.exports = testDoublePole;

