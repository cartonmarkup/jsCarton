# jsCarton
This is a mutation of Jed Schmidts JavaScript based markup language [dōmo](http://domo-js.com/). 
Which I like allot, because it made me start thinking about a whole new way using 
[cssCarton](http://css.carton.io/). 
a CSS-patter Tobias Schlömer and I have figured out to improve our daily work with HTML/CSS 
templating. The big deal about cssCarton is that it doesn't base on a column/gutter system like
most other css-frameworks do, instead cssCarton offers a bunch of default css-classes that 
provides an DOM-Element with a special default behavior. If you don't know the cssCarton yet, you
should follow this [link](http://github.com/mathiasprinz/cssCarton/readme.md) before moving on. 
Anyway what jsCarton does, is to extend the already great dōmo markup with some extra "tags". 
I think an example will help to understand best. 

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
some CSS magic. Which means that jsCarton comes with an factory method especially designed
to transform the cssCarton alike styling written in the markup to pure CSS. And at last provide 
you with extra styling attributes and shortcuts ( `[ '100%' ]` ) to make it quite easy to 
customize your markup.
 
## Installing jsCarton 
As dōmo – jsCarton works in both Worlds:

### Browser
    
    <script src="domo.js"></script> 
    <script src="cartonFactory.js"></script>
    <script src="carton.js"></script>

### node.js
    
    npm install jsCarton

## Setup jsCarton
Now that we have cleared the hurdle of installing jsCarton we have to call the carton method once 
to pollute JavaScripts global object with it:   
 
    // Browser
    carton( domo )
    
    // In node.js
    carton().global()   

The mayor difference between browsers and node.js is that on the client the dōmo namespace must be
passed to the initial function call. Don't let you get disturb by the `.global()` in the server
example, it's part of the dōmo way and not important for now. If you are interested in the 
`.global()` method, search for "Convenience versus cleanliness" on 
[http://domo-js.com/](http://domo-js.com/) jsCarton does it exactly the same like dōmo does.

### Settings for cartonFactory
A mayor part of jsCarton is it's factory. As said before it does all the CSS magic for you. If you
pass an extra object to the initial call of the carton you can influence some of it's behaviour.
 
    carton( domo, { selector: '.' } )

This for example will let the factory know that you prefere to use css-classes instead of ids to 
bind the generated styles to your DOM elements. These are all factory options:
 
  * **selector:** ( '.' , '#' ) Define if factory will use css-classes or id's to bind 
  styling to dom elements. Default is #;   
  
  * **showGrid:** ( true, false ) Outlines all elements based on a cssCarton element. 
  Default is false.
  
  * **extend:** Let you extend the cartonsettings-object inside the factory. For example if 
  you would like to extend the default styles of the SLIM tag with a font color: 
    
        carton( domo, { extend: { SLIM: { color: 'pink' } } )
  
  * **once:** Event that is triggerd only once, when styling for an DOM-element is created for 
  the first time: 
      
        carton( { once: function ( factoryObject, eventname ) { ... } )
   
  * **on:**  Event that is triggerd every time a styling for an DOM-element is changed and also
  when it was created: 
        
        carton( { on: function ( factoryObject, eventname ) { ... } )

### Global Queries
Media queries became very important to CSS. But in my opinion they are kind of nasty to use. 
jsCarton has a great, simple and intuitive way to use them. We will later see how. At this point
it is only important to know that you can define them global by adding an array to the initial 
carton call:
  
    carton( domo, [ { screen: 'all', minWidth: '320px' }, { screen: 'all', maxWidth: '320px' } ] ) 

## Markup

Like in dōmo the ELEMENT function, basically all "Tags" in jsCarton are shortcuts of the FACTORY
function.   

    FACTORY( 'div', { type: 'cell', styles: { width: '100%' } }, ... ) 

Which is also the most detailed way to define a jsCarton markup. A shorter version of corse is to
use the CELL tag instead:
  
    CELL( { styles: {  width: '100%' } }, ... )

### Attributes
You can add any attribute you know from HTML to the attributes object. But their are also keys 
attributes for jsCarton explusive:  

*  **styles:** This is the object that passes all the css styling from the markup to the factory.
   You can use camelCase to define css styles that are stitched together with a hyphen. If the value
   is a pure number 'px' will be added and also browser specific prefixes like -webkit- will be
   added by the factory.
      
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

* **type:** Defines the cssCarton element the FACTORY should use.
      
        FACTORY( 'div', { type: 'fit' }, ... ) 

* **nodeName:** By default all jsCarton specific Tags will be added as a div-layer to the DOM. 
  With nodeName you can define another DOM eleemnt:
        
        STRETCH( { nodeType: 'p' }, ... )
      
* **align:** ( left, center, right ) Adds the alignment options from cssCarton DOM element.
        
        CELL( { align: 'left' }, ... )

* **show:** ( true, false ) Different than the global showGrid setting this outlines each Markup
  based on cssCarton individualy if it is set on true.
        
        FIX( { show: true }, ... )

### Shortcuts
You have seen a shortcut already above `CELL( [ '100%' ] )` it is the fastest way to define the 
dimensions of a cell by just passing an array as the first argument to the "CELL-Tag". As seen
before this will set the width of that cell to a hundred percent. You can also setup the height
by adding another number to the array. `CELL( [ '100%', 600 ] )`. Here is a list of all settings
that can be passed to the shortcut:

* **left,center,right:** 
  As a string to set the alignment attribute. 
  
        SLIM( [ 'left' ], ... )

* **Any kind of nodename:**  
  As a string to set the nodeName. 
      
        SLIM( [ 'p' ], ... )

* **true/false:** 
  To set the show attribute.
      
        SLIM( [ true ], ... ) 

* **An Object:** 
        
        SLIM( [ { color: 'pink' } ], ... )

Their are also some carton Tag specific options. 

* **STICKER/FIXED** ( top, left ) or ( top, right, bottom, left ): For these two you can define 
  the top and left position by passing two values to the shortcut.
        
        STICKER( [  20, '30%' ], ... )
  
  By passing more than two arguments the order of the values will change to top, right, bottom,
  left instead of top and left.
  
* **CELL** ( width, height, max-width, max-height, min-width, min-height ): 
  For a cell you can define all dimension values. 
        
        CELL( '100%', 'auto', 1200, 'auto', '600' ) 

You must not define all specific values but you have to keep the order. Also you can combine 
shortcuts with the attributes object:
        
        STICKER( [ 'a', '10%' ], { href: '#foo' }, ... )




## The big deal with Media-Queries
Now with the stuff we have already learned about jsCarton we can take a look on media-queries.
You have already seen how to define a global media query. If it's defined, it will be used by 
all carton-tags, until a custom query is defined inside the attributes object:
      
       STICKER( { query: [ { screen: 'all', minWidth: '320px' }, { screen: 'all', maxWidth: '320px' } ] }, ... )
      
You can add different attributes for each query by defining them as an array:
      
      STICKER( { 
        styles: [ { fontSize: 32, top: 15, left: 15 }, { fontSize: 16, top: 5, left: 5 } ] 
      , query: [ {}, { screen: 'all', maxWidth: '320px' } ] }
      , ... 
      )
        
In the example above the top, left and font-size will be smaller if the browser window width is
lower than 320px.The empty object means that the font-size of 32px will be parsed to the 
stylesheet without any querying. If an query attribute is defined all styles of the element will
be added to the query. The queries will be parsed into css the same order they are defined inside
the array. If an global query object is defined you can also use shortcuts to define different 
styling:
      
      STICKER([ 15, 15, { fontSize: 32 } ], [ 5, 5, { fontSize: 16 } ], ... )

## Loops
This is a simple loop which can be used to iterate over any array or object to generate the same
markup for many times:
        
    CELL( 
      EACH( [ 'A', 'B', 'C' ] , function ( item, index ) {
        return STRETCH( [ 'h' +index+1 ], key )
      })
    )
        
    // will be look like this as html:
        
    <div class="cell_">
      <h1 class="stretch_">A</h1>
      <h2 class="stretch_">B</h2>
      <h3 class="stretch_">C</h3>
    </div>
        
The callback has to return a jsCarton/dōmo element. If you wanna return more than one element on
the same treelevel you can use dōmos FRAGMENT function to do so:
  
    CELL( 
      EACH( [ 'A', 'B', 'C' ] , function ( item, index ) {
        return FRAGMENT(
          STRETCH( [ 'h' +index+1 ], index ),
          STRETCH( [ p ], key )
        )
      })  
    )

## Native dōmo
If you wanna use an dōmo markup element without adding it to the factory you can add an 
underscore to the function call: 
      
    STRONG_( 'Some strong text!' )
    
jsCarton also hands over dōmos **ELEMENT, FRAGMENT, TEXT, COMMENT** and **STYLE.on** methods as
seen for the FRAGMENT in the EACH example.     
      
## Compatibility 
jsCarton does only support modern browsers and Internet Explorer newer than version seven. It is
also important to notice that the dōmo version used in jsCarton is modified to support Internet 
Explorer 8 and the cartonFactory in node.js.

## Licence
cssCarton is released under the [MIT License](http://www.opensource.org/licenses/MIT).

## Thanks allot
Comments or ideas are welcome at mathias_prinz@me.com!




# cartonFactory
This factory has been build to support developers with a default api to add, change or remove 
[cssCarton](http://css.carton.io/) based styling to an DOM-Element managed by pure JavaScript.

## Parseing
  
    <head>
      <script src="cartonFactory.js"></script>
      <style></style>
    </head>
    
    <body>
      <div id="cartonify">Foo</div>
    </body>
  
    <script>
      var F = cartonFactory( { styleTag: document.getElementsByTagName( 'style' )[ 0 ] })
      
      F.add( 
        document.getElementById( 'cartonify' ),
        { type: 'stretch', styles: { background: 'yellow', color: 'orange' }, align: 'center' }
      )
    </script>

In this example the factory will build three css selectors with the id #cartonify:
    
    #cartonify {display:block;font-size:medium;position:relative;vertical-align:top}
    #cartonify {background:yellow;color:orange }
    #cartonify {text-align:center} 

The first line are the styles that define #cartonify as the cssCarton type stretch_, the second
defines the individually styles defined in the styles object and the last will add another
cssCarton type alignCenter_. It seams that the factory has parsed the css-code in the same order
they are defined inside the passed object. But this is not the full truth. Adding another DOM 
element with the same properties and you will see:
    
    
    <body>
      <div id="cartonify">Foo</div>
      <div>Baa</div>
    
    </body>
    
    <script>
      var F = cartonFactory({ styleTag: document.getElementsByTagName( 'style' )[ 0 ] })
    
      F.add( 
        document.getElementById( 'cartonify' ),
        { type: 'stretch', styles: { background: 'yellow', color: 'orange' }, align: 'center' }
      )
    
      F.add( 
        document.getElementsByTagName( 'div' )[ 1 ],
        { align: 'center', type: 'stretch', styles: { background: 'yellow', color: 'orange' } }
      )
    </script>
    
Aside from the order the second DOM element has exactly the same settings. The factory will 
ignore the order from the second element.    
    
    #cartonify,#carton_1_{display:block;font-size:medium;position:relative;vertical-align:top}
    #cartonify,#carton_1_{background:yellow;color:orange}
    #cartonify,#carton_1_{text-align:center}

This is because the factory combines for code reduce all DOM elements with the same styles to one 
selector. In this example you can also see that if no id attribute is set the factory will create
its own and add it as attribute to the dom element. Instead of id's factory can also use classes
to bind its styles to the DOM by defining a different selector on the initial function call:
    
    ...
    var F = cartonFactory({ styleTag: document.getElementsByTagName( 'style' )[ 0 ], selector: '.' })
    ...

    .stretch_{display:block;font-size:medium;position:relative;vertical-align:top}
    .carton_1_,.carton_2_{background:yellow;color:orange}
    .alignCenter_{text-align:center}

The syntax is now friendlier to read, and a little bit shorter. All classnames will be generated
by the factory and attached to the styles attribute.

## Setup a Factory
Settings where defined in the initial function call of the factory:
  
    var F = cartonFactory({ 
      selector: '.', 
      styleTag: document.getElementsByTagName( 'style' )[ 0 ],
      showGrid: true
    })
  
This is a list of all initial settings a viable:
    
  * **styleTag:** 
    A style tag that should be filled with the parsed styles of the factory. If no
    style tag is defined the factory creates it's own wich can be appended to the DOM.    
  
  * **selector:** ( '.' , '#' ) 
    Define if the factory will use css-classes or id's to bind styling to DOM elements, Default
    is #;   
  
  * **showGrid:** ( true, false ) 
    Outlines all elements based on a cssCarton element. Default is false.
  
  * **extend:** 
    Let you extend the cartonsettings-object inside the factory. For example, if you would like
    to extend the default styles of the cssCarton type slim_ with a font color: 
      
        cartonFactory( { extend: { SLIM: { color: 'pink' } } )
  
  * **once:** 
    Event that is triggerd only once, when styling for an DOM-element is created for the first time: 
      
        cartonFactory( { once: function ( factoryObject, eventname ) { ... } )
     
  * **on:** 
    Event that is triggerd every time a styling for an DOM-element is changed and also when it was created:
        
        cartonFactory( { on: function ( factoryObject, eventname ) { ... } ) 

## Add command 
If the factory is applied you can use the add command to define styling for an dom element and 
attach it to the factory:
  
    F.add( document.getElementById( 'cartonify' ), { styles: color: 'pink } )

The first argument must be a dom node, for the factory to manage. Followed by a settings-object,
that defines how to setup the node. You can add more than one settings-object for a node, as long
as they have the same combination of properties they will be mixed together else the factory will
create for each combination another instance of an cartonObject for that node.


## Properties for the settings-object

  *  **styles:** 
     This is the object that passes all the custom css styling to the factory. You 
     can use camelCase to define css styles that are stitched together with a hyphen. If the 
     value is a pure number 'px' will be added and also browser specific prefixes like -webkit-
     will be added by the factory.

        F.add( 
          document.getElementById( 'cartonify' ), 
          { styles: { color: 'pink', zIndex: '12', 'font-size': 12 } } 
        )
 
  * **type:** 
    Defines the cssCarton element the factory should use.
        
        F.add( 
          document.getElementById( 'cartonify' ), 
          { type: 'fit' }
        ) 
        
  * **align:** ( left, center, right ) 
    Adds the alignment types from cssCarton to the DOM element.
        
        F.add( 
          document.getElementById( 'cartonify' ), 
          { align: left }
        ) 

  * **show:** ( true, false ) 
    Different than the global showGrid setting this outlines each DOM element based on cssCarton 
    individualy if it is set on true.

        F.add( 
          document.getElementById( 'cartonify' ), 
          { show: true }
        ) 

  * **pseudo:** The factory can also handle css pseudo classes and inheritance by defining the 
    pseudo attribute:
    
        F.add( 
          document.getElementById( 'cartonify' ), 
          { styles: { color: 'pink', zIndex: '12', 'font-size': 12 } },
          { styles: { color: 'orange' }, pseudo: ':hover' },
          { styles: { fontWeight: 'strong' }, pseudo: 'strong' } 
        )
    
    If a pseudo attribute is added the styles of a settings-object will only appear in it's 
    context. For the sample above, that means the color will only be orange on a mouse over. And
    the font-weight will only be strong for child-nodes inside the dom element with the nodeName
    strong.   
    
  * **query:**
    With the query attribute you can define styles that only appears if the conditions of an 
    Media Query matches. To define a media query you have to add the query properties as an 
    object inside of an array. Each object is one Media Query:  
 
        F.add( 
           document.getElementById( 'cartonify' ), 
           { type: 'sticker', { fontSize: 32, top: 15, left: 15 } }
           ,
           { type: 'sticker',
             query: { screen: 'all', maxWidth: '320px' } ,
             styles: { fontSize: 16, top: 5, left: 5 } 
           }
        ) 
   
    In the example above the top, left and font-size will be smaller if the browser window width is
    lower than 320px. If an query attribute is defined in the styleTag all styles of it's 
    settings-object will be parsed inside of the media query.

## The rest of the commands

* **parse:** 
  `F.parse()` Will trigger the parse process inside of the Factory, update the provided styletag
  and return an object with the tag and the parsed css-code as a string. { tag: ..., css: ... }. 
  If no styletag was passed in the initial settings the factory will build one and return that 
  without attaching it to the DOM. You can also pass a styletag to the parse command: 
  `F.parse( document.getElementsByTagName( 'style' )[ 0 ] )`

* **get:** 
  Use `F.get()` to search inside the factory for cartonObjects that have specific 
  properties:
    
        F.get( { styles: { color: 'pink' } } )
        
  This will return an array of all cartonObjects that have a pink font-color. You can also 
  define color with the boolean true to get cartonObjects with a color, no matter which value it
  has:
  
        F.get( { styles: { color: true } } )
  
  Or you define color as false to get all cartonObjects without a color inside the styles 
  property. You can also search for cartonObjects that belongs to specific dom-node:
        
        F.get( { dom: document.getElementById( 'cartonify' ), styles: { color: true } } )
  
  If you wanna look for an property that is not an object and you are searching for more than one
  value do this:
        
        F.get( { type: [ 'slim', 'stretch' ] } ) 
  
  This will return all cartonObjects that are the type slim_ or stretch_. You can combine as many
  factory properties as you want to improve your results.    
    
* **set:** 
  You can also add or override properties of existing cartonObjects:
        
        F.set( { styles: { color: pink } }, { styles: { color: 'green' } } ) 
      
  In the first object the search criteria will be defined like in the get command. In the second
  you can add new properties or overwrite an existing. After that it returns a list of all changed
  cartonObjects as an array and the updated css-code as an object.
  
* **remove:** 
  To remove a property you can use remove: 
  
        F.remove( { color: pink } ) 
  
  The removed cartonObjects and the updated css-code will be returned inside of an object.
 
* **index:** 
  You can get two different lists from that command:
        
        F.index( 'dom' )
  
  By passing 'dom' as the first argument all dom-elements managed by the factory will be returned
  as an array.
       
        F.index( 'factories' )
  
  If instead of 'dom', 'factories' is passed the array will contain each cartonObject inside of
  the factory.  
  

* **destroy:** 
  To remove a dom-element with all cartonObjects based on it from the factory use 
  the destroy command:
        
        F.destroy( document.getElementById( 'cartonify' ) )
  The destroy command will return a list  of all destroyed cartonObjects and the updated 
  css-code as a string.

## Compatibility 
cartonFactory does only support modern browsers and Internet Explorer newer than version seven.

# Licence
cssCarton is released under the [MIT License](http://www.opensource.org/licenses/MIT).


## Thanks allot
Comments or ideas are welcome at mathias_prinz@me.com!


