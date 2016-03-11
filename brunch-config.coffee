module.exports = config:
  files:
    templates:
      joinTo: 'js/app.js'
    javascripts:
      joinTo:
        'js/app.js': /^app/
        'js/vendors.js': /^(vendor|bower_components|node_modules)/
    stylesheets:
      joinTo:
        'css/app.css' : /^app/
        'css/vendors.css' : /^(vendor|bower_components|node_modules)(\/|\\)(.+)\.(css|styl)/
  plugins:
    autoReload:
      enabled:
        js: on
        css: on
        assets: on
    jaded:
      staticPatterns: /^app(\/|\\)static(\/|\\)(.+)\.jade$/
      jade:
        pretty: no
    browserSync:
      port: 3333
      logLevel: "debug"
  npm:
    globals:
      jade: 'jade/runtime'

  server:
    run: yes
