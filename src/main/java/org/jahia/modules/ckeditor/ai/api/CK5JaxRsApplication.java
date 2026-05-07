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
package org.jahia.modules.ckeditor.ai.api;

import org.glassfish.jersey.server.ResourceConfig;
import org.json.JSONObject;

import javax.ws.rs.GET;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.ws.rs.core.MediaType;
import javax.ws.rs.core.Response;

@Path("/ckeditor5")
@Produces(MediaType.APPLICATION_JSON)
public class CK5JaxRsApplication extends ResourceConfig {

    public CK5JaxRsApplication() {
        super(CK5JaxRsApplication.class);
    }

    @GET
    public Response hello() {
        return Response.status(Response.Status.OK)
                .entity(new JSONObject().put("message", "Hello from CK5 module!").toString())
                .build();
    }

    @Path(AIProxy.MAPPING)
    public Class<AIProxy> getAIProxySubResource() {
        return AIProxy.class;
    }
}
