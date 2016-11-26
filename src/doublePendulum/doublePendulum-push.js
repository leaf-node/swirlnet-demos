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

var testDoublePendulum, pushTestDoublePendulum;

testDoublePendulum = require('./doublePendulum.js');


pushTestDoublePendulum = function (net, options) {

    "use strict";

    var pushes, cycleTime;

    options.isUpright = true;

    cycleTime = 30;

    pushes = {

        "1": [0.1, 0],
        "2": [0, 0.1],
        "3": [-0.1, 0],
        "4": [0, -0.1],

        "6": [0.3, 0],
        "8": [0, 0.3],
        "10": [-0.3, 0],
        "12": [0, -0.3],

        "14": [-0.3, 0],
        "16": [0.3, 0],
        "18": [-0.3, 0],
        "20": [0, 0.3],

        "22": [0.3, 0],
        "24": [-0.3, 0],
        "26": [0, -0.3],
        "28": [0.3, 0]
    };

    options.polePushesCallback = function (ticks, ticksPerSecond) {

        var seconds;

        seconds = ticks / ticksPerSecond;

        if (seconds % 1 === 0 && pushes[seconds % cycleTime] !== undefined) {
            return pushes[seconds % cycleTime];
        }

        return [0, 0];
    };

    return testDoublePendulum(net, options);
};

module.exports = pushTestDoublePendulum;

