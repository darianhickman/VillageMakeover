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
				self.hide();
                ige.client.fsm.enterState('select');
			})
			.mount(this);
	}
});