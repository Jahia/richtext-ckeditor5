package org.jahia.modules.ckeditor.ai.service;

import javax.ws.rs.core.Response;
import java.io.IOException;

/**
 * Handles AI API-specific configuration and connection methods
 */
public interface AIProxyService {

    public static final String PARENT_PID = "org.jahia.modules.richtextCKEditor5.ai";

    boolean isEnabled();

    /**
     * @param requestData the body that the editor sends
     * @param siteKey     the key of the site of the edited content, or {@code null} for content under no site
     */
    Response handleRequest(String requestData, String siteKey) throws InterruptedException, IOException;
}
