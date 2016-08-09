var EditorManager = IgeEventingClass.extend({
    classId: 'EditorManager',

    init: function (goals) {

        var self = this;

        ige.client.isEditorOn = true;

        $( document ).ajaxSend(function(event, xhr, settings) {
            if(settings.sentFrom !== "editor")
                return;

            $( "#savingDialog" ).dialog({ resizable: false, draggable: true, dialogClass: 'ui-dialog-no-titlebar', closeOnEscape: false, width: 500, height: 300, modal: true, autoOpen: false });
            $( "#savingDialog" ).dialog( "open" );

            $( "#savingContent" )
                .html( "<div><p>Processing, please wait!</p><p><img src='assets/textures/ui/loading_spinner.gif'></p></div>" );
        });

        $( document ).ajaxError(function(event, xhr, settings) {
            if(settings.sentFrom !== "editor")
                return;

            $( "#savingContent" )
                .html( "<div><p>There was an error contacting the server!<br />Please try again later.</p>" +
                "<p><button id='closeSavingDialog'>Close</button></p></div>" );

            $('#closeSavingDialog').on('click', function(){
                $( "#savingDialog" ).dialog( "close" );
            });

        });

        $( document ).ajaxSuccess(function(event, xhr, settings) {
            if(settings.sentFrom !== "editor")
                return;

            $( "#savingDialog" ).dialog( "close" );
        });

        self.editorObjects = [];
        self.editorObjectsLookup = {};
        self.isSaved = false;
        self.dbRef = null;
        self.villageID;
        self.villageSpreadsheetID = "";
        self.villageTitle;
        self.villageOrganization;
        self.villageIsViewable;

        self.steps = [];
        self.currentStep = '';
        self.editorViews = new EditorViews();

        self.steps['init'] = {
            enter: function(){
                $( "#editorDialog" ).dialog({ resizable: false, draggable: true, dialogClass: 'ui-dialog-no-titlebar', closeOnEscape: false, width: 500, height: 300, modal: true, autoOpen: false, close: function( event, ui ) {self.gotoStep('closeEditor',{forceQuit:true});} });
                $( "#editorDialog" ).dialog( "open" );

                $( "#editorContent" )
                    .html( self.editorViews.getViewByID('init').view );

                $('#newVillageButton').on('click', function(){
                    self.gotoStep('new');
                });

                $('#loadVillagesButton').on('click', function(){
                    self.gotoStep('load');
                });

                $('#cancelEditorModeButton').on('click', function(){
                    self.gotoStep('closeEditor',{forceQuit:true})
                });
            },
            exit: function(){
                $( "#editorDialog" ).dialog( {close: function( event, ui ) {} } );
                $( "#editorDialog" ).dialog( "close" );
            }
        }

        self.steps['new'] = {
            enter: function(){
                $( "#editorDialog" ).dialog({ resizable: false, draggable: true, dialogClass: 'ui-dialog-no-titlebar', closeOnEscape: false, width: 500, height: 300, modal: true, autoOpen: false, close: function( event, ui ) {self.gotoStep('closeEditor',{forceQuit:true});} });
                $( "#editorDialog" ).dialog( "open" );

                $( "#editorContent" )
                    .html( self.editorViews.getViewByID('new').view );

                $('#createNewVillageButton').on('click', function(){
                    if(!$('#newVillageTitle').val()){
                        $('#newVillageErrorField').css('display','')
                        return;
                    }else{
                        $('#newVillageErrorField').css('display','none')
                    }
                    self.villageID = ige.newIdHex();
                    self.villageTitle = $('#newVillageTitle').val();
                    self.villageOrganization = $('#newVillageOrganization').val();
                    self.villageIsViewable =  $('#newVillageViewable').is(':checked');
                    self.createVillage(function(){self.gotoStep('editModeOn')});
                });

                $('#cancelCreateNewVillageButton').on('click', function(){
                    self.gotoStep('init')
                });

            },
            exit: function(){
                $( "#editorDialog" ).dialog( {close: function( event, ui ) {} } );
                $( "#editorDialog" ).dialog( "close" );
            }
        }

        self.steps['load'] = {
            enter: function(){
                $( "#editorDialog" ).dialog({ resizable: false, draggable: true, dialogClass: 'ui-dialog-no-titlebar', closeOnEscape: false, width: 800, height: 500, modal: true, autoOpen: false, close: function( event, ui ) {self.gotoStep('closeEditor',{forceQuit:true});} });
                $( "#editorDialog" ).dialog( "open" );

                $("#editorContent")
                    .html( self.editorViews.getViewByID('load').view );

                $.ajax({
                    dataType: 'json',
                    url: '/api/get_villages',
                    sentFrom: "editor",
                    success: function(data) {
                        $.each(data, function (i, item) {
                            var $tr = $('<tr>').append(
                                $('<td>').text(item.title),
                                $('<td>').text(item.organization),
                                $('<td>').append($('<button/>')
                                    .text('Load')
                                    .click(function () { self.loadVillageFromDB(item.village_id) })),
                                $('<td>').append($('<button/>')
                                    .text('Edit')
                                    .click(function () { self.gotoStep('edit',{id: item.village_id, title: item.title, organization: item.organization, viewable: item.viewable}); })),
                                $('<td>').append($('<button/>')
                                    .text('Delete')
                                    .click(function () { self.gotoStep('delete',{id: item.village_id, title: item.title}); })),
                                $('<td>').append($('<button/>')
                                    .text('View')
                                    .click(function () { window.open('/view/' + item.village_id,'_blank'); })),
                                $('<td>').append($('<button/>')
                                    .text('Share')
                                    .click(function () {self.gotoStep('share',{id: item.village_id, title: item.title}); }))
                            ).appendTo('#loadedVillagesTable');
                        });
                    }
                })

                $("#cancelLoadVillageButton").on('click', function () {
                    self.gotoStep('init');
                });
            },
            exit: function(){
                $( "#editorDialog" ).dialog( {close: function( event, ui ) {} } );
                $( "#editorDialog" ).dialog( "close" );
            }
        }

        self.steps['edit'] = {
            enter: function(data){
                var villageTitle,
                    villageOrganization,
                    villageIsViewable;

                $( "#editorDialog" ).dialog({ resizable: false, draggable: true, dialogClass: 'ui-dialog-no-titlebar', closeOnEscape: false, width: 500, height: 300, modal: true, autoOpen: false, close: function( event, ui ) {self.gotoStep('closeEditor',{forceQuit:true});} });
                $( "#editorDialog" ).dialog( "open" );

                $( "#editorContent" )
                    .html( self.editorViews.getViewByID('edit').view );

                $('#editVillageTitle').val(data.title);
                $('#editVillageOrganization').val(data.organization);
                $('#editVillageViewable').prop('checked', data.viewable);

                $('#editVillageButton').on('click', function(){
                    if(!$('#editVillageTitle').val()){
                        $('#editVillageErrorField').css('display','')
                        return;
                    }else{
                        $('#editVillageErrorField').css('display','none')
                    }
                    villageTitle = $('#editVillageTitle').val();
                    villageOrganization = $('#editVillageOrganization').val();
                    villageIsViewable =  $('#editVillageViewable').is(':checked');
                    self.editVillage({id: data.id,title:villageTitle,organization:villageOrganization,viewable:villageIsViewable})
                });

                $('#cancelEditVillageButton').on('click', function(){
                    self.gotoStep('load')
                });

            },
            exit: function(){
                $( "#editorDialog" ).dialog( {close: function( event, ui ) {} } );
                $( "#editorDialog" ).dialog( "close" );
            }
        }

        self.steps['delete'] = {
            enter: function(data){
                $( "#editorDialog" ).dialog({ resizable: false, draggable: true, dialogClass: 'ui-dialog-no-titlebar', closeOnEscape: false, width: 500, height: 300, modal: true, autoOpen: false, close: function( event, ui ) {self.gotoStep('closeEditor',{forceQuit:true});} });
                $( "#editorDialog" ).dialog( "open" );

                $("#editorContent")
                    .html( self.editorViews.getViewByID('warnBeforeDelete').view );

                $('#deleteVillageTitle').html(data.title);

                $('#yesDeleteButton').on('click', function(){
                    if($('#deleteVillageTitleInput').val() !== data.title){
                        $('#deleteVillageErrorField').css('display','')
                        return;
                    }else{
                        $('#deleteVillageErrorField').css('display','none')
                    }
                    self.deleteVillage(data.id);
                });

                $('#cancelDeleteButton').on('click', function(){
                    self.gotoStep('load');
                });



            },
            exit: function(){
                $( "#editorDialog" ).dialog( {close: function( event, ui ) {} } );
                $( "#editorDialog" ).dialog( "close" );
            }
        }

        self.steps['share'] = {
            enter: function(data){
                $( "#editorDialog" ).dialog({ resizable: false, draggable: true, dialogClass: 'ui-dialog-no-titlebar', closeOnEscape: false, width: 500, height: 300, modal: true, autoOpen: false, close: function( event, ui ) {self.gotoStep('closeEditor',{forceQuit:true});} });
                $( "#editorDialog" ).dialog( "open" );

                $("#editorContent")
                    .html( self.editorViews.getViewByID('share').view );

                $('#shareVillageTitle').html(data.title);

                var url = window.location.href;
                var arr = url.split("/");
                var result = arr[0] + "//" + arr[2]
                $('#shareTextArea').val(result + '/view/' + data.id);

                $('#copyClipboardButton').on('click', function(){
                    var copyTextarea = $('#shareTextArea');
                    copyTextarea.select();

                    try {
                        var successful = document.execCommand('copy');
                        var msg = successful ? 'successful' : 'unsuccessful';
                        console.log('Copying text command was ' + msg);
                        if(!successful){
                            $('#shareVillageErrorField').css('display','')
                        }
                    } catch (err) {
                        console.log('Oops, unable to copy');
                        $('#shareVillageErrorField').css('display','')
                    }
                });

                $('#cancelShareButton').on('click', function(){
                    self.gotoStep('load');
                });



            },
            exit: function(){
                $( "#editorDialog" ).dialog( {close: function( event, ui ) {} } );
                $( "#editorDialog" ).dialog( "close" );
            }
        }

        self.steps['closeEditor'] = {
            enter: function(data){
                if(data && data.forceQuit)
                    self.closeEditor(true);
                else
                    self.closeEditor();
            },
            exit: function(){

            }
        }

        self.steps['warnBeforeQuit'] = {
            enter: function(){
                $( "#editorDialog" ).dialog({ resizable: false, draggable: true, dialogClass: 'ui-dialog-no-titlebar', closeOnEscape: false, width: 500, height: 300, modal: true, autoOpen: false, close: function( event, ui ) {self.gotoStep('editModeOn');} });
                $( "#editorDialog" ).dialog( "open" );

                $("#editorContent")
                    .html( self.editorViews.getViewByID('warnBeforeQuit').view );

                $('#yesWarningButton').on('click', function(){
                    self.saveVillageData(function(){self.gotoStep('closeEditor',{forceQuit:true})});
                });

                $('#noWarningButton').on('click', function(){
                    self.gotoStep('closeEditor',{forceQuit:true})
                });

                $('#cancelWarningButton').on('click', function(){
                    self.gotoStep('editModeOn');
                });
            },
            exit: function(){
                $( "#editorDialog" ).dialog( {close: function( event, ui ) {} } );
                $( "#editorDialog" ).dialog( "close" );
            }
        }

        self.steps['editModeOn'] = {
            enter: function(){

            },
            exit: function(){

            }
        }

    },

    gotoStep: function(stepID, data){
        if(this.currentStep !== ''){
            this.steps[this.currentStep].exit();
        }
        this.currentStep = stepID;
        this.steps[stepID].enter(data);
    },

    createObject: function(obj){
        var newLength = this.editorObjects.push(obj);
        this.editorObjectsLookup[obj.id] = this.editorObjects[newLength-1];
        this.isSaved = false;
    },

    deleteObject: function(obj){
        this.editorObjects.splice(this.editorObjects.indexOf(this.editorObjectsLookup[obj.id()]),1);
        this.isSaved = false;
    },

    updateObject: function(obj, newX, newY) {
        this.editorObjectsLookup[obj.id()].x = newX
        this.editorObjectsLookup[obj.id()].y = newY
        this.isSaved = false;
    },

    loadVillageFromDB: function(villageID){
        var self = this;

        $.ajax({
            dataType: 'json',
            url: '/api/village/' + villageID ,
            sentFrom: "editor",
            success: function(response) {
                for(var i = 0; i < response.data.length; i++){
                    ClientHelpers.addObject(response.data[i],"tileMapEditor")
                    self.createObject(response.data[i]);
                }
                self.villageID = villageID;
                self.villageTitle = response.title;
                self.villageOrganization = response.organization;
                self.villageIsViewable =  response.viewable;
                self.gotoStep('editModeOn')
                self.isSaved = true;

                history.replaceState({'villageID':villageID},"load_village",'?v='+villageID);
            }
        })
    },

    editVillage: function(data){
        var self = this;

        $.ajax({
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            sentFrom: "editor",
            method: 'PUT',
            data: JSON.stringify({title: data.title, organization: data.organization, viewable: data.viewable}),
            url: '/api/village/' + data.id,
            success: function(response) {
                self.gotoStep('init');
            }
        })
    },

    deleteVillage: function(villageID){
        var self = this;

        $.ajax({
            type: 'DELETE',
            url: '/api/village/' + villageID ,
            sentFrom: "editor",
            success: function(response) {
                self.gotoStep('init');
            }
        })
    },

    createVillage: function(callback){
        var self = this;

        $.ajax({
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            sentFrom: "editor",
            method: 'POST',
            data: JSON.stringify({mode: 'new', title: self.villageTitle, organization: self.villageOrganization, viewable: self.villageIsViewable}),
            url: '/api/village/' + self.villageID,
            success: function(response) {
                self.isSaved = true;
                if(callback)
                    callback();
            }
        })
    },

    saveVillageData: function(callback){
        var self = this;

        $.ajax({
            dataType: 'json',
            contentType: "application/json; charset=utf-8",
            sentFrom: "editor",
            method: 'POST',
            data: JSON.stringify({mode: 'data', title: self.villageTitle, data: self.editorObjects}),
            url: '/api/village/' + self.villageID,
            success: function(response) {
                self.isSaved = true;
                if(callback)
                    callback();
            }
        })
    },

    closeEditor: function(forceQuit){
        if(!this.isSaved && !forceQuit){
            this.gotoStep('warnBeforeQuit');
            return;
        }

        ige.client.isEditorOn = false;

        ige.$('level1').show();
        ige.$('outlineEntity').hide();
        ige.$('outlineEntity').unMount();
        ige.removeGraph('GraphEditor');

        if (ige.client.data('moveItem')) {
            // We are moving a building
            // Clear the data
            ige.client.data('moveItem', '');
        }

        $('#editorTopNavBar').css('display','none')
        $("#topToolbar").show();
        $("#notifyIconContainer").show();

        history.replaceState({'villageID':API.user.key_id},"load_village",'?v='+API.user.key_id);

        ige.client.fsm.enterState('select');
    }

})