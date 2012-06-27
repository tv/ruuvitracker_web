module.exports = function(grunt) {
    grunt.initConfig({
        lint: {
            all: [
                'models/*'
              , 'services/*'
              , 'activities/*'
              , 'collections/*'
            ]
        }
      , jshint: {
            options: {
                browser: true
              , devel: true
              , laxcomma: true
            }
        }
      , requirejs: {
            baseUrl: "."
          , mainConfigFile: "config.js"
          , name: "app"
          , out: "app-built.js"
        }
      , server: {
            base: '.'
        }

    });

    grunt.loadNpmTasks('grunt-requirejs');

    grunt.registerTask('default', 'lint requirejs');
};
