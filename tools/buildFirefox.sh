#!/bin/bash
echo "Update data"
cd ..
cp -R images/* ../ff_gksi/data/images/
cp lib/* ../ff_gksi/data/lib/
cp module/* ../ff_gksi/data/module/
cp *.js ../ff_gksi/data/

echo "Update version"
vers="`sed -n 's/.*"version": *"\([^"]*\)".*/\1/p' ./manifest.json`"
sed -i 's/"version": *"[^"]*"/"version": "'"${vers}"'"/g' ../ff_gksi/package.json

echo "Updating main.js"
new="`sed -n  's/.*\("[^"]*\.js"\).*/    self.data.url(\1),/p' manifest.json | head -c -2`"
cat ../ff_gksi/lib/main.js | grep -v '^ *self.data.url' | awk '{if ($0 ~ /contentScriptFile/) {print $0;print new;} else print $0}' new="$new" > ../ff_gksi/lib/main.js.new
mv ../ff_gksi/lib/main.js.new ../ff_gksi/lib/main.js

echo "Activate Firefox SDK"
cd "../addon-sdk-1.14/"
source bin/activate

echo "Build .xpi"
cd ../ff_gksi
cfx --update-url https://thetabx.net/gksi/update/check/ --update-link https://github.com/ZergRael/gksimproved/raw/master/build/gksimproved.xpi xpi
cp gksimproved.xpi ../gksimproved/build/
echo "Done"

read
