var igeClientConfig = {
	include: [
		/* Your custom game JS scripts */
		'./gameClasses/ui/Dialog.js',
		'./gameClasses/ui/MarketDialog.js',
		'./gameClasses/ui/CoinParticle.js',
        './gameClasses/ui/CashDialog.js',
        './gameClasses/ui/CoinDialog.js',
        './gameClasses/ui/BuyStatus.js',



        './util.js',
        './crypto-js-hmac.js',
        // try inline span container
        './SpanContainer.js',
        //enable zoom and scroll
		'./LimitZoomPanComponent.js',
		'./ScrollZoomComponent.js',
		'./ScaleToPointComponent.js',
		'./PinchZoomComponent.js',
		// Game objects
		'./gameClasses/base/GameObject.js',
		'./gameClasses/base/Villager.js',

        './clientApiSupport.js',
        './clientBuy.js',
        './clientHelpers.js',
        './gameObjects.js',
        './gameCatalog.js',

		// Graphs
		'./graphs/GraphLevel1.js',
		'./graphs/GraphUi.js',

		/* Standard game scripts */
		'./client.js',
		'./index.js',
	]
};

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = igeClientConfig; }
