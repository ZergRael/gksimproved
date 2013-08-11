echo "Update data"
cd ..
cp -R images\* ..\ff_gksi\data\images\
cp lib\* ..\ff_gksi\data\lib\
cp module\* ..\ff_gksi\data\module\
cp *.js ..\ff_gksi\data\

exit 1

echo "Update version"
get-content .\manifest.json | foreach-object { if($_ -match '"version": "(\d+\.\d+\.\d+)"') { $vers = $matches[1]; }}
$package_content = get-content ..\ff_gksi\package.json
$package_content | foreach-object { if($_ -match '"version": "(\d+\.\d+\.\d+)"') { $old_vers = $matches[1]; }}
set-content ..\ff_gksi\package.json ($package_content -replace $old_vers, $vers)

echo "Checking main.js update needed"
$chrome = @()
$ff = @()
get-content .\manifest.json | foreach-object { if($_ -match '".*\.js"') { $chrome += @($matches[0]); }}
get-content ..\ff_gksi\lib\main.js | foreach-object { if($_ -match '".*\.js"') { $ff += @($matches[0]); }}
$isDiff = "false"
if($chrome.length -ne $ff.length) {
    $isDiff = "true"
}

if(!$isDiff) {
    for($i = 0; $i -lt $chrome.length; $i++) {
        if($chrome[$i] -ne $ff[$i]) {
            $isDiff = "true"
            break;
        }
    }
}

if($isDiff -eq "true") {
	echo "Main.js update"
    $mainNewContent = "  contentScriptFile: [`n"
    for($i = 0; $i -lt $chrome.length; $i++) {
        $mainNewContent += "    self.data.url("+$chrome[$i]+")"
        if($i -eq ($chrome.length - 1)) {
            $mainNewContent += "`n"
        }
        else {
            $mainNewContent += ",`n"
        }
    }
    $mainNewContent += "  ],"

    $mainOldContent = (get-content ..\ff_gksi\lib\main.js | Out-String)
    $regex = [regex] '(?m)  contentScriptFile: \[[\s\w\.\(\"\-\)_\/,]+\],'
    set-content ..\ff_gksi\lib\main.js ($mainOldContent -replace $regex, $mainNewContent)
}
else {
	echo "Main.js update not needed"
}

echo "Activate Firefox SDK"
cd "..\addon-sdk-1.14\"
$env:Path += ";C:\Python27\"
.\bin\activate.ps1

echo "Build .xpi"
cd ..\ff_gksi
cfx --update-url https://thetabx.net/gksi/update/check/ --update-link https://github.com/ZergRael/gksimproved/raw/master/build/gksimproved.xpi xpi
cp gksimproved.xpi ../gksimproved/build/
echo "Done"

read