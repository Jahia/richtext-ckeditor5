package org.jahia.modules.ckeditor.config;

import java.util.List;

public class CKEditorConfiguration {
    private String name;
    private String permission;
    private List<String> siteKeys;
    private List<String> excludeToolbarItems;

    public CKEditorConfiguration(String name, String permission, List<String> siteKeys, List<String> excludeToolbarItems) {
        this.name = name;
        this.permission = permission;
        this.siteKeys = siteKeys;
        this.excludeToolbarItems = excludeToolbarItems;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPermission() {
        return permission;
    }

    public void setPermission(String permission) {
        this.permission = permission;
    }

    public List<String> getSiteKeys() {
        return siteKeys;
    }

    public void setSiteKeys(List<String> siteKeys) {
        this.siteKeys = siteKeys;
    }

    public List<String> getExcludeToolbarItems() {
        return excludeToolbarItems;
    }
}
