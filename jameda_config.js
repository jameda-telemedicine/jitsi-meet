/* eslint-disable no-unused-vars, no-var */

const urlParams = parseURLParams(window.location, true, 'search');


/**
 * Set a global configuration object
 *
 * @type {{inst: {name: string | null, brandLogoPath: string | null }, peerBrowser: string}}
 */
window.jameda = {
    inst: {
        name: urlParams.inst === 'null' ? null : getInstitutionNameFromUrlParams(urlParams.inst.name),
        brandLogoPath: urlParams.inst === 'null' ? null : getBrandLogoPathFromUrlParams(urlParams.inst)
    },
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

/**
 * Get a logo path.
 *
 * @type {{name: string | null, brandLogoPath: string | null} }
 */
function getBrandLogoPathFromUrlParams(inst) {
    return inst.brandLogoPath === 'null' ? null : inst.brandLogoPath;
}

/**
 * Get a institution name.
 *
 * @type {{name: string | null, brandLogoPath: string | null} }
 */
function getInstitutionNameFromUrlParams(inst) {
    return inst.name === 'null' ? null : inst.name;
}

/* eslint-enable no-unused-vars, no-var */
