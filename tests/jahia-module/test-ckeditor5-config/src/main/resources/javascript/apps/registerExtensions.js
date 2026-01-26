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
