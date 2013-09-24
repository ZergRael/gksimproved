import subprocess
import os

def run():
	os.chdir("..")
	subprocess.call(["7z", "a", "-tzip", os.path.join("build", "gksimproved.zip"), "images", "lib", "module", "*.js", "*.json"])
	os.chdir("tools")