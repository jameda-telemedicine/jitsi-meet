// @flow

import { FieldTextAreaStateless } from '@atlaskit/field-text-area';
import React, { Component } from 'react';
import type { Dispatch } from 'redux';

import { Dialog } from '../../base/dialog';
import { translate } from '../../base/i18n';
import { connect } from '../../base/redux';
import { cancelNotes } from '../actions';

declare var APP: Object;

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
     * Invoked to signal notes submission or canceling.
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
    message: string,
};

/**
 * A React {@code Component} for displaying a dialog to rate the current
 * conference quality, write a message describing the experience, and submit
 * the notes.
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
        this._onMessageChange = this._onMessageChange.bind(this);
    }

    /**
     * Emits an analytics event to notify notes has been opened.
     *
     * @inheritdoc
     */
    componentDidMount() {
        if (typeof APP !== 'undefined') {
            // APP.API.notifyFeedbackPromptDisplayed();
        }
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
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const { message } = this.state;
        const { t } = this.props;

        return (
            <Dialog
                okKey = 'dialog.Submit'
                onCancel = { this._onCancel }
                onSubmit = { this._onSubmit }
                titleKey = 'notes.textArea'>
                <div className = 'notes-dialog'>
                    <div className = 'details'>
                        <FieldTextAreaStateless
                            autoFocus = { true }
                            className = 'input-control'
                            id = 'notesTextArea'
                            label = { t('notes.detailsLabel') }
                            onChange = { this._onMessageChange }
                            shouldFitContainer = { true }
                            value = { message } />
                    </div>
                </div>
            </Dialog>
        );
    }

    _onCancel: () => boolean;

    /**
     * Dispatches an action notifying notes was not submitted. The submitted
     * score will have one added as the rest of the app does not expect 0
     * indexing.
     *
     * @private
     * @returns {boolean} Returns true to close the dialog.
     */
    _onCancel() {
        const { message } = this.state;

        this.props.dispatch(cancelNotes(message));

        return true;
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

    _onSubmit: () => void;

    /**
     * Dispatches the entered notes for submission. The submitted score will
     * have one added as the rest of the app does not expect 0 indexing.
     *
     * @private
     * @returns {boolean} Returns true to close the dialog.
     */
    _onSubmit() {
        // const { conference, dispatch } = this.props;
        // const { message } = this.state;


        // dispatch(submitNotes(message, conference));

        return true;
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
