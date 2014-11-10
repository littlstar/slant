
build: components
	component build

components:
	component install

dist: components
	component build -s slant -o dist/ -n slant

clean:
	rm -rf build

.PHONY: build dist
