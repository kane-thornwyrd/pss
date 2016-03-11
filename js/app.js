(function() {
  'use strict';

  var globals = typeof window === 'undefined' ? global : window;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};
  var aliases = {};
  var has = ({}).hasOwnProperty;

  var unalias = function(alias, loaderPath) {
    var result = aliases[alias] || aliases[alias + '/index.js'];
    return result || alias;
  };

  var _reg = /^\.\.?(\/|$)/;
  var expand = function(root, name) {
    var results = [], part;
    var parts = (_reg.test(name) ? root + '/' + name : name).split('/');
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function expanded(name) {
      var absolute = expand(dirname(path), name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var require = function(name, loaderPath) {
    if (loaderPath == null) loaderPath = '/';
    var path = unalias(name, loaderPath);

    if (has.call(cache, path)) return cache[path].exports;
    if (has.call(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has.call(cache, dirIndex)) return cache[dirIndex].exports;
    if (has.call(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '" from ' + '"' + loaderPath + '"');
  };

  require.alias = function(from, to) {
    aliases[to] = from;
  };

  require.register = require.define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has.call(bundle, key)) {
          require.register(key, bundle[key]);
        }
      }
    } else {
      modules[bundle] = fn;
    }
  };

  require.list = function() {
    var result = [];
    for (var item in modules) {
      if (has.call(modules, item)) {
        result.push(item);
      }
    }
    return result;
  };

  require.brunch = true;
  require._cache = cache;
  globals.require = require;
})();
require.register("application", function(exports, require, module) {
"use strict";

require('jspdf');

var
  _ = require('underscore'),
  $ = require('jquery'),
  q = require('q'),
  YAML = require('yamljs'),
  html2canvas = require('html2canvas')
;

var App = {
  init: function init() {
    App.$el = $('[data-type="pdf-preview"]');
    $('.refresh').on('click', App.inputEval);
    $('#resume').on('keyup', App.resizeTextArea);
    App.resizeTextArea();
    App.inputEval();
  },

  resizeTextArea: function(){
    $('#resume').each(function(i, el){
      if (el.scrollHeight > el.clientHeight) {
        el.style.height = el.scrollHeight + 20 + "px";
      }
    });
  },

  render: function(){
    var $root = $('#pdf');
    $root.children('.page').remove();

    var templatesInfos = _.extend({}, App.datas, {
      linkvaluelogo: 'Linkvalue.logo.png',
      linkvaluepicto: 'Linkvalue.picto.png',
      wheelimg: 'wheel.png'
    });

    App.pages = [
      {
        template: require('./views/cover')(templatesInfos)
      },
      {
        template: require('./views/summary')(templatesInfos)
      }
    ];

    for (var i = 0; i < App.datas.historic.length; i++) {
      templatesInfos.historic.current = App.datas.historic[i];
      App.pages.push({
        template: require('./views/historic-entry')(templatesInfos)
      })
    };

    for(var page in App.pages){
      if(App.pages.hasOwnProperty(page)){
        $root.append(App.pages[page].template)
      }
    }
    App.draw();
  },

  draw: function(){

    var promises = [];

    App.doc = new jsPDF("l", "mm");
    var pages = document.getElementsByClassName('page');
    // App.doc.addHTML(document.body,0,0,function(){});
    for (var i = 0, len = pages.length; i < len; i++) {
      promises.push(q.promise(function(resolve, reject){
        var index = i;
        html2canvas(pages[i]).then(function(canvas) {
          var canvasValue = canvas.toDataURL('image/jpeg', 1);
          resolve({page: index, content: canvasValue});
        });
      }));
    };

    q.all(promises).spread(function(){
      var pages = _.sortBy(arguments, 'page');
      for (var i = 0; i < pages.length; i++) {
        if(i) App.doc.addPage('a4', 'l');
        App.doc.addImage(pages[i].content, 'JPEG',0,0,297,210);
      };
      App.$el.attr('src', App.doc.output('dataurlstring'));
    });

  },

  getInputs: _.throttle(function(){
    var val;
    if(val = $('#resume').val()){
      return YAML.parse(val);
    }
  }, 1000),

  inputEval:function(e){
    App.datas = App.getInputs();
    App.render();
  }
};

module.exports = App;

});

require.register("views/cover", function(exports, require, module) {
module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (job, linkvaluelogo, linkvaluepicto, name) {
buf.push("<div class=\"page cover\"><figure class=\"logo\"><img" + (jade.attr("src", linkvaluelogo, true, false)) + "/><figcaption><p class=\"hashtag\">#TheGreatPlaceToGeek</p></figcaption></figure><h2>Partner Skills Summary</h2><p>" + (jade.escape((jade_interp = name) == null ? '' : jade_interp)) + " - " + (jade.escape((jade_interp = job) == null ? '' : jade_interp)) + "</p><footer><p>LinkValue - 92 rue de entrepreneurs, 75015 Paris - France</p><p>contact@link-value.fr<img" + (jade.attr("src", linkvaluepicto, true, false)) + "/>www.link-value.fr</p></footer></div>");}.call(this,"job" in locals_for_with?locals_for_with.job:typeof job!=="undefined"?job:undefined,"linkvaluelogo" in locals_for_with?locals_for_with.linkvaluelogo:typeof linkvaluelogo!=="undefined"?linkvaluelogo:undefined,"linkvaluepicto" in locals_for_with?locals_for_with.linkvaluepicto:typeof linkvaluepicto!=="undefined"?linkvaluepicto:undefined,"name" in locals_for_with?locals_for_with.name:typeof name!=="undefined"?name:undefined));;return buf.join("");
};
});

require.register("views/historic-entry", function(exports, require, module) {
module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (historic, job, linkvaluelogo, linkvaluepicto, name) {
jade_mixins["page"] = jade_interp = function(){
var block = (this && this.block), attributes = (this && this.attributes) || {};
buf.push("<div" + (jade.attrs(jade.merge([{"class": "page"},attributes]), false)) + "><header><img" + (jade.attr("src", linkvaluelogo, true, false)) + " class=\"logo\"/><p class=\"candidate\">" + (jade.escape((jade_interp = name) == null ? '' : jade_interp)) + " - " + (jade.escape((jade_interp = job) == null ? '' : jade_interp)) + "</p></header>");
if ( block)
{
block && block();
}
else
{
buf.push("<p>EMPTY PAGE !</p>");
}
buf.push("<footer><p>LinkValue - 92 rue de entrepreneurs, 75015 Paris - France</p><p>contact@link-value.fr<img" + (jade.attr("src", linkvaluepicto, true, false)) + "/>www.link-value.fr</p></footer></div>");
};
jade_mixins["page"].call({
block: function(){
buf.push("<table class=\"mini-header\"><tr><td><img" + (jade.attr("src", linkvaluepicto, true, false)) + " class=\"picto\"/></td><td>" + (jade.escape(null == (jade_interp = historic.current.company) ? "" : jade_interp)) + "</td><td>" + (jade.escape(null == (jade_interp = historic.current.job) ? "" : jade_interp)) + "</td><td>" + (jade.escape(null == (jade_interp = historic.current.date) ? "" : jade_interp)) + "</td></tr></table><dl>");
// iterate historic.current.content
;(function(){
  var $$obj = historic.current.content;
  if ('number' == typeof $$obj.length) {

    for (var title = 0, $$l = $$obj.length; title < $$l; title++) {
      var part = $$obj[title];

buf.push("<dt>" + (jade.escape(null == (jade_interp = title) ? "" : jade_interp)) + "</dt>");
// iterate part
;(function(){
  var $$obj = part;
  if ('number' == typeof $$obj.length) {

    for (var i = 0, $$l = $$obj.length; i < $$l; i++) {
      var subelement = $$obj[i];

buf.push("<dd>" + (null == (jade_interp = subelement) ? "" : jade_interp) + "</dd>");
    }

  } else {
    var $$l = 0;
    for (var i in $$obj) {
      $$l++;      var subelement = $$obj[i];

buf.push("<dd>" + (null == (jade_interp = subelement) ? "" : jade_interp) + "</dd>");
    }

  }
}).call(this);

    }

  } else {
    var $$l = 0;
    for (var title in $$obj) {
      $$l++;      var part = $$obj[title];

buf.push("<dt>" + (jade.escape(null == (jade_interp = title) ? "" : jade_interp)) + "</dt>");
// iterate part
;(function(){
  var $$obj = part;
  if ('number' == typeof $$obj.length) {

    for (var i = 0, $$l = $$obj.length; i < $$l; i++) {
      var subelement = $$obj[i];

buf.push("<dd>" + (null == (jade_interp = subelement) ? "" : jade_interp) + "</dd>");
    }

  } else {
    var $$l = 0;
    for (var i in $$obj) {
      $$l++;      var subelement = $$obj[i];

buf.push("<dd>" + (null == (jade_interp = subelement) ? "" : jade_interp) + "</dd>");
    }

  }
}).call(this);

    }

  }
}).call(this);

buf.push("</dl>");
},
attributes: {"class": "historic-entry"}
});}.call(this,"historic" in locals_for_with?locals_for_with.historic:typeof historic!=="undefined"?historic:undefined,"job" in locals_for_with?locals_for_with.job:typeof job!=="undefined"?job:undefined,"linkvaluelogo" in locals_for_with?locals_for_with.linkvaluelogo:typeof linkvaluelogo!=="undefined"?linkvaluelogo:undefined,"linkvaluepicto" in locals_for_with?locals_for_with.linkvaluepicto:typeof linkvaluepicto!=="undefined"?linkvaluepicto:undefined,"name" in locals_for_with?locals_for_with.name:typeof name!=="undefined"?name:undefined));;return buf.join("");
};
});

require.register("views/list", function(exports, require, module) {
module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (items, undefined) {
buf.push("<h2>Things to do:</h2><ul id=\"mainTodo\" class=\"tasks\">");
// iterate items
;(function(){
  var $$obj = items;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var item = $$obj[$index];

buf.push("<li>" + (jade.escape(null == (jade_interp = item) ? "" : jade_interp)) + "</li>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var item = $$obj[$index];

buf.push("<li>" + (jade.escape(null == (jade_interp = item) ? "" : jade_interp)) + "</li>");
    }

  }
}).call(this);

buf.push("</ul>");}.call(this,"items" in locals_for_with?locals_for_with.items:typeof items!=="undefined"?items:undefined,"undefined" in locals_for_with?locals_for_with.undefined:typeof undefined!=="undefined"?undefined:undefined));;return buf.join("");
};
});

require.register("views/mixins/page", function(exports, require, module) {
module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;













;return buf.join("");
};
});

require.register("views/partials/footer", function(exports, require, module) {
module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (linkvaluepicto) {
buf.push("<footer><p>LinkValue - 92 rue de entrepreneurs, 75015 Paris - France</p><p>contact@link-value.fr<img" + (jade.attr("src", linkvaluepicto, true, false)) + "/>www.link-value.fr</p></footer>");}.call(this,"linkvaluepicto" in locals_for_with?locals_for_with.linkvaluepicto:typeof linkvaluepicto!=="undefined"?linkvaluepicto:undefined));;return buf.join("");
};
});

require.register("views/partials/header", function(exports, require, module) {
module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (job, linkvaluelogo, name) {
buf.push("<header><img" + (jade.attr("src", linkvaluelogo, true, false)) + " class=\"logo\"/><p class=\"candidate\">" + (jade.escape((jade_interp = name) == null ? '' : jade_interp)) + " - " + (jade.escape((jade_interp = job) == null ? '' : jade_interp)) + "</p></header>");}.call(this,"job" in locals_for_with?locals_for_with.job:typeof job!=="undefined"?job:undefined,"linkvaluelogo" in locals_for_with?locals_for_with.linkvaluelogo:typeof linkvaluelogo!=="undefined"?linkvaluelogo:undefined,"name" in locals_for_with?locals_for_with.name:typeof name!=="undefined"?name:undefined));;return buf.join("");
};
});

require.register("views/summary", function(exports, require, module) {
module.exports = function template(locals) {
var buf = [];
var jade_mixins = {};
var jade_interp;
;var locals_for_with = (locals || {});(function (job, linkvaluelogo, linkvaluepicto, name, summary, wheelimg) {
jade_mixins["page"] = jade_interp = function(){
var block = (this && this.block), attributes = (this && this.attributes) || {};
buf.push("<div" + (jade.attrs(jade.merge([{"class": "page"},attributes]), false)) + "><header><img" + (jade.attr("src", linkvaluelogo, true, false)) + " class=\"logo\"/><p class=\"candidate\">" + (jade.escape((jade_interp = name) == null ? '' : jade_interp)) + " - " + (jade.escape((jade_interp = job) == null ? '' : jade_interp)) + "</p></header>");
if ( block)
{
block && block();
}
else
{
buf.push("<p>EMPTY PAGE !</p>");
}
buf.push("<footer><p>LinkValue - 92 rue de entrepreneurs, 75015 Paris - France</p><p>contact@link-value.fr<img" + (jade.attr("src", linkvaluepicto, true, false)) + "/>www.link-value.fr</p></footer></div>");
};
jade_mixins["page"].call({
block: function(){
buf.push("<img" + (jade.attr("src", wheelimg, true, false)) + " class=\"wheel\"/><img" + (jade.attr("src", linkvaluepicto, true, false)) + " class=\"picto\"/>");
// iterate summary
;(function(){
  var $$obj = summary;
  if ('number' == typeof $$obj.length) {

    for (var title = 0, $$l = $$obj.length; title < $$l; title++) {
      var element = $$obj[title];

buf.push("<dl" + (jade.cls(["" + (title) + " section"], [true])) + ">");
// iterate element
;(function(){
  var $$obj = element;
  if ('number' == typeof $$obj.length) {

    for (var subTitle = 0, $$l = $$obj.length; subTitle < $$l; subTitle++) {
      var subClass = $$obj[subTitle];

buf.push("<dt>" + (jade.escape(null == (jade_interp = subTitle) ? "" : jade_interp)) + "</dt>");
// iterate subClass
;(function(){
  var $$obj = subClass;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var subsub = $$obj[$index];

buf.push("<dd>" + (jade.escape(null == (jade_interp = subsub) ? "" : jade_interp)) + "</dd>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var subsub = $$obj[$index];

buf.push("<dd>" + (jade.escape(null == (jade_interp = subsub) ? "" : jade_interp)) + "</dd>");
    }

  }
}).call(this);

    }

  } else {
    var $$l = 0;
    for (var subTitle in $$obj) {
      $$l++;      var subClass = $$obj[subTitle];

buf.push("<dt>" + (jade.escape(null == (jade_interp = subTitle) ? "" : jade_interp)) + "</dt>");
// iterate subClass
;(function(){
  var $$obj = subClass;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var subsub = $$obj[$index];

buf.push("<dd>" + (jade.escape(null == (jade_interp = subsub) ? "" : jade_interp)) + "</dd>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var subsub = $$obj[$index];

buf.push("<dd>" + (jade.escape(null == (jade_interp = subsub) ? "" : jade_interp)) + "</dd>");
    }

  }
}).call(this);

    }

  }
}).call(this);

buf.push("</dl>");
    }

  } else {
    var $$l = 0;
    for (var title in $$obj) {
      $$l++;      var element = $$obj[title];

buf.push("<dl" + (jade.cls(["" + (title) + " section"], [true])) + ">");
// iterate element
;(function(){
  var $$obj = element;
  if ('number' == typeof $$obj.length) {

    for (var subTitle = 0, $$l = $$obj.length; subTitle < $$l; subTitle++) {
      var subClass = $$obj[subTitle];

buf.push("<dt>" + (jade.escape(null == (jade_interp = subTitle) ? "" : jade_interp)) + "</dt>");
// iterate subClass
;(function(){
  var $$obj = subClass;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var subsub = $$obj[$index];

buf.push("<dd>" + (jade.escape(null == (jade_interp = subsub) ? "" : jade_interp)) + "</dd>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var subsub = $$obj[$index];

buf.push("<dd>" + (jade.escape(null == (jade_interp = subsub) ? "" : jade_interp)) + "</dd>");
    }

  }
}).call(this);

    }

  } else {
    var $$l = 0;
    for (var subTitle in $$obj) {
      $$l++;      var subClass = $$obj[subTitle];

buf.push("<dt>" + (jade.escape(null == (jade_interp = subTitle) ? "" : jade_interp)) + "</dt>");
// iterate subClass
;(function(){
  var $$obj = subClass;
  if ('number' == typeof $$obj.length) {

    for (var $index = 0, $$l = $$obj.length; $index < $$l; $index++) {
      var subsub = $$obj[$index];

buf.push("<dd>" + (jade.escape(null == (jade_interp = subsub) ? "" : jade_interp)) + "</dd>");
    }

  } else {
    var $$l = 0;
    for (var $index in $$obj) {
      $$l++;      var subsub = $$obj[$index];

buf.push("<dd>" + (jade.escape(null == (jade_interp = subsub) ? "" : jade_interp)) + "</dd>");
    }

  }
}).call(this);

    }

  }
}).call(this);

buf.push("</dl>");
    }

  }
}).call(this);

},
attributes: {"class": "summary"}
});}.call(this,"job" in locals_for_with?locals_for_with.job:typeof job!=="undefined"?job:undefined,"linkvaluelogo" in locals_for_with?locals_for_with.linkvaluelogo:typeof linkvaluelogo!=="undefined"?linkvaluelogo:undefined,"linkvaluepicto" in locals_for_with?locals_for_with.linkvaluepicto:typeof linkvaluepicto!=="undefined"?linkvaluepicto:undefined,"name" in locals_for_with?locals_for_with.name:typeof name!=="undefined"?name:undefined,"summary" in locals_for_with?locals_for_with.summary:typeof summary!=="undefined"?summary:undefined,"wheelimg" in locals_for_with?locals_for_with.wheelimg:typeof wheelimg!=="undefined"?wheelimg:undefined));;return buf.join("");
};
});


//# sourceMappingURL=app.js.map