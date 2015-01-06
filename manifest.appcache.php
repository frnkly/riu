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

// Manifest version
$l  = $_SERVER['HTTP_HOST'] == 'localhost';
$m	= $l ? time() : '2015-01-05 104';

// See http://www.html5rocks.com/en/tutorials/appcache/beginner/
?>
CACHE MANIFEST
# <?php echo $m; ?>

# Explicitly cached 'master entries'
CACHE:
definitions.php
index.php
assets/riu.70x70.png
assets/riu.150x150.png
assets/riu.310x310.png
assets/riu.320x480.png
assets/riu.transparent.144x144.png
assets/riu.ico
assets/style.app.min.css?<?php echo VER ."\n"; ?>
assets/script.app.min.js?<?php echo VER ."\n"; ?>
assets/script.units.min.js?<?php echo VER ."\n"; ?>
http://fonts.googleapis.com/css?family=Lato:300

NETWORK:
*
