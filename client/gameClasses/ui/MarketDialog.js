var MarketDialog = Dialog.extend({
	classId: 'MarketDialog',

	init: function () {
		Dialog.prototype.init.call(this);

		this._pageRefs = [];
		this._items = [];
		this._pageItems = [];
		this._pageCount = 0;
		this._activePageNo = 1;

        this.closeButton.hide();
		this._underlay.hide();
	},

	createSinglePage: function() {
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

		$('.pagination').jqPagination({
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

		ige.client.fsm.enterState('buildDialog', null, function (err) {
			if (!err) {
				$( "#marketDialog" ).dialog({ resizable: false, draggable: false, closeOnEscape: false, width: 'auto', height: 'auto', modal: true, autoOpen: false, close: function( event, ui ) {self.closeMe();} });
				$( "#marketDialog" ).dialog( "open" );
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
		clonedItem.find(".marketItemTitle").first().text(itemData.title);

		options = GameObjects.catalogLookup[itemData.id]
		dummyElem = $("<div class='marketItemImage'></div>").hide().appendTo("body");
		imgHeight = dummyElem.css("height").substr(0,dummyElem.css("height").indexOf('px'));
		imgWidth = ige.client.textures[itemData.id]._sizeX / (ige.client.textures[itemData.id]._sizeY / imgHeight)
		dummyElem.remove();

		clonedItem.find(".marketItemImage").first().css("background-image","url(" + options.textureUrl + ")")
			.css("width", imgWidth / ige.client.textures[itemData.id]._cellColumns + "px")
			.css("background-size", imgWidth + "px " + imgHeight + "px")
			.css("background-position-x", imgWidth / ige.client.textures[itemData.id]._cellColumns + "px");

		if(itemData.coins != 0)
			clonedItem.find(".marketItemCoins").contents().last()[0].textContent=itemData.coins;
		else
			clonedItem.find(".marketItemCoins").first().remove();
		if(itemData.cash != 0)
			clonedItem.find(".marketItemCash").contents().last()[0].textContent=itemData.cash;
		else
			clonedItem.find(".marketItemCash").first().remove();

		itemData.coverEntity = clonedItem.find(".marketItemCover").first();

		if(itemData.dependency === "none") {
			itemData.coverEntity.remove();
			itemData.coverEntity = null;
		}else{
			itemData.coverEntity.click(function (event) {
				event.stopPropagation();
				self.hide();
				self.unlockItemByCash(itemData);
			});
		}

		clonedItem.click(function () {
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

		this._items.push(itemData);

		while (this._pageItems[pageIndex] && this._pageItems[pageIndex].length === 6) {
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
		message  = 'Unlock ' + itemData.title + ' for ' + price.cash + ' villagebucks?';

		callBack = function() {
			if(!API.reduceAssets(
					{coins: parseInt(price.coins, 10),
						cash: parseInt(price.cash, 10)})) {
				// Not enough money?
				mixpanel.track("Not enough money");
				ige.$('cashDialog').show();
				self.hide();
				return;
			}
			self.removeItemCover(itemData);
			self.showUnlockMessage(itemData.title);
			API.addUnlockedItem(itemData.id);
		}

		var cashDialog = new BuyConfirm(message,callBack)
			.layer(100)
			.show()
			.mount(ige.$('uiScene'));
	},

	removeItemCover:function(itemData){
		if(itemData.coverEntity){
			itemData.coverEntity.remove();
			itemData.coverEntity = null;
		}
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
