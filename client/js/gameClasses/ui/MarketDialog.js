var MarketDialog = Dialog.extend({
	classId: 'MarketDialog',

	init: function () {
		Dialog.prototype.init.call(this);
		this.itemCount = parseInt(GameConfig.config['itemCount']);
		this._pageRefs = [];
		this._items = [];
		this._pageItems = [];
		this._pageCount = 0;
		this._activePageNo = 1;

		$('#marketDialogPageTemplate ul li').first().hide();

        this.closeButton.hide();
		this._underlay.hide();
	},

	createSinglePage: function() {
		// So no loop over itemCount ???  how is this hardcoded to 6 now? 
		var self = this,
			pageRef;

		pageRef = $("#marketDialogPageTemplate").clone().prop({ id: "marketDialogPage" + self._pageCount})
			.insertBefore("#marketDialogPagination")
			.hide();

		$("#marketDialogPage" + self._pageCount + " li").remove();

		self._pageRefs["marketDialogPage" + self._pageCount] = pageRef;
	},

	createPages: function(totalPages) {
		var self = this

		for(var i=0; i<totalPages; i++) {
			self._pageCount++;
			self.createSinglePage()
		}

		self.pageTemplate = $('#marketDialogPageTemplate');

		$('#marketDialogPagination').jqPagination({
			max_page: totalPages,
			paged: function(page) {
				self.changeToPage(page);
			}
		});

		self._pageRefs["marketDialogPage" + self._activePageNo].show();
	},

	changeToPage: function(pageNo){
		this._pageRefs["marketDialogPage" + this._activePageNo].hide();
		this._activePageNo = pageNo
		this._pageRefs["marketDialogPage" + pageNo].show();
	},

	show: function () {
		var self = this;

		ige.client.fsm.enterState('marketDialog', null, function (err) {
			if (!err) {
				$('#marketDialogPageTemplate').remove();

				$( "#marketDialog" ).dialog({ resizable: true, draggable: true, closeOnEscape: false, width: 'auto', height: 'auto', modal: true, autoOpen: false, close: function( event, ui ) {self.closeMe();} });
				$( "#marketDialog" ).dialog( "open" );
				Dialog.prototype.show.call(self);
			}
		});

		return this;
	},

	hide: function () {
		var self = this;

		if (ige.client.fsm.currentStateName === 'marketDialog') {
			ige.client.fsm.exitState(function (err) {
				if (!err) {
					$("#marketDialog").dialog();
					$( "#marketDialog" ).dialog( "close" );
					Dialog.prototype.hide.call(self);
				}
			});
		} else {
			$("#marketDialog").dialog();
			$( "#marketDialog" ).dialog( "close" );
			Dialog.prototype.hide.call(self);
		}

		return this;
	},

	addItem: function (itemData) {
		// Create backing tile for item
		var self = this,
			pageIndex = 1,
			clonedItem, options, dummyElem, imgWidth, imgHeight;

		clonedItem = $('#marketDialogPageTemplate ul li').first().clone();
		clonedItem.show().find(".marketItemTitle").first().text(itemData.title);

		options = GameObjects.catalogLookup[itemData.id]
		dummyElem = $("<div class='marketItemImage'></div>").hide().appendTo("body");
		// imgHeight = dummyElem.css("height").substr(0,dummyElem.css("height").indexOf('px'));
		// imgWidth = ige.client.textures[itemData.id]._sizeX / (ige.client.textures[itemData.id]._sizeY / imgHeight)
		// dummyElem.remove();
		clonedItem.find(".marketItemImage").first().attr("src", options.iconUrl);
		//
		// clonedItem.find(".marketItemImage").first().css("background-image","url(" + options.textureUrl + ")")
		// 	.css("width", imgWidth / ige.client.textures[itemData.id]._cellColumns + "px")
		// 	.css("background-size", imgWidth + "px " + imgHeight + "px")
		// 	.css("background-position-x", imgWidth / ige.client.textures[itemData.id]._cellColumns + "px");

		if(itemData.coins != 0)
			clonedItem.find(".marketItemCoins").contents().last()[0].textContent=itemData.coins;
		else
			clonedItem.find(".marketItemCoins").first().remove();
		if(itemData.cash != 0)
			clonedItem.find(".marketItemCash").contents().last()[0].textContent=itemData.cash;
		else
			clonedItem.find(".marketItemCash").first().remove();

		// how does this work without being wrapped in a condition block ???
		itemData.entity = clonedItem;
		itemData.unlockButton = clonedItem.find(".unlock").first();
		itemData.unlockprice = itemData.unlockButton.find(".unlockprice").first();
		// need to update to no dependencies or unlocked.
		if(itemData.dependency === "none" || $.inArray(itemData.id, API.state.unlockedItems)>= 0) {
			self.removeItemCover(itemData);
			self.bindItemAction(itemData);
		}else{
			clonedItem.addClass("locked");
			// display price.  		price.cash = itemData.unlockValue;
			itemData.unlockprice.text(itemData.unlockValue);
			itemData.unlockButton.click(function (event) {
				event.stopPropagation();
				self.hide();
				self.unlockItemByCash(itemData);
			});
		}

		this._items.push(itemData);

		while (this._pageItems[pageIndex] && this._pageItems[pageIndex].length === this.itemCount) {
			pageIndex++;
		}

		$('#marketDialogPage' + pageIndex + ' ul').append(clonedItem);

		// Add the item to the free page
		this._pageItems[pageIndex] = this._pageItems[pageIndex] || [];
		this._pageItems[pageIndex].push(itemData);

		return clonedItem;
	},

	unlockItemByCash: function(itemData){
		var message, callback, price = {coins:0}, self = this;

		price.cash = itemData.unlockValue;

		//show are you sure and reduce assets
		message  = 'Unlock ' + itemData.title + ' for ' + price.cash + ' VBucks?';

		callBack = function() {
			if(!API.reduceAssets(
					{coins: parseInt(price.coins, 10),
						cash: parseInt(price.cash, 10)}).status) {
				// Not enough money?
				mixpanel.track("Not enough money");
				new BuyConfirm(GameConfig.config['notEnoughCashString'],
					function () {
						ige.$('cashDialog').show();
					})
					.layer(1)
					.show()
					.mount(ige.$('uiScene'));
				self.hide();
				return;
			}
			self.removeItemCover(itemData);
			self.bindItemAction(itemData);
			self.showUnlockMessage(itemData.title);
			API.addUnlockedItem(itemData.id);
		}

		var cashDialog = new BuyConfirm(message,callBack)
			.layer(100)
			.show()
			.mount(ige.$('uiScene'));
	},

	removeItemCover:function(itemData){
		if(itemData.unlockButton){
			itemData.unlockButton.remove();
			itemData.unlockButton = null;
			itemData.entity.removeClass('locked');
		}
	},

	bindItemAction: function(itemData){
		var self = this;

		itemData.entity.click(function () {
			ige.input.stopPropagation();

			// Play the audio
			// ige.client.audio.normClick.play();
			vlg.sfx['select'].play();

			// Hide the build dialog
			self.hide();

			// Switch to build mode
			ige.client.fsm.enterState('build', {
				classId: itemData.classId,
				coins: itemData.coins,
				cash: itemData.cash,
			});
		});
	},

	showUnlockMessage: function(itemName){
		ClientHelpers.showMessage(itemName + ' is unlocked!');
	},

	getItemByID: function(id){
		for(var i = 0; i < this._items.length; i++){
			if(this._items[i].id == id){
				return this._items[i];
			}
		}
		return null;
	}
});
