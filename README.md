

# Babel Temple

Tiny template engine coupled with babel-tower.
 
# TOC
   - ['if' tag](#if-tag)
   - ['foreach' tag](#foreach-tag)
   - ['let' tag](#let-tag)
   - ['use' tag](#use-tag)
   - ['empty' tag](#empty-tag)
   - [partial rendering: 'call' tag](#partial-rendering-call-tag)
   - [Template library](#template-library)
   - [root context](#root-context)
   - [close syntactic sugar syntax](#close-syntactic-sugar-syntax)
   - [escape syntax](#escape-syntax)
<a name=""></a>
 
<a name="if-tag"></a>
# 'if' tag
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

'if-else' using the close-open syntactic sugar.

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

'if-elseif' using the close-open syntactic sugar.

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

'if-elseif-else' using the close-open syntactic sugar.

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

<a name="foreach-tag"></a>
# 'foreach' tag
'foreach' on an array should iterate over each element.

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

'foreach' on an object should iterate over each property.

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

'foreach' on a non-object should do nothing.

```js
var template ;

var ctx = {
	joe: true ,
} ;

template = Temple.parse( '{{foreach $joe => $key : $value}}${key}: ${value}\n{{/}}' ) ;
expect( template.render( ctx ) ).to.be( "" ) ;

template = Temple.parse( '{{foreach $joe => $value}}${value}\n{{/}}' ) ;
expect( template.render( ctx ) ).to.be( "" ) ;

template = Temple.parse( 'some {{foreach $joe => $key : $value}}${key}: ${value}\n{{/}}text' ) ;
expect( template.render( ctx ) ).to.be( "some text" ) ;
```

<a name="let-tag"></a>
# 'let' tag
'let' tag should create new variable in the current scope.

```js
var template , ctx ;

template = Temple.parse( '{{let $greetings : "Hi"/}}${greetings} ${firstName} ${lastName}{{/}}' ) ;

ctx = {
	firstName: "Joe" ,
	lastName: "Doe"
} ;

expect( template.render( ctx ) ).to.be( "Hi Joe Doe" ) ;
```

only the current context is modified.

```js
var template , ctx ;

template = Temple.parse( '{{use $sub}}{{let $greetings : "Hi"/}}${greetings} ${firstName} ${lastName}\n{{/}}${sub.greetings} ${sub.firstName} ${sub.lastName}\n{{/}}' ) ;

ctx = { sub: {
	greetings: "Hello" ,
	firstName: "Joe" ,
	lastName: "Doe"
} } ;

expect( template.render( ctx ) ).to.be( "Hi Joe Doe\nHello Joe Doe\n" ) ;
expect( ctx ).to.eql( { sub: { greetings: "Hello" , firstName: "Joe" , lastName: "Doe" } } ) ;
```

the original context should be preserved.

```js
var template , ctx ;

template = Temple.parse( '{{let $greetings : "Hi"/}}${greetings} ${firstName} ${lastName}{{/}}' ) ;

ctx = {
	firstName: "Joe" ,
	lastName: "Doe"
} ;

expect( template.render( ctx ) ).to.be( "Hi Joe Doe" ) ;
expect( ctx ).to.eql( { firstName: "Joe" , lastName: "Doe" } ) ;
```

<a name="use-tag"></a>
# 'use' tag
if the variable is an object, it should create a new context inside the tag and render it.

```js
var template , ctx ;

template = Temple.parse( '{{use $path.to.var}}${firstName} ${lastName} of ${city}\n{{/}}' ) ;

ctx = { path: { to: { "var": {
	firstName: "Joe" ,
	lastName: "Doe" ,
	city : "New York"
} } } } ;

expect( template.render( ctx ) ).to.be( "Joe Doe of New York\n" ) ;
```

if the variable is an array, it should should iterate over it, using each element as the context.

```js
var template , ctx ;

template = Temple.parse( '{{use $path.to.var}}${firstName} ${lastName} of ${city}\n{{/}}' ) ;

ctx = { path: { to: { "var": [
	{
		firstName: "Joe" ,
		lastName: "Doe" ,
		city : "New York"
	} ,
	{
		firstName: "Sandra" ,
		lastName: "Murphy" ,
		city : "Los Angeles"
	} 
] } } } ;

expect( template.render( ctx ) ).to.be( "Joe Doe of New York\nSandra Murphy of Los Angeles\n" ) ;
```

if the variable is a non-object truthy value, it should render its inner content.

```js
var template , ctx ;

ctx = { path: { to: { "var": "some string" } } } ;
template = Temple.parse( '{{use $path.to.var}}${firstName} ${lastName} of ${city}\n{{/}}' ) ;

expect( template.render( ctx ) ).to.be( "(undefined) (undefined) of (undefined)\n" ) ;

template = Temple.parse( '{{use $path.to.var}}value: $\n{{/}}' ) ;
expect( template.render( ctx ) ).to.be( "value: some string\n" ) ;
```

if the variable is a falsy value, it should not render its inner content.

```js
var template , ctx ;

template = Temple.parse( '{{use $path.to.var}}${firstName} ${lastName} of ${city}\n{{/}}' ) ;

ctx = { path: { to: { "var": false } } } ;

expect( template.render( ctx ) ).to.be( "" ) ;
```

'use' syntactic sugar: direct variable.

```js
var template , ctx ;

template = Temple.parse( '{{$path.to.var}}${firstName} ${lastName} of ${city}\n{{/}}' ) ;

ctx = { path: { to: { "var": [
	{
		firstName: "Joe" ,
		lastName: "Doe" ,
		city : "New York"
	} ,
	{
		firstName: "Sandra" ,
		lastName: "Murphy" ,
		city : "Los Angeles"
	} 
] } } } ;

expect( template.render( ctx ) ).to.be( "Joe Doe of New York\nSandra Murphy of Los Angeles\n" ) ;
```

'join' tag should be used to join rendering parts.

```js
var template , ctx ;

template = Temple.parse( '{{$path.to.var}}${firstName} ${lastName}{{/join}} and {{/}}' ) ;

ctx = { path: { to: { "var": [] } } } ;
expect( template.render( ctx ) ).to.be( "" ) ;

ctx.path.to.var.push( { firstName: "Joe" , lastName: "Doe" } ) ;
expect( template.render( ctx ) ).to.be( "Joe Doe" ) ;

ctx.path.to.var.push( { firstName: "Sandra" , lastName: "Murphy" } ) ;
expect( template.render( ctx ) ).to.be( "Joe Doe and Sandra Murphy" ) ;

ctx.path.to.var.push( { firstName: "John" , lastName: "Peter" } ) ;
expect( template.render( ctx ) ).to.be( "Joe Doe and Sandra Murphy and John Peter" ) ;
```

<a name="empty-tag"></a>
# 'empty' tag
if the variable is a falsy value, it should render its inner content.

```js
var template , ctx ;

ctx = { path: { to: { "var": false } } } ;
template = Temple.parse( '{{empty $path.to.var}}This is empty.{{/}}' ) ;

expect( template.render( ctx ) ).to.be( "This is empty." ) ;
```

if the variable is a truthy value, it should not render its inner content.

```js
var template , ctx ;

ctx = { path: { to: { "var": true } } } ;
template = Temple.parse( '{{empty $path.to.var}}This is empty.{{/}}' ) ;

expect( template.render( ctx ) ).to.be( "" ) ;
```

an 'empty' tag just after a 'use' tag can omit the variable.

```js
var template , ctx ;

template = Temple.parse( '{{$path.to.var}}{{/empty}}This is empty.{{/}}' ) ;

ctx = { path: { to: { "var": false } } } ;
expect( template.render( ctx ) ).to.be( "This is empty." ) ;

ctx = { path: { to: { "var": true } } } ;
expect( template.render( ctx ) ).to.be( "" ) ;
```

<a name="partial-rendering-call-tag"></a>
# partial rendering: 'call' tag
'call' tag should render a sub-template.

```js
var template , partial , ctx ,
	lib = new Temple.Lib() ;

partial = Temple.parse( '${firstName} ${lastName} of ${city}\n' , { id: 'partial' , lib: lib } ) ;

ctx = { path: { to: { "var": [
	{
		firstName: "Joe" ,
		lastName: "Doe" ,
		city : "New York"
	} ,
	{
		firstName: "Sandra" ,
		lastName: "Murphy" ,
		city : "Los Angeles"
	} 
] } } } ;

template = Temple.parse( '{{$path.to.var}}{{call partial/}}{{/}}' , { lib: lib } ) ;
expect( template.render( ctx ) ).to.be( "Joe Doe of New York\nSandra Murphy of Los Angeles\n" ) ;

template = Temple.parse( '{{call partial $path.to.var[0]/}}' , { lib: lib } ) ;
expect( template.render( ctx ) ).to.be( "Joe Doe of New York\n" ) ;
```

'call' tag '@' syntax.

```js
var template , partial , ctx ,
	lib = new Temple.Lib() ;

partial = Temple.parse( '${firstName} ${lastName} of ${city}\n' , { id: 'partial' , lib: lib } ) ;

ctx = { path: { to: { "var": [
	{
		firstName: "Joe" ,
		lastName: "Doe" ,
		city : "New York"
	} ,
	{
		firstName: "Sandra" ,
		lastName: "Murphy" ,
		city : "Los Angeles"
	} 
] } } } ;

template = Temple.parse( '{{@partial $path.to.var[1]/}}' , { lib: lib } ) ;
expect( template.render( ctx ) ).to.be( "Sandra Murphy of Los Angeles\n" ) ;
```

no root context preservation.

```js
var template , partial , ctx ,
	lib = new Temple.Lib() ;

partial = Temple.parse( '${.greetings} ${firstName} ${lastName} of ${city}\n' , { id: 'partial' , lib: lib } ) ;

ctx = { 
	greetings: 'Hello' ,
	path: { to: { "var": [
		{
			firstName: "Joe" ,
			lastName: "Doe" ,
			city : "New York"
		} ,
		{
			firstName: "Sandra" ,
			lastName: "Murphy" ,
			city : "Los Angeles"
		}
	]
} } } ;

template = Temple.parse( '{{$path.to.var}}{{call partial/}}{{/}}' , { lib: lib } ) ;
expect( template.render( ctx ) ).to.be( "(undefined) Joe Doe of New York\n(undefined) Sandra Murphy of Los Angeles\n" ) ;
```

<a name="template-library"></a>
# Template library
should load all dependencies.

```js
var template , partial , ctx ;

var lib = new Temple.Lib( {
	loadAsync: async function( id ) {
		//console.log( "id:" , id ) ;
		switch ( id ) {
			case 'description' :
				return '{{call greetings/}} ${firstName} ${lastName} of ${city}{{call punctuation}}\n' ;
			case 'greetings' :
				return 'Hello' ;
			case 'punctuation' :
				return '!!!' ;
			default :
				break ;
		}
	}
} ) ;


ctx = { path: { to: { "var": [
	{
		firstName: "Joe" ,
		lastName: "Doe" ,
		city : "New York"
	} ,
	{
		firstName: "Sandra" ,
		lastName: "Murphy" ,
		city : "Los Angeles"
	} 
] } } } ;

template = Temple.parse( '{{call greetings/}}!\n{{$path.to.var}}{{call description/}}\n{{/}}' , { lib: lib } ) ;

lib.loadDependenciesAsync().then( () => {
	expect( template.render( ctx ) ).to.be( "Hello!\nHello Joe Doe of New York!!!\nHello Sandra Murphy of Los Angeles!!!\n" ) ;
	done() ;
} )
.catch( error => done( error ) ) ;
```

<a name="root-context"></a>
# root context
the root context should be accessible using the '$.' variable.

```js
var template , ctx ;

ctx = {
	greetings: "Hello" ,
	path: { to: { "var": [
		{
			firstName: "Joe" ,
			lastName: "Doe" ,
			city : "New York"
		} ,
		{
			firstName: "Sandra" ,
			lastName: "Murphy" ,
			city : "Los Angeles"
		} 
	] } }
} ;

template = Temple.parse( '{{$path.to.var}}${.greetings} ${firstName} ${lastName} of ${city}\n{{/}}' ) ;
expect( template.render( ctx ) ).to.be( "Hello Joe Doe of New York\nHello Sandra Murphy of Los Angeles\n" ) ;

template = Temple.parse( '{{$path}}{{$to.var}}${.greetings} ${firstName} ${lastName} of ${city}\n{{//}}' ) ;
expect( template.render( ctx ) ).to.be( "Hello Joe Doe of New York\nHello Sandra Murphy of Los Angeles\n" ) ;

template = Temple.parse( '{{$path}}{{$to}}{{$var}}${.greetings} ${firstName} ${lastName} of ${city}\n{{///}}' ) ;
expect( template.render( ctx ) ).to.be( "Hello Joe Doe of New York\nHello Sandra Murphy of Los Angeles\n" ) ;
```

<a name="close-syntactic-sugar-syntax"></a>
# close syntactic sugar syntax
close-open syntactic sugar.

```js
expect( Temple.render( "Is it {{if $test}}a test{{/else}}real{{/}}?" , { test: true } ) ).to.be( "Is it a test?" ) ;
expect( Temple.render( "Is it {{if $test}}a test{{/else}}real{{/}}?" , { test: false } ) ).to.be( "Is it real?" ) ;
```

multiple close syntactic sugar.

```js
var template , ctx ;

ctx = {
	path: { to: { "var": {
			firstName: "Joe" ,
			lastName: "Doe" ,
	} } }
} ;

template = Temple.parse( '{{$path}}{{$to}}{{$var}}${firstName} ${lastName}\n{{//}}${to.var.firstName} ${to.var.lastName}\n{{/}}' ) ;
expect( template.render( ctx ) ).to.be( "Joe Doe\nJoe Doe\n" ) ;

template = Temple.parse( '{{$path}}{{$to}}{{$var}}${firstName} ${lastName}\n{{///}}${path.to.var.firstName} ${path.to.var.lastName}\n' ) ;
expect( template.render( ctx ) ).to.be( "Joe Doe\nJoe Doe\n" ) ;
```

<a name="escape-syntax"></a>
# escape syntax
escape.

```js
expect( Temple.render( "Just a \\a \\{} little{{if $test}} test{{/}}." , { test: true } ) ).to.be( "Just a \\a {} little test." ) ;
expect( Temple.render( "Just a \\a \\{} little{{if $test}} test{{/}}." , { test: false } ) ).to.be( "Just a \\a {} little." ) ;
```

