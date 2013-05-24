// cartonFactory.js 0.1.1

// (c) 2013 Mathias Prinz
// cartonFactory.js is distributed under the MIT license.
// For more details, see http: http://github.com/cartonmarkup/cartonFactory

var help = help || {};

! function ( help ) {

  typeof module == 'object'
       ? module.exports = function ( Settings, Shim, Help ) { document = Shim; help = Help; return init( Settings ); }
       : window.cartonFactory = init
       ;

  var sheet = {};
  var lookup = { dom: [], factories: [] };
  var num = 0;
  var use;
  var css;
  var styleTag;
  var suspended = false;
  var showGrid;
  var callback = {};
  var cartonKeys = [ 'type', 'styles', 'align', 'show' ];
  var cartonSettings = {

    label: 'carton',
    // carton types

    cell: { display: 'inline-block', 'vertical-align': 'top', 'font-size': 0, position: 'relative' },
    slim: { display: 'inline-block', 'vertical-align': 'top', 'font-size': 'medium', position: 'relative' },
    stretch: { display: 'block', 'vertical-align': 'top', 'font-size': 'medium', position: 'relative' }, 
    sticker: { position: 'absolute', display: 'block', 'font-size': 'medium' },
    chopped: { position: 'relative', display: 'inline', 'vertical-align': 'top', 'font-size': 'medium' },
    fixed: { position: 'fixed', display: 'block', 'font-size': 'medium' },
    fit: { position: 'absolute', display: 'block','font-size': 'medium', top: 0, left: 0, right: 0, bottom: 0 },

    // alignment

    align: {
      right: { 'text-align': 'right' },
      left: { 'text-align': 'left' },
      center: { 'text-align': 'center' }
    },

    // borders
    
    show: {
      cell: { outline: '3px dashed #FF716C', 'outline-offset': '0' },
      slim: { outline: '6px dashed #FFFF9D', 'outline-offset': '1px' },
      stretch: { outline: '6px dashed #FFFF9D', 'outline-offset': '1px' },
      chopped: { outline: '3px dashed #99fccb', 'outline-offset': '1px' },
      sticker: { outline: '6px double #9981FF', 'outline-offset': '1px' },
      fixed: { outline: '6px double #ff97d7', 'outline-offset': '1px' },
      fit: { outline: '3px dashed lightblue', 'outline-offset': '1px' }
    },

    prefix: {
      browser: [ 'moz', 'ms', 'o', 'webkit'],
      selector: [ 'border-radius', 'box-shadow', 'box-sizing', 'column-count', 'column-gap', 'text-shadow', 'transform', 'transition', 'transition-delay', 'transition-duration', 'transition-property', 'transition-timing-function'],
      value: ['radial-gradient', 'linear-gradient', 'transform' ]
    },

    retina: {
      query: '@media (min--moz-device-pixel-ratio: 1.3),(-o-min-device-pixel-ratio: 2.6/2), (-webkit-min-device-pixel-ratio: 1.3), (min-resolution: 192dpi), (min-resolution: 2dppx)',
      key: '@2x'
    }
  }

  // cache select array methods

  var shift = Array.prototype.shift;
  var concat = Array.prototype.concat;

  //////////////////////////////////////////////////////

  // browser specific prefixes for css classes

  function prefixify ( name, value ) {
    var prefix = cartonSettings.prefix;
    var browser = [ '' ].concat( ( '-' + prefix.browser.join( '-,-' ) + '-' ).split( ',' ) );
    var i = prefix.value.length;
    var x = name + ':' + value;

    if ( ! help.isString( value ) ) return x;

    while ( i-- ) {

      ! function ( pre ) {
          var reqExp = new RegExp( pre + '.* |' + pre + '.*$' );
          var matched = value.match( reqExp ); 
          var i;
          
          if ( matched !== null ) {

            i = browser.length;
            x = '';

            while ( i-- ) {
              x +=help.has( prefix.selector, name ) ? browser[ i ] : ''
              x += name + ':'
              x += value.replace( matched[ 0 ],  browser[ i ] + matched[ 0 ] )
              x += ';' 
            }
          }
      
       } ( prefix.value[ i ] );
    }

    return x;
  }

  // search for urls and at retina shortcut

  function retinafy ( str ) {
    if ( ! help.isString( str ) || ! cartonSettings.retina ) return str;
    return str.replace( /url\(([\S]*)(\.[png|jpg|gif][\S]*)\)/g, 'url($1' + cartonSettings.retina.key + '$2)' );
  }

  // initialize factory

  function init ( settings ) {
    if ( ! document ) throw new Error( 'No document provided.' );
   
    settings = settings || {};
    
    // parse css selectors as id or as class
    
    use = settings.selector || '#';

    // set target for css code

    styleTag = settings.styleTag || document.createElement( 'style' );

    // add or overwrite cartonSettingsect

    showGrid = settings.showGrid;

    callback.once = settings.once;
    callback.on = settings.on;

    if ( settings.extend ) help.mix( cartonSettings, settings.extend, { px: true, hyphenify: true } );

    return {
      add: newFactory(),
      remove: remove,
      parse: parse,
      set: set,
      get: get,
      destroy: destroy,
      index: index,
      suspendParser: suspend,
      setup: {
        use: use,
        showGrid: showGrid,
        stylesTag: styleTag,
        keys: cartonKeys,
        settings: cartonSettings
      }
    }
  }

  ///////////////////////////

  function Factory () {
    var args = concat.apply( [], arguments );
    var l = args.length;
    var i = 0;

    this.dom = args.shift();
    this.id = this.genId();
    this.selector = ''
    this.lookup = [];

    // add new cartons

    for ( i; i < l; i = i + 1 ) {

      if ( args.hasOwnProperty( i ) ) {

        this.indentical( args[ i ] );
      }
    }

    // update id or class attribute

    this.addSelector();

    // add this factory into lookup table

    lookup.dom.push( this.dom );
    lookup.factories.push( this );
    return parse();
  } 

  Factory.prototype = {

    indentical: function ( args ) {
      var obj = { query: args.query || false, type: args.type || false, align: args.align || false, show: args.show || false, pseudo: args.pseudo || false }
      var found = find( obj, this.lookup );
      var parsed;

      if ( found.length ) {

        rmFromSheet( found[ 0 ] );
        parsed = found[ 0 ].update( args );
      }
      else {

        parsed = this.newCarton( args );
      }

      addToSheet( parsed );
    },

    newCarton: function ( args ) {
      var obj = help.mix( { dom: this.dom, id: this.id }, args, { px: true, hyphenify: true } );
      var carton = new Carton( obj, this );
      var parsed = carton.parse();

      this.lookup.push( carton );
      return parsed;
    },

    genId: function () {
      var exist = this.dom.getAttribute( 'id' );

      if ( use === '#' && exist ) return exist;

      if ( ! this.uid ) {
        this.uid = num = num + 1;
      }

      return cartonSettings.label + '_' + this.uid + '_';
    },

    addSelector: function () {
      var attrName = ( use === '.' ) ? 'class' : 'id';
      var attr = this.dom.getAttribute( attrName ) || '';
      var value = attr.replace( this.selector, '' );
      var i = this.lookup.length;
      var selector = [];
      var parsed;

      while ( i-- ) {

        parsed = this.lookup[ i ].parse();

        ! function ( keys ) {
          var l = keys.length;
          var i = 0; 
          var name;

          for ( i; i < l; i = i + 1 ) {

            if ( ! parsed.styles[ keys[ i ] ] ) continue;

            name = ( use === '#' ) ?  parsed.id : parsed.classNames[ keys[ i ] ].replace( parsed.pseudo, '' );

            if ( !help.has( selector, name ) ) { 

              selector.unshift( name )
            }
          }
        } ( cartonKeys )
        ;

      }

      this.selector = selector.join(' ');

      if ( value.length &&  use === '.' ) selector.unshift( value );

      if ( selector !== value && selector.length ) { 
        
        this.dom.setAttribute( attrName, selector.join(' ') );
      }
    },

    rmCarton: function ( carton ) {
      var pos = findInIndex( carton, this, 'lookup' ).position;

      delete this.lookup[ pos ];
      this.lookup.splice( pos, 1 );
    },

    destroy: function () {
      var i = this.lookup.length;
      var pos = findInIndex( this, lookup, 'factories' ).position;

      while ( i-- ) {
        this.rmCarton( this.lookup[ i ] );
      }

      this.addSelector();
      delete lookup.factories[ pos ];
      lookup.dom.splice( pos, 1 );
      lookup.factories.splice( pos, 1 );
    }
  }

  ///////////////////////////

  function Carton ( obj, factory ) {
    help.mix( this, obj, { px: true, hyphenify: true } );
    this.show = this.show === undefined ? showGrid : this.show;
    this.factory = factory;
    this.trigger( 'once' );
    this.trigger( 'on' );
    this.image = []
  }

  Carton.prototype = {

    trigger: function ( type ) {
      if ( help.isFunction( callback[ type ] ) ) callback[ type ].call( null, this.parse(), type );
    }, 

    parseStyles: function ( styles, array ) {
      var retina = [];
      var str = [];
      var retinafied;
      var style;
      var i;

      for ( i in styles ) {

        if ( styles[ i ] === undefined ) return '';

        style = prefixify( i , styles[ i ] );
        retinafied = retinafy( style );

        if ( retinafied !== style ) retina.push( retinafied ); 
        str.push( style );
      }

      str.sort();
      str = array ? str : str.join( ';' );

      if ( retina.length ) {

        retina.sort();
        if ( array ) str = str.concat( [ 'RETINA' ], retina );
        else  str += 'RETINA' + retina.join( ';' );
      }

      return str;
    },

    parseQuery: function () {
      if ( ! this.query ) return '';

      var query = this.query;
      var str = '@media ' + ( query.media || 'all' );
      var i;

      for ( i in query ) {

        if ( !help.has( str, query[ i ] ) ) {

          str += ' and (' + i + ( query[ i ] === true ? '' : ':'  + query[ i ] ) + ') ';
        }
      }

      return str;
    },

    parse: function () {
      return {
        styles: {
          type: this.parseStyles( cartonSettings[ this.type ] )
        , align: this.parseStyles( cartonSettings.align[ this.align ] )
        , styles: this.parseStyles( this.styles )
        , show: this.show === true ? this.parseStyles( cartonSettings.show[ this.type ] ) : undefined
        },
        classNames: {
          type: this.type ?  this.parseSelector( this.type ) : undefined
        , align: this.parseSelector( 'align' + help.capitaliseFirstLetter( this.align ) )
        , styles: this.id + ( this.pseudo ? this.pseudo : '' ) 
        , show: this.show === true  ? this.parseSelector( 'show' + help.capitaliseFirstLetter( this.type ) ) : ''
        }
        , type: this.type
        , pseudo: this.pseudo
        , query: this.parseQuery()
        , dom: this.dom
        , id: this.id
      }
    },

    parseSelector: function ( name ) {
      var query = this.parseStyles( this.query, true ).join( '_' ).replace( /\:|-/g, '_' );
      var str = '';

      if ( query.length ) str += query+'_' ;
      str += name+'_';
      return str;
    },

    update: function ( setter, mixSeetings ) {
      mixSeetings = mixSeetings || {};
      mixSeetings.px = true;
      mixSeetings.hyphenify = true;

      help.mix( this, setter, mixSeetings );
      parsed = this.parse();
      this.factory.addSelector();
      this.trigger( 'on' );
      return this.parse();
    }
  }

  ///////////////////////////

  function addToSheet ( carton ) {
    var l = cartonKeys.length;
    var query = carton.query;
    var addTo = sheet;
    var styleObj;
    var typeObj;
    var i = 0; 

    function exist ( obj, name, type ) {

      if ( ! obj.hasOwnProperty( name ) ) obj[ name ] = type; 
      return obj[ name ];
    }

    function add ( parentObj, name, carton ) {
      if ( ! carton.styles[ name ] ) return;
      var key = ( use === '#' ) ? carton.classNames[ 'styles' ] : carton.classNames[ name ]
      var obj = exist( parentObj, carton.styles[ name ], [] );

      obj.push( key );
    }

    if ( query ) { 

      addTo = exist( addTo, query, {} );
    }

    for ( i; i < l; i = i + 1 ) { 
      
      add( addTo, cartonKeys[ i ], carton );
    }
  }

  function rmFromSheet ( carton ) {
    var parsed = carton.parse();
    var type = parsed.type;
    var className = parsed.className;
    var styles = parsed.styles;
    var l = cartonKeys.length;
    var query = parsed.query;
    var id = parsed.id;
    var that = this;
    var i = 0; 
   
    for ( i; i < l; i = i + 1 ) { 

      rm( cartonKeys[ i ], id, query );
    }

    function rm ( name, id, query ) {
      if ( ! parsed.styles[ name ] ) return;
      
      var key = ( use === '#' ) ? parsed.classNames[ 'styles' ] : parsed.classNames[ name ];
      var str = parsed.styles[ name ];
      var array = query ? sheet[ query ][ str ] : sheet[ str ];
      var i = array.indexOf( key );

      array.splice( i, 1 );

      if ( query && ! array.length ) {

        delete sheet[ query ][ str ];
      }
      else if ( ! array.length ) {

        delete sheet[ str ];
      }

      // rm query if it is emty

      if ( query && help.isEmpty( sheet[ query ] ) ) {
        delete sheet[ query ];
      }
    }
  }
  
  ///////////////////////////
  
  function suspend ( bool ) {
    suspended = bool;
  }
  
  ///////////////////////////

  function parse ( st ) {
    if ( suspended === true ) return;
    var str = asString();
    var keepForNow;
    styleTag = st || styleTag;
    
    // modern browser and node.js

    if (  help.isFunction( styleTag.appendChild ) ) {

      // this is to keep transitions alive

      if ( css && styleTag.childNodes.length ) {
        keepForNow = css;
      }

      css = document.createTextNode( str );
      styleTag.appendChild( css );
      
      if ( keepForNow !== undefined ) { 

        styleTag.removeChild( keepForNow );
      }
    }
    // IE > 9
    else if( styleTag && styleTag.styleSheet ) {

      styleTag.styleSheet.cssText = str;
    }
    else {

      return { css: str } 
    }

    return { tag: styleTag, css: str };
  }

  function asString ( query, retinaObj ) {
    var css = query || sheet;
    var CSSquery = '';
    var CSSstyle = '';
    var retina = retinaObj || {}
    var i;

    // is needed to remove the duplicated classnames for typeStyles 

    function rmDuplicates ( selectors ) {
      if ( use!== '.' ) return selectors;

      var l = selectors.length;
      var filter = [];
      var i = 0;

      for ( i; i < l; i = i + 1 ) {
        if ( !help.has( filter, selectors[ i ] ) ) {
          filter.push( selectors[ i ] );
        }
      }

      return filter;
    }

    function makeCssSelectors ( selectors ) {
      return use + rmDuplicates( selectors ).join( ',' + use );
    }

    function makeCss ( selector, value, nice ) {
      var br = nice ? '\n' : '';
      return br + selector + '{' + br + value + br + '}';
    }

    function makeRetinaQuery ( nice ) {
      if ( help.isEmpty( retina ) ) return '';
      var br = nice ? '\n' : '';
      var selectors;
      var str = '';

      str += br
      str += cartonSettings.retina.query
      str += '{'

      for ( i in retina ) {
        selectors = makeCssSelectors( retina[ i ] );
        str += makeCss( selectors, i );
      }

      str += '}'

      return str;
    }

    function atToRetina ( i ) {
      var sp = i.split( 'RETINA' );

      if ( sp.length > 1 ) {
        var r = sp.pop();

        if ( ! retina[ r ] ) retina[ r ] = [];
        retina[ r ] = retina[ r ].concat( rmDuplicates( css[ i ] ) );
      }

      return sp.pop();
    }

    function parseToString ( i ) {
      var array = help.isArray( css[ i ] );
      var str;

      if ( array ) { 

        if ( ! i.length ) return;
        CSSstyle += makeCss( makeCssSelectors( css[ i ] ), atToRetina( i ) );
      }
      else { 

        str = asString( css[ i ], retina );
        if ( ! str.length ) return;
        CSSquery += makeCss( i, str, true );
      }
    }

    for ( i in css ) parseToString( i );

    return CSSstyle  + CSSquery + ( ! retinaObj ?  makeRetinaQuery() : '' ) ;
  }

  ///////////////////////////

  function get ( condition ) {
    
    if ( condition.dom && ! help.has( lookup.dom, condition.dom ) ) return [];
    
    var list = lookup.factories;
    var l = list.length;
    var collect = [];
    var i = 0;

    ! function fast () {
        if ( ! condition.dom ) return;
        var dom = help.isArray( condition.dom  ) ? condition.dom : [ condition.dom ];
        var domLength = dom.length;
        var i = 0;
        var pos;

        list = [];

        for ( i; i < domLength; i = i + 1 ) {

          pos = lookup.dom.indexOf( dom[ i ] );
          list = list.concat( lookup.factories[ pos ] );
        }

        l = list.length;
    }()
    ;

    for ( i; i < l; i = i + 1 ) {

      var found = find( condition, list[ i ].lookup );
      collect = collect.concat( found );
    }

    return collect;
  }

  function find ( condition, lookup ) {
    var toStr = Object.prototype.toString;
    var astr = '[object Array]';
    var cartonList = [];

    ! function () {
      var l = lookup.length;
      var i = 0;

      for ( i; i < l; i = i + 1 ) {

        if ( ! proof( lookup[ i ], help.mix( {}, condition, { px: true, hyphenify: true } ) ) ) continue;
        cartonList.push( lookup[ i ] );
      }
    }();

    function proof ( carton, condition ) {
      var lock = ( ! carton ) ? false : true;
      var conditionIsArray;
      var existInCarton;
      var isntABoolean;
      var i;
      
      for ( i in condition ) {

        if ( ! lock ) break;

        conditionIsArray = help.isArray( condition[ i ] );
           existInCarton = ( ! help.isUndefined( carton[ i ] ) );
            isntABoolean = ( ! help.isBoolean( condition[ i ] ) );

        // if condition is an obj start recursion

        if ( ! conditionIsArray && help.isObject( condition[ i ] ) && ! condition[ i ].nodeType ) { 

          if ( ! proof( carton[ i ], condition[ i ] ) ) { 
            lock = false;
          } 
          continue;
        }

        // if condition is a list proof if value of the carton can be found in it  

        else if ( conditionIsArray && !help.has( condition[ i ], carton[ i ] ) ) { lock = false; continue; }

        // if condition is true and only it's key must exist in carton

        else if ( ! existInCarton && condition[ i ] === true ) { lock = false; continue; }

        // if condition is false and key should not exist in carton

        else if ( existInCarton && condition[ i ] === false  ) { lock = false; continue; }

        // if condition should be the same as in carton 

        else if ( isntABoolean && ! conditionIsArray && condition[ i ] !== carton[ i ] ) { lock = false; continue; }

        // if condition doesn't exit
        
        else if ( isntABoolean && ! existInCarton ) { lock = false; continue; }
      }

      return lock;
    }

    return cartonList;
  }

  ///////////////////////////

  function set ( getter, setter, mixSeetings ) {
    var cartons = get( getter );
    var collectChanges = [];
    var i = cartons.length;

    function rm () { rmFromSheet( cartons[ i ] ); }

    function update () {
      var parsed = cartons[ i ].update( setter, mixSeetings );

      addToSheet( parsed );
      collectChanges.push( parsed ); 
    } 

    while ( i-- ) { 

      rm.call( this ); update.call( this ); 
    }

    return { cartons: collectChanges, parsed: parse() }
  }

  ///////////////////////////

  // remove a carton
  
  function remove ( get ) {
    var cartons = this.get( get );
    var i = cartons.length;
    var collectRm = [];
    
    function rm () {
      var carton = cartons[ i ];
      var parsed = carton.parse();
      collectRm.push( parsed );
      updateFactory( carton );
      rmFromSheet( carton );
    }
    
    function updateFactory ( carton ) {
      var factory = findInIndex( carton.dom, lookup, 'dom', 'factories' ).obj; 

      factory.rmCarton( carton );
      factory.addSelector();
    }
    
    while ( i-- ) { 

      rm.call( this ) 
    };

    return { cartons: collectRm, parsed: parse() };
  }

  ///////////////////////////

  // destroy a factory

  function destroy ( dom, alsoChildren ) {
    var collectRm = [];

    ! function ( dom ) {
        var factory = findInIndex( dom, lookup, 'dom', 'factories' ).obj;
        var i;

        if ( ! factory ) return null;

        i = factory.lookup.length;

        while ( i-- ) {

          rmFromSheet( factory.lookup[ i ] );
          collectRm.push( factory.lookup[ i ].parse() );
        }

        factory.destroy();

        if ( dom.childNodes && alsoChildren ) {

          for ( i in dom.childNodes ) arguments.callee( dom.childNodes[ i ] );
        }

      } ( dom )
      ;

    return { cartons: collectRm, parsed: parse() };
  }

  ///////////////////////////

  // workaround to use apply on an prototype 

  function newFactory () {
    function F ( args ) { return Factory.apply( this, args ); }

    F.prototype = Factory.prototype;

    return function () {
      var args = arguments;
      return new F( args );
    }
  }

  ///////////////////////////

  function index ( key ) {
    return ( lookup[ key ] ? lookup[ key ] : [] );
  }

  function findInIndex ( elm, obj, search, index ) {
    var pos = obj[ search ].indexOf( elm );

    index = index || search;
    return { obj: obj[ index ][ pos ], position: pos };
  }

}( help );