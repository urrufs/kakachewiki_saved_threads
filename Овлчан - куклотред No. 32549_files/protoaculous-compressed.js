var Prototype = {
    Version: "1.5.1.1",
    Browser: {
        IE: !!(window.attachEvent && !window.opera),
        Opera: !!window.opera,
        WebKit: navigator.userAgent.indexOf("AppleWebKit/") > -1,
        Gecko: navigator.userAgent.indexOf("Gecko") > -1 && navigator.userAgent.indexOf("KHTML") == -1
    },
    BrowserFeatures: {
        XPath: !!document.evaluate,
        ElementExtensions: !!window.HTMLElement,
        SpecificElementExtensions: (document.createElement("div").__proto__ !== document.createElement("form").__proto__)
    },
    ScriptFragment: "<script[^>]*>([\\S\\s]*?)</script>",
    JSONFilter: /^\/\*-secure-([\s\S]*)\*\/\s*$/,
    emptyFunction: function() {},
    K: function(A) {
        return A
    }
};
var Class = {
    create: function() {
        return function() {
            this.initialize.apply(this, arguments)
        }
    }
};
var Abstract = new Object();
Object.extend = function(C, B) {
    for (var A in B) {
        C[A] = B[A]
    }
    return C
};
Object.extend(Object, {
    inspect: function(A) {
        try {
            if (A === undefined) {
                return "undefined"
            }
            if (A === null) {
                return "null"
            }
            return A.inspect ? A.inspect() : A.toString()
        } catch (B) {
            if (B instanceof RangeError) {
                return "..."
            }
            throw B
        }
    },
    toJSON: function(D) {
        var C = typeof D;
        switch (C) {
            case "undefined":
            case "function":
            case "unknown":
                return;
            case "boolean":
                return D.toString()
        }
        if (D === null) {
            return "null"
        }
        if (D.toJSON) {
            return D.toJSON()
        }
        if (D.ownerDocument === document) {
            return
        }
        var B = [];
        for (var A in D) {
            var E = Object.toJSON(D[A]);
            if (E !== undefined) {
                B.push(A.toJSON() + ": " + E)
            }
        }
        return "{" + B.join(", ") + "}"
    },
    keys: function(C) {
        var B = [];
        for (var A in C) {
            B.push(A)
        }
        return B
    },
    values: function(A) {
        var C = [];
        for (var B in A) {
            C.push(A[B])
        }
        return C
    },
    clone: function(A) {
        return Object.extend({}, A)
    }
});
Function.prototype.bind = function() {
    var C = this,
        B = $A(arguments),
        A = B.shift();
    return function() {
        return C.apply(A, B.concat($A(arguments)))
    }
};
Function.prototype.bindAsEventListener = function(C) {
    var B = this,
        A = $A(arguments),
        C = A.shift();
    return function(D) {
        return B.apply(C, [D || window.event].concat(A))
    }
};
Object.extend(Number.prototype, {
    toColorPart: function() {
        return this.toPaddedString(2, 16)
    },
    succ: function() {
        return this + 1
    },
    times: function(A) {
        $R(0, this, true).each(A);
        return this
    },
    toPaddedString: function(C, B) {
        var A = this.toString(B || 10);
        return "0".times(C - A.length) + A
    },
    toJSON: function() {
        return isFinite(this) ? this.toString() : "null"
    }
});
Date.prototype.toJSON = function() {
    return "\"" + this.getFullYear() + "-" + (this.getMonth() + 1).toPaddedString(2) + "-" + this.getDate().toPaddedString(2) + "T" + this.getHours().toPaddedString(2) + ":" + this.getMinutes().toPaddedString(2) + ":" + this.getSeconds().toPaddedString(2) + "\""
};
var Try = {
    these: function() {
        var C;
        for (var B = 0, D = arguments.length; B < D; B++) {
            var A = arguments[B];
            try {
                C = A();
                break
            } catch (E) {}
        }
        return C
    }
};
var PeriodicalExecuter = Class.create();
PeriodicalExecuter.prototype = {
    initialize: function(B, A) {
        this.callback = B;
        this.frequency = A;
        this.currentlyExecuting = false;
        this.registerCallback()
    },
    registerCallback: function() {
        this.timer = setInterval(this.onTimerEvent.bind(this), this.frequency * 1000)
    },
    stop: function() {
        if (!this.timer) {
            return
        }
        clearInterval(this.timer);
        this.timer = null
    },
    onTimerEvent: function() {
        if (!this.currentlyExecuting) {
            try {
                this.currentlyExecuting = true;
                this.callback(this)
            } finally {
                this.currentlyExecuting = false
            }
        }
    }
};
Object.extend(String, {
    interpret: function(A) {
        return A == null ? "" : String(A)
    },
    specialChar: {
        "\b": "\\b",
        "\t": "\\t",
        "\n": "\\n",
        "\f": "\\f",
        "\r": "\\r",
        "\\": "\\\\"
    }
});
Object.extend(String.prototype, {
    gsub: function(B, A) {
        var E = "",
            D = this,
            C;
        A = arguments.callee.prepareReplacement(A);
        while (D.length > 0) {
            if (C = D.match(B)) {
                E += D.slice(0, C.index);
                E += String.interpret(A(C));
                D = D.slice(C.index + C[0].length)
            } else {
                E += D, D = ""
            }
        }
        return E
    },
    sub: function(C, B, A) {
        B = this.gsub.prepareReplacement(B);
        A = A === undefined ? 1 : A;
        return this.gsub(C, function(D) {
            if (--A < 0) {
                return D[0]
            }
            return B(D)
        })
    },
    scan: function(B, A) {
        this.gsub(B, A);
        return this
    },
    truncate: function(A, B) {
        A = A || 30;
        B = B === undefined ? "..." : B;
        return this.length > A ? this.slice(0, A - B.length) + B : this
    },
    strip: function() {
        return this.replace(/^\s+/, "").replace(/\s+$/, "")
    },
    stripTags: function() {
        return this.replace(/<\/?[^>]+>/gi, "")
    },
    stripScripts: function() {
        return this.replace(new RegExp(Prototype.ScriptFragment, "img"), "")
    },
    extractScripts: function() {
        var B = new RegExp(Prototype.ScriptFragment, "img");
        var A = new RegExp(Prototype.ScriptFragment, "im");
        return (this.match(B) || []).map(function(C) {
            return (C.match(A) || ["", ""])[1]
        })
    },
    evalScripts: function() {
        return this.extractScripts().map(function(_2e) {
            return eval(_2e)
        })
    },
    escapeHTML: function() {
        var A = arguments.callee;
        A.text.data = this;
        return A.div.innerHTML
    },
    unescapeHTML: function() {
        var A = document.createElement("div");
        A.innerHTML = this.stripTags();
        return A.childNodes[0] ? (A.childNodes.length > 1 ? $A(A.childNodes).inject("", function(C, B) {
            return C + B.nodeValue
        }) : A.childNodes[0].nodeValue) : ""
    },
    toQueryParams: function(A) {
        var B = this.strip().match(/([^?#]*)(#.*)?$/);
        if (!B) {
            return {}
        }
        return B[1].split(A || "&").inject({}, function(F, E) {
            if ((E = E.split("="))[0]) {
                var C = decodeURIComponent(E.shift());
                var D = E.length > 1 ? E.join("=") : E[0];
                if (D != undefined) {
                    D = decodeURIComponent(D)
                }
                if (C in F) {
                    if (F[C].constructor != Array) {
                        F[C] = [F[C]]
                    }
                    F[C].push(D)
                } else {
                    F[C] = D
                }
            }
            return F
        })
    },
    toArray: function() {
        return this.split("")
    },
    succ: function() {
        return this.slice(0, this.length - 1) + String.fromCharCode(this.charCodeAt(this.length - 1) + 1)
    },
    times: function(B) {
        var C = "";
        for (var A = 0; A < B; A++) {
            C += this
        }
        return C
    },
    camelize: function() {
        var D = this.split("-"),
            A = D.length;
        if (A == 1) {
            return D[0]
        }
        var C = this.charAt(0) == "-" ? D[0].charAt(0).toUpperCase() + D[0].substring(1) : D[0];
        for (var B = 1; B < A; B++) {
            C += D[B].charAt(0).toUpperCase() + D[B].substring(1)
        }
        return C
    },
    capitalize: function() {
        return this.charAt(0).toUpperCase() + this.substring(1).toLowerCase()
    },
    underscore: function() {
        return this.gsub(/::/, "/").gsub(/([A-Z]+)([A-Z][a-z])/, "#{1}_#{2}").gsub(/([a-z\d])([A-Z])/, "#{1}_#{2}").gsub(/-/, "_").toLowerCase()
    },
    dasherize: function() {
        return this.gsub(/_/, "-")
    },
    inspect: function(A) {
        var B = this.gsub(/[\x00-\x1f\\]/, function(D) {
            var C = String.specialChar[D[0]];
            return C ? C : "\\u00" + D[0].charCodeAt().toPaddedString(2, 16)
        });
        if (A) {
            return "\"" + B.replace(/"/g, "\\\"") + "\""
        }
        return "'" + B.replace(/'/g, "\\'") + "'"
    },
    toJSON: function() {
        return this.inspect(true)
    },
    unfilterJSON: function(A) {
        return this.sub(A || Prototype.JSONFilter, "#{1}")
    },
    isJSON: function() {
        var A = this.replace(/\\./g, "@").replace(/"[^"\\\n\r]*"/g, "");
        return (/^[,:{}\[\]0-9.\-+Eaeflnr-u \n\r\t]*$/).test(A)
    },
    evalJSON: function(_45) {
        var _46 = this.unfilterJSON();
        try {
            if (!_45 || _46.isJSON()) {
                return eval("(" + _46 + ")")
            }
        } catch (e) {}
        throw new SyntaxError("Badly formed JSON string: " + this.inspect())
    },
    include: function(A) {
        return this.indexOf(A) > -1
    },
    startsWith: function(A) {
        return this.indexOf(A) === 0
    },
    endsWith: function(A) {
        var B = this.length - A.length;
        return B >= 0 && this.lastIndexOf(A) === B
    },
    empty: function() {
        return this == ""
    },
    blank: function() {
        return /^\s*$/.test(this)
    }
});
if (Prototype.Browser.WebKit || Prototype.Browser.IE) {
    Object.extend(String.prototype, {
        escapeHTML: function() {
            return this.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
        },
        unescapeHTML: function() {
            return this.replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
        }
    })
}
String.prototype.gsub.prepareReplacement = function(B) {
    if (typeof B == "function") {
        return B
    }
    var A = new Template(B);
    return function(C) {
        return A.evaluate(C)
    }
};
String.prototype.parseQuery = String.prototype.toQueryParams;
Object.extend(String.prototype.escapeHTML, {
    div: document.createElement("div"),
    text: document.createTextNode("")
});
with(String.prototype.escapeHTML) {
    div.appendChild(text)
}
var Template = Class.create();
Template.Pattern = /(^|.|\r|\n)(#\{(.*?)\})/;
Template.prototype = {
    initialize: function(B, A) {
        this.template = B.toString();
        this.pattern = A || Template.Pattern
    },
    evaluate: function(A) {
        return this.template.gsub(this.pattern, function(C) {
            var B = C[1];
            if (B == "\\") {
                return C[2]
            }
            return B + String.interpret(A[C[3]])
        })
    }
};
var $break = {},
    $continue = new Error("\"throw $continue\" is deprecated, use \"return\" instead");
var Enumerable = {
    each: function(B) {
        var A = 0;
        try {
            this._each(function(D) {
                B(D, A++)
            })
        } catch (C) {
            if (C != $break) {
                throw C
            }
        }
        return this
    },
    eachSlice: function(B, A) {
        var E = -B,
            C = [],
            D = this.toArray();
        while ((E += B) < D.length) {
            C.push(D.slice(E, E + B))
        }
        return C.map(A)
    },
    all: function(B) {
        var A = true;
        this.each(function(D, C) {
            A = A && !!(B || Prototype.K)(D, C);
            if (!A) {
                throw $break
            }
        });
        return A
    },
    any: function(B) {
        var A = false;
        this.each(function(C, D) {
            if (A = !!(B || Prototype.K)(C, D)) {
                throw $break
            }
        });
        return A
    },
    collect: function(B) {
        var A = [];
        this.each(function(D, C) {
            A.push((B || Prototype.K)(D, C))
        });
        return A
    },
    detect: function(B) {
        var A;
        this.each(function(D, C) {
            if (B(D, C)) {
                A = D;
                throw $break
            }
        });
        return A
    },
    findAll: function(A) {
        var B = [];
        this.each(function(D, C) {
            if (A(D, C)) {
                B.push(D)
            }
        });
        return B
    },
    grep: function(B, A) {
        var C = [];
        this.each(function(D, F) {
            var E = D.toString();
            if (E.match(B)) {
                C.push((A || Prototype.K)(D, F))
            }
        });
        return C
    },
    include: function(B) {
        var A = false;
        this.each(function(C) {
            if (C == B) {
                A = true;
                throw $break
            }
        });
        return A
    },
    inGroupsOf: function(B, A) {
        A = A === undefined ? null : A;
        return this.eachSlice(B, function(C) {
            while (C.length < B) {
                C.push(A)
            }
            return C
        })
    },
    inject: function(A, B) {
        this.each(function(D, C) {
            A = B(A, D, C)
        });
        return A
    },
    invoke: function(B) {
        var A = $A(arguments).slice(1);
        return this.map(function(C) {
            return C[B].apply(C, A)
        })
    },
    max: function(B) {
        var A;
        this.each(function(C, D) {
            C = (B || Prototype.K)(C, D);
            if (A == undefined || C >= A) {
                A = C
            }
        });
        return A
    },
    min: function(B) {
        var A;
        this.each(function(D, C) {
            D = (B || Prototype.K)(D, C);
            if (A == undefined || D < A) {
                A = D
            }
        });
        return A
    },
    partition: function(C) {
        var B = [],
            A = [];
        this.each(function(E, D) {
            ((C || Prototype.K)(E, D) ? B : A).push(E)
        });
        return [B, A]
    },
    pluck: function(B) {
        var A = [];
        this.each(function(D, C) {
            A.push(D[B])
        });
        return A
    },
    reject: function(B) {
        var A = [];
        this.each(function(D, C) {
            if (!B(D, C)) {
                A.push(D)
            }
        });
        return A
    },
    sortBy: function(A) {
        return this.map(function(C, B) {
            return {
                value: C,
                criteria: A(C, B)
            }
        }).sort(function(E, D) {
            var C = E.criteria,
                B = D.criteria;
            return C < B ? -1 : C > B ? 1 : 0
        }).pluck("value")
    },
    toArray: function() {
        return this.map()
    },
    zip: function() {
        var C = Prototype.K,
            A = $A(arguments);
        if (typeof A.last() == "function") {
            C = A.pop()
        }
        var B = [this].concat(A).map($A);
        return this.map(function(E, D) {
            return C(B.pluck(D))
        })
    },
    size: function() {
        return this.toArray().length
    },
    inspect: function() {
        return "#<Enumerable:" + this.toArray().inspect() + ">"
    }
};
Object.extend(Enumerable, {
    // map: Enumerable.collect,
    find: Enumerable.detect,
    select: Enumerable.findAll,
    member: Enumerable.include,
    entries: Enumerable.toArray
});
var $A = Array.from = function(D) {
    if (!D) {
        return []
    }
    if (D.toArray) {
        return D.toArray()
    } else {
        var B = [];
        for (var A = 0, C = D.length; A < C; A++) {
            B.push(D[A])
        }
        return B
    }
};
if (Prototype.Browser.WebKit) {
    $A = Array.from = function(D) {
        if (!D) {
            return []
        }
        if (!(typeof D == "function" && D == "[object NodeList]") && D.toArray) {
            return D.toArray()
        } else {
            var B = [];
            for (var A = 0, C = D.length; A < C; A++) {
                B.push(D[A])
            }
            return B
        }
    }
}
Object.extend(Array.prototype, Enumerable);
if (!Array.prototype._reverse) {
    Array.prototype._reverse = Array.prototype.reverse
}
Object.extend(Array.prototype, {
    _each: function(A) {
        for (var B = 0, C = this.length; B < C; B++) {
            A(this[B])
        }
    },
    clear: function() {
        this.length = 0;
        return this
    },
    first: function() {
        return this[0]
    },
    last: function() {
        return this[this.length - 1]
    },
    compact: function() {
        return this.select(function(A) {
            return A != null
        })
    },
    flatten: function() {
        return this.inject([], function(A, B) {
            return A.concat(B && B.constructor == Array ? B.flatten() : [B])
        })
    },
    without: function() {
        var A = $A(arguments);
        return this.select(function(B) {
            return !A.include(B)
        })
    },
    indexOf: function(A) {
        for (var B = 0, C = this.length; B < C; B++) {
            if (this[B] == A) {
                return B
            }
        }
        return -1
    },
    reverse: function(A) {
        return (A !== false ? this : this.toArray())._reverse()
    },
    reduce: function() {
        return this.length > 1 ? this : this[0]
    },
    uniq: function(A) {
        return this.inject([], function(C, D, B) {
            if (0 == B || (A ? C.last() != D : !C.include(D))) {
                C.push(D)
            }
            return C
        })
    },
    clone: function() {
        return [].concat(this)
    },
    size: function() {
        return this.length
    },
    inspect: function() {
        return "[" + this.map(Object.inspect).join(", ") + "]"
    },
    toJSON: function() {
        var A = [];
        this.each(function(C) {
            var B = Object.toJSON(C);
            if (B !== undefined) {
                A.push(B)
            }
        });
        return "[" + A.join(", ") + "]"
    }
});
Array.prototype.toArray = Array.prototype.clone;

function $w(A) {
    A = A.strip();
    return A ? A.split(/\s+/) : []
}
if (Prototype.Browser.Opera) {
    Array.prototype.concat = function() {
        var B = [];
        for (var C = 0, D = this.length; C < D; C++) {
            B.push(this[C])
        }
        for (var C = 0, D = arguments.length; C < D; C++) {
            if (arguments[C].constructor == Array) {
                for (var A = 0, E = arguments[C].length; A < E; A++) {
                    B.push(arguments[C][A])
                }
            } else {
                B.push(arguments[C])
            }
        }
        return B
    }
}
var Hash = function(A) {
    if (A instanceof Hash) {
        this.merge(A)
    } else {
        Object.extend(this, A || {})
    }
};
Object.extend(Hash, {
    toQueryString: function(B) {
        var A = [];
        A.add = arguments.callee.addPair;
        this.prototype._each.call(B, function(D) {
            if (!D.key) {
                return
            }
            var C = D.value;
            if (C && typeof C == "object") {
                if (C.constructor == Array) {
                    C.each(function(E) {
                        A.add(D.key, E)
                    })
                }
                return
            }
            A.add(D.key, C)
        });
        return A.join("&")
    },
    toJSON: function(A) {
        var B = [];
        this.prototype._each.call(A, function(D) {
            var C = Object.toJSON(D.value);
            if (C !== undefined) {
                B.push(D.key.toJSON() + ": " + C)
            }
        });
        return "{" + B.join(", ") + "}"
    }
});
Hash.toQueryString.addPair = function(A, C, B) {
    A = encodeURIComponent(A);
    if (C === undefined) {
        this.push(A)
    } else {
        this.push(A + "=" + (C == null ? "" : encodeURIComponent(C)))
    }
};
Object.extend(Hash.prototype, Enumerable);
Object.extend(Hash.prototype, {
    _each: function(C) {
        for (var B in this) {
            var A = this[B];
            if (A && A == Hash.prototype[B]) {
                continue
            }
            var D = [B, A];
            D.key = B;
            D.value = A;
            C(D)
        }
    },
    keys: function() {
        return this.pluck("key")
    },
    values: function() {
        return this.pluck("value")
    },
    merge: function(A) {
        return $H(A).inject(this, function(C, B) {
            C[B.key] = B.value;
            return C
        })
    },
    remove: function() {
        var B;
        for (var C = 0, D = arguments.length; C < D; C++) {
            var A = this[arguments[C]];
            if (A !== undefined) {
                if (B === undefined) {
                    B = A
                } else {
                    if (B.constructor != Array) {
                        B = [B]
                    }
                    B.push(A)
                }
            }
            delete this[arguments[C]]
        }
        return B
    },
    toQueryString: function() {
        return Hash.toQueryString(this)
    },
    inspect: function() {
        return "#<Hash:{" + this.map(function(A) {
            return A.map(Object.inspect).join(": ")
        }).join(", ") + "}>"
    },
    toJSON: function() {
        return Hash.toJSON(this)
    }
});

function $H(A) {
    if (A instanceof Hash) {
        return A
    }
    return new Hash(A)
}
if (function() {
        var A = 0,
            B = function(D) {
                this.key = D
            };
        B.prototype.key = "foo";
        for (var C in new B("bar")) {
            A++
        }
        return A > 1
    }()) {
    Hash.prototype._each = function(D) {
        var C = [];
        for (var B in this) {
            var A = this[B];
            if ((A && A == Hash.prototype[B]) || C.include(B)) {
                continue
            }
            C.push(B);
            var E = [B, A];
            E.key = B;
            E.value = A;
            D(E)
        }
    }
}
ObjectRange = Class.create();
Object.extend(ObjectRange.prototype, Enumerable);
Object.extend(ObjectRange.prototype, {
    initialize: function(C, A, B) {
        this.start = C;
        this.end = A;
        this.exclusive = B
    },
    _each: function(B) {
        var A = this.start;
        while (this.include(A)) {
            B(A);
            A = A.succ()
        }
    },
    include: function(A) {
        if (A < this.start) {
            return false
        }
        if (this.exclusive) {
            return A < this.end
        }
        return A <= this.end
    }
});
var $R = function(C, B, A) {
    return new ObjectRange(C, B, A)
};
var Ajax = {
    getTransport: function() {
        return Try.these(function() {
            return new XMLHttpRequest()
        }, function() {
            return new ActiveXObject("Msxml2.XMLHTTP")
        }, function() {
            return new ActiveXObject("Microsoft.XMLHTTP")
        }) || false
    },
    activeRequestCount: 0
};
Ajax.Responders = {
    responders: [],
    _each: function(A) {
        this.responders._each(A)
    },
    register: function(A) {
        if (!this.include(A)) {
            this.responders.push(A)
        }
    },
    unregister: function(A) {
        this.responders = this.responders.without(A)
    },
    dispatch: function(C, B, A, D) {
        this.each(function(F) {
            if (typeof F[C] == "function") {
                try {
                    F[C].apply(F, [B, A, D])
                } catch (E) {}
            }
        })
    }
};
Object.extend(Ajax.Responders, Enumerable);
Ajax.Responders.register({
    onCreate: function() {
        Ajax.activeRequestCount++
    },
    onComplete: function() {
        Ajax.activeRequestCount--
    }
});
Ajax.Base = function() {};
Ajax.Base.prototype = {
    setOptions: function(A) {
        this.options = {
            method: "post",
            asynchronous: true,
            contentType: "application/x-www-form-urlencoded",
            encoding: "UTF-8",
            parameters: ""
        };
        Object.extend(this.options, A || {});
        this.options.method = this.options.method.toLowerCase();
        if (typeof this.options.parameters == "string") {
            this.options.parameters = this.options.parameters.toQueryParams()
        }
    }
};
Ajax.Request = Class.create();
Ajax.Request.Events = ["Uninitialized", "Loading", "Loaded", "Interactive", "Complete"];
Ajax.Request.prototype = Object.extend(new Ajax.Base(), {
    _complete: false,
    initialize: function(A, B) {
        this.transport = Ajax.getTransport();
        this.setOptions(B);
        this.request(A)
    },
    request: function(A) {
        this.url = A;
        this.method = this.options.method;
        var B = Object.clone(this.options.parameters);
        if (!["get", "post"].include(this.method)) {
            B["_method"] = this.method;
            this.method = "post"
        }
        this.parameters = B;
        if (B = Hash.toQueryString(B)) {
            if (this.method == "get") {
                this.url += (this.url.include("?") ? "&" : "?") + B
            } else {
                if (/Konqueror|Safari|KHTML/.test(navigator.userAgent)) {
                    B += "&_="
                }
            }
        }
        try {
            if (this.options.onCreate) {
                this.options.onCreate(this.transport)
            }
            Ajax.Responders.dispatch("onCreate", this, this.transport);
            this.transport.open(this.method.toUpperCase(), this.url, this.options.asynchronous);
            if (this.options.asynchronous) {
                setTimeout(function() {
                    this.respondToReadyState(1)
                }.bind(this), 10)
            }
            this.transport.onreadystatechange = this.onStateChange.bind(this);
            this.setRequestHeaders();
            this.body = this.method == "post" ? (this.options.postBody || B) : null;
            this.transport.send(this.body);
            if (!this.options.asynchronous && this.transport.overrideMimeType) {
                this.onStateChange()
            }
        } catch (C) {
            this.dispatchException(C)
        }
    },
    onStateChange: function() {
        var A = this.transport.readyState;
        if (A > 1 && !((A == 4) && this._complete)) {
            this.respondToReadyState(this.transport.readyState)
        }
    },
    setRequestHeaders: function() {
        var D = {
            "X-Requested-With": "XMLHttpRequest",
            "X-Prototype-Version": Prototype.Version,
            "Accept": "text/javascript, text/html, application/xml, text/xml, */*"
        };
        if (this.method == "post") {
            D["Content-type"] = this.options.contentType + (this.options.encoding ? "; charset=" + this.options.encoding : "");
            if (this.transport.overrideMimeType && (navigator.userAgent.match(/Gecko\/(\d{4})/) || [0, 2005])[1] < 2005) {
                D["Connection"] = "close"
            }
        }
        if (typeof this.options.requestHeaders == "object") {
            var B = this.options.requestHeaders;
            if (typeof B.push == "function") {
                for (var C = 0, E = B.length; C < E; C += 2) {
                    D[B[C]] = B[C + 1]
                }
            } else {
                $H(B).each(function(F) {
                    D[F.key] = F.value
                })
            }
        }
        for (var A in D) {
            this.transport.setRequestHeader(A, D[A])
        }
    },
    success: function() {
        return !this.transport.status || (this.transport.status >= 200 && this.transport.status < 300)
    },
    respondToReadyState: function(F) {
        var E = Ajax.Request.Events[F];
        var D = this.transport,
            B = this.evalJSON();
        if (E == "Complete") {
            try {
                this._complete = true;
                (this.options["on" + this.transport.status] || this.options["on" + (this.success() ? "Success" : "Failure")] || Prototype.emptyFunction)(D, B)
            } catch (C) {
                this.dispatchException(C)
            }
            var A = this.getHeader("Content-type");
            if (A && A.strip().match(/^(text|application)\/(x-)?(java|ecma)script(;.*)?$/i)) {
                this.evalResponse()
            }
        }
        try {
            (this.options["on" + E] || Prototype.emptyFunction)(D, B);
            Ajax.Responders.dispatch("on" + E, this, D, B)
        } catch (C) {
            this.dispatchException(C)
        }
        if (E == "Complete") {
            this.transport.onreadystatechange = Prototype.emptyFunction
        }
    },
    getHeader: function(A) {
        try {
            return this.transport.getResponseHeader(A)
        } catch (B) {
            return null
        }
    },
    evalJSON: function() {
        try {
            var B = this.getHeader("X-JSON");
            return B ? B.evalJSON() : null
        } catch (A) {
            return null
        }
    },
    evalResponse: function() {
        try {
            return eval((this.transport.responseText || "").unfilterJSON())
        } catch (e) {
            this.dispatchException(e)
        }
    },
    dispatchException: function(A) {
        (this.options.onException || Prototype.emptyFunction)(this, A);
        Ajax.Responders.dispatch("onException", this, A)
    }
});
Ajax.Updater = Class.create();
Object.extend(Object.extend(Ajax.Updater.prototype, Ajax.Request.prototype), {
    initialize: function(D, A, C) {
        this.container = {
            success: (D.success || D),
            failure: (D.failure || (D.success ? null : D))
        };
        this.transport = Ajax.getTransport();
        this.setOptions(C);
        var B = this.options.onComplete || Prototype.emptyFunction;
        this.options.onComplete = (function(F, E) {
            this.updateContent();
            B(F, E)
        }).bind(this);
        this.request(A)
    },
    updateContent: function() {
        var B = this.container[this.success() ? "success" : "failure"];
        var A = this.transport.responseText;
        if (!this.options.evalScripts) {
            A = A.stripScripts()
        }
        if (B = $(B)) {
            if (this.options.insertion) {
                new this.options.insertion(B, A)
            } else {
                B.update(A)
            }
        }
        if (this.success()) {
            if (this.onComplete) {
                setTimeout(this.onComplete.bind(this), 10)
            }
        }
    }
});
Ajax.PeriodicalUpdater = Class.create();
Ajax.PeriodicalUpdater.prototype = Object.extend(new Ajax.Base(), {
    initialize: function(A, B, C) {
        this.setOptions(C);
        this.onComplete = this.options.onComplete;
        this.frequency = (this.options.frequency || 2);
        this.decay = (this.options.decay || 1);
        this.updater = {};
        this.container = A;
        this.url = B;
        this.start()
    },
    start: function() {
        this.options.onComplete = this.updateComplete.bind(this);
        this.onTimerEvent()
    },
    stop: function() {
        this.updater.options.onComplete = undefined;
        clearTimeout(this.timer);
        (this.onComplete || Prototype.emptyFunction).apply(this, arguments)
    },
    updateComplete: function(A) {
        if (this.options.decay) {
            this.decay = (A.responseText == this.lastText ? this.decay * this.options.decay : 1);
            this.lastText = A.responseText
        }
        this.timer = setTimeout(this.onTimerEvent.bind(this), this.decay * this.frequency * 1000)
    },
    onTimerEvent: function() {
        this.updater = new Ajax.Updater(this.container, this.url, this.options)
    }
});

function $(A) {
    if (arguments.length > 1) {
        for (var B = 0, D = [], C = arguments.length; B < C; B++) {
            D.push($(arguments[B]))
        }
        return D
    }
    if (typeof A == "string") {
        A = document.getElementById(A)
    }
    return Element.extend(A)
}
if (Prototype.BrowserFeatures.XPath) {
    document._getElementsByXPath = function(F, E) {
        var D = [];
        var C = document.evaluate(F, $(E) || document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
        for (var A = 0, B = C.snapshotLength; A < B; A++) {
            D.push(C.snapshotItem(A))
        }
        return D
    };
    document.getElementsByClassName = function(C, A) {
        var B = ".//*[contains(concat(' ', @class, ' '), ' " + C + " ')]";
        return document._getElementsByXPath(B, A)
    }
} else {
    document.getElementsByClassName = function(H, G) {
        var F = ($(G) || document.body).getElementsByTagName("*");
        var E = [],
            A, I = new RegExp("(^|\\s)" + H + "(\\s|$)");
        for (var D = 0, B = F.length; D < B; D++) {
            A = F[D];
            var C = A.className;
            if (C.length == 0) {
                continue
            }
            if (C == H || C.match(I)) {
                E.push(Element.extend(A))
            }
        }
        return E
    }
}
if (!window.Element) {
    var Element = {}
}
Element.extend = function(E) {
    var H = Prototype.BrowserFeatures;
    if (!E || !E.tagName || E.nodeType == 3 || E._extended || H.SpecificElementExtensions || E == window) {
        return E
    }
    var B = {},
        G = E.tagName,
        C = Element.extend.cache,
        D = Element.Methods.ByTag;
    if (!H.ElementExtensions) {
        Object.extend(B, Element.Methods), Object.extend(B, Element.Methods.Simulated)
    }
    if (D[G]) {
        Object.extend(B, D[G])
    }
    for (var A in B) {
        var I = B[A];
        if (typeof I == "function" && !(A in E)) {
            E[A] = C.findOrStore(I)
        }
    }
    E._extended = Prototype.emptyFunction;
    return E
};
Element.extend.cache = {
    findOrStore: function(A) {
        return this[A] = this[A] || function() {
            return A.apply(null, [this].concat($A(arguments)))
        }
    }
};
Element.Methods = {
    visible: function(A) {
        return $(A).style.display != "none"
    },
    toggle: function(A) {
        A = $(A);
        Element[Element.visible(A) ? "hide" : "show"](A);
        return A
    },
    hide: function(A) {
        $(A).style.display = "none";
        return A
    },
    show: function(A) {
        $(A).style.display = "";
        return A
    },
    remove: function(A) {
        A = $(A);
        A.parentNode.removeChild(A);
        return A
    },
    update: function(B, A) {
        A = typeof A == "undefined" ? "" : A.toString();
        $(B).innerHTML = A.stripScripts();
        setTimeout(function() {
            A.evalScripts()
        }, 10);
        return B
    },
    replace: function(B, C) {
        B = $(B);
        C = typeof C == "undefined" ? "" : C.toString();
        if (B.outerHTML) {
            B.outerHTML = C.stripScripts()
        } else {
            var A = B.ownerDocument.createRange();
            A.selectNodeContents(B);
            B.parentNode.replaceChild(A.createContextualFragment(C.stripScripts()), B)
        }
        setTimeout(function() {
            C.evalScripts()
        }, 10);
        return B
    },
    inspect: function(B) {
        B = $(B);
        var A = "<" + B.tagName.toLowerCase();
        $H({
            "id": "id",
            "className": "class"
        }).each(function(F) {
            var D = F.first(),
                E = F.last();
            var C = (B[D] || "").toString();
            if (C) {
                A += " " + E + "=" + C.inspect(true)
            }
        });
        return A + ">"
    },
    recursivelyCollect: function(B, C) {
        B = $(B);
        var A = [];
        while (B = B[C]) {
            if (B.nodeType == 1) {
                A.push(Element.extend(B))
            }
        }
        return A
    },
    ancestors: function(A) {
        return $(A).recursivelyCollect("parentNode")
    },
    descendants: function(A) {
        return $A($(A).getElementsByTagName("*")).each(Element.extend)
    },
    firstDescendant: function(A) {
        A = $(A).firstChild;
        while (A && A.nodeType != 1) {
            A = A.nextSibling
        }
        return $(A)
    },
    immediateDescendants: function(A) {
        if (!(A = $(A).firstChild)) {
            return []
        }
        while (A && A.nodeType != 1) {
            A = A.nextSibling
        }
        if (A) {
            return [A].concat($(A).nextSiblings())
        }
        return []
    },
    previousSiblings: function(A) {
        return $(A).recursivelyCollect("previousSibling")
    },
    nextSiblings: function(A) {
        return $(A).recursivelyCollect("nextSibling")
    },
    siblings: function(A) {
        A = $(A);
        return A.previousSiblings().reverse().concat(A.nextSiblings())
    },
    match: function(A, B) {
        if (typeof B == "string") {
            B = new Selector(B)
        }
        return B.match($(A))
    },
    up: function(D, C, B) {
        D = $(D);
        if (arguments.length == 1) {
            return $(D.parentNode)
        }
        var A = D.ancestors();
        return C ? Selector.findElement(A, C, B) : A[B || 0]
    },
    down: function(C, D, B) {
        C = $(C);
        if (arguments.length == 1) {
            return C.firstDescendant()
        }
        var A = C.descendants();
        return D ? Selector.findElement(A, D, B) : A[B || 0]
    },
    previous: function(A, D, C) {
        A = $(A);
        if (arguments.length == 1) {
            return $(Selector.handlers.previousElementSibling(A))
        }
        var B = A.previousSiblings();
        return D ? Selector.findElement(B, D, C) : B[C || 0]
    },
    next: function(C, B, A) {
        C = $(C);
        if (arguments.length == 1) {
            return $(Selector.handlers.nextElementSibling(C))
        }
        var D = C.nextSiblings();
        return B ? Selector.findElement(D, B, A) : D[A || 0]
    },
    getElementsBySelector: function() {
        var A = $A(arguments),
            B = $(A.shift());
        return Selector.findChildElements(B, A)
    },
    getElementsByClassName: function(B, A) {
        return document.getElementsByClassName(A, B)
    },
    readAttribute: function(D, A) {
        D = $(D);
        if (Prototype.Browser.IE) {
            if (!D.attributes) {
                return null
            }
            var C = Element._attributeTranslations;
            if (C.values[A]) {
                return C.values[A](D, A)
            }
            if (C.names[A]) {
                A = C.names[A]
            }
            var B = D.attributes[A];
            return B ? B.nodeValue : null
        }
        return D.getAttribute(A)
    },
    getHeight: function(A) {
        return $(A).getDimensions().height
    },
    getWidth: function(A) {
        return $(A).getDimensions().width
    },
    classNames: function(A) {
        return new Element.ClassNames(A)
    },
    hasClassName: function(A, C) {
        if (!(A = $(A))) {
            return
        }
        var B = A.className;
        if (B.length == 0) {
            return false
        }
        if (B == C || B.match(new RegExp("(^|\\s)" + C + "(\\s|$)"))) {
            return true
        }
        return false
    },
    addClassName: function(B, A) {
        if (!(B = $(B))) {
            return
        }
        Element.classNames(B).add(A);
        return B
    },
    removeClassName: function(A, B) {
        if (!(A = $(A))) {
            return
        }
        Element.classNames(A).remove(B);
        return A
    },
    toggleClassName: function(B, A) {
        if (!(B = $(B))) {
            return
        }
        Element.classNames(B)[B.hasClassName(A) ? "remove" : "add"](A);
        return B
    },
    observe: function() {
        Event.observe.apply(Event, arguments);
        return $A(arguments).first()
    },
    stopObserving: function() {
        Event.stopObserving.apply(Event, arguments);
        return $A(arguments).first()
    },
    cleanWhitespace: function(C) {
        C = $(C);
        var A = C.firstChild;
        while (A) {
            var B = A.nextSibling;
            if (A.nodeType == 3 && !/\S/.test(A.nodeValue)) {
                C.removeChild(A)
            }
            A = B
        }
        return C
    },
    empty: function(A) {
        return $(A).innerHTML.blank()
    },
    descendantOf: function(B, A) {
        B = $(B), A = $(A);
        while (B = B.parentNode) {
            if (B == A) {
                return true
            }
        }
        return false
    },
    scrollTo: function(A) {
        A = $(A);
        var B = Position.cumulativeOffset(A);
        window.scrollTo(B[0], B[1]);
        return A
    },
    getStyle: function(B, A) {
        B = $(B);
        A = A == "float" ? "cssFloat" : A.camelize();
        var D = B.style[A];
        if (!D) {
            var C = document.defaultView.getComputedStyle(B, null);
            D = C ? C[A] : null
        }
        if (A == "opacity") {
            return D ? parseFloat(D) : 1
        }
        return D == "auto" ? null : D
    },
    getOpacity: function(A) {
        return $(A).getStyle("opacity")
    },
    setStyle: function(B, A, E) {
        B = $(B);
        var D = B.style;
        for (var C in A) {
            if (C == "opacity") {
                B.setOpacity(A[C])
            } else {
                D[(C == "float" || C == "cssFloat") ? (D.styleFloat === undefined ? "cssFloat" : "styleFloat") : (E ? C : C.camelize())] = A[C]
            }
        }
        return B
    },
    setOpacity: function(B, A) {
        B = $(B);
        B.style.opacity = (A == 1 || A === "") ? "" : (A < 0.00001) ? 0 : A;
        return B
    },
    getDimensions: function(H) {
        H = $(H);
        var G = $(H).getStyle("display");
        if (G != "none" && G != null) {
            return {
                width: H.offsetWidth,
                height: H.offsetHeight
            }
        }
        var F = H.style;
        var E = F.visibility;
        var D = F.position;
        var C = F.display;
        F.visibility = "hidden";
        F.position = "absolute";
        F.display = "block";
        var B = H.clientWidth;
        var A = H.clientHeight;
        F.display = C;
        F.position = D;
        F.visibility = E;
        return {
            width: B,
            height: A
        }
    },
    makePositioned: function(A) {
        A = $(A);
        var B = Element.getStyle(A, "position");
        if (B == "static" || !B) {
            A._madePositioned = true;
            A.style.position = "relative";
            if (window.opera) {
                A.style.top = 0;
                A.style.left = 0
            }
        }
        return A
    },
    undoPositioned: function(A) {
        A = $(A);
        if (A._madePositioned) {
            A._madePositioned = undefined;
            A.style.position = A.style.top = A.style.left = A.style.bottom = A.style.right = ""
        }
        return A
    },
    makeClipping: function(A) {
        A = $(A);
        if (A._overflow) {
            return A
        }
        A._overflow = A.style.overflow || "auto";
        if ((Element.getStyle(A, "overflow") || "visible") != "hidden") {
            A.style.overflow = "hidden"
        }
        return A
    },
    undoClipping: function(A) {
        A = $(A);
        if (!A._overflow) {
            return A
        }
        A.style.overflow = A._overflow == "auto" ? "" : A._overflow;
        A._overflow = null;
        return A
    }
};
Object.extend(Element.Methods, {
    childOf: Element.Methods.descendantOf,
    childElements: Element.Methods.immediateDescendants
});
if (Prototype.Browser.Opera) {
    Element.Methods._getStyle = Element.Methods.getStyle;
    Element.Methods.getStyle = function(B, A) {
        switch (A) {
            case "left":
            case "top":
            case "right":
            case "bottom":
                if (Element._getStyle(B, "position") == "static") {
                    return null
                }
            default:
                return Element._getStyle(B, A)
        }
    }
} else {
    if (Prototype.Browser.IE) {
        Element.Methods.getStyle = function(C, B) {
            C = $(C);
            B = (B == "float" || B == "cssFloat") ? "styleFloat" : B.camelize();
            var A = C.style[B];
            if (!A && C.currentStyle) {
                A = C.currentStyle[B]
            }
            if (B == "opacity") {
                if (A = (C.getStyle("filter") || "").match(/alpha\(opacity=(.*)\)/)) {
                    if (A[1]) {
                        return parseFloat(A[1]) / 100
                    }
                }
                return 1
            }
            if (A == "auto") {
                if ((B == "width" || B == "height") && (C.getStyle("display") != "none")) {
                    return C["offset" + B.capitalize()] + "px"
                }
                return null
            }
            return A
        };
        Element.Methods.setOpacity = function(D, C) {
            D = $(D);
            var B = D.getStyle("filter"),
                A = D.style;
            if (C == 1 || C === "") {
                A.filter = B.replace(/alpha\([^\)]*\)/gi, "");
                return D
            } else {
                if (C < 0.00001) {
                    C = 0
                }
            }
            A.filter = B.replace(/alpha\([^\)]*\)/gi, "") + "alpha(opacity=" + (C * 100) + ")";
            return D
        };
        Element.Methods.update = function(C, B) {
            C = $(C);
            B = typeof B == "undefined" ? "" : B.toString();
            var A = C.tagName.toUpperCase();
            if (["THEAD", "TBODY", "TR", "TD"].include(A)) {
                var D = document.createElement("div");
                switch (A) {
                    case "THEAD":
                    case "TBODY":
                        D.innerHTML = "<table><tbody>" + B.stripScripts() + "</tbody></table>";
                        depth = 2;
                        break;
                    case "TR":
                        D.innerHTML = "<table><tbody><tr>" + B.stripScripts() + "</tr></tbody></table>";
                        depth = 3;
                        break;
                    case "TD":
                        D.innerHTML = "<table><tbody><tr><td>" + B.stripScripts() + "</td></tr></tbody></table>";
                        depth = 4
                }
                $A(C.childNodes).each(function(E) {
                    C.removeChild(E)
                });
                depth.times(function() {
                    D = D.firstChild
                });
                $A(D.childNodes).each(function(E) {
                    C.appendChild(E)
                })
            } else {
                C.innerHTML = B.stripScripts()
            }
            setTimeout(function() {
                B.evalScripts()
            }, 10);
            return C
        }
    } else {
        if (Prototype.Browser.Gecko) {
            Element.Methods.setOpacity = function(B, A) {
                B = $(B);
                B.style.opacity = (A == 1) ? 0.999999 : (A === "") ? "" : (A < 0.00001) ? 0 : A;
                return B
            }
        }
    }
}
Element._attributeTranslations = {
    names: {
        colspan: "colSpan",
        rowspan: "rowSpan",
        valign: "vAlign",
        datetime: "dateTime",
        accesskey: "accessKey",
        tabindex: "tabIndex",
        enctype: "encType",
        maxlength: "maxLength",
        readonly: "readOnly",
        longdesc: "longDesc"
    },
    values: {
        _getAttr: function(A, B) {
            return A.getAttribute(B, 2)
        },
        _flag: function(B, A) {
            return $(B).hasAttribute(A) ? A : null
        },
        style: function(A) {
            return A.style.cssText.toLowerCase()
        },
        title: function(B) {
            var A = B.getAttributeNode("title");
            return A.specified ? A.nodeValue : null
        }
    }
};
(function() {
    Object.extend(this, {
        href: this._getAttr,
        src: this._getAttr,
        type: this._getAttr,
        disabled: this._flag,
        checked: this._flag,
        readonly: this._flag,
        multiple: this._flag
    })
}).call(Element._attributeTranslations.values);
Element.Methods.Simulated = {
    hasAttribute: function(D, C) {
        var A = Element._attributeTranslations,
            B;
        C = A.names[C] || C;
        B = $(D).getAttributeNode(C);
        return B && B.specified
    }
};
Element.Methods.ByTag = {};
Object.extend(Element, Element.Methods);
if (!Prototype.BrowserFeatures.ElementExtensions && document.createElement("div").__proto__) {
    window.HTMLElement = {};
    window.HTMLElement.prototype = document.createElement("div").__proto__;
    Prototype.BrowserFeatures.ElementExtensions = true
}
Element.hasAttribute = function(A, B) {
    if (A.hasAttribute) {
        return A.hasAttribute(B)
    }
    return Element.Methods.Simulated.hasAttribute(A, B)
};
Element.addMethods = function(H) {
    var I = Prototype.BrowserFeatures,
        B = Element.Methods.ByTag;
    if (!H) {
        Object.extend(Form, Form.Methods);
        Object.extend(Form.Element, Form.Element.Methods);
        Object.extend(Element.Methods.ByTag, {
            "FORM": Object.clone(Form.Methods),
            "INPUT": Object.clone(Form.Element.Methods),
            "SELECT": Object.clone(Form.Element.Methods),
            "TEXTAREA": Object.clone(Form.Element.Methods)
        })
    }
    if (arguments.length == 2) {
        var G = H;
        H = arguments[1]
    }
    if (!G) {
        Object.extend(Element.Methods, H || {})
    } else {
        if (G.constructor == Array) {
            G.each(E)
        } else {
            E(G)
        }
    }

    function E(F) {
        F = F.toUpperCase();
        if (!Element.Methods.ByTag[F]) {
            Element.Methods.ByTag[F] = {}
        }
        Object.extend(Element.Methods.ByTag[F], H)
    }

    function A(M, O, N) {
        N = N || false;
        var L = Element.extend.cache;
        for (var K in M) {
            var F = M[K];
            if (!N || !(K in O)) {
                O[K] = L.findOrStore(F)
            }
        }
    }

    function C(F) {
        var L;
        var K = {
            "OPTGROUP": "OptGroup",
            "TEXTAREA": "TextArea",
            "P": "Paragraph",
            "FIELDSET": "FieldSet",
            "UL": "UList",
            "OL": "OList",
            "DL": "DList",
            "DIR": "Directory",
            "H1": "Heading",
            "H2": "Heading",
            "H3": "Heading",
            "H4": "Heading",
            "H5": "Heading",
            "H6": "Heading",
            "Q": "Quote",
            "INS": "Mod",
            "DEL": "Mod",
            "A": "Anchor",
            "IMG": "Image",
            "CAPTION": "TableCaption",
            "COL": "TableCol",
            "COLGROUP": "TableCol",
            "THEAD": "TableSection",
            "TFOOT": "TableSection",
            "TBODY": "TableSection",
            "TR": "TableRow",
            "TH": "TableCell",
            "TD": "TableCell",
            "FRAMESET": "FrameSet",
            "IFRAME": "IFrame"
        };
        if (K[F]) {
            L = "HTML" + K[F] + "Element"
        }
        if (window[L]) {
            return window[L]
        }
        L = "HTML" + F + "Element";
        if (window[L]) {
            return window[L]
        }
        L = "HTML" + F.capitalize() + "Element";
        if (window[L]) {
            return window[L]
        }
        window[L] = {};
        window[L].prototype = document.createElement(F).__proto__;
        return window[L]
    }
    if (I.ElementExtensions) {
        A(Element.Methods, HTMLElement.prototype);
        A(Element.Methods.Simulated, HTMLElement.prototype, true)
    }
    if (I.SpecificElementExtensions) {
        for (var J in Element.Methods.ByTag) {
            var D = C(J);
            if (typeof D == "undefined") {
                continue
            }
            A(B[J], D.prototype)
        }
    }
    Object.extend(Element, Element.Methods);
    delete Element.ByTag
};
var Toggle = {
    display: Element.toggle
};
Abstract.Insertion = function(A) {
    this.adjacency = A
};
Abstract.Insertion.prototype = {
    initialize: function(D, C) {
        this.element = $(D);
        this.content = C.stripScripts();
        if (this.adjacency && this.element.insertAdjacentHTML) {
            try {
                this.element.insertAdjacentHTML(this.adjacency, this.content)
            } catch (B) {
                var A = this.element.tagName.toUpperCase();
                if (["TBODY", "TR"].include(A)) {
                    this.insertContent(this.contentFromAnonymousTable())
                } else {
                    throw B
                }
            }
        } else {
            this.range = this.element.ownerDocument.createRange();
            if (this.initializeRange) {
                this.initializeRange()
            }
            this.insertContent([this.range.createContextualFragment(this.content)])
        }
        setTimeout(function() {
            C.evalScripts()
        }, 10)
    },
    contentFromAnonymousTable: function() {
        var A = document.createElement("div");
        A.innerHTML = "<table><tbody>" + this.content + "</tbody></table>";
        return $A(A.childNodes[0].childNodes[0].childNodes)
    }
};
var Insertion = new Object();
Insertion.Before = Class.create();
Insertion.Before.prototype = Object.extend(new Abstract.Insertion("beforeBegin"), {
    initializeRange: function() {
        this.range.setStartBefore(this.element)
    },
    insertContent: function(A) {
        A.each((function(B) {
            this.element.parentNode.insertBefore(B, this.element)
        }).bind(this))
    }
});
Insertion.Top = Class.create();
Insertion.Top.prototype = Object.extend(new Abstract.Insertion("afterBegin"), {
    initializeRange: function() {
        this.range.selectNodeContents(this.element);
        this.range.collapse(true)
    },
    insertContent: function(A) {
        A.reverse(false).each((function(B) {
            this.element.insertBefore(B, this.element.firstChild)
        }).bind(this))
    }
});
Insertion.Bottom = Class.create();
Insertion.Bottom.prototype = Object.extend(new Abstract.Insertion("beforeEnd"), {
    initializeRange: function() {
        this.range.selectNodeContents(this.element);
        this.range.collapse(this.element)
    },
    insertContent: function(A) {
        A.each((function(B) {
            this.element.appendChild(B)
        }).bind(this))
    }
});
Insertion.After = Class.create();
Insertion.After.prototype = Object.extend(new Abstract.Insertion("afterEnd"), {
    initializeRange: function() {
        this.range.setStartAfter(this.element)
    },
    insertContent: function(A) {
        A.each((function(B) {
            this.element.parentNode.insertBefore(B, this.element.nextSibling)
        }).bind(this))
    }
});
Element.ClassNames = Class.create();
Element.ClassNames.prototype = {
    initialize: function(A) {
        this.element = $(A)
    },
    _each: function(A) {
        this.element.className.split(/\s+/).select(function(B) {
            return B.length > 0
        })._each(A)
    },
    set: function(A) {
        this.element.className = A
    },
    add: function(A) {
        if (this.include(A)) {
            return
        }
        this.set($A(this).concat(A).join(" "))
    },
    remove: function(A) {
        if (!this.include(A)) {
            return
        }
        this.set($A(this).without(A).join(" "))
    },
    toString: function() {
        return $A(this).join(" ")
    }
};
Object.extend(Element.ClassNames.prototype, Enumerable);
var Selector = Class.create();
Selector.prototype = {
    initialize: function(A) {
        this.expression = A.strip();
        this.compileMatcher()
    },
    compileMatcher: function() {
        if (Prototype.BrowserFeatures.XPath && !(/\[[\w-]*?:/).test(this.expression)) {
            return this.compileXPathMatcher()
        }
        var e = this.expression,
            ps = Selector.patterns,
            h = Selector.handlers,
            c = Selector.criteria,
            le, p, m;
        if (Selector._cache[e]) {
            this.matcher = Selector._cache[e];
            return
        }
        this.matcher = ["this.matcher = function(root) {", "var r = root, h = Selector.handlers, c = false, n;"];
        while (e && le != e && (/\S/).test(e)) {
            le = e;
            for (var i in ps) {
                p = ps[i];
                if (m = e.match(p)) {
                    this.matcher.push(typeof c[i] == "function" ? c[i](m) : new Template(c[i]).evaluate(m));
                    e = e.replace(m[0], "");
                    break
                }
            }
        }
        this.matcher.push("return h.unique(n);\n}");
        eval(this.matcher.join("\n"));
        Selector._cache[this.expression] = this.matcher
    },
    compileXPathMatcher: function() {
        var E = this.expression,
            F = Selector.patterns,
            B = Selector.xpath,
            D, A;
        if (Selector._cache[E]) {
            this.xpath = Selector._cache[E];
            return
        }
        this.matcher = [".//*"];
        while (E && D != E && (/\S/).test(E)) {
            D = E;
            for (var C in F) {
                if (A = E.match(F[C])) {
                    this.matcher.push(typeof B[C] == "function" ? B[C](A) : new Template(B[C]).evaluate(A));
                    E = E.replace(A[0], "");
                    break
                }
            }
        }
        this.xpath = this.matcher.join("");
        Selector._cache[this.expression] = this.xpath
    },
    findElements: function(A) {
        A = A || document;
        if (this.xpath) {
            return document._getElementsByXPath(this.xpath, A)
        }
        return this.matcher(A)
    },
    match: function(A) {
        return this.findElements(document).include(A)
    },
    toString: function() {
        return this.expression
    },
    inspect: function() {
        return "#<Selector:" + this.expression.inspect() + ">"
    }
};
Object.extend(Selector, {
    _cache: {},
    xpath: {
        descendant: "//*",
        child: "/*",
        adjacent: "/following-sibling::*[1]",
        laterSibling: "/following-sibling::*",
        tagName: function(A) {
            if (A[1] == "*") {
                return ""
            }
            return "[local-name()='" + A[1].toLowerCase() + "' or local-name()='" + A[1].toUpperCase() + "']"
        },
        className: "[contains(concat(' ', @class, ' '), ' #{1} ')]",
        id: "[@id='#{1}']",
        attrPresence: "[@#{1}]",
        attr: function(A) {
            A[3] = A[5] || A[6];
            return new Template(Selector.xpath.operators[A[2]]).evaluate(A)
        },
        pseudo: function(A) {
            var B = Selector.xpath.pseudos[A[1]];
            if (!B) {
                return ""
            }
            if (typeof B === "function") {
                return B(A)
            }
            return new Template(Selector.xpath.pseudos[A[1]]).evaluate(A)
        },
        operators: {
            "=": "[@#{1}='#{3}']",
            "!=": "[@#{1}!='#{3}']",
            "^=": "[starts-with(@#{1}, '#{3}')]",
            "$=": "[substring(@#{1}, (string-length(@#{1}) - string-length('#{3}') + 1))='#{3}']",
            "*=": "[contains(@#{1}, '#{3}')]",
            "~=": "[contains(concat(' ', @#{1}, ' '), ' #{3} ')]",
            "|=": "[contains(concat('-', @#{1}, '-'), '-#{3}-')]"
        },
        pseudos: {
            "first-child": "[not(preceding-sibling::*)]",
            "last-child": "[not(following-sibling::*)]",
            "only-child": "[not(preceding-sibling::* or following-sibling::*)]",
            "empty": "[count(*) = 0 and (count(text()) = 0 or translate(text(), ' \t\r\n', '') = '')]",
            "checked": "[@checked]",
            "disabled": "[@disabled]",
            "enabled": "[not(@disabled)]",
            "not": function(B) {
                var H = B[6],
                    G = Selector.patterns,
                    A = Selector.xpath,
                    F, B, C;
                var E = [];
                while (H && F != H && (/\S/).test(H)) {
                    F = H;
                    for (var D in G) {
                        if (B = H.match(G[D])) {
                            C = typeof A[D] == "function" ? A[D](B) : new Template(A[D]).evaluate(B);
                            E.push("(" + C.substring(1, C.length - 1) + ")");
                            H = H.replace(B[0], "");
                            break
                        }
                    }
                }
                return "[not(" + E.join(" and ") + ")]"
            },
            "nth-child": function(A) {
                return Selector.xpath.pseudos.nth("(count(./preceding-sibling::*) + 1) ", A)
            },
            "nth-last-child": function(A) {
                return Selector.xpath.pseudos.nth("(count(./following-sibling::*) + 1) ", A)
            },
            "nth-of-type": function(A) {
                return Selector.xpath.pseudos.nth("position() ", A)
            },
            "nth-last-of-type": function(A) {
                return Selector.xpath.pseudos.nth("(last() + 1 - position()) ", A)
            },
            "first-of-type": function(A) {
                A[6] = "1";
                return Selector.xpath.pseudos["nth-of-type"](A)
            },
            "last-of-type": function(A) {
                A[6] = "1";
                return Selector.xpath.pseudos["nth-last-of-type"](A)
            },
            "only-of-type": function(A) {
                var B = Selector.xpath.pseudos;
                return B["first-of-type"](A) + B["last-of-type"](A)
            },
            nth: function(E, C) {
                var F, G = C[6],
                    B;
                if (G == "even") {
                    G = "2n+0"
                }
                if (G == "odd") {
                    G = "2n+1"
                }
                if (F = G.match(/^(\d+)$/)) {
                    return "[" + E + "= " + F[1] + "]"
                }
                if (F = G.match(/^(-?\d*)?n(([+-])(\d+))?/)) {
                    if (F[1] == "-") {
                        F[1] = -1
                    }
                    var D = F[1] ? Number(F[1]) : 1;
                    var A = F[2] ? Number(F[2]) : 0;
                    B = "[((#{fragment} - #{b}) mod #{a} = 0) and " + "((#{fragment} - #{b}) div #{a} >= 0)]";
                    return new Template(B).evaluate({
                        fragment: E,
                        a: D,
                        b: A
                    })
                }
            }
        }
    },
    criteria: {
        tagName: "n = h.tagName(n, r, \"#{1}\", c);   c = false;",
        className: "n = h.className(n, r, \"#{1}\", c); c = false;",
        id: "n = h.id(n, r, \"#{1}\", c);        c = false;",
        attrPresence: "n = h.attrPresence(n, r, \"#{1}\"); c = false;",
        attr: function(A) {
            A[3] = (A[5] || A[6]);
            return new Template("n = h.attr(n, r, \"#{1}\", \"#{3}\", \"#{2}\"); c = false;").evaluate(A)
        },
        pseudo: function(A) {
            if (A[6]) {
                A[6] = A[6].replace(/"/g, "\\\"")
            }
            return new Template("n = h.pseudo(n, \"#{1}\", \"#{6}\", r, c); c = false;").evaluate(A)
        },
        descendant: "c = \"descendant\";",
        child: "c = \"child\";",
        adjacent: "c = \"adjacent\";",
        laterSibling: "c = \"laterSibling\";"
    },
    patterns: {
        laterSibling: /^\s*~\s*/,
        child: /^\s*>\s*/,
        adjacent: /^\s*\+\s*/,
        descendant: /^\s/,
        tagName: /^\s*(\*|[\w\-]+)(\b|$)?/,
        id: /^#([\w\-\*]+)(\b|$)/,
        className: /^\.([\w\-\*]+)(\b|$)/,
        pseudo: /^:((first|last|nth|nth-last|only)(-child|-of-type)|empty|checked|(en|dis)abled|not)(\((.*?)\))?(\b|$|\s|(?=:))/,
        attrPresence: /^\[([\w]+)\]/,
        attr: /\[((?:[\w-]*:)?[\w-]+)\s*(?:([!^$*~|]?=)\s*((['"])([^\]]*?)\4|([^'"][^\]]*?)))?\]/
    },
    handlers: {
        concat: function(B, A) {
            for (var C = 0, D; D = A[C]; C++) {
                B.push(D)
            }
            return B
        },
        mark: function(A) {
            for (var B = 0, C; C = A[B]; B++) {
                C._counted = true
            }
            return A
        },
        unmark: function(A) {
            for (var B = 0, C; C = A[B]; B++) {
                C._counted = undefined
            }
            return A
        },
        index: function(A, F, E) {
            A._counted = true;
            if (F) {
                for (var D = A.childNodes, C = D.length - 1, B = 1; C >= 0; C--) {
                    node = D[C];
                    if (node.nodeType == 1 && (!E || node._counted)) {
                        node.nodeIndex = B++
                    }
                }
            } else {
                for (var C = 0, B = 1, D = A.childNodes; node = D[C]; C++) {
                    if (node.nodeType == 1 && (!E || node._counted)) {
                        node.nodeIndex = B++
                    }
                }
            }
        },
        unique: function(D) {
            if (D.length == 0) {
                return D
            }
            var C = [],
                E;
            for (var B = 0, A = D.length; B < A; B++) {
                if (!(E = D[B])._counted) {
                    E._counted = true;
                    C.push(Element.extend(E))
                }
            }
            return Selector.handlers.unmark(C)
        },
        descendant: function(E) {
            var C = Selector.handlers;
            for (var B = 0, A = [], D; D = E[B]; B++) {
                C.concat(A, D.getElementsByTagName("*"))
            }
            return A
        },
        child: function(F) {
            var E = Selector.handlers;
            for (var D = 0, C = [], G; G = F[D]; D++) {
                for (var A = 0, B = [], H; H = G.childNodes[A]; A++) {
                    if (H.nodeType == 1 && H.tagName != "!") {
                        C.push(H)
                    }
                }
            }
            return C
        },
        adjacent: function(A) {
            for (var C = 0, B = [], E; E = A[C]; C++) {
                var D = this.nextElementSibling(E);
                if (D) {
                    B.push(D)
                }
            }
            return B
        },
        laterSibling: function(A) {
            var D = Selector.handlers;
            for (var C = 0, B = [], E; E = A[C]; C++) {
                D.concat(B, Element.nextSiblings(E))
            }
            return B
        },
        nextElementSibling: function(A) {
            while (A = A.nextSibling) {
                if (A.nodeType == 1) {
                    return A
                }
            }
            return null
        },
        previousElementSibling: function(A) {
            while (A = A.previousSibling) {
                if (A.nodeType == 1) {
                    return A
                }
            }
            return null
        },
        tagName: function(E, A, H, G) {
            H = H.toUpperCase();
            var F = [],
                C = Selector.handlers;
            if (E) {
                if (G) {
                    if (G == "descendant") {
                        for (var B = 0, D; D = E[B]; B++) {
                            C.concat(F, D.getElementsByTagName(H))
                        }
                        return F
                    } else {
                        E = this[G](E)
                    }
                    if (H == "*") {
                        return E
                    }
                }
                for (var B = 0, D; D = E[B]; B++) {
                    if (D.tagName.toUpperCase() == H) {
                        F.push(D)
                    }
                }
                return F
            } else {
                return A.getElementsByTagName(H)
            }
        },
        id: function(B, A, H, G) {
            var F = $(H),
                D = Selector.handlers;
            if (!B && A == document) {
                return F ? [F] : []
            }
            if (B) {
                if (G) {
                    if (G == "child") {
                        for (var C = 0, E; E = B[C]; C++) {
                            if (F.parentNode == E) {
                                return [F]
                            }
                        }
                    } else {
                        if (G == "descendant") {
                            for (var C = 0, E; E = B[C]; C++) {
                                if (Element.descendantOf(F, E)) {
                                    return [F]
                                }
                            }
                        } else {
                            if (G == "adjacent") {
                                for (var C = 0, E; E = B[C]; C++) {
                                    if (Selector.handlers.previousElementSibling(F) == E) {
                                        return [F]
                                    }
                                }
                            } else {
                                B = D[G](B)
                            }
                        }
                    }
                }
                for (var C = 0, E; E = B[C]; C++) {
                    if (E == F) {
                        return [F]
                    }
                }
                return []
            }
            return (F && Element.descendantOf(F, A)) ? [F] : []
        },
        className: function(B, A, D, C) {
            if (B && C) {
                B = this[C](B)
            }
            return Selector.handlers.byClassName(B, A, D)
        },
        byClassName: function(G, B, C) {
            if (!G) {
                G = Selector.handlers.descendant([B])
            }
            var F = " " + C + " ";
            for (var E = 0, D = [], H, A; H = G[E]; E++) {
                A = H.className;
                if (A.length == 0) {
                    continue
                }
                if (A == C || (" " + A + " ").include(F)) {
                    D.push(H)
                }
            }
            return D
        },
        attrPresence: function(C, B, A) {
            var F = [];
            for (var D = 0, E; E = C[D]; D++) {
                if (Element.hasAttribute(E, A)) {
                    F.push(E)
                }
            }
            return F
        },
        attr: function(F, H, D, J, I) {
            if (!F) {
                F = H.getElementsByTagName("*")
            }
            var G = Selector.operators[I],
                B = [];
            for (var C = 0, A; A = F[C]; C++) {
                var E = Element.readAttribute(A, D);
                if (E === null) {
                    continue
                }
                if (G(E, J)) {
                    B.push(A)
                }
            }
            return B
        },
        pseudo: function(E, C, D, A, B) {
            if (E && B) {
                E = this[B](E)
            }
            if (!E) {
                E = A.getElementsByTagName("*")
            }
            return Selector.pseudos[C](E, D, A)
        }
    },
    pseudos: {
        "first-child": function(C, B, A) {
            for (var E = 0, D = [], F; F = C[E]; E++) {
                if (Selector.handlers.previousElementSibling(F)) {
                    continue
                }
                D.push(F)
            }
            return D
        },
        "last-child": function(F, E, A) {
            for (var C = 0, B = [], D; D = F[C]; C++) {
                if (Selector.handlers.nextElementSibling(D)) {
                    continue
                }
                B.push(D)
            }
            return B
        },
        "only-child": function(G, F, A) {
            var D = Selector.handlers;
            for (var C = 0, B = [], E; E = G[C]; C++) {
                if (!D.previousElementSibling(E) && !D.nextElementSibling(E)) {
                    B.push(E)
                }
            }
            return B
        },
        "nth-child": function(C, B, A) {
            return Selector.pseudos.nth(C, B, A)
        },
        "nth-last-child": function(C, B, A) {
            return Selector.pseudos.nth(C, B, A, true)
        },
        "nth-of-type": function(C, A, B) {
            return Selector.pseudos.nth(C, A, B, false, true)
        },
        "nth-last-of-type": function(C, B, A) {
            return Selector.pseudos.nth(C, B, A, true, true)
        },
        "first-of-type": function(A, C, B) {
            return Selector.pseudos.nth(A, "1", B, false, true)
        },
        "last-of-type": function(C, B, A) {
            return Selector.pseudos.nth(C, "1", A, true, true)
        },
        "only-of-type": function(C, B, A) {
            var D = Selector.pseudos;
            return D["last-of-type"](D["first-of-type"](C, B, A), B, A)
        },
        getIndices: function(C, A, B) {
            if (C == 0) {
                return A > 0 ? [A] : []
            }
            return $R(1, B).inject([], function(D, E) {
                if (0 == (E - A) % C && (E - A) / C >= 0) {
                    D.push(E)
                }
                return D
            })
        },
        nth: function(M, L, O, K, J) {
            if (M.length == 0) {
                return []
            }
            if (L == "even") {
                L = "2n+0"
            }
            if (L == "odd") {
                L = "2n+1"
            }
            var I = Selector.handlers,
                H = [],
                A = [],
                C;
            I.mark(M);
            for (var G = 0, B; B = M[G]; G++) {
                if (!B.parentNode._counted) {
                    I.index(B.parentNode, K, J);
                    A.push(B.parentNode)
                }
            }
            if (L.match(/^\d+$/)) {
                L = Number(L);
                for (var G = 0, B; B = M[G]; G++) {
                    if (B.nodeIndex == L) {
                        H.push(B)
                    }
                }
            } else {
                if (C = L.match(/^(-?\d*)?n(([+-])(\d+))?/)) {
                    if (C[1] == "-") {
                        C[1] = -1
                    }
                    var P = C[1] ? Number(C[1]) : 1;
                    var N = C[2] ? Number(C[2]) : 0;
                    var E = Selector.pseudos.getIndices(P, N, M.length);
                    for (var G = 0, B, D = E.length; B = M[G]; G++) {
                        for (var F = 0; F < D; F++) {
                            if (B.nodeIndex == E[F]) {
                                H.push(B)
                            }
                        }
                    }
                }
            }
            I.unmark(M);
            I.unmark(A);
            return H
        },
        "empty": function(B, F, A) {
            for (var D = 0, C = [], E; E = B[D]; D++) {
                if (E.tagName == "!" || (E.firstChild && !E.innerHTML.match(/^\s*$/))) {
                    continue
                }
                C.push(E)
            }
            return C
        },
        "not": function(E, C, I) {
            var H = Selector.handlers,
                J, D;
            var A = new Selector(C).findElements(I);
            H.mark(A);
            for (var G = 0, F = [], B; B = E[G]; G++) {
                if (!B._counted) {
                    F.push(B)
                }
            }
            H.unmark(A);
            return F
        },
        "enabled": function(A, F, B) {
            for (var D = 0, C = [], E; E = A[D]; D++) {
                if (!E.disabled) {
                    C.push(E)
                }
            }
            return C
        },
        "disabled": function(F, E, A) {
            for (var C = 0, B = [], D; D = F[C]; C++) {
                if (D.disabled) {
                    B.push(D)
                }
            }
            return B
        },
        "checked": function(F, E, A) {
            for (var C = 0, B = [], D; D = F[C]; C++) {
                if (D.checked) {
                    B.push(D)
                }
            }
            return B
        }
    },
    operators: {
        "=": function(B, A) {
            return B == A
        },
        "!=": function(B, A) {
            return B != A
        },
        "^=": function(B, A) {
            return B.startsWith(A)
        },
        "$=": function(B, A) {
            return B.endsWith(A)
        },
        "*=": function(B, A) {
            return B.include(A)
        },
        "~=": function(B, A) {
            return (" " + B + " ").include(" " + A + " ")
        },
        "|=": function(B, A) {
            return ("-" + B.toUpperCase() + "-").include("-" + A.toUpperCase() + "-")
        }
    },
    matchElements: function(G, F) {
        var E = new Selector(F).findElements(),
            D = Selector.handlers;
        D.mark(E);
        for (var C = 0, B = [], A; A = G[C]; C++) {
            if (A._counted) {
                B.push(A)
            }
        }
        D.unmark(E);
        return B
    },
    findElement: function(C, B, A) {
        if (typeof B == "number") {
            A = B;
            B = false
        }
        return Selector.matchElements(C, B || "*")[A || 0]
    },
    findChildElements: function(E, D) {
        var C = D.join(","),
            D = [];
        C.scan(/(([\w#:.~>+()\s-]+|\*|\[.*?\])+)\s*(,|$)/, function(I) {
            D.push(I[1].strip())
        });
        var H = [],
            G = Selector.handlers;
        for (var F = 0, B = D.length, A; F < B; F++) {
            A = new Selector(D[F].strip());
            G.concat(H, A.findElements(E))
        }
        return (B > 1) ? G.unique(H) : H
    }
});

function $$() {
    return Selector.findChildElements(document, $A(arguments))
}
var Form = {
    reset: function(A) {
        $(A).reset();
        return A
    },
    serializeElements: function(B, A) {
        var C = B.inject({}, function(G, F) {
            if (!F.disabled && F.name) {
                var D = F.name,
                    E = $(F).getValue();
                if (E != null) {
                    if (D in G) {
                        if (G[D].constructor != Array) {
                            G[D] = [G[D]]
                        }
                        G[D].push(E)
                    } else {
                        G[D] = E
                    }
                }
            }
            return G
        });
        return A ? C : Hash.toQueryString(C)
    }
};
Form.Methods = {
    serialize: function(A, B) {
        return Form.serializeElements(Form.getElements(A), B)
    },
    getElements: function(A) {
        return $A($(A).getElementsByTagName("*")).inject([], function(C, B) {
            if (Form.Element.Serializers[B.tagName.toLowerCase()]) {
                C.push(Element.extend(B))
            }
            return C
        })
    },
    getInputs: function(G, B, D) {
        G = $(G);
        var A = G.getElementsByTagName("input");
        if (!B && !D) {
            return $A(A).map(Element.extend)
        }
        for (var E = 0, H = [], F = A.length; E < F; E++) {
            var C = A[E];
            if ((B && C.type != B) || (D && C.name != D)) {
                continue
            }
            H.push(Element.extend(C))
        }
        return H
    },
    disable: function(A) {
        A = $(A);
        Form.getElements(A).invoke("disable");
        return A
    },
    enable: function(A) {
        A = $(A);
        Form.getElements(A).invoke("enable");
        return A
    },
    findFirstElement: function(A) {
        return $(A).getElements().find(function(B) {
            return B.type != "hidden" && !B.disabled && ["input", "select", "textarea"].include(B.tagName.toLowerCase())
        })
    },
    focusFirstElement: function(A) {
        A = $(A);
        A.findFirstElement().activate();
        return A
    },
    request: function(A, C) {
        A = $(A), C = Object.clone(C || {});
        var B = C.parameters;
        C.parameters = A.serialize(true);
        if (B) {
            if (typeof B == "string") {
                B = B.toQueryParams()
            }
            Object.extend(C.parameters, B)
        }
        if (A.hasAttribute("method") && !C.method) {
            C.method = A.method
        }
        return new Ajax.Request(A.readAttribute("action"), C)
    }
};
Form.Element = {
    focus: function(A) {
        $(A).focus();
        return A
    },
    select: function(A) {
        $(A).select();
        return A
    }
};
Form.Element.Methods = {
    serialize: function(B) {
        B = $(B);
        if (!B.disabled && B.name) {
            var A = B.getValue();
            if (A != undefined) {
                var C = {};
                C[B.name] = A;
                return Hash.toQueryString(C)
            }
        }
        return ""
    },
    getValue: function(A) {
        A = $(A);
        var B = A.tagName.toLowerCase();
        return Form.Element.Serializers[B](A)
    },
    clear: function(A) {
        $(A).value = "";
        return A
    },
    present: function(A) {
        return $(A).value != ""
    },
    activate: function(A) {
        A = $(A);
        try {
            A.focus();
            if (A.select && (A.tagName.toLowerCase() != "input" || !["button", "reset", "submit"].include(A.type))) {
                A.select()
            }
        } catch (B) {}
        return A
    },
    disable: function(A) {
        A = $(A);
        A.blur();
        A.disabled = true;
        return A
    },
    enable: function(A) {
        A = $(A);
        A.disabled = false;
        return A
    }
};
var Field = Form.Element;
var $F = Form.Element.Methods.getValue;
Form.Element.Serializers = {
    input: function(A) {
        switch (A.type.toLowerCase()) {
            case "checkbox":
            case "radio":
                return Form.Element.Serializers.inputSelector(A);
            default:
                return Form.Element.Serializers.textarea(A)
        }
    },
    inputSelector: function(A) {
        return A.checked ? A.value : null
    },
    textarea: function(A) {
        return A.value
    },
    select: function(A) {
        return this[A.type == "select-one" ? "selectOne" : "selectMany"](A)
    },
    selectOne: function(B) {
        var A = B.selectedIndex;
        return A >= 0 ? this.optionValue(B.options[A]) : null
    },
    selectMany: function(E) {
        var D, C = E.length;
        if (!C) {
            return null
        }
        for (var B = 0, D = []; B < C; B++) {
            var A = E.options[B];
            if (A.selected) {
                D.push(this.optionValue(A))
            }
        }
        return D
    },
    optionValue: function(A) {
        return Element.extend(A).hasAttribute("value") ? A.value : A.text
    }
};
Abstract.TimedObserver = function() {};
Abstract.TimedObserver.prototype = {
    initialize: function(C, B, A) {
        this.frequency = B;
        this.element = $(C);
        this.callback = A;
        this.lastValue = this.getValue();
        this.registerCallback()
    },
    registerCallback: function() {
        setInterval(this.onTimerEvent.bind(this), this.frequency * 1000)
    },
    onTimerEvent: function() {
        var B = this.getValue();
        var A = ("string" == typeof this.lastValue && "string" == typeof B ? this.lastValue != B : String(this.lastValue) != String(B));
        if (A) {
            this.callback(this.element, B);
            this.lastValue = B
        }
    }
};
Form.Element.Observer = Class.create();
Form.Element.Observer.prototype = Object.extend(new Abstract.TimedObserver(), {
    getValue: function() {
        return Form.Element.getValue(this.element)
    }
});
Form.Observer = Class.create();
Form.Observer.prototype = Object.extend(new Abstract.TimedObserver(), {
    getValue: function() {
        return Form.serialize(this.element)
    }
});
Abstract.EventObserver = function() {};
Abstract.EventObserver.prototype = {
    initialize: function(B, A) {
        this.element = $(B);
        this.callback = A;
        this.lastValue = this.getValue();
        if (this.element.tagName.toLowerCase() == "form") {
            this.registerFormCallbacks()
        } else {
            this.registerCallback(this.element)
        }
    },
    onElementEvent: function() {
        var A = this.getValue();
        if (this.lastValue != A) {
            this.callback(this.element, A);
            this.lastValue = A
        }
    },
    registerFormCallbacks: function() {
        Form.getElements(this.element).each(this.registerCallback.bind(this))
    },
    registerCallback: function(A) {
        if (A.type) {
            switch (A.type.toLowerCase()) {
                case "checkbox":
                case "radio":
                    Event.observe(A, "click", this.onElementEvent.bind(this));
                    break;
                default:
                    Event.observe(A, "change", this.onElementEvent.bind(this));
                    break
            }
        }
    }
};
Form.Element.EventObserver = Class.create();
Form.Element.EventObserver.prototype = Object.extend(new Abstract.EventObserver(), {
    getValue: function() {
        return Form.Element.getValue(this.element)
    }
});
Form.EventObserver = Class.create();
Form.EventObserver.prototype = Object.extend(new Abstract.EventObserver(), {
    getValue: function() {
        return Form.serialize(this.element)
    }
});
if (!window.Event) {
    var Event = new Object()
}
Object.extend(Event, {
    KEY_BACKSPACE: 8,
    KEY_TAB: 9,
    KEY_RETURN: 13,
    KEY_ESC: 27,
    KEY_LEFT: 37,
    KEY_UP: 38,
    KEY_RIGHT: 39,
    KEY_DOWN: 40,
    KEY_DELETE: 46,
    KEY_HOME: 36,
    KEY_END: 35,
    KEY_PAGEUP: 33,
    KEY_PAGEDOWN: 34,
    element: function(A) {
        return $(A.target || A.srcElement)
    },
    isLeftClick: function(A) {
        return (((A.which) && (A.which == 1)) || ((A.button) && (A.button == 1)))
    },
    pointerX: function(A) {
        return A.pageX || (A.clientX + (document.documentElement.scrollLeft || document.body.scrollLeft))
    },
    pointerY: function(A) {
        return A.pageY || (A.clientY + (document.documentElement.scrollTop || document.body.scrollTop))
    },
    stop: function(A) {
        if (A.preventDefault) {
            A.preventDefault();
            A.stopPropagation()
        } else {
            A.returnValue = false;
            A.cancelBubble = true
        }
    },
    findElement: function(B, A) {
        var C = Event.element(B);
        while (C.parentNode && (!C.tagName || (C.tagName.toUpperCase() != A.toUpperCase()))) {
            C = C.parentNode
        }
        return C
    },
    observers: false,
    _observeAndCache: function(D, A, C, B) {
        if (!this.observers) {
            this.observers = []
        }
        if (D.addEventListener) {
            this.observers.push([D, A, C, B]);
            D.addEventListener(A, C, B)
        } else {
            if (D.attachEvent) {
                this.observers.push([D, A, C, B]);
                D.attachEvent("on" + A, C)
            }
        }
    },
    unloadCache: function() {
        if (!Event.observers) {
            return
        }
        for (var A = 0, B = Event.observers.length; A < B; A++) {
            Event.stopObserving.apply(this, Event.observers[A]);
            Event.observers[A][0] = null
        }
        Event.observers = false
    },
    observe: function(D, B, C, A) {
        D = $(D);
        A = A || false;
        if (B == "keypress" && (Prototype.Browser.WebKit || D.attachEvent)) {
            B = "keydown"
        }
        Event._observeAndCache(D, B, C, A)
    },
    stopObserving: function(B, C, A, E) {
        B = $(B);
        E = E || false;
        if (C == "keypress" && (Prototype.Browser.WebKit || B.attachEvent)) {
            C = "keydown"
        }
        if (B.removeEventListener) {
            B.removeEventListener(C, A, E)
        } else {
            if (B.detachEvent) {
                try {
                    B.detachEvent("on" + C, A)
                } catch (D) {}
            }
        }
    }
});
if (Prototype.Browser.IE) {
    Event.observe(window, "unload", Event.unloadCache, false)
}
var Position = {
    includeScrollOffsets: false,
    prepare: function() {
        this.deltaX = window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft || 0;
        this.deltaY = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0
    },
    realOffset: function(C) {
        var A = 0,
            B = 0;
        do {
            A += C.scrollTop || 0;
            B += C.scrollLeft || 0;
            C = C.parentNode
        } while (C);
        return [B, A]
    },
    cumulativeOffset: function(B) {
        var A = 0,
            C = 0;
        do {
            A += B.offsetTop || 0;
            C += B.offsetLeft || 0;
            B = B.offsetParent
        } while (B);
        return [C, A]
    },
    positionedOffset: function(D) {
        var C = 0,
            B = 0;
        do {
            C += D.offsetTop || 0;
            B += D.offsetLeft || 0;
            D = D.offsetParent;
            if (D) {
                if (D.tagName == "BODY") {
                    break
                }
                var A = Element.getStyle(D, "position");
                if (A == "relative" || A == "absolute") {
                    break
                }
            }
        } while (D);
        return [B, C]
    },
    offsetParent: function(A) {
        if (A.offsetParent) {
            return A.offsetParent
        }
        if (A == document.body) {
            return A
        }
        while ((A = A.parentNode) && A != document.body) {
            if (Element.getStyle(A, "position") != "static") {
                return A
            }
        }
        return document.body
    },
    within: function(B, A, C) {
        if (this.includeScrollOffsets) {
            return this.withinIncludingScrolloffsets(B, A, C)
        }
        this.xcomp = A;
        this.ycomp = C;
        this.offset = this.cumulativeOffset(B);
        return (C >= this.offset[1] && C < this.offset[1] + B.offsetHeight && A >= this.offset[0] && A < this.offset[0] + B.offsetWidth)
    },
    withinIncludingScrolloffsets: function(C, A, D) {
        var B = this.realOffset(C);
        this.xcomp = A + B[0] - this.deltaX;
        this.ycomp = D + B[1] - this.deltaY;
        this.offset = this.cumulativeOffset(C);
        return (this.ycomp >= this.offset[1] && this.ycomp < this.offset[1] + C.offsetHeight && this.xcomp >= this.offset[0] && this.xcomp < this.offset[0] + C.offsetWidth)
    },
    overlap: function(B, A) {
        if (!B) {
            return 0
        }
        if (B == "vertical") {
            return ((this.offset[1] + A.offsetHeight) - this.ycomp) / A.offsetHeight
        }
        if (B == "horizontal") {
            return ((this.offset[0] + A.offsetWidth) - this.xcomp) / A.offsetWidth
        }
    },
    page: function(C) {
        var B = 0,
            D = 0;
        var A = C;
        do {
            B += A.offsetTop || 0;
            D += A.offsetLeft || 0;
            if (A.offsetParent == document.body) {
                if (Element.getStyle(A, "position") == "absolute") {
                    break
                }
            }
        } while (A = A.offsetParent);
        A = C;
        do {
            if (!window.opera || A.tagName == "BODY") {
                B -= A.scrollTop || 0;
                D -= A.scrollLeft || 0
            }
        } while (A = A.parentNode);
        return [D, B]
    },
    clone: function(B, A) {
        var F = Object.extend({
            setLeft: true,
            setTop: true,
            setWidth: true,
            setHeight: true,
            offsetTop: 0,
            offsetLeft: 0
        }, arguments[2] || {});
        B = $(B);
        var C = Position.page(B);
        A = $(A);
        var E = [0, 0];
        var D = null;
        if (Element.getStyle(A, "position") == "absolute") {
            D = Position.offsetParent(A);
            E = Position.page(D)
        }
        if (D == document.body) {
            E[0] -= document.body.offsetLeft;
            E[1] -= document.body.offsetTop
        }
        if (F.setLeft) {
            A.style.left = (C[0] - E[0] + F.offsetLeft) + "px"
        }
        if (F.setTop) {
            A.style.top = (C[1] - E[1] + F.offsetTop) + "px"
        }
        if (F.setWidth) {
            A.style.width = B.offsetWidth + "px"
        }
        if (F.setHeight) {
            A.style.height = B.offsetHeight + "px"
        }
    },
    absolutize: function(F) {
        F = $(F);
        if (F.style.position == "absolute") {
            return
        }
        Position.prepare();
        var C = Position.positionedOffset(F);
        var E = C[1];
        var D = C[0];
        var B = F.clientWidth;
        var A = F.clientHeight;
        F._originalLeft = D - parseFloat(F.style.left || 0);
        F._originalTop = E - parseFloat(F.style.top || 0);
        F._originalWidth = F.style.width;
        F._originalHeight = F.style.height;
        F.style.position = "absolute";
        F.style.top = E + "px";
        F.style.left = D + "px";
        F.style.width = B + "px";
        F.style.height = A + "px"
    },
    relativize: function(A) {
        A = $(A);
        if (A.style.position == "relative") {
            return
        }
        Position.prepare();
        A.style.position = "relative";
        var C = parseFloat(A.style.top || 0) - (A._originalTop || 0);
        var B = parseFloat(A.style.left || 0) - (A._originalLeft || 0);
        A.style.top = C + "px";
        A.style.left = B + "px";
        A.style.height = A._originalHeight;
        A.style.width = A._originalWidth
    }
};
if (Prototype.Browser.WebKit) {
    Position.cumulativeOffset = function(B) {
        var A = 0,
            C = 0;
        do {
            A += B.offsetTop || 0;
            C += B.offsetLeft || 0;
            if (B.offsetParent == document.body) {
                if (Element.getStyle(B, "position") == "absolute") {
                    break
                }
            }
            B = B.offsetParent
        } while (B);
        return [C, A]
    }
}
Element.addMethods();
var Builder = {
    NODEMAP: {
        AREA: "map",
        CAPTION: "table",
        COL: "table",
        COLGROUP: "table",
        LEGEND: "fieldset",
        OPTGROUP: "select",
        OPTION: "select",
        PARAM: "object",
        TBODY: "table",
        TD: "table",
        TFOOT: "table",
        TH: "table",
        THEAD: "table",
        TR: "table"
    },
    node: function(F) {
        F = F.toUpperCase();
        var D = this.NODEMAP[F] || "div";
        var C = document.createElement(D);
        try {
            C.innerHTML = "<" + F + "></" + F + ">"
        } catch (E) {}
        var B = C.firstChild || null;
        if (B && (B.tagName.toUpperCase() != F)) {
            B = B.getElementsByTagName(F)[0]
        }
        if (!B) {
            B = document.createElement(F)
        }
        if (!B) {
            return
        }
        if (arguments[1]) {
            if (this._isStringOrNumber(arguments[1]) || (arguments[1] instanceof Array) || arguments[1].tagName) {
                this._children(B, arguments[1])
            } else {
                var A = this._attributes(arguments[1]);
                if (A.length) {
                    try {
                        C.innerHTML = "<" + F + " " + A + "></" + F + ">"
                    } catch (E) {}
                    B = C.firstChild || null;
                    if (!B) {
                        B = document.createElement(F);
                        for (attr in arguments[1]) {
                            B[attr == "class" ? "className" : attr] = arguments[1][attr]
                        }
                    }
                    if (B.tagName.toUpperCase() != F) {
                        B = C.getElementsByTagName(F)[0]
                    }
                }
            }
        }
        if (arguments[2]) {
            this._children(B, arguments[2])
        }
        return B
    },
    _text: function(A) {
        return document.createTextNode(A)
    },
    ATTR_MAP: {
        "className": "class",
        "htmlFor": "for"
    },
    _attributes: function(B) {
        var A = [];
        for (attribute in B) {
            A.push((attribute in this.ATTR_MAP ? this.ATTR_MAP[attribute] : attribute) + "=\"" + B[attribute].toString().escapeHTML().gsub(/"/, "&quot;") + "\"")
        }
        return A.join(" ")
    },
    _children: function(A, B) {
        if (B.tagName) {
            A.appendChild(B);
            return
        }
        if (typeof B == "object") {
            B.flatten().each(function(C) {
                if (typeof C == "object") {
                    A.appendChild(C)
                } else {
                    if (Builder._isStringOrNumber(C)) {
                        A.appendChild(Builder._text(C))
                    }
                }
            })
        } else {
            if (Builder._isStringOrNumber(B)) {
                A.appendChild(Builder._text(B))
            }
        }
    },
    _isStringOrNumber: function(A) {
        return (typeof A == "string" || typeof A == "number")
    },
    build: function(B) {
        var A = this.node("div");
        $(A).update(B.strip());
        return A.down()
    },
    dump: function(B) {
        if (typeof B != "object" && typeof B != "function") {
            B = window
        }
        var A = ("A ABBR ACRONYM ADDRESS APPLET AREA B BASE BASEFONT BDO BIG BLOCKQUOTE BODY " + "BR BUTTON CAPTION CENTER CITE CODE COL COLGROUP DD DEL DFN DIR DIV DL DT EM FIELDSET " + "FONT FORM FRAME FRAMESET H1 H2 H3 H4 H5 H6 HEAD HR HTML I IFRAME IMG INPUT INS ISINDEX " + "KBD LABEL LEGEND LI LINK MAP MENU META NOFRAMES NOSCRIPT OBJECT OL OPTGROUP OPTION P " + "PARAM PRE Q S SAMP SCRIPT SELECT SMALL SPAN STRIKE STRONG STYLE SUB SUP TABLE TBODY TD " + "TEXTAREA TFOOT TH THEAD TITLE TR TT U UL VAR").split(/\s+/);
        A.each(function(C) {
            B[C] = function() {
                return Builder.node.apply(Builder, [C].concat($A(arguments)))
            }
        })
    }
};
if (typeof Effect == "undefined") {}
var Autocompleter = {};
Autocompleter.Base = function() {};
Autocompleter.Base.prototype = {
    baseInitialize: function(C, B, A) {
        C = $(C);
        this.element = C;
        this.update = $(B);
        this.hasFocus = false;
        this.changed = false;
        this.active = false;
        this.index = 0;
        this.entryCount = 0;
        if (this.setOptions) {
            this.setOptions(A)
        } else {
            this.options = A || {}
        }
        this.options.paramName = this.options.paramName || this.element.name;
        this.options.tokens = this.options.tokens || [];
        this.options.frequency = this.options.frequency || 0.4;
        this.options.minChars = this.options.minChars || 1;
        this.options.onShow = this.options.onShow || function(E, D) {
            if (!D.style.position || D.style.position == "absolute") {
                D.style.position = "absolute";
                Position.clone(E, D, {
                    setHeight: false,
                    offsetTop: E.offsetHeight
                })
            }
            Effect.Appear(D, {
                duration: 0.15
            })
        };
        this.options.onHide = this.options.onHide || function(E, D) {
            new Effect.Fade(D, {
                duration: 0.15
            })
        };
        if (typeof(this.options.tokens) == "string") {
            this.options.tokens = new Array(this.options.tokens)
        }
        this.observer = null;
        this.element.setAttribute("autocomplete", "off");
        Element.hide(this.update);
        Event.observe(this.element, "blur", this.onBlur.bindAsEventListener(this));
        Event.observe(this.element, "keypress", this.onKeyPress.bindAsEventListener(this));
        Event.observe(window, "beforeunload", function() {
            C.setAttribute("autocomplete", "on")
        })
    },
    show: function() {
        if (Element.getStyle(this.update, "display") == "none") {
            this.options.onShow(this.element, this.update)
        }
        if (!this.iefix && (Prototype.Browser.IE) && (Element.getStyle(this.update, "position") == "absolute")) {
            new Insertion.After(this.update, "<iframe id=\"" + this.update.id + "_iefix\" " + "style=\"display:none;position:absolute;filter:progid:DXImageTransform.Microsoft.Alpha(opacity=0);\" " + "src=\"javascript:false;\" frameborder=\"0\" scrolling=\"no\"></iframe>");
            this.iefix = $(this.update.id + "_iefix")
        }
        if (this.iefix) {
            setTimeout(this.fixIEOverlapping.bind(this), 50)
        }
    },
    fixIEOverlapping: function() {
        Position.clone(this.update, this.iefix, {
            setTop: (!this.update.style.height)
        });
        this.iefix.style.zIndex = 1;
        this.update.style.zIndex = 2;
        Element.show(this.iefix)
    },
    hide: function() {
        this.stopIndicator();
        if (Element.getStyle(this.update, "display") != "none") {
            this.options.onHide(this.element, this.update)
        }
        if (this.iefix) {
            Element.hide(this.iefix)
        }
    },
    startIndicator: function() {
        if (this.options.indicator) {
            Element.show(this.options.indicator)
        }
    },
    stopIndicator: function() {
        if (this.options.indicator) {
            Element.hide(this.options.indicator)
        }
    },
    onKeyPress: function(A) {
        if (this.active) {
            switch (A.keyCode) {
                case Event.KEY_TAB:
                case Event.KEY_RETURN:
                    this.selectEntry();
                    Event.stop(A);
                case Event.KEY_ESC:
                    this.hide();
                    this.active = false;
                    Event.stop(A);
                    return;
                case Event.KEY_LEFT:
                case Event.KEY_RIGHT:
                    return;
                case Event.KEY_UP:
                    this.markPrevious();
                    this.render();
                    if (Prototype.Browser.WebKit) {
                        Event.stop(A)
                    }
                    return;
                case Event.KEY_DOWN:
                    this.markNext();
                    this.render();
                    if (Prototype.Browser.WebKit) {
                        Event.stop(A)
                    }
                    return
            }
        } else {
            if (A.keyCode == Event.KEY_TAB || A.keyCode == Event.KEY_RETURN || (Prototype.Browser.WebKit > 0 && A.keyCode == 0)) {
                return
            }
        }
        this.changed = true;
        this.hasFocus = true;
        if (this.observer) {
            clearTimeout(this.observer)
        }
        this.observer = setTimeout(this.onObserverEvent.bind(this), this.options.frequency * 1000)
    },
    activate: function() {
        this.changed = false;
        this.hasFocus = true;
        this.getUpdatedChoices()
    },
    onHover: function(A) {
        var B = Event.findElement(A, "LI");
        if (this.index != B.autocompleteIndex) {
            this.index = B.autocompleteIndex;
            this.render()
        }
        Event.stop(A)
    },
    onClick: function(B) {
        var A = Event.findElement(B, "LI");
        this.index = A.autocompleteIndex;
        this.selectEntry();
        this.hide()
    },
    onBlur: function(A) {
        setTimeout(this.hide.bind(this), 250);
        this.hasFocus = false;
        this.active = false
    },
    render: function() {
        if (this.entryCount > 0) {
            for (var A = 0; A < this.entryCount; A++) {
                this.index == A ? Element.addClassName(this.getEntry(A), "selected") : Element.removeClassName(this.getEntry(A), "selected")
            }
            if (this.hasFocus) {
                this.show();
                this.active = true
            }
        } else {
            this.active = false;
            this.hide()
        }
    },
    markPrevious: function() {
        if (this.index > 0) {
            this.index--
        } else {
            this.index = this.entryCount - 1
        }
        this.getEntry(this.index).scrollIntoView(true)
    },
    markNext: function() {
        if (this.index < this.entryCount - 1) {
            this.index++
        } else {
            this.index = 0
        }
        this.getEntry(this.index).scrollIntoView(false)
    },
    getEntry: function(A) {
        return this.update.firstChild.childNodes[A]
    },
    getCurrentEntry: function() {
        return this.getEntry(this.index)
    },
    selectEntry: function() {
        this.active = false;
        this.updateElement(this.getCurrentEntry())
    },
    updateElement: function(F) {
        if (this.options.updateElement) {
            this.options.updateElement(F);
            return
        }
        var E = "";
        if (this.options.select) {
            var D = document.getElementsByClassName(this.options.select, F) || [];
            if (D.length > 0) {
                E = Element.collectTextNodes(D[0], this.options.select)
            }
        } else {
            E = Element.collectTextNodesIgnoreClass(F, "informal")
        }
        var C = this.findLastToken();
        if (C != -1) {
            var B = this.element.value.substr(0, C + 1);
            var A = this.element.value.substr(C + 1).match(/^\s+/);
            if (A) {
                B += A[0]
            }
            this.element.value = B + E
        } else {
            this.element.value = E
        }
        this.element.focus();
        if (this.options.afterUpdateElement) {
            this.options.afterUpdateElement(this.element, F)
        }
    },
    updateChoices: function(C) {
        if (!this.changed && this.hasFocus) {
            this.update.innerHTML = C;
            Element.cleanWhitespace(this.update);
            Element.cleanWhitespace(this.update.down());
            if (this.update.firstChild && this.update.down().childNodes) {
                this.entryCount = this.update.down().childNodes.length;
                for (var B = 0; B < this.entryCount; B++) {
                    var A = this.getEntry(B);
                    A.autocompleteIndex = B;
                    this.addObservers(A)
                }
            } else {
                this.entryCount = 0
            }
            this.stopIndicator();
            this.index = 0;
            if (this.entryCount == 1 && this.options.autoSelect) {
                this.selectEntry();
                this.hide()
            } else {
                this.render()
            }
        }
    },
    addObservers: function(A) {
        Event.observe(A, "mouseover", this.onHover.bindAsEventListener(this));
        Event.observe(A, "click", this.onClick.bindAsEventListener(this))
    },
    onObserverEvent: function() {
        this.changed = false;
        if (this.getToken().length >= this.options.minChars) {
            this.getUpdatedChoices()
        } else {
            this.active = false;
            this.hide()
        }
    },
    getToken: function() {
        var B = this.findLastToken();
        if (B != -1) {
            var A = this.element.value.substr(B + 1).replace(/^\s+/, "").replace(/\s+$/, "")
        } else {
            var A = this.element.value
        }
        return /\n/.test(A) ? "" : A
    },
    findLastToken: function() {
        var B = -1;
        for (var C = 0; C < this.options.tokens.length; C++) {
            var A = this.element.value.lastIndexOf(this.options.tokens[C]);
            if (A > B) {
                B = A
            }
        }
        return B
    }
};
Ajax.Autocompleter = Class.create();
Object.extend(Object.extend(Ajax.Autocompleter.prototype, Autocompleter.Base.prototype), {
    initialize: function(B, A, C, D) {
        this.baseInitialize(B, A, D);
        this.options.asynchronous = true;
        this.options.onComplete = this.onComplete.bind(this);
        this.options.defaultParams = this.options.parameters || null;
        this.url = C
    },
    getUpdatedChoices: function() {
        this.startIndicator();
        var A = encodeURIComponent(this.options.paramName) + "=" + encodeURIComponent(this.getToken());
        this.options.parameters = this.options.callback ? this.options.callback(this.element, A) : A;
        if (this.options.defaultParams) {
            this.options.parameters += "&" + this.options.defaultParams
        }
        new Ajax.Request(this.url, this.options)
    },
    onComplete: function(A) {
        this.updateChoices(A.responseText)
    }
});
Autocompleter.Local = Class.create();
Autocompleter.Local.prototype = Object.extend(new Autocompleter.Base(), {
    initialize: function(D, C, B, A) {
        this.baseInitialize(D, C, A);
        this.options.array = B
    },
    getUpdatedChoices: function() {
        this.updateChoices(this.options.selector(this))
    },
    setOptions: function(A) {
        this.options = Object.extend({
            choices: 10,
            partialSearch: true,
            partialChars: 2,
            ignoreCase: true,
            fullSearch: false,
            selector: function(I) {
                var F = [];
                var H = [];
                var E = I.getToken();
                var D = 0;
                for (var G = 0; G < I.options.array.length && F.length < I.options.choices; G++) {
                    var C = I.options.array[G];
                    var B = I.options.ignoreCase ? C.toLowerCase().indexOf(E.toLowerCase()) : C.indexOf(E);
                    while (B != -1) {
                        if (B == 0 && C.length != E.length) {
                            F.push("<li><strong>" + C.substr(0, E.length) + "</strong>" + C.substr(E.length) + "</li>");
                            break
                        } else {
                            if (E.length >= I.options.partialChars && I.options.partialSearch && B != -1) {
                                if (I.options.fullSearch || /\s/.test(C.substr(B - 1, 1))) {
                                    H.push("<li>" + C.substr(0, B) + "<strong>" + C.substr(B, E.length) + "</strong>" + C.substr(B + E.length) + "</li>");
                                    break
                                }
                            }
                        }
                        B = I.options.ignoreCase ? C.toLowerCase().indexOf(E.toLowerCase(), B + 1) : C.indexOf(E, B + 1)
                    }
                }
                if (H.length) {
                    F = F.concat(H.slice(0, I.options.choices - F.length))
                }
                return "<ul>" + F.join("") + "</ul>"
            }
        }, A || {})
    }
});
Field.scrollFreeActivate = function(A) {
    setTimeout(function() {
        Field.activate(A)
    }, 1)
};
Ajax.InPlaceEditor = Class.create();
Ajax.InPlaceEditor.defaultHighlightColor = "#FFFF99";
Ajax.InPlaceEditor.prototype = {
    initialize: function(C, A, B) {
        this.url = A;
        this.element = $(C);
        this.options = Object.extend({
            paramName: "value",
            okButton: true,
            okLink: false,
            okText: "ok",
            cancelButton: false,
            cancelLink: true,
            cancelText: "cancel",
            textBeforeControls: "",
            textBetweenControls: "",
            textAfterControls: "",
            savingText: "Saving...",
            clickToEditText: "Click to edit",
            okText: "ok",
            rows: 1,
            onComplete: function(E, D) {
                new Effect.Highlight(D, {
                    startcolor: this.options.highlightcolor
                })
            },
            onFailure: function(D) {
                alert("Error communicating with the server: " + D.responseText.stripTags())
            },
            callback: function(D) {
                return Form.serialize(D)
            },
            handleLineBreaks: true,
            loadingText: "Loading...",
            savingClassName: "inplaceeditor-saving",
            loadingClassName: "inplaceeditor-loading",
            formClassName: "inplaceeditor-form",
            highlightcolor: Ajax.InPlaceEditor.defaultHighlightColor,
            highlightendcolor: "#FFFFFF",
            externalControl: null,
            submitOnBlur: false,
            ajaxOptions: {},
            evalScripts: false
        }, B || {});
        if (!this.options.formId && this.element.id) {
            this.options.formId = this.element.id + "-inplaceeditor";
            if ($(this.options.formId)) {
                this.options.formId = null
            }
        }
        if (this.options.externalControl) {
            this.options.externalControl = $(this.options.externalControl)
        }
        this.originalBackground = Element.getStyle(this.element, "background-color");
        if (!this.originalBackground) {
            this.originalBackground = "transparent"
        }
        this.element.title = this.options.clickToEditText;
        this.onclickListener = this.enterEditMode.bindAsEventListener(this);
        this.mouseoverListener = this.enterHover.bindAsEventListener(this);
        this.mouseoutListener = this.leaveHover.bindAsEventListener(this);
        Event.observe(this.element, "click", this.onclickListener);
        Event.observe(this.element, "mouseover", this.mouseoverListener);
        Event.observe(this.element, "mouseout", this.mouseoutListener);
        if (this.options.externalControl) {
            Event.observe(this.options.externalControl, "click", this.onclickListener);
            Event.observe(this.options.externalControl, "mouseover", this.mouseoverListener);
            Event.observe(this.options.externalControl, "mouseout", this.mouseoutListener)
        }
    },
    enterEditMode: function(A) {
        if (this.saving) {
            return
        }
        if (this.editing) {
            return
        }
        this.editing = true;
        this.onEnterEditMode();
        if (this.options.externalControl) {
            Element.hide(this.options.externalControl)
        }
        Element.hide(this.element);
        this.createForm();
        this.element.parentNode.insertBefore(this.form, this.element);
        if (!this.options.loadTextURL) {
            Field.scrollFreeActivate(this.editField)
        }
        if (A) {
            Event.stop(A)
        }
        return false
    },
    createForm: function() {
        this.form = document.createElement("form");
        this.form.id = this.options.formId;
        Element.addClassName(this.form, this.options.formClassName);
        this.form.onsubmit = this.onSubmit.bind(this);
        this.createEditField();
        if (this.options.textarea) {
            var B = document.createElement("br");
            this.form.appendChild(B)
        }
        if (this.options.textBeforeControls) {
            this.form.appendChild(document.createTextNode(this.options.textBeforeControls))
        }
        if (this.options.okButton) {
            var E = document.createElement("input");
            E.type = "submit";
            E.value = this.options.okText;
            E.className = "editor_ok_button";
            this.form.appendChild(E)
        }
        if (this.options.okLink) {
            var D = document.createElement("a");
            D.href = "#";
            D.appendChild(document.createTextNode(this.options.okText));
            D.onclick = this.onSubmit.bind(this);
            D.className = "editor_ok_link";
            this.form.appendChild(D)
        }
        if (this.options.textBetweenControls && (this.options.okLink || this.options.okButton) && (this.options.cancelLink || this.options.cancelButton)) {
            this.form.appendChild(document.createTextNode(this.options.textBetweenControls))
        }
        if (this.options.cancelButton) {
            var A = document.createElement("input");
            A.type = "submit";
            A.value = this.options.cancelText;
            A.onclick = this.onclickCancel.bind(this);
            A.className = "editor_cancel_button";
            this.form.appendChild(A)
        }
        if (this.options.cancelLink) {
            var C = document.createElement("a");
            C.href = "#";
            C.appendChild(document.createTextNode(this.options.cancelText));
            C.onclick = this.onclickCancel.bind(this);
            C.className = "editor_cancel editor_cancel_link";
            this.form.appendChild(C)
        }
        if (this.options.textAfterControls) {
            this.form.appendChild(document.createTextNode(this.options.textAfterControls))
        }
    },
    hasHTMLLineBreaks: function(A) {
        if (!this.options.handleLineBreaks) {
            return false
        }
        return A.match(/<br/i) || A.match(/<p>/i)
    },
    convertHTMLLineBreaks: function(A) {
        return A.replace(/<br>/gi, "\n").replace(/<br\/>/gi, "\n").replace(/<\/p>/gi, "\n").replace(/<p>/gi, "")
    },
    createEditField: function() {
        var B;
        if (this.options.loadTextURL) {
            B = this.options.loadingText
        } else {
            B = this.getText()
        }
        var C = this;
        if (this.options.rows == 1 && !this.hasHTMLLineBreaks(B)) {
            this.options.textarea = false;
            var A = document.createElement("input");
            A.obj = this;
            A.type = "text";
            A.name = this.options.paramName;
            A.value = B;
            A.style.backgroundColor = this.options.highlightcolor;
            A.className = "editor_field";
            var E = this.options.size || this.options.cols || 0;
            if (E != 0) {
                A.size = E
            }
            if (this.options.submitOnBlur) {
                A.onblur = this.onSubmit.bind(this)
            }
            this.editField = A
        } else {
            this.options.textarea = true;
            var D = document.createElement("textarea");
            D.obj = this;
            D.name = this.options.paramName;
            D.value = this.convertHTMLLineBreaks(B);
            D.rows = this.options.rows;
            D.cols = this.options.cols || 40;
            D.className = "editor_field";
            if (this.options.submitOnBlur) {
                D.onblur = this.onSubmit.bind(this)
            }
            this.editField = D
        }
        if (this.options.loadTextURL) {
            this.loadExternalText()
        }
        this.form.appendChild(this.editField)
    },
    getText: function() {
        return this.element.innerHTML
    },
    loadExternalText: function() {
        Element.addClassName(this.form, this.options.loadingClassName);
        this.editField.disabled = true;
        new Ajax.Request(this.options.loadTextURL, Object.extend({
            asynchronous: true,
            onComplete: this.onLoadedExternalText.bind(this)
        }, this.options.ajaxOptions))
    },
    onLoadedExternalText: function(A) {
        Element.removeClassName(this.form, this.options.loadingClassName);
        this.editField.disabled = false;
        this.editField.value = A.responseText.stripTags();
        Field.scrollFreeActivate(this.editField)
    },
    onclickCancel: function() {
        this.onComplete();
        this.leaveEditMode();
        return false
    },
    onFailure: function(A) {
        this.options.onFailure(A);
        if (this.oldInnerHTML) {
            this.element.innerHTML = this.oldInnerHTML;
            this.oldInnerHTML = null
        }
        return false
    },
    onSubmit: function() {
        var A = this.form;
        var B = this.editField.value;
        this.onLoading();
        if (this.options.evalScripts) {
            new Ajax.Request(this.url, Object.extend({
                parameters: this.options.callback(A, B),
                onComplete: this.onComplete.bind(this),
                onFailure: this.onFailure.bind(this),
                asynchronous: true,
                evalScripts: true
            }, this.options.ajaxOptions))
        } else {
            new Ajax.Updater({
                success: this.element,
                failure: null
            }, this.url, Object.extend({
                parameters: this.options.callback(A, B),
                onComplete: this.onComplete.bind(this),
                onFailure: this.onFailure.bind(this)
            }, this.options.ajaxOptions))
        }
        if (arguments.length > 1) {
            Event.stop(arguments[0])
        }
        return false
    },
    onLoading: function() {
        this.saving = true;
        this.removeForm();
        this.leaveHover();
        this.showSaving()
    },
    showSaving: function() {
        this.oldInnerHTML = this.element.innerHTML;
        this.element.innerHTML = this.options.savingText;
        Element.addClassName(this.element, this.options.savingClassName);
        this.element.style.backgroundColor = this.originalBackground;
        Element.show(this.element)
    },
    removeForm: function() {
        if (this.form) {
            if (this.form.parentNode) {
                Element.remove(this.form)
            }
            this.form = null
        }
    },
    enterHover: function() {
        if (this.saving) {
            return
        }
        this.element.style.backgroundColor = this.options.highlightcolor;
        if (this.effect) {
            this.effect.cancel()
        }
        Element.addClassName(this.element, this.options.hoverClassName)
    },
    leaveHover: function() {
        if (this.options.backgroundColor) {
            this.element.style.backgroundColor = this.oldBackground
        }
        Element.removeClassName(this.element, this.options.hoverClassName);
        if (this.saving) {
            return
        }
        this.effect = new Effect.Highlight(this.element, {
            startcolor: this.options.highlightcolor,
            endcolor: this.options.highlightendcolor,
            restorecolor: this.originalBackground
        })
    },
    leaveEditMode: function() {
        Element.removeClassName(this.element, this.options.savingClassName);
        this.removeForm();
        this.leaveHover();
        this.element.style.backgroundColor = this.originalBackground;
        Element.show(this.element);
        if (this.options.externalControl) {
            Element.show(this.options.externalControl)
        }
        this.editing = false;
        this.saving = false;
        this.oldInnerHTML = null;
        this.onLeaveEditMode()
    },
    onComplete: function(A) {
        this.leaveEditMode();
        this.options.onComplete.bind(this)(A, this.element)
    },
    onEnterEditMode: function() {},
    onLeaveEditMode: function() {},
    dispose: function() {
        if (this.oldInnerHTML) {
            this.element.innerHTML = this.oldInnerHTML
        }
        this.leaveEditMode();
        Event.stopObserving(this.element, "click", this.onclickListener);
        Event.stopObserving(this.element, "mouseover", this.mouseoverListener);
        Event.stopObserving(this.element, "mouseout", this.mouseoutListener);
        if (this.options.externalControl) {
            Event.stopObserving(this.options.externalControl, "click", this.onclickListener);
            Event.stopObserving(this.options.externalControl, "mouseover", this.mouseoverListener);
            Event.stopObserving(this.options.externalControl, "mouseout", this.mouseoutListener)
        }
    }
};
Ajax.InPlaceCollectionEditor = Class.create();
Object.extend(Ajax.InPlaceCollectionEditor.prototype, Ajax.InPlaceEditor.prototype);
Object.extend(Ajax.InPlaceCollectionEditor.prototype, {
    createEditField: function() {
        if (!this.cached_selectTag) {
            var C = document.createElement("select");
            var B = this.options.collection || [];
            var A;
            B.each(function(E, D) {
                A = document.createElement("option");
                A.value = (E instanceof Array) ? E[0] : E;
                if ((typeof this.options.value == "undefined") && ((E instanceof Array) ? this.element.innerHTML == E[1] : E == A.value)) {
                    A.selected = true
                }
                if (this.options.value == A.value) {
                    A.selected = true
                }
                A.appendChild(document.createTextNode((E instanceof Array) ? E[1] : E));
                C.appendChild(A)
            }.bind(this));
            this.cached_selectTag = C
        }
        this.editField = this.cached_selectTag;
        if (this.options.loadTextURL) {
            this.loadExternalText()
        }
        this.form.appendChild(this.editField);
        this.options.callback = function(E, D) {
            return "value=" + encodeURIComponent(D)
        }
    }
});
Form.Element.DelayedObserver = Class.create();
Form.Element.DelayedObserver.prototype = {
    initialize: function(C, B, A) {
        this.delay = B || 0.5;
        this.element = $(C);
        this.callback = A;
        this.timer = null;
        this.lastValue = $F(this.element);
        Event.observe(this.element, "keyup", this.delayedListener.bindAsEventListener(this))
    },
    delayedListener: function(A) {
        if (this.lastValue == $F(this.element)) {
            return
        }
        if (this.timer) {
            clearTimeout(this.timer)
        }
        this.timer = setTimeout(this.onTimerEvent.bind(this), this.delay * 1000);
        this.lastValue = $F(this.element)
    },
    onTimerEvent: function() {
        this.timer = null;
        this.callback(this.element, $F(this.element))
    }
};
if (typeof Effect == "undefined") {}
var Droppables = {
    drops: [],
    remove: function(A) {
        this.drops = this.drops.reject(function(B) {
            return B.element == $(A)
        })
    },
    add: function(C) {
        C = $(C);
        var B = Object.extend({
            greedy: true,
            hoverclass: null,
            tree: false
        }, arguments[1] || {});
        if (B.containment) {
            B._containers = [];
            var A = B.containment;
            if ((typeof A == "object") && (A.constructor == Array)) {
                A.each(function(D) {
                    B._containers.push($(D))
                })
            } else {
                B._containers.push($(A))
            }
        }
        if (B.accept) {
            B.accept = [B.accept].flatten()
        }
        Element.makePositioned(C);
        B.element = C;
        this.drops.push(B)
    },
    findDeepestChild: function(A) {
        deepest = A[0];
        for (i = 1; i < A.length; ++i) {
            if (Element.isParent(A[i].element, deepest.element)) {
                deepest = A[i]
            }
        }
        return deepest
    },
    isContained: function(B, A) {
        var C;
        if (A.tree) {
            C = B.treeNode
        } else {
            C = B.parentNode
        }
        return A._containers.detect(function(D) {
            return C == D
        })
    },
    isAffected: function(C, B, A) {
        return ((A.element != B) && ((!A._containers) || this.isContained(B, A)) && ((!A.accept) || (Element.classNames(B).detect(function(D) {
            return A.accept.include(D)
        }))) && Position.within(A.element, C[0], C[1]))
    },
    deactivate: function(A) {
        if (A.hoverclass) {
            Element.removeClassName(A.element, A.hoverclass)
        }
        this.last_active = null
    },
    activate: function(A) {
        if (A.hoverclass) {
            Element.addClassName(A.element, A.hoverclass)
        }
        this.last_active = A
    },
    show: function(C, B) {
        if (!this.drops.length) {
            return
        }
        var A = [];
        if (this.last_active) {
            this.deactivate(this.last_active)
        }
        this.drops.each(function(D) {
            if (Droppables.isAffected(C, B, D)) {
                A.push(D)
            }
        });
        if (A.length > 0) {
            drop = Droppables.findDeepestChild(A);
            Position.within(drop.element, C[0], C[1]);
            if (drop.onHover) {
                drop.onHover(B, drop.element, Position.overlap(drop.overlap, drop.element))
            }
            Droppables.activate(drop)
        }
    },
    fire: function(B, A) {
        if (!this.last_active) {
            return
        }
        Position.prepare();
        if (this.isAffected([Event.pointerX(B), Event.pointerY(B)], A, this.last_active)) {
            if (this.last_active.onDrop) {
                this.last_active.onDrop(A, this.last_active.element, B);
                return true
            }
        }
    },
    reset: function() {
        if (this.last_active) {
            this.deactivate(this.last_active)
        }
    }
};
var Draggables = {
    drags: [],
    observers: [],
    register: function(A) {
        if (this.drags.length == 0) {
            this.eventMouseUp = this.endDrag.bindAsEventListener(this);
            this.eventMouseMove = this.updateDrag.bindAsEventListener(this);
            this.eventKeypress = this.keyPress.bindAsEventListener(this);
            Event.observe(document, "mouseup", this.eventMouseUp);
            Event.observe(document, "mousemove", this.eventMouseMove);
            Event.observe(document, "keypress", this.eventKeypress)
        }
        this.drags.push(A)
    },
    unregister: function(A) {
        this.drags = this.drags.reject(function(B) {
            return B == A
        });
        if (this.drags.length == 0) {
            Event.stopObserving(document, "mouseup", this.eventMouseUp);
            Event.stopObserving(document, "mousemove", this.eventMouseMove);
            Event.stopObserving(document, "keypress", this.eventKeypress)
        }
    },
    activate: function(A) {
        if (A.options.delay) {
            this._timeout = setTimeout(function() {
                Draggables._timeout = null;
                window.focus();
                Draggables.activeDraggable = A
            }.bind(this), A.options.delay)
        } else {
            window.focus();
            this.activeDraggable = A
        }
    },
    deactivate: function() {
        this.activeDraggable = null
    },
    updateDrag: function(B) {
        if (!this.activeDraggable) {
            return
        }
        var A = [Event.pointerX(B), Event.pointerY(B)];
        if (this._lastPointer && (this._lastPointer.inspect() == A.inspect())) {
            return
        }
        this._lastPointer = A;
        this.activeDraggable.updateDrag(B, A)
    },
    endDrag: function(A) {
        if (this._timeout) {
            clearTimeout(this._timeout);
            this._timeout = null
        }
        if (!this.activeDraggable) {
            return
        }
        this._lastPointer = null;
        this.activeDraggable.endDrag(A);
        this.activeDraggable = null
    },
    keyPress: function(A) {
        if (this.activeDraggable) {
            this.activeDraggable.keyPress(A)
        }
    },
    addObserver: function(A) {
        this.observers.push(A);
        this._cacheObserverCallbacks()
    },
    removeObserver: function(A) {
        this.observers = this.observers.reject(function(B) {
            return B.element == A
        });
        this._cacheObserverCallbacks()
    },
    notify: function(C, B, A) {
        if (this[C + "Count"] > 0) {
            this.observers.each(function(D) {
                if (D[C]) {
                    D[C](C, B, A)
                }
            })
        }
        if (B.options[C]) {
            B.options[C](B, A)
        }
    },
    _cacheObserverCallbacks: function() {
        ["onStart", "onEnd", "onDrag"].each(function(A) {
            Draggables[A + "Count"] = Draggables.observers.select(function(B) {
                return B[A]
            }).length
        })
    }
};
var Draggable = Class.create();
Draggable._dragging = {};
Draggable.prototype = {
    initialize: function(B) {
        var C = {
            handle: false,
            reverteffect: function(G, F, D) {
                var E = Math.sqrt(Math.abs(F ^ 2) + Math.abs(D ^ 2)) * 0.02;
                new Effect.Move(G, {
                    x: -D,
                    y: -F,
                    duration: E,
                    queue: {
                        scope: "_draggable",
                        position: "end"
                    }
                })
            },
            endeffect: function(D) {
                var E = typeof D._opacity == "number" ? D._opacity : 1;
                new Effect.Opacity(D, {
                    duration: 0.2,
                    from: 0.7,
                    to: E,
                    queue: {
                        scope: "_draggable",
                        position: "end"
                    },
                    afterFinish: function() {
                        Draggable._dragging[D] = false
                    }
                })
            },
            zindex: 1000,
            revert: false,
            quiet: false,
            scroll: false,
            scrollSensitivity: 20,
            scrollSpeed: 15,
            snap: false,
            delay: 0
        };
        if (!arguments[1] || typeof arguments[1].endeffect == "undefined") {
            Object.extend(C, {
                starteffect: function(D) {
                    D._opacity = Element.getOpacity(D);
                    Draggable._dragging[D] = true;
                    new Effect.Opacity(D, {
                        duration: 0.2,
                        from: D._opacity,
                        to: 0.7
                    })
                }
            })
        }
        var A = Object.extend(C, arguments[1] || {});
        this.element = $(B);
        if (A.handle && (typeof A.handle == "string")) {
            this.handle = this.element.down("." + A.handle, 0)
        }
        if (!this.handle) {
            this.handle = $(A.handle)
        }
        if (!this.handle) {
            this.handle = this.element
        }
        if (A.scroll && !A.scroll.scrollTo && !A.scroll.outerHTML) {
            A.scroll = $(A.scroll);
            this._isScrollChild = Element.childOf(this.element, A.scroll)
        }
        Element.makePositioned(this.element);
        this.delta = this.currentDelta();
        this.options = A;
        this.dragging = false;
        this.eventMouseDown = this.initDrag.bindAsEventListener(this);
        Event.observe(this.handle, "mousedown", this.eventMouseDown);
        Draggables.register(this)
    },
    destroy: function() {
        Event.stopObserving(this.handle, "mousedown", this.eventMouseDown);
        Draggables.unregister(this)
    },
    currentDelta: function() {
        return ([parseInt(Element.getStyle(this.element, "left") || "0"), parseInt(Element.getStyle(this.element, "top") || "0")])
    },
    initDrag: function(A) {
        if (typeof Draggable._dragging[this.element] != "undefined" && Draggable._dragging[this.element]) {
            return
        }
        if (Event.isLeftClick(A)) {
            var C = Event.element(A);
            if ((tag_name = C.tagName.toUpperCase()) && (tag_name == "INPUT" || tag_name == "SELECT" || tag_name == "OPTION" || tag_name == "BUTTON" || tag_name == "TEXTAREA")) {
                return
            }
            var B = [Event.pointerX(A), Event.pointerY(A)];
            var D = Position.cumulativeOffset(this.element);
            this.offset = [0, 1].map(function(E) {
                return (B[E] - D[E])
            });
            Draggables.activate(this);
            Event.stop(A)
        }
    },
    startDrag: function(B) {
        this.dragging = true;
        if (this.options.zindex) {
            this.originalZ = parseInt(Element.getStyle(this.element, "z-index") || 0);
            this.element.style.zIndex = this.options.zindex
        }
        if (this.options.ghosting) {
            this._clone = this.element.cloneNode(true);
            Position.absolutize(this.element);
            this.element.parentNode.insertBefore(this._clone, this.element)
        }
        if (this.options.scroll) {
            if (this.options.scroll == window) {
                var A = this._getWindowScroll(this.options.scroll);
                this.originalScrollLeft = A.left;
                this.originalScrollTop = A.top
            } else {
                this.originalScrollLeft = this.options.scroll.scrollLeft;
                this.originalScrollTop = this.options.scroll.scrollTop
            }
        }
        Draggables.notify("onStart", this, B);
        if (this.options.starteffect) {
            this.options.starteffect(this.element)
        }
    },
    updateDrag: function(_3a, _3b) {
        if (!this.dragging) {
            this.startDrag(_3a)
        }
        if (!this.options.quiet) {
            Position.prepare();
            Droppables.show(_3b, this.element)
        }
        Draggables.notify("onDrag", this, _3a);
        this.draw(_3b);
        if (this.options.change) {
            this.options.change(this)
        }
        if (this.options.scroll) {
            this.stopScrolling();
            var p;
            if (this.options.scroll == window) {
                with(this._getWindowScroll(this.options.scroll)) {
                    p = [left, top, left + width, top + height]
                }
            } else {
                p = Position.page(this.options.scroll);
                p[0] += this.options.scroll.scrollLeft + Position.deltaX;
                p[1] += this.options.scroll.scrollTop + Position.deltaY;
                p.push(p[0] + this.options.scroll.offsetWidth);
                p.push(p[1] + this.options.scroll.offsetHeight)
            }
            var _3d = [0, 0];
            if (_3b[0] < (p[0] + this.options.scrollSensitivity)) {
                _3d[0] = _3b[0] - (p[0] + this.options.scrollSensitivity)
            }
            if (_3b[1] < (p[1] + this.options.scrollSensitivity)) {
                _3d[1] = _3b[1] - (p[1] + this.options.scrollSensitivity)
            }
            if (_3b[0] > (p[2] - this.options.scrollSensitivity)) {
                _3d[0] = _3b[0] - (p[2] - this.options.scrollSensitivity)
            }
            if (_3b[1] > (p[3] - this.options.scrollSensitivity)) {
                _3d[1] = _3b[1] - (p[3] - this.options.scrollSensitivity)
            }
            this.startScrolling(_3d)
        }
        if (Prototype.Browser.WebKit) {
            window.scrollBy(0, 0)
        }
        Event.stop(_3a)
    },
    finishDrag: function(E, C) {
        this.dragging = false;
        if (this.options.quiet) {
            Position.prepare();
            var D = [Event.pointerX(E), Event.pointerY(E)];
            Droppables.show(D, this.element)
        }
        if (this.options.ghosting) {
            Position.relativize(this.element);
            Element.remove(this._clone);
            this._clone = null
        }
        var B = false;
        if (C) {
            B = Droppables.fire(E, this.element);
            if (!B) {
                B = false
            }
        }
        if (B && this.options.onDropped) {
            this.options.onDropped(this.element)
        }
        Draggables.notify("onEnd", this, E);
        var A = this.options.revert;
        if (A && typeof A == "function") {
            A = A(this.element)
        }
        var F = this.currentDelta();
        if (A && this.options.reverteffect) {
            if (B == 0 || A != "failure") {
                this.options.reverteffect(this.element, F[1] - this.delta[1], F[0] - this.delta[0])
            }
        } else {
            this.delta = F
        }
        if (this.options.zindex) {
            this.element.style.zIndex = this.originalZ
        }
        if (this.options.endeffect) {
            this.options.endeffect(this.element)
        }
        Draggables.deactivate(this);
        Droppables.reset()
    },
    keyPress: function(A) {
        if (A.keyCode != Event.KEY_ESC) {
            return
        }
        this.finishDrag(A, false);
        Event.stop(A)
    },
    endDrag: function(A) {
        if (!this.dragging) {
            return
        }
        this.stopScrolling();
        this.finishDrag(A, true);
        Event.stop(A)
    },
    draw: function(F) {
        var E = Position.cumulativeOffset(this.element);
        if (this.options.ghosting) {
            var B = Position.realOffset(this.element);
            E[0] += B[0] - Position.deltaX;
            E[1] += B[1] - Position.deltaY
        }
        var D = this.currentDelta();
        E[0] -= D[0];
        E[1] -= D[1];
        if (this.options.scroll && (this.options.scroll != window && this._isScrollChild)) {
            E[0] -= this.options.scroll.scrollLeft - this.originalScrollLeft;
            E[1] -= this.options.scroll.scrollTop - this.originalScrollTop
        }
        var C = [0, 1].map(function(G) {
            return (F[G] - E[G] - this.offset[G])
        }.bind(this));
        if (this.options.snap) {
            if (typeof this.options.snap == "function") {
                C = this.options.snap(C[0], C[1], this)
            } else {
                if (this.options.snap instanceof Array) {
                    C = C.map(function(G, H) {
                        return Math.round(G / this.options.snap[H]) * this.options.snap[H]
                    }.bind(this))
                } else {
                    C = C.map(function(G) {
                        return Math.round(G / this.options.snap) * this.options.snap
                    }.bind(this))
                }
            }
        }
        var A = this.element.style;
        if ((!this.options.constraint) || (this.options.constraint == "horizontal")) {
            A.left = C[0] + "px"
        }
        if ((!this.options.constraint) || (this.options.constraint == "vertical")) {
            A.top = C[1] + "px"
        }
        if (A.visibility == "hidden") {
            A.visibility = ""
        }
    },
    stopScrolling: function() {
        if (this.scrollInterval) {
            clearInterval(this.scrollInterval);
            this.scrollInterval = null;
            Draggables._lastScrollPointer = null
        }
    },
    startScrolling: function(A) {
        if (!(A[0] || A[1])) {
            return
        }
        this.scrollSpeed = [A[0] * this.options.scrollSpeed, A[1] * this.options.scrollSpeed];
        this.lastScrolled = new Date();
        this.scrollInterval = setInterval(this.scroll.bind(this), 10)
    },
    scroll: function() {
        var _51 = new Date();
        var _52 = _51 - this.lastScrolled;
        this.lastScrolled = _51;
        if (this.options.scroll == window) {
            with(this._getWindowScroll(this.options.scroll)) {
                if (this.scrollSpeed[0] || this.scrollSpeed[1]) {
                    var d = _52 / 1000;
                    this.options.scroll.scrollTo(left + d * this.scrollSpeed[0], top + d * this.scrollSpeed[1])
                }
            }
        } else {
            this.options.scroll.scrollLeft += this.scrollSpeed[0] * _52 / 1000;
            this.options.scroll.scrollTop += this.scrollSpeed[1] * _52 / 1000
        }
        Position.prepare();
        Droppables.show(Draggables._lastPointer, this.element);
        Draggables.notify("onDrag", this);
        if (this._isScrollChild) {
            Draggables._lastScrollPointer = Draggables._lastScrollPointer || $A(Draggables._lastPointer);
            Draggables._lastScrollPointer[0] += this.scrollSpeed[0] * _52 / 1000;
            Draggables._lastScrollPointer[1] += this.scrollSpeed[1] * _52 / 1000;
            if (Draggables._lastScrollPointer[0] < 0) {
                Draggables._lastScrollPointer[0] = 0
            }
            if (Draggables._lastScrollPointer[1] < 0) {
                Draggables._lastScrollPointer[1] = 0
            }
            this.draw(Draggables._lastScrollPointer)
        }
        if (this.options.change) {
            this.options.change(this)
        }
    },
    _getWindowScroll: function(w) {
        var T, L, W, H;
        with(w.document) {
            if (w.document.documentElement && documentElement.scrollTop) {
                T = documentElement.scrollTop;
                L = documentElement.scrollLeft
            } else {
                if (w.document.body) {
                    T = body.scrollTop;
                    L = body.scrollLeft
                }
            }
            if (w.innerWidth) {
                W = w.innerWidth;
                H = w.innerHeight
            } else {
                if (w.document.documentElement && documentElement.clientWidth) {
                    W = documentElement.clientWidth;
                    H = documentElement.clientHeight
                } else {
                    W = body.offsetWidth;
                    H = body.offsetHeight
                }
            }
        }
        return {
            top: T,
            left: L,
            width: W,
            height: H
        }
    }
};
var SortableObserver = Class.create();
SortableObserver.prototype = {
    initialize: function(B, A) {
        this.element = $(B);
        this.observer = A;
        this.lastValue = Sortable.serialize(this.element)
    },
    onStart: function() {
        this.lastValue = Sortable.serialize(this.element)
    },
    onEnd: function() {
        Sortable.unmark();
        if (this.lastValue != Sortable.serialize(this.element)) {
            this.observer(this.element)
        }
    }
};
var Sortable = {
    SERIALIZE_RULE: /^[^_\-](?:[A-Za-z0-9\-\_]*)[_](.*)$/,
    sortables: {},
    _findRootElement: function(A) {
        while (A.tagName.toUpperCase() != "BODY") {
            if (A.id && Sortable.sortables[A.id]) {
                return A
            }
            A = A.parentNode
        }
    },
    options: function(A) {
        A = Sortable._findRootElement($(A));
        if (!A) {
            return
        }
        return Sortable.sortables[A.id]
    },
    destroy: function(A) {
        var B = Sortable.options(A);
        if (B) {
            Draggables.removeObserver(B.element);
            B.droppables.each(function(C) {
                Droppables.remove(C)
            });
            B.draggables.invoke("destroy");
            delete Sortable.sortables[B.element.id]
        }
    },
    create: function(E) {
        E = $(E);
        var D = Object.extend({
            element: E,
            tag: "li",
            dropOnEmpty: false,
            tree: false,
            treeTag: "ul",
            overlap: "vertical",
            constraint: "vertical",
            containment: E,
            handle: false,
            only: false,
            delay: 0,
            hoverclass: null,
            ghosting: false,
            quiet: false,
            scroll: false,
            scrollSensitivity: 20,
            scrollSpeed: 15,
            format: this.SERIALIZE_RULE,
            elements: false,
            handles: false,
            onChange: Prototype.emptyFunction,
            onUpdate: Prototype.emptyFunction
        }, arguments[1] || {});
        this.destroy(E);
        var C = {
            revert: true,
            quiet: D.quiet,
            scroll: D.scroll,
            scrollSpeed: D.scrollSpeed,
            scrollSensitivity: D.scrollSensitivity,
            delay: D.delay,
            ghosting: D.ghosting,
            constraint: D.constraint,
            handle: D.handle
        };
        if (D.starteffect) {
            C.starteffect = D.starteffect
        }
        if (D.reverteffect) {
            C.reverteffect = D.reverteffect
        } else {
            if (D.ghosting) {
                C.reverteffect = function(F) {
                    F.style.top = 0;
                    F.style.left = 0
                }
            }
        }
        if (D.endeffect) {
            C.endeffect = D.endeffect
        }
        if (D.zindex) {
            C.zindex = D.zindex
        }
        var B = {
            overlap: D.overlap,
            containment: D.containment,
            tree: D.tree,
            hoverclass: D.hoverclass,
            onHover: Sortable.onHover
        };
        var A = {
            onHover: Sortable.onEmptyHover,
            overlap: D.overlap,
            containment: D.containment,
            hoverclass: D.hoverclass
        };
        Element.cleanWhitespace(E);
        D.draggables = [];
        D.droppables = [];
        if (D.dropOnEmpty || D.tree) {
            Droppables.add(E, A);
            D.droppables.push(E)
        }(D.elements || this.findElements(E, D) || []).each(function(H, G) {
            var F = D.handles ? $(D.handles[G]) : (D.handle ? $(H).getElementsByClassName(D.handle)[0] : H);
            D.draggables.push(new Draggable(H, Object.extend(C, {
                handle: F
            })));
            Droppables.add(H, B);
            if (D.tree) {
                H.treeNode = E
            }
            D.droppables.push(H)
        });
        if (D.tree) {
            (Sortable.findTreeElements(E, D) || []).each(function(F) {
                Droppables.add(F, A);
                F.treeNode = E;
                D.droppables.push(F)
            })
        }
        this.sortables[E.id] = D;
        Draggables.addObserver(new SortableObserver(E, D.onUpdate))
    },
    findElements: function(B, A) {
        return Element.findChildren(B, A.only, A.tree ? true : false, A.tag)
    },
    findTreeElements: function(A, B) {
        return Element.findChildren(A, B.only, B.tree ? true : false, B.treeTag)
    },
    onHover: function(E, D, C) {
        if (Element.isParent(D, E)) {
            return
        }
        if (C > 0.33 && C < 0.66 && Sortable.options(D).tree) {
            return
        } else {
            if (C > 0.5) {
                Sortable.mark(D, "before");
                if (D.previousSibling != E) {
                    var B = E.parentNode;
                    E.style.visibility = "hidden";
                    D.parentNode.insertBefore(E, D);
                    if (D.parentNode != B) {
                        Sortable.options(B).onChange(E)
                    }
                    Sortable.options(D.parentNode).onChange(E)
                }
            } else {
                Sortable.mark(D, "after");
                var F = D.nextSibling || null;
                if (F != E) {
                    var A = E.parentNode;
                    E.style.visibility = "hidden";
                    D.parentNode.insertBefore(E, F);
                    if (D.parentNode != A) {
                        Sortable.options(A).onChange(E)
                    }
                    Sortable.options(D.parentNode).onChange(E)
                }
            }
        }
    },
    onEmptyHover: function(I, H, G) {
        var F = I.parentNode;
        var E = Sortable.options(H);
        if (!Element.isParent(H, I)) {
            var D;
            var C = Sortable.findElements(H, {
                tag: E.tag,
                only: E.only
            });
            var B = null;
            if (C) {
                var A = Element.offsetSize(H, E.overlap) * (1 - G);
                for (D = 0; D < C.length; D += 1) {
                    if (A - Element.offsetSize(C[D], E.overlap) >= 0) {
                        A -= Element.offsetSize(C[D], E.overlap)
                    } else {
                        if (A - (Element.offsetSize(C[D], E.overlap) / 2) >= 0) {
                            B = D + 1 < C.length ? C[D + 1] : null;
                            break
                        } else {
                            B = C[D];
                            break
                        }
                    }
                }
            }
            H.insertBefore(I, B);
            Sortable.options(F).onChange(I);
            E.onChange(I)
        }
    },
    unmark: function() {
        if (Sortable._marker) {
            Sortable._marker.hide()
        }
    },
    mark: function(D, C) {
        var B = Sortable.options(D.parentNode);
        if (B && !B.ghosting) {
            return
        }
        if (!Sortable._marker) {
            Sortable._marker = ($("dropmarker") || Element.extend(document.createElement("DIV"))).hide().addClassName("dropmarker").setStyle({
                position: "absolute"
            });
            document.getElementsByTagName("body").item(0).appendChild(Sortable._marker)
        }
        var A = Position.cumulativeOffset(D);
        Sortable._marker.setStyle({
            left: A[0] + "px",
            top: A[1] + "px"
        });
        if (C == "after") {
            if (B.overlap == "horizontal") {
                Sortable._marker.setStyle({
                    left: (A[0] + D.clientWidth) + "px"
                })
            } else {
                Sortable._marker.setStyle({
                    top: (A[1] + D.clientHeight) + "px"
                })
            }
        }
        Sortable._marker.show()
    },
    _tree: function(D, B, C) {
        var A = Sortable.findElements(D, B) || [];
        for (var E = 0; E < A.length; ++E) {
            var G = A[E].id.match(B.format);
            if (!G) {
                continue
            }
            var F = {
                id: encodeURIComponent(G ? G[1] : null),
                element: D,
                parent: C,
                children: [],
                position: C.children.length,
                container: $(A[E]).down(B.treeTag)
            };
            if (F.container) {
                this._tree(F.container, B, F)
            }
            C.children.push(F)
        }
        return C
    },
    tree: function(D) {
        D = $(D);
        var C = this.options(D);
        var B = Object.extend({
            tag: C.tag,
            treeTag: C.treeTag,
            only: C.only,
            name: D.id,
            format: C.format
        }, arguments[1] || {});
        var A = {
            id: null,
            parent: null,
            children: [],
            container: D,
            position: 0
        };
        return Sortable._tree(D, B, A)
    },
    _constructIndex: function(A) {
        var B = "";
        do {
            if (A.id) {
                B = "[" + A.position + "]" + B
            }
        } while ((A = A.parent) != null);
        return B
    },
    sequence: function(B) {
        B = $(B);
        var A = Object.extend(this.options(B), arguments[1] || {});
        return $(this.findElements(B, A) || []).map(function(C) {
            return C.id.match(A.format) ? C.id.match(A.format)[1] : ""
        })
    },
    setSequence: function(D, B) {
        D = $(D);
        var C = Object.extend(this.options(D), arguments[2] || {});
        var A = {};
        this.findElements(D, C).each(function(E) {
            if (E.id.match(C.format)) {
                A[E.id.match(C.format)[1]] = [E, E.parentNode]
            }
            E.parentNode.removeChild(E)
        });
        B.each(function(E) {
            var F = A[E];
            if (F) {
                F[1].appendChild(F[0]);
                delete A[E]
            }
        })
    },
    serialize: function(C) {
        C = $(C);
        var B = Object.extend(Sortable.options(C), arguments[1] || {});
        var A = encodeURIComponent((arguments[1] && arguments[1].name) ? arguments[1].name : C.id);
        if (B.tree) {
            return Sortable.tree(C, arguments[1]).children.map(function(D) {
                return [A + Sortable._constructIndex(D) + "[id]=" + encodeURIComponent(D.id)].concat(D.children.map(arguments.callee))
            }).flatten().join("&")
        } else {
            return Sortable.sequence(C, arguments[1]).map(function(D) {
                return A + "[]=" + encodeURIComponent(D)
            }).join("&")
        }
    }
};
Element.isParent = function(B, A) {
    if (!B.parentNode || B == A) {
        return false
    }
    if (B.parentNode == A) {
        return true
    }
    return Element.isParent(B.parentNode, A)
};
Element.findChildren = function(E, D, B, A) {
    if (!E.hasChildNodes()) {
        return null
    }
    A = A.toUpperCase();
    if (D) {
        D = [D].flatten()
    }
    var C = [];
    $A(E.childNodes).each(function(G) {
        if (G.tagName && G.tagName.toUpperCase() == A && (!D || (Element.classNames(G).detect(function(H) {
                return D.include(H)
            })))) {
            C.push(G)
        }
        if (B) {
            var F = Element.findChildren(G, D, B, A);
            if (F) {
                C.push(F)
            }
        }
    });
    return (C.length > 0 ? C.flatten() : [])
};
Element.offsetSize = function(B, A) {
    return B["offset" + ((A == "vertical" || A == "height") ? "Height" : "Width")]
};
String.prototype.parseColor = function() {
    var C = "#";
    if (this.slice(0, 4) == "rgb(") {
        var B = this.slice(4, this.length - 1).split(",");
        var A = 0;
        do {
            C += parseInt(B[A]).toColorPart()
        } while (++A < 3)
    } else {
        if (this.slice(0, 1) == "#") {
            if (this.length == 4) {
                for (var A = 1; A < 4; A++) {
                    C += (this.charAt(A) + this.charAt(A)).toLowerCase()
                }
            }
            if (this.length == 7) {
                C = this.toLowerCase()
            }
        }
    }
    return (C.length == 7 ? C : (arguments[0] || this))
};
Element.collectTextNodes = function(A) {
    return $A($(A).childNodes).collect(function(B) {
        return (B.nodeType == 3 ? B.nodeValue : (B.hasChildNodes() ? Element.collectTextNodes(B) : ""))
    }).flatten().join("")
};
Element.collectTextNodesIgnoreClass = function(B, A) {
    return $A($(B).childNodes).collect(function(C) {
        return (C.nodeType == 3 ? C.nodeValue : ((C.hasChildNodes() && !Element.hasClassName(C, A)) ? Element.collectTextNodesIgnoreClass(C, A) : ""))
    }).flatten().join("")
};
Element.setContentZoom = function(B, A) {
    B = $(B);
    B.setStyle({
        fontSize: (A / 100) + "em"
    });
    if (Prototype.Browser.WebKit) {
        window.scrollBy(0, 0)
    }
    return B
};
Element.getInlineOpacity = function(A) {
    return $(A).style.opacity || ""
};
Element.forceRerendering = function(A) {
    try {
        A = $(A);
        var C = document.createTextNode(" ");
        A.appendChild(C);
        A.removeChild(C)
    } catch (B) {}
};
Array.prototype.call = function() {
    var A = arguments;
    this.each(function(B) {
        B.apply(this, A)
    })
};
var Effect = {
    _elementDoesNotExistError: {
        name: "ElementDoesNotExistError",
        message: "The specified DOM element does not exist, but is required for this effect to operate"
    },
    tagifyText: function(B) {
        if (typeof Builder == "undefined") {}
        var A = "position:relative";
        if (Prototype.Browser.IE) {
            A += ";zoom:1"
        }
        B = $(B);
        $A(B.childNodes).each(function(C) {
            if (C.nodeType == 3) {
                C.nodeValue.toArray().each(function(D) {
                    B.insertBefore(Builder.node("span", {
                        style: A
                    }, D == " " ? String.fromCharCode(160) : D), C)
                });
                Element.remove(C)
            }
        })
    },
    multiple: function(E, D) {
        var C;
        if (((typeof E == "object") || (typeof E == "function")) && (E.length)) {
            C = E
        } else {
            C = $(E).childNodes
        }
        var B = Object.extend({
            speed: 0.1,
            delay: 0
        }, arguments[2] || {});
        var A = B.delay;
        $A(C).each(function(G, F) {
            new D(G, Object.extend(B, {
                delay: F * B.speed + A
            }))
        })
    },
    PAIRS: {
        "slide": ["SlideDown", "SlideUp"],
        "blind": ["BlindDown", "BlindUp"],
        "appear": ["Appear", "Fade"]
    },
    toggle: function(C, B) {
        C = $(C);
        B = (B || "appear").toLowerCase();
        var A = Object.extend({
            queue: {
                position: "end",
                scope: (C.id || "global"),
                limit: 1
            }
        }, arguments[2] || {});
        Effect[C.visible() ? Effect.PAIRS[B][1] : Effect.PAIRS[B][0]](C, A)
    }
};
var Effect2 = Effect;
Effect.Transitions = {
    linear: Prototype.K,
    sinoidal: function(A) {
        return (-Math.cos(A * Math.PI) / 2) + 0.5
    },
    reverse: function(A) {
        return 1 - A
    },
    flicker: function(A) {
        var A = ((-Math.cos(A * Math.PI) / 4) + 0.75) + Math.random() / 4;
        return (A > 1 ? 1 : A)
    },
    wobble: function(A) {
        return (-Math.cos(A * Math.PI * (9 * A)) / 2) + 0.5
    },
    pulse: function(B, A) {
        A = A || 5;
        return (Math.round((B % (1 / A)) * A) == 0 ? ((B * A * 2) - Math.floor(B * A * 2)) : 1 - ((B * A * 2) - Math.floor(B * A * 2)))
    },
    none: function(A) {
        return 0
    },
    full: function(A) {
        return 1
    }
};
Effect.ScopedQueue = Class.create();
Object.extend(Object.extend(Effect.ScopedQueue.prototype, Enumerable), {
    initialize: function() {
        this.effects = [];
        this.interval = null
    },
    _each: function(A) {
        this.effects._each(A)
    },
    add: function(A) {
        var C = new Date().getTime();
        var B = (typeof A.options.queue == "string") ? A.options.queue : A.options.queue.position;
        switch (B) {
            case "front":
                this.effects.findAll(function(D) {
                    return D.state == "idle"
                }).each(function(D) {
                    D.startOn += A.finishOn;
                    D.finishOn += A.finishOn
                });
                break;
            case "with-last":
                C = this.effects.pluck("startOn").max() || C;
                break;
            case "end":
                C = this.effects.pluck("finishOn").max() || C;
                break
        }
        A.startOn += C;
        A.finishOn += C;
        if (!A.options.queue.limit || (this.effects.length < A.options.queue.limit)) {
            this.effects.push(A)
        }
        if (!this.interval) {
            this.interval = setInterval(this.loop.bind(this), 15)
        }
    },
    remove: function(A) {
        this.effects = this.effects.reject(function(B) {
            return B == A
        });
        if (this.effects.length == 0) {
            clearInterval(this.interval);
            this.interval = null
        }
    },
    loop: function() {
        var B = new Date().getTime();
        for (var C = 0, A = this.effects.length; C < A; C++) {
            this.effects[C] && this.effects[C].loop(B)
        }
    }
});
Effect.Queues = {
    instances: $H(),
    get: function(A) {
        if (typeof A != "string") {
            return A
        }
        if (!this.instances[A]) {
            this.instances[A] = new Effect.ScopedQueue()
        }
        return this.instances[A]
    }
};
Effect.Queue = Effect.Queues.get("global");
Effect.DefaultOptions = {
    transition: Effect.Transitions.sinoidal,
    duration: 1,
    fps: 100,
    sync: false,
    from: 0,
    to: 1,
    delay: 0,
    queue: "parallel"
};
Effect.Base = function() {};
Effect.Base.prototype = {
    position: null,
    start: function(_33) {
        function codeForEvent(_34, _35) {
            return ((_34[_35 + "Internal"] ? "this.options." + _35 + "Internal(this);" : "") + (_34[_35] ? "this.options." + _35 + "(this);" : ""))
        }
        if (_33.transition === false) {
            _33.transition = Effect.Transitions.linear
        }
        this.options = Object.extend(Object.extend({}, Effect.DefaultOptions), _33 || {});
        this.currentFrame = 0;
        this.state = "idle";
        this.startOn = this.options.delay * 1000;
        this.finishOn = this.startOn + (this.options.duration * 1000);
        this.fromToDelta = this.options.to - this.options.from;
        this.totalTime = this.finishOn - this.startOn;
        this.totalFrames = this.options.fps * this.options.duration;
        eval("this.render = function(pos){ " + "if(this.state==\"idle\"){this.state=\"running\";" + codeForEvent(_33, "beforeSetup") + (this.setup ? "this.setup();" : "") + codeForEvent(_33, "afterSetup") + "};if(this.state==\"running\"){" + "pos=this.options.transition(pos)*" + this.fromToDelta + "+" + this.options.from + ";" + "this.position=pos;" + codeForEvent(_33, "beforeUpdate") + (this.update ? "this.update(pos);" : "") + codeForEvent(_33, "afterUpdate") + "}}");
        this.event("beforeStart");
        if (!this.options.sync) {
            Effect.Queues.get(typeof this.options.queue == "string" ? "global" : this.options.queue.scope).add(this)
        }
    },
    loop: function(A) {
        if (A >= this.startOn) {
            if (A >= this.finishOn) {
                this.render(1);
                this.cancel();
                this.event("beforeFinish");
                if (this.finish) {
                    this.finish()
                }
                this.event("afterFinish");
                return
            }
            var C = (A - this.startOn) / this.totalTime,
                B = Math.round(C * this.totalFrames);
            if (B > this.currentFrame) {
                this.render(C);
                this.currentFrame = B
            }
        }
    },
    cancel: function() {
        if (!this.options.sync) {
            Effect.Queues.get(typeof this.options.queue == "string" ? "global" : this.options.queue.scope).remove(this)
        }
        this.state = "finished"
    },
    event: function(A) {
        if (this.options[A + "Internal"]) {
            this.options[A + "Internal"](this)
        }
        if (this.options[A]) {
            this.options[A](this)
        }
    },
    inspect: function() {
        var A = $H();
        for (property in this) {
            if (typeof this[property] != "function") {
                A[property] = this[property]
            }
        }
        return "#<Effect:" + A.inspect() + ",options:" + $H(this.options).inspect() + ">"
    }
};
Effect.Parallel = Class.create();
Object.extend(Object.extend(Effect.Parallel.prototype, Effect.Base.prototype), {
    initialize: function(A) {
        this.effects = A || [];
        this.start(arguments[1])
    },
    update: function(A) {
        this.effects.invoke("render", A)
    },
    finish: function(A) {
        this.effects.each(function(B) {
            B.render(1);
            B.cancel();
            B.event("beforeFinish");
            if (B.finish) {
                B.finish(A)
            }
            B.event("afterFinish")
        })
    }
});
Effect.Event = Class.create();
Object.extend(Object.extend(Effect.Event.prototype, Effect.Base.prototype), {
    initialize: function() {
        var A = Object.extend({
            duration: 0
        }, arguments[0] || {});
        this.start(A)
    },
    update: Prototype.emptyFunction
});
Effect.Opacity = Class.create();
Object.extend(Object.extend(Effect.Opacity.prototype, Effect.Base.prototype), {
    initialize: function(A) {
        this.element = $(A);
        if (!this.element) {
            throw (Effect._elementDoesNotExistError)
        }
        if (Prototype.Browser.IE && (!this.element.currentStyle.hasLayout)) {
            this.element.setStyle({
                zoom: 1
            })
        }
        var B = Object.extend({
            from: this.element.getOpacity() || 0,
            to: 1
        }, arguments[1] || {});
        this.start(B)
    },
    update: function(A) {
        this.element.setOpacity(A)
    }
});
Effect.Move = Class.create();
Object.extend(Object.extend(Effect.Move.prototype, Effect.Base.prototype), {
    initialize: function(B) {
        this.element = $(B);
        if (!this.element) {
            throw (Effect._elementDoesNotExistError)
        }
        var A = Object.extend({
            x: 0,
            y: 0,
            mode: "relative"
        }, arguments[1] || {});
        this.start(A)
    },
    setup: function() {
        this.element.makePositioned();
        this.originalLeft = parseFloat(this.element.getStyle("left") || "0");
        this.originalTop = parseFloat(this.element.getStyle("top") || "0");
        if (this.options.mode == "absolute") {
            this.options.x = this.options.x - this.originalLeft;
            this.options.y = this.options.y - this.originalTop
        }
    },
    update: function(A) {
        this.element.setStyle({
            left: Math.round(this.options.x * A + this.originalLeft) + "px",
            top: Math.round(this.options.y * A + this.originalTop) + "px"
        })
    }
});
Effect.MoveBy = function(A, C, B) {
    return new Effect.Move(A, Object.extend({
        x: B,
        y: C
    }, arguments[3] || {}))
};
Effect.Scale = Class.create();
Object.extend(Object.extend(Effect.Scale.prototype, Effect.Base.prototype), {
    initialize: function(C, B) {
        this.element = $(C);
        if (!this.element) {
            throw (Effect._elementDoesNotExistError)
        }
        var A = Object.extend({
            scaleX: true,
            scaleY: true,
            scaleContent: true,
            scaleFromCenter: false,
            scaleMode: "box",
            scaleFrom: 100,
            scaleTo: B
        }, arguments[2] || {});
        this.start(A)
    },
    setup: function() {
        this.restoreAfterFinish = this.options.restoreAfterFinish || false;
        this.elementPositioning = this.element.getStyle("position");
        this.originalStyle = {};
        ["top", "left", "width", "height", "fontSize"].each(function(B) {
            this.originalStyle[B] = this.element.style[B]
        }.bind(this));
        this.originalTop = this.element.offsetTop;
        this.originalLeft = this.element.offsetLeft;
        var A = this.element.getStyle("font-size") || "100%";
        ["em", "px", "%", "pt"].each(function(B) {
            if (A.indexOf(B) > 0) {
                this.fontSize = parseFloat(A);
                this.fontSizeType = B
            }
        }.bind(this));
        this.factor = (this.options.scaleTo - this.options.scaleFrom) / 100;
        this.dims = null;
        if (this.options.scaleMode == "box") {
            this.dims = [this.element.offsetHeight, this.element.offsetWidth]
        }
        if (/^content/.test(this.options.scaleMode)) {
            this.dims = [this.element.scrollHeight, this.element.scrollWidth]
        }
        if (!this.dims) {
            this.dims = [this.options.scaleMode.originalHeight, this.options.scaleMode.originalWidth]
        }
    },
    update: function(B) {
        var A = (this.options.scaleFrom / 100) + (this.factor * B);
        if (this.options.scaleContent && this.fontSize) {
            this.element.setStyle({
                fontSize: this.fontSize * A + this.fontSizeType
            })
        }
        this.setDimensions(this.dims[0] * A, this.dims[1] * A)
    },
    finish: function(A) {
        if (this.restoreAfterFinish) {
            this.element.setStyle(this.originalStyle)
        }
    },
    setDimensions: function(D, C) {
        var E = {};
        if (this.options.scaleX) {
            E.width = Math.round(C) + "px"
        }
        if (this.options.scaleY) {
            E.height = Math.round(D) + "px"
        }
        if (this.options.scaleFromCenter) {
            var B = (D - this.dims[0]) / 2;
            var A = (C - this.dims[1]) / 2;
            if (this.elementPositioning == "absolute") {
                if (this.options.scaleY) {
                    E.top = this.originalTop - B + "px"
                }
                if (this.options.scaleX) {
                    E.left = this.originalLeft - A + "px"
                }
            } else {
                if (this.options.scaleY) {
                    E.top = -B + "px"
                }
                if (this.options.scaleX) {
                    E.left = -A + "px"
                }
            }
        }
        this.element.setStyle(E)
    }
});
Effect.Highlight = Class.create();
Object.extend(Object.extend(Effect.Highlight.prototype, Effect.Base.prototype), {
    initialize: function(B) {
        this.element = $(B);
        if (!this.element) {
            throw (Effect._elementDoesNotExistError)
        }
        var A = Object.extend({
            startcolor: "#ffff99"
        }, arguments[1] || {});
        this.start(A)
    },
    setup: function() {
        if (this.element.getStyle("display") == "none") {
            this.cancel();
            return
        }
        this.oldStyle = {};
        if (!this.options.keepBackgroundImage) {
            this.oldStyle.backgroundImage = this.element.getStyle("background-image");
            this.element.setStyle({
                backgroundImage: "none"
            })
        }
        if (!this.options.endcolor) {
            this.options.endcolor = this.element.getStyle("background-color").parseColor("#ffffff")
        }
        if (!this.options.restorecolor) {
            this.options.restorecolor = this.element.getStyle("background-color")
        }
        this._base = $R(0, 2).map(function(A) {
            return parseInt(this.options.startcolor.slice(A * 2 + 1, A * 2 + 3), 16)
        }.bind(this));
        this._delta = $R(0, 2).map(function(A) {
            return parseInt(this.options.endcolor.slice(A * 2 + 1, A * 2 + 3), 16) - this._base[A]
        }.bind(this))
    },
    update: function(A) {
        this.element.setStyle({
            backgroundColor: $R(0, 2).inject("#", function(B, C, D) {
                return B + (Math.round(this._base[D] + (this._delta[D] * A)).toColorPart())
            }.bind(this))
        })
    },
    finish: function() {
        this.element.setStyle(Object.extend(this.oldStyle, {
            backgroundColor: this.options.restorecolor
        }))
    }
});
Effect.ScrollTo = Class.create();
Object.extend(Object.extend(Effect.ScrollTo.prototype, Effect.Base.prototype), {
    initialize: function(A) {
        this.element = $(A);
        this.start(arguments[1] || {})
    },
    setup: function() {
        Position.prepare();
        var B = Position.cumulativeOffset(this.element);
        if (this.options.offset) {
            B[1] += this.options.offset
        }
        var A = window.innerHeight ? window.height - window.innerHeight : document.body.scrollHeight - (document.documentElement.clientHeight ? document.documentElement.clientHeight : document.body.clientHeight);
        this.scrollStart = Position.deltaY;
        this.delta = (B[1] > A ? A : B[1]) - this.scrollStart
    },
    update: function(A) {
        Position.prepare();
        window.scrollTo(Position.deltaX, this.scrollStart + (A * this.delta))
    }
});
Effect.Fade = function(C) {
    C = $(C);
    var B = C.getInlineOpacity();
    var A = Object.extend({
        from: C.getOpacity() || 1,
        to: 0,
        afterFinishInternal: function(D) {
            if (D.options.to != 0) {
                return
            }
            D.element.hide().setStyle({
                opacity: B
            })
        }
    }, arguments[1] || {});
    return new Effect.Opacity(C, A)
};
Effect.Appear = function(B) {
    B = $(B);
    var A = Object.extend({
        from: (B.getStyle("display") == "none" ? 0 : B.getOpacity() || 0),
        to: 1,
        afterFinishInternal: function(C) {
            C.element.forceRerendering()
        },
        beforeSetup: function(C) {
            C.element.setOpacity(C.options.from).show()
        }
    }, arguments[1] || {});
    return new Effect.Opacity(B, A)
};
Effect.Puff = function(B) {
    B = $(B);
    var A = {
        opacity: B.getInlineOpacity(),
        position: B.getStyle("position"),
        top: B.style.top,
        left: B.style.left,
        width: B.style.width,
        height: B.style.height
    };
    return new Effect.Parallel([new Effect.Scale(B, 200, {
        sync: true,
        scaleFromCenter: true,
        scaleContent: true,
        restoreAfterFinish: true
    }), new Effect.Opacity(B, {
        sync: true,
        to: 0
    })], Object.extend({
        duration: 1,
        beforeSetupInternal: function(C) {
            Position.absolutize(C.effects[0].element)
        },
        afterFinishInternal: function(C) {
            C.effects[0].element.hide().setStyle(A)
        }
    }, arguments[1] || {}))
};
Effect.BlindUp = function(A) {
    A = $(A);
    A.makeClipping();
    return new Effect.Scale(A, 0, Object.extend({
        scaleContent: false,
        scaleX: false,
        restoreAfterFinish: true,
        afterFinishInternal: function(B) {
            B.element.hide().undoClipping()
        }
    }, arguments[1] || {}))
};
Effect.BlindDown = function(A) {
    A = $(A);
    var B = A.getDimensions();
    return new Effect.Scale(A, 100, Object.extend({
        scaleContent: false,
        scaleX: false,
        scaleFrom: 0,
        scaleMode: {
            originalHeight: B.height,
            originalWidth: B.width
        },
        restoreAfterFinish: true,
        afterSetup: function(C) {
            C.element.makeClipping().setStyle({
                height: "0px"
            }).show()
        },
        afterFinishInternal: function(C) {
            C.element.undoClipping()
        }
    }, arguments[1] || {}))
};
Effect.SwitchOff = function(B) {
    B = $(B);
    var A = B.getInlineOpacity();
    return new Effect.Appear(B, Object.extend({
        duration: 0.4,
        from: 0,
        transition: Effect.Transitions.flicker,
        afterFinishInternal: function(C) {
            new Effect.Scale(C.element, 1, {
                duration: 0.3,
                scaleFromCenter: true,
                scaleX: false,
                scaleContent: false,
                restoreAfterFinish: true,
                beforeSetup: function(D) {
                    D.element.makePositioned().makeClipping()
                },
                afterFinishInternal: function(D) {
                    D.element.hide().undoClipping().undoPositioned().setStyle({
                        opacity: A
                    })
                }
            })
        }
    }, arguments[1] || {}))
};
Effect.DropOut = function(A) {
    A = $(A);
    var B = {
        top: A.getStyle("top"),
        left: A.getStyle("left"),
        opacity: A.getInlineOpacity()
    };
    return new Effect.Parallel([new Effect.Move(A, {
        x: 0,
        y: 100,
        sync: true
    }), new Effect.Opacity(A, {
        sync: true,
        to: 0
    })], Object.extend({
        duration: 0.5,
        beforeSetup: function(C) {
            C.effects[0].element.makePositioned()
        },
        afterFinishInternal: function(C) {
            C.effects[0].element.hide().undoPositioned().setStyle(B)
        }
    }, arguments[1] || {}))
};
Effect.Shake = function(B) {
    B = $(B);
    var A = {
        top: B.getStyle("top"),
        left: B.getStyle("left")
    };
    return new Effect.Move(B, {
        x: 20,
        y: 0,
        duration: 0.05,
        afterFinishInternal: function(C) {
            new Effect.Move(C.element, {
                x: -40,
                y: 0,
                duration: 0.1,
                afterFinishInternal: function(D) {
                    new Effect.Move(D.element, {
                        x: 40,
                        y: 0,
                        duration: 0.1,
                        afterFinishInternal: function(E) {
                            new Effect.Move(E.element, {
                                x: -40,
                                y: 0,
                                duration: 0.1,
                                afterFinishInternal: function(F) {
                                    new Effect.Move(F.element, {
                                        x: 40,
                                        y: 0,
                                        duration: 0.1,
                                        afterFinishInternal: function(G) {
                                            new Effect.Move(G.element, {
                                                x: -20,
                                                y: 0,
                                                duration: 0.05,
                                                afterFinishInternal: function(H) {
                                                    H.element.undoPositioned().setStyle(A)
                                                }
                                            })
                                        }
                                    })
                                }
                            })
                        }
                    })
                }
            })
        }
    })
};
Effect.SlideDown = function(C) {
    C = $(C).cleanWhitespace();
    var B = C.down().getStyle("bottom");
    var A = C.getDimensions();
    return new Effect.Scale(C, 100, Object.extend({
        scaleContent: false,
        scaleX: false,
        scaleFrom: window.opera ? 0 : 1,
        scaleMode: {
            originalHeight: A.height,
            originalWidth: A.width
        },
        restoreAfterFinish: true,
        afterSetup: function(D) {
            D.element.makePositioned();
            D.element.down().makePositioned();
            if (window.opera) {
                D.element.setStyle({
                    top: ""
                })
            }
            D.element.makeClipping().setStyle({
                height: "0px"
            }).show()
        },
        afterUpdateInternal: function(D) {
            D.element.down().setStyle({
                bottom: (D.dims[0] - D.element.clientHeight) + "px"
            })
        },
        afterFinishInternal: function(D) {
            D.element.undoClipping().undoPositioned();
            D.element.down().undoPositioned().setStyle({
                bottom: B
            })
        }
    }, arguments[1] || {}))
};
Effect.SlideUp = function(B) {
    B = $(B).cleanWhitespace();
    var A = B.down().getStyle("bottom");
    return new Effect.Scale(B, window.opera ? 0 : 1, Object.extend({
        scaleContent: false,
        scaleX: false,
        scaleMode: "box",
        scaleFrom: 100,
        restoreAfterFinish: true,
        beforeStartInternal: function(C) {
            C.element.makePositioned();
            C.element.down().makePositioned();
            if (window.opera) {
                C.element.setStyle({
                    top: ""
                })
            }
            C.element.makeClipping().show()
        },
        afterUpdateInternal: function(C) {
            C.element.down().setStyle({
                bottom: (C.dims[0] - C.element.clientHeight) + "px"
            })
        },
        afterFinishInternal: function(C) {
            C.element.hide().undoClipping().undoPositioned().setStyle({
                bottom: A
            });
            C.element.down().undoPositioned()
        }
    }, arguments[1] || {}))
};
Effect.Squish = function(A) {
    return new Effect.Scale(A, window.opera ? 1 : 0, {
        restoreAfterFinish: true,
        beforeSetup: function(B) {
            B.element.makeClipping()
        },
        afterFinishInternal: function(B) {
            B.element.hide().undoClipping()
        }
    })
};
Effect.Grow = function(B) {
    B = $(B);
    var A = Object.extend({
        direction: "center",
        moveTransition: Effect.Transitions.sinoidal,
        scaleTransition: Effect.Transitions.sinoidal,
        opacityTransition: Effect.Transitions.full
    }, arguments[1] || {});
    var H = {
        top: B.style.top,
        left: B.style.left,
        height: B.style.height,
        width: B.style.width,
        opacity: B.getInlineOpacity()
    };
    var G = B.getDimensions();
    var E, F;
    var D, C;
    switch (A.direction) {
        case "top-left":
            E = F = D = C = 0;
            break;
        case "top-right":
            E = G.width;
            F = C = 0;
            D = -G.width;
            break;
        case "bottom-left":
            E = D = 0;
            F = G.height;
            C = -G.height;
            break;
        case "bottom-right":
            E = G.width;
            F = G.height;
            D = -G.width;
            C = -G.height;
            break;
        case "center":
            E = G.width / 2;
            F = G.height / 2;
            D = -G.width / 2;
            C = -G.height / 2;
            break
    }
    return new Effect.Move(B, {
        x: E,
        y: F,
        duration: 0.01,
        beforeSetup: function(I) {
            I.element.hide().makeClipping().makePositioned()
        },
        afterFinishInternal: function(I) {
            new Effect.Parallel([new Effect.Opacity(I.element, {
                sync: true,
                to: 1,
                from: 0,
                transition: A.opacityTransition
            }), new Effect.Move(I.element, {
                x: D,
                y: C,
                sync: true,
                transition: A.moveTransition
            }), new Effect.Scale(I.element, 100, {
                scaleMode: {
                    originalHeight: G.height,
                    originalWidth: G.width
                },
                sync: true,
                scaleFrom: window.opera ? 1 : 0,
                transition: A.scaleTransition,
                restoreAfterFinish: true
            })], Object.extend({
                beforeSetup: function(J) {
                    J.effects[0].element.setStyle({
                        height: "0px"
                    }).show()
                },
                afterFinishInternal: function(J) {
                    J.effects[0].element.undoClipping().undoPositioned().setStyle(H)
                }
            }, A))
        }
    })
};
Effect.Shrink = function(F) {
    F = $(F);
    var D = Object.extend({
        direction: "center",
        moveTransition: Effect.Transitions.sinoidal,
        scaleTransition: Effect.Transitions.sinoidal,
        opacityTransition: Effect.Transitions.none
    }, arguments[1] || {});
    var B = {
        top: F.style.top,
        left: F.style.left,
        height: F.style.height,
        width: F.style.width,
        opacity: F.getInlineOpacity()
    };
    var E = F.getDimensions();
    var C, A;
    switch (D.direction) {
        case "top-left":
            C = A = 0;
            break;
        case "top-right":
            C = E.width;
            A = 0;
            break;
        case "bottom-left":
            C = 0;
            A = E.height;
            break;
        case "bottom-right":
            C = E.width;
            A = E.height;
            break;
        case "center":
            C = E.width / 2;
            A = E.height / 2;
            break
    }
    return new Effect.Parallel([new Effect.Opacity(F, {
        sync: true,
        to: 0,
        from: 1,
        transition: D.opacityTransition
    }), new Effect.Scale(F, window.opera ? 1 : 0, {
        sync: true,
        transition: D.scaleTransition,
        restoreAfterFinish: true
    }), new Effect.Move(F, {
        x: C,
        y: A,
        sync: true,
        transition: D.moveTransition
    })], Object.extend({
        beforeStartInternal: function(G) {
            G.effects[0].element.makePositioned().makeClipping()
        },
        afterFinishInternal: function(G) {
            G.effects[0].element.hide().undoClipping().undoPositioned().setStyle(B)
        }
    }, D))
};
Effect.Pulsate = function(D) {
    D = $(D);
    var C = arguments[1] || {};
    var B = D.getInlineOpacity();
    var A = C.transition || Effect.Transitions.sinoidal;
    var E = function(F) {
        return A(1 - Effect.Transitions.pulse(F, C.pulses))
    };
    E.bind(A);
    return new Effect.Opacity(D, Object.extend(Object.extend({
        duration: 2,
        from: 0,
        afterFinishInternal: function(F) {
            F.element.setStyle({
                opacity: B
            })
        }
    }, C), {
        transition: E
    }))
};
Effect.Fold = function(B) {
    B = $(B);
    var A = {
        top: B.style.top,
        left: B.style.left,
        width: B.style.width,
        height: B.style.height
    };
    B.makeClipping();
    return new Effect.Scale(B, 5, Object.extend({
        scaleContent: false,
        scaleX: false,
        afterFinishInternal: function(C) {
            new Effect.Scale(B, 1, {
                scaleContent: false,
                scaleY: false,
                afterFinishInternal: function(D) {
                    D.element.hide().undoClipping().setStyle(A)
                }
            })
        }
    }, arguments[1] || {}))
};
Effect.Morph = Class.create();
Object.extend(Object.extend(Effect.Morph.prototype, Effect.Base.prototype), {
    initialize: function(C) {
        this.element = $(C);
        if (!this.element) {
            throw (Effect._elementDoesNotExistError)
        }
        var D = Object.extend({
            style: {}
        }, arguments[1] || {});
        if (typeof D.style == "string") {
            if (D.style.indexOf(":") == -1) {
                var B = "",
                    A = "." + D.style;
                $A(document.styleSheets).reverse().each(function(E) {
                    if (E.cssRules) {
                        cssRules = E.cssRules
                    } else {
                        if (E.rules) {
                            cssRules = E.rules
                        }
                    }
                    $A(cssRules).reverse().each(function(F) {
                        if (A == F.selectorText) {
                            B = F.style.cssText;
                            throw $break
                        }
                    });
                    if (B) {
                        throw $break
                    }
                });
                this.style = B.parseStyle();
                D.afterFinishInternal = function(E) {
                    E.element.addClassName(E.options.style);
                    E.transforms.each(function(F) {
                        if (F.style != "opacity") {
                            E.element.style[F.style] = ""
                        }
                    })
                }
            } else {
                this.style = D.style.parseStyle()
            }
        } else {
            this.style = $H(D.style)
        }
        this.start(D)
    },
    setup: function() {
        function A(B) {
            if (!B || ["rgba(0, 0, 0, 0)", "transparent"].include(B)) {
                B = "#ffffff"
            }
            B = B.parseColor();
            return $R(0, 2).map(function(C) {
                return parseInt(B.slice(C * 2 + 1, C * 2 + 3), 16)
            })
        }
        this.transforms = this.style.map(function(C) {
            var B = C[0],
                G = C[1],
                F = null;
            if (G.parseColor("#zzzzzz") != "#zzzzzz") {
                G = G.parseColor();
                F = "color"
            } else {
                if (B == "opacity") {
                    G = parseFloat(G);
                    if (Prototype.Browser.IE && (!this.element.currentStyle.hasLayout)) {
                        this.element.setStyle({
                            zoom: 1
                        })
                    }
                } else {
                    if (Element.CSS_LENGTH.test(G)) {
                        var E = G.match(/^([\+\-]?[0-9\.]+)(.*)$/);
                        G = parseFloat(E[1]);
                        F = (E.length == 3) ? E[2] : null
                    }
                }
            }
            var D = this.element.getStyle(B);
            return {
                style: B.camelize(),
                originalValue: F == "color" ? A(D) : parseFloat(D || 0),
                targetValue: F == "color" ? A(G) : G,
                unit: F
            }
        }.bind(this)).reject(function(B) {
            return ((B.originalValue == B.targetValue) || (B.unit != "color" && (isNaN(B.originalValue) || isNaN(B.targetValue))))
        })
    },
    update: function(B) {
        var A = {},
            C, D = this.transforms.length;
        while (D--) {
            A[(C = this.transforms[D]).style] = C.unit == "color" ? "#" + (Math.round(C.originalValue[0] + (C.targetValue[0] - C.originalValue[0]) * B)).toColorPart() + (Math.round(C.originalValue[1] + (C.targetValue[1] - C.originalValue[1]) * B)).toColorPart() + (Math.round(C.originalValue[2] + (C.targetValue[2] - C.originalValue[2]) * B)).toColorPart() : C.originalValue + Math.round(((C.targetValue - C.originalValue) * B) * 1000) / 1000 + C.unit
        }
        this.element.setStyle(A, true)
    }
});
Effect.Transform = Class.create();
Object.extend(Effect.Transform.prototype, {
    initialize: function(A) {
        this.tracks = [];
        this.options = arguments[1] || {};
        this.addTracks(A)
    },
    addTracks: function(A) {
        A.each(function(C) {
            var B = $H(C).values().first();
            this.tracks.push($H({
                ids: $H(C).keys().first(),
                effect: Effect.Morph,
                options: {
                    style: B
                }
            }))
        }.bind(this));
        return this
    },
    play: function() {
        return new Effect.Parallel(this.tracks.map(function(B) {
            var A = [$(B.ids) || $$(B.ids)].flatten();
            return A.map(function(C) {
                return new B.effect(C, Object.extend({
                    sync: true
                }, B.options))
            })
        }).flatten(), this.options)
    }
});
Element.CSS_PROPERTIES = $w("backgroundColor backgroundPosition borderBottomColor borderBottomStyle " + "borderBottomWidth borderLeftColor borderLeftStyle borderLeftWidth " + "borderRightColor borderRightStyle borderRightWidth borderSpacing " + "borderTopColor borderTopStyle borderTopWidth bottom clip color " + "fontSize fontWeight height left letterSpacing lineHeight " + "marginBottom marginLeft marginRight marginTop markerOffset maxHeight " + "maxWidth minHeight minWidth opacity outlineColor outlineOffset " + "outlineWidth paddingBottom paddingLeft paddingRight paddingTop " + "right textIndent top width wordSpacing zIndex");
Element.CSS_LENGTH = /^(([\+\-]?[0-9\.]+)(em|ex|px|in|cm|mm|pt|pc|\%))|0$/;
String.prototype.parseStyle = function() {
    var C = document.createElement("div");
    C.innerHTML = "<div style=\"" + this + "\"></div>";
    var B = C.childNodes[0].style,
        A = $H();
    Element.CSS_PROPERTIES.each(function(D) {
        if (B[D]) {
            A[D] = B[D]
        }
    });
    if (Prototype.Browser.IE && this.indexOf("opacity") > -1) {
        A.opacity = this.match(/opacity:\s*((?:0|1)?(?:\.\d*)?)/)[1]
    }
    return A
};
Element.morph = function(A, B) {
    new Effect.Morph(A, Object.extend({
        style: B
    }, arguments[2] || {}));
    return A
};
["getInlineOpacity", "forceRerendering", "setContentZoom", "collectTextNodes", "collectTextNodesIgnoreClass", "morph"].each(function(A) {
    Element.Methods[A] = Element[A]
});
Element.Methods.visualEffect = function(C, B, A) {
    s = B.dasherize().camelize();
    effect_class = s.charAt(0).toUpperCase() + s.substring(1);
    new Effect[effect_class](C, A);
    return $(C)
};
Element.addMethods();
var Resizeable = Class.create();
Resizeable.prototype = {
    initialize: function(B) {
        var A = Object.extend({
            top: 6,
            bottom: 6,
            left: 6,
            right: 6,
            minHeight: 0,
            minWidth: 0,
            zindex: 1000,
            resize: null
        }, arguments[1] || {});
        this.element = $(B);
        this.handle = this.element;
        Element.makePositioned(this.element);
        this.options = A;
        this.active = false;
        this.resizing = false;
        this.currentDirection = "";
        this.eventMouseDown = this.startResize.bindAsEventListener(this);
        this.eventMouseUp = this.endResize.bindAsEventListener(this);
        this.eventMouseMove = this.update.bindAsEventListener(this);
        this.eventCursorCheck = this.cursor.bindAsEventListener(this);
        this.eventKeypress = this.keyPress.bindAsEventListener(this);
        this.registerEvents()
    },
    destroy: function() {
        Event.stopObserving(this.handle, "mousedown", this.eventMouseDown);
        this.unregisterEvents()
    },
    registerEvents: function() {
        Event.observe(document, "mouseup", this.eventMouseUp);
        Event.observe(document, "mousemove", this.eventMouseMove);
        Event.observe(document, "keypress", this.eventKeypress);
        Event.observe(this.handle, "mousedown", this.eventMouseDown);
        Event.observe(this.element, "mousemove", this.eventCursorCheck)
    },
    unregisterEvents: function() {},
    startResize: function(D) {
        if (Event.isLeftClick(D)) {
            var C = Event.element(D);
            if (C.tagName && (C.tagName == "INPUT" || C.tagName == "SELECT" || C.tagName == "BUTTON" || C.tagName == "TEXTAREA")) {
                return
            }
            var B = this.directions(D);
            if (B.length > 0) {
                this.active = true;
                var A = Position.cumulativeOffset(this.element);
                this.startTop = A[1];
                this.startLeft = A[0];
                this.startWidth = parseInt(Element.getStyle(this.element, "width"));
                this.startHeight = parseInt(Element.getStyle(this.element, "height"));
                this.startX = D.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                this.startY = D.clientY + document.body.scrollTop + document.documentElement.scrollTop;
                this.currentDirection = B;
                Event.stop(D)
            }
        }
    },
    finishResize: function(B, A) {
        this.active = false;
        this.resizing = false;
        if (this.options.zindex) {
            this.element.style.zIndex = this.originalZ
        }
        if (this.options.resize) {
            this.options.resize(this.element)
        }
    },
    keyPress: function(A) {
        if (this.active) {
            if (A.keyCode == Event.KEY_ESC) {
                this.finishResize(A, false);
                Event.stop(A)
            }
        }
    },
    endResize: function(A) {
        if (this.active && this.resizing) {
            this.finishResize(A, true);
            Event.stop(A)
        }
        this.active = false;
        this.resizing = false
    },
    draw: function(K) {
        var J = [Event.pointerX(K), Event.pointerY(K)];
        var I = this.element.style;
        if (this.currentDirection.indexOf("n") != -1) {
            var H = this.startY - J[1];
            var F = Element.getStyle(this.element, "margin-top") || "0";
            var G = this.startHeight + H;
            if (G > this.options.minHeight) {
                I.height = G + "px";
                I.top = (this.startTop - H - parseInt(F)) + "px"
            }
        }
        if (this.currentDirection.indexOf("w") != -1) {
            var E = this.startX - J[0];
            var D = Element.getStyle(this.element, "margin-left") || "0";
            var C = this.startWidth + E;
            if (C > this.options.minWidth) {
                I.left = (this.startLeft - E - parseInt(D)) + "px";
                I.width = C + "px"
            }
        }
        if (this.currentDirection.indexOf("s") != -1) {
            var B = this.startHeight + J[1] - this.startY;
            if (B > this.options.minHeight) {
                I.height = B + "px"
            }
        }
        if (this.currentDirection.indexOf("e") != -1) {
            var A = this.startWidth + J[0] - this.startX;
            if (A > this.options.minWidth) {
                I.width = A + "px"
            }
        }
        if (I.visibility == "hidden") {
            I.visibility = ""
        }
    },
    between: function(C, A, B) {
        return (C >= A && C < B)
    },
    directions: function(A) {
        var D = [Event.pointerX(A), Event.pointerY(A)];
        var C = Position.cumulativeOffset(this.element);
        var B = "";
        if (this.between(D[1] - C[1], 0, this.options.top)) {
            B += "n"
        }
        if (this.between((C[1] + this.element.offsetHeight) - D[1], 0, this.options.bottom)) {
            B += "s"
        }
        if (this.between(D[0] - C[0], 0, this.options.left)) {
            B += "w"
        }
        if (this.between((C[0] + this.element.offsetWidth) - D[0], 0, this.options.right)) {
            B += "e"
        }
        return B
    },
    cursor: function(B) {
        var A = this.directions(B);
        if (A.length > 0) {
            A += "-resize"
        } else {
            A = ""
        }
        this.element.style.cursor = A
    },
    update: function(A) {
        if (this.active) {
            if (!this.resizing) {
                var B = this.element.style;
                this.resizing = true;
                if (Element.getStyle(this.element, "position") == "") {
                    B.position = "relative"
                }
                if (this.options.zindex) {
                    this.originalZ = parseInt(Element.getStyle(this.element, "z-index") || 0);
                    B.zIndex = this.options.zindex
                }
            }
            this.draw(A);
            if (navigator.appVersion.indexOf("AppleWebKit") > 0) {
                window.scrollBy(0, 0)
            }
            Event.stop(A);
            return false
        }
    }
};
var Scriptaculous = {
    Version: "1.7.1_beta3",
    require: function(A) {
        document.write("<script type=\"text/javascript\" src=\"" + A + "\"></script>")
    },
    REQUIRED_PROTOTYPE: "1.5.1",
    load: function() {
        function A(C) {
            var B = C.split(".");
            return parseInt(B[0]) * 100000 + parseInt(B[1]) * 1000 + parseInt(B[2])
        }
        if ((typeof Prototype == "undefined") || (typeof Element == "undefined") || (typeof Element.Methods == "undefined") || (A(Prototype.Version) < A(Scriptaculous.REQUIRED_PROTOTYPE))) {
            throw ("script.aculo.us requires the Prototype JavaScript framework >= " + Scriptaculous.REQUIRED_PROTOTYPE)
        }
        $A(document.getElementsByTagName("script")).findAll(function(B) {
            return (B.src && B.src.match(/scriptaculous\.js(\?.*)?$/))
        }).each(function(D) {
            var C = D.src.replace(/scriptaculous\.js(\?.*)?$/, "");
            var B = D.src.match(/\?.*load=([a-z,]*)/);
            (B ? B[1] : "builder,effects,dragdrop,controls,slider,sound").split(",").each(function(E) {})
        })
    }
};
Scriptaculous.load();
if (!Control) {
    var Control = {}
}
Control.Slider = Class.create();
Control.Slider.prototype = {
    initialize: function(D, C, B) {
        var A = this;
        if (D instanceof Array) {
            this.handles = D.collect(function(E) {
                return $(E)
            })
        } else {
            this.handles = [$(D)]
        }
        this.track = $(C);
        this.options = B || {};
        this.axis = this.options.axis || "horizontal";
        this.increment = this.options.increment || 1;
        this.step = parseInt(this.options.step || "1");
        this.range = this.options.range || $R(0, 1);
        this.value = 0;
        this.values = this.handles.map(function() {
            return 0
        });
        this.spans = this.options.spans ? this.options.spans.map(function(E) {
            return $(E)
        }) : false;
        this.options.startSpan = $(this.options.startSpan || null);
        this.options.endSpan = $(this.options.endSpan || null);
        this.restricted = this.options.restricted || false;
        this.maximum = this.options.maximum || this.range.end;
        this.minimum = this.options.minimum || this.range.start;
        this.alignX = parseInt(this.options.alignX || "0");
        this.alignY = parseInt(this.options.alignY || "0");
        this.trackLength = this.maximumOffset() - this.minimumOffset();
        this.handleLength = this.isVertical() ? (this.handles[0].offsetHeight != 0 ? this.handles[0].offsetHeight : this.handles[0].style.height.replace(/px$/, "")) : (this.handles[0].offsetWidth != 0 ? this.handles[0].offsetWidth : this.handles[0].style.width.replace(/px$/, ""));
        this.active = false;
        this.dragging = false;
        this.disabled = false;
        if (this.options.disabled) {
            this.setDisabled()
        }
        this.allowedValues = this.options.values ? this.options.values.sortBy(Prototype.K) : false;
        if (this.allowedValues) {
            this.minimum = this.allowedValues.min();
            this.maximum = this.allowedValues.max()
        }
        this.eventMouseDown = this.startDrag.bindAsEventListener(this);
        this.eventMouseUp = this.endDrag.bindAsEventListener(this);
        this.eventMouseMove = this.update.bindAsEventListener(this);
        this.handles.each(function(F, E) {
            E = A.handles.length - 1 - E;
            A.setValue(parseFloat((A.options.sliderValue instanceof Array ? A.options.sliderValue[E] : A.options.sliderValue) || A.range.start), E);
            Element.makePositioned(F);
            Event.observe(F, "mousedown", A.eventMouseDown)
        });
        Event.observe(this.track, "mousedown", this.eventMouseDown);
        Event.observe(document, "mouseup", this.eventMouseUp);
        Event.observe(document, "mousemove", this.eventMouseMove);
        this.initialized = true
    },
    dispose: function() {
        var A = this;
        Event.stopObserving(this.track, "mousedown", this.eventMouseDown);
        Event.stopObserving(document, "mouseup", this.eventMouseUp);
        Event.stopObserving(document, "mousemove", this.eventMouseMove);
        this.handles.each(function(B) {
            Event.stopObserving(B, "mousedown", A.eventMouseDown)
        })
    },
    setDisabled: function() {
        this.disabled = true
    },
    setEnabled: function() {
        this.disabled = false
    },
    getNearestValue: function(C) {
        if (this.allowedValues) {
            if (C >= this.allowedValues.max()) {
                return (this.allowedValues.max())
            }
            if (C <= this.allowedValues.min()) {
                return (this.allowedValues.min())
            }
            var B = Math.abs(this.allowedValues[0] - C);
            var A = this.allowedValues[0];
            this.allowedValues.each(function(D) {
                var E = Math.abs(D - C);
                if (E <= B) {
                    A = D;
                    B = E
                }
            });
            return A
        }
        if (C > this.range.end) {
            return this.range.end
        }
        if (C < this.range.start) {
            return this.range.start
        }
        return C
    },
    setValue: function(B, A) {
        if (!this.active) {
            this.activeHandleIdx = A || 0;
            this.activeHandle = this.handles[this.activeHandleIdx];
            this.updateStyles()
        }
        A = A || this.activeHandleIdx || 0;
        if (this.initialized && this.restricted) {
            if ((A > 0) && (B < this.values[A - 1])) {
                B = this.values[A - 1]
            }
            if ((A < (this.handles.length - 1)) && (B > this.values[A + 1])) {
                B = this.values[A + 1]
            }
        }
        B = this.getNearestValue(B);
        this.values[A] = B;
        this.value = this.values[0];
        this.handles[A].style[this.isVertical() ? "top" : "left"] = this.translateToPx(B);
        this.drawSpans();
        if (!this.dragging || !this.event) {
            this.updateFinished()
        }
    },
    setValueBy: function(B, A) {
        this.setValue(this.values[A || this.activeHandleIdx || 0] + B, A || this.activeHandleIdx || 0)
    },
    translateToPx: function(A) {
        return Math.round(((this.trackLength - this.handleLength) / (this.range.end - this.range.start)) * (A - this.range.start)) + "px"
    },
    translateToValue: function(A) {
        return ((A / (this.trackLength - this.handleLength) * (this.range.end - this.range.start)) + this.range.start)
    },
    getRange: function(B) {
        var A = this.values.sortBy(Prototype.K);
        B = B || 0;
        return $R(A[B], A[B + 1])
    },
    minimumOffset: function() {
        return (this.isVertical() ? this.alignY : this.alignX)
    },
    maximumOffset: function() {
        return (this.isVertical() ? (this.track.offsetHeight != 0 ? this.track.offsetHeight : this.track.style.height.replace(/px$/, "")) - this.alignY : (this.track.offsetWidth != 0 ? this.track.offsetWidth : this.track.style.width.replace(/px$/, "")) - this.alignY)
    },
    isVertical: function() {
        return (this.axis == "vertical")
    },
    drawSpans: function() {
        var A = this;
        if (this.spans) {
            $R(0, this.spans.length - 1).each(function(B) {
                A.setSpan(A.spans[B], A.getRange(B))
            })
        }
        if (this.options.startSpan) {
            this.setSpan(this.options.startSpan, $R(0, this.values.length > 1 ? this.getRange(0).min() : this.value))
        }
        if (this.options.endSpan) {
            this.setSpan(this.options.endSpan, $R(this.values.length > 1 ? this.getRange(this.spans.length - 1).max() : this.value, this.maximum))
        }
    },
    setSpan: function(B, A) {
        if (this.isVertical()) {
            B.style.top = this.translateToPx(A.start);
            B.style.height = this.translateToPx(A.end - A.start + this.range.start)
        } else {
            B.style.left = this.translateToPx(A.start);
            B.style.width = this.translateToPx(A.end - A.start + this.range.start)
        }
    },
    updateStyles: function() {
        this.handles.each(function(A) {
            Element.removeClassName(A, "selected")
        });
        Element.addClassName(this.activeHandle, "selected")
    },
    startDrag: function(E) {
        if (Event.isLeftClick(E)) {
            if (!this.disabled) {
                this.active = true;
                var D = Event.element(E);
                var B = [Event.pointerX(E), Event.pointerY(E)];
                var C = D;
                if (C == this.track) {
                    var A = Position.cumulativeOffset(this.track);
                    this.event = E;
                    this.setValue(this.translateToValue((this.isVertical() ? B[1] - A[1] : B[0] - A[0]) - (this.handleLength / 2)));
                    var G = Position.cumulativeOffset(this.activeHandle);
                    this.offsetX = (B[0] - G[0]);
                    this.offsetY = (B[1] - G[1])
                } else {
                    while ((this.handles.indexOf(D) == -1) && D.parentNode) {
                        D = D.parentNode
                    }
                    if (this.handles.indexOf(D) != -1) {
                        this.activeHandle = D;
                        this.activeHandleIdx = this.handles.indexOf(this.activeHandle);
                        this.updateStyles();
                        var F = Position.cumulativeOffset(this.activeHandle);
                        this.offsetX = (B[0] - F[0]);
                        this.offsetY = (B[1] - F[1])
                    }
                }
            }
            Event.stop(E)
        }
    },
    update: function(A) {
        if (this.active) {
            if (!this.dragging) {
                this.dragging = true
            }
            this.draw(A);
            if (Prototype.Browser.WebKit) {
                window.scrollBy(0, 0)
            }
            Event.stop(A)
        }
    },
    draw: function(C) {
        var B = [Event.pointerX(C), Event.pointerY(C)];
        var A = Position.cumulativeOffset(this.track);
        B[0] -= this.offsetX + A[0];
        B[1] -= this.offsetY + A[1];
        this.event = C;
        this.setValue(this.translateToValue(this.isVertical() ? B[1] : B[0]));
        if (this.initialized && this.options.onSlide) {
            this.options.onSlide(this.values.length > 1 ? this.values : this.value, this)
        }
    },
    endDrag: function(A) {
        if (this.active && this.dragging) {
            this.finishDrag(A, true);
            Event.stop(A)
        }
        this.active = false;
        this.dragging = false
    },
    finishDrag: function(A, B) {
        this.active = false;
        this.dragging = false;
        this.updateFinished()
    },
    updateFinished: function() {
        if (this.initialized && this.options.onChange) {
            this.options.onChange(this.values.length > 1 ? this.values : this.value, this)
        }
        this.event = null
    }
};
Sound = {
    tracks: {},
    _enabled: true,
    template: new Template("<embed style=\"height:0\" id=\"sound_#{track}_#{id}\" src=\"#{url}\" loop=\"false\" autostart=\"true\" hidden=\"true\"/>"),
    enable: function() {
        Sound._enabled = true
    },
    disable: function() {
        Sound._enabled = false
    },
    play: function(C) {
        if (!Sound._enabled) {
            return
        }
        var B = Object.extend({
            track: "global",
            url: C,
            replace: false
        }, arguments[1] || {});
        if (B.replace && this.tracks[B.track]) {
            $R(0, this.tracks[B.track].id).each(function(E) {
                var D = $("sound_" + B.track + "_" + E);
                D.Stop && D.Stop();
                D.remove()
            });
            this.tracks[B.track] = null
        }
        if (!this.tracks[B.track]) {
            this.tracks[B.track] = {
                id: 0
            }
        } else {
            this.tracks[B.track].id++
        }
        B.id = this.tracks[B.track].id;
        if (Prototype.Browser.IE) {
            var A = document.createElement("bgsound");
            A.setAttribute("id", "sound_" + B.track + "_" + B.id);
            A.setAttribute("src", B.url);
            A.setAttribute("loop", "1");
            A.setAttribute("autostart", "true");
            $$("body")[0].appendChild(A)
        } else {
            new Insertion.Bottom($$("body")[0], Sound.template.evaluate(B))
        }
    }
};
if (Prototype.Browser.Gecko && navigator.userAgent.indexOf("Win") > 0) {
    if (navigator.plugins && $A(navigator.plugins).detect(function(A) {
            return A.name.indexOf("QuickTime") != -1
        })) {
        Sound.template = new Template("<object id=\"sound_#{track}_#{id}\" width=\"0\" height=\"0\" type=\"audio/mpeg\" data=\"#{url}\"/>")
    } else {
        Sound.play = function() {}
    }
}
Event.simulateMouse = function(D, C) {
    var B = Object.extend({
        pointerX: 0,
        pointerY: 0,
        buttons: 0,
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        metaKey: false
    }, arguments[2] || {});
    var A = document.createEvent("MouseEvents");
    A.initMouseEvent(C, true, true, document.defaultView, B.buttons, B.pointerX, B.pointerY, B.pointerX, B.pointerY, B.ctrlKey, B.altKey, B.shiftKey, B.metaKey, 0, $(D));
    if (this.mark) {
        Element.remove(this.mark)
    }
    this.mark = document.createElement("div");
    this.mark.appendChild(document.createTextNode(" "));
    document.body.appendChild(this.mark);
    this.mark.style.position = "absolute";
    this.mark.style.top = B.pointerY + "px";
    this.mark.style.left = B.pointerX + "px";
    this.mark.style.width = "5px";
    this.mark.style.height = "5px;";
    this.mark.style.borderTop = "1px solid red;";
    this.mark.style.borderLeft = "1px solid red;";
    if (this.step) {
        alert("[" + new Date().getTime().toString() + "] " + C + "/" + Test.Unit.inspect(B))
    }
    $(D).dispatchEvent(A)
};
Event.simulateKey = function(D, C) {
    var B = Object.extend({
        ctrlKey: false,
        altKey: false,
        shiftKey: false,
        metaKey: false,
        keyCode: 0,
        charCode: 0
    }, arguments[2] || {});
    var A = document.createEvent("KeyEvents");
    A.initKeyEvent(C, true, true, window, B.ctrlKey, B.altKey, B.shiftKey, B.metaKey, B.keyCode, B.charCode);
    $(D).dispatchEvent(A)
};
Event.simulateKeys = function(A, C) {
    for (var B = 0; B < C.length; B++) {
        Event.simulateKey(A, "keypress", {
            charCode: C.charCodeAt(B)
        })
    }
};
var Test = {};
Test.Unit = {};
Test.Unit.inspect = Object.inspect;
Test.Unit.Logger = Class.create();
Test.Unit.Logger.prototype = {
    initialize: function(A) {
        this.log = $(A);
        if (this.log) {
            this._createLogTable()
        }
    },
    start: function(A) {
        if (!this.log) {
            return
        }
        this.testName = A;
        this.lastLogLine = document.createElement("tr");
        this.statusCell = document.createElement("td");
        this.nameCell = document.createElement("td");
        this.nameCell.className = "nameCell";
        this.nameCell.appendChild(document.createTextNode(A));
        this.messageCell = document.createElement("td");
        this.lastLogLine.appendChild(this.statusCell);
        this.lastLogLine.appendChild(this.nameCell);
        this.lastLogLine.appendChild(this.messageCell);
        this.loglines.appendChild(this.lastLogLine)
    },
    finish: function(A, B) {
        if (!this.log) {
            return
        }
        this.lastLogLine.className = A;
        this.statusCell.innerHTML = A;
        this.messageCell.innerHTML = this._toHTML(B);
        this.addLinksToResults()
    },
    message: function(A) {
        if (!this.log) {
            return
        }
        this.messageCell.innerHTML = this._toHTML(A)
    },
    summary: function(A) {
        if (!this.log) {
            return
        }
        this.logsummary.innerHTML = this._toHTML(A)
    },
    _createLogTable: function() {
        this.log.innerHTML = "<div id=\"logsummary\"></div>" + "<table id=\"logtable\">" + "<thead><tr><th>Status</th><th>Test</th><th>Message</th></tr></thead>" + "<tbody id=\"loglines\"></tbody>" + "</table>";
        this.logsummary = $("logsummary");
        this.loglines = $("loglines")
    },
    _toHTML: function(A) {
        return A.escapeHTML().replace(/\n/g, "<br/>")
    },
    addLinksToResults: function() {
        $$("tr.failed .nameCell").each(function(A) {
            A.title = "Run only this test";
            Event.observe(A, "click", function() {
                window.location.search = "?tests=" + A.innerHTML
            })
        });
        $$("tr.passed .nameCell").each(function(A) {
            A.title = "Run all tests";
            Event.observe(A, "click", function() {
                window.location.search = ""
            })
        })
    }
};
Test.Unit.Runner = Class.create();
Test.Unit.Runner.prototype = {
    initialize: function(C) {
        this.options = Object.extend({
            testLog: "testlog"
        }, arguments[1] || {});
        this.options.resultsURL = this.parseResultsURLQueryParameter();
        this.options.tests = this.parseTestsQueryParameter();
        if (this.options.testLog) {
            this.options.testLog = $(this.options.testLog) || null
        }
        if (this.options.tests) {
            this.tests = [];
            for (var B = 0; B < this.options.tests.length; B++) {
                if (/^test/.test(this.options.tests[B])) {
                    this.tests.push(new Test.Unit.Testcase(this.options.tests[B], C[this.options.tests[B]], C["setup"], C["teardown"]))
                }
            }
        } else {
            if (this.options.test) {
                this.tests = [new Test.Unit.Testcase(this.options.test, C[this.options.test], C["setup"], C["teardown"])]
            } else {
                this.tests = [];
                for (var A in C) {
                    if (/^test/.test(A)) {
                        this.tests.push(new Test.Unit.Testcase(this.options.context ? " -> " + this.options.titles[A] : A, C[A], C["setup"], C["teardown"]))
                    }
                }
            }
        }
        this.currentTest = 0;
        this.logger = new Test.Unit.Logger(this.options.testLog);
        setTimeout(this.runTests.bind(this), 1000)
    },
    parseResultsURLQueryParameter: function() {
        return window.location.search.parseQuery()["resultsURL"]
    },
    parseTestsQueryParameter: function() {
        if (window.location.search.parseQuery()["tests"]) {
            return window.location.search.parseQuery()["tests"].split(",")
        }
    },
    getResult: function() {
        var A = false;
        for (var B = 0; B < this.tests.length; B++) {
            if (this.tests[B].errors > 0) {
                return "ERROR"
            }
            if (this.tests[B].failures > 0) {
                A = true
            }
        }
        if (A) {
            return "FAILURE"
        } else {
            return "SUCCESS"
        }
    },
    postResults: function() {
        if (this.options.resultsURL) {
            new Ajax.Request(this.options.resultsURL, {
                method: "get",
                parameters: "result=" + this.getResult(),
                asynchronous: false
            })
        }
    },
    runTests: function() {
        var A = this.tests[this.currentTest];
        if (!A) {
            this.postResults();
            this.logger.summary(this.summary());
            return
        }
        if (!A.isWaiting) {
            this.logger.start(A.name)
        }
        A.run();
        if (A.isWaiting) {
            this.logger.message("Waiting for " + A.timeToWait + "ms");
            setTimeout(this.runTests.bind(this), A.timeToWait || 1000)
        } else {
            this.logger.finish(A.status(), A.summary());
            this.currentTest++;
            this.runTests()
        }
    },
    summary: function() {
        var E = 0;
        var C = 0;
        var B = 0;
        var A = [];
        for (var D = 0; D < this.tests.length; D++) {
            E += this.tests[D].assertions;
            C += this.tests[D].failures;
            B += this.tests[D].errors
        }
        return ((this.options.context ? this.options.context + ": " : "") + this.tests.length + " tests, " + E + " assertions, " + C + " failures, " + B + " errors")
    }
};
Test.Unit.Assertions = Class.create();
Test.Unit.Assertions.prototype = {
    initialize: function() {
        this.assertions = 0;
        this.failures = 0;
        this.errors = 0;
        this.messages = []
    },
    summary: function() {
        return (this.assertions + " assertions, " + this.failures + " failures, " + this.errors + " errors" + "\n" + this.messages.join("\n"))
    },
    pass: function() {
        this.assertions++
    },
    fail: function(A) {
        this.failures++;
        this.messages.push("Failure: " + A)
    },
    info: function(A) {
        this.messages.push("Info: " + A)
    },
    error: function(A) {
        this.errors++;
        this.messages.push(A.name + ": " + A.message + "(" + Test.Unit.inspect(A) + ")")
    },
    status: function() {
        if (this.failures > 0) {
            return "failed"
        }
        if (this.errors > 0) {
            return "error"
        }
        return "passed"
    },
    assert: function(C) {
        var B = arguments[1] || "assert: got \"" + Test.Unit.inspect(C) + "\"";
        try {
            C ? this.pass() : this.fail(B)
        } catch (A) {
            this.error(A)
        }
    },
    assertEqual: function(C, B) {
        var A = arguments[2] || "assertEqual";
        try {
            (C == B) ? this.pass(): this.fail(A + ": expected \"" + Test.Unit.inspect(C) + "\", actual \"" + Test.Unit.inspect(B) + "\"")
        } catch (D) {
            this.error(D)
        }
    },
    assertInspect: function(B, A) {
        var C = arguments[2] || "assertInspect";
        try {
            (B == A.inspect()) ? this.pass(): this.fail(C + ": expected \"" + Test.Unit.inspect(B) + "\", actual \"" + Test.Unit.inspect(A) + "\"")
        } catch (D) {
            this.error(D)
        }
    },
    assertEnumEqual: function(C, B) {
        var A = arguments[2] || "assertEnumEqual";
        try {
            $A(C).length == $A(B).length && C.zip(B).all(function(E) {
                return E[0] == E[1]
            }) ? this.pass() : this.fail(A + ": expected " + Test.Unit.inspect(C) + ", actual " + Test.Unit.inspect(B))
        } catch (D) {
            this.error(D)
        }
    },
    assertNotEqual: function(B, C) {
        var A = arguments[2] || "assertNotEqual";
        try {
            (B != C) ? this.pass(): this.fail(A + ": got \"" + Test.Unit.inspect(C) + "\"")
        } catch (D) {
            this.error(D)
        }
    },
    assertIdentical: function(B, A) {
        var D = arguments[2] || "assertIdentical";
        try {
            (B === A) ? this.pass(): this.fail(D + ": expected \"" + Test.Unit.inspect(B) + "\", actual \"" + Test.Unit.inspect(A) + "\"")
        } catch (C) {
            this.error(C)
        }
    },
    assertNotIdentical: function(D, C) {
        var A = arguments[2] || "assertNotIdentical";
        try {
            !(D === C) ? this.pass(): this.fail(A + ": expected \"" + Test.Unit.inspect(D) + "\", actual \"" + Test.Unit.inspect(C) + "\"")
        } catch (B) {
            this.error(B)
        }
    },
    assertNull: function(C) {
        var A = arguments[1] || "assertNull";
        try {
            (C == null) ? this.pass(): this.fail(A + ": got \"" + Test.Unit.inspect(C) + "\"")
        } catch (B) {
            this.error(B)
        }
    },
    assertMatch: function(E, D) {
        var B = arguments[2] || "assertMatch";
        var A = new RegExp(E);
        try {
            (A.exec(D)) ? this.pass(): this.fail(B + " : regex: \"" + Test.Unit.inspect(E) + " did not match: " + Test.Unit.inspect(D) + "\"")
        } catch (C) {
            this.error(C)
        }
    },
    assertHidden: function(B) {
        var A = arguments[1] || "assertHidden";
        this.assertEqual("none", B.style.display, A)
    },
    assertNotNull: function(B) {
        var A = arguments[1] || "assertNotNull";
        this.assert(B != null, A)
    },
    assertType: function(C, B) {
        var A = arguments[2] || "assertType";
        try {
            (B.constructor == C) ? this.pass(): this.fail(A + ": expected \"" + Test.Unit.inspect(C) + "\", actual \"" + (B.constructor) + "\"")
        } catch (D) {
            this.error(D)
        }
    },
    assertNotOfType: function(A, D) {
        var C = arguments[2] || "assertNotOfType";
        try {
            (D.constructor != A) ? this.pass(): this.fail(C + ": expected \"" + Test.Unit.inspect(A) + "\", actual \"" + (D.constructor) + "\"")
        } catch (B) {
            this.error(B)
        }
    },
    assertInstanceOf: function(D, B) {
        var A = arguments[2] || "assertInstanceOf";
        try {
            (B instanceof D) ? this.pass(): this.fail(A + ": object was not an instance of the expected type")
        } catch (C) {
            this.error(C)
        }
    },
    assertNotInstanceOf: function(D, C) {
        var B = arguments[2] || "assertNotInstanceOf";
        try {
            !(C instanceof D) ? this.pass(): this.fail(B + ": object was an instance of the not expected type")
        } catch (A) {
            this.error(A)
        }
    },
    assertRespondsTo: function(B, D) {
        var A = arguments[2] || "assertRespondsTo";
        try {
            (D[B] && typeof D[B] == "function") ? this.pass(): this.fail(A + ": object doesn't respond to [" + B + "]")
        } catch (C) {
            this.error(C)
        }
    },
    assertReturnsTrue: function(C, E) {
        var B = arguments[2] || "assertReturnsTrue";
        try {
            var A = E[C];
            if (!A) {
                A = E["is" + C.charAt(0).toUpperCase() + C.slice(1)]
            }
            A() ? this.pass() : this.fail(B + ": method returned false")
        } catch (D) {
            this.error(D)
        }
    },
    assertReturnsFalse: function(C, E) {
        var B = arguments[2] || "assertReturnsFalse";
        try {
            var A = E[C];
            if (!A) {
                A = E["is" + C.charAt(0).toUpperCase() + C.slice(1)]
            }!A() ? this.pass() : this.fail(B + ": method returned true")
        } catch (D) {
            this.error(D)
        }
    },
    assertRaise: function(D, B) {
        var A = arguments[2] || "assertRaise";
        try {
            B();
            this.fail(A + ": exception expected but none was raised")
        } catch (C) {
            ((D == null) || (C.name == D)) ? this.pass(): this.error(C)
        }
    },
    assertElementsMatch: function() {
        var A = $A(arguments),
            B = $A(A.shift());
        if (B.length != A.length) {
            this.fail("assertElementsMatch: size mismatch: " + B.length + " elements, " + A.length + " expressions");
            return false
        }
        B.zip(A).all(function(F, E) {
            var C = $(F.first()),
                D = F.last();
            if (C.match(D)) {
                return true
            }
            this.fail("assertElementsMatch: (in index " + E + ") expected " + D.inspect() + " but got " + C.inspect())
        }.bind(this)) && this.pass()
    },
    assertElementMatches: function(B, A) {
        this.assertElementsMatch([B], A)
    },
    benchmark: function(D, C) {
        var B = new Date();
        (C || 1).times(D);
        var A = ((new Date()) - B);
        this.info((arguments[2] || "Operation") + " finished " + C + " iterations in " + (A / 1000) + "s");
        return A
    },
    _isVisible: function(A) {
        A = $(A);
        if (!A.parentNode) {
            return true
        }
        this.assertNotNull(A);
        if (A.style && Element.getStyle(A, "display") == "none") {
            return false
        }
        return this._isVisible(A.parentNode)
    },
    assertNotVisible: function(A) {
        this.assert(!this._isVisible(A), Test.Unit.inspect(A) + " was not hidden and didn't have a hidden parent either. " + ("" || arguments[1]))
    },
    assertVisible: function(A) {
        this.assert(this._isVisible(A), Test.Unit.inspect(A) + " was not visible. " + ("" || arguments[1]))
    },
    benchmark: function(A, D) {
        var C = new Date();
        (D || 1).times(A);
        var B = ((new Date()) - C);
        this.info((arguments[2] || "Operation") + " finished " + D + " iterations in " + (B / 1000) + "s");
        return B
    }
};
Test.Unit.Testcase = Class.create();
Object.extend(Object.extend(Test.Unit.Testcase.prototype, Test.Unit.Assertions.prototype), {
    initialize: function(_6d, _6e, _6f, _70) {
        Test.Unit.Assertions.prototype.initialize.bind(this)();
        this.name = _6d;
        if (typeof _6e == "string") {
            _6e = _6e.gsub(/(\.should[^\(]+\()/, "#{0}this,");
            _6e = _6e.gsub(/(\.should[^\(]+)\(this,\)/, "#{1}(this)");
            this.test = function() {
                eval("with(this){" + _6e + "}")
            }
        } else {
            this.test = _6e || function() {}
        }
        this.setup = _6f || function() {};
        this.teardown = _70 || function() {};
        this.isWaiting = false;
        this.timeToWait = 1000
    },
    wait: function(B, A) {
        this.isWaiting = true;
        this.test = A;
        this.timeToWait = B
    },
    run: function() {
        try {
            try {
                if (!this.isWaiting) {
                    this.setup.bind(this)()
                }
                this.isWaiting = false;
                this.test.bind(this)()
            } finally {
                if (!this.isWaiting) {
                    this.teardown.bind(this)()
                }
            }
        } catch (A) {
            this.error(A)
        }
    }
});
Test.setupBDDExtensionMethods = function() {
    var _73 = {
        shouldEqual: "assertEqual",
        shouldNotEqual: "assertNotEqual",
        shouldEqualEnum: "assertEnumEqual",
        shouldBeA: "assertType",
        shouldNotBeA: "assertNotOfType",
        shouldBeAn: "assertType",
        shouldNotBeAn: "assertNotOfType",
        shouldBeNull: "assertNull",
        shouldNotBeNull: "assertNotNull",
        shouldBe: "assertReturnsTrue",
        shouldNotBe: "assertReturnsFalse",
        shouldRespondTo: "assertRespondsTo"
    };
    Test.BDDMethods = {};
    for (m in _73) {
        Test.BDDMethods[m] = eval("function(){" + "var args = $A(arguments);" + "var scope = args.shift();" + "scope." + _73[m] + ".apply(scope,(args || []).concat([this])); }")
    } [Array.prototype, String.prototype, Number.prototype].each(function(p) {
        Object.extend(p, Test.BDDMethods)
    })
};
Test.context = function(G, E, D) {
    Test.setupBDDExtensionMethods();
    var B = {};
    var A = {};
    for (specName in E) {
        switch (specName) {
            case "setup":
            case "teardown":
                B[specName] = E[specName];
                break;
            default:
                var F = "test" + specName.gsub(/\s+/, "-").camelize();
                var C = E[specName].toString().split("\n").slice(1);
                if (/^\{/.test(C[0])) {
                    C = C.slice(1)
                }
                C.pop();
                C = C.map(function(H) {
                    return H.strip()
                });
                B[F] = C.join("\n");
                A[F] = specName
        }
    }
    new Test.Unit.Runner(B, {
        titles: A,
        testLog: D || "testlog",
        context: G
    })
}