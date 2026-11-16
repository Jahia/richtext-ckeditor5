---
# Allowed version bumps: patch, minor, major
richtext-ckeditor5: minor
---

Added the Jahia GenAI connector as a provider of the AI Assistant, so the assistant is no longer limited to OpenAI. To use it, set aiType=genai in the CKEditor 5 configuration and configure the GenAI connector. With the GenAI connector, the AI Assistant answers only users who have the genaiAccess permission on the site of the content. When the editorial-frame module is installed, the AI Assistant also follows the editorial frame of the site: its voice, its readers and its writing rules. The AI Assistant answer now appears while it is written, and the assistant also works on a Jahia installed under a context path. This version of the module requires Jahia 8.2.2.0 or later.
