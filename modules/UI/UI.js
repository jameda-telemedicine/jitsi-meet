/* global APP, $, config */


const UI = {};

import EventEmitter from 'events';
import Logger from 'jitsi-meet-logger';

import { isMobileBrowser } from '../../react/features/base/environment/utils';
import { getLocalParticipant } from '../../react/features/base/participants';
import { toggleChat } from '../../react/features/chat';
import { setColorAlpha } from '../../react/features/base/util';
import { setDocumentUrl } from '../../react/features/etherpad';
import { setFilmstripVisible } from '../../react/features/filmstrip';
import { joinLeaveNotificationsDisabled, setNotificationsEnabled } from '../../react/features/notifications';
import {
    dockToolbox,
    setToolboxEnabled,
    showToolbox
} from '../../react/features/toolbox/actions.web';
import UIEvents from '../../service/UI/UIEvents';

import EtherpadManager from './etherpad/Etherpad';
import messageHandler from './util/MessageHandler';
import UIUtil from './util/UIUtil';
import VideoLayout from './videolayout/VideoLayout';

const logger = Logger.getLogger(__filename);

UI.messageHandler = messageHandler;

const eventEmitter = new EventEmitter();

UI.eventEmitter = eventEmitter;

let etherpadManager;

const UIListeners = new Map([
    [
        UIEvents.ETHERPAD_CLICKED,
        () => etherpadManager && etherpadManager.toggleEtherpad()
    ], [
        UIEvents.TOGGLE_FILMSTRIP,
        () => UI.toggleFilmstrip()
    ]
]);

/**
 * Indicates if we're currently in full screen mode.
 *
 * @return {boolean} {true} to indicate that we're currently in full screen
 * mode, {false} otherwise
 */
UI.isFullScreen = function() {
    return UIUtil.isFullScreen();
};

/**
 * Returns true if the etherpad window is currently visible.
 * @returns {Boolean} - true if the etherpad window is currently visible.
 */
UI.isEtherpadVisible = function() {
    return Boolean(etherpadManager && etherpadManager.isVisible());
};

/**
 * Notify user that server has shut down.
 */
UI.notifyGracefulShutdown = function() {
    messageHandler.showError({
        descriptionKey: 'dialog.gracefulShutdown',
        titleKey: 'dialog.serviceUnavailable'
    });
};

/**
 * Notify user that reservation error happened.
 */
UI.notifyReservationError = function(code, msg) {
    messageHandler.showError({
        descriptionArguments: {
            code,
            msg
        },
        descriptionKey: 'dialog.reservationErrorMsg',
        titleKey: 'dialog.reservationError'
    });
};

/**
 * Change nickname for the user.
 * @param {string} id user id
 * @param {string} displayName new nickname
 */
UI.changeDisplayName = function(id, displayName) {
    VideoLayout.onDisplayNameChanged(id, displayName);
};

/**
 * Initialize conference UI.
 */
UI.initConference = function() {
    const { getState } = APP.store;
    const { id, name } = getLocalParticipant(getState);

    UI.showToolbar();

    const displayName = config.displayJids ? id : name;

    if (displayName) {
        UI.changeDisplayName('localVideoContainer', displayName);
    }
};

/**
 * Starts the UI module and initializes all related components.
 *
 * @returns {boolean} true if the UI is ready and the conference should be
 * established, false - otherwise (for example in the case of welcome page)
 */
UI.start = function() {
    VideoLayout.initLargeVideo();

    // Do not animate the video area on UI start (second argument passed into
    // resizeVideoArea) because the animation is not visible anyway. Plus with
    // the current dom layout, the quality label is part of the video layout and
    // will be seen animating in.
    VideoLayout.resizeVideoArea();

    if (isMobileBrowser()) {
        $('body').addClass('mobile-browser');
    } else {
        $('body').addClass('desktop-browser');

        if (config.backgroundAlpha !== undefined) {
            const backgroundColor = $('body').css('background-color');
            const alphaColor = setColorAlpha(backgroundColor, config.backgroundAlpha);

            $('body').css('background-color', alphaColor);
        }
    }

    if (config.iAmRecorder) {
        // in case of iAmSipGateway keep local video visible
        if (!config.iAmSipGateway) {
            APP.store.dispatch(setNotificationsEnabled(false));
        }

        APP.store.dispatch(setToolboxEnabled(false));
    }
};

/**
 * Setup some UI event listeners.
 */
UI.registerListeners
    = () => UIListeners.forEach((value, key) => UI.addListener(key, value));

/**
 * Setup some DOM event listeners.
 */
UI.bindEvents = () => {
    /**
     *
     */
    function onResize() {
        VideoLayout.onResize();
    }

    // Resize and reposition videos in full screen mode.
    $(document).on(
            'webkitfullscreenchange mozfullscreenchange fullscreenchange',
            onResize);

    $(window).resize(onResize);
};

/**
 * Unbind some DOM event listeners.
 */
UI.unbindEvents = () => {
    $(document).off(
            'webkitfullscreenchange mozfullscreenchange fullscreenchange');

    $(window).off('resize');
};

/**
 * Setup and show Etherpad.
 * @param {string} name etherpad id
 */
UI.initEtherpad = name => {
    if (etherpadManager || !config.etherpad_base || !name) {
        return;
    }
    logger.log('Etherpad is enabled');

    etherpadManager = new EtherpadManager(eventEmitter);

    const url = new URL(name, config.etherpad_base);

    APP.store.dispatch(setDocumentUrl(url.toString()));

    if (config.openSharedDocumentOnJoin) {
        etherpadManager.toggleEtherpad();
    }
};

/**
 * Returns the shared document manager object.
 * @return {EtherpadManager} the shared document manager object
 */
UI.getSharedDocumentManager = () => etherpadManager;

/**
 * Show user on UI.
 * @param {JitsiParticipant} user
 */
UI.addUser = function(user) {
    const id = user.getId();
    const displayName = user.getDisplayName();
    const status = user.getStatus();

    if (status) {
        // FIXME: move updateUserStatus in participantPresenceChanged action
        UI.updateUserStatus(user, status);
    }

    // set initial display name
    if (displayName) {
        UI.changeDisplayName(id, displayName);
    }
};

/**
 * Updates the user status.
 *
 * @param {JitsiParticipant} user - The user which status we need to update.
 * @param {string} status - The new status.
 */
UI.updateUserStatus = (user, status) => {
    const reduxState = APP.store.getState() || {};
    const { calleeInfoVisible } = reduxState['features/invite'] || {};

    // We hide status updates when join/leave notifications are disabled,
    // as jigasi is the component with statuses and they are seen as join/leave notifications.
    if (!status || calleeInfoVisible || joinLeaveNotificationsDisabled()) {
        return;
    }

    const displayName = user.getDisplayName();

    messageHandler.participantNotification(
        displayName,
        '',
        'connected',
        'dialOut.statusMessage',
        { status: UIUtil.escapeHtml(status) });
};

/**
 * Toggles filmstrip.
 */
UI.toggleFilmstrip = function() {
    const { visible } = APP.store.getState()['features/filmstrip'];

    APP.store.dispatch(setFilmstripVisible(!visible));
};

/**
 * Handle new user display name.
 */
UI.inputDisplayNameHandler = function(newDisplayName) {
    eventEmitter.emit(UIEvents.NICKNAME_CHANGED, newDisplayName);
};

// FIXME check if someone user this
UI.showLoginPopup = function(callback) {
    logger.log('password is required');

    const message
        = `<input name="username" type="text"
                placeholder="user@domain.net"
                class="input-control" autofocus>
         <input name="password" type="password"
                data-i18n="[placeholder]dialog.userPassword"
                class="input-control"
                placeholder="user password">`

    ;

    // eslint-disable-next-line max-params
    const submitFunction = (e, v, m, f) => {
        if (v && f.username && f.password) {
            callback(f.username, f.password);
        }
    };

    messageHandler.openTwoButtonDialog({
        titleKey: 'dialog.passwordRequired',
        msgString: message,
        leftButtonKey: 'dialog.Ok',
        submitFunction,
        focus: ':input:first'
    });
};

/**
 * Sets muted audio state for participant
 */
UI.setAudioMuted = function(id) {
    // FIXME: Maybe this can be removed!
    if (APP.conference.isLocalId(id)) {
        APP.conference.updateAudioIconEnabled();
    }
};

/**
 * Sets muted video state for participant
 */
UI.setVideoMuted = function(id) {
    VideoLayout._updateLargeVideoIfDisplayed(id, true);

    if (APP.conference.isLocalId(id)) {
        APP.conference.updateVideoIconEnabled();
    }
};

UI.updateLargeVideo = (id, forceUpdate) => VideoLayout.updateLargeVideo(id, forceUpdate);

/**
 * Adds a listener that would be notified on the given type of event.
 *
 * @param type the type of the event we're listening for
 * @param listener a function that would be called when notified
 */
UI.addListener = function(type, listener) {
    eventEmitter.on(type, listener);
};

/**
 * Removes the all listeners for all events.
 *
 * @returns {void}
 */
UI.removeAllListeners = function() {
    eventEmitter.removeAllListeners();
};

/**
 * Emits the event of given type by specifying the parameters in options.
 *
 * @param type the type of the event we're emitting
 * @param options the parameters for the event
 */
UI.emitEvent = (type, ...options) => eventEmitter.emit(type, ...options);

// Used by torture.
UI.showToolbar = timeout => APP.store.dispatch(showToolbox(timeout));

// Used by torture.
UI.dockToolbar = dock => APP.store.dispatch(dockToolbox(dock));

/**
 * Updates the displayed avatar for participant.
 *
 * @param {string} id - User id whose avatar should be updated.
 * @param {string} avatarURL - The URL to avatar image to display.
 * @returns {void}
 */
UI.refreshAvatarDisplay = function(id) {
    VideoLayout.changeUserAvatar(id);
};

/**
 * Notify user that connection failed.
 * @param {string} stropheErrorMsg raw Strophe error message
 */
UI.notifyConnectionFailed = function(stropheErrorMsg) {
    let descriptionKey;
    let descriptionArguments;

    if (stropheErrorMsg) {
        descriptionKey = 'dialog.connectErrorWithMsg';
        descriptionArguments = { msg: stropheErrorMsg };
    } else {
        descriptionKey = 'dialog.connectError';
    }

    messageHandler.showError({
        descriptionArguments,
        descriptionKey,
        titleKey: 'connection.CONNFAIL'
    });
};


/**
 * Notify user that maximum users limit has been reached.
 */
UI.notifyMaxUsersLimitReached = function() {
    messageHandler.showError({
        hideErrorSupportLink: true,
        descriptionKey: 'dialog.maxUsersLimitReached',
        titleKey: 'dialog.maxUsersLimitReachedTitle'
    });
};

/**
 * Notify user that he was automatically muted when joned the conference.
 */
UI.notifyInitiallyMuted = function() {
    messageHandler.participantNotification(
        null,
        'notify.mutedTitle',
        'connected',
        'notify.muted',
        null);
};

UI.handleLastNEndpoints = function(leavingIds, enteringIds) {
    VideoLayout.onLastNEndpointsChanged(leavingIds, enteringIds);
};

/**
 * Update audio level visualization for specified user.
 * @param {string} id user id
 * @param {number} lvl audio level
 */
UI.setAudioLevel = (id, lvl) => VideoLayout.setAudioLevel(id, lvl);

/**
 * Hide connection quality statistics from UI.
 */
UI.hideStats = function() {
    VideoLayout.hideStats();
};


UI.notifyTokenAuthFailed = function() {
    messageHandler.showError({
        descriptionKey: 'dialog.tokenAuthFailed',
        titleKey: 'dialog.tokenAuthFailedTitle'
    });
};

UI.notifyInternalError = function(error) {
    messageHandler.showError({
        descriptionArguments: { error },
        descriptionKey: 'dialog.internalError',
        titleKey: 'dialog.internalErrorTitle'
    });
};

UI.notifyFocusDisconnected = function(focus, retrySec) {
    messageHandler.participantNotification(
        null, 'notify.focus',
        'disconnected', 'notify.focusFail',
        { component: focus,
            ms: retrySec }
    );
};

/**
 * Notifies interested listeners that the raise hand property has changed.
 *
 * @param {boolean} isRaisedHand indicates the current state of the
 * "raised hand"
 */
UI.onLocalRaiseHandChanged = function(isRaisedHand) {
    eventEmitter.emit(UIEvents.LOCAL_RAISE_HAND_CHANGED, isRaisedHand);
};

/**
 * Update list of available physical devices.
 */
UI.onAvailableDevicesChanged = function() {
    APP.conference.updateAudioIconEnabled();
    APP.conference.updateVideoIconEnabled();
};

/**
 * Returns the id of the current video shown on large.
 * Currently used by tests (torture).
 */
UI.getLargeVideoID = function() {
    return VideoLayout.getLargeVideoID();
};

/**
 * Returns the current video shown on large.
 * Currently used by tests (torture).
 */
UI.getLargeVideo = function() {
    return VideoLayout.getLargeVideo();
};

/**
 * Handles user's features changes.
 */
UI.onUserFeaturesChanged = user => VideoLayout.onUserFeaturesChanged(user);

/**
 * Returns the number of known remote videos.
 *
 * @returns {number} The number of remote videos.
 */
UI.getRemoteVideosCount = () => VideoLayout.getRemoteVideosCount();

/**
 * Returns the video type of the remote participant's video.
 * This is needed for the torture clients to determine the video type of the
 * remote participants.
 *
 * @param {string} participantID - The id of the remote participant.
 * @returns {string} The video type "camera" or "desktop".
 */
UI.getRemoteVideoType = participantID => VideoLayout.getRemoteVideoType(participantID);

/**
 * Sets the remote control active status for a remote participant.
 *
 * @param {string} participantID - The id of the remote participant.
 * @param {boolean} isActive - The new remote control active status.
 * @returns {void}
 */
UI.setRemoteControlActiveStatus = function(participantID, isActive) {
    VideoLayout.setRemoteControlActiveStatus(participantID, isActive);
};

/**
 * Sets the remote control active status for the local participant.
 *
 * @returns {void}
 */
UI.setLocalRemoteControlActiveChanged = function() {
    VideoLayout.setLocalRemoteControlActiveChanged();
};

// TODO: Export every function separately. For now there is no point of doing
// this because we are importing everything.
export default UI;
