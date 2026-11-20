package org.jahia.modules.ckeditor.ai.frame;

import org.jahia.modules.aiassistant.frame.api.BrandFrameService;
import org.jahia.modules.aiassistant.frame.api.FrameContext;
import org.jahia.modules.aiassistant.frame.api.FrameRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class BrandFrameBridgeTest {

    private BrandFrameService frames;
    private BrandFrameBridge bridge;

    @BeforeEach
    void setUp() {
        frames = mock(BrandFrameService.class);
        bridge = new BrandFrameBridge(frames);
    }

    @Test
    void theFrameOfTheSiteAndTheLanguageIsItsText() {
        when(frames.buildContext(any())).thenReturn(new FrameContext("# Brand frame\n", "abc123", null, List.of(), 4,
                false));

        assertEquals("# Brand frame\n", bridge.instructionsFor("digitall", "fr", "Un chat"));

        ArgumentCaptor<FrameRequest> request = ArgumentCaptor.forClass(FrameRequest.class);
        verify(frames).buildContext(request.capture());
        assertEquals("digitall", request.getValue().siteKey());
        assertEquals("fr", request.getValue().language());
        assertNull(request.getValue().persona(), "the default persona of the site");
        assertEquals(BrandFrameBridge.FRAME_TOKENS, request.getValue().maxTokens());
        assertEquals("Un chat", request.getValue().text());
    }

    @Test
    void aSiteWithNoFrameGivesAnEmptyText() {
        when(frames.buildContext(any())).thenReturn(FrameContext.empty());

        assertEquals("", bridge.instructionsFor("digitall", "fr", null));
    }
}
