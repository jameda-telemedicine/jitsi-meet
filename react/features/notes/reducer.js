import { ReducerRegistry } from '../base/redux';

import {
    CANCEL_NOTES,
    COPY_TO_CLIPBOARD_NOTES
} from './actionTypes';

const DEFAULT_STATE = {
    message: ''
};

/**
 * Reduces the Redux actions of the feature features/notes.
 */
ReducerRegistry.register(
    'features/notes',
    (state = DEFAULT_STATE, action) => {
        switch (action.type) {

        case CANCEL_NOTES:
        case COPY_TO_CLIPBOARD_NOTES: {
            return {
                ...state,
                message: action.message
            };
        }
        }

        return state;
    });
