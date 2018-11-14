var
    // The deferred used on DOM ready
    readyList,


    // [[Class]] -> type pairs
    class2type = {},

    // List of deleted data cache ids, so we can reuse them
    core_deletedIds = [],

    core_version = "1.10.2",

    // Save a reference to some core methods
    core_concat = core_deletedIds.concat,
    core_push = core_deletedIds.push,
    core_slice = core_deletedIds.slice,
    core_indexOf = core_deletedIds.indexOf,
    core_toString = class2type.toString,
    core_hasOwn = class2type.hasOwnProperty,
    core_trim = core_version.trim;
var r20 = /%20/g,
    rbracket = /\[\]$/,
    rCRLF = /\r?\n/g,
    rsubmitterTypes = /^(?:submit|button|image|reset|file)$/i,
    rsubmittable = /^(?:input|select|textarea|keygen)/i;

var jQuery = {
    // See test/unit/core.js for details concerning isFunction.
    // Since version 1.3, DOM methods and functions like alert
    // aren't supported. They return false on IE (#2968).
    isFunction: function (obj) {
        return jQuery.type(obj) === "function";
    },

    isArray: Array.isArray || function (obj) {
        return jQuery.type(obj) === "array";
    },

    isWindow: function (obj) {
        /* jshint eqeqeq: false */
        return obj != null && obj == obj.window;
    },

    isNumeric: function (obj) {
        return !isNaN(parseFloat(obj)) && isFinite(obj);
    },

    type: function (obj) {
        if (obj == null) {
            return String(obj);
        }
        return typeof obj === "object" || typeof obj === "function" ?
            class2type[core_toString.call(obj)] || "object" :
            typeof obj;
    },

    isPlainObject: function (obj) {
        var key;

        // Must be an Object.
        // Because of IE, we also have to check the presence of the constructor property.
        // Make sure that DOM nodes and window objects don't pass through, as well
        if (!obj || jQuery.type(obj) !== "object" || obj.nodeType || jQuery.isWindow(obj)) {
            return false;
        }

        try {
            // Not own constructor property must be Object
            if (obj.constructor && !core_hasOwn.call(obj, "constructor") && !core_hasOwn.call(obj.constructor.prototype, "isPrototypeOf")) {
                return false;
            }
        } catch (e) {
            // IE8,9 Will throw exceptions on certain host objects #9897
            return false;
        }

        // Support: IE<9
        // Handle iteration over inherited properties before own properties.
        if (jQuery.support.ownLast) {
            for (key in obj) {
                return core_hasOwn.call(obj, key);
            }
        }

        // Own properties are enumerated firstly, so to speed up,
        // if last one is own, then all properties are own.
        for (key in obj) {
        }

        return key === undefined || core_hasOwn.call(obj, key);
    },

    isEmptyObject: function (obj) {
        var name;
        for (name in obj) {
            return false;
        }
        return true;
    },
    each: function (obj, callback, args) {
        var value,
            i = 0,
            length = obj.length,
            isArray = isArraylike(obj);

        if (args) {
            if (isArray) {
                for (; i < length; i++) {
                    value = callback.apply(obj[i], args);

                    if (value === false) {
                        break;
                    }
                }
            } else {
                for (i in obj) {
                    value = callback.apply(obj[i], args);

                    if (value === false) {
                        break;
                    }
                }
            }

            // A special, fast, case for the most common use of each
        } else {
            if (isArray) {
                for (; i < length; i++) {
                    value = callback.call(obj[i], i, obj[i]);

                    if (value === false) {
                        break;
                    }
                }
            } else {
                for (i in obj) {
                    value = callback.call(obj[i], i, obj[i]);

                    if (value === false) {
                        break;
                    }
                }
            }
        }

        return obj;
    },
    // Use native String.trim function wherever possible
    trim: core_trim && !core_trim.call("\uFEFF\xA0") ?
        function (text) {
            return text == null ?
                "" :
                core_trim.call(text);
        } :

        // Otherwise use our own trimming functionality
        function (text) {
            return text == null ?
                "" :
                ( text + "" ).replace(rtrim, "");
        },

    // results is for internal usage only
    makeArray: function (arr, results) {
        var ret = results || [];

        if (arr != null) {
            if (isArraylike(Object(arr))) {
                jQuery.merge(ret,
                    typeof arr === "string" ?
                        [arr] : arr
                );
            } else {
                core_push.call(ret, arr);
            }
        }

        return ret;
    },

    inArray: function (elem, arr, i) {
        var len;

        if (arr) {
            if (core_indexOf) {
                return core_indexOf.call(arr, elem, i);
            }

            len = arr.length;
            i = i ? i < 0 ? Math.max(0, len + i) : i : 0;

            for (; i < len; i++) {
                // Skip accessing in sparse arrays
                if (i in arr && arr[i] === elem) {
                    return i;
                }
            }
        }

        return -1;
    },

    merge: function (first, second) {
        var l = second.length,
            i = first.length,
            j = 0;

        if (typeof l === "number") {
            for (; j < l; j++) {
                first[i++] = second[j];
            }
        } else {
            while (second[j] !== undefined) {
                first[i++] = second[j++];
            }
        }

        first.length = i;

        return first;
    },
    isMobile: function (str) {
        return jQuery.trim(str) !== '' && /^1[3|4|5|6|7|8|9][0-9]\d{8}$/.test(jQuery.trim(str));
    },
    toFixed: function (number,n) {
        var f = parseInt(n) || 0;
        if( f < -20 || f > 100 ) {
            throw new RangeError("Precision of " + f + " fractional digits is out of range");
        }
        var x = Number(number);
        if( isNaN(x) ) {
            return "NaN";
        }
        var s = "";
        if(x <= 0) {
            s = "-";
            x = -x;
        }
        if( x >= Math.pow(10, 21) ) {
            return s + x.toString();
        }
        var m;
        n = Math.round(x * Math.pow(10, f) );

        if( n == 0 ) {
            m = "0";
        }
        else {
            m =  n.toString();
        }
        if( f == 0 ) {
            return s + m;
        }
        var k = m.length;
        if(k <= f) {
            var z = Math.pow(10, f+1-k).toString().substring(1);
            m = z + m;
            k = f+1;
        }
        if(f > 0) {
            var a = m.substring(0, k-f);
            var b = m.substring(k-f);
            m = a + "." + b;
        }
        return s + m;
    }
};
jQuery.extend = function () {
    var options, name, src, copy, copyIsArray, clone,
        target = arguments[0] || {},
        i = 1,
        length = arguments.length,
        deep = false;
    if (typeof target === "boolean") {
        deep = target;
        target = arguments[1] || {};
        i = 2;
    }
    if (typeof target !== "object" && !jQuery.isFunction(target)) {
        target = {};
    }
    if (length === i) {
        target = this;
        --i;
    }
    for (; i < length; i++) {
        if ((options = arguments[i]) != null) {
            for (name in options) {
                src = target[name];
                copy = options[name];
                if (target === copy) {
                    continue;
                }
                if (deep && copy && ( jQuery.isPlainObject(copy) || (copyIsArray = jQuery.isArray(copy)) )) {
                    if (copyIsArray) {
                        copyIsArray = false;
                        clone = src && jQuery.isArray(src) ? src : [];
                    } else {
                        clone = src && jQuery.isPlainObject(src) ? src : {};
                    }
                    target[name] = jQuery.extend(deep, clone, copy);
                } else if (copy !== undefined) {
                    target[name] = copy;
                }
            }
        }
    }

    return target;
};
jQuery.param = function (a, traditional) {
    var prefix,
        s = [],
        add = function (key, value) {
            // If value is a function, invoke it and return its value
            value = jQuery.isFunction(value) ? value() : ( value == null ? "" : value );
            s[s.length] = encodeURIComponent(key) + "=" + encodeURIComponent(value);
        };

    // Set traditional to true for jQuery <= 1.3.2 behavior.
    if (traditional === undefined) {
        traditional = false;
    }

    // If an array was passed in, assume that it is an array of form elements.
    if (jQuery.isArray(a) || ( a.jquery && !jQuery.isPlainObject(a) )) {
        // Serialize the form elements
        jQuery.each(a, function () {
            add(this.name, this.value);
        });

    } else {
        // If traditional, encode the "old" way (the way 1.3.2 or older
        // did it), otherwise encode params recursively.
        for (prefix in a) {
            buildParams(prefix, a[prefix], traditional, add);
        }
    }

    // Return the resulting serialization
    return s.join("&").replace(r20, "+");
};

function buildParams(prefix, obj, traditional, add) {
    var name;

    if (jQuery.isArray(obj)) {
        // Serialize array item.
        jQuery.each(obj, function (i, v) {
            if (traditional || rbracket.test(prefix)) {
                // Treat each array item as a scalar.
                add(prefix, v);

            } else {
                // Item is non-scalar (array or object), encode its numeric index.
                buildParams(prefix + "[" + ( typeof v === "object" ? i : "" ) + "]", v, traditional, add);
            }
        });

    } else if (!traditional && jQuery.type(obj) === "object") {
        // Serialize object item.
        for (name in obj) {
            buildParams(prefix + "[" + name + "]", obj[name], traditional, add);
        }

    } else {
        // Serialize scalar item.
        add(prefix, obj);
    }
}
function isArraylike(obj) {
    var length = obj.length,
        type = jQuery.type(obj);

    if (jQuery.isWindow(obj)) {
        return false;
    }

    if (obj.nodeType === 1 && length) {
        return true;
    }

    return type === "array" || type !== "function" &&
        ( length === 0 ||
        typeof length === "number" && length > 0 && ( length - 1 ) in obj );
}
module.exports = jQuery;