import { QUIT_KEY } from "./quit-key.constant.ts";

const WATCH_REFRESH_SECONDS = 60;

export const WATCH_REFRESH_MILLISECONDS = WATCH_REFRESH_SECONDS * 1000;

export const WATCH_FOOTER_TEXT = `refreshes every ${WATCH_REFRESH_SECONDS}s, ${QUIT_KEY} to quit`;

export const WATCH_FAILED_FOOTER_TEXT = `last refresh failed, retrying in ${WATCH_REFRESH_SECONDS}s, ${QUIT_KEY} to quit`;
