export const PRIVATE_DIRECTORY_MODE = 0o700;

export const PRIVATE_FILE_MODE = 0o600;

export const NAME_LOCK_DIRECTORY = "names.lock";

export const NAME_LOCK_TIMEOUT_MS = 5000;

export const NAME_LOCK_RETRY_MS = 10;

export const INVALID_SESSION_IDENTITY_MESSAGE = "Invalid session identity";

export const LIVE_SESSION_FILE_PATTERN = /^[a-f0-9-]{36}\.json$/;

export const RESERVATION_FILE_PATTERN = /^[a-f0-9-]{36}\.reservation$/;

export const PROJECT_MARKER_FILE_PATTERN = /^[a-f0-9]{64}\.project$/;

export const PROJECT_FALLBACK_PREFIX = "project-";

export const MISSING_FILE_CODE = "ENOENT";

export const EXISTING_FILE_CODE = "EEXIST";

export const LIVE_SESSION_SUFFIX = ".json";

export const RESERVATION_SUFFIX = ".reservation";

export const HISTORY_SUFFIX = ".history";

export const PROJECT_MARKER_SUFFIX = ".project";

export const TEMPORARY_FILE_SUFFIX = ".tmp";

export const NO_SUCH_PROCESS_CODE = "ESRCH";
