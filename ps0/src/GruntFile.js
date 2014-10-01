module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-contrib-copy');
    grunt.loadNpmTasks('grunt-typescript');
    grunt.loadNpmTasks('grunt-contrib-jshint');
    //project configuration
    grunt.initConfig({
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
            }
            ]
	}
        },
        typescript: {
            base: {
   
                src: ['*.ts', 'lib/**/*.ts','test/*.ts', 'routes/*.ts'],
               // src:'**/*.ts',
                dest: '../Debug',
                options: {
                    module: 'commonjs', //or commonjs
                    target: 'es5', //or es3
                    sourceMap: true
                } 
            }
        },
        jshint: {
            options: {
                //globalstrict: true,  //allow "use strict" in global scope
                node: true, //let jshint know about predefined globals variables available when running inside teh node runtime environment
                curly: true,
                eqeqeq: true
            },
            target1: ['../Debug/*.js', '../Debug/lib/**/*.js','../Debug/test/*.js', '../Debug/routes/*.js' ]
        }

    });
    grunt.registerTask('default', ['typescript', 'copy']);
};