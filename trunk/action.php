<?php
require_once( "../../php/util.php" );
eval( getPluginConf( "chat" ) );

function updateChatLog() {
    global $mainChatLog;

    if (!file_exists($mainChatLog))
        return "theUILang.mainchatNotExist";
    if (!is_readable($mainChatLog))
        return "theUILang.mainchatUnreadable";
    if (!file_exists(getSettingsPath() . "/chat.log")) {
        if (!copy($mainChatLog, getSettingsPath() . "/chat.log"))
            return "theUILang.userchatCreateFail";
    } else {
        if (!is_readable(getSettingsPath() . "/chat.log"))
            return "theUILang.userchatUnreadable";
        else {
            $mainLines = file($mainChatLog);
            if (count($mainLines) > 0) {
                $lines = file(getSettingsPath() . "/chat.log");
                if (count($lines) == 0) {
                    if (!copy($mainChatLog, getSettingsPath() . "/chat.log"))
                        return "theUILang.userchatCreateFail";
                } else {
                    $last = count($lines) - 1;
                    do {
                        $lastLine = $lines[$last--];
                    } while ($lastLine == "---CLEAR---\n" && $last >= 0);
                    $mainLines = array_reverse($mainLines);
                    $key = array_search($lastLine, $mainLines);
                    $mainLines = array_reverse($mainLines);
                    if ($key === false) {
                        if (!file_put_contents(getSettingsPath() . "/chat.log", implode("", $mainLines), FILE_APPEND))
                            return "theUILang.userchatUnwritable";
                    } elseif ($key > 0 && !file_put_contents(getSettingsPath() . "/chat.log", implode("", array_slice($mainLines, count($mainLines) - $key)), FILE_APPEND))
                        return "theUILang.userchatUnwritable";
                }
            }
        }
    }
    return false;
}

if ($_REQUEST["action"]) {
    switch ($_REQUEST["action"]) {
        case "add":
            $message = round(microtime(true) * 1000) . "~" . getUser() . "~" . $_REQUEST["message"] . "\n";
            if (!is_writable($mainChatLog) || !file_put_contents($mainChatLog, $message, FILE_APPEND))
                $ret = "{ \"error\": theUILang.mainchatUnwritable }";
            else
                $ret = "{ \"success\": \"true\" }";
            break;
        case "update":
            $num = $_REQUEST["line"] + 0;
            if (!isset($_REQUEST["line"]) || !is_numeric($num) || $num < 0 || floor($num) != $num)
                $ret = "{ \"error\": theUILang.chatInvalidReq }";
            else {
                $error = updateChatLog();
                if ($error)
                    $ret = "{ \"error\": " . $error . " }";
                else {
                    $lines = file(getSettingsPath() . "/chat.log");
                    if (in_array("---CLEAR---\n", $lines)) {
                        $lines = array_reverse($lines);
                        $key = array_search("---CLEAR---\n", $lines);
                        $lines = array_reverse($lines);
                        $lines = array_slice($lines, count($lines) - $key);
                    }
                    if (count($lines) > $_REQUEST["line"]) {
                        $newLines = array_slice($lines, $_REQUEST["line"]);
                        $lines = array();
                        foreach ($newLines as $line) {
                            $timePos = stripos($line, "~");
                            $userPos = stripos($line, "~", $timePos + 1);
                            $ln["dt"] = substr($line, 0, $timePos);
                            $ln["user"] = substr($line, $timePos + 1, $userPos - $timePos - 1);
                            $ln["msg"] = trim(substr($line, $userPos + 1));
                            $lines[] = $ln;
                        }
                        $ret = json_encode(array("lines" => $lines));
                    } else {
                        $ret = "{ \"lines\": [] }";
                    }
                }
            }
            break;
        case "clear":
            $lines = file(getSettingsPath() . "/chat.log");
            $lastLine = $lines[count($lines) - 1];
            if ($lastLine != "---CLEAR---\n") {
                if (!file_put_contents(getSettingsPath() . "/chat.log", $lastLine . "---CLEAR---\n"))
                    $ret = "{ \"error\": theUILang.userchatUnwritable }";
            }

            if (empty($ret))
                $ret = "{ \"success\": \"true\" }";
            break;
    }
}

if (empty($ret))
   $ret = "{ \"error\": theUILang.chatInvalidReq }";

cachedEcho($ret, "application/json");
?>
