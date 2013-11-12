console = function() {
    var stdout = java.lang.Systen.out;
    var stderr = java.lang.System.err;

    function doLog(out, type) {
        return function() {
            var args = java.lang.reflect.Array.newInstance(java.lang.Object, arguments.length - 1);
            var format = arguments[0];
            var conversionIndex = 0;
            // need to look for %d (integer) conversions because in Javascript all numbers are doubles
            for (var i = 1; i < arguments.length; i++) {
                var arg = arguments[i];
                if (conversionIndex != -1) {
                    conversionIndex = format.indexOf('%', conversionIndex);
                }
                if (conversionIndex >= 0 && conversionIndex < format.length) {
                    var conversion = format.charAt(conversionIndex + 1);
                    if (conversion === 'd' && typeof arg === 'number') {
                        arg = new java.lang.Integer(new java.lang.Double(arg).intValue());
                    }
                    conversionIndex++;
                }
                args[i-1] = arg;
            }
            try {
                out.println(type + java.lang.String.format(format, args));
            } catch(ex) {
                stderr.println(ex);
            }
        }
    }
    return {
        log: doLog(stdout, ''),
        info: doLog(stdout, 'INFO: '),
        error: doLog(stderr, 'ERROR: '),
        warn: doLog(stderr, 'WARN: ')
    };
}();

less.modules = {};

less.modules.path = {
    join: function() {
        var parts = [];
        for (i in arguments) {
            parts = parts.concat(arguments[i].split('/'));
        }
        var result = [];
        for (i in parts) {
            var part = parts[i];
            if (part === '..' && result.length > 0) {
                result.pop();
            } else if (part === '' && result.length > 0) {
                // skip
            } else if (part !== '.') {
                result.push(part);
            }
        }
        return result.join('/');
    },
    dirname: function(p) {
        var path = p.split('/');
        path.pop();
        return path.join('/');
    },
    basename: function(p, ext) {
        var base = p.split('/').pop();
        if (ext) {
            var index = base.lastIndexOf(ext);
            if (base.length === index + ext.length) {
                base = base.substr(0, index);
            }
        }
        return base;
    },
    extname: function(p) {
        var index = p.lastIndexOf('.');
        return index > 0 ? p.substring(index) : '';
    }
};

less.modules.fs = {
    readFileSync: function(name) {
        var file = new java.io.File(name);
        var stream = new java.io.FileInputStream(file);
        var buffer = [];
        var c;
        while ((c = stream.read()) != -1) {
            buffer.push(c);
        }
        stream.close();
        return {
            length: buffer.length,
            toString: function(enc) {
                if (enc === 'base64') {
                    return javax.xml.bind.DatatypeConverter.printBase64Binary(buffer);
                }
            }
        };
    }
};
