var igeClientConfig = {
	include: [
		/* Your custom game JS scripts */
		'/js/gameClasses/managers/Goals.js',
		'/js/gameClasses/managers/EventEmitter.js',
		'/js/gameClasses/ui/AssetAnimation.js',
		'/js/gameClasses/managers/RewardMechanism.js',
		'/js/gameClasses/managers/GameLogic.js',
		'/js/gameClasses/managers/EditorManager.js',
		'/js/gameClasses/ui/Dialog.js',
		'/js/gameClasses/ui/MarketDialog.js',
		'/js/gameClasses/ui/EditorMarketDialog.js',
		'/js/gameClasses/ui/CoinParticle.js',
        '/js/gameClasses/ui/CashDialog.js',
        '/js/gameClasses/ui/CoinDialog.js',
        '/js/gameClasses/ui/WaterDialog.js',
        '/js/gameClasses/ui/BuyStatus.js',
        '/js/gameClasses/ui/BuyConfirm.js',
		'/js/gameClasses/ui/TutorialViews.js',
		'/js/gameClasses/ui/EditorViews.js',
		'/js/gameClasses/managers/Tutorial.js',

        '/js/gameClasses/misc/util.js',
        '/js/plugins/crypto-js-hmac.js',
        // try inline span container
        '/js/gameClasses/misc/SpanContainer.js',
        //enable zoom and scroll
		'/js/gameClasses/components/LimitZoomPanComponent.js',
		'/js/gameClasses/components/ScrollZoomComponent.js',
		'/js/gameClasses/components/ScaleToPointComponent.js',
		'/js/gameClasses/components/PinchZoomComponent.js',
		// Game objects
		'/js/gameClasses/base/GameObject.js',
		'/js/gameClasses/base/Villager.js',
		'/js/gameClasses/base/HiEntity.js',

		'/js/gameClasses/loaders/GameAssets.js',
		'/js/gameClasses/loaders/GameEarnings.js',
		'/js/gameClasses/loaders/GameGoals.js',
		'/js/gameClasses/loaders/DropDownMenu.js',
		'/js/gameClasses/loaders/SpecialEvents.js',
        '/js/gameClasses/misc/clientApiSupport.js',
        '/js/gameClasses/misc/clientBuy.js',
        '/js/gameClasses/misc/clientHelpers.js',
        '/js/gameClasses/misc/gameObjects.js',
        '/js/gameClasses/loaders/gameCatalog.js',
       /* '/js/gameClasses/loaders/NewsFeed.js', */

		// Graphs
		'/js/gameClasses/graphs/GraphLevel1.js',
		'/js/gameClasses/graphs/GraphTutorial.js',
		'/js/gameClasses/graphs/GraphEditor.js',
		'/js/gameClasses/graphs/GraphView.js',
		'/js/gameClasses/graphs/GraphUi.js',
		'/js/gameClasses/graphs/GraphUiEditor.js',

		/* Standard game scripts */
		'/js/gameClasses/client.js',
		'/js/gameClasses/index.js',
	]
};

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = igeClientConfig; }
