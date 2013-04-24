// jsCarton 0.1.0

// (c) 2013 Mathias Prinz
// cartonFactory.js is distributed under the MIT license.
// For more details, see http://js.carton.io

  ! function  () {

    // Determine the global object.

    var global = Function( 'return this' )();

    // globalQuery

    var globalQuery = [];

    // store factory obj

    var factory;

    // store domo obj

    var domo;

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
      ? module.exports = function ( Domo, Factory, Query, Shim ) {
          if ( ! Domo ) throw new Error( 'No domo provided.' );
          domo = Domo,
          factory = Factory;
          document = Shim;
          globalQuery = Query || [];
          return Carton.call( this, document );
      } 
      : window.carton = function () {
          var i = arguments.length;

          while ( i-- ) {
            if ( 'domo' in arguments[ i ] ) domo = arguments[ i ].global( false );
            else if ( isObject( arguments[ i ] ) ) factory = arguments[ i ];
            else if ( isArray( arguments[ i ] ) ) globalQuery = arguments[ i ];
          }

          factory = initFactory( factory );

          if ( ! domo ) throw new Error( 'No domo provided.' );
          return new Carton( global.document ).global( true );
        };

    ///////////////////////////

    var shift = Array.prototype.shift;
    var concat = Array.prototype.concat;

    function isArray ( x ) { return x instanceof Array; }
    function isObject ( x ) { return typeof x === 'object' && ! ( x instanceof Array ); }
    function isString ( x ) { return typeof x === 'string'; }
    function isBoolean ( x ) { return typeof x === 'boolean'; }
    function has ( xxx, x ) { return xxx.indexOf( x ) > -1; }
    function isEmpty ( x ) {
      for ( var i in x ) if ( x.hasOwnProperty( i ) ) return false; return true;
    }

    function extend ( a, b, doNotMix ) {
      var toStr = Object.prototype.toString;
      var astr = "[object Array]";
      var i;

      for ( i in b ) {
        if ( b.hasOwnProperty( i ) ) {
          if ( typeof b[ i ] === 'object' && ! b[ i ].nodeType && ! has( doNotMix || [], i ) ) {

            if (  a[ i ] === undefined || toStr.call( b[ i ] ) !== toStr.call( a[ i ] ) ) {

              a[ i ] = ( toStr.call( b[ i ] ) === astr ) ? [] : {};
            }
            extend( a[ i ], b[ i ], doNotMix );
          }
          else {
            a[ i ] = b[ i ];
          }
        }
      }

      return a;
    }

    ///////////////////////////

    // create factory if nessesary

    function initFactory ( F ) {
      var F = F || {}
      var settings = { selector: '#', showGrid: false };
      var key; 
      
      if ( ! F || ! F.index ){ 
        if ( ! cartonFactory ) throw new Error( 'No cartonFactory provided.' )
        if ( F ) extend( settings, F );
        F = cartonFactory( settings )
      }

      if ( settings.extend ) {
        for ( key in settings.extend ) if ( cartonTags.indexOf( key ) === -1 ) cartonTags.push( key.toUpperCase() );
      }
      return F;
    }

    ///////////////////////////

    function shortcut ( type, list, attr ) {
  
      var args = []
      var settings = { styles: {}, align: ' ', show: false  }
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

          if ( attr[ i ] !== undefined && isArray(  attr[ i ] ) ) {
          
            settings[ i ] = attr[ i ].concat( settings[ i ] );
           
          }
          else if ( attr[ i ] !== undefined ) {

            settings[ i ] = [ attr[ i ], settings[ i ] ];
          }
          
        }
        
        return extend( attr, settings );
      }

      for ( ; i < l; i = i + 1 ) {

        if ( isObject( list[ i ] ) ) {

          if ( ! settings.styles ) settings.styles = {};
          extend( settings.styles, list[ i ] );
        }

        else if ( isBoolean( list[ i ] ) ) {
  
          //settings.show = list[ i ];
          settings.show = list[ i ];
        }

        else if ( isString( list[ i ] ) && has( tags, list[ i ].toUpperCase() ) ) {

          settings.nodeName = list[ i ];
        }

        else if ( isString( list[ i ] ) && has( 'left,right,center', list[ i ]  ) ) {
          //settings.align = [ list[ i ] ];
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

          else if ( has( 'styles,query,type,align,show', i ) ) {

            // add globalQuery if needed

            if ( isArray( obj[ i ] ) && !filterObj.keys.query ) {

              filterObj.keys.query = globalQuery;
            }

            filterObj.keys[ i ] = obj[ i ];
            filterObj.length = ( obj[ i ].length > filterObj.length ) && isArray( obj[ i ] ) ? obj[ i ].length : filterObj.length;

          }
          else {

            filterObj.attr[ i ] = obj[ i ];
          }
        }

        return filterObj;
      }
/*
      function mixStyles ( array, key ) {

        array = [].concat( array );

        if ( array[ 0 ] === false || array.length === 1 || key !== 'styles' ) {
          if ( array[ 0 ] === false ) array.shift()
          return array;
        }

        var root = array[ 0 ];
        var l = array.length;
        var i = 0;
        var copy 

        for ( i; i < l; i++ ) {
          copy = extend( {}, root );
          array[ i ] = extend( copy, array[ i ] );
        }

        return array;
      }
*/
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

            if ( ! isArray( keys[ k ] ) ) {

              args[ i ][ k ] = keys[ k ];
            }
            else { 

              if ( ! keys[ k ][ i ] || isObject( keys[ k ][ i ]) && isEmpty( keys[ k ][ i ] ) || isString( keys[ k ][ i ] ) && ! keys[ k ][ i ].length ) continue
              // args[ p ][ k ] = mixStyles( keys[ k ], i )[ p ]; 
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
        //var styles = factory.styles;
        var p =  p || '';
        var pseudoList = [];
        var pseudoSelectors = {};
        var selector;
        var i;

        for ( i in styles ) {

          if ( i[ 0 ] === '_' ) {

            selector = i.slice( 1 );
            if ( selector[ 0 ] !== ':' ) selector = ' ' + selector;
            pseudoSelectors[ selector ] = extend( {}, styles[ i ] );
            delete styles[ i ];
          }
        }

        for ( i in pseudoSelectors ) {
          
          pseudoList.push( { pseudo: p + i, styles: pseudoSelectors[ i ], query: query } );
          lookForPseudo( pseudoSelectors[ i ], query,  p + i + ' ' );
        }
        
        if ( pseudoList.length ) factories = factories.concat( pseudoList )
        //return pseudoList;
      }

      for ( i; i < l; i = i + 1 ) {

         //list = 
         lookForPseudo( factories[ i ].styles, factories[ i ].query );  
         //if ( list.length ) factories = factories.concat( list )
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
            if ( isArray( arguments[ i ] ) ) {
              extend( attr, shortcut( type.toLowerCase(), arguments[ i ], attr ) );
            }
            else if ( isObject( arguments[ i ] ) && ! arguments[ i ].nodeType ) {
              
              extend( attr, arguments[ i ], [ 'query' ] )
            }
            else {
              childNodes.push( arguments[ i ] )
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

      extend( this, factory );
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

         if ( ! has( cartonTags,  extendedTags[ i ] ) ) {

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
}()
;