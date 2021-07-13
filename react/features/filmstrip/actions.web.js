// @flow
import type { Dispatch } from 'redux';

import { pinParticipant } from '../base/participants';

import {
    HORIZONTAL_FILMSTRIP_MARGIN,
    SCROLL_SIZE,
    STAGE_VIEW_THUMBNAIL_HORIZONTAL_BORDER,
    STAGE_VIEW_THUMBNAIL_VERTICAL_BORDER,
    TILE_HORIZONTAL_MARGIN,
    TILE_VERTICAL_MARGIN,
    VERTICAL_FILMSTRIP_VERTICAL_MARGIN
} from './constants';
import {
    SET_HORIZONTAL_VIEW_DIMENSIONS,
    SET_TILE_VIEW_DIMENSIONS,
    SET_VERTICAL_VIEW_DIMENSIONS,
    SET_VISIBLE_REMOTE_PARTICIPANTS,
    SET_VOLUME
} from './actionTypes';
import {
    calculateThumbnailSizeForHorizontalView,
    calculateThumbnailSizeForTileView,
    calculateThumbnailSizeForVerticalView
} from './functions';

import { CHAT_SIZE } from '../chat';

/**
 * The size of the side margins for each tile as set in CSS.
 */
const TILE_VIEW_SIDE_MARGINS = 10 * 2;

/**
 * Sets the dimensions of the tile view grid.
 *
 * @param {Object} dimensions - Whether the filmstrip is visible.
 * @param {Object} windowSize - The size of the window.
 * @param {boolean} isChatOpen - Whether the chat panel is displayed, in
 * order to properly compute the tile view size.
 * @returns {{
 *     type: SET_TILE_VIEW_DIMENSIONS,
 *     dimensions: Object
 * }}
 */
export function setTileViewDimensions(dimensions: Object, windowSize: Object, isChatOpen: boolean) {
    const { clientWidth, clientHeight } = windowSize;
    let widthToUse = clientWidth;

    if (isChatOpen) {
        widthToUse -= CHAT_SIZE;
    }

    const thumbnailSize = calculateThumbnailSizeForTileView({
        ...dimensions,
        clientWidth: widthToUse,
        clientHeight
    });
    const filmstripWidth = dimensions.columns * (TILE_VIEW_SIDE_MARGINS + thumbnailSize.width);

    return {
        type: SET_TILE_VIEW_DIMENSIONS,
        dimensions: {
            gridDimensions: dimensions,
            thumbnailSize,
            filmstripWidth
        }
    };
}

/**
 * Sets the dimensions of the thumbnails in vertical view.
 *
 * @returns {Function}
 */
export function setVerticalViewDimensions() {
    return (dispatch: Dispatch<any>, getState: Function) => {
        const state = getState();
        const { clientHeight = 0, clientWidth = 0 } = state['features/base/responsive-ui'];
        const thumbnails = calculateThumbnailSizeForVerticalView(clientWidth);

        dispatch({
            type: SET_VERTICAL_VIEW_DIMENSIONS,
            dimensions: {
                ...thumbnails,
                remoteVideosContainer: {
                    width: thumbnails?.local?.width
                        + TILE_HORIZONTAL_MARGIN + STAGE_VIEW_THUMBNAIL_HORIZONTAL_BORDER + SCROLL_SIZE,
                    height: clientHeight - thumbnails?.local?.height - VERTICAL_FILMSTRIP_VERTICAL_MARGIN
                }
            }

        });
    };
}

/**
 * Sets the dimensions of the thumbnails in horizontal view.
 *
 * @returns {Function}
 */
export function setHorizontalViewDimensions() {
    return (dispatch: Dispatch<any>, getState: Function) => {
        const state = getState();
        const { clientHeight = 0, clientWidth = 0 } = state['features/base/responsive-ui'];
        const thumbnails = calculateThumbnailSizeForHorizontalView(clientHeight);

        dispatch({
            type: SET_HORIZONTAL_VIEW_DIMENSIONS,
            dimensions: {
                ...thumbnails,
                remoteVideosContainer: {
                    width: clientWidth - thumbnails?.local?.width - HORIZONTAL_FILMSTRIP_MARGIN,
                    height: thumbnails?.local?.height
                        + TILE_VERTICAL_MARGIN + STAGE_VIEW_THUMBNAIL_VERTICAL_BORDER + SCROLL_SIZE
                }
            }
        });
    };
}

/**
 * Emulates a click on the n-th video.
 *
 * @param {number} n - Number that identifies the video.
 * @returns {Function}
 */
export function clickOnVideo(n: number) {
    return (dispatch: Function, getState: Function) => {
        const participants = getState()['features/base/participants'];
        const nThParticipant = participants[n];
        const { id, pinned } = nThParticipant;

        dispatch(pinParticipant(pinned ? null : id));
    };
}

/**
 * Sets the volume for a thumnail's audio.
 *
 * @param {string} participantId - The participant ID asociated with the audio.
 * @param {string} volume - The volume level.
 * @returns {{
 *     type: SET_VOLUME,
 *     participantId: string,
 *     volume: number
 * }}
 */
export function setVolume(participantId: string, volume: number) {
    return {
        type: SET_VOLUME,
        participantId,
        volume
    };
}

/**
 * Sets the list of the visible participants in the filmstrip by storing the start and end index from the remote
 * participants array.
 *
 * @param {number} startIndex - The start index from the remote participants array.
 * @param {number} endIndex - The end index from the remote participants array.
 * @returns {{
 *      type: SET_VISIBLE_REMOTE_PARTICIPANTS,
 *      startIndex: number,
 *      endIndex: number
 * }}
 */
export function setVisibleRemoteParticipants(startIndex: number, endIndex: number) {
    return {
        type: SET_VISIBLE_REMOTE_PARTICIPANTS,
        startIndex,
        endIndex
    };
}

export * from './actions.native';
