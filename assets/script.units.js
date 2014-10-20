/**
 * Unit handling
 *
 * @author Francis Amankrah <frank@frnk.ca>
 * @license http://www.gnu.org/licenses/gpl.html GNU General Public License
 */

var Units =
{
	getUnit : function(str, skipComposed, checkPlurals)
	{
		// Performance check
		if (!str) return false;
		
		// Composed units
		if (!skipComposed)
		{
			// Check first if the composed unit is already explicitly defined
			// before attempting conversion using division
			if (str.indexOf('*') > -1) {
				var x	= this.getUnit(str, true);
				return (x[0]) ? x : this.getComposedUnit(str, '*');
			}
			
			if (str.indexOf('/') > -1) {
				var x	= this.getUnit(str, true);
				return (x[0]) ? x : this.getComposedUnit(str, '/');
			}
		}
		
		// Loop through units array
		var found = [];
		var units = this.Descriptions;
		for (var uDesc in units)
		{
			if (uDesc == 'conversionType') continue;
			if (uDesc == 'conversion') continue;
			
			// Loop through unit descriptor for specific units (e.g. Pa, km, mg)
			for (var name in units[uDesc])
			{
				if (name == 'info') continue;
				
				// Check unit name and alternate names
				if (str == name || ($.inArray(str, units[uDesc][name]) > -1))
					found[0] = name;
				
				// Handle plurals
				if (checkPlurals && units[uDesc].info.plural && !found[0] && str.substr(str.length-1) == 's')
					if ($.inArray(str.substr(0, str.length-1), units[uDesc][name]) > -1)
						found[0] = name;
				
				// Save unit information
				if (found[0])
				{
					found[1]	= uDesc;					// Unit type
					found[2]	= units[uDesc].info.base;	// Base conversion unit
					found[3]	= units[uDesc][name][0];	// Full name
					found[4]	= 'auto';
					break;
				}
			}
			
			if (found[0]) break;
		}
		
		// Return unit details
		if (found[0])
			return found;
		
		// Try again with plurals, or return false
		// TODO: is this useful at all?
		return checkPlurals ? false : this.getUnit(str, skipComposed, true);
	},
	
	getComposedUnit : function(str, operator)
	{
		// Get the individual units of the composed unit
		var units = str.split(operator);
		var first = this.getUnit(units[0], true);
		var second = this.getUnit(units[1], true);
		if (!first || !second) return false;
		
		// Return details for composed unit
		var unit = [];
		for (var i in first)
			unit[i]	= first[i] + operator + second[i];
		
		unit[4] = 'composed';
		
		return unit;
	},
	
	convert : function(value, from, to)
	{
		this.log('Converting '+ value +' from '+ from +' to '+ to);
		
		// Check input unit
		var fromUnit = this.getUnit(from);
		if (!fromUnit)
			return from +'? We don\'t recognize that :/';
		
		// Check output unit
		var toUnit = this.getUnit(to);
		if (!toUnit)
			return to +'? We don\'t recognize that :/';
		
		// Check that both units match
		if (fromUnit[2] != toUnit[2])
			return 'Can\'t convert '+ fromUnit[1] +' to '+ toUnit[1] +'...';
		
		// Get conversion
		var raw;
		switch (toUnit[4])
		{
			case 'composed':
				raw = this.convertComposedUnit(value, fromUnit[0], toUnit[0], toUnit[2]);
				break;
			
			default:
				raw = this.convertSimpleUnit(value, fromUnit[0], toUnit[0], toUnit[2]);
		}
		
		// Format result
		var result = {};
		result.text = raw[0];
		
		// Add explanation
		if (raw[1] && raw[2]) {
			result.explanation =
				'Units of <em>'+ toUnit[1] +'</em><br />'+
				'1 '+ fromUnit[3] +' = '+ raw[1] +' '+ toUnit[3] +'<br />'+
				'1 '+ toUnit[3] +' = '+ raw[2] +' '+ fromUnit[3];
		}
		
		// Add note
		if (raw[3])
			result.note = raw[3];
		
		return result;
	},
	
	// Simple conversion
	// Returns: Array(result string, 1 fromUnits in toUnits, vice-versa, note)
	convertSimpleUnit: function(value, from, to, base)
	{
		// Convert value
		var Units = this.Descriptions.conversion;
		var converted = this.format(value / Units[base][from] * Units[base][to]);
		
		// Catch conversion errors
		if (isNaN(converted))
			return ['Internal error :/', false, false, false];
		
		// Conversion results
		var equalSign = base == 's' ? ' &#8776; ' : ' = ';
		var result = this.format(value) +' '+ from + equalSign + converted +' '+ to;
		
		// One unit of "from" in "to
		var oneFrom = this.format(Units[base][to] / Units[base][from], 6);
		
		// One unit of "to" in "from"
		var oneTo = this.format(Units[base][from] / Units[base][to], 6);
		
		// TODO: introduce notes if necessary
		var note = false;
		
		return [result, oneFrom, oneTo, note];
	},
	
	convertComposedUnit: function(value, from, to, base)
	{
		// Get operator
		var operator;
		if (base.indexOf('/') > -1) {
			operator	= '/';
		} else if (base.indexOf('*') > -1) {
			operator	= '*';
		} else {
			return ['Internal error :/', false, false, false];
		}
		
		// Get conversion factors
		var F = from.split(operator);
		var T = to.split(operator);
		var B = base.split(operator);
		var Units = this.Descriptions.conversion;
		var numeratorFactor = Units[B[0]][T[0]] / Units[B[0]][F[0]];
		var denominatorFactor = Units[B[1]][F[1]] / Units[B[1]][T[1]];
		
		// Convert value
		var converted = this.format(value * numeratorFactor * denominatorFactor);
		
		// Catch conversion errors
		if (isNaN(converted)) return ['Internal error :/', false, false, false];
		
		// Conversion results
		var result = this.format(value) +' '+ from +' = '+ converted +' '+ to;
		
		// One unit of "from" in "to
		var oneFrom = this.format(numeratorFactor * denominatorFactor, 6);
		
		// One unit of "to" in "from"
		var oneTo = this.format((1/numeratorFactor) * (1/denominatorFactor), 6);
		
		// TODO: introduce notes if necessary
		var note = false;
		
		return [result, oneFrom, oneTo, note];
	},
	
	format : function(value, digits)
	{
		// Length of number
		digits = digits || 7;
		
		// Remove trailing zeros
		var valuef = value.toPrecision().toString();
		
		// Performance check
		if (valuef.length < (digits + 1)) return parseFloat(valuef);
		
		// Set precision for longer numbers
		if (valuef.indexOf('.') > -1)
		{
			// Large numbers
			var p	= valuef.split('.');
			if (p[0].length > digits) return parseInt(p[0]).toPrecision(digits - 3);
			
			// Small numbers
			return parseFloat(value.toPrecision(digits));
		}
		
		// Default
		return value.toPrecision(digits);
	},
	
	log: function(msg) {
		if (console)
			console.log('Riu/Units: '+ msg);
		
		return false;
	},
	
	Descriptions : {
		energy : {
			info : {
				base : 'J',
				plural : true
			},
			
			pJ : ['picojoule'],
			nJ : ['nanojoule'],
			uJ : ['µJ', 'microjoule'],
			mJ : ['millijoule'],
			J : ['j', 'joule'],
			kJ : ['kj', 'kilojoule'],
			MJ : ['mj', 'megajoule'],
			GJ : ['gj', 'gigajoule'],
			TJ : ['tj', 'terajoule'],
			PJ : ['pj', 'petajoule'],
			Wh : ['wh', 'watthour', 'watt-hour'],
			kWh : ['kwh', 'kilowatthour', 'kilowatt-hour'],
			MWh : ['mwh', 'megawatthour', 'megawatt-hour'],
			GWh : ['gwh', 'gigawatthour', 'gigawatt-hour'],
			TWh : ['twh', 'terawatthour', 'terawatt-hour'],
			PWh : ['pwh', 'petawatthour', 'petawatt-hour'],
			eV : ['ev', 'electronvolt', 'electronvolts'],
			keV : ['kev', 'kiloelectronvolt'],
			MeV : ['mev', 'megaelectronvolt'],
			GeV : ['gev', 'gigaelectronvolt'],
			TeV : ['tev', 'teraelectronvolt'],
			PeV : ['pev', 'petaelectronvolt'],
			
			BTU : ['btu']
		},
		
		force : {
			info : {
				base : 'N',
				plural : true
			},
			
			fN : ['femtonewton'],
			pN : ['piconewton'],
			nN : ['nanonewton'],
			uN : ['micronewton', 'µm'],
			mN : ['millinewton'],
			N : ['newton', 'n'],
			kN : ['kilonewton', 'kn'],
			MN : ['meganewton', 'mn'],
			GN : ['giganewton', 'gn'],
			TN : ['teranewton', 'tn'],
			PN : ['petanewton', 'pn'],
			
			dyn : ['dyne'],
			gf : ['gramforce', 'gram-force'],
			kgf : ['kp', 'kilopond', 'kilogramforce', 'kilogram-force'],
			kip : ['kipf', 'klbf', 'kipforce', 'kip-force'],
			lbf : ['poundforce', 'pound-force'],
			pdl : ['poundal']
		},
		
		length : {
			info : {
				base : 'm',
				plural : true
			},
			
			fm : ['femtometer', 'femtometre'],
			pm : ['picometer', 'picometre'],
			nm : ['nanometer', 'nanometre'],
			um : ['µm', 'micrometer', 'micrometre'],
			mm : ['millimeter', 'millimetre'],
			cm : ['centimeter', 'centimetre'],
			dm : ['decametre', 'dekametre', 'dam', 'dkm'],
			m : ['meter', 'metre'],
			km : ['kilometer', 'kilometre'],
			
			'in' : ['inch', 'inches'],
			ft : ['foot', 'feet'],
			yd : ['yard'],
			mi : ['mile'],
			au : ['astronomical unit'],
			ly : ['lightyear', 'light-year'],
			pc : ['parsec']
		},
		
		mass : {
			info : {
				base : 'g',
				plural : true
			},
			
			fg : ['femtogram'],
			pg : ['picogram'],
			ng : ['nanogram'],
			ug : ['microgram', 'µg'],
			mg : ['milligram'],
			g : ['gram'],
			kg : ['kilogram', 'kilo'],
			Mg : ['megagram', 'mg'],
			t : ['tonne'],
			Gg : ['gigagram', 'gg'],
			Tg : ['teragram', 'tg'],
			Pg : ['petagram'],
			
			oz : ['ounce'],
			lbs : ['pound', 'lb'],
			st : ['stone'],
			'short ton' : ['short ton', 'ton'],
			'long ton' : ['long ton', 'longton']
		},
		
		power : {
			info : {
				base : 'W',
				plural : true
			},
			
			fW : ['femtowatt', 'fw'],
			pW : ['picowatt'],
			nW : ['nanowatt', 'nw'],
			uW : ['microwatt', 'uw', 'µW', 'µw'],
			mW : ['milliwatt'],
			W : ['watt', 'w'],
			kW : ['kilowatt', 'kw'],
			MW : ['megawatt', 'mw'],
			GW : ['gigawatt', 'gw'],
			TW : ['terawatt', 'tw'],
			PW : ['petawatt', 'pw'],
				
			'J/s' : ['joule/second', 'joules/second', 'joule/sec', 'joules/sec', 'j/s'],
			'kJ/s' : ['kilojoule/second', 'kilojoules/second', 'kilojoule/sec', 'kilojoules/sec', 'kj/s'],
			hp : ['horsepower'],
			'btu/hr' : ['btu/hour', 'btu/h'],
			'btu/min' : ['btu/minute', 'btu/m'],
			'btu/s' : ['btu/second', 'btu/sec']
		},
		
		pressure : {
			info : {
				base : 'Pa',
				plural : true
			},
			
			fPa : ['femtopascal', 'fpa'],
			pPa : ['picopascal', 'ppa'],
			nPa : ['nanopascal', 'npa'],
			uPa : ['micropascal', 'upa', 'µPa', 'µpa'],
			mPa : ['millipascal'],
			Pa : ['pascal', 'pa'],
			kPa : ['kilopascal', 'kpa'],
			MPa : ['megapascal', 'mpa'],
			GPa : ['gigapascal', 'gpa'],
			TPa : ['terapascal', 'tpa'],
			PPa : ['petapascal'],
			
			Ba : ['barye', 'barad', 'barrie', 'bary', 'baryd', 'baryed', 'barie', 'ba'],
			
			Torr : ['torr'],
			
			PSI : ['psi'],
			fbar : ['femtobar'],
			pbar : ['picobar'],
			nbar : ['nanobar'],
			ubar : ['microbar', 'µbar'],
			mbar : ['millibar'],
			cbar : ['centibar'],
			bar : ['bar'],
			kbar : ['kilobar', 'kbar'],
			Mbar : ['megabar'],
			Gbar : ['gigabar', 'gbar'],
			Tbar : ['terabar', 'tbar'],
			Pbar : ['petabar'],
			
			atm : ['atmosphere']
		},
		
		time : {
			info : {
				base : 's',
				plural : true,
				approx : true
			},
			
			fs : ['femtosecond', 'femto-second', 'fs'],
			ps : ['picosecond', 'pico-second', 'ps'],
			ns : ['nanosecond', 'nano-second', 'ns'],
			us : ['microsecond', 'micro-second', 'us', 'µs'],
			ms : ['millisecond', 'milli-second'],
			s : ['second'],
			min : ['minute'],
			hr : ['hour', 'hours'],
			days : ['day'],
			weeks : ['week'],
			months : ['month', 'mth'],
			yr : ['year', 'years'],
			decades : ['decade'],
			centuries : ['century'],
			millennia : ['millennium', 'millenium', 'milenium', 'millennia', 'millenia', 'milenia']
		},
		
		conversionType: {
			energy : 'auto',
			force : 'auto',
			length : 'auto',
			mass : 'auto',
			power : 'auto',
			pressure : 'auto',
			time : 'auto',
			velocity : 'auto',
			volume : 'auto',
			
			'force/time' : 'composed',
			'length/time' : 'composed',
			'mass/time' : 'composed',
			'volume/time' : 'composed'
		},
		
		conversion :
		{
			// Angles
			
			// Area
			
			// Bytes
			
			// Density
			
			// Energy
			J : {
				fJ : 1000000000000000,
				pJ : 1000000000000,
				nJ : 1000000000,
				uJ : 1000000,
				mJ : 1000,
				J : 1,
				kJ : .001,
				MJ : .000001,
				GJ : .000000001,
				TJ : .000000000001,
				PJ : .000000000000001,
				Wh : (1/3600),
				kWh : (1/3600000),
				MWh : (1/3600000000),
				GWh : (1/3600000000000),
				TWh : (1/3600000000000000),
				PWh : (1/3600000000000000000),
				eV : 6.241509e18,
				keV : 6.241509e15,
				MeV : 6.241509e12,
				GeV : 6.241509e9,
				TeV : 6.241509e6,
				PeV : 6.241509e3,
				BTU : 0.00094781712
			},
			
			// Force
			N : {
				fN : 1000000000000000,
				pN : 1000000000000,
				nN : 1000000000,
				uN : 1000000,
				mN : 1000,
				N : 1,
				kN : .001,
				MN : .000001,
				GN : .000000001,
				TN : .000000000001,
				PN : .000000000000001,
				dyn : 100000,
				gf : 101.9716213,
				kgf : .1019716213,
				kip : 0.00022480894387,
				lbf : 0.22480894387,
				pdl : 7.2330140801
			},
			
			// Length
			m : {
				fm : 1000000000000000,
				pm : 1000000000000,
				nm : 1000000000,
				um : 1000000,
				mm : 1000,
				cm : 100,
				dm : 10,
				m : 1,
				km : .001,
				'in' : 39.3701,
				ft : 3.28084,
				yd : 1.09361,
				mi : 0.000621371,
				au : (1/149597870700),
				ly : (1/9460730472580800),
				pc : 3.24077929e-17
			},
			
			// Mass
			g : {
				fg : 1000000000000000,
				pg : 1000000000000,
				ng : 1000000000,
				ug : 1000000,
				mg : 1000,
				g : 1,
				kg : .001,
				Mg : .000001,
				t : .000001,
				Gg : .000000001,
				Tg : .000000000001,
				Pg : .000000000000001,
				oz : 0.035274,
				lbs : 0.00220462,
				st : 0.000157473,
				'short ton' : .0000011023,
				'long ton' : .00000098421
			},
			
			// Power
			W : {
				fW : 1000000000000000,
				pW : 1000000000000,
				nW : 1000000000,
				uW : 1000000,
				mW : 1000,
				W : 1,
				kW : .001,
				MW : .000001,
				GW : .000000001,
				TW : .000000000001,
				PW : .000000000000001,
				
				'J/s' : 1,
				'kJ/s' : .001,
				hp : .0013410220924,
				'btu/hr' : 3.4121416351,
				'btu/min' : .056869027252,
				'btu/s' : .00094781712087
			},
			
			// Pressure
			Pa : {
				fPa : 1000000000000000,
				pPa : 1000000000000,
				nPa : 1000000000,
				uPa : 1000000,
				mPa : 1000,
				Pa : 1,
				kPa : .001,
				MPa : .000001,
				GPa : .000000001,
				TPa : .000000000001,
				PPa : .000000000000001,
				
				Ba : 10,
				
				Torr : .0075006167382,
				
				PSI : 0.000145037738,
				fbar : 10000000000,
				pbar : 10000000,
				nbar : 10000,
				ubar : 10,
				mbar : .01,
				cbar : .001,
				bar : .00001,
				kbar : .00000001,
				Mbar : .00000000001,
				Gbar : .00000000000001,
				Tbar : .00000000000000001,
				Pbar : .00000000000000000001,
				
				atm : .0000098692316931
			},
			
			// Temperature
			celsius : {
				celsius : 1
			},
			
			// Time
			s : {
				fs : 1000000000000000,
				ps : 1000000000000,
				ns : 1000000000,
				us : 1000000,
				ms : 1000,
				s : 1,
				min : (1/60),
				hr : (1/3600),
				days : (1/(3600*24)),
				weeks : (1/(3600*24*7)),
				months : (1/(3600*24*30)),
				yr : (1/(3600*24*365)),
				decades : (1/(3600*24*365*10)),
				centuries : (1/(3600*24*365*100)),
				millennia : (1/(3600*24*365*1000))
			},
			
			// Volume
			'm^3' : {
				'm^3' : 1
			}
		}
	}
};
