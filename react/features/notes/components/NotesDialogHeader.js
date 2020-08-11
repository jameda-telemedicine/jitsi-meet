// @flow

import React from 'react';

import { translate } from '../../base/i18n';
import { Icon, IconClose } from '../../base/icons';

type Props = {

    /**
     * The {@link ModalDialog} closing function.
     */
    onClose: Function,

    /**
     * Invoked to obtain translated strings.
     */
    t: Function
};

/**
 * Custom header of the {@code NotesDialog}.
 *
 * @returns {React$Element<any>}
 */
function NotesDialogHeader({ onClose, t }: Props) {
    return (
        <div
            className = 'notes-dialog header'>
            { t('notes.headerTitle') }
            <Icon
                onClick = { onClose }
                src = { IconClose } />
        </div>
    );
}

export default translate(NotesDialogHeader);
