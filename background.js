importScripts('config.js');

const ALARM_NAME = 'processQueue';
let globalQueue = new Set();
let globalConfig;

function onCompleted(details) {
    if (details.frameId != 0 || !details.url || isIgnoredUrl(details.url)) {
        return;
    }
    console.log("looking for and removing duplicate tabs of %s %s", details.tabId, details.url);
    chrome.tabs.get(details.tabId, removeDuplicateTabs);
}

function onClicked(tab) {
    if (globalQueue.size > 0) {
        // During countdown: cancel pending removals
        chrome.alarms.clear(ALARM_NAME);
        globalQueue.clear();
        clearBadge();
    } else {
        // No countdown active: scan and remove all duplicates in window
        scanAndRemoveDuplicates(tab.windowId);
    }
}

function scanAndRemoveDuplicates(windowId) {
    chrome.tabs.query({ windowId: windowId }, function(tabs) {
        // Sort by index to ensure leftmost tabs are kept
        tabs.sort((a, b) => a.index - b.index);

        const seen = new Map(); // normalized URL -> first tab id
        const duplicates = [];

        for (const tab of tabs) {
            if (isIgnoredUrl(tab.url)) {
                continue;
            }

            const normalizedUrl = getUrlForComparison(tab.url);

            if (seen.has(normalizedUrl)) {
                duplicates.push(tab.id);
            } else {
                seen.set(normalizedUrl, tab.id);
            }
        }

        if (duplicates.length > 0) {
            chrome.tabs.remove(duplicates);
            console.log("Removed %d duplicate tabs", duplicates.length);
        }
    });
}

function removeDuplicateTabs(tab) {
    if (typeof(tab) == "undefined") {
        console.log("bad tab")
        return;
    }
    console.log("removeDuplicateTabs(%s)", tab.id);

    var urlForComparison = getUrlForComparison(tab.url);

    chrome.tabs.query({ windowId: tab.windowId }, function(tabs) {
        var duplicates = tabs.filter(function(potentialDupTab) {
            if (tab.id == potentialDupTab.id || tab.pinned) {
                return false;
            }

            return urlForComparison == getUrlForComparison(potentialDupTab.url);
        })

        removeTabs(duplicates);
    })
}

function clearBadge() {
    chrome.action.setBadgeText({text: ""});
}

function setBadge(count) {
    var textCount = count.toString();
    if (count == 0) {
        textCount = "";
    }
    chrome.action.setBadgeText({text: textCount})
}

function updateBadge() {
    if (globalQueue.size > 0) {
        chrome.action.setBadgeText({text: globalQueue.size.toString()})
    }
    else {
        chrome.action.setBadgeText({text: ""})
    }
}

function removeTabs(tabs) {
    tabs.forEach(function(tab) {
        globalQueue.add(tab.id)
    })

    updateBadge();

    // If a timer is already pending, clear it and start the count again.
    // As long as the user keeps creating tabs we'll defer closing existing ones.
    chrome.alarms.clear(ALARM_NAME, () => {
        chrome.alarms.create(ALARM_NAME, { delayInMinutes: 5 / 60 }); // 5 seconds
    });
}

function processGlobalQueue() {
    globalQueue.forEach(function(tabId) {
        chrome.tabs.remove(tabId);
        globalQueue.delete(tabId);
        updateBadge();
    })
}

function getUrlForComparison(url) {
    var i;
    var urlForComparison = url;
    for (i = 0 ; i < globalConfig.urlPatterns.length ; i++) {
        let match = url.match(globalConfig.urlPatterns[i]);

        if (match) {
            urlForComparison = match[0];
            break;
        }
    }

    return urlForComparison;
}

function isIgnoredUrl(url) {
    return !!globalConfig.ignorePatterns.find(function(re) { return re.test(url)});
}

function onStorageChanged() {
    configLoad(function(loadedConfig){
        var f = function(s) { return new RegExp(s)}
        loadedConfig.urlPatterns = loadedConfig.urlPatterns.map(f)
        loadedConfig.ignorePatterns = loadedConfig.ignorePatterns.map(f)
        globalConfig = loadedConfig;
    });
}

chrome.storage.onChanged.addListener(onStorageChanged);
chrome.webNavigation.onCompleted.addListener(onCompleted);
chrome.action.onClicked.addListener(onClicked);
chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === ALARM_NAME) {
        processGlobalQueue();
    }
});
onStorageChanged(); // Force the initial load of config
