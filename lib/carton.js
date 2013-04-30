// jsCarton 0.1.0

// (c) 2013 Mathias Prinz
// cartonFactory.js is distributed under the MIT license.
// For more details, see http: http://github.com/cartonmarkup/jsCarton

  var domo = domo || {};
  var help = help || {};

  ! function  ( domo, help ) {

    // Determine the global object.

    var global = Function( 'return this' )();

    // globalQuery

    var globalQuery = [];

    // store factory obj

    var factory;

    // csscarton "tags"

    var cartonTags = [ 'CELL', 'STRETCH', 'SLIM','CHOPPED', 'STICKER', 'FIXED', 'FIT' ];

    // html tags

    var tags = [
      'A', 'ABBR', 'ACRONYM', 'ADDRESS', 'AREA', 'ARTICLE', 'ASIDE', 'AUDIO',
      'B', 'BDI', 'BDO', 'BIG', 'BLOCKQUOTE', 'BODY', 'BR', 'BUTTON',
      'CANVAS', 'CAPTION', 'CITE', 'CODE', 'COL', 'COLGROUP', 'COMMAND',
      'DATALIST', 'DD', 'DEL', 'DETAILS', 'DFN', 'DIV', 'DL', 'DT', 'EM',
      'EMBED', 'FIELDSET', 'FIGCAPTION', 'FIGURE', 'FOOTER', 'FORM', 'FRAME',
      'FRAMESET', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'HEAD', 'HEADER',
      'HGROUP', 'HR', 'HTML', 'I', 'IFRAME', 'IMG', 'INPUT', 'INS', 'KBD',
      'KEYGEN', 'LABEL', 'LEGEND', 'LI', 'LINK', 'MAP', 'MARK', 'META',
      'METER', 'NAV', 'NOSCRIPT', 'OBJECT', 'OL', 'OPTGROUP', 'OPTION',
      'OUTPUT', 'P', 'PARAM', 'PRE', 'PROGRESS', 'Q', 'RP', 'RT', 'RUBY',
      'SAMP', 'SCRIPT', 'SECTION', 'SELECT', 'SMALL', 'SOURCE', 'SPAN',
      'SPLIT', 'STRONG', 'STYLE', 'SUB', 'SUMMARY', 'SUP', 'TABLE', 'TBODY',
      'TD', 'TEXTAREA', 'TFOOT', 'TH', 'THEAD', 'TIME', 'TITLE', 'TR',
      'TRACK', 'TT', 'UL', 'VAR', 'VIDEO', 'WBR'
    ];

    typeof module == 'object'
    ? module.exports = function ( Domo, Factory, Query, Shim, Help ) {

        if ( ! Domo ) throw new Error( 'No domo provided.' );
        if ( ! Factory ) throw new Error( 'No cartonFactory provided.' );
        if ( ! Shim ) throw new Error( 'No document provided.' );
        if ( ! Help ) throw new Error( 'No help provided.' );

        domo = Domo;
        factory = Factory;
        document = Shim;
        help = Help;
        globalQuery = Query || [];
        return Carton.call( this, document );
    }
    : window.carton = function () {
        var i = arguments.length;

        while ( i-- ) {

          if ( help.isObject( arguments[ i ] ) ) factory = arguments[ i ];
          else if ( help.isArray( arguments[ i ] ) ) globalQuery = arguments[ i ];
        }

        if ( ! domo ) throw new Error( 'No domo provided.' );
        if ( ! factory ) throw new Error( 'No cartonFactory provided.' );
        if ( ! help ) throw new Error( 'No help provided.' );

        factory = initFactory( factory );

        domo.global( false );

        return new Carton( global.document ).global( true );
      };


    ///////////////////////////

    var shift = Array.prototype.shift;
    var concat = Array.prototype.concat;

    ///////////////////////////

    // create factory if nessesary

    function initFactory ( Factory ) {
      var Factory = Factory || {}
      var settings = { selector: '#', showGrid: false };
      var key;

      if ( ! Factory || ! Factory.index ){
        if ( ! cartonFactory ) throw new Error( 'No cartonFactory provided.' )
        if ( Factory ) help.mix( settings, Factory );
        Factory = cartonFactory( settings )
      }

      if ( settings.extend ) {
        for ( key in settings.extend ) if ( cartonTags.indexOf( key ) === -1 ) cartonTags.push( key.toUpperCase() );
      }

      return Factory;
    }

    ///////////////////////////

    function shortcut ( type, list, attr ) {
      var args = []
      var settings = { styles: {}, align: ' ', show: factory.setup.showGrid  }
      var l = list.length
      var i = 0;

      this.cell = function () {
        var args   = concat.apply( [], arguments );
        var keys = [ 'width', 'height', 'max-width', 'max-height', 'min-width', 'min-height' ];

        return transformToSettings( keys, args );
      }

      this.sticker = function () {
        var l = arguments.length;
        var keys = ( l === 2 ) ? [ 'top', 'left' ] : [ 'top', 'right', 'bottom', 'left' ];

        return transformToSettings( keys, args );
      }

      this.fixed = this.sticker;

      function transformToSettings ( loop, specials ) {
        var l = loop.length;
        var i = 0;

        for ( i; i < l; i = i + 1 ) {

          if ( specials[ i ] !== undefined ) {
            if ( ! settings.styles ) settings.styles = {};
            settings.styles[ loop[ i ] ] = specials[ i ];
          }
        }

        for ( i in settings ) {

          if ( attr[ i ] !== undefined && help.isArray( attr[ i ] ) ) {
          
            settings[ i ] = attr[ i ].concat( settings[ i ] );
           
          }
          else if ( attr[ i ] !== undefined ) {

            settings[ i ] = [ attr[ i ], settings[ i ] ];
          }
          
        }
      
        return help.mix( attr, settings );
      }

      for ( ; i < l; i = i + 1 ) {

        if ( help.isObject( list[ i ] ) ) {

          if ( ! settings.styles ) settings.styles = {};
          help.mix( settings.styles, list[ i ] );
        }

        else if ( help.isBoolean( list[ i ] ) ) {

          settings.show = list[ i ];
        }

        else if ( help.isString( list[ i ] ) && help.has( tags, list[ i ].toUpperCase() ) ) {

          settings.nodeName = list[ i ];
        }

        else if ( help.isString( list[ i ] ) && help.has( 'left,right,center', list[ i ]  ) ) {
          
          settings.align = list[ i ];
        }

        else {
          
          args.push( list[ i ] );
        }
      }

      if ( ! this[ type ] ) return transformToSettings( [], args );
      return this[ type ].apply( null, args );
    }

    ///////////////////////////

    function factorify ( obj ) {

      function filter() {
        var filterObj = { length: 1, keys:{}, attr: {}, nodeName: '' }
        var pseudos
        var i;

        for ( i in obj ) {

          if ( i === 'nodeName' ) filterObj.nodeName = obj[ i ];

          else if ( help.has( 'styles,query,type,align,show', i ) ) {

            // add globalQuery if needed

            if ( help.isArray( obj[ i ] ) && !filterObj.keys.query ) {

              filterObj.keys.query = globalQuery;
            }

            filterObj.keys[ i ] = obj[ i ];
            filterObj.length = ( obj[ i ].length > filterObj.length ) && help.isArray( obj[ i ] ) ? obj[ i ].length : filterObj.length;

          }
          else {

            filterObj.attr[ i ] = obj[ i ];
          }
        }

        return filterObj;
      }

      function transformToFactoryOptions () {
        var filtered = filter();
        var keys = filtered.keys;
        var l = filtered.length;
        var args = [];
        var i = 0;
        var k;

        for ( i; i < l; i = i + 1 ) {

          args[ i ] = {};

          for ( k in keys ) {

            if ( ! help.isArray( keys[ k ] ) ) {

              args[ i ][ k ] = keys[ k ];
            }
            else { 

              if ( ! keys[ k ][ i ] || help.isObject( keys[ k ][ i ]) && help.isEmpty( keys[ k ][ i ] ) || help.isString( keys[ k ][ i ] ) && ! keys[ k ][ i ].length ) continue
              args[ i ][ k ] =  keys[ k ][ i ];
            }
          }
        }

        return { factory: args, attributes: filtered.attr, nodeName: filtered.nodeName };

      }

      return transformToFactoryOptions();
    }

    ///////////////////////////

    function hasPseudoClass ( factories ) {
      var l = factories.length;
      var list = [];
      var i = 0;

      function lookForPseudo ( styles, query, p ) {
        var p = p || '';
        var pseudoList = [];
        var pseudoSelectors = {};
        var selector;
        var i;

        for ( i in styles ) {

          if ( i[ 0 ] === '_' ) {

            selector = i.slice( 1 );
            if ( selector[ 0 ] !== ':' ) selector = ' ' + selector;
            pseudoSelectors[ selector ] = help.mix( {}, styles[ i ] );
            delete styles[ i ];
          }
        }

        for ( i in pseudoSelectors ) {
          
          pseudoList.push( { pseudo: p + i, styles: pseudoSelectors[ i ], query: query } );
          lookForPseudo( pseudoSelectors[ i ], query,  p + i + ' ' );
        }

        if ( pseudoList.length ) factories = factories.concat( pseudoList )
      }

      for ( i; i < l; i = i + 1 ) {

         lookForPseudo( factories[ i ].styles, factories[ i ].query );  
      }

      return factories;
    }

    ///////////////////////////

    function makeFactory ( carton, type ) {
      carton[ type ] =
        carton[ type.toLowerCase() ] = function () {
          var l = arguments.length;
          var childNodes = [];
          var attr = {};
          var i = 0;

          for ( i; i < l; i = i + 1 ) {

            if ( help.isArray( arguments[ i ] ) ) {

              help.mix( attr, shortcut( type.toLowerCase(), arguments[ i ], attr ) );
            }
            else if ( help.isObject( arguments[ i ] ) && ! arguments[ i ].nodeType ) {

              help.mix( attr, arguments[ i ] );
            }
            else {

              childNodes.push( arguments[ i ] );
            }
          }

          if ( ! attr.type && tags.indexOf( type ) === -1 ) {

            attr.type = type.toLowerCase();
          }

          if ( ! attr.nodeName ) {

            attr.nodeName = tags.indexOf( type ) > -1 ? type : 'div';
          }

          childNodes.unshift( attr.nodeName, attr );
          
          return carton.FACTORY.apply( carton, childNodes );
        }
    }

    ///////////////////////////

    function Carton ( document ) {
      if ( ! document ) throw new Error( 'No document provided.' )

      var extendedTags = cartonTags.concat( tags );
      var i = extendedTags.length;
      var styleTag;

      help.mix( this, factory );
      this.carton = this;

      this.FACTORY = function () {
        var childNodes = concat.apply( [], arguments );

        var nodeName = childNodes.shift();
        var attributes = childNodes[ 0 ];
        var element;
        var sorted;

        if ( attributes ) {

          if ( typeof attributes == "object" && ! attributes.nodeType ) {

            attributes = shift.apply( childNodes )
            sorted = factorify( attributes );

            if ( sorted.nodeName ) {

              nodeName = sorted.nodeName;
            }
          }
        }

        element = domo.ELEMENT.apply( domo, [ nodeName, sorted.attributes ].concat( childNodes ) );
        factory.add.apply( null, [ element ].concat( hasPseudoClass( sorted.factory ) ) );

        if ( nodeName === 'STYLE' ) {

          styleTag = element;
        }

        switch ( nodeName ) {
          case "HTML":
          case "HEAD":
          case "BODY":
            if ( styleTag ) { 

              factory.parse( styleTag )
            }
          }

          return element;
      }

      this.EACH = function () {
        var frag = domo.FRAGMENT();
        var list = arguments[ 0 ];
        var item = arguments[ 1 ];
        var i;
        var l;

        if ( typeof list !== 'object' ) return ''
        if ( typeof item !== 'function' ) throw new Error( 'No function' )

        if ( typeof list === 'object' && list instanceof Array === false  ) {

          for ( i in list ) {
            frag.appendChild( item.call( null,  list[i], i, list.length ) );
          }

          return frag;
        }

        i = 0;
        l = list.length;

        for ( i; i < l; i = i + 1 ) {

          frag.appendChild( item.call( null, list[i], i, list.length ) );
        }

        return frag;
      } 

      while ( i-- ) {

         if ( ! help.has( cartonTags,  extendedTags[ i ] ) ) {

           this[ extendedTags[ i ] + '_' ] = domo[ extendedTags[ i ] ];
         }

         makeFactory( this, extendedTags[ i ] ); 
      }

      this.ELEMENT = domo.ELEMENT;
      this.FRAGMENT = domo.FRAGMENT;
      this.TEXT = domo.TEXT;
      this.COMMENT = domo.COMMENT;
      this.STYLE.on = domo.STYLE.on;

      this.global = function ( on ) {
        var values = this.global.values;
        var key;
        var code;

        if ( on !== false ) {

          global.carton = this;

          for ( key in this ) {
            code = key.charCodeAt( 0 );
            if ( code < 65 || code > 90 ) continue;
            if ( this[ key ] == global[ key ] ) continue;
            if ( key in global ) values[ key ] = global[ key ];

            global[ key ] = this[ key ];
          }
        }
        else {

          try {

            delete global.carton;
          }
          catch ( e ) {

            global.carton = undefined;
          }

          for ( key in this ) {

            if ( key in values ) {
              
              if ( global[ key ] == this[ key ] ) global[ key ] = values[ key ];
            }
            else {

              try {

                delete global[ key ];
              }
              catch ( e ) {

                global[ key ] = undefined;
              }
            }
          }
        }

        return this;
      }

      this.global.values = {};
    }
}( domo, help )
;