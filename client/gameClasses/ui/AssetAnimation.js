var AssetAnimation = IgeEntity.extend({
    classId: 'AssetAnimation',

    init: function (name, texture, moveTo) {
        IgeEntity.prototype.init.call(this);

        var self = this;

        self.totalObjects = 15;
        self.objects = [];
        self.tweenRefs = [];
        self._moveTo = moveTo;

        var animationClosure = function(i){
            var obj = new IgeEntity()
                .layer(100)
                .width(14)
                .height(11)
                .texture(ige.client.textures[texture])
                .translateTo(-20 + Math.floor(Math.random() * (10 - 0 + 1)) + 0, 20 + Math.floor(Math.random() * (5 - 15 + 1)) + 5,0)
                .mount(self);

            obj.tweenRef = obj._translate.tween()
                .stepBy({
                    x: 20,
                }, 400, 'inOutSine')
                .stepBy({
                    x: -20,
                }, 400, 'inOutSine')
                .repeatMode(1, -1)
                .startTime(ige._currentTime + i * 100)
                .start();

            self.tweenRefs.push(obj.tweenRef)

            obj.tweenRef = obj._translate.tween()
                .stepBy({
                    y: -40
                }, 200, 'outSine')
                .stepBy({
                    y: 40
                }, 200, 'inSine')
                .repeatMode(1, -1)
                .startTime(ige._currentTime + i * 100)
                .start();

            self.tweenRefs.push(obj.tweenRef)

            return obj;
        }

        for(var i = 0; i < self.totalObjects; i++){
            var animationObject = new animationClosure(i);
            self.objects[i] = animationObject;
        }
    },

    gotoTopNavBar: function(){
        var self = this;

        for(var i = 0; i < self.tweenRefs.length; i++)
            self.tweenRefs[i].stop();

        for(var i = 0; i < self.totalObjects; i++){
            (function(i){
                self.objects[i]._translate.tween()
                    .stepTo({
                        x: ige.$(self._moveTo).translate().x() - self.translate().x(),
                        y: ige.$('topNav').translate().y() - self.translate().y()
                    },500,'inSine')
                    .afterTween(function(tween){
                        self.objects[i].hide()})
                    .startTime(ige._currentTime + i * 30)
                    .start();
            })(i)
        }
    }
});