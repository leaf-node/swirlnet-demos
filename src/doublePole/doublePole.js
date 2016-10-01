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


var phyzzie, testDoublePole, getDoublePoleTester;

phyzzie = require('phyzzie');

// tests a net in double pole experiment
testDoublePole = function (net, withVelocities, simulationDuration, display) {

    "use strict";

    var elapsedSimTime, interactionCallback,
        fitnessRecord, forceNormalization,
        things, colors, options,
        calculateFitness, resultsPromise;


    things = JSON.stringify(require('./things/things.json'));
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
    forceNormalization = 0.05;

    elapsedSimTime      = 0;

    interactionCallback = function (things, deltaSimTime, resolve) {

        var p0, a1, a2, v0, v1, v2, inputs, outputs, force,
            sideways, centerCloseness, fitnessPoint;

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


        if (net !== undefined) {

            if (withVelocities) {
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


        sideways = Math.PI / 2;

        centerCloseness = 1 - Math.abs(p0[0]);
        centerCloseness = (centerCloseness > 0.1) ? centerCloseness : 0.1;

        fitnessPoint  = 1;
        // not fallen off ledge
        fitnessPoint *= (p0[1] > 0) ? 1 : 0;
        // pole not fallen over
        fitnessPoint *= (Math.abs(a1) < sideways) ? 1 : 0;
        fitnessPoint *= (Math.abs(a2) < sideways) ? 1 : 0;

        // reward for more pole uprightness
        fitnessPoint *= ((sideways - Math.abs(a1)) / sideways);
        fitnessPoint *= ((sideways - Math.abs(a2)) / sideways);
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
        if (elapsedSimTime > simulationDuration) {
            resolve({"fitness": calculateFitness(fitnessRecord)});
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

getDoublePoleTester = function (withVelocities) {

    "use strict";

    return function (net, simulationDuration, display) {
        return testDoublePole(net, withVelocities, simulationDuration, display);
    };
};

module.exports = getDoublePoleTester;

