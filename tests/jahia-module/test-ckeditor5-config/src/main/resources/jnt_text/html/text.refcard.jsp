<%@ page language="java" contentType="text/html;charset=UTF-8" %>
<%@ taglib prefix="fn" uri="http://java.sun.com/jsp/jstl/functions" %>
<%--@elvariable id="currentNode" type="org.jahia.services.content.JCRNodeWrapper"--%>
<div class="test-refcard">${fn:escapeXml(currentNode.properties.text.string)}</div>
