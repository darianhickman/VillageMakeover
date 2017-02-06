var LoginManager = IgeEventingClass.extend({
    classId: 'LoginManager',

    init: function (goals) {

        var self = this;

        window.signInCallback = function (authResult) {
            if (authResult['code']) {
                // Send the code to the server
                $.ajax({
                    url: '/api/login',
                    contentType: "application/json; charset=utf-8",
                    type: 'POST',
                    data: JSON.stringify({code: authResult['code']}),
                    error: function (jqXHR, textStatus, errorThrown) {
                        if (jqXHR.status === 401) {
                            $( "#processingContent" )
                                .html( "<div><p>Not authorized to log in!</p>" +
                                "<p><button id='closeProcessingDialog'>Close</button></p></div>" );

                            $('#closeProcessingDialog').on('click', function(){
                                $( "#processingDialog" ).dialog( "close" );
                            });
                        }
                        else {
                            $( "#processingContent" )
                                .html( "<div><p>There was an error contacting the server!<br />Please try again later.</p>" +
                                "<p><button id='closeProcessingDialog'>Close</button></p></div>" );

                            $('#closeProcessingDialog').on('click', function(){
                                $( "#processingDialog" ).dialog( "close" );
                            });
                        }
                    },
                    success: function (result) {
                        dataLayer.push({'userEmail': result.email});
                        dataLayer.push({'event': 'userLogin'});
                        ige.client.fsm.enterState('reloadGame');
                    },
                    processData: false,
                });
            } else {
                $( "#processingContent" )
                    .html( "<div><p>There was an error contacting the server!<br />Please try again later.</p>" +
                    "<p><button id='closeProcessingDialog'>Close</button></p></div>" );

                $('#closeProcessingDialog').on('click', function(){
                    $( "#processingDialog" ).dialog( "close" );
                });
            }
        }

        gapi.load('auth2', function () {
            auth2 = gapi.auth2.init({
                client_id: GameConfig.config['clientID'],
                // Scopes to request in addition to 'profile' and 'email'
                scope: 'https://www.googleapis.com/auth/groups https://www.googleapis.com/auth/plus.me'
            });
        });
    },

    login: function () {
        auth2.grantOfflineAccess({'redirect_uri': 'postmessage'}).then(signInCallback);
    },

    logout: function () {
        auth2.signOut().then(function () {
            $.ajax({
                url: '/api/logout',
                error: function (jqXHR, textStatus, errorThrown) {
                    $( "#processingContent" )
                        .html( "<div><p>There was an error contacting the server!<br />Please try again later.</p>" +
                        "<p><button id='closeProcessingDialog'>Close</button></p></div>" );

                    $('#closeProcessingDialog').on('click', function(){
                        $( "#processingDialog" ).dialog( "close" );
                    });
                },
                success: function (result) {
                    dataLayer.push({'event': 'userLogout'});
                    ige.client.fsm.enterState('reloadGame');
                }
            });
        });
    },

});