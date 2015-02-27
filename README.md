# gulp-velocityjs
Gulp version of node module velocity, each .vm file has a same file name with .json extension for it's data support. Data file will be ignored which does not exists. If a .vm has a `#parse` command, data file of included .vm file will be merged in render context.

# useage

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
