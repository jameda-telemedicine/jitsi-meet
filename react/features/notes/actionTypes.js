/**
 * The type of the action which signals notes was closed without submitting.
 *
 * {
 *     type: CANCEL_NOTES,
 *     message: string
 * }
 */
export const CANCEL_NOTES = 'CANCEL_NOTES';

/**
 * The type of the action which signals notes has been copied.
 *
 * {
 *     type: COPY_TO_CLIPBOARD_NOTES,
 *     message: string
 * }
 */
export const COPY_TO_CLIPBOARD_NOTES = 'COPY_TO_CLIPBOARD_NOTES';

/**
 * The type of the action which signals notes has been fetched.
 *
 * {
 *     type: FETCH_NOTES
 * }
 */
export const FETCH_NOTES = 'FETCH_NOTES';
