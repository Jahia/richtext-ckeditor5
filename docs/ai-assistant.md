---
page:
  '$path': '/sites/academy/home/documentation/jahia/8_2/developer/extending-and-customizing-jahia-ui/configuring-and-customizing-ckeditor-menu/ckeditor-5/ai-assistant'
  'jcr:title': CK5 AI Assistant features
  'j:templateName': documentation
content:
  '$subpath': document-area/content
---

CKEditor 5 premium license provides an AI Assistant feature that allows AI-powered text generation directly in the editor. Jahia extends this integration through a server-side proxy that forwards requests to OpenAI, keeping API credentials secure and never exposing them to the browser.

## How It Works

When a user invokes the AI Assistant from the editor toolbar, CKEditor 5 sends requests to a proxy endpoint on the Jahia server. The proxy adds the API key, forwards the request to OpenAI, and streams the response back to the editor.

This architecture ensures that:

- API keys are stored exclusively in server-side configuration
- Only users with CK5 richtext editor permissions can use the AI Assistant
- Request parameters can be centrally managed by administrators

Currently, only OpenAI requests is supported through the proxy endpoint.

## Prerequisites

- An [OpenAI API key](https://platform.openai.com/api-keys)

## Configuration

The AI Assistant is configured through an OSGi configuration file. Create or edit the following file either through the OSGi console tools or directly in your Jahia `karaf/etc/` directory:

**`org.jahia.modules.richtextCKEditor5.ai.openai.cfg`**

```properties
# Enable/disable the AI Assistant
ai.enabled=true

# OpenAI API Key (get from https://platform.openai.com/api-keys)
ai.apiKey=YOUR_OPENAI_API_KEY

# API Endpoint URL
ai.apiUrl=https://api.openai.com/v1/chat/completions

# Override additional request parameters as a JSON string (optional)
#ai.requestParams={"model": "gpt-5-mini"}

# TCP connection timeout in seconds (default: 10)
#ai.connectTimeout=10

# Request timeout in seconds for non-streaming calls (default: 30)
#ai.requestTimeout=30

# Request timeout in seconds for streaming calls (default: 120)
#ai.streamingTimeout=120
```

### Configuration Properties

| Property | Default | Description |
|---|---|---|
| `ai.enabled` | `false` | Enables the AI Assistant. When disabled, the AI toolbar buttons are hidden. |
| `ai.apiKey` | — | Your OpenAI API key. Required for the AI Assistant to function. |
| `ai.apiUrl` | `https://api.openai.com/v1/chat/completions` | The OpenAI API endpoint URL. |
| `ai.requestParams` | — | Optional JSON string to override request parameters sent to OpenAI (e.g., model, temperature). |
| `ai.connectTimeout` | `10` | TCP connection timeout in seconds. Set to 0 to disable. |
| `ai.requestTimeout` | `30` | Request timeout in seconds for non-streaming calls. Set to 0 to disable. |
| `ai.streamingTimeout` | `120` | Request timeout in seconds for streaming calls. Set to 0 to disable. |

### Overriding Request Parameters

Use `ai.requestParams` to customize the parameters sent to the OpenAI API. This is useful for specifying a different model or adjusting generation behavior:

```properties
ai.requestParams={"model": "gpt-5-mini", "temperature": 0.7}
```

These parameters are merged into every request sent to the OpenAI API, overriding any values set by the editor.

## Enabling the AI Assistant

1. Obtain an OpenAI API key from [platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Set `ai.enabled=true` and provide your API key by setting `ai.apiKey=<YOUR_API_KEY>`
3. The AI Assistant toolbar buttons (`AI Commands` and `AI Assistant`) should appear in the CKEditor 5 toolbar

No server restart is required — the configuration is picked up automatically by the OSGi runtime but might require a UI refresh for the toolbar buttons to appear.

## Disabling the AI Assistant

Set `ai.enabled=false` in the configuration file. When disabled, the AI-related toolbar buttons are automatically hidden from the editor.

## Permissions

The AI Assistant proxy requires the `wysiwyg-editor-toolbar` permission on the content node being edited. This ensures that only users with richtext editing permissions can use the AI features. 
