<?php
/**
 * @author Francis Amankrah <frank@frnk.ca>
 * @license https://www.mozilla.org/MPL/2.0/ Mozilla Public License v2.0
 */

// Headers
header('Content-type: text/cache-manifest');
header('Content-Disposition: attachment; filename="riu.appcache"');
header('Cache-Control: no-cache, must-revalidate');

// Definitions
require 'definitions.php';

// Version
$v	= VER ."\n";
$m	= $_SERVER['HTTP_HOST'] == 'localhost' ? time() : '2014-11-30 101';

// See http://www.html5rocks.com/en/tutorials/appcache/beginner/
?>
CACHE MANIFEST
# <?php echo $m; ?>

# Explicitly cached 'master entries'
CACHE:
definitions.php
index.php
assets/style.app.min.css?<?php echo $v; ?>
assets/script.app.min.js?<?php echo $v; ?>
assets/script.units.min.js?<?php echo $v; ?>
assets/32.more.png
assets/32.w8.png
assets/32.w8-inv-f7.png
assets/64.conv-f7.png
assets/r.ico
assets/riu.70x70.png
assets/riu.150x150.png
assets/riu.310x310.png
assets/riu.transparent.144x144.png
http://fonts.googleapis.com/css?family=Lato:300
http://ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js

NETWORK:
*
