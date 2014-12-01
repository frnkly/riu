<?php
/**
 * @author Francis Amankrah <frank@frnk.ca>
 * @license https://www.mozilla.org/MPL/2.0/ Mozilla Public License v2.0
 */


header('Content-type: application/x-web-app-manifest+json');
header('Content-Disposition: attachment; filename="riu.webapp"');
header('Cache-Control: no-cache, must-revalidate');

// Definitions
require 'definitions.php';

?>

{
  "name": "Riu",
  "description": "<?php echo RIU_DESC; ?>",
  "icons": {
    "128": "/app/riu/assets/riu.112x112.png"
  },
  "developer": {
    "name": "Frank",
    "url": "http://frnk.ca/"
  },
  "appcache_path": "/app/riu/manifest.appcache.php",
  "fullscreen": "true",
  "default_locale": "en"
}