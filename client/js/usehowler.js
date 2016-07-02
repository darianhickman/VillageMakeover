/**
 * Created by darianhickman on 7/1/16.
 */

// need to feed one global var called vlg. to this file. 
// move this to a js file when it grows too much.
//intentional global variable to avoid namespace collisions.
// so to enable some sound before ige classes finish loading let's make a named function and call at document.ready and
// inside gameconfig finished loading.
//maybe don't need $(document).ready . some bloggers say putting scripts at bottom of page is good enough.


function soundinit() {
    vlg.sfx = {};  // sound effects
    vlg.music = {};  // sound tracks or music to play at stages of gameplay.
    //ideal design is that events in the game
    if (GameConfig.config['defaultClickSound'] !== undefined){
        console.log("using sounds from GameConfig loaded from config sheet.");
        console.log("defaultClickSound", GameConfig.config['defaultClickSound']);
        // need to upgrade this to not hard coded.
        vlg.sfx['select'] = new Howl({urls: [GameConfig.config['defaultClickSound']]});
        vlg.sfx['build'] = new Howl({urls: [GameConfig.config['defaultBuildSound']], volume: 0.6});


    }else{
        console.log("using sounds urls hardcoded in usehowler.js");
        vlg.sfx['select'] = new Howl({urls: ['/client/assets/audio/click.mp3'], volume: 0.6});
        vlg.sfx['cancel'] = new Howl({urls: ['/client/assets/audio/cancel.mp3']});

    }

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

    // play intro music.  If the load screen is part of game fsm then we can control this inside the FSM in
    // client.js  for better organization.
    vlg.music['welcome'].fadeIn(1.0, 2000);

    //bind click all the buttons in topToolBar
    // awesome if this works ... no coding the iteration. yay!!! it works!!

    $('#topToolbar').children().click(function () {
        vlg.sfx['select'].play();
    });

    // bind sfx to all the close buttons.
    $('.ui-icon-closethick').click(function () {
        vlg.sfx['cancel'].play();
    });


} // end soundinit()

$(document).ready(soundinit());
vlg.soundinit = soundinit;
