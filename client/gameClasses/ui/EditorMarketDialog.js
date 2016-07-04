var EditorMarketDialog = Dialog.extend({
	classId: 'EditorMarketDialog',

	init: function () {
		Dialog.prototype.init.call(this);
		EditorMarketDialog.prototype.isMarketSet = EditorMarketDialog.prototype.isMarketSet || false;

		this._pageRefs = [];
		this._items = [];
		this._pageItems = [];
		this._pageCount = 0;
		this._activePageNo = 1;

		$('#editorMarketDialogPageTemplate ul li').first().hide();

		this.closeButton.hide();
		this._underlay.hide();
	},

	createSinglePage: function() {
		var self = this,
			pageRef;

		pageRef = $("#editorMarketDialogPageTemplate").clone().prop({ id: "editorMarketDialogPage" + self._pageCount})
			.insertBefore("#editorMarketDialogPagination")
			.hide();

		$("#editorMarketDialogPage" + self._pageCount + " li").remove();

		self._pageRefs["editorMarketDialogPage" + self._pageCount] = pageRef;
	},

	createPages: function(totalPages) {
		var self = this

		for(var i=0; i<totalPages; i++) {
			self._pageCount++;
			self.createSinglePage()
		}

		self.pageTemplate = $('#editorMarketDialogPageTemplate');

		$('#editorMarketDialogPagination').jqPagination({
			max_page: totalPages,
			paged: function(page) {
				self.changeToPage(page);
			}
		});

		self._pageRefs["editorMarketDialogPage" + self._activePageNo].show();
	},

	changeToPage: function(pageNo){
		this._pageRefs["editorMarketDialogPage" + this._activePageNo].hide();
		this._activePageNo = pageNo
		this._pageRefs["editorMarketDialogPage" + pageNo].show();
	},

	show: function () {
		var self = this;

		ige.client.fsm.enterState('editorMarketDialog', null, function (err) {
			if (!err) {
				$( "#editorMarketDialog" ).dialog({ resizable: false, draggable: false, closeOnEscape: false, width: 'auto', height: 'auto', modal: true, autoOpen: false, close: function( event, ui ) {self.closeMe();} });
				$( "#editorMarketDialog" ).dialog( "open" );
				Dialog.prototype.show.call(self);
				// ige.client.audio.normClick.play();
				vlg.sfx['select'].play();

			}
		});

		return this;
	},

	hide: function () {
		var self = this;

		if (ige.client.fsm.currentStateName === 'editorMarketDialog') {
			ige.client.fsm.exitState(function (err) {
				if (!err) {
					$("#editorMarketDialog").dialog();
					$("#editorMarketDialog").dialog( "close" );
					Dialog.prototype.hide.call(self);
				}
			});
		} else {
			$("#editorMarketDialog").dialog();
			$("#editorMarketDialog").dialog( "close" );
			Dialog.prototype.hide.call(self);
		}

		return this;
	},

	addItem: function (itemData) {
		// Create backing tile for item
		var self = this,
			pageIndex = 1,
			clonedItem, options, dummyElem, imgWidth, imgHeight;

		clonedItem = $('#editorMarketDialogPageTemplate ul li').first().clone();
		clonedItem.show().find(".marketItemTitle").first().text(itemData.title);

		options = GameObjects.catalogLookup[itemData.classId]
		dummyElem = $("<div class='marketItemImage'></div>").hide().appendTo("body");
		imgHeight = dummyElem.css("height").substr(0,dummyElem.css("height").indexOf('px'));
		imgWidth = ige.client.textures[itemData.classId]._sizeX / (ige.client.textures[itemData.classId]._sizeY / imgHeight)
		dummyElem.remove();

		clonedItem.find(".marketItemImage").first().css("background-image","url(" + options.textureUrl + ")")
			.css("width", imgWidth / ige.client.textures[itemData.classId]._cellColumns + "px")
			.css("background-size", imgWidth + "px " + imgHeight + "px")
			.css("background-position-x", imgWidth / ige.client.textures[itemData.classId]._cellColumns + "px");

		clonedItem.click(function () {
			ige.input.stopPropagation();

			// Play the audio
			// ige.client.audio.normClick.play();
			vlg.sfx['select'].play();

			// Hide the build dialog
			self.hide();

			// Switch to build mode
			ige.client.fsm.enterState('editorBuild', {
				classId: itemData.classId,
				coins: itemData.coins,
				cash: itemData.cash,
			});
		});

		this._items.push(itemData);

		while (this._pageItems[pageIndex] && this._pageItems[pageIndex].length === 6) {
			pageIndex++;
		}

		$('#editorMarketDialogPage' + pageIndex + ' ul').append(clonedItem);

		// Add the item to the free page
		this._pageItems[pageIndex] = this._pageItems[pageIndex] || [];
		this._pageItems[pageIndex].push(itemData);

		return clonedItem;
	}
});
