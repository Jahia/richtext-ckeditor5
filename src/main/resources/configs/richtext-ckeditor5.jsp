<%@ page import="org.jahia.modules.ckeditor.config.RichTextConfig"%>
<%@ page import="org.jahia.osgi.BundleUtils"%>
<%@ page language="java" contentType="text/javascript" %>

<%
  response.addHeader("Pragma", "no-cache");
  response.setHeader("Cache-Control", "no-cache");
%>
contextJsParameters.config.ckeditor5 = <%= BundleUtils.getOsgiService(RichTextConfig.class, "(service.pid=org.jahia.modules.richtext_ckeditor5)").toJSON().toString() %>;
