// @flow

import { openDialog } from '../base/dialog';

import { CANCEL_NOTES, COPY_TO_CLIPBOARD_NOTES } from './actionTypes';
import { NotesDialog } from './components';

/**
 * Caches the passed in notes in the redux store.
 *
 * @param {string} message - A description entered by the participant that
 * wrote message to save.
 * @returns {{
 *     type: CANCEL_NOTES,
 *     message: string
 * }}
 */
export function cancelNotes(message: string) {
    return {
        type: CANCEL_NOTES,
        message
    };
}

/**
 * Caches the passed in notes in the redux store.
 *
 * @param {string} message - A description entered by the participant that
 * wrote message to save.
 * @returns {{
 *     type: COPY_TO_CLIPBOARD_NOTES,
 *     message: string
 * }}
 */
export function copyToClipboardNotes(message: string) {
    return {
        type: COPY_TO_CLIPBOARD_NOTES,
        message
    };
}

/**
 * Opens {@code NotesDialog}.
 *
 * @param {Function} [onClose] - An optional callback to invoke when the dialog
 * is closed.
 * @returns {Object}
 */
export function openNotesDialog(onClose: ?Function) {
    return openDialog(NotesDialog, {
        onClose
    });
}
