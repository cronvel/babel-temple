# TOC
   - ['if' syntax](#if-syntax)
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

<a name="escape-syntax"></a>
# escape syntax
escape.

```js
expect( Temple.render( "Just a \\$ \\{} little{{if $test}} test{{/}}." , { test: true } ) ).to.be( "Just a \\$ {} little test." ) ;
expect( Temple.render( "Just a \\$ \\{} little{{if $test}} test{{/}}." , { test: false } ) ).to.be( "Just a \\$ {} little." ) ;
```

