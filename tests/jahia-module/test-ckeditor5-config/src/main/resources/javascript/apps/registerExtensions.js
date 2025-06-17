window.jahia.i18n.loadNamespaces('test-ckeditor5-config');

window.jahia.uiExtender.registry.add('callback', 'test-ckeditor5-configExample', {
    targets: ['jahiaApp-init:99.5'],
    callback: function () {
      try{
        console.log('Register custom CK5 config: testConfigCK5')
        window.jahia.uiExtender.registry.get('@jahia/ckeditor5', 'shared').defineConfig('testConfigCK5', {
          plugins: window.jahia.uiExtender.registry.get('ckeditor5-plugins', 'complete').plugins,
          ...window.jahia.uiExtender.registry.get('ckeditor5-config', 'minimal'),
          toolbar: {
            items: [
              'bold',
              'italic',
              'underline'
            ],
            shouldNotGroupWhenFull: true
          }
        });

        window.jahia.uiExtender.registry.get('@jahia/ckeditor5', 'shared').defineConfig('testConfigCK5Cnd', {
          plugins: window.jahia.uiExtender.registry.get('ckeditor5-plugins', 'complete').plugins,
          ...window.jahia.uiExtender.registry.get('ckeditor5-config', 'minimal'),
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
