<?php
/**
 * Riu App
 *
 * @author Francis Amankrah <frank@frnk.ca>
 * @license https://www.mozilla.org/MPL/2.0/ Mozilla Public License v2.0
 */


// Retrieve app definitions
require 'definitions.php';

// Send shortlink as a header
header('Link: <'. RIU_LINK .'>; rel="shortlink"');

// Retrieve query from request
$q	= isset($_GET['q']) ? preg_replace('/[^0-9a-z\/\*\^\-\., ]/i', '', $_GET['q']) : '';

?>
<!DOCTYPE html>
<html lang="en" manifest="manifest.appcache.php">
<head>
	<title><?php echo RIU_TITLE; ?></title>
	<meta charset="utf-8">
	<meta name="author" content="Francis Amankrah" />
	<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
	<meta name="description" content="<?php echo RIU_DESC; ?> <?php echo RIU_UNITS; ?>" />
	<meta name="keywords" content="riu, unit converter, wolfram alpha" />
	<meta name="robots" content="index, follow" />
	<link rel="canonical" href="http://frnk.ca/app/riu/" />
	<link rel="shortlink" type="text/html" href="<?php echo RIU_LINK; ?>" />
	<link rel="shortcut icon" type="image/x-icon" href="assets/r.ico" />
	
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
	<link rel='stylesheet' href='http://fonts.googleapis.com/css?family=Lato:300' type='text/css' />
	<link rel="stylesheet" type="text/css" href="assets/style.app.min.css?<?php echo VER; ?>" />
	<script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/2.0.3/jquery.min.js"></script>
	<script type="text/javascript" src="assets/script.app.min.js?<?php echo VER; ?>"></script>
	<script type="text/javascript" src="assets/script.units.min.js?<?php echo VER; ?>"></script>
<?php
	// Include analytics code
	file_exists('analytics.php') ? require 'analytics.php' : null;
?>
</head>
<body>
	
	<!-- Input form -->
	<section id="box">
		<span id="r"></span>
		<form onsubmit="App.go(); return false;">
			<div id="input">
				<input name="clear" type="button" value="x" onclick="App.reset()" />
				<input name="q" type="text" placeholder="e.g. 8 cm cubed in inches..." value="<?php echo $q; ?>" autocomplete="off" />
				<div class="clr"></div>
			</div>
			<a href="#" onclick="App.go();"></a>
		</form>
	</section>
	
	<!-- About this tool -->
	<section class="info pop" id="abt-tool">
		<div>
			<span class="x">x</span>
			<h1>Riu <span>(v. <?php echo VER; ?>)</span></h1>
			<div><?php echo RIU_DESC; ?></div>
			<div><?php echo RIU_UNITS; ?></div>
			<div style="text-align: center;">
				<a href="http://frnk.ca/" target="_blank">Francis Amankrah</a> &copy; <?php echo date('Y'); ?><br />
				<a href="http://www.gnu.org/licenses/gpl.html" target="_blank">GNU General Public License</a>
			</div>
		</div>
	</section>
	
	<!-- About the author -->
	<section class="info pop" id="abt-author">
		<div>
			<span class="x">x</span>
			<h1>Author</h1>
			<div>I'm Francis, a Montreal-based freelance web developer. I make web apps using HTML5 &amp; Javascript. Sometimes they're useful apps, too.</div>
			<div>Drop me a line: <a href="mailto:&#102;&#114;&#97;&#110;&#107;&#64;&#102;&#114;&#110;&#107;&#46;&#99;&#97;">&#102;&#114;&#97;&#110;&#107;&#64;&#102;&#114;&#110;&#107;&#46;&#99;&#97;</a></div></div>
		</div>
	</section>
	
	<!-- Go offline -->
	<section class="info pop" id="go-offline">
		<div>
			<span class="x">x</span>
			<h1>Go offline</h1>
			<div>Link: <a href="http://frnk.ca/app/riu" type="text/html">frnk.ca / app / riu</a></div>
			<div>To use this app offline, simply bookmark this page on your phone or tablet and add it to your homescreen. If you're on a Windows Phone, you can click on <em class="w8"></em> for a nice tile image.</div>
		</div>
	</section>
	
	<!-- Explanation of unit conversion -->
	<section class="info pop" id="explanation-div">
		<div>
			<span class="x">x</span>
			<h1>Explanation:</h1>
			<div id="explanation"></div>
		</div>
	</section>
	
	<!-- Windows Phone tile -->
	<div id="w8-tile" class="pop"></div>
	
	<a href="#" id="links-btn" onclick="$('#links-btn').slideUp(300);$('#links').slideDown(300);" class="btn"></a>
	<section id="links">
		<a href="#" id="tool">
			<span>about this tool</span>
		</a>
<!--
		<a href="#" id="author">
			<span>about the author</span>
		</a>
-->
		<a href="#" id="offline">
			<span>go offline</span>
		</a>
		<a href="#" id="w8" class="w8" onclick="$('#w8-tile').slideDown(300)"></a>
	</section>
</body>
</html>

