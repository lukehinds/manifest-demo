import os
import requests

print("python ok, requests", requests.__version__)
print("DEMO_GREETING =", os.environ.get("DEMO_GREETING", "<unset>"))
