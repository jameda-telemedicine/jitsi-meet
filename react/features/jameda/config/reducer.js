import {
    ReducerRegistry
} from '../../base/redux';

import {
    JAMEDA_CONFIG_UPDATED
} from './actionTypes';

const DEFAULT_STATE = {
    feedbackUrl: null
};

/**
 * Reduces the Redux actions of the feature features/jameda/config.
 */
ReducerRegistry.register(
    'features/jameda/config',
    (state = DEFAULT_STATE, action) => {
        switch (action.type) {
        case JAMEDA_CONFIG_UPDATED: {

            return {
                ...state,
                ...action.payload
            };
        }
        }

        return state;
    });
