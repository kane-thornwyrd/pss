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
