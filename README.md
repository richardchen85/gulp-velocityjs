# gulp-velocityjs
Gulp version of node module velocity, each .vm has a .json file for it's data support (if there's `#parse`, .json file of 'parsed file' will be read too), .json file will be ignored if it does not exists.

This plugin is based on fool2fish's [node velocity](https://github.com/fool2fish/velocity "fool2fish's velocity").

# usage

```
var gulp = require('gulp'),
    rename = require('gulp-rename'),
    vm = require('gulp-velocityjs');

var config = {
    // tpl root 
    'root': './vm/tpl',
    'encoding': 'utf-8',
    //global macro defined file
    'macro': 'src/vm/tpl/global-macro/macro.vm',
    'globalMacroPath': 'src/vm/tpl/global-macro',
    // test data root path
    'dataPath': './vm/data'
};

gulp.task('default', function() {
    gulp.src('./vm/tpl/index.vm')
        .pipe(vm(config))
        .pipe(rename({extname:'.html'}))
        .pipe(gulp.dest('./'));
})
```
If you want .js file to support .vm file's data, see: winnieBear's [gulp-velocity](https://github.com/winnieBear/gulp-velocity "winnieBear's gulp-velocity").