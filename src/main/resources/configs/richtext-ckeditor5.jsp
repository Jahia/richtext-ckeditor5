<%@ page import="org.jahia.modules.ckeditor.config.RichTextConfig"%>
<%@ page import="org.jahia.modules.ckeditor.ai.service.AIServiceLookupUtil"%>
<%@ page import="org.jahia.osgi.BundleUtils"%>
<%@ page language="java" contentType="text/javascript" %>

<%
  response.addHeader("Pragma", "no-cache");
  response.setHeader("Cache-Control", "no-cache");

  RichTextConfig richtextConfig = BundleUtils.getOsgiService(RichTextConfig.class, "(service.pid=org.jahia.modules.richtextCKEditor5)");
  AIServiceLookupUtil lookup = BundleUtils.getOsgiService(AIServiceLookupUtil.class, null);
  boolean aiEnabled = lookup != null && lookup.isAIEnabled();
%>
contextJsParameters.config.ckeditor5 = <%= richtextConfig.toJSON().toString() %>;
contextJsParameters.config.ckeditor5.aiEnabled = <%= aiEnabled %>;
