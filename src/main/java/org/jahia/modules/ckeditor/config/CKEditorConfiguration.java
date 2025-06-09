package org.jahia.modules.ckeditor.config;

import java.util.List;

public class CKEditorConfiguration {
    private String name;
    private String permission;
    private List<String> siteKeys;

    public CKEditorConfiguration(String name, String permission, List<String> siteKeys) {
        this.name = name;
        this.permission = permission;
        this.siteKeys = siteKeys;
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
}
