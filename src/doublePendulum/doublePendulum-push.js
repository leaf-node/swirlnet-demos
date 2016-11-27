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

    var pushes;

    options.isUpright = true;

    pushes = {

        "0": [[0.1, 0]],

        "6": [[0.1, 0]],
        "7": [[0, 0.1]],
        "8": [[-0.1, 0]],
        "9": [[0, -0.1]],

        "11": [[0.2, 0]],
        "13": [[0, -0.2]],
        "15": [[-0.2, 0]],
        "17": [[0, 0.2]],

        "19": [[-0.3, 0]],
        "21": [[0.3, 0]],
        "23": [[0, -0.3]],
        "25": [[0, 0.3]],

        "27": [[0.1, 0],  [0, 0.2]],
        "29": [[-0.1, 0], [0, 0.2]],
        "31": [[0, -0.1], [0, 0.2]],
        "33": [[0, 0.1],  [0, 0.2]],

        "35": [[-0.15, 0], [0, 0.2]],
        "37": [[0, 0.15],  [0, 0.2]],
        "39": [[0.15, 0],  [0, 0.2]],
        "41": [[0, -0.15], [0, 0.2]],

        "43": [[-0.2, 0], [0, 0.2]],
        "45": [[0, 0.2],  [0, 0.2]],
        "47": [[0.2, 0],  [0, 0.2]],
        "49": [[0, -0.2], [0, 0.2]]
    };

    options.polePushesCallback = function (ticks, ticksPerSecond) {

        var seconds;

        seconds = ticks / ticksPerSecond;

        if (seconds % 1 === 0 && pushes[seconds] !== undefined) {
            return pushes[seconds];
        }

        return [[0, 0]];
    };

    return testDoublePendulum(net, options);
};

module.exports = pushTestDoublePendulum;

