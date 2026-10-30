#!/usr/bin/env bash
# Run inside the workspace: every tool below comes from .nono-workspace.json.
set -e
hello
python3 app/check.py
node app/check.mjs

for tool in uv ruff pnpm go rustc cargo gcc make cmake git gh curl wget http \
  openssl sqlite3 psql redis-server rg fd jq yq bat eza fzf tree htop tmux \
  shellcheck shfmt hyperfine tokei just; do
  printf '%-12s %s\n' "$tool" "$(command -v "$tool")"
done

echo 'all tools present' | cowsay
figlet nono | lolcat
