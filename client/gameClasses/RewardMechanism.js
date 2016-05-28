var RewardMechanism = IgeEventingClass.extend({
    classId: 'RewardMechanism',

    init: function () {
        var self = this,
            textureList = JSON.parse(GameConfig.config['rewardMechanismTextureList']);

        self.uiScene = ige.$('uiScene');
        self.textureListLookup = {};

        for(var i = 0; i < textureList.length; i++){
            self.textureListLookup[textureList[i].name] = textureList[i];
        }
    },

    claimReward: function(assetName, amount, translateObj){
        var self = this
            _translateObj = translateObj || {x:-self.uiScene._renderPos.x,y:-self.uiScene._renderPos.y,z:0};

        _translateObj.x += self.uiScene._renderPos.x;
        _translateObj.y += self.uiScene._renderPos.y;

        switch(assetName){
            case "xp":
                //add xp
                break;
            case "coins":
                API.addCoins(parseInt(amount))
                break;
            case "cash":
                API.addCash(parseInt(amount))
                break;
        }

        self.showVillageDashFont(self.textureListLookup[assetName].mount, amount);

        var animation = new AssetAnimation(assetName, self.textureListLookup[assetName].texture, self.textureListLookup[assetName].mount)
            .drawBounds(true)
            .width(50)
            .height(60)
            .translateTo(_translateObj.x,_translateObj.y,_translateObj.z)
            .mount(self.uiScene);

        new IgeTimeout(function () { animation.gotoTopNavBar(); }, parseInt(GameConfig.config['assetAnimationTimerDuration']) * 1000);

        animation.mouseOver(function(){
            animation.gotoTopNavBar();
        });
    },

    showVillageDashFont: function(mountTo, amount){
        var valueFontEntity = new IgeFontEntity()
            .texture(ige.client.textures.villagedashFont)
            .text(amount)
            .width(200)
            .translateTo(20,50,0)
            .mount(ige.$(mountTo))

        valueFontEntity._translate.tween()
            .stepTo({
                y: 30
            },500,'inOutSine')
            .start();

        valueFontEntity.tween()
            .properties({
                _opacity: 0
            })
            .duration(2000)
            .afterTween(function(){
                valueFontEntity.destroy()
            })
            .start();
    }
})