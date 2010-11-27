plugin.loadMainCSS();
plugin.loadLang();

theWebUI.showChat = function()
{
    theDialogManager.toggle("tchat");
    $("#chatMessage").focus();
    $("#chatarea")[0].scrollTop = $("#chatarea")[0].scrollHeight;
    plugin.active = true;

    if(plugin.timeout) {
        window.clearTimeout(plugin.timeout);
        plugin.timeout = null;
    }

    plugin.check();
}

plugin.check = function()
{
    theWebUI.request("?action=updatechat", [plugin.update,plugin], true);
}

plugin.parseText = function(text)
{
    text = text.replace(/&(?!\w+([;\s]|$))/g, "&amp;");
    text = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    if (plugin.useSmileys) {
        text = text.replace(/&gt;:\)|&gt;:-\)/i, "<span id='devil" + plugin.smileySet + "'></span>");
        text = text.replace(/:\(|:-\(/i, "<span id='frown" + plugin.smileySet + "'></span>");
        text = text.replace(/:O|:-O/i, "<span id='shocked" + plugin.smileySet + "'></span>");
        text = text.replace(/;\)|;-\)/i, "<span id='wink" + plugin.smileySet + "'></span>");
        text = text.replace(/X\)|X-\)/i, "<span id='angry" + plugin.smileySet + "'></span>");
        text = text.replace(/:\||:-\|/i, "<span id='straight" + plugin.smileySet + "'></span>");
        text = text.replace(/(:\/|:-\/)[^\/]/i, "<span id='slant" + plugin.smileySet + "'></span>");
        text = text.replace(/:D|:-D/i, "<span id='grin" + plugin.smileySet + "'></span>");
        text = text.replace(/:P|:-P/i, "<span id='tongue" + plugin.smileySet + "'></span>");
        text = text.replace(/:'\(|:'-\(/i, "<span id='sad" + plugin.smileySet + "'></span>");
        text = text.replace(/&gt;\.&lt;/i, "<span id='wince" + plugin.smileySet + "'></span>");
        text = text.replace(/:\)|:-\)/i, "<span id='smile" + plugin.smileySet + "'></span>");
        text = text.replace(/8\)|8-\)|B\)|B-\)/i, "<span id='cool" + plugin.smileySet + "'></span>");
        text = text.replace(/&lt;3/i, "<span id='love" + plugin.smileySet + "'></span>");
    }

    var pattern = /(https?:\/\/|www\.)((([a-z\d]([a-z\d-]*[a-z\d])*)\.)+[a-z]{2,}|((\d{1,3}\.){3}\d{1,3}))(\:\d+)?(\/[-a-z\d%_.~+]*)*(\?[;&a-z\d%_.~+=-]*)?(\#[-a-z\d_]*)?/gi;
    var matches = text.match(pattern);

    if (matches == null)
        return(text);

    for (var i = 0; i < matches.length; i++) {
        var replace = new RegExp(matches[i]);

        if (!matches[i].match(/http:\/\//))
            var url = "http://" + matches[i];
        else
            var url = matches[i];

        text = text.replace(replace, "<a href='" + url + "' target='_blank'>" + matches[i] + "</a>");
    }

    return(text);
}

plugin.addZero = function(num)
{
    if (num >= 10)
        return num;
    else
        return '0' + String(num);
}

plugin.checkSuccess = function(data)
{
    if (data.error)
        log("Chat plugin: " + data.error);
}

plugin.update = function(data)
{
    if (data.error)
        log("Chat plugin: " + data.error);
    else {
        var s = "";

        for (var i = 0; i < data.lines.length; i++) {
            var dateTime = new Date(parseInt(data.lines[i].dt) + plugin.timeFix);

            s += "<i>" + plugin.addZero(dateTime.getDate()) + "/" + plugin.addZero(dateTime.getMonth()) + " " + plugin.addZero(dateTime.getHours()) + ":" + plugin.addZero(dateTime.getMinutes()) + "</i> - ";
            s += "<strong>" + data.lines[i].user + "</strong>:";
            s += "<br />";
            s += plugin.parseText(data.lines[i].msg);
            s += "<br />";
        }

        if (s != "") {
            $("#chatarea").append(s);
            $("#chatarea")[0].scrollTop = $("#chatarea")[0].scrollHeight;
            if (!plugin.active && (plugin.lastLine > 0 || theWebUI.settings["webui.chat.lastLine"] == undefined || (plugin.lastLine + i) > theWebUI.settings["webui.chat.lastLine"])) {
                theDialogManager.show("tchat");
                $("#chatMessage").focus();
                $("#chatarea")[0].scrollTop = $("#chatarea")[0].scrollHeight;
                plugin.active = true;
            }
        }

        plugin.lastLine += i;

        if (plugin.active) {
            plugin.timeout = window.setTimeout(plugin.check, plugin.activeInterval);
            theWebUI.settings["webui.chat.lastLine"] = plugin.lastLine;
            theWebUI.save();
        } else
            plugin.timeout = window.setTimeout(plugin.check, plugin.inactiveInterval);
    }
}

theWebUI.sendChat = function()
{
    if ($("#chatMessage").val() == "")
        return(false);

    theWebUI.request("?action=sendchat", [plugin.checkSuccess,plugin], true);
    $("#chatMessage").val("");
}

theWebUI.clearChatConfirmed = function()
{
    if ($("#chatarea").html() == "")
        return(false);

    $("#chatarea").html("");
    theWebUI.request("?action=clearchat", [plugin.checkSuccess,plugin], true);
    plugin.lastLine = 0;
}

rTorrentStub.prototype.sendchat = function()
{
    this.content = "action=add&message=" + encodeURIComponent($("#chatMessage").val());
    this.contentType = "application/x-www-form-urlencoded";
    this.mountPoint = "plugins/chat/action.php";
    this.dataType = "json";
}

rTorrentStub.prototype.updatechat = function()
{
    this.content = "action=update&line=" + plugin.lastLine;
    this.contentType = "application/x-www-form-urlencoded";
    this.mountPoint = "plugins/chat/action.php";
    this.dataType = "json";
}

rTorrentStub.prototype.clearchat = function()
{
    this.content = "action=clear";
    this.contentType = "application/x-www-form-urlencoded";
    this.mountPoint = "plugins/chat/action.php";
    this.dataType = "json";
}

plugin.onLangLoaded = function()
{
    this.addButtonToToolbar("chat",theUILang.mnu_chat, "theWebUI.showChat()", "settings");
    this.addSeparatorToToolbar("settings");

    theDialogManager.make("tchat", theUILang.chat,
        "<div class='fxcaret'>"+
            "<fieldset>"+
                "<legend>" + theUILang.chatMessages + " &#8211; <a href='javascript://void();' onclick='theDialogManager.show(\"clearChat\")'>" + theUILang.chatClear + "</a></legend>"+
                "<div id='chatarea' class='smileysContainer'></div>"+
            "</fieldset>"+
            "<fieldset>"+
                "<legend>" + theUILang.chatContribute + (plugin.useSmileys ? " &#8211; <a href='javascript://void();' onclick='theDialogManager.show(\"chatSmileys\")'>" + theUILang.chatSmileys + "</a>" : "") + "</legend>"+
                "<input type='text' name='chatMessage' id='chatMessage'/> <input type='button' value='" + theUILang.chatSend + "' class='Button' onclick='theWebUI.sendChat()'/>"+
            "</fieldset>"+
        "</div>"
    );

    $("#chatMessage").keydown(function(event)
    {
        if ((event.which && event.which == 13) || (event.keyCode && event.keyCode == 13)) {
            theWebUI.sendChat();
        }
    });

    theDialogManager.setHandler("tchat", "afterHide", function()
    {
        plugin.active = false;
    });

    if (plugin.useSmileys) {
        theDialogManager.make("chatSmileys", theUILang.chatSmileys.charAt(0).toUpperCase() + theUILang.chatSmileys.substr(1),
            "<table class='smileysContainer'>"+
                "<tr>"+
                    "<td><span id='frown" + plugin.smileySet + "' title=':('></span></td>"+
                    "<td><span id='shocked" + plugin.smileySet + "' title=':o'></span></td>"+
                    "<td><span id='wink" + plugin.smileySet + "' title=';)'></span></td>"+
                    "<td><span id='angry" + plugin.smileySet + "' title='X)'></span></td>"+
                    "<td><span id='straight" + plugin.smileySet + "' title=':|'></span></td>"+
                "</tr>"+
                "<tr>"+
                    "<td><span id='slant" + plugin.smileySet + "' title=':/'></span></td>"+
                    "<td><span id='grin" + plugin.smileySet + "' title=':D'></span></td>"+
                    "<td><span id='tongue" + plugin.smileySet + "' title=':P'></span></td>"+
                    "<td><span id='sad" + plugin.smileySet + "' title=\":'(\"></span></td>"+
                    "<td><span id='wince" + plugin.smileySet + "' title='>.<'></span></td>"+
                "</tr>"+
                "<tr>"+
                    "<td><span id='smile" + plugin.smileySet + "' title=':)'></span></td>"+
                    "<td><span id='cool" + plugin.smileySet + "' title='8)'></span></td>"+
                    "<td><span id='devil" + plugin.smileySet + "' title='>:)'></span></td>"+
                    "<td><span id='love" + plugin.smileySet + "' title='<3'></span></td>"+
                    "<td></td>"+
                "</tr>"+
            "</table>"
        );

        $("table.smileysContainer tr td span").each(function()
        {
                $(this).click(function() {
                    $("#chatMessage").val($("#chatMessage").val() + " " + this.title);
                });
        });

        theDialogManager.setHandler("chatSmileys", "afterHide", function()
        {
            $("#chatMessage").focus();
        });
    }

    theDialogManager.make("clearChat", theUILang.clearChat,
        "<div id='clearChat-content' class='content'>" + theUILang.clearChatPrompt + "</div>"+
            "<div class='aright buttons-list' id='clearChat-buttons'>"+
                "<input type='button' id='clearChatTemp' value='" + theUILang.clearChatTemp + "' class='Button'/>"+
                "<input type='button' id='clearChatPerm' value='" + theUILang.clearChatPerm + "' class='Button'/>"+
                "<input type='button' id='clearChatCancel' value='" + theUILang.clearChatCancel + "' class='Button'/>"+
            "</div>"+
        "</div>",
        true
    );

    $("#clearChatTemp").click(function()
    {
        $("#chatarea").html("");
        theDialogManager.hide("clearChat");
        return(false);
    });

    $("#clearChatPerm").click(function()
    {
        theWebUI.clearChatConfirmed();
        theDialogManager.hide("clearChat");
        return(false);
    });

    $("#clearChatCancel").click(function()
    {
        theDialogManager.hide("clearChat");
        return(false);
    });

    theDialogManager.setHandler("clearChat", "afterHide", function()
    {
        $("#chatMessage").focus();
    });

    plugin.lastLine = 0;
    plugin.check();
}

plugin.onRemove = function()
{
    theDialogManager.hide("tchat");

    this.removeSeparatorFromToolbar("settings");
    this.removeButtonFromToolbar("chat");

    if(plugin.timeout) {
        window.clearTimeout(plugin.timeout);
        plugin.timeout = null;
    }

    plugin.active = false;
    delete theWebUI.settings["webui.chat.lastLine"];
    theWebUI.save();
}
