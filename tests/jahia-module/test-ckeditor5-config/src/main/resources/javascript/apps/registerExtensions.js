window.jahia.i18n.loadNamespaces('test-ckeditor5-config');

window.jahia.uiExtender.registry.add('callback', 'test-ckeditor5-configExample', {
    targets: ['jahiaApp-init:99.5'],
    callback: function () {
      try{
        console.log('Register custom CK5 config: testConfigCK5')

        const minimal = window.jahia.uiExtender.registry.get('ckeditor5-config', 'minimal');
        window.jahia.uiExtender.registry.add('ckeditor5-config', 'testConfigCK5', {
          ...minimal,
          toolbar: {
            items: [
              'bold',
              'italic',
              'underline'
            ],
            shouldNotGroupWhenFull: true
          }
        })

        window.jahia.uiExtender.registry.add('ckeditor5-config', 'testConfigCK5Cnd', {
          ...minimal,
          toolbar: {
            items: [
              'bold'
            ],
            shouldNotGroupWhenFull: true
          }
        })
      } catch (e) {
        console.error(e);
      }
    }
});

// Exercises the federation-free registration hook. This file is a plain script,
// so it cannot `import` from 'ckeditor5' the way a UI-extension module would —
// the hook receives the namespace (and the registry) as arguments instead. This
// is the mechanism JavaScript Modules have to rely on.
(window.jahiaCk5Init ??= []).push(function ({ckeditor5, registry}) {
  console.log('Register custom CK5 config through window.jahiaCk5Init: hookConfigCK5')

  const {Plugin, ButtonView} = ckeditor5;

  /** Inserts a fixed marker at the caret, so the test can prove the plugin really runs. */
  class TestMarker extends Plugin {
    init() {
      const editor = this.editor;

      editor.ui.componentFactory.add('testMarker', () => {
        const button = new ButtonView();
        button.set({label: 'Test Marker', withText: true, tooltip: true});
        button.on('execute', () => {
          editor.model.change(writer => {
            editor.model.insertContent(writer.createText('hook-plugin-ran'));
          });
        });
        return button;
      });
    }
  }

  const minimal = registry.get('ckeditor5-config', 'minimal');
  registry.add('ckeditor5-config', 'hookConfigCK5', {
    ...minimal,
    // Register the plugin built from the injected ckeditor5 namespace
    plugins: minimal.plugins.concat([TestMarker]),
    toolbar: {
      items: ['bold', 'testMarker'],
      shouldNotGroupWhenFull: true
    }
  })
});

// A hook that throws must not prevent the hooks around it from registering.
(window.jahiaCk5Init ??= []).push(function () {
  throw new Error('Deliberate failure from a test hook')
});

// A non-function entry must be skipped rather than break initialization.
(window.jahiaCk5Init ??= []).push('not a function');

// Registered after the two bogus entries above: it must still be reached.
(window.jahiaCk5Init ??= []).push(function ({registry}) {
  console.log('Register custom CK5 config through window.jahiaCk5Init: hookConfigCK5AfterFailure')

  const minimal = registry.get('ckeditor5-config', 'minimal');
  registry.add('ckeditor5-config', 'hookConfigCK5AfterFailure', {
    ...minimal,
    toolbar: {
      items: ['italic'],
      shouldNotGroupWhenFull: true
    }
  })
});
