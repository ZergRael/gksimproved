import os
import sys
import glob
import distutils.dir_util
import distutils.file_util
import json

sdkDir = "addon-sdk-1.14"
firefoxDir = "ff_gksi"
chromeDir = "gksimproved"

def run():
	print("Update data")
	os.chdir("..")

	copyDirs = ["images", "lib", "module"]
	for cDir in copyDirs :
		distutils.dir_util.copy_tree(cDir, os.path.join("..", firefoxDir, "data", cDir))
	copyFiles = ["*.js"]
	for cFile in copyFiles :
		for fileName in glob.iglob(cFile) :
			distutils.file_util.copy_file(fileName, os.path.join("..", firefoxDir, "data"))

	print("Update version")
	with open(os.path.join("manifest.json"), 'r') as content_file:
		manifest = json.load(content_file)
	with open(os.path.join("..", firefoxDir, "package.json"), 'r') as content_file:
		package = json.load(content_file)
	package["version"] = manifest["version"]
	with open(os.path.join("..", firefoxDir, "package.json"), 'w') as content_file:
		json.dump(package, content_file, indent=2)

	print("Update main.js")
	mainPrefix = '// Import the page-mod API\nvar pageMod = require("page-mod");\n// Import the self API\nvar self = require("self");\n\npageMod.PageMod({\n  include: ["*.gks.gs", "*.s.gks.gs"],\n  contentScriptFile: ['
	mainMid = "\n  ],\n  contentScriptOptions: {"
	mainSuffix = "\n  }\n});"

	main = mainPrefix
	for js in manifest["content_scripts"][0]["js"] :
		main += "\n    self.data.url(\"%s\")," % js
	main = main.rstrip(",") + mainMid
	for res in manifest["web_accessible_resources"] :
		main += "\n    \"%s\": self.data.url(\"%s\")," % (res, res)
	main = main.rstrip(",") + mainSuffix

	with open(os.path.join("..", firefoxDir, "lib", "main.js"), 'w') as content_file:
		content_file.write(main)

	print("Firefox SDK")
	os.chdir(os.path.join("..", sdkDir))
	sdkRoot = os.getcwd()
	sys.path.append(os.path.join(sdkRoot, "python-lib"))
	os.environ["CUDDLEFISH_ROOT"] = sdkRoot

	from jetpack_sdk_env import welcome
	welcome()

	print("Export .xpi")
	import cuddlefish

	os.chdir(os.path.join("..", firefoxDir))
	try :
		cuddlefish.run(["--update-url", "https://thetabx.net/gksi/update/check/%APP_OS%/%CURRENT_APP_VERSION%/%ITEM_VERSION%/", "xpi"])
	except SystemExit:
		print("Copy .xpi")
		distutils.file_util.copy_file("gksimproved.xpi", os.path.join("..", chromeDir, "build"))

	os.chdir(os.path.join("..", chromeDir, "tools"))
	print("Done")