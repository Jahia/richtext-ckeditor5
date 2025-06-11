package org.jahia.modules.ckeditor.config;

import org.apache.commons.lang3.StringUtils;
import org.jahia.services.modulemanager.util.PropertiesList;
import org.jahia.services.modulemanager.util.PropertiesManager;
import org.jahia.services.modulemanager.util.PropertiesValues;
import org.json.JSONArray;
import org.json.JSONObject;
import org.osgi.service.cm.ConfigurationException;
import org.osgi.service.cm.ManagedService;
import org.osgi.service.component.annotations.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.*;
import java.util.stream.Collectors;

@Component(service = {ManagedService.class, RichTextConfig.class}, property = {
    "service.pid=org.jahia.modules.richtext_ckeditor5",
    "service.description=Richtext configuration service",
    "service.vendor=Jahia Solutions Group SA"
}, immediate = true)
public class RichTextConfig implements ManagedService {

    private final static String INCLUDE_SITES = "includeSites";
    private final static String EXCLUDE_SITES = "excludeSites";
    private final static String ENABLED_BY_DEFAULT = "enabledByDefault";
    private final static String CONFIG_TYPE = "configType";

    private boolean enabledByDefault = true;
    private List<String> includeSites = new ArrayList<>();
    private List<String> excludeSites = new ArrayList<>();
    private List<CKEditorConfiguration> configs = new ArrayList<>();
    private String configType = "complete";

    private static final Logger logger = LoggerFactory.getLogger(RichTextConfig.class);

    public RichTextConfig() {
        super();
    }

    @Override
    public void updated(Dictionary<String, ?> dictionary) throws ConfigurationException {
        if (dictionary != null) {
            PropertiesManager pm = new PropertiesManager(ConfigUtil.getMap(dictionary));
            PropertiesValues values = pm.getValues();

            configs = processConfigs(values.getList("configs"));
            includeSites = getListOfStrings(values.getList(INCLUDE_SITES));
            excludeSites = getListOfStrings(values.getList(EXCLUDE_SITES));

            enabledByDefault = getBoolean(dictionary, ENABLED_BY_DEFAULT);
            configType = (dictionary.get(CONFIG_TYPE) != null)
                    ? dictionary.get(CONFIG_TYPE).toString() : "complete";
            logger.debug("Richtext configuration updated: enabledByDefault={}, includeSites={}, excludeSites={}, configType={}",
                    enabledByDefault, StringUtils.join(includeSites, ','), StringUtils.join(excludeSites, ','), configType);
        }
    }

    public List<CKEditorConfiguration> getConfigs() {
        return configs;
    }

    private boolean getBoolean(Dictionary<String, ?> properties, String key) {
        if (properties != null && properties.get(key) != null) {
            Object val = properties.get(key);
            if (val instanceof Boolean) {
                return (Boolean) val;
            } else if (val != null) {
                return Boolean.parseBoolean(val.toString());
            }
            logger.debug("Property {} is null", key);
        } else {
            logger.debug("Property {} not found in dictionary", key);
        }
        return false;
    }

    public JSONObject toJSON() {
        JSONObject obj = new JSONObject();
        obj.put(ENABLED_BY_DEFAULT, enabledByDefault);
        obj.put(INCLUDE_SITES, new JSONArray(includeSites));
        obj.put(EXCLUDE_SITES, new JSONArray(excludeSites));
        obj.put(CONFIG_TYPE, configType);
        return obj;
    }

    private List<CKEditorConfiguration> processConfigs(PropertiesList list) {
        List<CKEditorConfiguration> configs = new ArrayList<>();

        int size = list.getSize();
        for (int i = 0; i < size; i++) {
            PropertiesValues values = list.getValues(i);

            if (values.getProperty("name") != null) {
                configs.add(new CKEditorConfiguration(
                        values.getProperty("name"),
                        values.getProperty("permission"),
                        getListOfStrings(values.getList("siteKeys")))
                );
            }
        }

        return configs;
    }

    private List<String> getListOfStrings(PropertiesList list) {
        return list.getStructuredList().stream().map(obj -> Objects.toString(obj, null)).collect(Collectors.toList());
    }
}
