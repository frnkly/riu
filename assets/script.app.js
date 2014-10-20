/**
 * Riu App
 *
 * @author Francis Amankrah <frank@frnk.ca>
 * @license http://www.gnu.org/licenses/gpl.html GNU General Public License
 */

var App =
{
	result : {},
	
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
		if (typeof this.result == 'object')
		{
			var msg = this.result.text;
			
			// Add link to explanation
			if (this.result.explanation) {
				msg += ' <a href="#" onclick="App.box(\'#explanation-div\');">?</a>';
				$('#explanation').html(this.result.explanation);
			}
			
			// TODO: add notes
			if (this.result.note) {
				// ...
			}
			
			this.message(msg);
		}
	},
	
	guess : function()
	{
		// Retrieve query
		var q = $('input[name="q"]').val();
		this.log('New query "'+ q +'"');
		
		// Remove whitespace and invalid characters
		// Operators: + - * · (\u00B7) × (\u00D7) /
		q = q.replace(/^\s+|^[a-z\s]+|\s+$|[^a-z0-9\.,*\u00B7\u00D7\/\-\^'"`\s]+/ig, '');
		q = q.replace(/\s+/g, ' ');
		if (q.length < 1)
			return this.abort('What do you want to convert?');
		
		// More formatting
		if (q.indexOf('`') > -1)		q = q.replace(/`/g, '\'');
		if (q.indexOf('..') > -1)		q = q.replace(/\.+/g, '.');
		if (q.indexOf(' per ') > -1)	q = q.replace(/\s+per\s+/ig, '/');
		if (q.indexOf('mph') > -1)		q = q.replace(/mph/ig, 'miles/hour');
		if (q.indexOf('·') > -1)		q = q.replace(/\u00B7/g, '*');
		if (q.indexOf('×') > -1)		q = q.replace(/\u00D7/g, '*');
		
		// Special case: 5'10"
		var v, u1, u2;
		if (q.indexOf('\'') > -1)
		{
			// Match: 5'10" or 5'10'' or 5'10 or 5'
			var m	= q.match(/^([0-9]+)'\s?([0-9]+)?(?:"|'')?[ ]?(?:[a-z\-\/\^\s]+ )?([a-z\-]+)/i);
			
			// Fix case: 5' (no inches)
			m[2]	= m[2] || 0;
			
			// Prepare conversion
			v	= parseInt(m[1], 10) + parseFloat(m[2]/12, 10);
			u1	= 'ft';
			u2	= m[3];
		}
		
		// Normal conversion
		else
		{
			// Get conversion details
			var m	= q.match(/^([0-9\.,\s]+(?:\.[0-9]+)?)[ ]?([a-z\-\*\/\^]+)[ ]?(?:[a-z\-*\/\^\s]+ )?([a-z\-*\/\^]+)$/i);
			if (!m) return this.abort('What do you want to convert?');
			
			v	= parseFloat(m[1].replace(/[,\s]+/g, ''), 10);
			u1	= m[2];
			u2	= m[3];
		}
		
		// Attempt conversion
		this.result = Units.convert(v, u1, u2);
		if (typeof this.result == 'string')
			return this.abort(this.result);
		
		// Add a little formatting for multiplications
		if (this.result.text.indexOf('*') > -1) {
			this.result.text = this.result.text.replace(/\*/g, '&#183;');
			this.result.explanation = this.result.explanation.replace(/\*/g, ' &#215; ');
		}
		
		// TODO: add a little formatting for exponents
		
		return true;
	},
	
	message: function (m) {
		if (typeof m == 'string')
			$('#r').html(m);
	},
	
	reset: function(noFocus) {
		this.message('Riu.');
		this.result	= {};
		if (!noFocus) $('input[name="q"]').val('').focus();
	},
	
	abort: function(msg, silent) {
		// Abort
		this.result	= {};
		
		// Reset form
		if (!silent) this.reset();
		
		// Abort with message
		if (typeof msg == 'string' && msg.length > 0)
			this.message(msg);
		
		return false;
	},
	
	log: function(msg) {
		if (console)
			console.log('Riu/App: '+ msg);
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
