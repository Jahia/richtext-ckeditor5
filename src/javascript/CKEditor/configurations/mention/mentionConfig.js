export const mentionConfig = {
    mention: {
        feeds: [
            {
                marker: '##',
                feed: getFeedItems,
                itemRenderer: customItemRenderer
            }
        ]
    }
};

const CACHE_DURATION = 0.5 * 60 * 1000; // 30 seconds in milliseconds
let cachedData = null;
let cacheTimestamp = null;

function getFeedItems(queryText) {
    return new Promise(resolve => {
        try {
            const now = Date.now();

            // Check if we have valid cached data
            if (cachedData && cacheTimestamp && (now - cacheTimestamp) < CACHE_DURATION) {
                // Use cached data
                const filteredItems = filterAndProcessItems(cachedData, queryText);
                resolve(filteredItems);
                return;
            }

            // Fetch fresh data
            const contextPath = (window.contextJsParameters && window.contextJsParameters.contextPath) || '';
            const initializerURL = `${window.location.protocol}//${window.location.host}${contextPath}/cms/initializers`;
            fetch(initializerURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    Accept: 'application/json'
                },
                body: `initializers=choicelistmacros&name=macros&nodeuuid=${window.contextJsParameters.siteUuid}`
            }).then(response => {
                if (response.ok) {
                    return response.json();
                }

                return null;
            }).then(json => {
                if (json === null) {
                    resolve([]);
                } else {
                    // Update cache
                    cachedData = json;
                    cacheTimestamp = Date.now();

                    const filteredItems = filterAndProcessItems(json, queryText);
                    resolve(filteredItems);
                }
            });
        } catch (e) {
            console.error('Failed to call macros initializer', e);
            resolve([]);
        }
    });
}

function filterAndProcessItems(json, queryText) {
    const config = window?.contextJsParameters?.config?.ckeditor5;
    const serverItems = json.map(item => ({
        id: item.value[0],
        name: item.name[0].replace(/##/g, ''),
        text: item.value[0]
    })).filter(item => !config?.excludeMacros?.includes(item.name));

    return serverItems
        .filter(item => {
            const searchString = queryText.toLowerCase();
            return item.name.toLowerCase().includes(searchString);
        })
        .slice(0, 10);
}

function customItemRenderer(item) {
    const itemElement = document.createElement('div');
    itemElement.id = `macros-item-${item.id.replace(/#/g, '')}`;
    itemElement.textContent = `${item.name} `;

    const macroElement = document.createElement('small');
    macroElement.style.cssText = 'color: inherit; font-size: 10px;';
    macroElement.textContent = item.text;

    itemElement.appendChild(macroElement);

    return itemElement;
}
