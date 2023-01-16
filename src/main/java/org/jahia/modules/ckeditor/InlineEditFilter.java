package org.jahia.modules.ckeditor;

import org.jahia.services.render.RenderContext;
import org.jahia.services.render.Resource;
import org.jahia.services.render.filter.AbstractFilter;
import org.jahia.services.render.filter.RenderChain;
import org.jahia.services.render.filter.RenderFilter;
import org.osgi.service.component.annotations.Activate;
import org.osgi.service.component.annotations.Component;

/**
 * Temporary filter on richtext to test inline editing
 */
@Component(service = RenderFilter.class, immediate = true)
public class InlineEditFilter extends AbstractFilter {

    @Activate
    public void onActivate() {
        setApplyOnNodeTypes("jnt:bigText");
        setApplyOnEditMode(true);
    }

    @Override
    public String execute(String previousOut, RenderContext renderContext, Resource resource, RenderChain chain) throws Exception {
        return "<jahia path=\"" + resource.getNode().getPath() + "\" property=\"text\" jahiatype=\"inline\">" + super.execute(previousOut, renderContext, resource, chain) + "</jahia>";
    }
}
