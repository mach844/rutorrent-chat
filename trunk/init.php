<?php
eval(getPluginConf("chat"));

$jResult .= "plugin.activeInterval = " . ($activeInterval * 1000) . ";";
$jResult .= "plugin.inactiveInterval = " . ($inactiveInterval * 1000) . ";";
$jResult .= "plugin.useSmileys = " . ($useSmileys ? 1 : 0) . ";";
$jResult .= "plugin.remoteDay = " . date("d") . ";";
$jResult .= "plugin.remoteHour = " . date("H") . ";";

$theSettings->registerPlugin("chat");
?>
