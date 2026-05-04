package org.jahia.modules.ckeditor.config;

import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Dictionary;
import java.util.Enumeration;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

public class ConfigUtil {

    private static final Logger logger = LoggerFactory.getLogger(ConfigUtil.class);

    private ConfigUtil() {
    }

    public static Map<String, String> getMap(Dictionary<String, ?> d) {
        Map<String, String> m = new HashMap<>();
        if (d != null) {
            Enumeration<String> en = d.keys();
            while (en.hasMoreElements()) {
                String key = en.nextElement();
                if (!key.startsWith("felix.") && !key.startsWith("service.")) {
                    m.put(key, d.get(key).toString());
                }
            }
        }
        return m;
    }

    public static String getString(Map<String, ?> props, String key, String defaultValue) {
        Object value = props.get(key);
        return value != null ? value.toString() : defaultValue;
    }

    public static boolean getBoolean(Map<String, ?> props, String key, boolean defaultValue) {
        Object value = props.get(key);
        if (value == null) {
            return defaultValue;
        }
        return Boolean.parseBoolean(value.toString());
    }
}
