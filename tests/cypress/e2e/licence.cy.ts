import {JContent} from '@jahia/jcontent-cypress/dist/page-object';
import {createSite, deleteSite} from '@jahia/cypress';

describe('Licence tests', () => {
    const siteKey = 'richTextCKEditor5Site';
    let jcontent: JContent;

    before(function () {
        createSite(siteKey);
        cy.loginAndStoreSession(); // Edit in chief
    });

    after(function () {
        cy.logout();
        deleteSite(siteKey);
    });
    beforeEach(() => {
        cy.loginAndStoreSession();
        jcontent = JContent.visit(siteKey, 'en', 'content-folders/contents');
    });

    it('should have licenseKey set to enterprise', () => {
        jcontent.createContent('Rich text');
        cy.window().then(win => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const config = win.jahia.uiExtender.registry.get('@jahia/ckeditor5', 'shared').getDefaultConfig();
            expect(config.licenseKey).to.have.length(100);
        });
    });
});
