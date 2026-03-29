import logging
import threading
import uuid

local = threading.local()
logger = logging.getLogger(__name__)


class RequestIDMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request_id = request.headers.get("X-Request-ID", str(uuid.uuid4()))
        request.request_id = request_id
        local.request_id = request_id

        response = self.get_response(request)

        response["X-Request-ID"] = request_id
        return response


class GlobalExceptionMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        return self.get_response(request)

    def process_exception(self, request, exception):
        request_id = getattr(request, "request_id", "unknown")
        logger.error(f"Unhandled Exception [RequestID: {request_id}]: {exception}", exc_info=True)
        return None


class RequestIdFilter(logging.Filter):
    def filter(self, record):
        record.request_id = getattr(local, "request_id", "unknown")
        return True
