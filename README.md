

# Babel Temple

Tiny template engine coupled with babel-tower.
 
bob
bob
bob
bobby [ { type: 'string', content: '${key}: ${value}\n' } ]
bobby [ { type: 'string', content: '${key}: ${value}\n' } ]
bobby [ { type: 'string', content: '${key}: ${value}\n' } ]
bob
bobby [ { type: 'string', content: '${value}\n' } ]
bobby [ { type: 'string', content: '${value}\n' } ]
bobby [ { type: 'string', content: '${value}\n' } ]
bob
bobby [ { type: 'string', content: '${key}: ${value}\n' } ]
bobby [ { type: 'string', content: '${key}: ${value}\n' } ]
bobby [ { type: 'string', content: '${key}: ${value}\n' } ]
# TOC
   - ['if' syntax](#if-syntax)
   - ['foreach' syntax](#foreach-syntax)
   - [escape syntax](#escape-syntax)
<a name=""></a>
 
<a name="if-syntax"></a>
# 'if' syntax
simple 'if' syntax.

```js
expect( Temple.render( "Just a little{{if $test}} test{{/}}." , { test: true } ) ).to.be( "Just a little test." ) ;
expect( Temple.render( "Just a little{{if $test}} test{{/}}." , { test: false } ) ).to.be( "Just a little." ) ;

expect( Temple.render( 'Just a little{{if $test = "bob"}} test{{/}}.' , { test: true } ) ).to.be( "Just a little." ) ;
expect( Temple.render( 'Just a little{{if $test = "bob"}} test{{/}}.' , { test: "bill" } ) ).to.be( "Just a little." ) ;
expect( Temple.render( 'Just a little{{if $test = "bob"}} test{{/}}.' , { test: "bob" } ) ).to.be( "Just a little test." ) ;

expect( Temple.render( 'Just a little{{if $test > 3}} test{{/}}.' , { test: 1 } ) ).to.be( "Just a little." ) ;
expect( Temple.render( 'Just a little{{if $test > 3}} test{{/}}.' , { test: 5 } ) ).to.be( "Just a little test." ) ;
```

'if-else' syntax.

```js
expect( Temple.render( "Is it {{if $test}}a test{{/}}{{else}}real{{/}}?" , { test: true } ) ).to.be( "Is it a test?" ) ;
expect( Temple.render( "Is it {{if $test}}a test{{/}}{{else}}real{{/}}?" , { test: false } ) ).to.be( "Is it real?" ) ;

// Undocumented behavior.
// It may look strange but is intended: extra content in the middle are usually white-space or newline used for presentation
expect( Temple.render( "Is it {{if $test}}a test{{/}} () {{else}}real{{/}}?" , { test: true } ) ).to.be( "Is it a test () ?" ) ;
expect( Temple.render( "Is it {{if $test}}a test{{/}} () {{else}}real{{/}}?" , { test: false } ) ).to.be( "Is it real () ?" ) ;
```

'if-else' using the close-open syntaxic sugar.

```js
expect( Temple.render( "Is it {{if $test}}a test{{/else}}real{{/}}?" , { test: true } ) ).to.be( "Is it a test?" ) ;
expect( Temple.render( "Is it {{if $test}}a test{{/else}}real{{/}}?" , { test: false } ) ).to.be( "Is it real?" ) ;
```

'if-elseif' syntax.

```js
expect( Temple.render( "It is {{if $value > 0 }}positive{{/}}{{elseif $value < 0}}negative{{/}}." , { value: 3 } ) ).to.be( "It is positive." ) ;
expect( Temple.render( "It is {{if $value > 0 }}positive{{/}}{{elseif $value < 0}}negative{{/}}." , { value: -3 } ) ).to.be( "It is negative." ) ;
expect( Temple.render( "It is {{if $value > 0 }}positive{{/}}{{elseif $value < 0}}negative{{/}}." , { value: 0 } ) ).to.be( "It is ." ) ;
```

'if-elseif' using the close-open syntaxic sugar.

```js
expect( Temple.render( "It is {{if $value > 0 }}positive{{/elseif $value < 0}}negative{{/}}." , { value: 3 } ) ).to.be( "It is positive." ) ;
expect( Temple.render( "It is {{if $value > 0 }}positive{{/elseif $value < 0}}negative{{/}}." , { value: -3 } ) ).to.be( "It is negative." ) ;
expect( Temple.render( "It is {{if $value > 0 }}positive{{/elseif $value < 0}}negative{{/}}." , { value: 0 } ) ).to.be( "It is ." ) ;
```

'if-elseif-else' syntax.

```js
expect( Temple.render( "It is {{if $value > 0 }}positive{{/}}{{elseif $value < 0}}negative{{/}}{{else}}zero{{/}}." , { value: 3 } ) ).to.be( "It is positive." ) ;
expect( Temple.render( "It is {{if $value > 0 }}positive{{/}}{{elseif $value < 0}}negative{{/}}{{else}}zero{{/}}." , { value: -3 } ) ).to.be( "It is negative." ) ;
expect( Temple.render( "It is {{if $value > 0 }}positive{{/}}{{elseif $value < 0}}negative{{/}}{{else}}zero{{/}}." , { value: 0 } ) ).to.be( "It is zero." ) ;
```

'if-elseif-else' using the close-open syntaxic sugar.

```js
expect( Temple.render( "It is {{if $value > 0 }}positive{{/elseif $value < 0}}negative{{/else}}zero{{/}}." , { value: 3 } ) ).to.be( "It is positive." ) ;
expect( Temple.render( "It is {{if $value > 0 }}positive{{/elseif $value < 0}}negative{{/else}}zero{{/}}." , { value: -3 } ) ).to.be( "It is negative." ) ;
expect( Temple.render( "It is {{if $value > 0 }}positive{{/elseif $value < 0}}negative{{/else}}zero{{/}}." , { value: 0 } ) ).to.be( "It is zero." ) ;
```

'if-elseif-else' syntax with multiple 'elseif' tags.

```js
var template = Temple.parse( 'Hello {{if $name = "Robert"}}Bob{{/elseif $name = "Jack"}}Jack{{/elseif $name = "Bill"}}my friend{{/else}}stranger{{/}}!' ) ;

expect( template.render( { name: "Robert" } ) ).to.be( "Hello Bob!" ) ;
expect( template.render( { name: "Jack" } ) ).to.be( "Hello Jack!" ) ;
expect( template.render( { name: "Bill" } ) ).to.be( "Hello my friend!" ) ;
expect( template.render( { name: "Joe" } ) ).to.be( "Hello stranger!" ) ;
```

<a name="foreach-syntax"></a>
# 'foreach' syntax
'foreach' using an array as the source.

```js
var template ;

var ctx = {
	joe: [
		"Joe" ,
		"Doe" ,
		"New York"
	]
} ;

template = Temple.parse( '{{foreach $joe => $key : $value}}${key}: ${value}\n{{/}}' ) ;
expect( template.render( ctx ) ).to.be( "0: Joe\n1: Doe\n2: New York\n" ) ;

template = Temple.parse( '{{foreach $joe => $value}}${value}\n{{/}}' ) ;
expect( template.render( ctx ) ).to.be( "Joe\nDoe\nNew York\n" ) ;
```

'foreach' using an object as the source.

```js
var template ;

var ctx = {
	joe: {
		"first name": "Joe" ,
		"last name": "Doe" ,
		"city" : "New York"
	}
} ;

template = Temple.parse( '{{foreach $joe => $key : $value}}${key}: ${value}\n{{/}}' ) ;
expect( template.render( ctx ) ).to.be( "first name: Joe\nlast name: Doe\ncity: New York\n" ) ;

template = Temple.parse( '{{foreach $joe => $value}}${value}\n{{/}}' ) ;
expect( template.render( ctx ) ).to.be( "Joe\nDoe\nNew York\n" ) ;
```

'key' and 'value' variable should be shadowed inside the tag and restored after it.

```js
var template ;

var ctx = {
	key: "A key" ,
	value: "12k€" ,
	joe: {
		"first name": "Joe" ,
		"last name": "Doe" ,
		"city" : "New York"
	}
} ;

template = Temple.parse( 'key: ${key}\nvalue: ${value}\n{{foreach $joe => $key : $value}}${key}: ${value}\n{{/}}key: ${key}\nvalue: ${value}\n' ) ;
expect( template.render( ctx ) ).to.be( "key: A key\nvalue: 12k€\nfirst name: Joe\nlast name: Doe\ncity: New York\nkey: A key\nvalue: 12k€\n" ) ;
```

<a name="escape-syntax"></a>
# escape syntax
escape.

```js
expect( Temple.render( "Just a \\a \\{} little{{if $test}} test{{/}}." , { test: true } ) ).to.be( "Just a \\a {} little test." ) ;
expect( Temple.render( "Just a \\a \\{} little{{if $test}} test{{/}}." , { test: false } ) ).to.be( "Just a \\a {} little." ) ;
```

