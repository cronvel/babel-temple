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
```

<a name="escape-syntax"></a>
# escape syntax
escape.

```js
expect( Temple.render( "Just a \\$ \\{} little{{if $test}} test{{/}}." , { test: true } ) ).to.be( "Just a \\$ {} little test." ) ;
expect( Temple.render( "Just a \\$ \\{} little{{if $test}} test{{/}}." , { test: false } ) ).to.be( "Just a \\$ {} little." ) ;
```

