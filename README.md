# jsCarton
This is a mutation of Jed Schmidts JavaScript based markup language [dōmo](http://domo-js.com/).
Which I like allot, because it made me start thinking about a whole new way using
[cssCarton](http://css.carton.io/) an css-pattern Tobias Schlömer and I have figured out to improve 
our daily work with HTML/CSS templating. The big deal about cssCarton is that it doesn't base on a 
column/gutter system like most other css-frameworks do, instead cssCarton offers a bunch of default
css-classes that provides an DOM-Element with a special default behavior. If you don't know the
cssCarton yet, you should follow this [link](http://github.com/cartonmarkup/cssCarton/readme.md) before
moving on. Anyway what jsCarton does, is to extend the already great dōmo markup with some extra cssCarton
specific extra "tags". I think an example will help to understand best:

    // This is a cell ( which is a part of the cssCarton patter )
    // defined in native HTML:

      <div class="cell_" style="width: 100%;">...</div>

    // In dōmo this would look like this: 

      DIV({ class: 'cell_', style:'width: 100%;' }, '...' )

    // And now the same with jsCarton:
    
      CELL( [ '100%' ], '...' ) 

This is all. jsCarton has three major tasks. The first as mentioned before is to create a dōmo
markup that has besides the original HTML-tags also the cssCarton "pseudo-tags"
**CELL, STRETCH, SLIM, CHOPPED, STICKER, FIXED, FIT**. The second part is to provide dōmo with
some CSS-magic. Which means that jsCarton comes with an factory method especially designed
to transform the cssCarton alike styling written in the markup to pure CSS. And at last provide
you with extra styling attributes and shortcuts ( `[ '100%' ]` ) to make it quite easy to
customize your markup.

## Installing jsCarton 
As dōmo – jsCarton works in both Worlds:

### Browser
    
    <script src="domo.js"></script>
    <script src="help.js"></script>
    <script src="cartonFactory.js"></script>
    <script src="carton.js"></script>

### node.js
In the commandline:

    npm install [path to jsCarton] // Not on the npm server yet 

In your file:
    carton = require( 'carton' )

## Setup jsCarton
Now that we have cleared the hurdle of installing jsCarton we have to call the carton method once
to pollute JavaScripts global object with it:
 
    // Browser
    carton()
    
    // In node.js
    carton().global()

Don't let you get disturb by the `.global()` in the server
example, it's part of the dōmo way and not important for now. If you are interested in the 
`.global()` method, search for "Convenience versus cleanliness" on
[http://domo-js.com/](http://domo-js.com/) jsCarton does it exactly the same like dōmo does.

### Settings for cartonFactory
A mayor part of jsCarton is it's [factory](http://github.com/cartonmarkup/cartonfactory/readme.md).
As said before it does all the CSS-magic for you. If you pass an extra object to the initial call 
of the carton you can influence some of it's behaviour.

    carton( { selector: '.' } )

This for example will let the factory know that you prefer to use CSS-classes instead of ids to
bind the generated styles to your DOM elements. The following is an list of all factory options:

  * **selector:** 
  ( '.' , '#' ) Defines if the factory will use CSS-classes or ids to bind styling to DOM-elements.
  Default is #.

  * **showGrid:** 
  ( true, false ) Outlines all elements based on a cssCarton-type.
  Default is false.
  
  * **extend:** Let you extend the cartonObject, which is the host of all the default settings
  inside of the factory. For example if you would like to extend the default styles of the SLIM tag
  with a font-color you can do this:

        carton( domo, { extend: { SLIM: { color: 'pink' } } )

The factory provides you also with two tiny **events**:

  * **once:**
  This event is fired only once, when a styling for an DOM-element is created for
  the very first time:

        carton( { once: function ( factoryObject, eventname ) { ... } )

  * **on:**  
  Differnet than once  this will be triggered every time the styling for an DOM-element has changed 
  and also when it was created:
        
        carton( { on: function ( factoryObject, eventname ) { ... } )

### Global Queries
Media queries became very important to CSS. But in my opinion they are kind of nasty to use.
jsCarton has a great, simple and intuitive way to use them. We will later see how. At this point
it is only important for you to know, that you can define querying rules global by adding an array
to the initial jsCarton call:

    carton( domo, [ { screen: 'all', minWidth: 320 }, { screen: 'all', maxWidth: 320 } ] )

## Markup

Like in dōmo the ELEMENT function, basically all "Tags" in jsCarton are short function calls of the
FACTORY function:

    FACTORY( 'div', { type: 'cell', styles: { width: '100%' } }, ... ) 

Which is also the most detailed way to define a jsCarton markup. A shorter version of course is to
use the CELL tag instead:

    CELL( { styles: {  width: '100%' } }, ... )

### Attributes
You can add any attribute you know from HTML to the attributes object. But their are also extra
key-attributes to control jsCarton:

*  **styles:** 
   This is the object that passes all the CSS-styling from the markup to the factory. You can use 
   camelCase to define CSS-styles that are stitched together with a hyphen. If the value is a pure 
   number 'px' and also browser specific prefixes like -webkit- will be added by the factory.

        SLIM( { color: 'pink', zIndex: '12', 'font-size': 12 } )

   The style object can also handle css pseudo classes and inheritance:

        SLIM({ 
          color: 'pink', 
          zIndex: '12', 
          fontSize: 12,
          '_:hover': { color: 'green' },
          '_strong': { fontWeight: 'bold' }
          }
          ,
          ... )

* **type:**
  Defines the cssCarton-type the FACTORY should use:

        FACTORY( 'div', { type: 'fit' }, ... )

* **nodeName:**
  By default all jsCarton "tags" will be added as an div-layer to the DOM.
  With nodeName you can define another HTML-markup-element:

        STRETCH( { nodeName: 'p' }, ... )

* **align:**
  ( left, center, right ) Adds the alignment-types from cssCarton to the DOM-element.

        CELL( { align: 'left' }, ... )

* **show:** ( true, false ) Different than the global showGrid setting this outlines each Markup
  based on cssCarton individualy if it is set on true.
        
        FIX( { show: true }, ... )

### Shortcuts
You have seen a shortcut already above `CELL( [ '100%' ] )` it is the fastest way to define the
dimensions of a cell just by passing an array as the first argument to the "CELL-Tag". As seen
before this will set the width of that cell to a hundred percent. You can also setup the height
by adding another number to the array. `CELL( [ '100%', 600 ] )`. Here is a list of all settings
that can be passed to the shortcut:

* **left,center,right:** 
  Set the cssCarton alignment-types.

        SLIM( [ 'left' ], ... )

* **Any kind of nodename:** 
  If you wanna use another node-name than 'div'.

        SLIM( [ 'p' ], ... )

* **true/false:**
  To show or hide the outlines of the element.

        SLIM( [ true ], ... )

* **An Object:** 
  Define an object to add comfortable styles: 
        SLIM( [ { color: 'pink' } ], ... )
  You can add as many objects as you want they will be mixed together.

Their are also some "jsCarton-tag" specific options.

* **STICKER/FIXED** 
  ( top, left ) or ( top, right, bottom, left ): 
  For these two you can define the top and left position by passing two values to the shortcut.
        
        STICKER( [  20, '30%' ], ... )

  If you pass more than two values the order will change to top, right, bottom, left instead of top
  and left.

* **CELL** 
  ( width, height, max-width, max-height, min-width, min-height ):
  For a cell you can define all dimension values:
        
      CELL( '100%', 'auto', 1200, 'auto', '600' )

You must not define all specific values but you have to keep the order. Also you can combine shortcuts
with the attributes object:
      
      STICKER( [ 'a', '10%' ], { href: '#foo' }, ... )

## The big deal with media-queries
Now with the stuff we have already learned about jsCarton we can finally take a look on media-queries.
You have already seen how to define a global-media-query. If defined, it will be used by 
all carton-tags, until a custom query is defined inside the attributes object:
      
       STICKER( { query: [ { screen: 'all', minWidth: '320px' }, { screen: 'all', maxWidth: '320px' } ] }, ... )
      
You can add different attributes for each query by defining them as an array:
      
      STICKER( { 
        styles: [ { fontSize: 32, top: 15, left: 15 }, { fontSize: 16, top: 5, left: 5 } ] 
      , query: [ {}, { screen: 'all', maxWidth: '320px' } ] }
      , ... 
      )
        
In the example above the top, left and font-size will be smaller if the browser window width is
lower than 320px. The empty object means that the font-size of 32px will be parsed to the
stylesheet without any querying. If an query attribute is defined all styles of the element will
be added to the query. The queries will be parsed into CSS the same order they are defined inside
the array. If an global query object is defined you can also use shortcuts to define different
styling:

      STICKER([ 15, 15, { fontSize: 32 } ], [ 5, 5, { fontSize: 16 } ], ... )

## Update
Sometimes it is necessary to update the settings of an DOM-element later, after the first parsing process. Sure you could
manipulate it with something like jQuery to apply your changes but this isn't necessary. You can always use the update method 
to change properties for a node managed by jsCarton without polluting the DOM with style attributes:
    
    carton.update( node, { styles: {...}, align: 'left' }, boolean ) 
    
This will parse new css-code for the node and pass it into the style-tag, if it is defined inside the head of your document. 
The boolean passed as the last argument controls if the update will replace the existing settings completely ( true ) or mix them together ( false ).
    
## Loops
This is a simple loop which can be used to iterate over any array or object to generate the same
markup for many times:

    CELL(
      EACH( [ 'A', 'B', 'C' ] , function ( item, index, length ) {
        return STRETCH( [ 'h' +index+1 ], item )
      })
    )

    // will be look like this as html:

    <div class="cell_">
      <h1 class="stretch_">A</h1>
      <h2 class="stretch_">B</h2>
      <h3 class="stretch_">C</h3>
    </div>

The callback has to return a jsCarton/dōmo element. If you wanna return more than one element on
the same tree-level you can use dōmos FRAGMENT function to do so:

    CELL(
      EACH( [ 'A', 'B', 'C' ] , function ( item, index ) {
        return FRAGMENT(
          STRETCH( [ 'h' +index+1 ], index ),
          STRETCH( [ p ], item )
        )
      })
    )

Also you can use an object to iterate over:
    
    CELL(
      EACH( { A:'b', B:'b', C:'c' } , function ( value, key ) {
        return STRETCH( key, ':', value )
      })
    )

## Native dōmo
If you wanna use an dōmo-markup-element without adding it to the factory you can add an 
underscore to the function call: 

    STRONG_( 'Some strong text!' )

jsCarton also hands over dōmos **ELEMENT, FRAGMENT, TEXT, COMMENT** and **STYLE.on** methods as
seen for the FRAGMENT in the EACH example.
      
## Compatibility 
jsCarton does only support modern browsers and Internet Explorer newer than version seven. It is
also important to notice that the dōmo version used in jsCarton is modified to support Internet
Explorer 8 and the cartonFactory in node.js.

## Licence
jsCarton is released under the [MIT License](http://www.opensource.org/licenses/MIT).

## Thanks allot
Comments or ideas are welcome at mathias_prinz@me.com!
