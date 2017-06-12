const gulp = require('gulp');
const plugins = require('gulp-load-plugins')();

gulp.task('env:dev', (done) => {
  process.env.NODE_ENV = 'development';
  done();
});

gulp.task('lintServer',
  () => gulp.src('server/**/*.js')
    .pipe(plugins.eslint())
    .pipe(plugins.eslint.format()));

gulp.task('serve', ['lintServer'], () => plugins.nodemon({
  script: 'build/dev-server.js',
  watch: ['build', 'server'],
  delay: '500',
  tasks: ['lintServer'],
}));

gulp.task('default', ['env:dev', 'serve']);
