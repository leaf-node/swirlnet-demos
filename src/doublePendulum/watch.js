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


var swirlnet, testDoublePendulum, demonstrate;

swirlnet = require('swirlnet');
testDoublePendulum = require('./doublePendulum.js');

demonstrate = function () {

    "use strict";

    var options, net, phenotype;

    options = {};
    options.withVelocities = true;
    options.isUpright = true;
    options.polePushes = [0, 0.3];
    options.calculateBehavior = false;
    options.simulationDuration = Infinity;
    options.display = true;

    phenotype = JSON.stringify(require('./latest-solution.json'));
    net = swirlnet.makeNet(phenotype);

    return testDoublePendulum(net, options).then(function () {

        return demonstrate();
    });
};

demonstrate().catch(function (error) {

    "use strict";

    if (error.stack !== undefined) {
        console.log(error.stack);
    } else {
        console.log(error);
    }
});

