// Ivan's Workshop

var CATEGORY_HIERARCHY = function() {
  var ret = {};
  for (var i in category) {
    var type = category[i].split('-')[0];
    if (!ret[type]) {
      ret[type] = [];
    }
    ret[type].push(category[i]);
  }
  return ret;
}();

function shoppingCartButton(type, id) {
  return "<button class='glyphicon glyphicon-shopping-cart btn' onClick='addShoppingCart(\"" + type + "\",\"" + id
      + "\")'></button>";
}

function removeShoppingCartButton(detailedType) {
  return "<button class='glyphicon glyphicon-trash' onClick='removeShoppingCart(\"" + detailedType + "\")'></button>";
}

function addShoppingCart(type, id) {
  shoppingCart.put(clothesSet[type][id]);
  refreshShoppingCart();
}

function removeShoppingCart(type) {
  shoppingCart.remove(type);
  refreshShoppingCart();
}

function clearShoppingCart() {
  shoppingCart.clear();
  refreshShoppingCart();
}

function toggleInventory(type, id) {
  var checked = !clothesSet[type][id].own;
  clothesSet[type][id].own = checked;
  //$('#' + type + id)[0].checked = checked;
  $('#clickable-' + type + id).toggleClass('own');
  saveAndUpdate();
}

function clickableTd(piece) {
  var name = piece.name;
  var type = piece.type.mainType;
  var id = piece.id;
  var own = piece.own;
  var deps = piece.getDeps('');
  var tooltip = '';
  var cls = 'name';
  if (deps && deps.length > 0) {
    tooltip = "tooltip='" + deps + "'";
    if (deps.indexOf('(缺)') > 0) {
      cls += ' deps';
    }
  }
  cls += own ? ' own' : '';
  return $("<span id='clickable-" + (type + id) + "' class='" + cls
      + "'><a href='#dummy' class='button' onClick='toggleInventory(\"" + type + "\",\"" + id + "\")'>"
      + name + "</a></span>");
}

function td(data, cls) {
  return $("<span>").addClass(cls).addClass("clothes_span").append(data);
}

function row(piece, isShoppingCart) {
  var $ret = $("<div>").addClass("clothes_div");
  $ret.append(td(piece.tmpScore, "label label-warning"));
  if (isShoppingCart) {
    $ret.append(td(piece.name));
  } else {
    $ret.append(clickableTd(piece));
  }  
  if (isShoppingCart) {
    if (piece.id) {
      $ret.append(td(removeShoppingCartButton(piece.type.type)));
    }
  } else {
    $ret.append(td(shoppingCartButton(piece.type.mainType, piece.id)));
  }
  $ret.append($("<br/>"));
  
  if (piece.simple[0]!=""){
    $ret.append(td("简约:" + piece.simple[0], piece.simple[0]));
  } else {
    $ret.append(td("华丽:" + piece.simple[1], piece.simple[1]));
  }
  if (piece.cute[0]!=""){
    $ret.append(td("可爱:" + piece.cute[0], piece.cute[0]));
  } else {
    $ret.append(td("成熟:" + piece.cute[1], piece.cute[1]));
  }
  if (piece.active[0]!=""){
    $ret.append(td("活泼:" + piece.active[0], piece.active[0]));
  } else {
    $ret.append(td("优雅:" + piece.active[1], piece.active[1]));
  }
  if (piece.pure[0]!=""){
    $ret.append(td("清纯:" + piece.pure[0], piece.pure[0]));
  } else {
    $ret.append(td("性感:" + piece.pure[1], piece.pure[1]));
  }
  if (piece.cool[0]!=""){
    $ret.append(td("清凉:" + piece.cool[0], piece.cool[0]));
  } else {
    $ret.append(td("保暖:" + piece.cool[1], piece.cool[1]));
  }
  return $ret;
}

function render(rating) {
  if (rating.charAt(0) == '-') {
    return rating.substring(1);
  }
  return rating;
}

function getStyle(rating) {
  if (rating.charAt(0) == '-') {
    return 'negative';
  }
  switch (rating) {
    case "SS": return 'S';
    case "S": return 'S';
    case "A": return 'A';
    case "B": return 'B';
    case "C": return 'C';
    default: return "";
  }
}

function list(div, rows, isShoppingCart) {
  var $ret = $('#' + div + ' div');
  var a  = 0;
  for (var i in rows) {
    $ret.append(row(rows[i], isShoppingCart));
  }
  return $ret;
}

function drawTable(data, div, isShoppingCart) {
    if (isShoppingCart) {
      $('#' + div).html("<div id='tb_"+div+"'></div>");
    } else {
      $('#' + div).html("<div id='tb_"+div+"' class='mainTable'></div>");
    }
  list(div, data, isShoppingCart);
}

var criteria = {};
function onChangeCriteria() {
  criteria = {};
  for (var i in FEATURES) {
    var f = FEATURES[i];
    var weight = parseFloat($('#' + f + "Weight").val());
    if (!weight) {
      weight = 1;
    }
    var checked = $('input[name=' + f + ']:radio:checked');
    if (checked.length) {
      criteria[f] = parseInt(checked.val()) * weight;
    }
  }
  tagToBonus(criteria, 'tag1');
  tagToBonus(criteria, 'tag2');
  if (global.additionalBonus && global.additionalBonus.length > 0) {
    criteria.bonus = global.additionalBonus;
  }
  if (!isFilteringMode){
    chooseAccessories(criteria);
  }
  drawLevelInfo();
  refreshTable();
}

function tagToBonus(criteria, id) {
  var tag = $('#' + id).val();
  var bonus = null;
  if (tag.length > 0) {
    var base = $('#' + id + 'base :selected').text();
    var weight = parseFloat($('#' + id + 'weight').val());
    if ($('input[name=' + id + 'method]:radio:checked').val() == 'replace') {
      bonus = replaceScoreBonusFactory(base, weight, tag)(criteria);
    } else {
      bonus = addScoreBonusFactory(base, weight, tag)(criteria);
    }
    if (!criteria.bonus) {
      criteria.bonus = [];
    }
    criteria.bonus.push(bonus);
  }
}

function clearTag(id) {
  $('#' + id).val('');
  $('#' + id + 'base').val('SS');
  $('#' + id + 'weight').val('1');
  $('input[name=' + id + 'method]:radio').get(0).checked = true;
}

function bonusToTag(idx, info) {
  $('#tag' + idx).val(info.tag);
  if (info.replace) {
    $('input[name=tag' + idx + 'method]:radio').get(1).checked = true;
  } else {
    $('input[name=tag' + idx + 'method]:radio').get(0).checked = true;
  }
  $('#tag' + idx + 'base').val(info.base);
  $('#tag' + idx + 'weight').val(info.weight);
}

var uiFilter = {};
function onChangeUiFilter() {
  uiFilter = {};
  $('input[name=inventory]:checked').each(function() {
    uiFilter[$(this).val()] = true;
  });

  if (currentCategory) {
    if (CATEGORY_HIERARCHY[currentCategory].length > 1) {
      $('input[name=category-' + currentCategory + ']:checked').each(function() {
        uiFilter[$(this).val()] = true;
      });
    } else {
      uiFilter[currentCategory] = true;
    }
  }
  refreshTable();
}

function refreshTable() {
  drawTable(filtering(criteria, uiFilter), "clothes", false);
}

function clone(obj) {
	var o;
	if (typeof obj == "object") {
		if (obj === null) {
			o = null;
		} else {
			if (obj instanceof Array) {
				o = [];
				for (var i = 0, len = obj.length; i < len; i++) {
					o.push(clone(obj[i]));
				}
			} else {
				o = {};
				for (var j in obj) {
					o[j] = clone(obj[j]);
				}
			}
		}
	} else {
		o = obj;
	}
	return o;
}

function chooseAccessories(accfilters) {
  shoppingCart.clear();
  shoppingCart.putAll(filterTopAccessories(clone(accfilters)));
  shoppingCart.putAll(filterTopClothes(clone(accfilters)));
  refreshShoppingCart();
}

function refreshShoppingCart() {
  shoppingCart.calc(criteria);
  drawTable(shoppingCart.toList(byCategoryAndScore), "shoppingCart", true);
}

function drawLevelInfo() {
  var info = "";
  var $skill = $("#skillInfo");
  var $hint = $("#hintInfo");
  $skill.empty();
  $hint.empty();
  if (currentLevel) {
    var log = [];
    if (currentLevel.filter) {
      if (currentLevel.filter.tagWhitelist) {
        log.push("tag允许: [" + currentLevel.filter.tagWhitelist + "]");
      }
      if (currentLevel.filter.nameWhitelist) {
        log.push("名字含有: [" + currentLevel.filter.nameWhitelist + "]");
      }
    }
    if (currentLevel.additionalBonus) {
      for (var i in currentLevel.additionalBonus) {
        var bonus = currentLevel.additionalBonus[i];
        var match = "(";
        if (bonus.tagWhitelist) {
          match += "tag符合: " + bonus.tagWhitelist + " ";
        }
        if (bonus.nameWhitelist) {
          match += "名字含有: " + bonus.nameWhitelist;
        }
        match += ")";
        log.push(match + ": [" + bonus.note + " " + bonus.param + "]");
      }
    }
    if (currentLevel.skills) {
		var $shaonv, $gongzhu, $normal, shaonvSkill, gongzhuSkill, normalSkill;
		if(currentLevel.skills[0]){
			$shaonv = $("<font>").text("少女级技能:  ").addClass("shaonvSkill");
			shaonvSkill = "";
			for (var i in currentLevel.skills[0]) {
				shaonvSkill += (currentLevel.skills[0][i] + "  ");
			}
		}
		if(currentLevel.skills[1]){
			$gongzhu = $("<font>").text("公主级技能:  ").addClass("gongzhuSkill");
			gongzhuSkill = "";
			for (var i in currentLevel.skills[1]) {
				gongzhuSkill += (currentLevel.skills[1][i] + "  ");
			}
		}
		if(currentLevel.skills[2]){
			$normal = $("<font>").text("技能:  ").addClass("normalSkill");
			normalSkill = "";
			for (var i in currentLevel.skills[2]) {
				normalSkill += (currentLevel.skills[2][i] + "  ");
			}
		}
		$skill.append($shaonv).append(shaonvSkill)
			.append($gongzhu).append(gongzhuSkill)
			.append($normal).append(normalSkill);
	}
    if (currentLevel.hint) {
		var $hintInfo = $("<font>").text("过关提示:  ").addClass("hintInfo");
		$hint.append($hintInfo).append(currentLevel.hint);
	}
	
    info = log.join(" ");
  }
  $("#tagInfo").text(info);
}

function byCategoryAndScore(a, b) {
  var cata = category.indexOf(a.type.type);
  var catb = category.indexOf(b.type.type);
  return (cata - catb == 0) ? b.tmpScore - a.tmpScore : cata - catb;
}

function byScore(a, b) {
  return b.tmpScore - a.tmpScore;
}

function byId(a, b) {
  return a.id < b.id ? -1 : (a.id > b.id ? 1 : 0);
}

function filterTopAccessories(filters) {
  filters['own'] = true;
  var accCate = CATEGORY_HIERARCHY['饰品'];
  for (var i in accCate) {
    filters[accCate[i]] = true;
  }
  var result = {};
  for (var i in clothes) {
    if (matches(clothes[i], {}, filters)) {
      if (!isFilteringMode) {
        clothes[i].calc(filters);
        if (!result[clothes[i].type.type]) {
          result[clothes[i].type.type] = clothes[i];
        } else if (clothes[i].tmpScore > result[clothes[i].type.type].tmpScore) {
          result[clothes[i].type.type] = clothes[i];
        }
      }
    }
  }
  var toSort = [];
  for (var c in result) {
    toSort.push(result[c]);
  }
  toSort.sort(byScore);
  var total = 0;
  var i;
  for (i = 0; i < toSort.length; i++) {
    realScoreBefore = accScore(total, i);
    realScore = accScore(total + toSort[i].tmpScore, i+1);
    if (realScore < realScoreBefore) {
      break;
    }
    total += toSort[i].tmpScore;
  }
  return toSort.slice(0, i);
}

function filterTopClothes(filters) {
  filters['own'] = true;
  //var accCate = CATEGORY_HIERARCHY['饰品'];
  for (var i in CATEGORY_HIERARCHY) {
	if(i == "袜子"){
		filters[CATEGORY_HIERARCHY[i][0]] = true;	
		filters[CATEGORY_HIERARCHY[i][1]] = true;	
	}
	if(i != "饰品"){
		filters[CATEGORY_HIERARCHY[i]] = true;	
	}
  }
  var result = {};
  for (var i in clothes) {
    if (matches(clothes[i], {}, filters)) {
      if (!isFilteringMode) {
        clothes[i].calc(filters);
        if (!result[clothes[i].type.type]) {
          result[clothes[i].type.type] = clothes[i];
        } else if (clothes[i].tmpScore > result[clothes[i].type.type].tmpScore) {
          result[clothes[i].type.type] = clothes[i];
        }
      }
    }
  }
  return result;
}

function filtering(criteria, filters) {
  var result = [];
  for (var i in clothes) {
    if (matches(clothes[i], criteria, filters)) {
      if (!isFilteringMode) {
        clothes[i].calc(criteria);
      }
      result.push(clothes[i]);
    }
  }
  if (isFilteringMode) {
    result.sort(byId);
  } else {
    result.sort(byCategoryAndScore);
  } 
  return result;
}

function matches(c, criteria, filters) {
  // only filter by feature when filtering
  if (isFilteringMode) {
    for (var i in FEATURES) {
      var f = FEATURES[i];
      if (criteria[f] && criteria[f] * c[f][2] < 0) {
        return false;
      }
    }
  }
  if (isFilteringMode && criteria.bonus) {
    var matchedTag = false;
    for (var i in criteria.bonus) {
      if (tagMatcher(criteria.bonus[i].tagWhitelist, c)) {
        matchedTag = true;
        break;
      }
    }
    if (!matchedTag) {
      return false;
    }
  }
  return ((c.own && filters.own) || (!c.own && filters.missing)) && filters[c.type.type];
}

function loadCustomInventory() {
  var myClothes = $("#myClothes").val();
  if (myClothes.indexOf('|') > 0) {
    loadNew(myClothes);
  } else {
    load(myClothes);
  } 
  saveAndUpdate();
  refreshTable();
}

function toggleAll(c) {
  var all = $('#all-' + c)[0].checked;
  var x = $('input[name=category-' + c + ']:checkbox');
  x.each(function() {
    this.checked = all;
  });
  onChangeUiFilter();
}

function drawFilter() {
  out = "<ul class='nav nav-pills' id='categoryTab'>";
  for (var c in CATEGORY_HIERARCHY) {
    out += '<li id="' + c + '"><a href="#dummy" onClick="switchCate(\'' + c + '\')">' + c + '&nbsp;&nbsp;<span class="badge">0</span></a></li>';
  }
  out += "</ul>";
  for (var c in CATEGORY_HIERARCHY) {
    out += '<div id="category-' + c + '">';
    if (CATEGORY_HIERARCHY[c].length > 1) {
      // draw a select all checkbox...
      out += "<label><input type='checkbox' id='all-" + c + "' onClick='toggleAll(\"" + c + "\")' checked>全选</label><br/>";
      // draw sub categories
      for (var i in CATEGORY_HIERARCHY[c]) {
        out += "<label style='width:180px'><input type='checkbox' name='category-" + c + "' value='" + CATEGORY_HIERARCHY[c][i]
            + "'' id='" + CATEGORY_HIERARCHY[c][i] + "' onClick='onChangeUiFilter()' checked />" + CATEGORY_HIERARCHY[c][i] + "</label>\n";
      }
    }
    out += '</div>';
  }
  $('#category_container').html(out);
}

var currentCategory;
function switchCate(c) {
  currentCategory = c;
  $("ul#categoryTab li").removeClass("active");
  $("#category_container div").removeClass("active");
  $("#" + c).addClass("active");
  $("#category-" + c).addClass("active");
  onChangeUiFilter();
}

var isFilteringMode = false;

function changeFilter() {
  $("#theme")[0].options[0].selected = true;
  currentLevel = null;
  onChangeCriteria();
}

function changeTheme() {
  var dropdown = $("#theme")[0];
  currentLevel = null;
  global.additionalBonus = null;
  for (var i in dropdown.options) {
    if (dropdown.options[i].selected) {
      var theme = dropdown.options[i].value;
      if (allThemes[theme]) {
        setFilters(allThemes[theme]);
        break;
      }
    }
  }
  onChangeCriteria();
}

var currentLevel; // used for post filtering.
function setFilters(level) {
  currentLevel = level;
  global.additionalBonus = currentLevel.additionalBonus;
  var weights = level.weight;
  for (var i in FEATURES) {
    var f = FEATURES[i];
    var weight = weights[f];
    $('#' + f + 'Weight').val(Math.abs(weight));
    var radios = $('input[name=' + f + ']:radio');
    for (var j in radios) {
      var element = radios[j];
      if (parseInt(element.value) * weight > 0) {
        element.checked = true;
        break;
      }
    }
  }
  clearTag('tag1');
  clearTag('tag2');
  if (level.bonus) {
    for (var i in level.bonus) {
      bonusToTag(parseInt(i)+1, level.bonus[i]);
    }
  }
}

function drawTheme() {
  var dropdown = $("#theme")[0];
  var def = document.createElement('option');
  def.text = '自定义关卡';
  def.value = 'custom' 
  dropdown.add(def);
  for (var theme in allThemes) {
    var option = document.createElement('option');
    option.text = theme;
    option.value = theme;
    dropdown.add(option);
  }
}

function drawImport() {
  var dropdown = $("#importCate")[0];
  var def = document.createElement('option');
  def.text = '请选择类别';
  def.value = '';
  dropdown.add(def);
  for (var cate in scoring) {
    var option = document.createElement('option');
    option.text = cate;
    option.value = cate;
    dropdown.add(option);
  }
}

function clearImport() {
  $("#importData").val("");
}

function saveAndUpdate() {
  var mine = save();
  updateSize(mine);
}

function updateSize(mine) {
  $("#inventoryCount").text('(' + mine.size + ')');
  $("#myClothes").val(mine.serialize());
  var subcount = {};
  for (c in mine.mine) {
    var type = c.split('-')[0];
    if (!subcount[type]) {
      subcount[type] = 0;
    }
    subcount[type] += mine.mine[type].length;
  }
  for (c in subcount) {
    $("#" + c + ">a span").text(subcount[c]);
  }
}

function doImport() {
  var dropdown = $("#importCate")[0];
  var type = dropdown.options[dropdown.selectedIndex].value;
  var raw = $("#importData").val();
  var data = raw.match(/\d+/g);
  var mapping = {}
  for (var i in data) {
    while (data[i].length < 3) {
      data[i] = "0" + data[i];
    }
    mapping[data[i]] = true;
  }
  var updating = [];
  for (var i in clothes) {
    if (clothes[i].type.mainType == type && mapping[clothes[i].id]) {
      updating.push(clothes[i].name);
    }
  }
  var names = updating.join(",");
  if (confirm("你将要在>>" + type + "<<中导入：\n" + names)) {
    var myClothes = MyClothes();
    myClothes.filter(clothes);
    if (myClothes.mine[type]) {
      myClothes.mine[type] = myClothes.mine[type].concat(data);
    } else {
      myClothes.mine[type] = data;
    }
    myClothes.update(clothes);
    saveAndUpdate();
    refreshTable();
    clearImport();
  }
}

function init() {
  var mine = loadFromStorage();
  calcDependencies();
  drawFilter();
  drawTheme();
  drawImport();
  switchCate(category[0]);
  updateSize(mine);
  refreshShoppingCart();
  onChangeCriteria();
}
$(document).ready(function() {
  init()
});
