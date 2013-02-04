echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
echo "Are you sure main.js has been updated ?"
echo "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
read-host
echo "Update data"
cp *.js ..\ff_gksi\data
cp images\*.* ..\ff_gksi\data\images
echo "Update version"
get-content .\manifest.json | foreach-object { if($_ -match '"version": "(\d+\.\d+\.\d+)"') { $vers = $matches[1]; }}
$package_content = get-content ..\ff_gksi\package.json
$package_content | foreach-object { if($_ -match '"version": "(\d+\.\d+\.\d+)"') { $old_vers = $matches[1]; }}
set-content ..\ff_gksi\package.json ($package_content -replace $old_vers, $vers)
echo "Activate Firefox SDK"
cd "..\addon-sdk-1.13.1\"
$env:Path += ";C:\Python27\"
.\bin\activate.ps1
echo "Build .xpi"
cd ..\ff_gksi
cfx xpi
echo "Done"




