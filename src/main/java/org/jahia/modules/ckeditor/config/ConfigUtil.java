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

    public static double getDouble(Map<String, ?> props, String key, double defaultValue) {
        Object value = props.get(key);
        if (value == null) {
            return defaultValue;
        }
        try {
            return Double.parseDouble(value.toString());
        } catch (NumberFormatException e) {
            return defaultValue;
        }
    }

    public static JSONObject getJSON(Map<String, String> props, String key, JSONObject defaultValue) {
        if (props == null) {
            return defaultValue;
        }

        try {
            String prefix = key + ".";
            Map<String, String> filteredProps = props.entrySet().stream()
                    .filter(entry -> entry.getKey().startsWith(prefix))
                    .collect(Collectors.toMap(
                            entry -> entry.getKey().substring(prefix.length()),
                            Map.Entry::getValue
                    ));

            if (filteredProps.isEmpty()) {
                return defaultValue;
            }

            JSONObject result = convertMapToJSON(filteredProps);
            if (!result.isEmpty()) {
                return result;
            }

            return defaultValue;
        } catch (Exception e) {
            logger.error("Invalid YAML object in configuration key '{}', using default value", key, e);
            return defaultValue;
        }
    }

    private static JSONObject convertMapToJSON(Map<String, ?> map) {
        JSONObject json = new JSONObject();
        for (Map.Entry<?, ?> entry : map.entrySet()) {
            String key = entry.getKey().toString();
            Object value = entry.getValue();

            if (value instanceof Map) {
                json.put(key, convertMapToJSON((Map<String, ?>) value));
            } else if (value instanceof java.util.List) {
                json.put(key, convertListToJSONArray((java.util.List<?>) value));
            } else if (value instanceof Number) {
                json.put(key, value);
            } else if (value instanceof Boolean) {
                json.put(key, value);
            } else if (value == null) {
                json.put(key, JSONObject.NULL);
            } else {
                json.put(key, value.toString());
            }
        }
        return json;
    }

    private static org.json.JSONArray convertListToJSONArray(java.util.List<?> list) {
        org.json.JSONArray array = new org.json.JSONArray();
        for (Object item : list) {
            if (item instanceof Map) {
                array.put(convertMapToJSON((Map<String, ?>) item));
            } else if (item instanceof java.util.List) {
                array.put(convertListToJSONArray((java.util.List<?>) item));
            } else if (item instanceof Number) {
                array.put(item);
            } else if (item instanceof Boolean) {
                array.put(item);
            } else if (item == null) {
                array.put(JSONObject.NULL);
            } else {
                array.put(item.toString());
            }
        }
        return array;
    }
}
