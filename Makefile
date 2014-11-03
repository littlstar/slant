
build: components
	component build

components:
	component install

dist: components
	component build -s Slant
	rm -f slant.{js,css}
	cp build/build.js slant.js
	cp build/build.css slant.css

.PHONY: build
