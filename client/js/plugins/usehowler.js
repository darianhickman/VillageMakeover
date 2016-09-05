/**
 * Created by darianhickman on 7/1/16.
 */
/*

    need to feed one global var called vlg. to this file.
    intentional global variable to avoid namespace collisions.
    so to enable some sound before ige classes finish loading let's make a named function and call at document.ready and
    inside gameconfig finished loading.
    maybe don't need $(document).ready . some bloggers say putting scripts at bottom of page is good enough.
*/


function soundinit() {
    vlg.sfx = {};  // sound effects
    vlg.music = {};  // sound tracks or music to play at stages of gameplay.
    vlg.muted = false;
    vlg.isSFXOn = true;
    vlg.isMusicOn = true;
    //ideal design is that events in the game know the sounds that go with their trigger.


    (function(play){
        Howl.prototype.play = function(sprite, callback){
            var self = this;
            if(self.audioType === "SFX" && !vlg.isSFXOn){
                return self;
            }
            else if(self.audioType === "MUSIC" && !vlg.isMusicOn){
                return self;
            }
            else{
                play.call(self, sprite, callback);
            }
            return self;
        }
    }(Howl.prototype.play));

    // after 5 minutes milestones rewrite all of this to dynamically load sound from config sheet of events
    if (GameConfig.config['defaultClickSound'] !== undefined) {
        console.log("using sounds from GameConfig loaded from config sheet.");
        console.log("defaultClickSound", GameConfig.config['defaultClickSound']);
        // need to upgrade this to not hard coded.

        vlg.sfx['select'] = new Howl({urls: [GameConfig.config['defaultClickSound']], volume: 1.0});
        vlg.sfx['build'] = new Howl({urls: [GameConfig.config['defaultBuildSound']], volume: 0.6});
        vlg.sfx['cancel'] = new Howl({urls: [GameConfig.config['defaultCancelSound']], volume: 0.8});
        //cheating a little.
        vlg.music['welcome'] = new Howl({
            urls: ['/client/assets/audio/music/Welcome.wav'],
            autoplay: true,
            loop: false,
            volume: 1.0
        });

        vlg.music['levelfull1'] = new Howl({
            urls: ['/client/assets/audio/music/Level1Full.wav'],
            autoplay: false,
            loop: true,
            volume: 1.0
        });

        vlg.sfx['select'].audioType = "SFX";
        vlg.sfx['build'].audioType = "SFX";
        vlg.sfx['cancel'].audioType = "SFX";
        vlg.music['welcome'].audioType = "Music";
        vlg.music['levelfull1'].audioType = "Music";

    } else {
        // use hardcoded sound if config sheet sound not ready.

        console.log("using sounds urls hardcoded in usehowler.js");
        vlg.sfx['select'] = new Howl({urls: ['/client/assets/audio/click.mp3'], volume: 1.0});
        vlg.sfx['cancel'] = new Howl({urls: ['/client/assets/audio/cancel.mp3'], volume: 0.9});
        vlg.music['welcome'] = new Howl({
            urls: ['/client/assets/audio/music/Welcome.wav'],
            autoplay: false,
            loop: false,
            volume: 1.0
        });

        vlg.music['levelfull1'] = new Howl({
            urls: ['/client/assets/audio/music/Level1Full.wav'],
            autoplay: false,
            loop: true,
            volume: 1.0
        });

    }
} // end soundinit()

function afterplay(id){
    vlg.log.info('Played ', id);
}

function bindSounds() {
    vlg.log.info('binding sound');

    // add triggers for sfx.
    $('#goalButton').click(function (e){
        vlg.log.debug('#goalButton click   .', e);
    });
    $('#topToolbar').click(function (e){
       vlg.log.info('toptoolbar click', e);
    });

    $('#topToolbar').children().click(function (e) {
        vlg.log.debug(' toolbar children click .', e);
        vlg.sfx['select'].play(afterplay);
    });

    // bind sfx to all the close buttons.
    $('.ui-dialog-titlebar-close').click(function () {
        vlg.log.debug('binding cancel sound to cancel buttons.');
        vlg.sfx['cancel'].play();
    });
}

function toggleSound(){
    vlg.log.info('toggling Sound ', vlg.muted);
    if (vlg.muted){
        Howler.unmute();
        vlg.muted = false;
    } else{
        Howler.mute();
        vlg.muted = true;
    }
    vlg.log.info('now ', vlg.muted);

    return vlg.muted;
}

function toggleMusic(){
    if (vlg.isMusicOn){
        vlg.music['levelfull1'].volume(1);
    } else{
        vlg.music['levelfull1'].volume(0);
    }
}

vlg.soundinit = soundinit;
vlg.bindSounds = bindSounds;
vlg.toggleSound = toggleSound;


// call sound init on first load.
$(document).ready(function (){
    vlg.log.info('Enabling sound and mute');
    //vlg.soundinit();
    // enable mute button right away
    $('#volume').click(function(){
        vlg.toggleSound();
        $( "#volume" ).find('img').toggle();
    });
    vlg.log.debug('#volume', $('#volume'));
    vlg.log.debug('#volume kids', $('#volume').children());
    vlg.log.debug('toogleSound ', vlg.toggleSound);

});