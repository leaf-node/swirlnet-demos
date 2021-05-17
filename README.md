# swirlnet-demos

This repository contains two javascript-based neuroevolution demos using the
swirlnet library, which is based on NEAT. They attempt to solve two 2D physical
balancing tasks. With a few commands, winning network behavior can be
graphically demonstrated in the browser.

## Build Requirements

Install runtime dependencies:

    $ npm install

Install web demo build dependencies:

    # npm install -g browserify

## Use

### Sample web demos

To watch the pre-generated networks' performance in the browser:

    $ cd src/doublePendulum
    $ make

Then open up `file:///.../src/doublePendulum/index.html` in a browser window.

    $ cd src/doublePole
    $ make

Then open up `file:///.../src/doublePole/index.html` in a browser window.

### Solution finding

To search for new solutions:

    $ node demos/doublePole/solve.js
    $ node demos/doublePendulum/solve.js

To watch a network you have found:

    $ cd demos/doublePole
    $ mkdir solutions
    $ edit solutions/net-0.json  # paste in the json from the above solver's output
    $ ln -sf solutions/net-0.json latest-solution.json
    $ make

Then open up `file:///.../demos/doublePole/index.html` in a browser window.


## etc

Of the two demos, the double pole experiment solves faster. Its code is also
easier to comprehend.

The double pendulum experiement may find the partial solution of balancing
already upright pendulums, but it is unlikely to swing up both pendulums and
balance them. To fully solve that problem, the fitness function and testing
scenarios need to be adjusted.

As networks become fitter on average they will tend to survive longer in
challenges. This is why later generations take longer to test.


## License

This software is licensed under the Apache License, Version 2.0

The authors of swirlnet claim no license over the networks, genomes and
phenotypes evolved using this library.

