import os
import buildFirefox
import buildChrome

os.chdir(os.path.dirname(os.path.abspath(__file__)))
buildFirefox.run()
buildChrome.run()