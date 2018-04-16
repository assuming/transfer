/**
 * Rule match types
 * 
 * EQUAL     -> http://github.com/equal.html
 * 
 * PATTERN   -> http://github.com/equal.*
 *              http://github.com/equal.*.js
 *              http://github.com/*.config.js
 * 
 * DIRECTORY -> http://github.com/directory/*
 * 
 * UNKNOWN   -> no match
 */

const EQUAL = 'EQUAL'
const PATTERN = 'PATTERN'
const DIRECTORY = 'DIRECTORY'
const UNKNOWN = 'UNKONWN'