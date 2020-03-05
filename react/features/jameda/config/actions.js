// @flow

import { JAMEDA_CONFIG_UPDATED } from './actionTypes';

declare var config: Object;
declare var interfaceConfig: Object;


/**
 * Update jameda config in the redux store.
 *
 * @param {Object} jamedaConfig - Jameda configuration object.
 * @returns {{
 *     type: JAMEDA_CONFIG_UPDATED,
 *     payload: Object
 * }}
 */
export function jamedaConfigUpdated(jamedaConfig: Object = {}) {
    return {
        type: JAMEDA_CONFIG_UPDATED,
        payload: {
            ...jamedaConfig
        }
    };
}
