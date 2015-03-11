var Dialog = IgeUiElement.extend({
	classId: 'Dialog',
	
	init: function () {
		IgeUiElement.prototype.init.call(this);
		var self = this;
		
		this.styleClass('dialog')
			.addGroup('dialog');
		
		// Add a dialog underlay
		this._underlay = new IgeUiElement()
			.id('underlay_' + this.id())
			.layer(-1)
			.styleClass('underlay')
			.mouseDown(function () {
				ige.input.stopPropagation();
			})
			.mouseUp(function () {
                ige.input.stopPropagation();
                self.closeMe();
			})
			.mount(this);

        this.closeButton = new IgeUiEntity()
            .id('closeButton_' + this.id())
            .layer(2)
            .texture(ige.client.textures.closeButton)
            .dimensionsFromTexture()
            .mouseDown(function () {
                ige.input.stopPropagation();
            })
            .mouseUp(function () {
                ige.input.stopPropagation();
                self.closeMe();
            })
            .mount(this);
    },

    closeMe: function() {
        this.hide();
        ige.client.fsm.enterState('select');
    }
});