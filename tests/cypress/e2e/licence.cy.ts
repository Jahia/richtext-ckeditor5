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

    it('should not load productivity licence given that it is absent', () => {
        cy.window().then(win => {
            jcontent.createContent('Rich text');
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            const config = win.jahia.uiExtender.registry.get('@jahia/ckeditor5', 'shared').getDefaultConfig();
            expect(config.licenseKey).to.equal('CKEDITOR_COMMUNITY');
        });
    });
});
