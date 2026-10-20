/*
 * Copyright (C) 2002-2025 Jahia Solutions Group SA. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package org.jahia.modules.ckeditor;

import net.htmlparser.jericho.Element;
import net.htmlparser.jericho.OutputDocument;
import net.htmlparser.jericho.Source;
import org.apache.commons.lang3.StringEscapeUtils;
import org.jahia.services.content.JCRNodeWrapper;
import org.jahia.services.content.JCRTemplate;
import org.jahia.services.render.RenderContext;
import org.jahia.services.render.RenderException;
import org.jahia.services.render.RenderService;
import org.jahia.services.render.Resource;
import org.jahia.services.render.filter.AbstractFilter;
import org.jahia.services.render.filter.RenderChain;
import org.jahia.services.render.filter.RenderFilter;
import org.jahia.utils.i18n.Messages;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.jcr.AccessDeniedException;
import javax.jcr.ItemNotFoundException;
import javax.jcr.RepositoryException;
import javax.servlet.http.HttpServletRequest;
import java.io.Serializable;
import java.util.ArrayDeque;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.Deque;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import java.util.regex.Pattern;

/**
 * Expands the content references of a rich text into the rendered output of the referenced node
 */
@Component(service = RenderFilter.class, immediate = true)
public class ContentReferenceFilter extends AbstractFilter {
    private static final Logger logger = LoggerFactory.getLogger(ContentReferenceFilter.class);

    public static final String MARKER_CLASS = "jahia-content-reference";
    public static final String RENDERED_CLASS = "jahia-content-reference-rendered";
    public static final String MISSING_CLASS = "jahia-content-reference-missing";
    public static final String REF_ATTRIBUTE = "data-jahia-ref";
    public static final String VIEW_ATTRIBUTE = "data-jahia-view";

    private static final Pattern UUID_PATTERN = Pattern.compile("^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$");
    private static final Pattern VIEW_PATTERN = Pattern.compile("^[A-Za-z0-9][A-Za-z0-9_.-]{0,63}$");
    private static final Pattern WHITESPACE = Pattern.compile("\\s+");
    private static final List<String> REFUSED_TYPES = Arrays.asList("jnt:page", "jnt:contentFolder", "jnt:folder", "jnt:virtualsite", "jnt:contentList");
    private static final List<String> SAVED_ATTRIBUTES = Arrays.asList("inWrapper", "currentNode", "currentResource", "moduleMap");

    private static final String STACK_ATTRIBUTE = "org.jahia.modules.ckeditor.contentReference.stack";
    private static final String RENDERS_ATTRIBUTE = "org.jahia.modules.ckeditor.contentReference.renders";
    private static final String ANCESTORS_PARAM = "contentReferenceAncestors";
    private static final String BUNDLE = "resources.richtext-ckeditor5";
    private static final String MISSING_KEY = "richtext-ckeditor5.contentReference.missing";
    private static final String LOOP_KEY = "richtext-ckeditor5.contentReference.loop";
    private static final String MISSING_DEFAULT = "Referenced content not found or not accessible";
    private static final String LOOP_DEFAULT = "Referenced content not rendered: it references itself, is nested too deeply, or the page holds too many references";
    private static final int MAX_DEPTH = 5;
    private static final int MAX_REFERENCES = 20;
    private static final int MAX_RENDERS = 100;

    public static boolean isValidUuid(String uuid) {
        return uuid != null && UUID_PATTERN.matcher(uuid).matches();
    }

    public static boolean isValidView(String view) {
        return view != null && VIEW_PATTERN.matcher(view).matches();
    }

    @Activate
    public void onActivate() {
        setPriority(50f);
        setApplyOnTemplateTypes("html,html-.+");
        setSkipOnConfigurations("wrapper,option");
    }

    @Override
    public String execute(String previousOut, RenderContext renderContext, Resource resource, RenderChain chain) throws Exception {
        if (previousOut == null || !previousOut.contains(REF_ATTRIBUTE)) {
            return previousOut;
        }

        Deque<String> stack = getStack(renderContext.getRequest());
        int depth = stack.size();
        Serializable ancestors = resource.getModuleParams().get(ANCESTORS_PARAM);
        if (stack.isEmpty() && ancestors instanceof String && !((String) ancestors).isEmpty()) {
            for (String ancestor : ((String) ancestors).split(",")) {
                stack.push(ancestor);
            }
        }
        String identifier = resource.getNode().getIdentifier();
        if (!identifier.equals(stack.peek())) {
            stack.push(identifier);
        }
        try {
            Source source = new Source(previousOut);
            source.setLogger(null);
            OutputDocument output = new OutputDocument(source);
            Map<String, String> rendered = new HashMap<>();
            int count = 0;
            int lastEnd = -1;
            for (Element element : source.getAllElements("div")) {
                String uuid = element.getAttributeValue(REF_ATTRIBUTE);
                if (element.getBegin() < lastEnd || !hasMarkerClass(element) || !isValidUuid(uuid)) {
                    continue;
                }
                lastEnd = element.getEnd();
                count++;
                String view = element.getAttributeValue(VIEW_ATTRIBUTE);
                String replacement = count > MAX_REFERENCES
                        ? notice(renderContext, MISSING_KEY, MISSING_DEFAULT)
                        : rendered.computeIfAbsent(uuid + "|" + view, k -> renderReference(uuid, view, stack, renderContext, resource));
                output.replace(element, replacement);
            }
            return output.toString();
        } finally {
            while (stack.size() > depth) {
                stack.pop();
            }
        }
    }

    private String renderReference(String uuid, String view, Deque<String> stack, RenderContext renderContext, Resource resource) {
        if (stack.contains(uuid) || stack.size() >= MAX_DEPTH || getRenders(renderContext.getRequest()).incrementAndGet() > MAX_RENDERS) {
            return notice(renderContext, LOOP_KEY, LOOP_DEFAULT);
        }
        try {
            JCRNodeWrapper ref;
            try {
                ref = resource.getNode().getSession().getNodeByIdentifier(uuid);
            } catch (ItemNotFoundException | AccessDeniedException e) {
                if (renderContext.isLiveMode()) {
                    addMissingDependency(uuid, resource);
                }
                return notice(renderContext, MISSING_KEY, MISSING_DEFAULT);
            }
            if (isRefused(ref)) {
                return notice(renderContext, MISSING_KEY, MISSING_DEFAULT);
            }
            resource.getDependencies().add(ref.getCanonicalPath());

            String template = isValidView(view) && RenderService.getInstance().hasView(ref, view, "html", renderContext) ? view : null;
            return "<div class=\"" + RENDERED_CLASS + "\">" + render(ref, template, uuid, stack, renderContext) + "</div>";
        } catch (RenderException | RepositoryException | RuntimeException e) {
            logger.warn("Unable to render content reference {} in {}", uuid, resource.getNode().getPath(), e);
            return notice(renderContext, MISSING_KEY, MISSING_DEFAULT);
        }
    }

    private static String render(JCRNodeWrapper ref, String template, String uuid, Deque<String> stack, RenderContext renderContext) throws RenderException {
        HttpServletRequest request = renderContext.getRequest();
        Map<String, Object> saved = new HashMap<>();
        for (String name : SAVED_ATTRIBUTES) {
            saved.put(name, request.getAttribute(name));
        }
        if (renderContext.isEditMode()) {
            request.setAttribute("inWrapper", Boolean.TRUE);
        }
        List<String> ancestors = new ArrayList<>(stack);
        Collections.reverse(ancestors);
        Resource nested = new Resource(ref, "html", template, Resource.CONFIGURATION_MODULE);
        nested.getModuleParams().put(ANCESTORS_PARAM, String.join(",", ancestors));
        stack.push(uuid);
        try {
            return RenderService.getInstance().render(nested, renderContext);
        } finally {
            stack.pop();
            for (Map.Entry<String, Object> entry : saved.entrySet()) {
                if (entry.getValue() == null) {
                    request.removeAttribute(entry.getKey());
                } else {
                    request.setAttribute(entry.getKey(), entry.getValue());
                }
            }
        }
    }

    private static void addMissingDependency(String uuid, Resource resource) {
        try {
            String path = JCRTemplate.getInstance().doExecuteWithSystemSession(null, "default", session -> {
                try {
                    return session.getNodeByIdentifier(uuid).getCanonicalPath();
                } catch (ItemNotFoundException e) {
                    return null;
                }
            });
            if (path != null) {
                resource.getDependencies().add(path);
            }
        } catch (RepositoryException e) {
            logger.debug("Unable to resolve content reference {} in the default workspace", uuid, e);
        }
    }

    private static String notice(RenderContext renderContext, String key, String defaultValue) {
        if (renderContext.isLiveMode()) {
            return "";
        }
        String text = Messages.get(BUNDLE, key, renderContext.isEditMode() ? renderContext.getUILocale() : renderContext.getMainResourceLocale(), defaultValue);
        return "<div class=\"" + RENDERED_CLASS + " " + MISSING_CLASS + "\">" + StringEscapeUtils.escapeHtml4(text) + "</div>";
    }

    private static boolean isRefused(JCRNodeWrapper ref) throws RepositoryException {
        for (String type : REFUSED_TYPES) {
            if (ref.isNodeType(type)) {
                return true;
            }
        }
        return false;
    }

    private static boolean hasMarkerClass(Element element) {
        String classes = element.getAttributeValue("class");
        return classes != null && Arrays.asList(WHITESPACE.split(classes.trim())).contains(MARKER_CLASS);
    }

    @SuppressWarnings("unchecked")
    private static Deque<String> getStack(HttpServletRequest request) {
        Object stack = request.getAttribute(STACK_ATTRIBUTE);
        if (stack instanceof Deque) {
            return (Deque<String>) stack;
        }
        Deque<String> newStack = new ArrayDeque<>();
        request.setAttribute(STACK_ATTRIBUTE, newStack);
        return newStack;
    }

    private static AtomicInteger getRenders(HttpServletRequest request) {
        Object renders = request.getAttribute(RENDERS_ATTRIBUTE);
        if (renders instanceof AtomicInteger) {
            return (AtomicInteger) renders;
        }
        AtomicInteger newRenders = new AtomicInteger();
        request.setAttribute(RENDERS_ATTRIBUTE, newRenders);
        return newRenders;
    }
}
