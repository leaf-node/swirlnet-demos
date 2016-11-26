
.PHONY: clean watch solve watchDoNothing

interact: Makefile interact.js doublePendulum.js latest-solution.json things
	browserify interact.js -o dp-browser.js

watch: Makefile watch.js doublePendulum.js latest-solution.json things
	browserify watch.js -o dp-browser-alt.js

solve: Makefile solve.js doublePendulum.js latest-solution.json things
	browserify solve.js -o dp-browser-alt.js

watchDoNothing: Makefile watchDoNothing.js doublePendulum.js latest-solution.json things
	browserify watchDoNothing.js -o dp-browser-alt.js

latest-solution.json:
	ln -sf example-partial-solution-0.json latest-solution.json


clean:
	rm -f dp-browser.js dp-browser-alt.js

