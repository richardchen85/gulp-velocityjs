var es = require('event-stream'),
    vEngine = require('velocity').Engine,
    Parser = require('velocity').parser,
    Buffer = require('buffer').Buffer,
    path = require('path'),
    fs = require('fs'),
    util = require('util');

function getContext(opt) {
    var context = {},
        dataFiles = [getDataFilePath(opt.filePath, opt)];

    dataFiles = dataFiles.concat(getParseFiles(opt.template, opt.filePath, opt));
    
    dataFiles.forEach(function(data) {
        if(fs.existsSync(data)) {
            var json = JSON.parse(fs.readFileSync(data));
            for(cnxt in json) {
                context[cnxt] = json[cnxt];
            }
        }
    });

    return context;
}

function getParseFiles(content, filePath, opt) {
    var result = [],
        tplRoot = util.isArray(opt.root) ? opt.root[0] : opt.root,
        dirname = path.dirname(filePath),
        ast = Parser.parse(content);

    tplRoot = path.resolve(tplRoot);
    if(ast && ast.body) {
        ast.body.forEach(function(p) {
            if(p.type === 'Parse') {
                var tmp = p.argument.value;
                if(tmp.indexOf('/') === 0) {
                    tmp = tplRoot + tmp.replace(/\//g, path.sep);
                } else {
                    tmp = dirname + tmp.replace(/.\/|\//g, path.sep);
                }
                result.push(getDataFilePath(tmp, opt));
            }
        });
    }

    return result;
}

function getDataFilePath(vFile, opt) {
    var filePath = vFile,
        tplRoot = util.isArray(opt.root) ? opt.root[0] : opt.root, 
        tplDirName = path.dirname(filePath),
        tplFileName = path.basename(filePath,'.vm'),
        tplRootAbsPath = path.resolve(tplRoot),
        tplRelativePath = tplDirName.replace(tplRootAbsPath,''),
        datafilePath = opt.dataPath +  tplRelativePath + tplFileName + '.json',
        datafileAbsPath = path.resolve(datafilePath);

    fs.exists(datafileAbsPath, function(exists) {
        exists || console.log('Ignored data file ' + datafilePath); 
    });
      
    return datafileAbsPath;
}

//backup opt
var backOption = null;
var globalMacroPath = '';

module.exports = function(opt) {
    if (backOption === null) {
        backOption = opt;
        globalMacroPath = path.resolve(opt.globalMacroPath);
    }

    function renderTpl(file) {
        //clone opt,because velocity may modify opt
        var opt = {};
        for (var p in backOption) {
            if (backOption.hasOwnProperty(p)) {
                opt[p] = backOption[p];
            }
        }

        //if file in global macro dir, jump it
        if (file.path.indexOf(globalMacroPath) === 0) {
            return this.emit('end');
        }

        if (file.isNull()) {
            return this.emit('data', file); // pass along
        }
        if (file.isStream()) {
            return this.emit('error', new Error(PLUGIN_NAME + ": Streaming not supported"));
        }

        if (file.isBuffer()) {
            opt.filePath = file.path;
            opt.template = String(file.contents);
            try {
                var context = getContext(opt);
            } catch (err) {
                return this.emit('error', err)
            }

            try {
                var renderResult = new vEngine(opt).render(context);
            } catch (err) {
                return this.emit('error', err)
            }
            file.contents = new Buffer(renderResult);
            this.emit('data', file);
        }
    }

    return es.through(renderTpl);
}