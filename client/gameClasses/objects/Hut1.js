var Hut1 = GameObject.extend({
	classId: 'Hut1',
	
	init: function () {
		GameObject.prototype.init.call(this);
		
		var self = this;
		
		this.texture(ige.client.textures.hut1)
			.dimensionsFromCell()
			.bounds3d(76, 76, 50)
			.anchor(-2, -1);
		
		this.calcTileAdjust();
		
		this.fsm = new IgeFSM();
		
		this.fsm.defineState('placing', {
			enter: function (data, completeCallback) {
				self.cell(2);
				completeCallback();
			},
			exit: function (data, completeCallback) {
				completeCallback();
			}
		});
		
		this.fsm.defineState('building', {
			enter: function (data, completeCallback) {
				// Record when we entered the state
				self._buildStarted = ige._currentTime;
				
				// Set the initial placement cell to the "construction" image
				self.cell(1);
				
				// Create a building progress bar for this entity
				self._buildProgressBar = new IgeUiProgressBar()
					.barBackColor('#f2b982')
					.barColor('#69f22f')
					.barBorderColor('#3a9bc5')
					.min(0)
					.max(100)
					.progress(0)
					.width(50)
					.height(10)
					.mount(self);
				
				completeCallback();
			},
			exit: function (data, completeCallback) {
				completeCallback();
			}
		});
		
		this.fsm.defineState('built', {
			enter: function (data, completeCallback) {
				self.cell(2);
				self._buildProgressBar.destroy();
				delete self._buildProgressBar;
				
				completeCallback();
			},
			exit: function (data, completeCallback) {
				completeCallback();
			}
		});
		
		this.fsm.initialState('placing');
	},
	
	place: function () {
		this.fsm.enterState('building');
		GameObject.prototype.place.call(this);
	},
	
	update: function (ctx) {
		var self = this;
		
		if (self.fsm.currentStateName() === 'building') {
			// Update the build progress bar
			var progress = Math.floor((100 / 10000) * (ige._currentTime - self._buildStarted));
			self._buildProgressBar.progress(progress);
			
			if (progress >= 100) {
				// Build complete
				self.fsm.enterState('built');
			}
		}
		
		GameObject.prototype.update.call(this, ctx);
	}
});