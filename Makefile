.PHONY: update

extension.zip:	extension/e.js extension/manifest.json
	rm -f $@
	7z -mx=9 a $@ extension

extension/e.js: script.js
	closure-compiler --compilation_level ADVANCED_OPTIMIZATIONS --js script.js > $@

extension/manifest.json:	manifest.json
	cat manifest.json | tr '\n' ' ' |sed -r 's/([\{\},:\["]|\])\s+/\1/g' > $@

clean:
	rm -f extension{.zip,/{e.js,manifest.json}}
