<?php
/**
 * Riu App
 *
 * @author Francis Amankrah <frank@frnk.ca>
 * @license https://www.mozilla.org/MPL/2.0/ Mozilla Public License v2.0
 */


// App constants
require 'definitions.php';

// Send shortlink as a header.
header('Link: <http://frnk.ca/app/riu/>; rel="shortlink"');

// Retrieve conversion from request, if any.
$q	= isset($_GET['q']) ? preg_replace('/[^0-9a-z\/\*\^\-\., ]/i', '', $_GET['q']) : '';

?>
<!DOCTYPE html>
<html lang="en" manifest="manifest.appcache.php">
<head>
	<title>Riu - The Really Intuitive Unit converter</title>
	<meta charset="utf-8">
	<meta name="author" content="Francis Amankrah" />
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
	<meta name="description" content="<?php echo RIU_DESC; ?> <?php echo RIU_UNITS; ?>" />
	<meta name="keywords" content="riu, unit converter, wolfram alpha" />
	<meta name="robots" content="index, follow" />
	<link rel="canonical" href="http://frnk.ca/app/riu/" />
	<link rel="shortlink" type="text/html" href="http://frnk.ca/app/riu/" />
	<link rel="shortcut icon" type="image/x-icon" href="assets/riu.ico" />
	
	<!-- App data -->
	<meta name="application-name" content="Riu.">
	<meta name="msapplication-tooltip" content="The Really Intuitive Unit converter">
	<meta name="msapplication-starturl" content="http://frnk.ca/app/riu/">
	<meta name="msapplication-TileColor" content="#26535D">
	<meta name="msapplication-TileImage" content="assets/riu.transparent.144x144.png">
	<meta name="msapplication-square70x70logo" content="assets/riu.70x70.png">
	<meta name="msapplication-square150x150logo" content="assets/riu.150x150.png">
	<meta name="msapplication-square310x310logo" content="assets/riu.310x310.png">
	<meta name="apple-mobile-web-app-capable" content="yes">
	<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
	<meta name="format-detection" content="telephone=no">
	<link rel="apple-touch-icon" sizes="70x70" href="assets/riu.70x70.png">
	<link rel="apple-touch-icon" sizes="150x150" href="assets/riu.150x150.png">
	<link rel="apple-touch-icon" sizes="310x310" href="assets/riu.310x310.png">
	<link rel="apple-touch-startup-image" href="assets/riu.320x480.png">
	<meta property="og:title" content="Riu - The Really Intuitive Unit Converter">
	<meta property="og:type" content="website">
	<meta property="og:url" content="http://frnk.ca/app/riu/">
	<meta property="og:desc" content="<?php echo RIU_DESC; ?>">
	<meta property="og:image" content="assets/riu.310x310.png">
	
	<!-- Other scripts -->
	<link rel="stylesheet" href="http://fonts.googleapis.com/css?family=Lato:300" type="text/css" />
	<link rel="stylesheet" type="text/css" href="assets/style.app.min.css?<?php echo VER; ?>" />
</head>
<body>
	
	<section>
		<form name="converter" onsubmit="App.go(); return false;">
            <span class="result"></span>
            <input name="q" type="text" placeholder="e.g. 8 cm cubed in inches..." value="<?php echo $q; ?>" autocomplete="off" />
            <div class="controls">
                <input name="clear" type="button" value="&#10008;" onclick="App.reset()" />
                <input name="submit" type="button" value="&#10004;" onclick="App.go()" />
                <input name="help" type="button" value="&#10071;" onclick="App.alert('.help')" />
            </div>
		</form>
	</section>
	
	<section class="info explanation">
		<div>
			<span onclick="return App.close(this.parentNode.parentNode)">&#10005;</span>
			<h1>Description of conversion:</h1>
			<div class="explanation-msg"></div>
		</div>
	</section>
    
	<script type="text/javascript" src="assets/script.app.min.js?<?php echo VER; ?>"></script>
	<script type="text/javascript" src="assets/script.units.min.js?<?php echo VER; ?>"></script>
<?php
	// Include analytics code
	file_exists('analytics.php') ? require 'analytics.php' : null;
?>
    <section class="info help">
        <div>
			<span onclick="return App.close(this.parentNode.parentNode)">&#10005;</span>
            <h1>Riu <span>(v. <?php echo VER; ?>)</span></h1>
            <div><?php echo RIU_DESC; ?></div>
            <div>To use this app offline, simply bookmark this page on your phone or tablet and add it to your homescreen.</div>
            <div><?php echo RIU_UNITS; ?></div>
            <div style="text-align: center;">
                &copy; <?php echo date('Y'); ?> <a href="http://frnk.ca/" target="_blank">Francis Amankrah</a><br />
                <a href="https://www.mozilla.org/MPL/2.0/" target="_blank">Mozilla Public License</a>
            </div>
        </div>
    </section>
</body>
</html>

