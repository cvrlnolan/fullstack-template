"""Export the FastAPI OpenAPI schema to the api-client package.

python apps/api/scripts/export_openapi.py          # write
python apps/api/scripts/export_openapi.py --check  # exit 1 if the committed file is stale
"""

import json
import sys
from pathlib import Path

from api.main import app

TARGET = Path(__file__).resolve().parents[3] / "packages/api-client/openapi.json"


def main() -> int:
    rendered = json.dumps(app.openapi(), indent=2, ensure_ascii=False) + "\n"
    if "--check" in sys.argv:
        if not TARGET.exists() or TARGET.read_text() != rendered:
            print("OpenAPI schema is stale. Run `pnpm api:schema` and commit the result.")
            return 1
        return 0
    TARGET.parent.mkdir(parents=True, exist_ok=True)
    TARGET.write_text(rendered)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
