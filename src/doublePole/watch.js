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


var swirlnet, getDoublePoleTester, demonstrate;

swirlnet = require('swirlnet');
getDoublePoleTester = require('./doublePole.js');

demonstrate = function () {

    "use strict";

    var net, phenotype, duration;

    duration = Infinity;

    phenotype = JSON.stringify(require('./latest-solution.json'));
    net = swirlnet.makeNet(phenotype);

    return getDoublePoleTester(true)(net, duration, true).then(function () {

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

