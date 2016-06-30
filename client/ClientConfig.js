var igeClientConfig = {
	include: [
		/* Your custom game JS scripts */
		'/client/gameClasses/Goals.js',
		'/client/gameClasses/EventEmitter.js',
		'/client/gameClasses/ui/AssetAnimation.js',
		'/client/gameClasses/RewardMechanism.js',
		'/client/gameClasses/GameLogic.js',
		'/client/gameClasses/EditorManager.js',
		'/client/gameClasses/ui/Dialog.js',
		'/client/gameClasses/ui/MarketDialog.js',
		'/client/gameClasses/ui/EditorDialog.js',
		'/client/gameClasses/ui/CoinParticle.js',
        '/client/gameClasses/ui/CashDialog.js',
        '/client/gameClasses/ui/CoinDialog.js',
        '/client/gameClasses/ui/BuyStatus.js',
        '/client/gameClasses/ui/BuyConfirm.js',
		'/client/gameClasses/ui/TutorialViews.js',
		'/client/gameClasses/ui/EditorViews.js',
		'/client/gameClasses/ui/Tutorial.js',

        '/client/util.js',
        '/client/crypto-js-hmac.js',
        // try inline span container
        '/client/SpanContainer.js',
        //enable zoom and scroll
		'/client/LimitZoomPanComponent.js',
		'/client/ScrollZoomComponent.js',
		'/client/ScaleToPointComponent.js',
		'/client/PinchZoomComponent.js',
		// Game objects
		'/client/gameClasses/base/GameObject.js',
		'/client/gameClasses/base/Villager.js',
		'/client/gameClasses/base/HiEntity.js',

		'/client/GameAssets.js',
		'/client/GameEarnings.js',
		'/client/GameGoals.js',
		'/client/DropDownMenu.js',
        '/client/clientApiSupport.js',
        '/client/clientBuy.js',
        '/client/clientHelpers.js',
        '/client/gameObjects.js',
        '/client/gameCatalog.js',
       /* '/client/NewsFeed.js', */

		// Graphs
		'/client/graphs/GraphLevel1.js',
		'/client/graphs/GraphTutorial.js',
		'/client/graphs/GraphEditor.js',
		'/client/graphs/GraphView.js',
		'/client/graphs/GraphUi.js',
		'/client/graphs/GraphUiEditor.js',

		/* Standard game scripts */
		'/client/client.js',
		'/client/index.js',
	]
};

if (typeof(module) !== 'undefined' && typeof(module.exports) !== 'undefined') { module.exports = igeClientConfig; }
