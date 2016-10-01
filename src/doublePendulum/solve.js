#! /usr/bin/env node

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


var swirlnetSolverAsync, doublePendulumTesters, solve;

swirlnetSolverAsync = require('swirlnet-solver-async');

doublePendulumTesters = require('./doublePendulum.js');

solve = function () {

    "use strict";

    var inputCount, outputCount, fitnessTarget, noveltySearch,
        maxSimulationDuration, maxGenerations, genomeSettings;

    inputCount = 8;
    outputCount = 1;

    fitnessTarget = 830;
    maxGenerations = 2000;

    maxSimulationDuration = 60;

    noveltySearch = false;

    genomeSettings = {

        "populationSize":               150,

        "disjointCoefficient":          1.0,
        "excessCoefficient":            1.0,
        "weightDifferenceCoefficient":  0.4,
        "compatibilityThreshold":       3.0,

        "allowRecurrent":               true
    };

    return swirlnetSolverAsync(inputCount, outputCount, doublePendulumTesters.getMultiDoublePendulumTester(true, noveltySearch), maxSimulationDuration, genomeSettings, fitnessTarget, maxGenerations, noveltySearch);
};

solve().catch(function (error) {

    "use strict";

    if (error.stack !== undefined) {
        console.log(error.stack);
    } else {
        console.log(error);
    }
    process.exit(1);
});

