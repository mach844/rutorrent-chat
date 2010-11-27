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

plugin.fixDateTime = function(dateTimeStr, add)
{
    if (add == 0)
        return dateTime;

    var lastDay = new Array(31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31);

    var dateTime = dateTimeStr.split(" ");
    var time = dateTime[1].split(":");
    var hour = parseInt(time[0]);

    if (hour + add >= 24) {
        var date = dateTime[0].split("/");
        var day = parseInt(date[0]);
        var month = parseInt(date[1]);

        if (day >= lastDay[month])
            return("01/" + (month + 1 > 12 ? "01" : (month + 1)) + " " + (hour + add - 24) + ":" + time[1]);
        else
            return((day + 1) + "/" + month + " " + (hour + add - 24) + ":" + time[1]);
    } else if (hour + add < 0) {
        var date = dateTime[0].split("/");
        var day = parseInt(date[0]);
        var month = parseInt(date[1]);

        if (day == 1)
            return(lastDay[(month - 1 == 0 ? 12 : (month - 1))] + "/" + (month - 1 == 0 ? 12 : (month - 1)) + " " + (hour + add + 24) + ":" + time[1]);
        else
            return((day - 1) + "/" + month + " " + (hour + add + 24) + ":" + time[1]);
    } else
         return(dateTime[0] + " " + (hour + add) + ":" + time[1]);
}

plugin.parseText = function(text)
{
    text = text.replace(/&(?!\w+([;\s]|$))/g, "&amp;");
    text = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");

    if (plugin.useSmileys) {
        text = text.replace(/&gt;:\)|&gt;:-\)/i, "<span id='devil'></span>");
        text = text.replace(/:\(|:-\(/i, "<span id='frown'></span>");
        text = text.replace(/:O|:-O/i, "<span id='shocked'></span>");
        text = text.replace(/;\)|;-\)/i, "<span id='wink'></span>");
        text = text.replace(/X\)|X-\)/i, "<span id='angry'></span>");
        text = text.replace(/:\||:-\|/i, "<span id='straight'></span>");
        text = text.replace(/(:\/|:-\/)[^\/]/i, "<span id='slant'></span>");
        text = text.replace(/:D|:-D/i, "<span id='grin'></span>");
        text = text.replace(/:P|:-P/i, "<span id='tongue'></span>");
        text = text.replace(/:'\(|:'-\(/i, "<span id='sad'></span>");
        text = text.replace(/&gt;\.&lt;/i, "<span id='wince'></span>");
        text = text.replace(/:\)|:-\)/i, "<span id='smile'></span>");
        text = text.replace(/8\)|8-\)|B\)|B-\)/i, "<span id='cool'></span>");
        text = text.replace(/&lt;3/i, "<span id='love'></span>");
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

plugin.update = function(data)
{
    if (data.error)
        log(data.error);
    else {
        var s = "";

        for (var i = 0; i < data.lines.length; i++) {
            s += "<i>" + plugin.fixDateTime(data.lines[i].dt, plugin.addHours) + "</i> - ";
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

    theWebUI.request("?action=sendchat", null, true);
    $("#chatMessage").val("");
}

theWebUI.clearChatConfirmed = function()
{
    if ($("#chatarea").html() == "")
        return(false);

    $("#chatarea").html("");
    theWebUI.request("?action=clearchat", null, true);
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
                    "<td><span id='frown' title=':('></span></td>"+
                    "<td><span id='shocked' title=':o'></span></td>"+
                    "<td><span id='wink' title=';)'></span></td>"+
                    "<td><span id='angry' title='X)'></span></td>"+
                    "<td><span id='straight' title=':|'></span></td>"+
                "</tr>"+
                "<tr>"+
                    "<td><span id='slant' title=':/'></span></td>"+
                    "<td><span id='grin' title=':D'></span></td>"+
                    "<td><span id='tongue' title=':P'></span></td>"+
                    "<td><span id='sad' title=\":'(\"></span></td>"+
                    "<td><span id='wince' title='>.<'></span></td>"+
                "</tr>"+
                "<tr>"+
                    "<td><span id='smile' title=':)'></span></td>"+
                    "<td><span id='cool' title='8)'></span></td>"+
                    "<td><span id='devil' title='>:)'></span></td>"+
                    "<td><span id='love' title='<3'></span></td>"+
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

    var localDateTime = theConverter.date(new Date().getTime() / 1000).split(" ");
    var localHour = parseInt(localDateTime[1].split(":")[0]);

    if (localHour != plugin.remoteHour) {
        var localDay = parseInt(localDateTime[0].split(".")[0]);

        if (localDay > plugin.remoteDay)
            plugin.addHours = 24 - (plugin.remoteHour - localHour);
        else if (localDay < plugin.remoteDay)
            plugin.addHours = (localHour - plugin.remoteHour) - 24;
        else if (localHour > plugin.remoteHour)
            plugin.addHours = (localHour - plugin.remoteHour);
        else
            plugin.addHours = -(plugin.remoteHour - localHour);
    } else
        plugin.addHours = 0;

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
