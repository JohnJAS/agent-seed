.PHONY: check release

check:
	node --test tools/release.test.mjs

release: check
	node tools/release.mjs
