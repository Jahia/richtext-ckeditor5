package org.jahia.modules.ckeditor.config;

import org.json.JSONArray;
import org.json.JSONObject;
import org.osgi.service.cm.ConfigurationException;
import org.osgi.service.cm.ManagedService;
import org.osgi.service.component.annotations.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Dictionary;
import java.util.List;

@Component(service = {ManagedService.class, RichtextConfig.class}, property = {
    "service.pid=org.jahia.modules.richtext_ckeditor5",
    "service.description=Richtext configuration service",
    "service.vendor=Jahia Solutions Group SA"
}, immediate = true)
public class RichtextConfig implements ManagedService {

    private final static String INCLUDE_SITES = "includeSites";
    private final static String EXCLUDE_SITES = "excludeSites";
    private final static String ENABLED_BY_DEFAULT = "enabledByDefault";
    private final static String CONFIG_TYPE = "configType";

    private boolean enabledByDefault = false;
    private List<String> includeSites = new ArrayList<>();
    private List<String> excludeSites = new ArrayList<>();
    private String configType = "complete";

    public RichtextConfig() {
        super();
    }

    @Override
    public void updated(Dictionary<String, ?> dictionary) throws ConfigurationException {
        enabledByDefault = getBoolean(dictionary, ENABLED_BY_DEFAULT);
        includeSites = getList(dictionary, INCLUDE_SITES);
        excludeSites = getList(dictionary, EXCLUDE_SITES);
        configType = (dictionary != null && dictionary.get(CONFIG_TYPE) != null)
                ? dictionary.get(CONFIG_TYPE).toString() : "complete";
    }

    private boolean getBoolean(Dictionary<String, ?> properties, String key) {
        if (properties != null && properties.get(key) != null) {
            Object val = properties.get(key);
            if (val instanceof Boolean) {
                return (Boolean) val;
            } else if (val != null) {
                return Boolean.parseBoolean(val.toString());
            }
        }
        return false;
    }

    private List<String> getList(Dictionary<String, ?> properties, String key) {
        List<String> l = new ArrayList<>();

        if (properties != null && properties.get(key) != null) {
            Object val = properties.get(key);

            if (val instanceof String) {
                return Arrays.asList(((String) val).split(","));
            }
        }

        return l;
    }

    public JSONObject toJSON() {
        JSONObject obj = new JSONObject();
        obj.put(ENABLED_BY_DEFAULT, enabledByDefault);
        obj.put(INCLUDE_SITES, new JSONArray(includeSites));
        obj.put(EXCLUDE_SITES, new JSONArray(excludeSites));
        obj.put(CONFIG_TYPE, configType);
        return obj;
    }
}
