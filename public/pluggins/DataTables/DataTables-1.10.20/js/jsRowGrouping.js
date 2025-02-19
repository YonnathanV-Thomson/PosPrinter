﻿/*!
   Copyright 2017-2020 SpryMedia Ltd.

 This source file is free software, available under the following license:
   MIT license - http://datatables.net/license/mit

 This source file is distributed in the hope that it will be useful, but
 WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY
 or FITNESS FOR A PARTICULAR PURPOSE. See the license files for details.

 For details please refer to: http://www.datatables.net
 RowGroup 1.1.2
 ©2017-2020 SpryMedia Ltd - datatables.net/license
*/
var $jscomp = $jscomp || {};
$jscomp.scope = {};
$jscomp.findInternal = function (a, c, d) {
    a instanceof String && (a = String(a));
    for (var f = a.length, e = 0; e < f; e++) {
        var g = a[e];
        if (c.call(d, g, e, a)) return {
            i: e,
            v: g
        }
    }
    return {
        i: -1,
        v: void 0
    }
};
$jscomp.ASSUME_ES5 = !1;
$jscomp.ASSUME_NO_NATIVE_MAP = !1;
$jscomp.ASSUME_NO_NATIVE_SET = !1;
$jscomp.SIMPLE_FROUND_POLYFILL = !1;
$jscomp.defineProperty = $jscomp.ASSUME_ES5 || "function" == typeof Object.defineProperties ? Object.defineProperty : function (a, c, d) {
    a != Array.prototype && a != Object.prototype && (a[c] = d.value)
};
$jscomp.getGlobal = function (a) {
    a = ["object" == typeof window && window, "object" == typeof self && self, "object" == typeof global && global, a];
    for (var c = 0; c < a.length; ++c) {
        var d = a[c];
        if (d && d.Math == Math) return d
    }
    throw Error("Cannot find global object");
};
$jscomp.global = $jscomp.getGlobal(this);
$jscomp.polyfill = function (a, c, d, f) {
    if (c) {
        d = $jscomp.global;
        a = a.split(".");
        for (f = 0; f < a.length - 1; f++) {
            var e = a[f];
            e in d || (d[e] = {});
            d = d[e]
        }
        a = a[a.length - 1];
        f = d[a];
        c = c(f);
        c != f && null != c && $jscomp.defineProperty(d, a, {
            configurable: !0,
            writable: !0,
            value: c
        })
    }
};
$jscomp.polyfill("Array.prototype.find", function (a) {
    return a ? a : function (a, d) {
        return $jscomp.findInternal(this, a, d).v
    }
}, "es6", "es3");
(function (a) {
    "function" === typeof define && define.amd ? define(["jquery", "datatables.net"], function (c) {
        return a(c, window, document)
    }) : "object" === typeof exports ? module.exports = function (c, d) {
        c || (c = window);
        d && d.fn.dataTable || (d = require("datatables.net")(c, d).$);
        return a(d, c, c.document)
    } : a(jQuery, window, document)
})(function (a, c, d, f) {
    var e = a.fn.dataTable,
        g = function (b, h) {
            if (!e.versionCheck || !e.versionCheck("1.10.8")) throw "RowGroup requires DataTables 1.10.8 or newer";
            this.c = a.extend(!0, {}, e.defaults.rowGroup,
                g.defaults, h);
            this.s = {
                dt: new e.Api(b)
            };
            this.dom = {};
            b = this.s.dt.settings()[0];
            if (h = b.rowGroup) return h;
            b.rowGroup = this;
            this._constructor()
        };
    a.extend(g.prototype, {
        dataSrc: function (b) {
            if (b === f) return this.c.dataSrc;
            var h = this.s.dt;
            this.c.dataSrc = b;
            a(h.table().node()).triggerHandler("rowgroup-datasrc.dt", [h, b]);
            return this
        },
        disable: function () {
            this.c.enable = !1;
            return this
        },
        enable: function (b) {
            if (!1 === b) return this.disable();
            this.c.enable = !0;
            return this
        },
        enabled: function () {
            return this.c.enable
        },
        _constructor: function () {
            var b =
                this,
                a = this.s.dt,
                d = a.settings()[0];
            a.on("draw.dtrg", function (a, h) {
                b.c.enable && d === h && b._draw()
            });
            a.on("column-visibility.dt.dtrg responsive-resize.dt.dtrg", function () {
                b._adjustColspan()
            });
            a.on("destroy", function () {
                a.off(".dtrg")
            })
        },
        _adjustColspan: function () {
            a("tr." + this.c.className, this.s.dt.table().body()).find("td:visible").attr("colspan", this._colspan())
        },
        _colspan: function () {
            return this.s.dt.columns().visible().reduce(function (b, a) {
                return b + a
            }, 0)
        },
        _draw: function () {
            var b = this._group(0, this.s.dt.rows({
                page: "current"
            }).indexes());
            this._groupDisplay(0, b)
        },
        _group: function (b, d) {
            for (var h = a.isArray(this.c.dataSrc) ? this.c.dataSrc : [this.c.dataSrc], c = e.ext.oApi._fnGetObjectDataFn(h[b]), g = this.s.dt, l, n, m = [], k = 0, p = d.length; k < p; k++) {
                var q = d[k];
                l = g.row(q).data();
                l = c(l);
                if (null === l || l === f) l = this.c.emptyDataGroup;
                if (n === f || l !== n) m.push({
                    dataPoint: l,
                    rows: []
                }), n = l;
                m[m.length - 1].rows.push(q)
            }
            if (h[b + 1] !== f)
                for (k = 0, p = m.length; k < p; k++) m[k].children = this._group(b + 1, m[k].rows);
            return m
        },
        _groupDisplay: function (b, a) {
            for (var d = this.s.dt, c, h = 0, e =
                a.length; h < e; h++) {
                var f = a[h],
                    g = f.dataPoint,
                    k = f.rows;
                this.c.startRender && (c = this.c.startRender.call(this, d.rows(k), g, b), (c = this._rowWrap(c, this.c.startClassName, b)) && c.insertBefore(d.row(k[0]).node()));
                this.c.endRender && (c = this.c.endRender.call(this, d.rows(k), g, b), (c = this._rowWrap(c, this.c.endClassName, b)) && c.insertAfter(d.row(k[k.length - 1]).node()));
                f.children && this._groupDisplay(b + 1, f.children)
            }
        },
        _rowWrap: function (b, d, c) {
            if (null === b || "" === b) b = this.c.emptyDataGroup;
            return b === f || null === b ? null : ("object" ===
                typeof b && b.nodeName && "tr" === b.nodeName.toLowerCase() ? a(b) : b instanceof a && b.length && "tr" === b[0].nodeName.toLowerCase() ? b : a("<tr/>").append(a("<td/>").attr("colspan", this._colspan()).append(b))).addClass(this.c.className).addClass(d).addClass("dtrg-level-" + c)
        }
    });
    g.defaults = {
        className: "dtrg-group",
        dataSrc: 0,
        emptyDataGroup: "No group",
        enable: !0,
        endClassName: "dtrg-end",
        endRender: null,
        startClassName: "dtrg-start",
        startRender: function (b, a) {
            return a
        }
    };
    g.version = "1.1.2";
    a.fn.dataTable.RowGroup = g;
    a.fn.DataTable.RowGroup =
        g;
    e.Api.register("rowGroup()", function () {
        return this
    });
    e.Api.register("rowGroup().disable()", function () {
        return this.iterator("table", function (a) {
            a.rowGroup && a.rowGroup.enable(!1)
        })
    });
    e.Api.register("rowGroup().enable()", function (a) {
        return this.iterator("table", function (b) {
            b.rowGroup && b.rowGroup.enable(a === f ? !0 : a)
        })
    });
    e.Api.register("rowGroup().enabled()", function () {
        var a = this.context;
        return a.length && a[0].rowGroup ? a[0].rowGroup.enabled() : !1
    });
    e.Api.register("rowGroup().dataSrc()", function (a) {
        return a ===
            f ? this.context[0].rowGroup.dataSrc() : this.iterator("table", function (b) {
                b.rowGroup && b.rowGroup.dataSrc(a)
            })
    });
    a(d).on("preInit.dt.dtrg", function (b, d, c) {
        "dt" === b.namespace && (b = d.oInit.rowGroup, c = e.defaults.rowGroup, b || c) && (c = a.extend({}, c, b), !1 !== b && new g(d, c))
    });
    return g
});