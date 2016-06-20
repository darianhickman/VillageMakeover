var GraphUiEditor = IgeSceneGraph.extend({
	classId: 'GraphUiEditor',

	/**
	 * Called when loading the graph data via ige.addGraph().
	 * @param options
	 */
	addGraph: function (options) {
		var self = ige.client,
			uiScene = ige.$('uiSceneEditor');

        var topNav = new IgeUiElement()
            .id('topNavEditor')
            .width(900)
            .top(10)
            .right(10)
            .height(50)
            .mount(uiScene)

        var editorDialog = new EditorDialog()
            .id('editorDialog')
            .layer(1)
            .hide()
            .mount(uiScene);

        GameObjects.setupEditor(editorDialog)

        $('#editorTopNavBar').css('display','')

        if($('#editorTopNavList').is(':empty')){
            $('#editorTopNavList').append($('<li id="quitButtonEditor"/>').text('Quit'),
                $('<li id="saveButtonEditor"/>').text('Save'),
                $('<li id="selectButtonEditor"/>').text('Select'),
                $('<li id="deleteButtonEditor"/>').text('Delete'),
                $('<li id="buildButtonEditor"/>').text('Build')
            )
        }

		this.addActions();

	},

	addActions: function () {
        var self = this;

        $('#quitButtonEditor')
            .click(function(){
                ige.client.editorManager.gotoStep("closeEditor");
            })

        $('#saveButtonEditor')
            .click(function(){
                ige.client.editorManager.saveVillageData();
            })

        $('#selectButtonEditor')
            .click(function(){
                ige.client.fsm.enterState('editor');
            })

        $('#deleteButtonEditor')
            .click(function(){
                ige.client.fsm.enterState('editorDelete');
            })

        $('#buildButtonEditor')
            .mouseover(function(){
                ige.client.audio.select.play();
            })
			.click(function () {
                mixpanel.track("Open editor dialog");
                ige.$('editorDialog').show();
			});

	},

	/**
	 * The method called when the graph items are to be removed from the
	 * active graph.
	 */
	removeGraph: function () {
		// Since all our objects in addGraph() were mounted to the
		// 'scene1' entity, destroying it will remove everything we
		// added to it.
		ige.$('scene1').destroy();
	}
});
