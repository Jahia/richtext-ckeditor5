import org.jahia.osgi.BundleUtils
import org.jahia.services.modulemanager.spi.ConfigService
import org.jahia.services.modulemanager.spi.Config

log.info("Tests: setting org.jahia.modules.richtextCKEditor5 enabledByDefault=true")

ConfigService configService = BundleUtils.getOsgiService(ConfigService.class, null)
if (configService != null) {
    Config config = configService.getConfig("org.jahia.modules.richtextCKEditor5")
    config.getValues().setProperty("enabledByDefault", "true")
    configService.storeConfig(config)
}
