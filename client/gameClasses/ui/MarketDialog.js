var MarketDialog = Dialog.extend({
	classId: 'MarketDialog',

	init: function () {
		Dialog.prototype.init.call(this);

		var background = new IgeUiElement()
			.id('marketDialogImage')
			.layer(0)
			.texture(ige.client.textures.marketMenuBack)
			.dimensionsFromTexture()
			.mount(this);

		this._pages = [];
		this._items = [];
		this._pageItems = [];

        this.closeButton.translateTo(300,-200,0);
	},

	createPages: function(totalPages) {
		var self = this

		for(var i=0; i<totalPages; i++) {
			var pageEnt = new IgeUiElement()
				.id('marketDialog_page' + i)
				.layer(1)
				.width(560)
				.height(380)
				.translateTo(0, 21, 0)
				.mount(this)
				.hide()

			new IgeUiElement()
				.id('marketDialogRight_' + i)
				.layer(2)
				.texture(ige.client.textures.rightButton1)
				.dimensionsFromTexture()
				.bottom(55)
				.right(65)
				.mount(pageEnt)
				.mouseUp(function () {
					self.changePage(1)
				})

			new IgeUiElement()
				.id('marketDialogLeft_' + i)
				.layer(2)
				.texture(ige.client.textures.leftButton1)
				.dimensionsFromTexture()
				.bottom(55)
				.left(65)
				.mount(pageEnt)
				.mouseUp(function () {
					self.changePage(-1)
				})

			this._pages.push(pageEnt);
		}

		this._activePageIndex = 0;
		this._pages[0].mount(this)
			.show()
	},

    changePage: function(dir) {
        console.log(dir, this._activePageIndex)
        this._pages[this._activePageIndex].hide()
        this._activePageIndex += dir
        if(this._activePageIndex < 0)
            this._activePageIndex = 0
        if(this._activePageIndex >= this._pages.length)
            this._activePageIndex = this._pages.length - 1
        this._pages[this._activePageIndex].show()
    },

	show: function () {
		var self = this;

		ige.client.fsm.enterState('buildDialog', null, function (err) {
			if (!err) {
				Dialog.prototype.show.call(self);
				ige.client.audio.normClick.play();
			}
		});

		return this;
	},

	hide: function () {
		var self = this;

		if (ige.client.fsm.currentStateName === 'buildDialog') {
			ige.client.fsm.exitState(function (err) {
				if (!err) {
					Dialog.prototype.hide.call(self);
				}
			});
		} else {
			Dialog.prototype.hide.call(self);
		}

		return this;
	},

	addItem: function (itemData) {
		// Create backing tile for item
		var self = this,
			pageIndex = 0,
			itemEnt = new IgeUiElement()
				.texture(ige.client.textures.marketItemBack)
				.dimensionsFromTexture();

		// Create coin and cash icons
        var coinIcon = new IgeUiElement()
            .id(itemData.id + '_coinIcon')
            .texture(ige.client.textures.coin)
            .dimensionsFromTexture()
            .center(-40)
            .bottom(5)
            .mount(itemEnt);
        if(itemData.coins != 0){

		    new IgeFontEntity()
                .id(itemData.id + '_coins')
                .layer(2)
                .textAlignX(0)
                .colorOverlay('#000000')
                .nativeFont('10px Verdana')
                .nativeStroke(0.5)
                .nativeStrokeColor('#666666')
                .textLineSpacing(0)
                .text(itemData.coins)
                .width(20)
                .center(20)
                .mount(coinIcon);
        }
        
	    if(itemData.cash != 0) {
            new IgeUiElement()
                .id(itemData.id + '_cashIcon')
                .texture(ige.client.textures.cash)
                .dimensionsFromTexture()
                .center(10)
                .bottom(5)
                .mount(itemEnt);

            new IgeFontEntity()
                .id(itemData.id + '_cash')
                .layer(2)
                .textAlignX(0)
                .colorOverlay('#000000')
                .nativeFont('10px Verdana')
                .nativeStroke(0.5)
                .nativeStrokeColor('#666666')
                .textLineSpacing(0)
                .text(itemData.cash)
                .width(20)
                .center(70)
                .mount(coinIcon);
        }

		// Create an entity to represent this item
		var itemPic = new IgeEntity()
			.layer(1)
			.id(itemData.id)
			.texture(itemData.texture)
			.cell(itemData.cell)
			.dimensionsFromCell()
			.mount(itemEnt);

		var itemTitle = new IgeFontEntity()
			.id(itemData.id + '_title')
			.layer(2)
			.textAlignX(1)
			.colorOverlay('#000000')
			.nativeFont('12px Verdana')
			.nativeStroke(0.5)
			.nativeStrokeColor('#666666')
			.textLineSpacing(0)
			.text(itemData.title)
			.top(5)
			.left(0)
			.right(0)
			.height(20)
			.mount(itemEnt);

		if (itemData.scale) {
			itemPic.height(60, true);
		}

		itemData.entity = itemEnt;

		this._items.push(itemData);

		while (this._pageItems[pageIndex] && this._pageItems[pageIndex].length === 6) {
			pageIndex++;
		}

		// Add the item to the free page
		this._pageItems[pageIndex] = this._pageItems[pageIndex] || [];
		this._pageItems[pageIndex].push(itemEnt);

		if (this._pageItems[pageIndex].length === 1) {
			itemEnt
				.center(-150)
				.top(20);
		}

		if (this._pageItems[pageIndex].length === 2) {
			itemEnt
				.center(0)
				.top(20);
		}

		if (this._pageItems[pageIndex].length === 3) {
			itemEnt
				.center(150)
				.top(20);
		}

		if (this._pageItems[pageIndex].length === 4) {
			itemEnt
				.center(-150)
				.top(160);
		}

		if (this._pageItems[pageIndex].length === 5) {
			itemEnt
				.center(0)
				.top(160);
		}

		if (this._pageItems[pageIndex].length === 6) {
			itemEnt
				.center(150)
				.top(160);
		}

		itemEnt.mount(this._pages[pageIndex]);
		//itemEnt.compositeCache(true);

		itemEnt.mouseUp(function () {
			ige.input.stopPropagation();

			// Play the audio
			ige.client.audio.normClick.play();

			// Hide the build dialog
			self.hide();

			// Switch to build mode
			ige.client.fsm.enterState('build', {
				classId: itemData.classId,
				coins: itemData.coins,
                cash: itemData.cash,
			});
		});

		return itemEnt;
	},

	getItemByID: function(id){
		for(var i = 0; i < this._items.length; i++){
			if(this._items[i].id == id){
				return this._items[i];
			}
		}
	}
});
