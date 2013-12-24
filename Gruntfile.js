module.exports = function(grunt) {

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		checksum: {
			'freenet': {},
			'telepathy-sunshine': {}
		},
		pkgbuilds: {
			"freenet": {
				files: {
					'freenet/PKGBUILD': ['freenet/PKGBUILD.hbs']
				}
			},
			"telepathy-sunshine": {
				files: {
					'telepathy-sunshine/PKGBUILD': ['telepathy-sunshine/PKGBUILD.hbs']
				}
			}
		}
	});

	grunt.task.registerMultiTask('checksum', 'Create checksum file in each package', function() {
		var	exec = require('child_process').exec,
				handlebars = require('handlebars'),
				done = this.async(),
				el = this.target;

		var h = handlebars.compile(grunt.file.read(el + '/PKGBUILD.hbs'));

		grunt.file.write(el + '/PKGBUILD', h({ checksums: '' }));

		grunt.log.writeln('Building ' + el + '...');
		exec('makepkg -g', { cwd: el }, function(err, stdout, stderr) {
			grunt.file.write(el + '/cksum', stdout);
			done();
		});
	});

	grunt.task.registerMultiTask('pkgbuilds', 'Compile PKGBUILD files for all packages', function() {
		var hbs = require('handlebars'),
				target = this.target;

		this.files.forEach(function(file) {
			var template = hbs.compile(file.src.map(function(filepath) {
				return grunt.file.read(filepath);
			}).join('\n')),
					opts = { checksums: grunt.file.read(target + '/cksum') };

			grunt.file.write(file.dest, template(opts));
		});
	});	
};
