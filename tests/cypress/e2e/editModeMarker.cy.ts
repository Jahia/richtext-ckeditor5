import {addNode, createSite, deleteSite} from '@jahia/cypress';
import gql from 'graphql-tag';

describe('Rich Text CKEditor 5 - edit mode marker', () => {
    const siteKey = 'editModeMarkerSite';
    const listPath = `/sites/${siteKey}/contents/markerList`;
    const names = ['plain-text', 'a"b&c', 'l\'été & co (1)'];

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
        cy.apollo({
            query: gql`
                query ($path: String!) {
                    jcr {
                        nodeByPath(path: $path) {
                            children {
                                nodes {
                                    path
                                }
                            }
                        }
                    }
                }
            `,
            variables: {path: listPath}
        })
            .its('data.jcr.nodeByPath.children.nodes')
            .then((nodes: {path: string}[]) => nodes.map(node => node.path).sort())
            .as('storedPaths');

        cy.request(`/cms/editframe/default/en${encodeURI(listPath)}.html.ajax`)
            .its('body')
            .then((body: string) => Array.from(new DOMParser().parseFromString(body, 'text/html').querySelectorAll('jahia[jahiatype="inline"]')))
            .as('markers');

        cy.get<Element[]>('@markers').should('have.length', names.length);
        cy.get<Element[]>('@markers').each(marker => {
            expect(marker.getAttributeNames().sort()).to.deep.equal(['jahiatype', 'path', 'property']);
        });
        cy.get<Element[]>('@markers')
            .then(markers => markers.map(marker => marker.getAttribute('path')).sort())
            .as('markerPaths');
        cy.get<string[]>('@storedPaths').then(storedPaths => {
            cy.get('@markerPaths').should('deep.equal', storedPaths);
        });
    });
});
