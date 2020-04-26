// This is the actual game code file (feildmaster)
/* global moment, onOpenChat, mobile */

var selfId;
var selfUsername;
var selfLevel;
var selfGroups;
var selfMainGroup;
var selfDivision;
var selfFriends;

var socketChat;

var chatsListOpen = false;

var lastChatId = "chat-en";

var windows_focus_chat = true;

var usernames = [];

var autoCompleteUsername = null;
var usernamesIncrement = 0;

var chatEmotes = [];
var emotesOpen = false;
var emoteDialog;
var chatRoomEmote;

//Options
var rainbowEnabled = localStorage.getItem("chatRainbowDisabled") === null;
var soundsEnabled = localStorage.getItem("chatSoundsDisabled") === null;
var chatAvatarsEnabled = localStorage.getItem("chatAvatarsDisabled") === null;


var url;

if (location.hostname === "localhost" || location.hostname === "127.0.0.1" || location.hostname.startsWith("192.168.")) {
    url = "ws://" + location.hostname + ":8080/chat";
} else {
    url = "wss://" + location.hostname + "/chat";
}


socketChat = new WebSocket(url);
socketChat.onmessage = onMessageChat;
socketChat.onclose = onCloseChat;
socketChat.onopen = onOpenChat;


function onOpenChat() {

    if (localStorage.getItem("firstVisit") !== null) {
        for (var i = 0; i < localStorage.length; i++) {
            if (localStorage.key(i).startsWith("chat")) {
                openRoom(localStorage.key(i));
            } else if (localStorage.key(i).startsWith("pm-chat")) {
                var chatDatas = JSON.parse(localStorage.getItem(localStorage.key(i)));
                openPrivateRoom(chatDatas.idFriend, chatDatas.nameFriend.replace("'", ""));
            }
        }

    } else {
        var userLang = navigator.language || navigator.userLanguage;

        openRoom("chat-discussion");
        openRoom("chat-" + getLanguage());

        localStorage.setItem("firstVisit", "true");
    }

    if (location.href.indexOf("Friends") !== -1) {
        socketChat.send(JSON.stringify({action: "getOnlineFriends"}));
    }

    setInterval(function () {
        socketChat.send(JSON.stringify({ping: "pong"}));
    }, 9000);

    document.addEventListener('visibilitychange', function () {
        if (document.visibilityState === 'hidden') {
            windows_focus_chat = false;
        } else {
            windows_focus_chat = true;
        }
    });

}

function onCloseChat() {
    $('.chat-messages').append('<li class="red">' + $.i18n("chat-disconnected") + '</li>');
    scrollAll();
}

function timeout(idUser, seconds) {
    socketChat.send(JSON.stringify({action: "timeout", id: idUser, seconds: seconds}));
}

function onMessageChat(event) {

    var data = JSON.parse(event.data);

    if (data.action === "getHistory") {

        var chatHistory = JSON.parse(data.history);

        $('#' + data.room).remove();

        $('body').append('<div class="chat-box chat-public" id="' + data.room + '"><div class="chat-header">' + $.i18n(data.roomName.toLowerCase()) + '<div class="btn-group pull-right">' + $.i18n("chat-online") + ' (' + data.onlines + ') <span class="chat-minus glyphicon glyphicon-minus"></span> <span class="chat-close glyphicon glyphicon-remove"></span></div></div><ul class="chat-messages"></ul><div class="chat-footer"><form class="chat-form"><input autocomplete="off" type="text" class="chat-text" maxlength="250" onkeydown="autoComplete(this, event);"/><input type="submit" hidden></form><span class="emoteIconChat glyphicon glyphicon-comment" onclick="showChatEmotes(\'' + data.room + '\')"></span></div></div>');

        if (!mobile) {
            $('#' + data.room).resizable({
                maxHeight: 700,
                maxWidth: 900,
                minHeight: 150,
                minWidth: 250
            });
        }

        $('#' + data.room).draggable({
            cursor: 'move',
            handle: '.chat-header',
            containment: 'document'
        });

        if (localStorage.getItem(data.room) !== null) {
            var infos = JSON.parse(localStorage.getItem(data.room));
            $('#' + data.room).height(infos.height);
            $('#' + data.room).width(infos.width);
            if (infos.x < $(document).width()) {
                $('#' + data.room).css('left', infos.x);
            } else {
                $('#' + data.room).css('left', 50);
            }
            var body = document.body,
                html = document.documentElement;
            var height = Math.max(body.scrollHeight, body.offsetHeight,
                html.clientHeight, html.scrollHeight, html.offsetHeight);
            if (infos.y < height) {
                $('#' + data.room).css('top', infos.y);
            } else {
                $('#' + data.room).css('top', randInt(50, 400));
            }
        } else {
            $('#' + data.room).css('left', 50);
            $('#' + data.room).css('top', randInt(50, 400));
        }

        saveChat(data.room);

        for (var i = 0; i < chatHistory.length; i++) {

            var user = chatHistory[i].user;
            var mainGroup = user.mainGroup.name;
            var icons = "";
//okay this is some onucode at its finest wtf nvm what I said about onu's code being readable
            for (var j = user.groups.length - 1; j >= 0; j--) {
                var userGroup = user.groups[j];
                if (userGroup.icon !== undefined) {
                    if (userGroup.priority <= 8) {
                        if (userGroup.id === user.mainGroup.id) {
                            icons = icons + '<a href="Staff" target="_blank"><img src="images/' + userGroup.icon + '.png" title="' + userGroup.name + '" class="groupIcon"/></a>';
                        }
                    } else if (userGroup.name === "Contributor") {
                        icons = icons + '<a href="Shop" target="_blank"><img src="images/' + userGroup.icon + '.png" title="' + userGroup.name + '" class="groupIcon"/></a>';
                    } else if (userGroup.name === "Recruiter") {
                        icons = icons + '<a href="Referrals" target="_blank"><img src="images/' + userGroup.icon + '.png" title="' + userGroup.name + '" class="groupIcon"/></a>';
                    } else {
                        icons = icons + '<img src="images/' + userGroup.icon + '.png" title="' + userGroup.name + '" class="groupIcon"/>';
                    }
                }
            }

            if (!chatHistory[i].deleted) {

                var avatars = "";

                if (chatAvatarsEnabled) {

                    var shinyAvatar = "";

                    if (user.shinyAvatar) {
                        shinyAvatar = '<img src="images/shinyAvatar.gif" class="rainbowAvatar" draggable="false">';
                    }

                    avatars = '<div class="avatarGroup"><img class="avatar ' + user.avatar.rarity + '" src="images/avatars/' + user.avatar.image + '.' + user.avatar.extension + '" />' + shinyAvatar + '</div> ';
                }

                var rainbow = "";
                if (chatHistory[i].rainbow && rainbowEnabled) {
                    rainbow = "rainbowText";
                }
                if (!chatHistory[i].me) {
                    $('#' + data.room + ' .chat-messages').append('<li id="message-' + chatHistory[i].id + '">' + avatars + icons + '<span id="info-' + user.id + '" onclick="getInfo(this);" class="chat-user ' + mainGroup + '">' + user.username + '</span> : <span class="chat-message ' + rainbow + '">' + linkify(chatHistory[i].message) + '</span></li>');
                } else {
                    $('#' + data.room + ' .chat-messages').append('<li id="message-' + chatHistory[i].id + '" class="me"> <span id="info-' + user.id + '" onclick="getInfo(this);" class="chat-user ' + mainGroup + '">* ' + user.username + '</span> <span class="chat-message ' + mainGroup + '">' + linkify(chatHistory[i].message) + '</span></li>');
                }
            } else {
                if (!chatHistory[i].me) {
                    $('#' + data.room + ' .chat-messages').append('<li id="message-' + chatHistory[i].id + '">' + icons + '<span id="info-' + user.id + '" onclick="getInfo(this);" class="chat-user ' + mainGroup + '">' + user.username + '</span> : <span class="chat-message"><span class="gray">' + $.i18n("chat-message-deleted") + '</span></span></li>');
                } else {
                    $('#' + data.room + ' .chat-messages').append('<li id="message-' + chatHistory[i].id + '" class="me">' + icons + '<span id="info-' + user.id + '" onclick="getInfo(this);" class="chat-user ' + mainGroup + '">* ' + user.username + '</span> <span class="chat-message"><span class="gray">' + $.i18n("chat-message-deleted") + '</span></span></li>');
                }
            }
            $('#' + data.room + ' .chat-messages li:last .chat-user').data('infos', chatHistory[i]);

            autoCompletionAddUsername(user.username);

        }

        $('#' + data.room + ' .chat-form').submit(function (event) {
            event.preventDefault();

            var room = $(this).closest('.chat-box').attr('id');
            var text = $('#' + room + ' .chat-text');
            if (text.val().length > 0) {
                sendMessage(text.val(), data.room);
                text.val("");
                lastChatId = data.room;
            }

            return false;
        });

        $('#' + data.room + ' .chat-minus').click(function () {
            if ($('#' + data.room).height() > 0) {
                $('#' + data.room + ' .chat-messages').hide();
                $('#' + data.room + ' .chat-footer').hide();
                $('#' + data.room).attr('lastHeight', $('#' + data.room).height());
                $('#' + data.room).height(0);
            } else {
                $('#' + data.room + ' .chat-messages').show();
                $('#' + data.room + ' .chat-footer').show();
                if ($('#' + data.room).attr('lastHeight') !== undefined) {
                    $('#' + data.room).height($('#' + data.room).attr('lastHeight'));
                }
            }
        });

        $('#' + data.room + ' .chat-close').click(function () {
            $('#' + data.room).remove();
            localStorage.removeItem(data.room);
        });

        $('#' + data.room).hover(
            function () {
            }, function () {
                saveChat(data.room);
            });

        $('#' + data.room + ' .chat-messages').scrollTop($('#' + data.room + ' .chat-messages').prop("scrollHeight") + 1000);


    }

    if (data.action === "getHistoryPrivate") {

        var chatHistory = JSON.parse(data.history);

        $('#' + data.room).remove();

        var online = '<span class="chat-user-online"><span class="green">Online</span></span>';
        var disabled = '';

        if (!data.online) {
            online = '<span class="chat-user-online"><span class="red">Offline</span></span>';
            disabled = 'disabled';
        }

        $('body').append('<div class="chat-box" id="' + data.room + '"><div class="chat-header">(' + online + ') ' + data.roomName + '<div class="btn-group pull-right"><span class="chat-minus glyphicon glyphicon-minus"></span> <span class="chat-close glyphicon glyphicon-remove"></span></div></div><ul class="chat-messages"></ul><div class="chat-footer"><form class="chat-form"><input autocomplete="off" type="text" class="chat-text" maxlength="250" ' + disabled + ' onkeydown="autoComplete(this, event);"/><input type="submit" hidden></form><span class="emoteIconChat glyphicon glyphicon-comment" onclick="showChatEmotes(\'' + data.room + '\')"></span></div></div>');

        if (!mobile) {
            $('#' + data.room).resizable({
                maxHeight: 700,
                maxWidth: 900,
                minHeight: 150,
                minWidth: 250
            });
        }

        $('#' + data.room).draggable({
            cursor: 'move',
            handle: '.chat-header',
            containment: 'document'
        });

        if (localStorage.getItem("pm-" + data.room) !== null) {
            var infos = JSON.parse(localStorage.getItem("pm-" + data.room));
            $('#' + data.room).height(infos.height);
            $('#' + data.room).width(infos.width);
            if (infos.x < $(document).width()) {
                $('#' + data.room).css('left', infos.x);
            } else {
                $('#' + data.room).css('left', 50);
            }
            var body = document.body,
                html = document.documentElement;
            var height = Math.max(body.scrollHeight, body.offsetHeight,
                html.clientHeight, html.scrollHeight, html.offsetHeight);
            if (infos.y < height) {
                $('#' + data.room).css('top', infos.y);
            } else {
                $('#' + data.room).css('top', randInt(50, 400));
            }
        } else {
            $('#' + data.room).css('left', 50);
            $('#' + data.room).css('top', randInt(50, 400));
        }

        savePrivateChat(data.room, data.roomName, data.friendId);

        for (var i = 0; i < chatHistory.length; i++) {

            var user = chatHistory[i].user;
            var mainGroup = user.mainGroup.name;
            var icons = "";

            for (var j = user.groups.length - 1; j >= 0; j--) {
                var userGroup = user.groups[j];
                if (userGroup.icon !== undefined) {
                    if (userGroup.priority <= 8) {
                        if (userGroup.id === user.mainGroup.id) {
                            icons = icons + '<a href="Staff" target="_blank"><img src="images/' + userGroup.icon + '.png" title="' + userGroup.name + '" class="groupIcon"/></a>';
                        }
                    } else if (userGroup.name === "Contributor") {
                        icons = icons + '<a href="Shop" target="_blank"><img src="images/' + userGroup.icon + '.png" title="' + userGroup.name + '" class="groupIcon"/></a>';
                    } else if (userGroup.name === "Recruiter") {
                        icons = icons + '<a href="Referrals" target="_blank"><img src="images/' + userGroup.icon + '.png" title="' + userGroup.name + '" class="groupIcon"/></a>';
                    } else {
                        icons = icons + '<img src="images/' + userGroup.icon + '.png" title="' + userGroup.name + '" class="groupIcon"/>';
                    }
                }
            }

            var avatars = "";

            if (chatAvatarsEnabled) {
                var shinyAvatar = "";

                if (user.shinyAvatar) {
                    shinyAvatar = '<img src="images/shinyAvatar.gif" class="rainbowAvatar" draggable="false">';
                }

                avatars = '<div class="avatarGroup"><img class="avatar ' + user.avatar.rarity + '" src="images/avatars/' + user.avatar.image + '.' + user.avatar.extension + '" />' + shinyAvatar + '</div> ';
            }

            var rainbow = "";
            if (chatHistory[i].rainbow && rainbowEnabled) {
                rainbow = "rainbowText";
            }
            if (!chatHistory[i].me) {
                $('#' + data.room + ' .chat-messages').append('<li id="message-' + chatHistory[i].id + '">' + avatars + icons + '<span id="info-' + user.id + '" onclick="getInfo(this);" class="chat-user ' + mainGroup + '">' + user.username + '</span> : <span class="chat-message ' + rainbow + '">' + linkify(chatHistory[i].message) + '</span></li>');
            } else {
                $('#' + data.room + ' .chat-messages').append('<li id="message-' + chatHistory[i].id + '" class="me"> <span id="info-' + user.id + '" onclick="getInfo(this);" class="chat-user ' + mainGroup + '">* ' + user.username + '</span> <span class="chat-message ' + mainGroup + '">' + linkify(chatHistory[i].message) + '</span></li>');
            }

            $('#' + data.room + ' .chat-messages li:last .chat-user').data('infos', chatHistory[i]);

            autoCompletionAddUsername(user.username);

        }


        $('#' + data.room + ' .chat-form').submit(function (event) {
            event.preventDefault();

            var room = $(this).closest('.chat-box').attr('id');
            var text = $('#' + room + ' .chat-text');
            if (text.val().length > 0) {
                sendPrivateMessage(text.val(), data.friendId);
                text.val("");
                lastChatId = data.room;
            }

            return false;
        });

        $('#' + data.room + ' .chat-minus').click(function () {
            if ($('#' + data.room).height() > 0) {
                $('#' + data.room + ' .chat-messages').hide();
                $('#' + data.room + ' .chat-footer').hide();
                $('#' + data.room).attr('lastHeight', $('#' + data.room).height());
                $('#' + data.room).height(0);
            } else {
                $('#' + data.room + ' .chat-messages').show();
                $('#' + data.room + ' .chat-footer').show();
                if ($('#' + data.room).attr('lastHeight') !== undefined) {
                    $('#' + data.room).height($('#' + data.room).attr('lastHeight'));
                }
            }
        });

        $('#' + data.room + ' .chat-close').click(function () {
            $('#' + data.room).remove();
            localStorage.removeItem("pm-" + data.room);
            closePrivateRoom(data.friendId);
        });

        $('#' + data.room).hover(
            function () {
            }, function () {
                savePrivateChat(data.room, data.roomName, data.friendId);
            });

        $('#' + data.room + ' .chat-messages').scrollTop($('#' + data.room + ' .chat-messages').prop("scrollHeight") + 1000);

    }

    if (data.action === "getClosedPrivateRoom") {
        $('#' + data.room).off("hover", "**");
        localStorage.removeItem("pm-" + data.room);
        $('#' + data.room + ' .chat-messages').append('<li class="red">' + $.i18n("chat-closed") + '</li>');
        $('#' + data.room + ' .chat-text').prop('disabled', true);
        scroll(data.room);
    }

    if (data.action === "getSelfInfos") {
        var user = JSON.parse(data.me);
        selfFriends = JSON.parse(data.friends);
        selfId = user.id;
        selfLevel = user.level;
        selfUsername = user.username;
        selfGroups = user.groups;
        selfMainGroup = user.mainGroup;
        selfDivision = user.division;

        chatEmotes = user.emotes;

        var onlineFriends = 0;

        for (var i = 0; i < selfFriends.length; i++) {
            if (selfFriends[i].online) {
                onlineFriends++;
            }
        }

        $('.nbFriends').html(onlineFriends);
    }

    if (data.action === "deleteMessages") {

        var listeMessage = JSON.parse(data.listId);

        for (var i = 0; i < listeMessage.length; i++) {
            $('#message-' + listeMessage[i] + ' .chat-message').html('<span class="gray me">' + $.i18n("chat-message-deleted") + '</span>');
        }
    }

    if (data.action === "getMessage") {

        var chatMessage = JSON.parse(data.chatMessage);

        var id = chatMessage.id;
        var user = chatMessage.user;
        var username = chatMessage.user.username;
        var message = chatMessage.message;
        var room = data.room;

        var mainGroup = user.mainGroup.name;
        var icons = "";

        for (var j = user.groups.length - 1; j >= 0; j--) {
            var userGroup = user.groups[j];
            if (userGroup.icon !== undefined) {
                if (userGroup.priority <= 8) {
                    if (userGroup.id === user.mainGroup.id) {
                        icons = icons + '<a href="Staff" target="_blank"><img src="images/' + userGroup.icon + '.png" title="' + userGroup.name + '" class="groupIcon"/></a>';
                    }
                } else if (userGroup.name === "Contributor") {
                    icons = icons + '<a href="Shop" target="_blank"><img src="images/' + userGroup.icon + '.png" title="' + userGroup.name + '" class="groupIcon"/></a>';
                } else if (userGroup.name === "Recruiter") {
                    icons = icons + '<a href="Referrals" target="_blank"><img src="images/' + userGroup.icon + '.png" title="' + userGroup.name + '" class="groupIcon"/></a>';
                } else {
                    icons = icons + '<img src="images/' + userGroup.icon + '.png" title="' + userGroup.name + '" class="groupIcon"/>';
                }
            }
        }

        var avatars = "";

        if (chatAvatarsEnabled) {
            var shinyAvatar = "";

            if (user.shinyAvatar) {
                shinyAvatar = '<img src="images/shinyAvatar.gif" class="rainbowAvatar" draggable="false">';
            }

            avatars = '<div class="avatarGroup"><img class="avatar ' + user.avatar.rarity + '" src="images/avatars/' + user.avatar.image + '.' + user.avatar.extension + '" />' + shinyAvatar + '</div> ';
        }

        var rainbow = "";
        if (chatMessage.rainbow && rainbowEnabled) {
            rainbow = "rainbowText";
        }
        if (!chatMessage.me) {
            $('#' + room + ' .chat-messages').append('<li id="message-' + id + '">' + avatars + icons + '<span id="info-' + id + '" onclick="getInfo(this);" class="chat-user ' + mainGroup + '">' + username + '</span> : <span class="chat-message ' + rainbow + '">' + notif(linkify(message)) + '</span></li>');
        } else {
            $('#' + room + ' .chat-messages').append('<li id="message-' + id + '" class="me"> <span id="info-' + id + '" onclick="getInfo(this);" class="chat-user ' + mainGroup + '">* ' + username + '</span> <span class="chat-message ' + mainGroup + '">' + notif(linkify(message)) + '</span></li>');
        }

        $('#' + room + ' .chat-messages li:last .chat-user').data('infos', chatMessage);

        autoCompletionAddUsername(user.username);

        scroll(room);

    }

    if (data.action === "getPrivateMessage") {

        var room = data.room;
        var chatMessage = JSON.parse(data.chatMessage);

        if ($('#' + room).length > 0) {

            var user = chatMessage.user;
            var id = chatMessage.id;
            var username = user.username;
            var message = chatMessage.message;

            var mainGroup = user.mainGroup.name;
            var icons = "";

            for (var j = user.groups.length - 1; j >= 0; j--) {
                if (user.groups[j].icon !== undefined) {
                    if (user.groups[j].priority <= 6) {
                        icons = icons + '<a href="Staff" target="_blank"><img src="images/' + user.groups[j].icon + '.png" title="' + user.groups[j].name + '" class="groupIcon"/></a>';
                    } else if (user.groups[j].name === "Contributor") {
                        icons = icons + '<a href="Shop" target="_blank"><img src="images/' + user.groups[j].icon + '.png" title="' + user.groups[j].name + '" class="groupIcon"/></a>';
                    } else if (user.groups[j].name === "Recruiter") {
                        icons = icons + '<a href="Referrals" target="_blank"><img src="images/' + user.groups[j].icon + '.png" title="' + user.groups[j].name + '" class="groupIcon"/></a>';
                    } else {
                        icons = icons + '<img src="images/' + user.groups[j].icon + '.png" title="' + user.groups[j].name + '" class="groupIcon"/>';
                    }

                }
            }

            var avatars = "";

            if (chatAvatarsEnabled) {
                var shinyAvatar = "";

                if (user.shinyAvatar) {
                    shinyAvatar = '<img src="images/shinyAvatar.gif" class="rainbowAvatar" draggable="false">';
                }

                avatars = '<div class="avatarGroup"><img class="avatar ' + user.avatar.rarity + '" src="images/avatars/' + user.avatar.image + '.' + user.avatar.extension + '" />' + shinyAvatar + '</div> ';
            }

            var rainbow = "";
            if (chatMessage.rainbow && rainbowEnabled) {
                rainbow = "rainbowText";
            }
            if (!chatMessage.me) {
                $('#' + room + ' .chat-messages').append('<li id="message-' + id + '">' + avatars + icons + '<span id="info-' + id + '" onclick="getInfo(this);" class="chat-user ' + mainGroup + '">' + username + '</span> : <span class="chat-message ' + rainbow + '">' + notif(linkify(message)) + '</span></li>');
            } else {
                $('#' + room + ' .chat-messages').append('<li id="message-' + id + '" class="me"> <span id="info-' + id + '" onclick="getInfo(this);" class="chat-user ' + mainGroup + '">* ' + username + '</span> <span class="chat-message ' + mainGroup + '">' + notif(linkify(message)) + '</span></li>');
            }

            $('#' + room + ' .chat-messages li:last .chat-user').data('infos', chatMessage);

            $('#' + room + ' .chat-user-online').html('<span class="green">Online</span>');
            $('#' + room + ' .chat-text').prop('disabled', false);

            autoCompletionAddUsername(user.username);

            scroll(room);

        } else {
            if (chatMessage.user.id !== selfId) {
                openPrivateRoom(chatMessage.user.id, chatMessage.user.username.replace("'", ""));
                if (!windows_focus_chat) {
                    notifyChat(chatMessage.user.username, chatMessage.message);
                }
            }
        }

    }

    if (data.action === "getMessageError") {
        var message = data.message;
        $('#' + lastChatId + ' .chat-messages').append('<li class="red">' + translateFromServerJson(message) + '</li>');
        scrollAll();
    }

    if (data.action === "getMessageDenied") {

        localStorage.removeItem('chat-contributor');

        BootstrapDialog.show({
            title: $.i18n('dialog-error'),
            type: BootstrapDialog.TYPE_DANGER,
            message: translateFromServerJson(data.message),
            buttons: [{
                label: 'Close',
                cssClass: 'btn-primary',
                action: function (dialog) {
                    dialog.close();
                }
            }]

        });

    }


    if (data.action === "getInfoMessage") {
        var message = data.message;
        $('#' + lastChatId + ' .chat-messages').append('<li class="gray">' + translateFromServerJson(message) + '</li>');
        scrollAll();
    }

    if (data.action === "getMessageAuto") {
        var message = data.message;
        $('.chat-public .chat-messages').append('<li class="yellow">' + translateFromServerJson(message) + '</li>');
        scrollAll();
    }

    if (data.action === "getMessageBroadcast") {
        var message = data.message;
        $('.chat-messages').append('<li><span style="color: yellow;">[INFO]</span> <span style="color: #ff00ff;">' + message + '</span></li>');
        scrollAll();
    }

// Friends

    if (data.action === "getOnlineFriends") {

        $('#onlineFriends').empty();

        var friends = JSON.parse(data.friends);


        var nb = 0;

        for (var i = 0; i < friends.length; i++) {

            var online = "gray";
            var pm = '';

            if (friends[i].online) {
                nb++;
                online = "green";
                var noQuoteUsername = friends[i].username.replace("'", "");
                pm = '<span class="glyphicon glyphicon-envelope pointer yellow" onclick="openPrivateRoom(' + friends[i].id + ',\'' + noQuoteUsername + '\');"></span>';
            }

            var inGame = '<span class="glyphicon glyphicon-eye-open gray"></span>';

            if (friends[i].idGame >= 0) {
                inGame = '<a href="Spectate?gameId=' + friends[i].idGame + '&playerId=' + friends[i].id + '" title="Spectate game"><span class="glyphicon glyphicon-eye-open green"></span></a>';
            }

            var friendDivision = $.i18n('{{DIVISION:' + friends[i].division + '|short}}');

            $('#onlineFriends').append('<li>' + pm + ' ' + inGame + ' ' + friendDivision + '<span class="' + online + '">' + friends[i].username + '</span> <span class="blue">' + $.i18n("stat-lv") + ' ' + friends[i].level + '</span> <a href="Friends?delete=' + friends[i].id + '" class="crossDelete" hidden><span class="glyphicon glyphicon-remove red"></span></a></li>');
            $('#nbOnline').html(nb);
        }

    }

}


function sendMessage(message, room) {
    socketChat.send(JSON.stringify({action: "message", message: message, room: room}));
}

function sendPrivateMessage(message, idUser) {
    socketChat.send(JSON.stringify({action: "privateMessage", message: message, idUser: idUser}));
}

function openRoom(room) {
    socketChat.send(JSON.stringify({action: "openRoom", room: room}));
}

function openPrivateRoom(idUser, friendName) {
    socketChat.send(JSON.stringify({action: "openPrivateRoom", idUser: idUser, friendName: friendName}));
}

function closePrivateRoom(idUser) {
    socketChat.send(JSON.stringify({action: "closePrivateRoom", idUser: idUser}));
}

function saveChat(room) {
    var height = $('#' + room).height();

    if (height === 0) {
        height = $('#' + room).attr("lastHeight");
    }
    localStorage.setItem(room, JSON.stringify({x: $('#' + room).position().left, y: $('#' + room).position().top, height: height, width: $('#' + room).width()}));
}

function savePrivateChat(room, nameFriend, idFriend) {
    var height = $('#' + room).height();

    if (height === 0) {
        height = $('#' + room).attr("lastHeight");
    }
    localStorage.setItem("pm-" + room, JSON.stringify({x: $('#' + room).position().left, y: $('#' + room).position().top, height: height, width: $('#' + room).width(), room: room, nameFriend: nameFriend, idFriend: idFriend}));
}

Array.prototype.contains = function (obj) {
    var i = this.length;
    while (i--) {
        if (this[i] === obj) {
            return true;
        }
    }
    return false;
};

function linkify(inputText) {
    var replacedText, replacePattern1, replacePattern2;

    //URLs starting with http://, https://, or ftp://
    replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
    replacedText = inputText.replace(replacePattern1, '<a href="#" onclick="link(\'$1\');">$1</a>');

    //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
    replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
    regplacedText = replacedText.replace(replacePattern2, '<a href="#" onclick="link(\'http://$2\');" >$2</a>');

    return replacedText.replace(/\^/g, '');

}

function notif(str) {

    if (str.toLowerCase().includes("@" + selfUsername.toLowerCase())) {

        var checkStr = str.replace("@", "arobasecharacter");

        var regEx = new RegExp("\\b(arobasecharacter" + selfUsername + ")\\b", "ig");
        var replaceMask = "<span style=\"color:yellow !important;\">@" + selfUsername + "</span>";
        var result = checkStr.replace(regEx, replaceMask);

        if (result !== str && soundsEnabled) {
            audio = new Audio("sounds/highlight.wav");
            audio.play();
        }

        return result;
    }

    return str;

}

function link(link) {

    BootstrapDialog.show({
        title: 'Leaving Warning',
        type: BootstrapDialog.TYPE_WARNING,
        message: $.i18n('chat-link-outside', link),
        buttons: [{
            label: $.i18n('chat-sure'),
            cssClass: 'btn-primary',
            action: function (dialog) {
                window.open(link, '_blank');
                dialog.close();
            }

        },
            {
                label: $.i18n('dialog-cancel'),
                cssClass: 'btn-primary',
                action: function () {
                    dialog.close();
                }
            }]
    });

}

function getInfo(u) {

    var infos = $(u).data('infos');

    var user = infos.user;
    var mainGroup = user.mainGroup;
    var modsOptions = "";
    var pmOption = "";
    var icon = "";
    var gameOption = "";

    var mainGroupName = $.i18n('group-' + mainGroup.name.toLowerCase());

    if (mainGroup.icon !== undefined) {
        icon = '<img src="images/' + mainGroup.icon + '.png" title="' + mainGroupName + '" class="groupIcon"/> ';
    }

    var divisionName = $.i18n('{{DIVISION:' + user.division + '}}');

    if (user.id !== selfId && selfMainGroup.priority <= 4) {
        modsOptions = $.i18n('chat-time-out-user') + ": <button class=\"btn btn-sm btn-danger\" onclick=\"timeout('" + user.id + "', '1');\">1</button> <button class=\"btn btn-sm btn-danger\" onclick=\"timeout('" + user.id + "', '60');\">60</button> <button class=\"btn btn-sm btn-danger\" onclick=\"timeout('" + user.id + "', '600');\">600</button> <button class=\"btn btn-sm btn-danger\" onclick=\"timeout('" + user.id + "', '3600');\">3600</button>";
    }

    if (user.id !== selfId && (isFriend(user.idUser) || selfMainGroup.priority <= 4)) {
        var noQuoteUsername = user.username.replace("'", "");
        pmOption = '<span class="pointer" onclick="openPrivateRoom(' + user.id + ',\'' + noQuoteUsername + '\');"><span class="glyphicon glyphicon-envelope yellow"></span> ' + $.i18n("chat-send-private") + '</span><br/><br/>';
    }

    if (user.gameId !== -1) {
        gameOption = '<p><a href="Spectate?gameId=' + user.gameId + '&playerId=' + user.id + '" title="Spectate game"><span class="glyphicon glyphicon-eye-open green"></span> ' + $.i18n("chat-spectate-game") + '</a>.</p>';
    }

    var shinyAvatar = "";

    if (user.shinyAvatar) {
        shinyAvatar = '<img src="images/shinyAvatar.gif" class="rainbowAvatar" draggable="false">';
    }

    BootstrapDialog.show({
        title: user.username,
        message: '<div class="avatarGroup"><img class="avatar ' + user.avatar.rarity + '" src="images/avatars/' + user.avatar.image + '.' + user.avatar.extension + '">' + shinyAvatar + '</div> <span style="font-size: 24px; padding-left: 10px;">' + user.username + '</span> <br/><br/><img style="height: 25px;" src="images/profiles/' + user.profileSkin.image + '.' + user.profileSkin.extension + '"><br/><br/><ul><li>' + $.i18n("chat-group") + ' : <span class="' + mainGroup.name + '">' + icon + " " + mainGroupName + '</span></li><li>' + $.i18n("stat-lv") + ' : <span class="blue">' + user.level + '</span></li><li>' + $.i18n("chat-division") + ' : ' + divisionName + '</li></ul>' + gameOption + pmOption + modsOptions,
        buttons: [{
            label: $.i18n('dialog-ok'),
            cssClass: 'btn-primary',
            action: function (dialog) {
                dialog.close();
            }
        }]
    });

}

function randInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}

function scroll(room) {

    if ($('#' + room + ' .chat-messages').scrollTop() + 100 >
        ($('#' + room + ' .chat-messages').prop("scrollHeight") -
            $('#' + room + ' .chat-messages').height())) {
        $('#' + room + ' .chat-messages').scrollTop($('#' + room + ' .chat-messages').prop("scrollHeight"));
    }
}

function scrollAll() {

    $(".chat-box").each(function (index) {
        scroll($(this).attr('id'));
    });
}

function autoCompletionAddUsername(username) {

    if (usernames.indexOf(username) === -1) {
        usernames.push(username);
    }

}

$(document).keypress(function (e) {
    if (e.which === 13 && !$('input').is(':focus') && !chatsListOpen) {

        if (!emotesOpen) {
            openChatsList();
        } else {
            $('#' + chatRoomEmote + ' .chat-form').submit();
            emoteDialog.close();
        }

    }

});

function openChatsList() {

    chatsListOpen = true;

    BootstrapDialog.show({
        title: $.i18n("chat-list-title"),
        cssClass: 'chat-rooms',
        message: '<p><a href="rules.jsp" target="_blank">'+$.i18n("rules-title")+'</a></p><p>' + $.i18n("chat-english-only") + '</p><ul><li onclick="openRoom(\'chat-discussion\');"><span class="glyphicon glyphicon-log-in pointer green"></span> ' + $.i18n("chat-discussion") + '</li>\
                <li onclick="openRoom(\'chat-strategy\');"><span class="glyphicon glyphicon-log-in green"></span> ' + $.i18n("chat-strategy") + '</li>\
                <li onclick="openRoom(\'chat-beginner\');"><span class="glyphicon glyphicon-log-in green"></span> ' + $.i18n("chat-beginner") + '</li>\
                <li onclick="openRoom(\'chat-tournament\');"><span class="glyphicon glyphicon-log-in green"></span> ' + $.i18n("chat-tournament") + '</li>\
                <li id="donatorPrivate" onclick="openRoom(\'chat-contributor\');"><span class="glyphicon glyphicon-log-in green"></span> ' + $.i18n("chat-contributor") + '</li>\
                <li onclick="openRoom(\'chat-roleplay\');"><span class="glyphicon glyphicon-log-in green"></span> ' + $.i18n("chat-roleplay") + '</li>\
                <li onclick="openRoom(\'chat-support\');"><span class="glyphicon glyphicon-log-in green"></span> ' + $.i18n("chat-support") + '</li></ul>\
                <hr>\
                <ul><li onclick="openRoom(\'chat-fr\');"><span class="glyphicon glyphicon-log-in green"></span> ' + $.i18n("chat-fr") + '</li>\
                <li onclick="openRoom(\'chat-ru\');"><span class="glyphicon glyphicon-log-in green"></span>  ' + $.i18n("chat-ru") + '</li>\
                <li onclick="openRoom(\'chat-es\');"><span class="glyphicon glyphicon-log-in green"></span>  ' + $.i18n("chat-es") + '</li>\
                <li onclick="openRoom(\'chat-pt\');"><span class="glyphicon glyphicon-log-in green"></span>  ' + $.i18n("chat-pt") + '</li>\
                <li onclick="openRoom(\'chat-it\');"><span class="glyphicon glyphicon-log-in green"></span>  ' + $.i18n("chat-it") + '</li>\
                <li onclick="openRoom(\'chat-de\');"><span class="glyphicon glyphicon-log-in green"></span>  ' + $.i18n("chat-de") + '</li>\
                <li onclick="openRoom(\'chat-cn\');"><span class="glyphicon glyphicon-log-in green"></span>  ' + $.i18n("chat-cn") + '</li>\
                <li onclick="openRoom(\'chat-jp\');"><span class="glyphicon glyphicon-log-in green"></span>  ' + $.i18n("chat-jp") + '</li>\
                <li onclick="openRoom(\'chat-tr\');"><span class="glyphicon glyphicon-log-in green"></span>  ' + $.i18n("chat-tr") + '</li>\
                <li onclick="openRoom(\'chat-pl\');"><span class="glyphicon glyphicon-log-in green"></span>  ' + $.i18n("chat-pl") + '</li>\
                </ul>',
        buttons: [{
            label: $.i18n('dialog-close'),
            cssClass: 'btn-primary',
            action: function (dialog) {
                dialog.close();
            }

        }],
        onhide: function () {
            chatsListOpen = false;
        },
        onhidden: function () {
            chatsListOpen = false;
        }
    });
}

function isFriend(idUser) {

    for (var i = 0; i < selfFriends.length; i++) {
        if (selfFriends[i].id === idUser) {
            return true;
        }
    }

    return false;

}

function notifyChat(username, message) {

    var options = {
        body: $.i18n('chat-pm') + ' ' + username + ' : ' + message,
        icon: 'images/undercards.png'
    };

    var n = new Notification('Undercards', options);

    setTimeout(function () {
        n.close();
    }, 10000);
}

window.onbeforeunload = function () {
    socketChat.onclose = function () {
    }; // disable onclose handler first
    socketChat.close();
};

function showChatEmotes(room) {

    var popupContent = '<div class="container" style="width: 500px;">';

    for (var i = 0; i < chatEmotes.length; i++) {

        var emote = chatEmotes[i];

        var artifactHtml = '<div style="margin-bottom: 15px;" class="col-sm-2"><img class="pointer" style="height: 48px;" src="images/emotes/' + emote.image + '.' + emote.extension + '" onclick="addEmoteChat(' + emote.id + ', \'' + room + '\');" /></div>';
        popupContent += artifactHtml;
    }

    popupContent += '</div>';

    emotesOpen = true;

    chatRoomEmote = room;

    emoteDialog = BootstrapDialog.show({
        title: $.i18n('chat-emotes'),
        message: popupContent,
        buttons: [{
            label: $.i18n('chat-send'),
            cssClass: 'btn-primary',
            action: function (dialog) {
                $('#' + room + ' .chat-form').submit();
                dialog.close();
            }
        }, {
            label: $.i18n('chat-edit'),
            cssClass: 'btn-primary',
            action: function (dialog) {
                dialog.close();
            }
        }],
        onhidden: function () {
            emotesOpen = false;
            $('#' + room + ' .chat-text').focus();
        }
    });

}

function addEmoteChat(idEmote, room) {

    var emote = getEmote(idEmote);

    if (emote !== null) {
        var chatInput = $('#' + room + ' .chat-text');
        var chatText = chatInput.val();
        var newText = chatText + emote.code;
        chatInput.val(newText);
    }

}

function getEmote(idEmote) {

    for (var i = 0; i < chatEmotes.length; i++) {
        var emote = chatEmotes[i];
        if (emote.id === idEmote) {
            return emote;
        }
    }

    return null;
}

function autoComplete(chatInput, event) {

    if (event.ctrlKey) {

        var chatText = $(chatInput).val();
        var result = chatText.substring(chatText.lastIndexOf("@"));

        if (result.length > 1) {

            var typedUsername = result.substring(1, result.length);
            if (autoCompleteUsername === null) {
                autoCompleteUsername = typedUsername;
            }

            var matchingUsers = [];

            for (var i = 0; i < usernames.length; i++) {
                var username = usernames[i];

                if (username.toLowerCase().startsWith(autoCompleteUsername.toLowerCase()) && !username.includes("@")) {
                    matchingUsers.push(username);
                }
            }

            matchingUsers.sort();

            if (matchingUsers.length > 0) {

                if (usernamesIncrement < matchingUsers.length) {

                    var found = matchingUsers[usernamesIncrement];

                    if (found.toLowerCase() === typedUsername) {

                        usernamesIncrement++;

                        if (usernamesIncrement < matchingUsers.length) {
                            found = matchingUsers[usernamesIncrement];
                            var finalText = chatText.replace(typedUsername, found);
                            $(chatInput).val(finalText);

                        } else {
                            var finalText = chatText.replace(typedUsername, autoCompleteUsername);
                            $(chatInput).val(finalText);
                            autoCompleteUsername = null;
                            usernamesIncrement = 0;
                        }


                    } else {

                        var finalText = chatText.replace(typedUsername, found);

                        $(chatInput).val(finalText);

                        usernamesIncrement++;

                    }


                } else {
                    var finalText = chatText.replace(typedUsername, autoCompleteUsername);
                    $(chatInput).val(finalText);
                    autoCompleteUsername = null;
                    usernamesIncrement = 0;
                }
            }
        }

    } else {
        autoCompleteUsername = null;
        usernamesIncrement = 0;
    }

}