<?php
eval(getPluginConf("chat"));

$jResult .= "plugin.activeInterval = " . ($activeInterval * 1000) . ";";
$jResult .= "plugin.inactiveInterval = " . ($inactiveInterval * 1000) . ";";
$jResult .= "plugin.useSmileys = " . ($useSmileys ? 1 : 0) . ";";
$jResult .= "plugin.timeFix = (new Date().getTime()) - " . round(microtime(true) * 1000) . ";";
$jResult .= "plugin.smileySet = " . ($smileySet > 1 ? $smileySet : "''") . ";";

$theSettings->registerPlugin("chat");
?>
