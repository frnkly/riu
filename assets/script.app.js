/*
 * Riu App
 * 
 */

var App =
{
	result : null,
	
	init : function()
	{
		// Solve query
		if ($('input[name="q"]').val().length > 0) this.go();
		
		// Reset form
		else this.reset(true);
		
		// Welcome message
		this.message('Riu.');
	},
	
	go : function(i)
	{
		// Performance check
		var q	= i || $('input[name="q"]').val();
		if (q.length < 1)
			return this.abort('What do you want to convert?');
		
		// Analyse string
		this.guess();
		
		// Display result
		if (typeof this.result == 'string')
			this.message(this.result);
	},
	
	guess : function()
	{
		// Retrieve query
		var q = $('input[name="q"]').val();
		
		// Remove whitespace and invalid characters
		q = q.replace(/^\s+|^[a-z\s]+|\s+$|[^a-z0-9\.,\/\-\^'"`\s]+/ig, '');
		q = q.replace(/\s+/g, ' ');
		//q		= q.replace(/^\s+|\s+$/g,'').replace(/\s+/g, ' ').replace(this.reg.invalid, '');
		if (q.length < 1) return this.abort('What do you want to convert?');
		
		// Remove comparative term, other cleanup
		//if (q.indexOf(' in ') > -1)	q = q.replace(' in ', ' ');
		//if (q.indexOf(' to ') > -1)	q = q.replace(' to ', ' ');
		if (q.indexOf('`') > -1)		q = q.replace(/`/g, '\'');
		if (q.indexOf('..') > -1)		q = q.replace(/\.+/g, '.');
		if (q.indexOf(' per ') > -1)	q = q.replace(/\s+per\s+/ig, '/');
		if (q.indexOf('mph') > -1)		q = q.replace(/mph/ig, 'miles/hour');
		
		// Special case: 6'7"
		var v, u1, u2;
		if (q.indexOf('\'') > -1 || q.indexOf('"') > -1)
		{
			var m	= q.match(/([0-9]+)'\s?([0-9]+)" ([a-z\-]+)/i);
			
			v	= parseInt(m[1], 10) + parseFloat(m[2]/12, 10);
			u1	= 'ft';
			u2	= m[3];
		}
		
		// Normal conversion
		else
		{
			// Get conversion details
			//var reg = /^([0-9\.,]+(?:\.[0-9]+)?)[ ]?([a-z\-\/\^]+)[ ]?(?:[a-z\-\/\^\s]+ )?([a-z\-\/\^]+)$/i;
			var reg = /^([0-9\.,\s]+(?:\.[0-9]+)?)[ ]?([a-z\-\/\^]+)[ ]?(?:[a-z\-\/\^\s]+ )?([a-z\-\/\^]+)$/i;
			var m	= q.match(reg);
			if (!m) return this.abort('What do you want to convert?');
			
			v	= parseFloat(m[1].replace(',', ''), 10);
			u1	= m[2];
			u2	= m[3];
		}
		
		// Attempt conversion
		if (this.convert(v, u1, u2) && !this.result)
			return this.abort('Could\'nt perform conversion :(');
		
		// Success!
		return true;
	},
	
	convert : function(v, from, to)
	{
		// Check input unit
		var u1	= this.getUnit(from);
		if (!u1) return this.abort(from +'? We don\'t recognize that :/', true);
		
		// Check output unit
		var u2	= this.getUnit(to);
		if (!u2) return this.abort(to +'? We don\'t recognize that :/', true);
		
		// Check that both units match
		if (u1[2] != u2[2]) return this.abort('Can\'t convert '+ u1[1] +' to '+ u2[1] +'...', true);
		
		// Check convertion method
		var type	= u1[1];
		if (!Units.handler[type]) return this.abort('Internal error :/');
		
		// Handle conversion and get explanation
		var conv	= Conversion[Units.handler[type]](v, u1[0], u2[0], u1[2]);
		
		// Explain conversion
		this.result	= conv[0];
		if (conv[1] && conv[2])
		{
			this.result	+= ' <a href="#" onclick="App.box(\'#explanation-div\');">?</a>';
			$('#explanation').html(
				'Units of <em>'+ u1[1] +'</em><br />'+
				'1 '+ u1[3] +' = '+ conv[1] +' '+ u2[3] +'<br />'+
				'1 '+ u2[3] +' = '+ conv[2] +' '+ u1[3]
			);
		}
		
		return true;
	},
	
	getUnit : function(u, skipComposed, checkPlurals)
	{
		// Performance check
		if (!u) return false;
		
		// Composed units
		if (!skipComposed)
		{
			if (u.indexOf('/') > -1) {
				var x	= this.getUnit(u, true);
				return (x[0]) ? x : this.getComposedUnit(u, '/');
			}
			
			if (u.indexOf('*') > -1) {
				var x	= this.getUnit(u, true);
				return (x[0]) ? x : this.getComposedUnit(u, '*');
			}
		}
		
		// Loop through units array
		var i	= [];
		for (var t in Units)
		{
			if (t == 'handler') continue;
			if (t == 'conversion') continue;
			
			for (var n in Units[t])
			{
				if (n == 'info') continue;
				
				// Check unit name, alternate names
				if (u == n || ($.inArray(u, Units[t][n]) > -1)) i[0] = n;
				
				// Handle plurals
				if (checkPlurals && Units[t].info.plural && !i[0] && u.substr(u.length-1) == 's') {
					if ($.inArray(u.substr(0, u.length-1), Units[t][n]) > -1) i[0] = n;
				}
				
				// Save unit information
				if (i[0])
				{
					i[1]	= t;					// Unit type
					i[2]	= Units[t].info.base;	// Base conversion unit
					i[3]	= Units[t][n][0];		// Full name
					break;
				}
			}
			
			if (i[0]) break;
		}
		
		// Return unit details
		if (i[0]) {
			return i;
		}
		
		// Try again with plurals, or return false
		return checkPlurals ? false : this.getUnit(u, true, true);
	},
	
	getComposedUnit : function(u, s)
	{
		var us	= u.split(s);
		var u1	= this.getUnit(us[0], true);
		var u2	= this.getUnit(us[1], true);
		if (!u1 || !u2) return false;
		
		// Return composed unit
		var unit	= [];
		for (var i in u1)
			unit[i]	= u1[i] + s + u2[i];
		
		return unit;
	},
	
	message : function (m) {
		if (typeof m == 'string') {
			$('#r').html(m);
		}
	},
	
	reset : function(noFocus)
	{
		this.message('');
		this.result	= null;
		if (!noFocus) $('input[name="q"]').val('').focus();
	},
	
	abort : function(msg, silent)
	{
		// Abort
		this.result	= null;
		
		// Reset form
		if (!silent) this.reset();
		
		// Abort with message
		if (typeof msg == 'string' && msg.length > 0) {
			this.message(msg);
		}
		
		return false;
	},
	
	/*
	 * Dump a variable to view its source
	 *	http://binnyva.blogspot.com/2005/10/dump-function-javascript-equivalent-of.html
	 */
	dump : function(obj, deep, inArray, level)
	{
		var dump	= '';
		var pad		= '';
		if (!level) level	= 0;
		for (var j = 0; j < level + 1; j++) {
			pad	+= '   ';
		}
		
		// Array
		// obj.constructor
		var type	= typeof obj;
		pad		+= '['+ type +'] ';
		if (type == 'object' || type == 'array' || type == 'class' || type == 'regexp')
		{
			for(var i in obj)
			{
				var v	= obj[i];
				if (typeof v != 'function' || deep) {
					var t	= typeof v;
					if (t == 'object' || t == 'array' || t == 'class' || t == 'regexp') {
						dump	+= pad + i + ':\n';
						dump	+= this.dump(v, deep, true, level + 1);
					} else {
						dump	+= pad + i +': "'+ v +'"\n';
					}
				}
			}
		}
		
		// Element
		else if (type == 'element' || type == 'textnode' || type == 'whitespace') {
			dump	= '['+ obj.nodeName +']';
		}
		
		// Strings
		else {
			dump	= '['+ type +'] '+ obj;
		}
		
		// Dump
		if (!inArray) alert(dump);
		else return dump;
	}
};

App.box = function(id)
{
	// Performance check
	if (!$(id).is(':hidden')) return;
	
	// Hide other boxes
	$('.pop').hide();
	
	// Show this box
	if ($(id).is(':hidden')) {
		$(id).slideDown(300);
	}
	
	// Hide this box
	else {
		$('.pop').hide();
	}
};

// Initiate
$(document).ready(function()
{
	// Initialize app
	App.init();
	
	// About this tool
	$('#tool').click(function() {
		App.box('#abt-tool');
	});
	
	// About the author
	$('#author').click(function() {
		App.box('#abt-author');
	});
	
	// Go offline
	$('#offline').click(function() {
		App.box('#go-offline');
	});
	
	// Close all info boxes
	$('.pop').click(function() {
		$('.pop').hide();
	});
});
