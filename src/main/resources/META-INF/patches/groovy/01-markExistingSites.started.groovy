import org.jahia.osgi.BundleUtils;
import org.jahia.services.modulemanager.spi.ConfigService;
import org.jahia.services.modulemanager.spi.Config;
import org.jahia.services.modulemanager.util.PropertiesValues;
import org.jahia.services.content.JCRCallback
import org.jahia.services.content.JCRSessionWrapper
import org.jahia.services.content.JCRTemplate
import org.jahia.services.sites.JahiaSitesService

import javax.jcr.RepositoryException
import java.util.stream.Collectors

/**
 * Adds existing site keys to exclude property of org.jahia.modules.ckeditor5 config file
 */

log.info("Add existing sites to exclude list so they use CKEditor 4");

excludeExistingSites();


void excludeExistingSites() {
    JCRTemplate.getInstance().doExecuteWithSystemSession(new JCRCallback<Void>() {
        @Override
        Void doInJCR(JCRSessionWrapper jcrSessionWrapper) throws RepositoryException {
            def siteService = JahiaSitesService.getInstance();
            ConfigService configService = BundleUtils.getOsgiService(ConfigService.class, null);
            if (configService != null) {
                Config config = configService.getConfig("org.jahia.modules.ckeditor5");
                PropertiesValues values = config.getValues();
                values.setProperty("enabledByDefault", "true");
                values.setProperty("exclude", siteService.getSitesNodeList(jcrSessionWrapper)
                        .stream()
                        .filter(n -> !"systemsite".equals(n.getSiteKey()))
                        .map {n -> n.getSiteKey()}.collect(Collectors.joining(","))
                );
                configService.storeConfig(config);
            }
            return null
        }
    });
}
