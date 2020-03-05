// @flow

import { JAMEDA_CONFIG_UPDATED } from './actionTypes';

declare var config: Object;
declare var interfaceConfig: Object;


/**
 * Update jameda config in the redux store.
 *
 * @param {JamedaConfig} jamedaConfig - jameda configuration object.
 * @returns {{
 *     type: JAMEDA_CONFIG_UPDATED,
 *     payload: JamedaConfig
 * }}
 */
export function jamedaConfigUpdated(jamedaConfig = {}) {
    return {
        type: JAMEDA_CONFIG_UPDATED,
        payload: {
            ...jamedaConfig
        }
    };
}
