var gulp = require('gulp');
var $    = require('gulp-load-plugins')();
var path = require('path');
var del  = require('del');

var distPath    = path.resolve('./dist');
var version     = ''; // 版本号
var versionPath = ''; // 版本号路径
var env         = process.env.npm_config_qa ? 'qa' : process.env.npm_config_uat ? 'uat' : 'prod'; // 运行环境
console.log( '当前环境：\nprocess.env.npm_config_argv=', process.env.npm_config_argv, '\nprocess.argv=', process.argv )
if (!process.env.npm_config_argv) {
  if (process.argv.length <= 2) {
    throw new Error( '当前npm版本不支持process.env.npm_config_argv，请使用如下命令编译：\nnpm run build [qa|uat|prod]' )
  }
  env = process.argv.length > 2 ? process.argv[2] : env
}
console.log('env=', env);

// 创建版本号(年月日时分)
(function () {
  var d = new Date();
  var yy = d.getFullYear();
  var MM = d.getMonth() + 1 >= 10 ? (d.getMonth() + 1) : '0' + (d.getMonth() + 1);
  var DD = d.getDate() >= 10 ? d.getDate() : '0' + d.getDate();
  var h  = d.getHours() >= 10 ? d.getHours() : '0' + d.getHours();
  var mm = d.getMinutes() >= 10 ? d.getMinutes() : '0' + d.getMinutes();
  version = "" + yy + MM + DD + h + mm;
  versionPath = distPath + '/' + version;
})();

// 编译
gulp.task('build', $.shell.task([ 'node build/build.js' ]));

// 创建版本号目录
gulp.task('create:versionCatalog', function () {
  return gulp.src(`${distPath}/static/**/*`)
    .pipe(gulp.dest(`${versionPath}/static/`))
});

// 替换${versionPath}/static/js/manifest.js window.SITE_CONFIG.cdnUrl占位变量
gulp.task('replace:cdnUrl', function () {
  return gulp.src(`${versionPath}/static/js/manifest.js`)
    .pipe($.replace(new RegExp(`"${require('./config').build.assetsPublicPath}"`, 'g'), 'window.SITE_CONFIG.cdnUrl + "/"'))
    .pipe(gulp.dest(`${versionPath}/static/js/`))
});

// 替换${versionPath}/static/config/index-${env}.js window.SITE_CONFIG['version']配置变量
gulp.task('replace:version', function () {
  return gulp.src(`${versionPath}/static/config/index-${env}.js`)
    .pipe($.replace(/window.SITE_CONFIG\['version'\] = '.*'/g, `window.SITE_CONFIG['version'] = '${version}'`))
    .pipe(gulp.dest(`${versionPath}/static/config/`))
});

// 合并${versionPath}/static/config/[index-${env}, init].js 至 ${distPath}/config/index.js
gulp.task('concat:config', function () {
  return gulp.src([`${versionPath}/static/config/index-${env}.js`, `${versionPath}/static/config/init.js`])
    .pipe($.concat('index.js'))
    .pipe(gulp.dest(`${distPath}/config/`))
});


//清除, 编译 / 处理项目中产生的文件
gulp.task('cleanBuild', function () {
  return del([`${distPath}/static`, `${versionPath}/static/config`])
});
// 清空
gulp.task('clean', function () {
  return del([versionPath])
});
// 清空历史
gulp.task('cleanHistory', function() {
	return del([distPath])
});


//gulp.series|4.0 依赖
//gulp.parallel|4.0 多个依赖嵌套
gulp.task('default',gulp.series(gulp.series('build','create:versionCatalog','replace:cdnUrl','replace:version','concat:config','cleanBuild')));
gulp.task('qa',gulp.series(gulp.series('cleanHistory','build','create:versionCatalog','replace:cdnUrl','replace:version','concat:config','cleanBuild')));
gulp.task('uat',gulp.series(gulp.series('cleanHistory','build','create:versionCatalog','replace:cdnUrl','replace:version','concat:config','cleanBuild')));
gulp.task('prod',gulp.series(gulp.series('cleanHistory','build','create:versionCatalog','replace:cdnUrl','replace:version','concat:config','cleanBuild')));
