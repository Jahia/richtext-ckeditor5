package org.jahia.modules.ckeditor.ai.service;

import javax.ws.rs.core.Response;
import java.io.IOException;

/**
 * Handles AI API-specific configuration and connection methods
 */
public interface AIProxyService {

    public static final String PARENT_PID = "org.jahia.modules.richtextCKEditor5.ai";

    boolean isEnabled();

    Response handleRequest(String requestData) throws InterruptedException, IOException;
}
