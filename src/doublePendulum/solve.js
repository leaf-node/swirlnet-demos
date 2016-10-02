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


var swirlnetSolverAsync, multiTestDoublePendulum, solve;

swirlnetSolverAsync = require('swirlnet-solver-async');
multiTestDoublePendulum = require('./doublePendulum-multi.js');

solve = function () {

    "use strict";

    var netSolveOptions, genomeSettings, doNoveltySearch;

    genomeSettings = {

        "populationSize":               150,

        "disjointCoefficient":          1.0,
        "excessCoefficient":            1.0,
        "weightDifferenceCoefficient":  0.4,
        "compatibilityThreshold":       3.0,

        "allowRecurrent":               true
    };

    doNoveltySearch = false;

    netSolveOptions = {};
    netSolveOptions.inputCount = 8;
    netSolveOptions.outputCount = 1;
    netSolveOptions.useWorkers = false;
    netSolveOptions.testFunction = multiTestDoublePendulum;
    netSolveOptions.fitnessTarget = 830;
    netSolveOptions.maxGenerations = 2000;
    netSolveOptions.doNoveltySearch = doNoveltySearch;

    netSolveOptions.genomeSettings = genomeSettings;

    netSolveOptions.testFunctionOptions = {};
    netSolveOptions.testFunctionOptions.withVelocities = true;
    netSolveOptions.testFunctionOptions.calculateBehavior = doNoveltySearch;
    netSolveOptions.testFunctionOptions.simulationDuration = 60;
    netSolveOptions.testFunctionOptions.display = false;


    return swirlnetSolverAsync(netSolveOptions);
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

