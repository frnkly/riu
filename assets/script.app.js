/**
 * Riu App
 *
 * @author Francis Amankrah <frank@frnk.ca>
 * @license https://www.mozilla.org/MPL/2.0/ Mozilla Public License v2.0
 */

var App =
{
    /**
     * Results object
     */
	Result: {},
    
    /**
     * Regular expressions
     */
	Regex: {
		query: /^([0-9\.,\s]+(?:\.[0-9]+)?)[ ]?([a-z\-\*\/\^0-9]+)[ ]?(?:[a-z\-*\/\^\s]+ )?([a-z\-*\/\^0-9]+)$/i,
		queryFeet: /^([0-9]+)'\s?([0-9]+)?(?:"|'')?[ ]?(?:[a-z\-\/\^\s]+ )?([a-z\-]+)/i
	},
    
	init: function()
	{
		// Solve query
        if (document.converter.q.value.trim().length > 0) this.go();
		
		// Reset form
		else this.reset(true);
	},
	
	go: function(i)
	{
		// Performance check
		var q	= i || document.converter.q.value.trim();
		if (q.length < 1)
			return this.abort('What do you want to convert?');
		
		// Analyse string
		this.guess(q);
		
		// Display result
		if (typeof this.Result == 'object')
		{
			// Format results, add link to explanation
			var msg = this.Result.text +' <a href="#" class="explain" onclick="App.alert(\'.explanation\');">[?]</a>';
            document.querySelector('.explanation-msg').innerHTML    = this.Result.explanation;
			
			// TODO: add notes
			if (this.Result.note) {
				// ...
			}
			
			this.message(msg);
		}
	},
	
	guess: function(q)
	{
		this.log('New query "'+ q +'"');
		
		// Remove whitespace and invalid characters
		// Operators: + - * · (\u00B7) × (\u00D7) / ^ ' "
		q = q.replace(/^\s+|^[a-z\s]+|\s+$|[^a-z0-9\.,*\u00B7\u00D7\/\-\^'"`\s]+/ig, '');
		q = q.replace(/\s+/g, ' ');
		if (q.length < 1)
			return this.abort('What do you want to convert?');
		
		// More formatting
		if (q.indexOf('`') > -1)		q = q.replace(/`/g, '\'');
		if (q.indexOf('..') > -1)		q = q.replace(/\.+/g, '.');
		if (q.indexOf(' per ') > -1)	q = q.replace(/\s+per\s+/ig, '/');
		if (q.indexOf('mph') > -1)		q = q.replace(/mph/ig, 'miles/hour');
		if (q.indexOf(' square') > -1)	q = q.replace(/\s+squared?/ig, '^2 ');
		if (q.indexOf(' cube') > -1)	q = q.replace(/(\s+cubed?)/ig, '^3 ');
		if (q.indexOf('·') > -1)		q = q.replace(/\u00B7/g, '*');
		if (q.indexOf('×') > -1)		q = q.replace(/\u00D7/g, '*');
		
		// Special case: 5'10"
		var value, fromUnit, toUnit;
		if (q.indexOf('\'') > -1)
		{
			// Match: 5'10" or 5'10'' or 5'10 or 5'
			var m = q.match(this.Regex.queryFeet);
			
			// Fix case: 5' (no inches)
			m[2] = m[2] || 0;
			
			// Prepare conversion
			value = parseInt(m[1], 10) + parseFloat(m[2]/12, 10);
			fromUnit = 'ft';
			toUnit = m[3];
		}
		
		// Normal conversion
		else
		{
			// Get conversion details
			var m = q.match(this.Regex.query);
			if (!m) return this.abort('What do you want to convert?');
			
			value = parseFloat(m[1].replace(/[,\s]+/g, ''), 10);
			fromUnit = m[2];
			toUnit = m[3];
		}
		
		// Attempt conversion
		this.Result = Units.convert(value, fromUnit, toUnit);
		if (typeof this.Result == 'string')
			return this.abort(this.Result);
		
		// Add a little formatting for multiplications
		if (this.Result.text.indexOf('*') > -1) {
			this.Result.text = this.Result.text.replace(/\*/g, '&#183;');
			this.Result.explanation = this.Result.explanation.replace(/\*/g, ' &#215; ');
		}
		
		// TODO: add a little formatting for exponents
		
		return true;
	},
    
    alert: function(selector) {
        document.querySelector(selector).style.display   = 'inline-block';
    },
    
    close: function(element) {
        element.style.display   = 'none';
    },
	
    message: function (m) {
        if (typeof m == 'string')
            document.querySelector('.result').innerHTML = m;
    },
	
	reset: function(noFocus) {
		this.message('Riu.');
		this.Result	= {};
		if (!noFocus) {
            document.converter.q.value  = '';
            document.converter.q.focus();
        }
	},
	
	abort: function(msg, silent) {
		if (!silent) this.reset();
		
		// Display message
		if (typeof msg == 'string' && msg.length > 0)
			this.message(msg);
		
		return false;
	},
	
	log: function(msg) {
		if (console) console.log('App.js - '+ msg);
	}
};

document.addEventListener('DOMContentLoaded', function(event) {
    App.init();
});
