/**
 * Unit handling
 *
 * @author Francis Amankrah <frank@frnk.ca>
 * @license http://www.gnu.org/licenses/gpl.html GNU General Public License
 */

var Units =
{
	convert : function(value, from, to)
	{
		this.log('Converting '+ value +' from '+ from +' to '+ to);
		
		// Input unit
		var fromUnit = this.getUnit(from);
		if (!fromUnit)
			return from +'? We don\'t recognize that :/';
		
		// Check output unit
		var toUnit = this.getUnit(to);
		if (!toUnit)
			return to +'? We don\'t recognize that :/';
		
		// Check that both units match
		if (fromUnit.base != toUnit.base)
			return 'Can\'t convert '+ fromUnit.type +' to '+ toUnit.type +'...';
		
		// Get conversion
		var raw;
		switch (fromUnit.conv)
		{
			case 'composed':
				raw = this.convertComposedUnit(value, fromUnit, toUnit);
				break;
			
			case 'exponent':
			default:
				raw = this.convertSimpleUnit(value, fromUnit, toUnit);
		}
		
		// Check for errors
		if (typeof raw == 'string')
			return raw;
		
		// Format result
		var oneFrom = this.format(raw.targetUnit.factor / raw.originalUnit.factor, 6);	// One unit of "from" in "to
		var oneTo = this.format(raw.originalUnit.factor / raw.targetUnit.factor, 6);	// One unit of "to" in "from"
		var result = {
			text: raw.text,
			explanation:
				'Units of <em>'+ raw.unitType +'</em><br />'+
				'1 '+ raw.originalUnit.name +' = '+ oneFrom +' '+ raw.targetUnit.name +'<br />'+
				'1 '+ raw.targetUnit.name +' = '+ oneTo +' '+ raw.originalUnit.name
		};
		
		return result;
	},
	
	getUnit : function(str, skipComposed, skipPlurals)
	{
		// Performance check
		if (!str) return false;
		
		// Composed units
		// Check first if the composed unit is already explicitly defined
		// before attempting conversion using division
		if (!skipComposed)
		{
			// Multiplications
			if (str.indexOf('*') > -1) {
				var x	= this.getUnit(str, true);
				return (x && x.unit) ? x : this.getComposedUnit(str, '*');
			}
			
			// Divisions
			if (str.indexOf('/') > -1) {
				var x	= this.getUnit(str, true);
				return (x && x.unit) ? x : this.getComposedUnit(str, '/');
			}
			
			// Exponents
			var test = str.match(/([a-z]+)[\^]?([0-9]+)/i);
			if (test) {
				var x	= this.getUnit(str, true);
				return (x && x.unit) ? x : this.getPowerUnit(test[1], test[2]);
			}
		}
		
		// Loop through units array
		var found = {};
		var units = this.Descriptions;
		for (var type in units)
		{
			if (type == 'conversionType') continue;
			if (type == 'conversion') continue;
			
			// Loop through unit descriptor for specific units (e.g. Pa, km, mg)
			for (var name in units[type])
			{
				if (name == 'info') continue;
				
				// Check unit name and alternate names
				if (str == name || ($.inArray(str, units[type][name]) > -1))
					found.abbr = name;
				
				// Handle plurals
				if (!skipPlurals && units[type].info.plural && !found.abbr && str.substr(str.length-1) == 's')
					if ($.inArray(str.substr(0, str.length-1), units[type][name]) > -1)
						found.abbr = name;
				
				// Save unit information
				if (found.abbr)
				{
					found.type = type;					// Type of unit
					found.base = units[type].info.base;	// Base conversion unit
					found.name = units[type][name][0];	// Full name
					found.conv = 'auto';				// Conversion handler
					found.power = 1;
					break;
				}
			}
			
			if (found.abbr) break;
		}
		
		// Return unit details
		if (found.abbr)
			return found;
		
		// Could not identify unit
		return this.log('Could not identify unit "'+ str +'"');
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
		
		unit.conv = 'composed';
		
		return unit;
	},
	
	getPowerUnit: function(str, power)
	{
		// Get unit details
		var unit = this.getUnit(str);
		if (!unit) return false;
		unit.conv = 'exponent';
		unit.power = power;
		
		return unit;
	},
	
	// Simple conversion
	convertSimpleUnit: function(value, fromUnit, toUnit) {
		this.log('Conversion type: simple');
		
		// Initialize result object
		var raw = {
			power: fromUnit.power,
			originalUnit: {
				value: this.format(value)
			},
			targetUnit: {}
		};
		
		// Do conversion
		var Units = this.Descriptions.conversion;
		raw.originalUnit.factor = Math.pow(Units[fromUnit.base][fromUnit.abbr], raw.power);
		raw.targetUnit.factor = Math.pow(Units[toUnit.base][toUnit.abbr], raw.power);
		raw.targetUnit.value = this.format(value / raw.originalUnit.factor * raw.targetUnit.factor);
		
		// Catch conversion errors
		if (isNaN(raw.targetUnit.value))
			return 'Internal error :/';
		
		// Format original unit
		var powerCheck = (raw.power > 1);
		raw.originalUnit.abbr = fromUnit.abbr + (powerCheck ? '<sup>'+ raw.power +'</sup>' : '');
		raw.originalUnit.name = fromUnit.name + (powerCheck ? '<sup>'+ raw.power +'</sup>' : '');
		
		// Format target unit
		raw.targetUnit.abbr = toUnit.abbr + (powerCheck ? '<sup>'+ raw.power +'</sup>' : '');
		raw.targetUnit.name = toUnit.name + (powerCheck ? '<sup>'+ raw.power +'</sup>' : '');
		
		// Format result
		var equalSign = fromUnit.base == 's' ? ' &#8776; ' : ' = ';
		raw.unitType = fromUnit.type + (powerCheck ? '<sup>'+ raw.power +'</sup>' : '');
		raw.text = raw.originalUnit.value +' '+ raw.originalUnit.abbr + equalSign + raw.targetUnit.value +' '+ raw.targetUnit.abbr;
		
		return raw;
	},
	
	convertComposedUnit: function(value, fromUnit, toUnit) {
		this.log('Conversion type: composed');
		
		// Get operator
		var operator;
		if (fromUnit.base.indexOf('/') > -1) {
			operator	= '/';
		} else if (fromUnit.base.indexOf('*') > -1) {
			operator	= '*';
		} else {
			return 'Internal error :/';
		}
		
		// Initialize some variables
		var O = fromUnit.abbr.split(operator);
		var T = toUnit.abbr.split(operator);
		var B = fromUnit.base.split(operator);
		var Units = this.Descriptions.conversion;
		var raw = {
			power: 1,
			originalUnit: {
				value: this.format(value)
			},
			targetUnit: {}
		};
		
		// Do conversion
		raw.originalUnit.factor = 1 / eval((1/Units[B[0]][O[0]]) + operator + (1/Units[B[1]][O[1]]));
		raw.targetUnit.factor = eval(Units[B[0]][T[0]] + operator + Units[B[1]][T[1]]);
		raw.targetUnit.value = this.format(value / raw.originalUnit.factor * raw.targetUnit.factor);
		
		// Catch conversion errors
		if (isNaN(raw.targetUnit.value)) return 'Internal error :/';
		
		// Format original unit
		raw.originalUnit.abbr = fromUnit.abbr;
		raw.originalUnit.name = fromUnit.name;
		
		// Format target unit
		raw.targetUnit.abbr = toUnit.abbr;
		raw.targetUnit.name = toUnit.name;
		
		// Format result
		raw.unitType = fromUnit.type;
		raw.text = raw.originalUnit.value +' '+ raw.originalUnit.abbr +' = '+ raw.targetUnit.value +' '+ raw.targetUnit.abbr;
		
		return raw;
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
			console.log('Units.js - '+ msg);
		
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
			
			psi : ['psi'],
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
				
				psi : 0.000145037738,
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
