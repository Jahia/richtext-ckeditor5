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
    "service.pid=org.jahia.modules.ckeditor5",
    "service.description=Richtext configuration service",
    "service.vendor=Jahia Solutions Group SA"
}, immediate = true)
public class RichtextConfig implements ManagedService {

    private boolean enabledByDefault = false;
    private List<String> include = new ArrayList<>();
    private List<String> exclude = new ArrayList<>();

    public RichtextConfig() {
        super();
    }

    @Override
    public void updated(Dictionary<String, ?> dictionary) throws ConfigurationException {
        enabledByDefault = getBoolean(dictionary, "enabledByDefault");
        include = getList(dictionary, "include");
        exclude = getList(dictionary, "exclude");
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
        obj.put("enabledByDefault", enabledByDefault);
        obj.put("include", new JSONArray(include));
        obj.put("exclude", new JSONArray(exclude));
        return obj;
    }
}
