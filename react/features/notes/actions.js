// @flow

import { openDialog } from '../base/dialog';

import { CANCEL_NOTES } from './actionTypes';
import { NotesDialog } from './components';

/**
 * Caches the passed in feedback in the redux store.
 *
 * @returns {{
 *     type: CANCEL_FEEDBACK
 * }}
 */
export function cancelNotes() {
    return {
        type: CANCEL_NOTES
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
