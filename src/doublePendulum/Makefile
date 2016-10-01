
.PHONY: clean watch solve watchDoNothing

watch: Makefile watch.js doublePendulum.js latest-solution.json things
	browserify watch.js -o dp-browser.js

solve: Makefile solve.js doublePendulum.js latest-solution.json things
	browserify solve.js -o dp-browser.js

watchDoNothing: Makefile watchDoNothing.js doublePendulum.js latest-solution.json things
	browserify watchDoNothing.js -o dp-browser.js

latest-solution.json:
	ln -sf example-partial-solution-0.json latest-solution.json


clean:
	rm -f dp-browser.js

