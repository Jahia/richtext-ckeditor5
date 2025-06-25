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
                // New configuration
                Config config = configService.getConfig("org.jahia.modules.richtextCKEditor5");
                config.setFormat("YAML");
                PropertiesValues values = config.getValues();
                values.setProperty("enabledByDefault", "true");
                def list = values.getList("excludeSites");
                def excludeSites = siteService.getSitesNodeList(jcrSessionWrapper)
                        .stream()
                        .filter(n -> !"systemsite".equals(n.getSiteKey()))
                        .map {n -> n.getSiteKey()}.collect(Collectors.toList());

                // Old configuration, will not be used anymore
                Config oldConfig = configService.getConfig("org.jahia.modules.richtext_ckeditor5");

                if (oldConfig != null) {
                    PropertiesValues oldValues = oldConfig.getValues();
                    String exSites = oldValues.getProperty("excludeSites");

                    if (exSites != null) {
                        excludeSites.addAll(exSites.split(",").toList());
                    }

                    // If user set includeSites then migrate that property to new config
                    String incSites = oldValues.getProperty("includeSites");
                    if (incSites != null) {
                        def incList = values.getList("includeSites");
                        incSites.split(",").toList().forEach {site -> incList.addProperty(site)}
                    }
                }

                log.info("Adding existing sites to exclude list: " + excludeSites);
                excludeSites.forEach {key -> list.addProperty(key)}
                configService.storeConfig(config);
            }
            return null;
        }
    });
}
