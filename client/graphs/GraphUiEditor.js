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
            .left(10)
            .right(10)
            .height(50)
            .mount(uiScene)

        var editorDialog = new EditorDialog()
            .id('editorDialog')
            .layer(1)
            .hide()
            .mount(uiScene);

        GameObjects.setupEditor(editorDialog)

        var quitButtonEditor = new IgeFontEntity()
            .id('quitButtonEditor')
            .text('Quit')
            .colorOverlay('white')
            .nativeFont('25px Times New Roman')
            .width(70)
            .right(600)
            .textAlignX(1)
            .mount(topNav)

        var saveButtonEditor = new IgeFontEntity()
            .id('saveButtonEditor')
            .text('Save')
            .colorOverlay('white')
            .nativeFont('25px Times New Roman')
            .width(70)
            .right(450)
            .textAlignX(1)
            .mount(topNav)

        var selectButtonEditor = new IgeFontEntity()
            .id('selectButtonEditor')
            .text('Select')
            .colorOverlay('white')
            .nativeFont('25px Times New Roman')
            .width(70)
            .right(300)
            .textAlignX(1)
            .mount(topNav)

        var deleteButtonEditor = new IgeFontEntity()
            .id('deleteButtonEditor')
            .text('Delete')
            .colorOverlay('white')
            .nativeFont('25px Times New Roman')
            .width(70)
            .right(150)
            .textAlignX(1)
            .mount(topNav)

        var buildButtonEditor = new IgeUiElement()
			.id('buildButtonEditor')
			.texture(self.textures.buildButton)
			.dimensionsFromTexture()
            .right(10)
			.mount(topNav);

		this.addActions();

	},

	addActions: function () {
        var self = this;

        ige.$('quitButtonEditor')
            .mouseUp(function(){
                ige.client.editorManager.gotoStep("closeEditor");
            })

        ige.$('saveButtonEditor')
            .mouseUp(function(){
                ige.client.editorManager.saveVillageData();
            })

        ige.$('selectButtonEditor')
            .mouseUp(function(){
                ige.client.fsm.enterState('editor');
            })

        ige.$('deleteButtonEditor')
            .mouseUp(function(){
                ige.client.fsm.enterState('editorDelete');
            })

		ige.$('buildButtonEditor')
            .mouseOver(function(){
                ige.client.audio.select.play();
            })
			.mouseUp(function () {
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
