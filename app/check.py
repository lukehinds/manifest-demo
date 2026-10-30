import os
from importlib.metadata import version

import numpy
import pandas
import requests
import rich

print("python ok, requests", requests.__version__)
print("numpy", numpy.__version__, "pandas", pandas.__version__, "rich", version("rich"))
print("DEMO_GREETING =", os.environ.get("DEMO_GREETING", "<unset>"))
