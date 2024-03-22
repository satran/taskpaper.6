.PHONY: build help

help:
	echo "make build"
	echo "make run"

install:
	npm i codemirror @codemirror/legacy-modes @codemirror/language @codemirror/autocomplete @codemirror/commands @codemirror/search @codemirror/view @codemirror/state
	npm i rollup @rollup/plugin-node-resolve

build:
	node_modules/.bin/rollup -c rollup.config.mjs

run: build
	python3 -m 'http.server'
