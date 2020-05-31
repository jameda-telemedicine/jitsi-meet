// @flow

import React, { Component } from 'react';

import { getRoomName } from '../../base/conference';
import { translate } from '../../base/i18n';
import { connect } from '../../base/redux';
import { getDisplayName, updateSettings } from '../../base/settings';
import { isGuest } from '../../invite';
import { SETTINGS_TABS } from '../../settings';
import { SettingsButton } from '../../settings/components/web';
import { VideoSettingsButton, AudioSettingsButton } from '../../toolbox';
import {
    joinConference as joinConferenceAction,
    joinConferenceWithoutAudio as joinConferenceWithoutAudioAction,
    setSkipPrejoin as setSkipPrejoinAction,
    setJoinByPhoneDialogVisiblity as setJoinByPhoneDialogVisiblityAction
} from '../actions';
import {
    isJoinByPhoneButtonVisible,
    isDeviceStatusVisible,
    isJoinByPhoneDialogVisible,
    getDeviceStatusType
} from '../functions';

import ActionButton from './buttons/ActionButton';
import DeviceStatus from './preview/DeviceStatus';
import Preview from './preview/Preview';

type Props = {

    /**
     * Flag signaling if the device status is visible or not.
     */
    deviceStatusVisible: boolean,

    /**
     * If join by phone button should be visible.
     */
    hasJoinByPhoneButton: boolean,

    /**
     * Flag signaling if a user is logged in or not.
     */
    isAnonymousUser: boolean,

    /**
     * Joins the current meeting.
     */
    joinConference: Function,

    /**
     * Joins the current meeting without audio.
     */
    joinConferenceWithoutAudio: Function,

    /**
     * The name of the user that is about to join.
     */
    name: string,

    /**
     * Updates settings.
     */
    updateSettings: Function,

    /**
     * The name of the meeting that is about to be joined.
     */
    roomName: string,

    /**
     * Sets visibility of the prejoin page for the next sessions.
     */
    setSkipPrejoin: Function,

    /**
     * Sets visibility of the 'JoinByPhoneDialog'.
     */
    setJoinByPhoneDialogVisiblity: Function,

    /**
     * If 'JoinByPhoneDialog' is visible or not.
     */
    showDialog: boolean,

    /**
     * Used for translation.
     */
    t: Function,

    /**
     * 'ok'|'warning'.
     */
    deviceStatusType: string
};

type State = {

    /**
     * Flag controlling the visibility of the 'join by phone' buttons.
     */
    showJoinByPhoneButtons: boolean
}

/**
 * This component is displayed before joining a meeting.
 */
class Prejoin extends Component<Props, State> {
    /**
     * Initializes a new {@code Prejoin} instance.
     *
     * @inheritdoc
     */
    constructor(props) {
        super(props);

        this.state = {
            showJoinByPhoneButtons: false
        };

        this._closeDialog = this._closeDialog.bind(this);
        this._showDialog = this._showDialog.bind(this);
        this._onCheckboxChange = this._onCheckboxChange.bind(this);
        this._onDropdownClose = this._onDropdownClose.bind(this);
        this._onOptionsClick = this._onOptionsClick.bind(this);
        this._setName = this._setName.bind(this);
        this._onReadyClick = this._onReadyClick.bind(this);
        this._onCancelClick = this._onCancelClick.bind(this);
        this._onJoinConference = this._onJoinConference.bind(this);
        this._setName = this._setName.bind(this);

        window.addEventListener('message', this._receiveMessage.bind(this), false);
    }

    /**
     * Handler for the checkbox.
     *
     * @param {Object} event - The synthetic event.
     * @returns {void}
     */
    _receiveMessage(event) {
        if (event.data === 'tele-joinconference' || event.message === 'tele-joinconference') {
            this.props.joinConference();
        }
    }

    _onCheckboxChange: () => void;

    /**
     * Handler for the checkbox.
     *
     * @param {Object} e - The synthetic event.
     * @returns {void}
     */
    _onCheckboxChange(e) {
        this.props.setSkipPrejoin(e.target.checked);
    }

    _onDropdownClose: () => void;

    /**
     * Closes the dropdown.
     *
     * @returns {void}
     */
    _onDropdownClose() {
        this.setState({
            showJoinByPhoneButtons: false
        });
    }

    _onOptionsClick: () => void;

    /**
     * Displays the join by phone buttons dropdown.
     *
     * @param {Object} e - The synthetic event.
     * @returns {void}
     */
    _onOptionsClick(e) {
        e.stopPropagation();

        this.setState({
            showJoinByPhoneButtons: !this.state.showJoinByPhoneButtons
        });
    }

    /**
     * Button for patient ready.
     *
     * @returns {void}
     */
    _onReadyClick() {
        window.parent.postMessage('pre-join-close', '*');
    }

    _onReadyClick: () => void;

    /**
     * Button for doctor cancel.
     *
     * @returns {void}
     */
    _onCancelClick() {
        window.parent.postMessage('pre-join-cancel', '*');
    }

    _onCancelClick: () => void;

    /**
     * Send Event for join conference.
     *
     * @returns {void}
     */
    _onJoinConference() {
        window.parent.postMessage('pre-join-confernce', '*');
        const { joinConference } = this.props;

        joinConference();
    }

    _onJoinConference: () => void;

    _setName: () => void;

    /**
     * Sets the guest participant name.
     *
     * @param {string} displayName - Participant name.
     * @returns {void}
     */
    _setName(displayName) {
        this.props.updateSettings({
            displayName
        });
    }

    _closeDialog: () => void;

    /**
     * Closes the join by phone dialog.
     *
     * @returns {undefined}
     */
    _closeDialog() {
        this.props.setJoinByPhoneDialogVisiblity(false);
    }

    _showDialog: () => void;

    /**
     * Displays the dialog for joining a meeting by phone.
     *
     * @returns {undefined}
     */
    _showDialog() {
        this.props.setJoinByPhoneDialogVisiblity(true);
        this._onDropdownClose();
    }

    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const {
            name,
            deviceStatusType,
            t
        } = this.props;

        const displayDr = window.jameda.userType === 'd' ? '' : 'prejoin-preview-btn-display-none';
        const displayPa = window.jameda.userType === 'p' ? '' : 'prejoin-preview-btn-display-none';

        const { _onCheckboxChange, _onOptionsClick, _onReadyClick, _onCancelClick, _onJoinConference } = this;

        return (
            <div className = 'prejoin-full-page'>

                <Preview name = { name } />
                <div className = 'prejoin-input-area-container'>
                    <div className = 'prejoin-input-area'>
                        <div className = 'prejoin-title'>
                            {t('prejoin.title')}
                        </div>

                        <div className = 'prejoin-settings'>
                            <SettingsButton
                                defaultTab = { SETTINGS_TABS.DEVICES } />
                        </div>

                        <div className = 'prejoin-preview-dropdown-container'>
                            <ActionButton
                                className = { displayDr }
                                disabled = { deviceStatusType !== 'ok' }
                                hasOptions = { false }
                                onClick = { _onJoinConference }
                                onOptionsClick = { _onOptionsClick }
                                type = 'primary'>
                                { t('prejoin.joinMeeting') }
                            </ActionButton>

                            <ActionButton
                                className = { displayDr }
                                disabled = { false }
                                hasOptions = { false }
                                onClick = { _onCancelClick }
                                type = 'secondary' >
                                { t('prejoin.cancel') }
                            </ActionButton>

                            <ActionButton
                                className = { displayPa }
                                disabled = { deviceStatusType !== 'ok' }
                                hasOptions = { false }
                                onClick = { _onReadyClick }
                                type = 'primary' >
                                { t('prejoin.ready') }
                            </ActionButton>
                        </div>

                        <div className = 'prejoin-preview-btn-container'>
                            <AudioSettingsButton visible = { true } />
                            <VideoSettingsButton visible = { true } />
                        </div>
                    </div>

                    <div className = 'prejoin-checkbox-container'>
                        <input
                            className = 'prejoin-checkbox'
                            onChange = { _onCheckboxChange }
                            type = 'checkbox' />
                        <span>{t('prejoin.doNotShow')}</span>
                    </div>
                </div>

                <DeviceStatus />

            </div>
        );
    }
}

/**
 * Maps (parts of) the redux state to the React {@code Component} props.
 *
 * @param {Object} state - The redux state.
 * @returns {Object}
 */
function mapStateToProps(state): Object {
    return {
        isAnonymousUser: isGuest(state),
        deviceStatusVisible: isDeviceStatusVisible(state),
        name: getDisplayName(state),
        roomName: getRoomName(state),
        showDialog: isJoinByPhoneDialogVisible(state),
        hasJoinByPhoneButton: isJoinByPhoneButtonVisible(state),
        deviceStatusType: getDeviceStatusType(state)
    };
}

const mapDispatchToProps = {
    joinConferenceWithoutAudio: joinConferenceWithoutAudioAction,
    joinConference: joinConferenceAction,
    setJoinByPhoneDialogVisiblity: setJoinByPhoneDialogVisiblityAction,
    setSkipPrejoin: setSkipPrejoinAction,
    updateSettings
};

export default connect(mapStateToProps, mapDispatchToProps)(translate(Prejoin));
