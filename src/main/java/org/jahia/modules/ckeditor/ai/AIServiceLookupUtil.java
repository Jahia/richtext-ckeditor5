/*
 * ==========================================================================================
 * =                            JAHIA'S ENTERPRISE DISTRIBUTION                             =
 * ==========================================================================================
 *
 *                                  http://www.jahia.com
 *
 * JAHIA'S ENTERPRISE DISTRIBUTIONS LICENSING - IMPORTANT INFORMATION
 * ==========================================================================================
 *
 *     Copyright (C) 2002-2026 Jahia Solutions Group. All rights reserved.
 *
 *     This file is part of a Jahia's Enterprise Distribution.
 *
 *     Jahia's Enterprise Distributions must be used in accordance with the terms
 *     contained in the Jahia Solutions Group Terms &amp; Conditions as well as
 *     the Jahia Sustainable Enterprise License (JSEL).
 *
 *     For questions regarding licensing, support, production usage...
 *     please contact our team at sales@jahia.com or go to http://www.jahia.com/license.
 *
 * ==========================================================================================
 */
package org.jahia.modules.ckeditor.ai;

import org.apache.commons.lang3.StringUtils;
import org.osgi.framework.BundleContext;
import org.osgi.framework.InvalidSyntaxException;
import org.osgi.framework.ServiceReference;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.util.Collection;

@Component(service = AIServiceLookupUtil.class, immediate = true)
public class AIServiceLookupUtil {

    private static final Logger logger = LoggerFactory.getLogger(AIServiceLookupUtil.class);
    private BundleContext bundleContext;

    @Activate
    public void activate(BundleContext bundleContext) {
        this.bundleContext = bundleContext;
        logger.info("AIServiceLookupUtil activated");
    }

    public AIProxyService getAIProxyService(String apiType) {
        if (StringUtils.isEmpty(apiType)) {
            logger.warn("API type is empty, cannot lookup AI proxy service");
            return null;
        }

        String filter = String.format("(aiType=%s)", apiType);
        logger.debug("Looking up AI proxy service with filter: {}", filter);

        try {
            Collection<ServiceReference<AIProxyService>> refs =
                    bundleContext.getServiceReferences(AIProxyService.class, filter);

            if (refs == null || refs.isEmpty()) {
                logger.warn("No AI proxy service found for apiType '{}'", apiType);
                // List all available AIProxyService instances for debugging
//                Collection<ServiceReference<AIProxyService>> allRefs =
//                        bundleContext.getServiceReferences(AIProxyService.class, null);
//                if (allRefs != null && !allRefs.isEmpty()) {
//                    logger.info("Available AI proxy services:");
//                    for (ServiceReference<AIProxyService> ref : allRefs) {
//                        logger.info("  - service.pid: {}, component.name: {}",
//                                ref.getProperty("service.pid"),
//                                ref.getProperty("component.name"));
//                    }
//                } else {
//                    logger.warn("No AI proxy services registered at all");
//                }
                return null;
            }

            ServiceReference<AIProxyService> ref = refs.iterator().next();
            logger.debug("Found AI proxy service: aiType={}", ref.getProperty("aiType"));
            return bundleContext.getService(ref);

        } catch (InvalidSyntaxException e) {
            logger.error("Unable to fetch AIProxyService. Invalid filter syntax: {}", filter, e);
        }
        return null;
    }

}
