var _base = '';
var _hash = false;

function app(path, callback){
    var route = {
        path: path,
        keys: []
    };
    route.regexp = regexp(path,route.keys);
    app.callbacks.push(middleware(route, callback));
}

app.callbacks = [];

app.go = function(path) {
    var context = new Context(path);
    context.saveState();
    var i = 0;
    function callNextCallback() {
        var callback = app.callbacks[i++];
        if(!callback) {
            return console.log('route [', context.path, '] not found');
        }
        callback( context, callNextCallback );
    }
    callNextCallback();
};

app.run = function(opts) {
    _base = opts && opts.base ? opts.base : '';
    _hash = opts && opts.hash ? '#!' : false;
    var url = location.pathname + location.search + location.hash;
    url = _base ? url.replace(_base, '') : '';
    if( _hash && ~location.hash.indexOf('#!') ) {
        url = location.hash.substr(2) + location.search;
    }
    app.go(url);
};

function Context(path) {
    path = _base + (_hash ? '/#!' : '') + path.replace(_base,'');
    path = path.length > 1 ? path.replace(/\/$/,'') : path;
    this.fullPath = path;
    path = _hash ? path.split('#!')[1] : (_base ? path.replace(_base,'') : path);
    this.title = document.title;
    this.params = {};
    var h = path.split('#');
    path = h[0];
    this.hash = h[1] || '';
    var q = path.split('?');
    path = q[0];
    this.querystring = q[1] || '';
    this.path = path || '/';
}

Context.prototype.saveState = function() {
    history.replaceState(this.state, this.title, this.fullPath );
};

function middleware(route, callback) {
    return function( context, next ) {
        var match = route.regexp.exec(decodeURIComponent(context.path));
        if( match ) {
            fillParams(match, route.keys, context.params );
            return callback(context);
        }
        next();
    }
}

function fillParams(match, keys, params) {
    var len = match.length;
    var idx = 0;
    var key, val;
    while (++idx < len) {
        key = keys[idx - 1];
        val = match[idx];
        if (val !== undefined) {
            params[key.name] = val;
        }
    }
}

function regexp(path, keys) {
    var regex = path.replace(/\/(:?)([^\/?]+)(\??)(?=\/|$)/g,
    function(match, isVariable, segment, isOptional) {
        if(isVariable) keys.push({ name: segment });
        return isVariable ? isOptional ? '(?:\\/([^\\/]+))?' : '\\/([^\\/]+)' : '\\/' + segment;
    });
    regex = regex === '*' ? '(.*)' : (regex === '/' ? '' : regex);
    if (keys.length === 0) keys.push({name: 0});
    return new RegExp( '^' + regex + '(?:\\/(?=$))?$','i');
}