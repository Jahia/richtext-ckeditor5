import org.jahia.services.content.JCRCallback
import org.jahia.services.content.JCRSessionWrapper
import org.jahia.services.content.JCRTemplate
import org.jahia.services.content.decorator.JCRSiteNode
import org.jahia.services.sites.JahiaSitesService

import javax.jcr.RepositoryException

/**
 * Adds mixin to existing sites to indicate that usage of CKEditor 4 should be supported by default. Optionally, the user
 * can disable CKEditor 4 and use CKEditor 5
 */
log.info("Mark existing sites with mixin to use CKEditor 4");
addMixin();


void addMixin() {
    JCRTemplate.getInstance().doExecuteWithSystemSession(new JCRCallback<Void>() {
        @Override
        Void doInJCR(JCRSessionWrapper jcrSessionWrapper) throws RepositoryException {
            def siteService = JahiaSitesService.getInstance();
            siteService.getSitesNodeList(jcrSessionWrapper).forEach { JCRSiteNode siteNode -> siteNode.addMixin("rtmix:ckEditorVersionSelector")}
            jcrSessionWrapper.save();
            return null
        }
    });
}
