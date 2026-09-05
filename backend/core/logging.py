import json
import logging
import sys
from typing import Any

from backend.core.config import settings

_configured = False


def setup_logging(level: str | None = None) -> logging.Logger:
    global _configured
    log = logging.getLogger('islamic_researcher')
    if not _configured:
        handler = logging.StreamHandler(sys.stdout)
        handler.setFormatter(logging.Formatter('%(asctime)s %(levelname)s %(name)s %(message)s'))
        log.addHandler(handler)
        log.propagate = False
        _configured = True
    log.setLevel(getattr(logging, (level or settings.log_level), logging.INFO))
    return log


def get_logger(name: str = 'islamic_researcher') -> logging.Logger:
    if not _configured:
        setup_logging()
    return logging.getLogger(name)


def log_event(event: str, **fields: Any) -> None:
    payload = {'event': event, **fields}
    get_logger().info(json.dumps(payload, default=str, ensure_ascii=False))
