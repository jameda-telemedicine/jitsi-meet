/* eslint-disable no-unused-vars, no-var */

const urlParams = parseURLParams(window.location, true, 'search');

/**
 * Set a global configuration object
 *
 * @type {{isCfgEnabled: boolean, peerBrowser: string}}
 */
window.jameda = {
    isCfgEnabled: urlParams.cfg === 'true' || false,
    peerBrowserName: decodeURIComponent(urlParams.browserName) || ''
};

/**
 * Checks for cfg user.
 * @returns {?arrayList}
 */
function parseURLParams(
        url,
        dontParse = false,
        source = 'hash') {
    const paramStr = source === 'search' ? url.search : url.hash;
    const params = {};
    const paramParts = (paramStr && paramStr.substr(1)
        .split('&')) || [];

    // Detect and ignore hash params for hash routers.
    if (source === 'hash' && paramParts.length === 1) {
        const firstParam = paramParts[0];

        if (firstParam.startsWith('/') && firstParam.split('&').length === 1) {
            return params;
        }
    }

    paramParts.forEach(part => {
        const param = part.split('=');
        const key = param[0];

        if (!key) {
            return;
        }

        let value;

        try {
            value = param[1];

            if (!dontParse) {
                const decoded = decodeURIComponent(value)
                    .replace(/\\&/, '&');

                value = decoded === 'undefined' ? undefined : JSON.parse(decoded);
            }
        } catch (e) {
            console.error(e);

            return;
        }
        params[key] = value;
    });

    return params;
}

/* eslint-enable no-unused-vars, no-var */
