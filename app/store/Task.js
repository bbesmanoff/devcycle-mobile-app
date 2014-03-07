Ext.define('DevCycleMobile.store.Task', {
    extend: 'Ext.data.TreeStore',
    requires: [
        'DevCycleMobile.model.Task'
    ],

    config: {
        defaultRootProperty: 'items',
        model: 'DevCycleMobile.model.Task',

        // XXX: AccordionList Now show data from JSON
        proxy: {
            type: 'ajax',
            url: 'resources/data/testData.json'
        }
    }

});
