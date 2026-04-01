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

const items = [
    {id: '##authorname', name: 'Author name', text: '##authorname##'},
    {id: '##creationdate', name: 'Creation date', text: '##creationdate##'},
    {id: '##keywords', name: 'Keywords', text: '##keywords##'},
    {id: '##linktohomepage', name: 'Link to home page', text: '##linktohomepage##'},
    {id: '##linktoparent', name: 'Link to parent', text: '##linktoparent##'},
    {id: '##requestParameters', name: 'Request parameters', text: '##requestParameters##'},
    {id: '##resourceBundle', name: 'Resource bundle', text: '##resourceBundle(bundleName, key)##'},
    {id: '##username', name: 'User name', text: '##username##'}
];

function getFeedItems(queryText) {
    return new Promise(resolve => {
        // This simulates a request
        setTimeout(() => {
            const itemsToDisplay = items
                .filter(isItemMatching)
                .slice(0, 10);

            resolve(itemsToDisplay);
        }, 100);
    });

    function isItemMatching(item) {
        const searchString = queryText.toLowerCase();
        return (
            item.name.toLowerCase().includes(searchString) ||
            item.id.toLowerCase().includes(searchString)
        );
    }
}

function customItemRenderer(item) {
    const itemElement = document.createElement('div');
    itemElement.id = `macros-item-${item.id}`;
    itemElement.textContent = `${item.name} `;

    const macroElement = document.createElement('small');
    macroElement.style.cssText = 'color: inherit; font-size: 10px;';
    macroElement.textContent = item.text;

    itemElement.appendChild(macroElement);

    return itemElement;
}
