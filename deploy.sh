#!/bin/sh

# abort on error
set -ex

npm run build
cd dist || exit 1

if [ ! -d .git ]; then
    git init
    git checkout -b main
fi
git add -A
git commit -m"deploy"

git push -f git@github.com:bsh-git/hannou100-openlayers.git main:gh-pages
