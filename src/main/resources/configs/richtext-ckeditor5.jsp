<%@ page import="org.jahia.modules.ckeditor.config.RichtextConfig"%>
<%@ page import="org.jahia.osgi.BundleUtils"%>
<%@ page language="java" contentType="text/javascript" %>

contextJsParameters.config.ckeditor5 = <%= BundleUtils.getOsgiService(RichtextConfig.class, "(service.pid=org.jahia.modules.richtext_ckeditor5)").toJSON().toString() %>;
