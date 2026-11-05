import {addNode, createSite, deleteSite} from '@jahia/cypress';

describe('Rich Text CKEditor 5 - edit mode marker', () => {
    const siteKey = 'editModeMarkerSite';
    const listPath = `/sites/${siteKey}/contents/markerList`;
    const names = ['plain-text', 'a"b&c', 'a&copy;b', 'l\'été & co (1)'];
    const expectedPaths = names.map(name => `${listPath}/${name}`).sort();

    before(() => {
        createSite(siteKey);
        addNode({parentPathOrId: `/sites/${siteKey}/contents`, name: 'markerList', primaryNodeType: 'jnt:contentList'});
        names.forEach(name => {
            addNode({
                parentPathOrId: listPath,
                name,
                primaryNodeType: 'jnt:bigText',
                properties: [{name: 'text', value: '<p>body</p>', language: 'en'}]
            });
        });
    });

    after(() => {
        cy.logout();
        deleteSite(siteKey);
    });

    beforeEach(() => {
        cy.login();
    });

    it('Carries the exact node path of each rich text in its edit mode marker', () => {
        cy.request(`/cms/editframe/default/en${encodeURI(listPath)}.html.ajax`).then(response => {
            const doc = new DOMParser().parseFromString(response.body, 'text/html');
            const markers = Array.from(doc.querySelectorAll('jahia[jahiatype="inline"]'));
            expect(markers).to.have.length(names.length);
            markers.forEach(marker => expect(marker.getAttributeNames().sort()).to.deep.equal(['jahiatype', 'path', 'property']));
            expect(markers.map(marker => marker.getAttribute('path')).sort()).to.deep.equal(expectedPaths);
        });
    });
});
