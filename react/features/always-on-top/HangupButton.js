// @flow

// We need to reference these files directly to avoid loading things that are not available
// in this environment (e.g. JitsiMeetJS or interfaceConfig)
import AbstractHangupButton from '../base/toolbox/components/AbstractHangupButton';
import type { Props } from '../base/toolbox/components/AbstractButton';

const { api } = window.alwaysOnTop;

/**
 * Stateless hangup button for the Always-on-Top windows.
 */
export default class HangupButton extends AbstractHangupButton<Props, *> {

    accessibilityLabel = 'Hangup';

    /**
     * Helper function to perform the actual hangup action.
     *
     * @override
     * @protected
     * @returns {void}
     */
    _doHangup() {
        api.executeCommand('hangup');

        // TODO
        // #1 Case:
        // When Moderator (Doctor) hangs up, the participant will be kicked off
        // the call

        // #2 Case:
        // When Participant hangs up, the Moderator (Doctor) remains in the call

        console.log('################### HANG UP!');

        window.close();
    }
}
