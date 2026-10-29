#!/usr/bin/env bash
# Run inside the workspace: every tool below comes from .nono/workspace.json.
set -e
hello
python3 app/check.py
node app/check.mjs
rg --version | head -1
jq --version
