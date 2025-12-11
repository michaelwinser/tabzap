// Regular expressions need to be stored as strings, not the /exp/ notation

var defaultConfig = {
    ignorePatterns: [
        "^view-source:/",
        "^chrome://",
        "^chrome-extension://"
    ],
    urlPatterns: [
        // Amazon products - extracts ASIN, ignores tracking params
        "^https://www\\.amazon\\.[^/]+/([^/]+/)?dp/[A-Z0-9]+",
        "^https://www\\.amazon\\.[^/]+/gp/product/[A-Z0-9]+",
        // Google services
        "^https://docs\\.google\\.com/([a-z]+/)?d/[^/]+",
        "^https://drive\\.google\\.com/(corp/)?drive/(u/[0-9]+/)?",
        "^https://keep\\.google\\.com/",
        "^https://mail\\.google\\.com/mail/(u/[0-9]+/)?",
        // YouTube
        "^https://www\\.youtube\\.com/watch\\?v=[^&]+",
        "^https://youtu\\.be/[^?]+",
        // Social media
        "^https://([^.]+\\.)?reddit\\.com/r/[^/]+/comments/[^/]+",
        "^https://twitter\\.com/[^/]+/status/[0-9]+",
        "^https://x\\.com/[^/]+/status/[0-9]+",
        "^https://www\\.linkedin\\.com/posts/[^/]+",
        "^https://www\\.linkedin\\.com/in/[^/]+",
        // GitHub
        "^https://github\\.com/[^/]+/[^/]+(/tree/[^?]+)?",
        "^https://github\\.com/[^/]+/[^/]+/pull/[0-9]+",
        "^https://github\\.com/[^/]+/[^/]+/issues/[0-9]+",
        // Stack Overflow/Exchange
        "^https://stackoverflow\\.com/questions/[0-9]+",
        "^https://[^/]+\\.stackexchange\\.com/questions/[0-9]+",
        // eBay
        "^https://www\\.ebay\\.com/itm/[0-9]+",
        // Generic fallback - strips query strings and hashes
        "^[^?#]+"
    ]
}

function configGetEmpty() {
    return { ignorePatterns: [], urlPatterns: []};
}
function configGetDefaults() {
    return JSON.parse(JSON.stringify(defaultConfig));
}
function configRestoreDefault() {
    configSave(defaultConfig);
}

function configLoad(fn) {
    chrome.storage.sync.get(defaultConfig, function(loadedConfig) {
        console.log("config loaded %s", JSON.stringify(loadedConfig));
        fn(loadedConfig);
    })
}

function configSave(source) {
    chrome.storage.sync.set(source);
}

