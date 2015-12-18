var EditorViews = IgeClass.extend({
    classId: 'EditorViews',

    init: function(){
        var self = this;

        self.viewsLookup = [];

        for(var i = 0; i < self.views.length; i++){
            self.viewsLookup[self.views[i].id] = self.views[i];
        }

    },

    views: [
        {
            id: 'init',
            view: '<div style="padding-top:80px"><p><button id="newVillageButton">New</button></p>' +
            '<p><button id="loadVillagesButton">Load</button></p>' +
            '<p><button id="cancelEditorModeButton">Quit</button></p></div>'
        },
        {
            id: 'new',
            view: '<div style="padding-top:65px"><p><form action="javascript:void(0);">' +
            '<div><label style="display: inline-block;width: 220px;text-align: right;" for="newVillageTitle">Title:</label><input type="text" id="newVillageTitle" /></div>' +
            '<div id="newVillageErrorField" class="ui-state-error" style="display:none;font-size:14px;">Please fill in the "Title" field</div>' +
            '<div><label style="display: inline-block;width: 220px;text-align: right;" for="newVillageOrganization">Organization(optional):</label><input type="text" id="newVillageOrganization" /></div>' +
            '<div><label for="newVillageViewable">Viewable:</label><input type="checkbox" checked id="newVillageViewable"></input></div>' +
            '<div><button id="createNewVillageButton">Create</button></div>' +
            '<div><button id="cancelCreateNewVillageButton">Back</button></div></form></p></div>'
        },
        {
            id: 'load',
            view: '<table id="loadedVillagesTable" style="width:100%;"><tr><th>Title</th><th>Organization</th><th>Load</th><th>Edit</th><th>Delete</th><th>View</th></tr></table>' +
            '<p><button id="cancelLoadVillageButton">Back</button></p>'
        },
        {
            id: 'edit',
            view: '<div style="padding-top:65px"><p><form action="javascript:void(0);">' +
            '<div><label style="display: inline-block;width: 220px;text-align: right;" for="newVillageTitle">Title:</label><input type="text" id="editVillageTitle" /></div>' +
            '<div id="editVillageErrorField" class="ui-state-error" style="display:none;font-size:14px;">Please fill in the "Title" field</div>' +
            '<div><label style="display: inline-block;width: 220px;text-align: right;" for="editVillageOrganization">Organization(optional):</label><input type="text" id="editVillageOrganization" /></div>' +
            '<div><label for="editVillageViewable">Viewable:</label><input type="checkbox" checked id="editVillageViewable"></input></div>' +
            '<div><button id="editVillageButton">Save</button></div>' +
            '<div><button id="cancelEditVillageButton">Cancel</button></div></form></p></div>'
        },
        {
            id: 'warnBeforeQuit',
            view: '<div style="padding-top:80px"><p>You have unsaved changes. Save before quit?</p>' +
            '<p><button id="yesWarningButton">Yes</button></p>' +
            '<p><button id="noWarningButton">No</button></p>' +
            '<p><button id="cancelWarningButton">Cancel</button></p></div>'
        },
        {
            id: 'warnBeforeDelete',
            view: '<div style="padding-top:40px"><p>You can\'t undo delete! Are you sure to delete:</p><p id="deleteVillageTitle"></p>' +
            '<div><label style="display: inline-block;width: 220px;text-align: right;" for="deleteVillageTitleInput">Write the title here:</label><input type="text" id="deleteVillageTitleInput" />' +
            '<div id="deleteVillageErrorField" class="ui-state-error" style="display:none;font-size:14px;">Please fill in the "Title" field</div></div>' +
            '<p><button id="yesDeleteButton">Delete</button></p>' +
            '<p><button id="cancelDeleteButton">Cancel</button></p></div>'
        }
    ],

    getViewByID: function(id){
        return this.viewsLookup[id];
    }
})