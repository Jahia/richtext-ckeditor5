package org.jahia.modules.ckeditor.ai.frame;

/**
 * The brand frame of a site (voice, readers, writing rules), as the AI assistant of the editor
 * adds it to its instructions. The module ai-assistant provides it through
 * {@link BrandFrameBridge}. Without that module, no service is registered and the instructions
 * stay as the editor sends them.
 */
public interface BrandFrame {

    /**
     * The frame text of a site in a language, or an empty text when the site has no frame.
     *
     * @param text the text the model works on, so the rules it touches come first; may be null
     */
    String instructionsFor(String siteKey, String language, String text);
}
