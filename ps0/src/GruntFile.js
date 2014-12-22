//
//   gruntfile to configure project tasks
//   Copyright (c) 2014 Eastside Web (http://eastsideweb.github.io/)
//
//   FILE: gruntfile.js
//   DESCRIPTION: 
//  Available tasks:
//             copy:  Copy files. 
//             typescript:  Compile TypeScript files 
//             jshint:  Validate files with JSHint. 
//             dust: compile template files
//             concat  Concatenate files. 
//             default  Alias for "typescript", "copy" tasks.
//             CT  Alias for "dust", "concat" tasks.
//
//   HISTORY:
//     Date            By  Comment
//     2014 June 15  MJ post build copy of json files to debug dir
//     2014 Oct 1    MJ Added typescript and jshint tasks
//      2014 Oct 27   MJ Added dust compilation of template files and concat

module.exports = function (grunt) {
    //http://gruntjs.com/getting-started
    //A grunt plugin must be specified as a dependency in package.json and installed using npm install. 
    // it is enabled inside grunt using loadNpmTasks
    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-dustjs-linkedin');
    grunt.loadNpmTasks('grunt-contrib-concat');

    //project configuration
    grunt.initConfig({
        //copy json files and other files to the debug directory
        copy: {     
	debugCopy:{
	    files: [
            {
                src: 'www',
                dest: '../Debug/bin/'
            },
            {
                expand: true,
                src: '*.json',
                dest: '../Debug/',
                //flatten:true
            },
            {
                expand: true,
                src: 'lib/fakedb/*.json',
                dest: '../Debug/lib/fakedb/',
                flatten: true
            },
            {
                expand: true,
                src: 'lib/schema/*.json',
                dest: '../Debug/public/schema/',
                flatten: true
            },
            {
                //copy files from public/client
                expand: true,
                cwd: 'public/client/',
                src: ['styles/style.css', 'img/*', 'lib/*'],
                dest:'../Debug/public/client/'
            },
            {
                //copy index.html
                src: 'public/index.html',
                dest: '../Debug/'
            },
	        {
	            //copy json files from test dir
	            expand:true,
	            src: 'test/initTestDB/testpsdbInfo/*.json',
	            dest: '../Debug/test/initTestDB/testpsdbInfo/'

	        }, {
	            //copy json files from test dir
	            expand: true,
	            src: 'test/initTestDB/testSeriesId1/*.json',
	            dest: '../Debug/test/initTestDB/testSeriesId1/'

	        }

            ]
            },
            deployCopy: {
                files: [
                    {
                        //copy files from lib/
                        expand: true,
                        cwd: '../Debug/',
                        src: ['lib/fakedb/*.js', 'lib/fakedb/*.json', 'lib/psdb/*.js', 'lib/*.js', 
                            'public/client/styles/* ', 'public/client/img/*', 'public/client/lib/*.js', 'public/schema/*.json', 'public/client/templates/*.js', 
                            'public/*', 'public/client/*.js',
                            'routes/*.js', '*.js', '*config*.json', 'package.json'],
                        dest: '../../../psdbRoot/'
                    }
                ]
            }

        },
        //compiles ts files to .js files in the debug directory
        typescript: {
            base: {
   
                src: ['*.ts', 'lib/**/*.ts','test/*.ts', 'routes/*.ts', 'public/client/*.ts'],
               // src:'**/*.ts',
                dest: '../Debug',
                options: {
                    module: 'commonjs', //or commonjs
                    target: 'es5', //or es3
                    sourceMap: false  //generate corresponding .map files
                } 
            }
        },
        //run jshint on the .js files generated by the typescript compiler
        jshint: {
            options: {
                //globalstrict: true,  //allow "use strict" in global scope
                node: true, //let jshint know about predefined globals variables available when running inside teh node runtime environment
                curly: true,
                eqeqeq: true
            },
            target1: ['../Debug/*.js', '../Debug/lib/**/*.js','../Debug/test/*.js', '../Debug/routes/*.js', '../Debug/public/client/*.js']
        },
     
        dust: {
            build: { //complile all dust template files. Template name=filename
                expand: true,
		        cwd: 'public/client/templates/',
                src: '*.tl',
                dest: 'public/client/templates/',
                ext: '.js'
                   }
        },
        //documentation https://github.com/gruntjs/grunt-contrib-concat
        concat: {
            dist: {
		        src: ['public/client/templates/*.js'],
		        dest: '../debug/public/client/templates/templates.js'   
                },
        },
    });
    grunt.registerTask('default', ['typescript', 'copy:debugCopy', 'dust','concat' ]);
    grunt.registerTask('CT', ['dust', 'concat']);
    grunt.registerTask('deploy', ['copy:deployCopy']);
};