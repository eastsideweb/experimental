module.exports = function(grunt) {

    grunt.loadNpmTasks('grunt-contrib-copy');

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
                dest: 'Debug/public/schema/',
                flatten: true
            }
            ]
        }}
    });
    grunt.registerTask('default', ['copy']);
};