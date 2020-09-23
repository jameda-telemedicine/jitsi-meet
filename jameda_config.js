/* eslint-disable no-unused-vars, no-var */

const searchUrlParams = parseURLParams(window.location, true, 'search');
const hashUrlParams = parseURLParams(window.location, false, 'hash');

/**
 * Set a global configuration object
 *
 * @type {{inst: {name: string | null, brandLogoPath: string | null }, peerBrowser: string, enableGatherStats: boolean}}
 */
window.jameda = {
    inst: {
        name: hashUrlParams['inst.name'] ? hashUrlParams['inst.name'] : null,
        brandLogoPath: hashUrlParams['inst.brandLogoPath'] ? hashUrlParams['inst.brandLogoPath'] : null
    },
    peerBrowserName: decodeURIComponent(searchUrlParams.browserName) || '',
    enableGatherStats: isGatherStatsEnabled(window.location.pathname)
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

/**
 * Checks if gathering stats should be enabled based on conference number.
 *
 * @type {{pathname: string}}
 * @returns {?boolean}
 */
function isGatherStatsEnabled(pathname) {
    const pathArray = pathname.split('/');
    const conferencePath = pathArray.reduce((prev, next) => {
        if (next.startsWith('conference')) {
            return next.replace('conference', '');
        }

        return prev;
    }, '');

    return parseInt(conferencePath, 10) % 10 === 0;
}

/* eslint-enable no-unused-vars, no-var */
