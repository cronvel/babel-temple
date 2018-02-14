/*
	Babel Temple

	Copyright (c) 2017 - 2018 Cédric Ronvel

	The MIT License (MIT)

	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:

	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.

	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
*/

"use strict" ;



var Babel = require( 'babel-tower' ) ;
var Temple = require( './Temple.js' ) ;



function Lib( options = {} ) {
	this.babel = options.babel || Lib.defaultBabel ;
	this.templates = {} ;
	this.requirements = new Set() ;
	this.loadAsync = options.loadAsync ;
}

module.exports = Lib ;

Lib.defaultBabel = new Babel() ;



Lib.prototype.get = function get( templateId ) {
	return this.templates[ templateId ] ;
} ;



Lib.prototype.add = function add( template ) {
	this.templates[ template.id ] = template ;

	if ( this.requirements.has( template.id ) ) {
		this.requirements.delete( template.id ) ;
	}
} ;



Lib.prototype.addDependency = function addDependency( templateId ) {
	if ( ! this.templates[ templateId ] ) {
		this.requirements.add( templateId ) ;
	}
} ;



Lib.prototype.loadDependenciesAsync = async function loadDependenciesAsync() {
	var templateId ;

	if ( ! this.loadAsync ) { return ; }

	while ( this.requirements.size ) {
		for ( templateId of this.requirements ) {
			Temple.parse(
				await this.loadAsync( templateId ) ,
				{ id: templateId , lib: this }
			) ;
		}
	}
} ;


