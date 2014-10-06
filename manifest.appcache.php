<?php
header('Content-type: text/cache-manifest');
header('Content-Disposition: attachment; filename="riu.appcache"');
header('Cache-Control: no-cache, must-revalidate');

// Definitions
require 'defines.php';

// Version
$v	= RIU_VER ."\n";

// See http://www.html5rocks.com/en/tutorials/appcache/beginner/
?>
CACHE MANIFEST
# 2014-08-02 102

# Explicitly cached 'master entries'
CACHE:
defines.php
index.php
assets/style.app.css?<?php echo $v; ?>
assets/style.font.css?<?php echo $v; ?>
assets/script.app.min.js?<?php echo $v; ?>
assets/script.units.min.js?<?php echo $v; ?>
assets/32.more.png
assets/32.w8.png
assets/32.w8-inv-f7.png
assets/64.conv-f7.png
assets/r.blue.ico
assets/riu.72x72.png
assets/riu.112x112.png
assets/riu.144x144.png
assets/riu.white.png
http://ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js

