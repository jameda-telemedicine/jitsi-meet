// @flow

import Button, { ButtonGroup } from '@atlaskit/button';
import { FieldTextAreaStateless } from '@atlaskit/field-text-area';
import _ from 'lodash';
import React, { Component } from 'react';
import type { Dispatch } from 'redux';

import { Dialog } from '../../base/dialog';
import { translate } from '../../base/i18n';
import { connect } from '../../base/redux';
import { copyText } from '../../base/util';
import { downloadBlob } from '../../local-recording/recording';
import { cancelNotes, copyToClipboardNotes } from '../actions';

import NotesDialogHeader from './NotesDialogHeader';

const COPY_TO_CLIPBOARD_BUTTON_ID = 'notes-copy-to-clipboard-button';
const DOWNLOAD_FILE_BUTTON_ID = 'notes-download-file-button';

/**
 * The type of the React {@code Component} props of {@link NotesDialog}.
 */
type Props = {

    /**
     * The cached notes message, if any, that was set when closing a previous
     * instance of {@code NotesDialog}.
     */
    _message: string,

    /**
     * Invoked to signal notes copying or canceling.
     */
    dispatch: Dispatch<any>,

    /**
     * Callback invoked when {@code NotesDialog} is unmounted.
     */
    onClose: Function,

    /**
     * Invoked to obtain translated strings.
     */
    t: Function
};

/**
 * The type of the React {@code Component} state of {@link NotesDialog}.
 */
type State = {

    /**
     * The currently entered notes message.
     */
    message: string
};

/**
 * A React {@code Component} for displaying a dialog to write a notes describing the experience,
 * and fetch the notes as a file.
 *
 * @extends Component
 */
class NotesDialog extends Component<Props, State> {

    /**
     * Initializes a new {@code NotesDialog} instance.
     *
     * @param {Object} props - The read-only React {@code Component} props with
     * which the new instance is to be initialized.
     */
    constructor(props: Props) {
        super(props);

        const { _message } = this.props;

        this.state = {
            /**
             * The currently entered notes message.
             *
             * @type {string}
             */
            message: _message
        };


        // Bind event handlers so they are only bound once for every instance.
        this._onCancel = this._onCancel.bind(this);
        this._onCopyToClipboard = this._onCopyToClipboard.bind(this);
        this._onDownloadFile = this._onDownloadFile.bind(this);
        this._onMessageChange = this._onMessageChange.bind(this);
    }

    /**
     * Invokes the onClose callback, if defined, to notify of the close event.
     *
     * @inheritdoc
     */
    componentWillUnmount() {
        if (this.props.onClose) {
            this.props.onClose();
        }
    }

    /**
     * Renders the copy to clipboard button.
     *
     * @inheritdoc
     */
    _renderCopyToClipboardButton() {

        const {
            t /* The following fixes a flow error: */ = _.identity
        } = this.props;

        return (
            <Button
                appearance = 'primary'
                id = { COPY_TO_CLIPBOARD_BUTTON_ID }
                key = 'notes-copy-btn'
                onClick = { this._onCopyToClipboard }
                type = 'button'>
                { t('notes.copyToClipboardButton') }
            </Button>
        );
    }

    /**
     * Renders the download file button.
     *
     * @inheritdoc
     */
    _renderDownloadFileButton() {

        const {
            t /* The following fixes a flow error: */ = _.identity
        } = this.props;

        return (
            <Button
                appearance = 'primary'
                id = { DOWNLOAD_FILE_BUTTON_ID }
                key = 'notes-download-file-btn'
                onClick = { this._onDownloadFile }
                type = 'button'>
                { t('notes.downloadButton') }
            </Button>
        );
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const { message } = this.state;
        const { t } = this.props;
        const buttons = [
            this._renderCopyToClipboardButton(),
            this._renderDownloadFileButton()
        ];

        return (
            <Dialog
                customHeader = { NotesDialogHeader }
                hideCancelButton = { true }
                onCancel = { this._onCancel }
                submitDisabled = { true }
                titleKey = 'notes.textArea'>
                <div className = 'notes-dialog'>
                    <p className = 'description'>
                        { t('notes.description') }
                    </p>
                    <div className = 'details'>
                        <FieldTextAreaStateless
                            autoFocus = { true }
                            className = 'input-control'
                            id = 'notesTextArea'
                            onChange = { this._onMessageChange }
                            placeholder = { t('notes.textAreaPlaceholder') }
                            shouldFitContainer = { true }
                            value = { message } />
                    </div>
                    <ButtonGroup>
                        { buttons }
                    </ButtonGroup>
                </div>
            </Dialog>
        );
    }

    _onCancel: () => boolean;

    /**
     * Dispatches an action notifying notes was closed.
     *
     * @private
     * @returns {boolean} Returns true to close the dialog.
     */
    _onCancel() {
        const { message } = this.state;

        this.props.dispatch(cancelNotes(message));

        return true;
    }

    _onCopyToClipboard: () => void;

    /**
     * Copies the entered notes message to the clipboard.
     *
     * @returns {void}
     */
    _onCopyToClipboard() {
        const { message } = this.state;

        copyText(message);
        this.props.dispatch(copyToClipboardNotes(message));
    }

    _onDownloadFile: () => void;

    /**
     * Download file with the entered notes message.
     *
     * @returns {void}
     */
    _onDownloadFile() {
        const { message } = this.state;
        const blob = new Blob([ message ], { type: 'text/plain;charset=utf-8' });
        const {
            t /* The following fixes a flow error: */ = _.identity
        } = this.props;

        downloadBlob(blob, `${t('notes.downloadFilename')}.txt`);
    }

    _onMessageChange: (Object) => void;

    /**
     * Updates the known entered notes message.
     *
     * @param {Object} event - The DOM event from updating the textfield for the
     * notes message.
     * @private
     * @returns {void}
     */
    _onMessageChange(event) {
        this.setState({ message: event.target.value });
    }
}

/**
 * Maps (parts of) the Redux state to the associated {@code NotesDialog}'s
 * props.
 *
 * @param {Object} state - The Redux state.
 * @private
 * @returns {{
 * }}
 */
function _mapStateToProps(state) {
    const { message } = state['features/notes'];

    return {
        /**
         * The cached notes message, if any, that was set when closing a
         * previous instance of {@code NotesDialog}.
         *
         * @type {string}
         */
        _message: message
    };
}

export default translate(connect(_mapStateToProps)(NotesDialog));
