﻿/*!
 * accounting.js v0.4.2
 * Copyright 2014 Open Exchange Rates
 *
 * Freely distributable under the MIT license.
 * Portions of accounting.js are inspired or borrowed from underscore.js
 *
 * Full details and documentation:
 * http://openexchangerates.github.io/accounting.js/
 */

(function (root, undefined) {

    /* --- Setup --- */

    // Create the local library object, to be exported or referenced globally later
    var lib = {};

    // Current version
    lib.version = '0.4.2';


    /* --- Exposed settings --- */

    // The library's settings configuration object. Contains default parameters for
    // currency and number formatting
    lib.settings = {
        currency: {
            symbol: "$",		// default currency symbol is '$'
            format: "%s%v",	// controls output: %s = symbol, %v = value (can be object, see docs)
            decimal: ".",		// decimal point separator
            thousand: ",",		// thousands separator
            precision: 2,		// decimal places
            grouping: 3		// digit grouping (not implemented yet)
        },
        number: {
            precision: 0,		// default precision on numbers is 0
            grouping: 3,		// digit grouping (not implemented yet)
            thousand: ",",
            decimal: "."
        }
    };


    /* --- Internal Helper Methods --- */

    // Store reference to possibly-available ECMAScript 5 methods for later
    var nativeMap = Array.prototype.map,
        nativeIsArray = Array.isArray,
        toString = Object.prototype.toString;


    function isString(obj) {
        return !!(obj === '' || (obj && obj.charCodeAt && obj.substr));
    }


    function isArray(obj) {
        return nativeIsArray ? nativeIsArray(obj) : toString.call(obj) === '[object Array]';
    }


    function isObject(obj) {
        return obj && toString.call(obj) === '[object Object]';
    }


    function defaults(object, defs) {
        var key;
        object = object || {};
        defs = defs || {};
        // Iterate over object non-prototype properties:
        for (key in defs) {
            if (defs.hasOwnProperty(key)) {
                // Replace values with defaults only if undefined (allow empty/zero values):
                if (object[key] == null) object[key] = defs[key];
            }
        }
        return object;
    }


    function map(obj, iterator, context) {
        var results = [], i, j;

        if (!obj) return results;

        // Use native .map method if it exists:
        if (nativeMap && obj.map === nativeMap) return obj.map(iterator, context);

        // Fallback for native .map:
        for (i = 0, j = obj.length; i < j; i++) {
            results[i] = iterator.call(context, obj[i], i, obj);
        }
        return results;
    }
    
    function checkPrecision(val, base) {
        val = Math.round(Math.abs(val));
        return isNaN(val) ? base : val;
    }



    function checkCurrencyFormat(format) {
        var defaults = lib.settings.currency.format;

        // Allow function as format parameter (should return string or object):
        if (typeof format === "function") format = format();

        // Format can be a string, in which case `value` ("%v") must be present:
        if (isString(format) && format.match("%v")) {

            // Create and return positive, negative and zero formats:
            return {
                pos: format,
                neg: format.replace("-", "").replace("%v", "-%v"),
                zero: format
            };

            // If no format, or object is missing valid positive value, use defaults:
        } else if (!format || !format.pos || !format.pos.match("%v")) {

            // If defaults is a string, casts it to an object for faster checking next time:
            return (!isString(defaults)) ? defaults : lib.settings.currency.format = {
                pos: defaults,
                neg: defaults.replace("%v", "-%v"),
                zero: defaults
            };

        }
        // Otherwise, assume format was fine:
        return format;
    }


    /* --- API Methods --- */


    var unformat = lib.unformat = lib.parse = function (value, decimal) {
        // Recursively unformat arrays:
        if (isArray(value)) {
            return map(value, function (val) {
                return unformat(val, decimal);
            });
        }

        // Fails silently (need decent errors):
        value = value || 0;

        // Return the value as-is if it's already a number:
        if (typeof value === "number") return value;

        // Default decimal point comes from settings, but could be set to eg. "," in opts:
        decimal = decimal || lib.settings.number.decimal;

        // Build regex to strip out everything except digits, decimal point and minus sign:
        var regex = new RegExp("[^0-9-" + decimal + "]", ["g"]),
            unformatted = parseFloat(
                ("" + value)
                    .replace(/\((?=\d+)(.*)\)/, "-$1") // replace bracketed values with negatives
                    .replace(regex, '')         // strip out any cruft
                    .replace(decimal, '.')      // make sure decimal point is standard
            );

        // This will fail silently which may cause trouble, let's wait and see:
        return !isNaN(unformatted) ? unformatted : 0;
    };


    var toFixed = lib.toFixed = function (value, precision) {
        precision = checkPrecision(precision, lib.settings.number.precision);

        var exponentialForm = Number(lib.unformat(value) + 'e' + precision);
        var rounded = Math.round(exponentialForm);
        var finalResult = Number(rounded + 'e-' + precision).toFixed(precision);
        return finalResult;
    };



    var formatNumber = lib.formatNumber = lib.format = function (number, precision, thousand, decimal) {
        // Resursively format arrays:
        if (isArray(number)) {
            return map(number, function (val) {
                return formatNumber(val, precision, thousand, decimal);
            });
        }

        // Clean up number:
        number = unformat(number);

        // Build options object from second param (if object) or all params, extending defaults:
        var opts = defaults(
            (isObject(precision) ? precision : {
                precision: precision,
                thousand: thousand,
                decimal: decimal
            }),
            lib.settings.number
        ),

            // Clean up precision
            usePrecision = checkPrecision(opts.precision),

            // Do some calc:
            negative = number < 0 ? "-" : "",
            base = parseInt(toFixed(Math.abs(number || 0), usePrecision), 10) + "",
            mod = base.length > 3 ? base.length % 3 : 0;

        // Format the number:
        return negative + (mod ? base.substr(0, mod) + opts.thousand : "") + base.substr(mod).replace(/(\d{3})(?=\d)/g, "$1" + opts.thousand) + (usePrecision ? opts.decimal + toFixed(Math.abs(number), usePrecision).split('.')[1] : "");
    };



    var formatMoney = lib.formatMoney = function (number, symbol, precision, thousand, decimal, format) {
        // Resursively format arrays:
        if (isArray(number)) {
            return map(number, function (val) {
                return formatMoney(val, symbol, precision, thousand, decimal, format);
            });
        }

        // Clean up number:
        number = unformat(number);

        // Build options object from second param (if object) or all params, extending defaults:
        var opts = defaults(
            (isObject(symbol) ? symbol : {
                symbol: symbol,
                precision: precision,
                thousand: thousand,
                decimal: decimal,
                format: format
            }),
            lib.settings.currency
        ),

            // Check format (returns object with pos, neg and zero):
            formats = checkCurrencyFormat(opts.format),

            // Choose which format to use for this value:
            useFormat = number > 0 ? formats.pos : number < 0 ? formats.neg : formats.zero;

        // Return with currency symbol added:
        return useFormat.replace('%s', opts.symbol).replace('%v', formatNumber(Math.abs(number), checkPrecision(opts.precision), opts.thousand, opts.decimal));
    };



    lib.formatColumn = function (list, symbol, precision, thousand, decimal, format) {
        if (!list || !isArray(list)) return [];

        // Build options object from second param (if object) or all params, extending defaults:
        var opts = defaults(
            (isObject(symbol) ? symbol : {
                symbol: symbol,
                precision: precision,
                thousand: thousand,
                decimal: decimal,
                format: format
            }),
            lib.settings.currency
        ),

            // Check format (returns object with pos, neg and zero), only need pos for now:
            formats = checkCurrencyFormat(opts.format),

            // Whether to pad at start of string or after currency symbol:
            padAfterSymbol = formats.pos.indexOf("%s") < formats.pos.indexOf("%v") ? true : false,

            // Store value for the length of the longest string in the column:
            maxLength = 0,

            // Format the list according to options, store the length of the longest string:
            formatted = map(list, function (val, i) {
                if (isArray(val)) {
                    // Recursively format columns if list is a multi-dimensional array:
                    return lib.formatColumn(val, opts);
                } else {
                    // Clean up the value
                    val = unformat(val);

                    // Choose which format to use for this value (pos, neg or zero):
                    var useFormat = val > 0 ? formats.pos : val < 0 ? formats.neg : formats.zero,

                        // Format this value, push into formatted list and save the length:
                        fVal = useFormat.replace('%s', opts.symbol).replace('%v', formatNumber(Math.abs(val), checkPrecision(opts.precision), opts.thousand, opts.decimal));

                    if (fVal.length > maxLength) maxLength = fVal.length;
                    return fVal;
                }
            });

        // Pad each number in the list and send back the column of numbers:
        return map(formatted, function (val, i) {
            // Only if this is a string (not a nested array, which would have already been padded):
            if (isString(val) && val.length < maxLength) {
                // Depending on symbol position, pad after symbol or at index 0:
                return padAfterSymbol ? val.replace(opts.symbol, opts.symbol + (new Array(maxLength - val.length + 1).join(" "))) : (new Array(maxLength - val.length + 1).join(" ")) + val;
            }
            return val;
        });
    };


    /* --- Module Definition --- */

    // Export accounting for CommonJS. If being loaded as an AMD module, define it as such.
    // Otherwise, just add `accounting` to the global object
    if (typeof exports !== 'undefined') {
        if (typeof module !== 'undefined' && module.exports) {
            exports = module.exports = lib;
        }
        exports.accounting = lib;
    } else if (typeof define === 'function' && define.amd) {
        // Return the library as an AMD module:
        define([], function () {
            return lib;
        });
    } else {
        // Use accounting.noConflict to restore `accounting` back to its original value.
        // Returns a reference to the library's `accounting` object;
        // e.g. `var numbers = accounting.noConflict();`
        lib.noConflict = (function (oldAccounting) {
            return function () {
                // Reset the value of the root's `accounting` variable:
                root.accounting = oldAccounting;
                // Delete the noConflict method:
                lib.noConflict = undefined;
                // Return reference to the library to re-assign it:
                return lib;
            };
        })(root.accounting);

        // Declare `fx` on the root (global/window) object:
        root['accounting'] = lib;
    }

    // Root will be `window` in browser or `global` on the server:
}(this));