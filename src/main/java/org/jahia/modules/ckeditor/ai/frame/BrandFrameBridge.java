package org.jahia.modules.ckeditor.ai.frame;

import org.jahia.modules.aiassistant.frame.api.BrandFrameService;
import org.jahia.modules.aiassistant.frame.api.FrameContext;
import org.jahia.modules.aiassistant.frame.api.FrameRequest;
import org.osgi.service.component.annotations.Component;
import org.osgi.service.component.annotations.Reference;

/**
 * The bridge to the brand frame of the module ai-assistant. Its reference is mandatory, so it starts only when that
 * module runs. This class is the only one of the module that imports the frame API of ai-assistant.
 */
@Component(service = BrandFrame.class, immediate = true)
public class BrandFrameBridge implements BrandFrame {

    /** A command of the editor works on a selection, so the frame stays smaller than in the chat. */
    static final int FRAME_TOKENS = 2000;

    @Reference
    private BrandFrameService frames;

    @Override
    public String instructionsFor(String siteKey, String language, String text) {
        FrameContext context = frames.buildContext(new FrameRequest(siteKey, language, null, FRAME_TOKENS, text));
        return context.isEmpty() ? "" : context.text();
    }
}
