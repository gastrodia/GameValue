var getValue = function(c, value) {
		switch(c) {
			case "int":
				//console.log(value, value ==null , value == "");
				if(value == null || value === "" ) {return null;}

				return value - 0;
			break;
			case "item":
				if(!value) {
					return null;
				}
				var items = value.split("|");
				return {
					itemId: items[0],
					itemNum: items[1] - 0 || 1
				}
			break;
			case "itempro":
				if(!value) {
					return value;
				}
				var items = value.split("|");
				return {
					item: {
						itemId: items[0],
						itemNum: items[1] - 0 || 1
					},
					pro: items[2] - 0 || 100
				};
			break;
			case "monsterPro":
				if(!value) {
					return value;
				}
				var events = value.split("|");
				return {
					monsterId: events[0],
					pro: events[1] - 0
				};
			break;
			case "eventPro":
				if(value == "" || value == null) {
					return null;
				}
				var events = value.split("|");
				return {
					eventId: events[0],
					pro: events[1] - 0
				};
			break;
			case "point":
				if(!value) {
					return value;
				}
				var points = value.split("|");
				return {
					x: points[0] - 0,
					y: points[1] - 0
				}
			break;
			case "skill":
				if(!value) {
					return value;
				}
				var skills = value.split("|");
				return {
					skillId: skills[0],
					level: skills[1] - 0 || 0
				};
			break;
			case "formationValue":
				if(!value) {
					return value;
				}
				var formations = value.split("|");
				return {
					properties: formations[0] - 0,
					value: formations[1] - 0,
					add: formations[2] - 0
				};
			break;
			default:
				if(value != null && value != "") {
					return value+"";
				}else{
					return null;
				}
			break;
		}
	}
	var getV = function(o, format, value) {
		var a = format.indexOf(".");
		var b = format.indexOf("[");
		if(a == -1 && b == -1) {
			o[format] = value;
			return;
		}
		if(b == -1 || (a != -1 && b != -1 && a < b)) {
			if( a == 0) {
				return getV(o, format.substring(a + 1), value);
			}else{
				var key = format.substring(0, a);
				o[key] = o[key] || {};
				return getV(o[key], format.substring(a + 1), value);
			}
		}else if( a == -1 || b != -1 && a != -1 && a > b){
			var c = format.indexOf("]");
			if(b == 0) {
				var key = format.substring(1, c);
				var d = format.substring(c+1);
				switch(d[0]) {
					case ".":
						o[key] = o[key] || {};
						return getV(o[key], d, value);
					break;
					case "[":
						o[key] = o[key] || [];
					return getV(o[key], d, value);
					default:
						o[key] = value;
					break;
				}
			}else{
				var key = format.substring(0, b);
				o[key] = o[key] || [];
				return getV(o[key], format.substring(b), value);
			}
		}else{
			console.log(a,b);
			throw "error";
		}
	}
	var get = function(o, format, value) {
		if(format != "") {
			var formats = format.split("|");
			if(value == null) {
				value =  formats[2];
			}
			if(value != "" || value != null ) {
				var result = getValue(formats[1], value);
				if(result != null) {
					getV(o, formats[0], result);
				}
			}
		}
	}
	var getJSON = function() {
		return fileData.body.map(function(value, index) {
			var json = {};
			if(value == null) { return json;}
			fileData.head.forEach(function(v, i) {
				get(json, v.toString(), value[i]);
			});
			return json;
		});
	}
	var toJSON = function() {
		var process = fileData.process || {};
		var map = getJSON();
		var oneHandle, allHandle;
		if(process.oneFunc && process.oneFunc!="") {
			oneHandle = eval(process.oneFunc);
		}
		if(process.allFunc && process.allFunc != "") {
			allHandle = eval(process.allFunc);
		}
		switch(process.type) {
			case "json":
				var result = {};
				map.slice(process.start).forEach(function(obj) {
					if(oneHandle) { obj = oneHandle.call(this, obj); }
					if(obj[process.id] != null) {
						result[obj[process.id]] = obj;
					}
				});
				if(allHandle) {
					result = allHandle.call(this, result);
				}
				return result;
			case "keyValue":
				var result = {};
				map.slice(process.start).forEach(function(obj) {
					if(oneHandle) { obj = oneHandle.call(this, obj); }
					if(obj.key != null) {
						result[obj.key] = obj.value;
					}
				});
				if(allHandle) {
					result = allHandle.call(this, result);
				}
				console.log(result);
				return result;
			break;
			case "keyArray":
				var result = {};
				map.slice(process.start).forEach(function(obj) {
					if(oneHandle) { obj = oneHandle.call(this, obj); }
					if(obj.key ) {
						result[obj.key] = result[obj.key] || [];
					}
					result[obj.key].push(obj.value);
				});
				if(allHandle) {
					result = allHandle.call(this, result);
				}
				return result;
			break;
			case "array":
				var result = [];
				map.slice(process.start).forEach(function(obj) {
					if(oneHandle) { obj = oneHandle.call(this, obj); }
					if(obj.value != null) {
						result.push(obj.value);
					}
				});
				if(allHandle) {
					result = allHandle.call(this, result);
				}
				return result;
			break;
		}
	}
