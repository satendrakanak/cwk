#!/usr/bin/env sh
set -eu

ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")/.." && pwd)"
TARGET="$ROOT_DIR/kasa"

if [ ! -x "$TARGET" ]; then
  chmod +x "$TARGET"
fi

if [ -w /usr/local/bin ]; then
  ln -sf "$TARGET" /usr/local/bin/kasa
  echo "Registered kasa command at /usr/local/bin/kasa"
  echo "You can now run: kasa install dev"
  exit 0
fi

LOCAL_BIN="$HOME/.local/bin"
mkdir -p "$LOCAL_BIN"
ln -sf "$TARGET" "$LOCAL_BIN/kasa"

echo "Registered kasa command at $LOCAL_BIN/kasa"
case ":$PATH:" in
  *":$LOCAL_BIN:"*)
    echo "You can now run: kasa install dev"
    ;;
  *)
    echo ""
    echo "Add this to your shell profile so the command is available everywhere:"
    echo "  export PATH=\"\$HOME/.local/bin:\$PATH\""
    echo ""
    echo "Then restart the terminal and run:"
    echo "  kasa install dev"
    ;;
esac
