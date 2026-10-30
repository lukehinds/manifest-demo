import os
from importlib.metadata import version

import requests

print("python ok, requests", requests.__version__, "rich", version("rich"))
print("DEMO_GREETING =", os.environ.get("DEMO_GREETING", "<unset>"))
