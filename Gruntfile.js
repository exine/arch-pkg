module.exports = function(grunt) {
	var hbs = require('handlebars'),
			exec = require('child_process').exec;

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		checksum: {
			'freenet': {},
			'telepathy-sunshine': {},
			'ulatencyd-git': {}
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
			},
			"ulatencyd-git": {
				files: {
					'telepathy-sunshine/PKGBUILD': ['telepathy-sunshine/PKGBUILD.hbs']
				}
			}
		}
	});

	grunt.task.registerMultiTask('checksum', 'Create checksum file in each package', function() {
		var	done = this.async(),
				el = this.target,
				tpl = hbs.compile(grunt.file.read(el + '/PKGBUILD.hbs')),
				opts = { checksums: '' };


		grunt.file.write(el + '/PKGBUILD', tpl(opts));

		exec('makepkg -g', { cwd: el }, function(err, stdout, stderr) {
			grunt.file.write(el + '/cksum', stdout);
			done();
		});
	});

	grunt.task.registerMultiTask('pkgbuilds', 'Compile PKGBUILD files for all packages', function() {
		var	target = this.target,
				tplsrc = function(file) {
					return file.src.map(function(f) {
						return grunt.file.read(f);
					}).join('\n');
				};

		this.files.forEach(function(sources) {
			var tpl = hbs.compile(tplsrc(sources)),
					opts = { checksums: grunt.file.read(target + '/cksum') };

			grunt.file.write(sources.dest, tpl(opts));
		});
	});	

	grunt.task.registerTask('default', ['checksum', 'pkgbuilds']);
};
