// @flow

import React, { Component } from 'react';

import { translate } from '../../../base/i18n';
import { Icon, IconMenuThumb } from '../../../base/icons';
import { getLocalParticipant, PARTICIPANT_ROLE } from '../../../base/participants';
import { Popover } from '../../../base/popover';
import { connect } from '../../../base/redux';
import { requestRemoteControl, stopController } from '../../../remote-control';
import { getCurrentLayout, LAYOUTS } from '../../../video-layout';

import MuteEveryoneElseButton from './MuteEveryoneElseButton';
import MuteEveryoneElsesVideoButton from './MuteEveryoneElsesVideoButton';
import { REMOTE_CONTROL_MENU_STATES } from './RemoteControlButton';

import {
    GrantModeratorButton,
    MuteButton,
    MuteVideoButton,
    KickButton,
    PrivateMessageMenuButton,
    RemoteControlButton,
    VideoMenu,
    VolumeSlider
} from './';

declare var $: Object;
declare var interfaceConfig: Object;

/**
 * The type of the React {@code Component} props of
 * {@link RemoteVideoMenuTriggerButton}.
 */
type Props = {

    /**
     * Whether or not to display the kick button.
     */
    _disableKick: boolean,

    /**
     * Whether or not to display the remote mute buttons.
     */
    _disableRemoteMute: Boolean,

    /**
     * Whether or not to display the grant moderator button.
     */
    _disableGrantModerator: Boolean,

    /**
     * Whether or not the participant is a conference moderator.
     */
    _isModerator: boolean,

    /**
     * The position relative to the trigger the remote menu should display
     * from. Valid values are those supported by AtlasKit
     * {@code InlineDialog}.
     */
    _menuPosition: string,

    /**
     * Whether to display the Popover as a drawer.
     */
    _overflowDrawer: boolean,

    /**
     * The redux dispatch function.
     */
    dispatch: Function,

    /**
     * A value between 0 and 1 indicating the volume of the participant's
     * audio element.
     */
    initialVolumeValue: number,

    /**
     * Callback to invoke when the popover has been displayed.
     */
    onMenuDisplay: Function,

    /**
     * Callback to invoke choosing to start a remote control session with
     * the participant.
     */
    onRemoteControlToggle: Function,

    /**
     * Callback to invoke when changing the level of the participant's
     * audio element.
     */
    onVolumeChange: Function,

    /**
     * The position relative to the trigger the remote menu should display
     * from. Valid values are those supported by AtlasKit
     * {@code InlineDialog}.
     */
    menuPosition: string,

    /**
     * The ID for the participant on which the remote video menu will act.
     */
    participantID: string,

    /**
     * The ID for the participant on which the remote video menu will act.
     */
    _participantDisplayName: string,

    /**
     * Invoked to obtain translated strings.
     */
    t: Function

    /**
     * The current state of the participant's remote control session.
     */
    remoteControlState: number
};

/**
 * React {@code Component} for displaying an icon associated with opening the
 * the {@code VideoMenu}.
 *
 * @extends {Component}
 */
class RemoteVideoMenuTriggerButton extends Component<Props> {
    /**
     * Initializes a new {#@code RemoteVideoMenuTriggerButton} instance.
     *
     * @param {Object} props - The read-only properties with which the new
     * instance is to be initialized.
     */
    constructor(props: Object) {
        super(props);

        // Bind event handler so it is only bound once for every instance.
        this._onShowRemoteMenu = this._onShowRemoteMenu.bind(this);
    }
    /**
     * Implements React's {@link Component#render()}.
     *
     * @inheritdoc
     * @returns {ReactElement}
     */
    render() {
        const content = this._renderRemoteVideoMenu();

        if (!content) {
            return null;
        }

        const username = this.props._participantDisplayName;

        return (
            <Popover
                content = { content }
                overflowDrawer = { this.props._overflowDrawer }
                onPopoverOpen = { this._onShowRemoteMenu }
                position = { this.props.menuPosition }>
                <span className = 'popover-trigger remote-video-menu-trigger'>
                    <Icon
                        ariaLabel = { this.props.t('dialog.remoteUserControls', { username }) }
                        role = 'button'
                        size = '1.4em'
                        src = { IconMenuThumb }
                        tabIndex = { 0 }
                        title = { this.props.t('dialog.remoteUserControls', { username }) } />
                </span>
            </Popover>
        );
    }

    _onShowRemoteMenu: () => void;

    /**
     * Opens the {@code RemoteVideoMenu}.
     *
     * @private
     * @returns {void}
     */
    _onShowRemoteMenu() {
        this.props.onMenuDisplay();
    }

    /**
     * Creates a new {@code VideoMenu} with buttons for interacting with
     * the remote participant.
     *
     * @private
     * @returns {ReactElement}
     */
    _renderRemoteVideoMenu() {
        const {
            _disableKick,
            _disableRemoteMute,
            _disableGrantModerator,
            _isModerator,
            dispatch,
            initialVolumeValue,
            onRemoteControlToggle,
            onVolumeChange,
            remoteControlState,
            participantID
        } = this.props;

        const buttons = [];

        if (_isModerator) {
            if (!_disableRemoteMute) {
                buttons.push(
                    <MuteButton
                        key = 'mute'
                        participantID = { participantID } />
                );
                buttons.push(
                    <MuteEveryoneElseButton
                        key = 'mute-others'
                        participantID = { participantID } />
                );
                buttons.push(
                    <MuteVideoButton
                        key = 'mute-video'
                        participantID = { participantID } />
                );
                buttons.push(
                    <MuteEveryoneElsesVideoButton
                        key = 'mute-others-video'
                        participantID = { participantID } />
                );
            }

            if (!_disableGrantModerator) {
                buttons.push(
                    <GrantModeratorButton
                        key = 'grant-moderator'
                        participantID = { participantID } />
                );
            }

            if (!_disableKick) {
                buttons.push(
                    <KickButton
                        key = 'kick'
                        participantID = { participantID } />
                );
            }
        }

        if (remoteControlState) {
            buttons.push(
                <RemoteControlButton
                    key = 'remote-control'
                    onClick = { onRemoteControlToggle }
                    participantID = { participantID }
                    remoteControlState = { remoteControlState } />
            );
        }

        buttons.push(
            <PrivateMessageMenuButton
                key = 'privateMessage'
                participantID = { participantID } />
        );

        if (onVolumeChange) {
            buttons.push(
                <VolumeSlider
                    initialValue = { initialVolumeValue }
                    key = 'volume-slider'
                    onChange = { onVolumeChange } />
            );
        }

        if (buttons.length > 0) {
            return (
                <VideoMenu id = { participantID }>
                    { buttons }
                </VideoMenu>
            );
        }

        return null;
    }
}

/**
 * Maps (parts of) the Redux state to the associated {@code RemoteVideoMenuTriggerButton}'s props.
 *
 * @param {Object} state - The Redux state.
 * @param {Object} ownProps - The own props of the component.
 * @private
 * @returns {{
 *     _isModerator: boolean
 * }}
 */
function _mapStateToProps(state, ownProps) {
    const { participantID } = ownProps;
    const tracks = state['features/base/tracks'];
    const localParticipant = getLocalParticipant(state);
    const { remoteVideoMenu = {}, disableRemoteMute } = state['features/base/config'];
    const { disableKick } = remoteVideoMenu;

    return {
        _isAudioMuted: isRemoteTrackMuted(tracks, MEDIA_TYPE.AUDIO, participantID) || false,
        _isModerator: Boolean(localParticipant?.role === PARTICIPANT_ROLE.MODERATOR),
        _disableKick: Boolean(disableKick),
        _disableRemoteMute: Boolean(disableRemoteMute)
    };
}

export default translate(connect(_mapStateToProps)(RemoteVideoMenuTriggerButton));
