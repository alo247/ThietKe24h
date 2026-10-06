import sys
import os
from pathlib import Path

# Thêm thư mục gốc vào PYTHONPATH để import server.py
CURRENT_DIR = Path(__file__).resolve().parent
ROOT_DIR = CURRENT_DIR.parent
if str(ROOT_DIR) not in sys.path:
    sys.path.insert(0, str(ROOT_DIR))

# Import FastAPI instance từ server.py
from server import app
