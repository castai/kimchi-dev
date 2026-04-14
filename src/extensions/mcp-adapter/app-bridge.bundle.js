var Mu = Object.defineProperty
var $e = (t, r) => {
	for (var n in r) Mu(t, n, { get: r[n], enumerable: !0 })
}
var s = {}
$e(s, {
	$brand: () => pn,
	$input: () => Si,
	$output: () => ki,
	NEVER: () => mn,
	TimePrecision: () => ji,
	ZodAny: () => Mc,
	ZodArray: () => Hc,
	ZodBase64: () => Ea,
	ZodBase64URL: () => Aa,
	ZodBigInt: () => Dt,
	ZodBigIntFormat: () => Ma,
	ZodBoolean: () => Zt,
	ZodCIDRv4: () => Da,
	ZodCIDRv6: () => Ra,
	ZodCUID: () => ja,
	ZodCUID2: () => Pa,
	ZodCatch: () => au,
	ZodCustom: () => Hr,
	ZodCustomStringFormat: () => Ec,
	ZodDate: () => qr,
	ZodDefault: () => eu,
	ZodDiscriminatedUnion: () => Jc,
	ZodE164: () => Ca,
	ZodEmail: () => ka,
	ZodEmoji: () => wa,
	ZodEnum: () => Ot,
	ZodError: () => wm,
	ZodFile: () => Xc,
	ZodGUID: () => Ar,
	ZodIPv4: () => Ua,
	ZodIPv6: () => Za,
	ZodISODate: () => Dr,
	ZodISODateTime: () => Zr,
	ZodISODuration: () => Er,
	ZodISOTime: () => Rr,
	ZodIntersection: () => Bc,
	ZodIssueCode: () => Sp,
	ZodJWT: () => La,
	ZodKSUID: () => Na,
	ZodLazy: () => pu,
	ZodLiteral: () => Qc,
	ZodMap: () => Gc,
	ZodNaN: () => cu,
	ZodNanoID: () => Ia,
	ZodNever: () => Vc,
	ZodNonOptional: () => Ba,
	ZodNull: () => Lc,
	ZodNullable: () => Yc,
	ZodNumber: () => Ut,
	ZodNumberFormat: () => He,
	ZodObject: () => Vr,
	ZodOptional: () => Ja,
	ZodPipe: () => Wa,
	ZodPrefault: () => ru,
	ZodPromise: () => fu,
	ZodReadonly: () => uu,
	ZodRealError: () => Fe,
	ZodRecord: () => Va,
	ZodSet: () => Kc,
	ZodString: () => Nt,
	ZodStringFormat: () => C,
	ZodSuccess: () => iu,
	ZodSymbol: () => Ac,
	ZodTemplateLiteral: () => mu,
	ZodTransform: () => Fa,
	ZodTuple: () => Wc,
	ZodType: () => P,
	ZodULID: () => Ta,
	ZodURL: () => Sa,
	ZodUUID: () => fe,
	ZodUndefined: () => Cc,
	ZodUnion: () => qa,
	ZodUnknown: () => qc,
	ZodVoid: () => Fc,
	ZodXID: () => Oa,
	_ZodString: () => za,
	_default: () => tu,
	any: () => ap,
	array: () => T,
	base64: () => Jm,
	base64url: () => Bm,
	bigint: () => tp,
	boolean: () => H,
	catch: () => su,
	check: () => gu,
	cidrv4: () => Fm,
	cidrv6: () => Hm,
	clone: () => te,
	coerce: () => Ka,
	config: () => F,
	core: () => de,
	cuid: () => Em,
	cuid2: () => Am,
	custom: () => Ga,
	date: () => cp,
	discriminatedUnion: () => Fr,
	e164: () => Wm,
	email: () => jm,
	emoji: () => Dm,
	endsWith: () => zt,
	enum: () => X,
	file: () => hp,
	flattenError: () => it,
	float32: () => Qm,
	float64: () => Xm,
	formatError: () => at,
	function: () => pa,
	getErrorMap: () => Ip,
	globalRegistry: () => ce,
	gt: () => me,
	gte: () => ee,
	guid: () => Pm,
	includes: () => $t,
	instanceof: () => xp,
	int: () => xa,
	int32: () => Ym,
	int64: () => rp,
	intersection: () => Et,
	ipv4: () => qm,
	ipv6: () => Vm,
	iso: () => Ve,
	json: () => kp,
	jwt: () => Gm,
	keyof: () => up,
	ksuid: () => Mm,
	lazy: () => du,
	length: () => qe,
	literal: () => w,
	locales: () => gt,
	looseObject: () => Q,
	lowercase: () => _t,
	lt: () => le,
	lte: () => oe,
	map: () => dp,
	maxLength: () => Me,
	maxSize: () => Le,
	mime: () => kt,
	minLength: () => ve,
	minSize: () => Pe,
	multipleOf: () => je,
	nan: () => _p,
	nanoid: () => Rm,
	nativeEnum: () => gp,
	negative: () => ra,
	never: () => Mr,
	nonnegative: () => oa,
	nonoptional: () => ou,
	nonpositive: () => na,
	normalize: () => St,
	null: () => Rt,
	nullable: () => Cr,
	nullish: () => vp,
	number: () => Z,
	object: () => z,
	optional: () => q,
	overwrite: () => pe,
	parse: () => ba,
	parseAsync: () => _a,
	partialRecord: () => pp,
	pipe: () => Lr,
	positive: () => ta,
	prefault: () => nu,
	preprocess: () => Jr,
	prettifyError: () => Sn,
	promise: () => $p,
	property: () => ia,
	readonly: () => lu,
	record: () => L,
	refine: () => hu,
	regex: () => bt,
	regexes: () => Se,
	registry: () => mr,
	safeParse: () => ya,
	safeParseAsync: () => $a,
	set: () => fp,
	setErrorMap: () => wp,
	size: () => vt,
	startsWith: () => xt,
	strictObject: () => lp,
	string: () => l,
	stringFormat: () => Km,
	stringbool: () => zp,
	success: () => bp,
	superRefine: () => vu,
	symbol: () => op,
	templateLiteral: () => yp,
	toJSONSchema: () => da,
	toLowerCase: () => It,
	toUpperCase: () => jt,
	transform: () => Ha,
	treeifyError: () => kn,
	trim: () => wt,
	tuple: () => mp,
	uint32: () => ep,
	uint64: () => np,
	ulid: () => Cm,
	undefined: () => ip,
	union: () => R,
	unknown: () => M,
	uppercase: () => yt,
	url: () => Zm,
	uuid: () => Tm,
	uuidv4: () => Om,
	uuidv6: () => Nm,
	uuidv7: () => Um,
	void: () => sp,
	xid: () => Lm,
})
var de = {}
$e(de, {
	$ZodAny: () => Xo,
	$ZodArray: () => pt,
	$ZodAsyncError: () => se,
	$ZodBase64: () => qo,
	$ZodBase64URL: () => Vo,
	$ZodBigInt: () => cr,
	$ZodBigIntFormat: () => Wo,
	$ZodBoolean: () => mt,
	$ZodCIDRv4: () => Co,
	$ZodCIDRv6: () => Lo,
	$ZodCUID: () => jo,
	$ZodCUID2: () => Po,
	$ZodCatch: () => vi,
	$ZodCheck: () => V,
	$ZodCheckBigIntFormat: () => no,
	$ZodCheckEndsWith: () => ho,
	$ZodCheckGreaterThan: () => or,
	$ZodCheckIncludes: () => fo,
	$ZodCheckLengthEquals: () => uo,
	$ZodCheckLessThan: () => nr,
	$ZodCheckLowerCase: () => mo,
	$ZodCheckMaxLength: () => so,
	$ZodCheckMaxSize: () => oo,
	$ZodCheckMimeType: () => bo,
	$ZodCheckMinLength: () => co,
	$ZodCheckMinSize: () => io,
	$ZodCheckMultipleOf: () => to,
	$ZodCheckNumberFormat: () => ro,
	$ZodCheckOverwrite: () => _o,
	$ZodCheckProperty: () => vo,
	$ZodCheckRegex: () => lo,
	$ZodCheckSizeEquals: () => ao,
	$ZodCheckStartsWith: () => go,
	$ZodCheckStringFormat: () => Re,
	$ZodCheckUpperCase: () => po,
	$ZodCustom: () => zi,
	$ZodCustomStringFormat: () => Jo,
	$ZodDate: () => ti,
	$ZodDefault: () => di,
	$ZodDiscriminatedUnion: () => ni,
	$ZodE164: () => Fo,
	$ZodEmail: () => ko,
	$ZodEmoji: () => wo,
	$ZodEnum: () => ci,
	$ZodError: () => ot,
	$ZodFile: () => li,
	$ZodFunction: () => Ur,
	$ZodGUID: () => xo,
	$ZodIPv4: () => Eo,
	$ZodIPv6: () => Ao,
	$ZodISODate: () => Zo,
	$ZodISODateTime: () => Uo,
	$ZodISODuration: () => Ro,
	$ZodISOTime: () => Do,
	$ZodIntersection: () => oi,
	$ZodJWT: () => Ho,
	$ZodKSUID: () => No,
	$ZodLazy: () => xi,
	$ZodLiteral: () => ui,
	$ZodMap: () => ai,
	$ZodNaN: () => bi,
	$ZodNanoID: () => Io,
	$ZodNever: () => Yo,
	$ZodNonOptional: () => gi,
	$ZodNull: () => Qo,
	$ZodNullable: () => pi,
	$ZodNumber: () => sr,
	$ZodNumberFormat: () => Bo,
	$ZodObject: () => ri,
	$ZodOptional: () => mi,
	$ZodPipe: () => ft,
	$ZodPrefault: () => fi,
	$ZodPromise: () => $i,
	$ZodReadonly: () => _i,
	$ZodRealError: () => Ze,
	$ZodRecord: () => ii,
	$ZodRegistry: () => Ae,
	$ZodSet: () => si,
	$ZodString: () => we,
	$ZodStringFormat: () => A,
	$ZodSuccess: () => hi,
	$ZodSymbol: () => Go,
	$ZodTemplateLiteral: () => yi,
	$ZodTransform: () => dt,
	$ZodTuple: () => Ie,
	$ZodType: () => j,
	$ZodULID: () => To,
	$ZodURL: () => So,
	$ZodUUID: () => zo,
	$ZodUndefined: () => Ko,
	$ZodUnion: () => ur,
	$ZodUnknown: () => Ee,
	$ZodVoid: () => ei,
	$ZodXID: () => Oo,
	$brand: () => pn,
	$constructor: () => u,
	$input: () => Si,
	$output: () => ki,
	Doc: () => lt,
	JSONSchema: () => Zc,
	JSONSchemaGenerator: () => Tt,
	NEVER: () => mn,
	TimePrecision: () => ji,
	_any: () => Gi,
	_array: () => Pt,
	_base64: () => Pr,
	_base64url: () => Tr,
	_bigint: () => qi,
	_boolean: () => Li,
	_catch: () => _m,
	_cidrv4: () => Ir,
	_cidrv6: () => jr,
	_coercedBigint: () => Vi,
	_coercedBoolean: () => Mi,
	_coercedDate: () => Yi,
	_coercedNumber: () => Zi,
	_coercedString: () => Ii,
	_cuid: () => yr,
	_cuid2: () => $r,
	_custom: () => ca,
	_date: () => Xi,
	_default: () => hm,
	_discriminatedUnion: () => im,
	_e164: () => Or,
	_email: () => pr,
	_emoji: () => br,
	_endsWith: () => zt,
	_enum: () => lm,
	_file: () => sa,
	_float32: () => Ri,
	_float64: () => Ei,
	_gt: () => me,
	_gte: () => ee,
	_guid: () => ht,
	_includes: () => $t,
	_int: () => Di,
	_int32: () => Ai,
	_int64: () => Fi,
	_intersection: () => am,
	_ipv4: () => Sr,
	_ipv6: () => wr,
	_isoDate: () => Ti,
	_isoDateTime: () => Pi,
	_isoDuration: () => Ni,
	_isoTime: () => Oi,
	_jwt: () => Nr,
	_ksuid: () => kr,
	_lazy: () => zm,
	_length: () => qe,
	_literal: () => pm,
	_lowercase: () => _t,
	_lt: () => le,
	_lte: () => oe,
	_map: () => cm,
	_max: () => oe,
	_maxLength: () => Me,
	_maxSize: () => Le,
	_mime: () => kt,
	_min: () => ee,
	_minLength: () => ve,
	_minSize: () => Pe,
	_multipleOf: () => je,
	_nan: () => ea,
	_nanoid: () => _r,
	_nativeEnum: () => mm,
	_negative: () => ra,
	_never: () => Ki,
	_nonnegative: () => oa,
	_nonoptional: () => vm,
	_nonpositive: () => na,
	_normalize: () => St,
	_null: () => Wi,
	_nullable: () => gm,
	_number: () => Ui,
	_optional: () => fm,
	_overwrite: () => pe,
	_parse: () => Xt,
	_parseAsync: () => Yt,
	_pipe: () => ym,
	_positive: () => ta,
	_promise: () => km,
	_property: () => ia,
	_readonly: () => $m,
	_record: () => sm,
	_refine: () => ua,
	_regex: () => bt,
	_safeParse: () => er,
	_safeParseAsync: () => tr,
	_set: () => um,
	_size: () => vt,
	_startsWith: () => xt,
	_string: () => wi,
	_stringFormat: () => ma,
	_stringbool: () => la,
	_success: () => bm,
	_symbol: () => Ji,
	_templateLiteral: () => xm,
	_toLowerCase: () => It,
	_toUpperCase: () => jt,
	_transform: () => dm,
	_trim: () => wt,
	_tuple: () => aa,
	_uint32: () => Ci,
	_uint64: () => Hi,
	_ulid: () => xr,
	_undefined: () => Bi,
	_union: () => om,
	_unknown: () => Ce,
	_uppercase: () => yt,
	_url: () => vr,
	_uuid: () => dr,
	_uuidv4: () => fr,
	_uuidv6: () => gr,
	_uuidv7: () => hr,
	_void: () => Qi,
	_xid: () => zr,
	clone: () => te,
	config: () => F,
	flattenError: () => it,
	formatError: () => at,
	function: () => pa,
	globalConfig: () => Ke,
	globalRegistry: () => ce,
	isValidBase64: () => Mo,
	isValidBase64URL: () => Hs,
	isValidJWT: () => Js,
	locales: () => gt,
	parse: () => st,
	parseAsync: () => ct,
	prettifyError: () => Sn,
	regexes: () => Se,
	registry: () => mr,
	safeParse: () => De,
	safeParseAsync: () => ut,
	toDotPath: () => Is,
	toJSONSchema: () => da,
	treeifyError: () => kn,
	util: () => y,
	version: () => yo,
})
var mn = Object.freeze({ status: "aborted" })
function u(t, r, n) {
	function i(c, p) {
		var h
		Object.defineProperty(c, "_zod", { value: c._zod ?? {}, enumerable: !1 }),
			(h = c._zod).traits ?? (h.traits = new Set()),
			c._zod.traits.add(t),
			r(c, p)
		for (const g in a.prototype) g in c || Object.defineProperty(c, g, { value: a.prototype[g].bind(c) })
		;(c._zod.constr = a), (c._zod.def = p)
	}
	const e = n?.Parent ?? Object
	class o extends e {}
	Object.defineProperty(o, "name", { value: t })
	function a(c) {
		var p
		const h = n?.Parent ? new o() : this
		i(h, c), (p = h._zod).deferred ?? (p.deferred = [])
		for (const g of h._zod.deferred) g()
		return h
	}
	return (
		Object.defineProperty(a, "init", { value: i }),
		Object.defineProperty(a, Symbol.hasInstance, {
			value: (c) => (n?.Parent && c instanceof n.Parent ? !0 : c?._zod?.traits?.has(t)),
		}),
		Object.defineProperty(a, "name", { value: t }),
		a
	)
}
var pn = Symbol("zod_brand"),
	se = class extends Error {
		constructor() {
			super("Encountered Promise during synchronous parse. Use .parseAsync() instead.")
		}
	},
	Ke = {}
function F(t) {
	return t && Object.assign(Ke, t), Ke
}
var y = {}
$e(y, {
	BIGINT_FORMAT_RANGES: () => xn,
	Class: () => fn,
	NUMBER_FORMAT_RANGES: () => $n,
	aborted: () => ze,
	allowsEval: () => bn,
	assert: () => Ju,
	assertEqual: () => qu,
	assertIs: () => Fu,
	assertNever: () => Hu,
	assertNotEqual: () => Vu,
	assignProp: () => vn,
	cached: () => Ye,
	captureStackTrace: () => Qt,
	cleanEnum: () => il,
	cleanRegex: () => et,
	clone: () => te,
	createTransparentProxy: () => Xu,
	defineLazy: () => U,
	esc: () => xe,
	escapeRegex: () => ue,
	extend: () => tl,
	finalizeIssue: () => re,
	floatSafeRemainder: () => hn,
	getElementAtPath: () => Bu,
	getEnumValues: () => Xe,
	getLengthableOrigin: () => nt,
	getParsedType: () => Qu,
	getSizableOrigin: () => rt,
	isObject: () => Ne,
	isPlainObject: () => Ue,
	issue: () => zn,
	joinValues: () => f,
	jsonStringifyReplacer: () => gn,
	merge: () => rl,
	normalizeParams: () => v,
	nullish: () => he,
	numKeys: () => Ku,
	omit: () => el,
	optionalKeys: () => yn,
	partial: () => nl,
	pick: () => Yu,
	prefixIssues: () => Y,
	primitiveTypes: () => _n,
	promiseAllObject: () => Wu,
	propertyKeyTypes: () => tt,
	randomString: () => Gu,
	required: () => ol,
	stringifyPrimitive: () => _,
	unwrapMessage: () => Qe,
})
function qu(t) {
	return t
}
function Vu(t) {
	return t
}
function Fu(t) {}
function Hu(t) {
	throw new Error()
}
function Ju(t) {}
function Xe(t) {
	const r = Object.values(t).filter((i) => typeof i == "number")
	return Object.entries(t)
		.filter(([i, e]) => r.indexOf(+i) === -1)
		.map(([i, e]) => e)
}
function f(t, r = "|") {
	return t.map((n) => _(n)).join(r)
}
function gn(t, r) {
	return typeof r == "bigint" ? r.toString() : r
}
function Ye(t) {
	return {
		get value() {
			{
				const n = t()
				return Object.defineProperty(this, "value", { value: n }), n
			}
			throw new Error("cached value already set")
		},
	}
}
function he(t) {
	return t == null
}
function et(t) {
	const r = t.startsWith("^") ? 1 : 0,
		n = t.endsWith("$") ? t.length - 1 : t.length
	return t.slice(r, n)
}
function hn(t, r) {
	const n = (t.toString().split(".")[1] || "").length,
		i = (r.toString().split(".")[1] || "").length,
		e = n > i ? n : i,
		o = Number.parseInt(t.toFixed(e).replace(".", "")),
		a = Number.parseInt(r.toFixed(e).replace(".", ""))
	return (o % a) / 10 ** e
}
function U(t, r, n) {
	Object.defineProperty(t, r, {
		get() {
			{
				const e = n()
				return (t[r] = e), e
			}
			throw new Error("cached value already set")
		},
		set(e) {
			Object.defineProperty(t, r, { value: e })
		},
		configurable: !0,
	})
}
function vn(t, r, n) {
	Object.defineProperty(t, r, { value: n, writable: !0, enumerable: !0, configurable: !0 })
}
function Bu(t, r) {
	return r ? r.reduce((n, i) => n?.[i], t) : t
}
function Wu(t) {
	const r = Object.keys(t),
		n = r.map((i) => t[i])
	return Promise.all(n).then((i) => {
		const e = {}
		for (let o = 0; o < r.length; o++) e[r[o]] = i[o]
		return e
	})
}
function Gu(t = 10) {
	let r = "abcdefghijklmnopqrstuvwxyz",
		n = ""
	for (let i = 0; i < t; i++) n += r[Math.floor(Math.random() * r.length)]
	return n
}
function xe(t) {
	return JSON.stringify(t)
}
var Qt = Error.captureStackTrace ? Error.captureStackTrace : (...t) => {}
function Ne(t) {
	return typeof t == "object" && t !== null && !Array.isArray(t)
}
var bn = Ye(() => {
	if (typeof navigator < "u" && navigator?.userAgent?.includes("Cloudflare")) return !1
	try {
		const t = Function
		return new t(""), !0
	} catch {
		return !1
	}
})
function Ue(t) {
	if (Ne(t) === !1) return !1
	const r = t.constructor
	if (r === void 0) return !0
	const n = r.prototype
	return !(Ne(n) === !1 || Object.prototype.hasOwnProperty.call(n, "isPrototypeOf") === !1)
}
function Ku(t) {
	let r = 0
	for (const n in t) Object.prototype.hasOwnProperty.call(t, n) && r++
	return r
}
var Qu = (t) => {
		const r = typeof t
		switch (r) {
			case "undefined":
				return "undefined"
			case "string":
				return "string"
			case "number":
				return Number.isNaN(t) ? "nan" : "number"
			case "boolean":
				return "boolean"
			case "function":
				return "function"
			case "bigint":
				return "bigint"
			case "symbol":
				return "symbol"
			case "object":
				return Array.isArray(t)
					? "array"
					: t === null
						? "null"
						: t.then && typeof t.then == "function" && t.catch && typeof t.catch == "function"
							? "promise"
							: typeof Map < "u" && t instanceof Map
								? "map"
								: typeof Set < "u" && t instanceof Set
									? "set"
									: typeof Date < "u" && t instanceof Date
										? "date"
										: typeof File < "u" && t instanceof File
											? "file"
											: "object"
			default:
				throw new Error(`Unknown data type: ${r}`)
		}
	},
	tt = new Set(["string", "number", "symbol"]),
	_n = new Set(["string", "number", "bigint", "boolean", "symbol", "undefined"])
function ue(t) {
	return t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}
function te(t, r, n) {
	const i = new t._zod.constr(r ?? t._zod.def)
	return (!r || n?.parent) && (i._zod.parent = t), i
}
function v(t) {
	const r = t
	if (!r) return {}
	if (typeof r == "string") return { error: () => r }
	if (r?.message !== void 0) {
		if (r?.error !== void 0) throw new Error("Cannot specify both `message` and `error` params")
		r.error = r.message
	}
	return delete r.message, typeof r.error == "string" ? { ...r, error: () => r.error } : r
}
function Xu(t) {
	let r
	return new Proxy(
		{},
		{
			get(n, i, e) {
				return r ?? (r = t()), Reflect.get(r, i, e)
			},
			set(n, i, e, o) {
				return r ?? (r = t()), Reflect.set(r, i, e, o)
			},
			has(n, i) {
				return r ?? (r = t()), Reflect.has(r, i)
			},
			deleteProperty(n, i) {
				return r ?? (r = t()), Reflect.deleteProperty(r, i)
			},
			ownKeys(n) {
				return r ?? (r = t()), Reflect.ownKeys(r)
			},
			getOwnPropertyDescriptor(n, i) {
				return r ?? (r = t()), Reflect.getOwnPropertyDescriptor(r, i)
			},
			defineProperty(n, i, e) {
				return r ?? (r = t()), Reflect.defineProperty(r, i, e)
			},
		},
	)
}
function _(t) {
	return typeof t == "bigint" ? t.toString() + "n" : typeof t == "string" ? `"${t}"` : `${t}`
}
function yn(t) {
	return Object.keys(t).filter((r) => t[r]._zod.optin === "optional" && t[r]._zod.optout === "optional")
}
var $n = {
		safeint: [Number.MIN_SAFE_INTEGER, Number.MAX_SAFE_INTEGER],
		int32: [-2147483648, 2147483647],
		uint32: [0, 4294967295],
		float32: [-34028234663852886e22, 34028234663852886e22],
		float64: [-Number.MAX_VALUE, Number.MAX_VALUE],
	},
	xn = {
		int64: [BigInt("-9223372036854775808"), BigInt("9223372036854775807")],
		uint64: [BigInt(0), BigInt("18446744073709551615")],
	}
function Yu(t, r) {
	const n = {},
		i = t._zod.def
	for (const e in r) {
		if (!(e in i.shape)) throw new Error(`Unrecognized key: "${e}"`)
		r[e] && (n[e] = i.shape[e])
	}
	return te(t, { ...t._zod.def, shape: n, checks: [] })
}
function el(t, r) {
	const n = { ...t._zod.def.shape },
		i = t._zod.def
	for (const e in r) {
		if (!(e in i.shape)) throw new Error(`Unrecognized key: "${e}"`)
		r[e] && delete n[e]
	}
	return te(t, { ...t._zod.def, shape: n, checks: [] })
}
function tl(t, r) {
	if (!Ue(r)) throw new Error("Invalid input to extend: expected a plain object")
	const n = {
		...t._zod.def,
		get shape() {
			const i = { ...t._zod.def.shape, ...r }
			return vn(this, "shape", i), i
		},
		checks: [],
	}
	return te(t, n)
}
function rl(t, r) {
	return te(t, {
		...t._zod.def,
		get shape() {
			const n = { ...t._zod.def.shape, ...r._zod.def.shape }
			return vn(this, "shape", n), n
		},
		catchall: r._zod.def.catchall,
		checks: [],
	})
}
function nl(t, r, n) {
	const i = r._zod.def.shape,
		e = { ...i }
	if (n)
		for (const o in n) {
			if (!(o in i)) throw new Error(`Unrecognized key: "${o}"`)
			n[o] && (e[o] = t ? new t({ type: "optional", innerType: i[o] }) : i[o])
		}
	else for (const o in i) e[o] = t ? new t({ type: "optional", innerType: i[o] }) : i[o]
	return te(r, { ...r._zod.def, shape: e, checks: [] })
}
function ol(t, r, n) {
	const i = r._zod.def.shape,
		e = { ...i }
	if (n)
		for (const o in n) {
			if (!(o in e)) throw new Error(`Unrecognized key: "${o}"`)
			n[o] && (e[o] = new t({ type: "nonoptional", innerType: i[o] }))
		}
	else for (const o in i) e[o] = new t({ type: "nonoptional", innerType: i[o] })
	return te(r, { ...r._zod.def, shape: e, checks: [] })
}
function ze(t, r = 0) {
	for (let n = r; n < t.issues.length; n++) if (t.issues[n]?.continue !== !0) return !0
	return !1
}
function Y(t, r) {
	return r.map((n) => {
		var i
		return (i = n).path ?? (i.path = []), n.path.unshift(t), n
	})
}
function Qe(t) {
	return typeof t == "string" ? t : t?.message
}
function re(t, r, n) {
	const i = { ...t, path: t.path ?? [] }
	if (!t.message) {
		const e =
			Qe(t.inst?._zod.def?.error?.(t)) ??
			Qe(r?.error?.(t)) ??
			Qe(n.customError?.(t)) ??
			Qe(n.localeError?.(t)) ??
			"Invalid input"
		i.message = e
	}
	return delete i.inst, delete i.continue, r?.reportInput || delete i.input, i
}
function rt(t) {
	return t instanceof Set ? "set" : t instanceof Map ? "map" : t instanceof File ? "file" : "unknown"
}
function nt(t) {
	return Array.isArray(t) ? "array" : typeof t == "string" ? "string" : "unknown"
}
function zn(...t) {
	const [r, n, i] = t
	return typeof r == "string" ? { message: r, code: "custom", input: n, inst: i } : { ...r }
}
function il(t) {
	return Object.entries(t)
		.filter(([r, n]) => Number.isNaN(Number.parseInt(r, 10)))
		.map((r) => r[1])
}
var fn = class {
	constructor(...r) {}
}
var ws = (t, r) => {
		;(t.name = "$ZodError"),
			Object.defineProperty(t, "_zod", { value: t._zod, enumerable: !1 }),
			Object.defineProperty(t, "issues", { value: r, enumerable: !1 }),
			Object.defineProperty(t, "message", {
				get() {
					return JSON.stringify(r, gn, 2)
				},
				enumerable: !0,
			}),
			Object.defineProperty(t, "toString", { value: () => t.message, enumerable: !1 })
	},
	ot = u("$ZodError", ws),
	Ze = u("$ZodError", ws, { Parent: Error })
function it(t, r = (n) => n.message) {
	const n = {},
		i = []
	for (const e of t.issues)
		e.path.length > 0 ? ((n[e.path[0]] = n[e.path[0]] || []), n[e.path[0]].push(r(e))) : i.push(r(e))
	return { formErrors: i, fieldErrors: n }
}
function at(t, r) {
	const n = r || ((o) => o.message),
		i = { _errors: [] },
		e = (o) => {
			for (const a of o.issues)
				if (a.code === "invalid_union" && a.errors.length) a.errors.map((c) => e({ issues: c }))
				else if (a.code === "invalid_key") e({ issues: a.issues })
				else if (a.code === "invalid_element") e({ issues: a.issues })
				else if (a.path.length === 0) i._errors.push(n(a))
				else {
					let c = i,
						p = 0
					while (p < a.path.length) {
						const h = a.path[p]
						p === a.path.length - 1
							? ((c[h] = c[h] || { _errors: [] }), c[h]._errors.push(n(a)))
							: (c[h] = c[h] || { _errors: [] }),
							(c = c[h]),
							p++
					}
				}
		}
	return e(t), i
}
function kn(t, r) {
	const n = r || ((o) => o.message),
		i = { errors: [] },
		e = (o, a = []) => {
			var c, p
			for (const h of o.issues)
				if (h.code === "invalid_union" && h.errors.length) h.errors.map((g) => e({ issues: g }, h.path))
				else if (h.code === "invalid_key") e({ issues: h.issues }, h.path)
				else if (h.code === "invalid_element") e({ issues: h.issues }, h.path)
				else {
					const g = [...a, ...h.path]
					if (g.length === 0) {
						i.errors.push(n(h))
						continue
					}
					let m = i,
						$ = 0
					while ($ < g.length) {
						const b = g[$],
							d = $ === g.length - 1
						typeof b == "string"
							? (m.properties ?? (m.properties = {}),
								(c = m.properties)[b] ?? (c[b] = { errors: [] }),
								(m = m.properties[b]))
							: (m.items ?? (m.items = []), (p = m.items)[b] ?? (p[b] = { errors: [] }), (m = m.items[b])),
							d && m.errors.push(n(h)),
							$++
					}
				}
		}
	return e(t), i
}
function Is(t) {
	const r = []
	for (const n of t)
		typeof n == "number"
			? r.push(`[${n}]`)
			: typeof n == "symbol"
				? r.push(`[${JSON.stringify(String(n))}]`)
				: /[^\w$]/.test(n)
					? r.push(`[${JSON.stringify(n)}]`)
					: (r.length && r.push("."), r.push(n))
	return r.join("")
}
function Sn(t) {
	const r = [],
		n = [...t.issues].sort((i, e) => i.path.length - e.path.length)
	for (const i of n) r.push(`\u2716 ${i.message}`), i.path?.length && r.push(`  \u2192 at ${Is(i.path)}`)
	return r.join(`
`)
}
var Xt = (t) => (r, n, i, e) => {
		const o = i ? Object.assign(i, { async: !1 }) : { async: !1 },
			a = r._zod.run({ value: n, issues: [] }, o)
		if (a instanceof Promise) throw new se()
		if (a.issues.length) {
			const c = new (e?.Err ?? t)(a.issues.map((p) => re(p, o, F())))
			throw (Qt(c, e?.callee), c)
		}
		return a.value
	},
	st = Xt(Ze),
	Yt = (t) => async (r, n, i, e) => {
		let o = i ? Object.assign(i, { async: !0 }) : { async: !0 },
			a = r._zod.run({ value: n, issues: [] }, o)
		if ((a instanceof Promise && (a = await a), a.issues.length)) {
			const c = new (e?.Err ?? t)(a.issues.map((p) => re(p, o, F())))
			throw (Qt(c, e?.callee), c)
		}
		return a.value
	},
	ct = Yt(Ze),
	er = (t) => (r, n, i) => {
		const e = i ? { ...i, async: !1 } : { async: !1 },
			o = r._zod.run({ value: n, issues: [] }, e)
		if (o instanceof Promise) throw new se()
		return o.issues.length
			? { success: !1, error: new (t ?? ot)(o.issues.map((a) => re(a, e, F()))) }
			: { success: !0, data: o.value }
	},
	De = er(Ze),
	tr = (t) => async (r, n, i) => {
		let e = i ? Object.assign(i, { async: !0 }) : { async: !0 },
			o = r._zod.run({ value: n, issues: [] }, e)
		return (
			o instanceof Promise && (o = await o),
			o.issues.length
				? { success: !1, error: new t(o.issues.map((a) => re(a, e, F()))) }
				: { success: !0, data: o.value }
		)
	},
	ut = tr(Ze)
var Se = {}
$e(Se, {
	_emoji: () => js,
	base64: () => Ln,
	base64url: () => rr,
	bigint: () => Bn,
	boolean: () => Kn,
	browserEmail: () => fl,
	cidrv4: () => An,
	cidrv6: () => Cn,
	cuid: () => wn,
	cuid2: () => In,
	date: () => Vn,
	datetime: () => Hn,
	domain: () => gl,
	duration: () => Nn,
	e164: () => qn,
	email: () => Zn,
	emoji: () => Dn,
	extendedDuration: () => sl,
	guid: () => Un,
	hostname: () => Mn,
	html5Email: () => ml,
	integer: () => Wn,
	ipv4: () => Rn,
	ipv6: () => En,
	ksuid: () => Tn,
	lowercase: () => Yn,
	nanoid: () => On,
	null: () => Qn,
	number: () => Gn,
	rfc5322Email: () => pl,
	string: () => Jn,
	time: () => Fn,
	ulid: () => jn,
	undefined: () => Xn,
	unicodeEmail: () => dl,
	uppercase: () => eo,
	uuid: () => ke,
	uuid4: () => cl,
	uuid6: () => ul,
	uuid7: () => ll,
	xid: () => Pn,
})
var wn = /^[cC][^\s-]{8,}$/,
	In = /^[0-9a-z]+$/,
	jn = /^[0-9A-HJKMNP-TV-Za-hjkmnp-tv-z]{26}$/,
	Pn = /^[0-9a-vA-V]{20}$/,
	Tn = /^[A-Za-z0-9]{27}$/,
	On = /^[a-zA-Z0-9_-]{21}$/,
	Nn = /^P(?:(\d+W)|(?!.*W)(?=\d|T\d)(\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+([.,]\d+)?S)?)?)$/,
	sl =
		/^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/,
	Un = /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})$/,
	ke = (t) =>
		t
			? new RegExp(`^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-${t}[0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12})$`)
			: /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-8][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}|00000000-0000-0000-0000-000000000000)$/,
	cl = ke(4),
	ul = ke(6),
	ll = ke(7),
	Zn = /^(?!\.)(?!.*\.\.)([A-Za-z0-9_'+\-\.]*)[A-Za-z0-9_+-]@([A-Za-z0-9][A-Za-z0-9\-]*\.)+[A-Za-z]{2,}$/,
	ml =
		/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
	pl =
		/^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
	dl = /^[^\s@"]{1,64}@[^\s@]{1,255}$/u,
	fl =
		/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
	js = "^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$"
function Dn() {
	return new RegExp(js, "u")
}
var Rn =
		/^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/,
	En = /^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})$/,
	An =
		/^((25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/([0-9]|[1-2][0-9]|3[0-2])$/,
	Cn =
		/^(([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}|::|([0-9a-fA-F]{1,4})?::([0-9a-fA-F]{1,4}:?){0,6})\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/,
	Ln = /^$|^(?:[0-9a-zA-Z+/]{4})*(?:(?:[0-9a-zA-Z+/]{2}==)|(?:[0-9a-zA-Z+/]{3}=))?$/,
	rr = /^[A-Za-z0-9_-]*$/,
	Mn = /^([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+$/,
	gl = /^([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/,
	qn = /^\+(?:[0-9]){6,14}[0-9]$/,
	Ps =
		"(?:(?:\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-(?:(?:0[13578]|1[02])-(?:0[1-9]|[12]\\d|3[01])|(?:0[469]|11)-(?:0[1-9]|[12]\\d|30)|(?:02)-(?:0[1-9]|1\\d|2[0-8])))",
	Vn = new RegExp(`^${Ps}$`)
function Ts(t) {
	const r = "(?:[01]\\d|2[0-3]):[0-5]\\d"
	return typeof t.precision == "number"
		? t.precision === -1
			? `${r}`
			: t.precision === 0
				? `${r}:[0-5]\\d`
				: `${r}:[0-5]\\d\\.\\d{${t.precision}}`
		: `${r}(?::[0-5]\\d(?:\\.\\d+)?)?`
}
function Fn(t) {
	return new RegExp(`^${Ts(t)}$`)
}
function Hn(t) {
	const r = Ts({ precision: t.precision }),
		n = ["Z"]
	t.local && n.push(""), t.offset && n.push("([+-]\\d{2}:\\d{2})")
	const i = `${r}(?:${n.join("|")})`
	return new RegExp(`^${Ps}T(?:${i})$`)
}
var Jn = (t) => {
		const r = t ? `[\\s\\S]{${t?.minimum ?? 0},${t?.maximum ?? ""}}` : "[\\s\\S]*"
		return new RegExp(`^${r}$`)
	},
	Bn = /^\d+n?$/,
	Wn = /^\d+$/,
	Gn = /^-?\d+(?:\.\d+)?/i,
	Kn = /true|false/i,
	Qn = /null/i
var Xn = /undefined/i
var Yn = /^[^A-Z]*$/,
	eo = /^[^a-z]*$/
var V = u("$ZodCheck", (t, r) => {
		var n
		t._zod ?? (t._zod = {}), (t._zod.def = r), (n = t._zod).onattach ?? (n.onattach = [])
	}),
	Ns = { number: "number", bigint: "bigint", object: "date" },
	nr = u("$ZodCheckLessThan", (t, r) => {
		V.init(t, r)
		const n = Ns[typeof r.value]
		t._zod.onattach.push((i) => {
			const e = i._zod.bag,
				o = (r.inclusive ? e.maximum : e.exclusiveMaximum) ?? Number.POSITIVE_INFINITY
			r.value < o && (r.inclusive ? (e.maximum = r.value) : (e.exclusiveMaximum = r.value))
		}),
			(t._zod.check = (i) => {
				;(r.inclusive ? i.value <= r.value : i.value < r.value) ||
					i.issues.push({
						origin: n,
						code: "too_big",
						maximum: r.value,
						input: i.value,
						inclusive: r.inclusive,
						inst: t,
						continue: !r.abort,
					})
			})
	}),
	or = u("$ZodCheckGreaterThan", (t, r) => {
		V.init(t, r)
		const n = Ns[typeof r.value]
		t._zod.onattach.push((i) => {
			const e = i._zod.bag,
				o = (r.inclusive ? e.minimum : e.exclusiveMinimum) ?? Number.NEGATIVE_INFINITY
			r.value > o && (r.inclusive ? (e.minimum = r.value) : (e.exclusiveMinimum = r.value))
		}),
			(t._zod.check = (i) => {
				;(r.inclusive ? i.value >= r.value : i.value > r.value) ||
					i.issues.push({
						origin: n,
						code: "too_small",
						minimum: r.value,
						input: i.value,
						inclusive: r.inclusive,
						inst: t,
						continue: !r.abort,
					})
			})
	}),
	to = u("$ZodCheckMultipleOf", (t, r) => {
		V.init(t, r),
			t._zod.onattach.push((n) => {
				var i
				;(i = n._zod.bag).multipleOf ?? (i.multipleOf = r.value)
			}),
			(t._zod.check = (n) => {
				if (typeof n.value != typeof r.value) throw new Error("Cannot mix number and bigint in multiple_of check.")
				;(typeof n.value == "bigint" ? n.value % r.value === BigInt(0) : hn(n.value, r.value) === 0) ||
					n.issues.push({
						origin: typeof n.value,
						code: "not_multiple_of",
						divisor: r.value,
						input: n.value,
						inst: t,
						continue: !r.abort,
					})
			})
	}),
	ro = u("$ZodCheckNumberFormat", (t, r) => {
		V.init(t, r), (r.format = r.format || "float64")
		const n = r.format?.includes("int"),
			i = n ? "int" : "number",
			[e, o] = $n[r.format]
		t._zod.onattach.push((a) => {
			const c = a._zod.bag
			;(c.format = r.format), (c.minimum = e), (c.maximum = o), n && (c.pattern = Wn)
		}),
			(t._zod.check = (a) => {
				const c = a.value
				if (n) {
					if (!Number.isInteger(c)) {
						a.issues.push({ expected: i, format: r.format, code: "invalid_type", input: c, inst: t })
						return
					}
					if (!Number.isSafeInteger(c)) {
						c > 0
							? a.issues.push({
									input: c,
									code: "too_big",
									maximum: Number.MAX_SAFE_INTEGER,
									note: "Integers must be within the safe integer range.",
									inst: t,
									origin: i,
									continue: !r.abort,
								})
							: a.issues.push({
									input: c,
									code: "too_small",
									minimum: Number.MIN_SAFE_INTEGER,
									note: "Integers must be within the safe integer range.",
									inst: t,
									origin: i,
									continue: !r.abort,
								})
						return
					}
				}
				c < e &&
					a.issues.push({
						origin: "number",
						input: c,
						code: "too_small",
						minimum: e,
						inclusive: !0,
						inst: t,
						continue: !r.abort,
					}),
					c > o && a.issues.push({ origin: "number", input: c, code: "too_big", maximum: o, inst: t })
			})
	}),
	no = u("$ZodCheckBigIntFormat", (t, r) => {
		V.init(t, r)
		const [n, i] = xn[r.format]
		t._zod.onattach.push((e) => {
			const o = e._zod.bag
			;(o.format = r.format), (o.minimum = n), (o.maximum = i)
		}),
			(t._zod.check = (e) => {
				const o = e.value
				o < n &&
					e.issues.push({
						origin: "bigint",
						input: o,
						code: "too_small",
						minimum: n,
						inclusive: !0,
						inst: t,
						continue: !r.abort,
					}),
					o > i && e.issues.push({ origin: "bigint", input: o, code: "too_big", maximum: i, inst: t })
			})
	}),
	oo = u("$ZodCheckMaxSize", (t, r) => {
		var n
		V.init(t, r),
			(n = t._zod.def).when ??
				(n.when = (i) => {
					const e = i.value
					return !he(e) && e.size !== void 0
				}),
			t._zod.onattach.push((i) => {
				const e = i._zod.bag.maximum ?? Number.POSITIVE_INFINITY
				r.maximum < e && (i._zod.bag.maximum = r.maximum)
			}),
			(t._zod.check = (i) => {
				const e = i.value
				e.size <= r.maximum ||
					i.issues.push({ origin: rt(e), code: "too_big", maximum: r.maximum, input: e, inst: t, continue: !r.abort })
			})
	}),
	io = u("$ZodCheckMinSize", (t, r) => {
		var n
		V.init(t, r),
			(n = t._zod.def).when ??
				(n.when = (i) => {
					const e = i.value
					return !he(e) && e.size !== void 0
				}),
			t._zod.onattach.push((i) => {
				const e = i._zod.bag.minimum ?? Number.NEGATIVE_INFINITY
				r.minimum > e && (i._zod.bag.minimum = r.minimum)
			}),
			(t._zod.check = (i) => {
				const e = i.value
				e.size >= r.minimum ||
					i.issues.push({ origin: rt(e), code: "too_small", minimum: r.minimum, input: e, inst: t, continue: !r.abort })
			})
	}),
	ao = u("$ZodCheckSizeEquals", (t, r) => {
		var n
		V.init(t, r),
			(n = t._zod.def).when ??
				(n.when = (i) => {
					const e = i.value
					return !he(e) && e.size !== void 0
				}),
			t._zod.onattach.push((i) => {
				const e = i._zod.bag
				;(e.minimum = r.size), (e.maximum = r.size), (e.size = r.size)
			}),
			(t._zod.check = (i) => {
				const e = i.value,
					o = e.size
				if (o === r.size) return
				const a = o > r.size
				i.issues.push({
					origin: rt(e),
					...(a ? { code: "too_big", maximum: r.size } : { code: "too_small", minimum: r.size }),
					inclusive: !0,
					exact: !0,
					input: i.value,
					inst: t,
					continue: !r.abort,
				})
			})
	}),
	so = u("$ZodCheckMaxLength", (t, r) => {
		var n
		V.init(t, r),
			(n = t._zod.def).when ??
				(n.when = (i) => {
					const e = i.value
					return !he(e) && e.length !== void 0
				}),
			t._zod.onattach.push((i) => {
				const e = i._zod.bag.maximum ?? Number.POSITIVE_INFINITY
				r.maximum < e && (i._zod.bag.maximum = r.maximum)
			}),
			(t._zod.check = (i) => {
				const e = i.value
				if (e.length <= r.maximum) return
				const a = nt(e)
				i.issues.push({
					origin: a,
					code: "too_big",
					maximum: r.maximum,
					inclusive: !0,
					input: e,
					inst: t,
					continue: !r.abort,
				})
			})
	}),
	co = u("$ZodCheckMinLength", (t, r) => {
		var n
		V.init(t, r),
			(n = t._zod.def).when ??
				(n.when = (i) => {
					const e = i.value
					return !he(e) && e.length !== void 0
				}),
			t._zod.onattach.push((i) => {
				const e = i._zod.bag.minimum ?? Number.NEGATIVE_INFINITY
				r.minimum > e && (i._zod.bag.minimum = r.minimum)
			}),
			(t._zod.check = (i) => {
				const e = i.value
				if (e.length >= r.minimum) return
				const a = nt(e)
				i.issues.push({
					origin: a,
					code: "too_small",
					minimum: r.minimum,
					inclusive: !0,
					input: e,
					inst: t,
					continue: !r.abort,
				})
			})
	}),
	uo = u("$ZodCheckLengthEquals", (t, r) => {
		var n
		V.init(t, r),
			(n = t._zod.def).when ??
				(n.when = (i) => {
					const e = i.value
					return !he(e) && e.length !== void 0
				}),
			t._zod.onattach.push((i) => {
				const e = i._zod.bag
				;(e.minimum = r.length), (e.maximum = r.length), (e.length = r.length)
			}),
			(t._zod.check = (i) => {
				const e = i.value,
					o = e.length
				if (o === r.length) return
				const a = nt(e),
					c = o > r.length
				i.issues.push({
					origin: a,
					...(c ? { code: "too_big", maximum: r.length } : { code: "too_small", minimum: r.length }),
					inclusive: !0,
					exact: !0,
					input: i.value,
					inst: t,
					continue: !r.abort,
				})
			})
	}),
	Re = u("$ZodCheckStringFormat", (t, r) => {
		var n, i
		V.init(t, r),
			t._zod.onattach.push((e) => {
				const o = e._zod.bag
				;(o.format = r.format), r.pattern && (o.patterns ?? (o.patterns = new Set()), o.patterns.add(r.pattern))
			}),
			r.pattern
				? ((n = t._zod).check ??
					(n.check = (e) => {
						;(r.pattern.lastIndex = 0),
							!r.pattern.test(e.value) &&
								e.issues.push({
									origin: "string",
									code: "invalid_format",
									format: r.format,
									input: e.value,
									...(r.pattern ? { pattern: r.pattern.toString() } : {}),
									inst: t,
									continue: !r.abort,
								})
					}))
				: ((i = t._zod).check ?? (i.check = () => {}))
	}),
	lo = u("$ZodCheckRegex", (t, r) => {
		Re.init(t, r),
			(t._zod.check = (n) => {
				;(r.pattern.lastIndex = 0),
					!r.pattern.test(n.value) &&
						n.issues.push({
							origin: "string",
							code: "invalid_format",
							format: "regex",
							input: n.value,
							pattern: r.pattern.toString(),
							inst: t,
							continue: !r.abort,
						})
			})
	}),
	mo = u("$ZodCheckLowerCase", (t, r) => {
		r.pattern ?? (r.pattern = Yn), Re.init(t, r)
	}),
	po = u("$ZodCheckUpperCase", (t, r) => {
		r.pattern ?? (r.pattern = eo), Re.init(t, r)
	}),
	fo = u("$ZodCheckIncludes", (t, r) => {
		V.init(t, r)
		const n = ue(r.includes),
			i = new RegExp(typeof r.position == "number" ? `^.{${r.position}}${n}` : n)
		;(r.pattern = i),
			t._zod.onattach.push((e) => {
				const o = e._zod.bag
				o.patterns ?? (o.patterns = new Set()), o.patterns.add(i)
			}),
			(t._zod.check = (e) => {
				e.value.includes(r.includes, r.position) ||
					e.issues.push({
						origin: "string",
						code: "invalid_format",
						format: "includes",
						includes: r.includes,
						input: e.value,
						inst: t,
						continue: !r.abort,
					})
			})
	}),
	go = u("$ZodCheckStartsWith", (t, r) => {
		V.init(t, r)
		const n = new RegExp(`^${ue(r.prefix)}.*`)
		r.pattern ?? (r.pattern = n),
			t._zod.onattach.push((i) => {
				const e = i._zod.bag
				e.patterns ?? (e.patterns = new Set()), e.patterns.add(n)
			}),
			(t._zod.check = (i) => {
				i.value.startsWith(r.prefix) ||
					i.issues.push({
						origin: "string",
						code: "invalid_format",
						format: "starts_with",
						prefix: r.prefix,
						input: i.value,
						inst: t,
						continue: !r.abort,
					})
			})
	}),
	ho = u("$ZodCheckEndsWith", (t, r) => {
		V.init(t, r)
		const n = new RegExp(`.*${ue(r.suffix)}$`)
		r.pattern ?? (r.pattern = n),
			t._zod.onattach.push((i) => {
				const e = i._zod.bag
				e.patterns ?? (e.patterns = new Set()), e.patterns.add(n)
			}),
			(t._zod.check = (i) => {
				i.value.endsWith(r.suffix) ||
					i.issues.push({
						origin: "string",
						code: "invalid_format",
						format: "ends_with",
						suffix: r.suffix,
						input: i.value,
						inst: t,
						continue: !r.abort,
					})
			})
	})
function Os(t, r, n) {
	t.issues.length && r.issues.push(...Y(n, t.issues))
}
var vo = u("$ZodCheckProperty", (t, r) => {
		V.init(t, r),
			(t._zod.check = (n) => {
				const i = r.schema._zod.run({ value: n.value[r.property], issues: [] }, {})
				if (i instanceof Promise) return i.then((e) => Os(e, n, r.property))
				Os(i, n, r.property)
			})
	}),
	bo = u("$ZodCheckMimeType", (t, r) => {
		V.init(t, r)
		const n = new Set(r.mime)
		t._zod.onattach.push((i) => {
			i._zod.bag.mime = r.mime
		}),
			(t._zod.check = (i) => {
				n.has(i.value.type) || i.issues.push({ code: "invalid_value", values: r.mime, input: i.value.type, inst: t })
			})
	}),
	_o = u("$ZodCheckOverwrite", (t, r) => {
		V.init(t, r),
			(t._zod.check = (n) => {
				n.value = r.tx(n.value)
			})
	})
var lt = class {
	constructor(r = []) {
		;(this.content = []), (this.indent = 0), this && (this.args = r)
	}
	indented(r) {
		;(this.indent += 1), r(this), (this.indent -= 1)
	}
	write(r) {
		if (typeof r == "function") {
			r(this, { execution: "sync" }), r(this, { execution: "async" })
			return
		}
		const i = r
				.split(`
`)
				.filter((a) => a),
			e = Math.min(...i.map((a) => a.length - a.trimStart().length)),
			o = i.map((a) => a.slice(e)).map((a) => " ".repeat(this.indent * 2) + a)
		for (const a of o) this.content.push(a)
	}
	compile() {
		const r = Function,
			n = this?.args,
			e = [...(this?.content ?? [""]).map((o) => `  ${o}`)]
		return new r(
			...n,
			e.join(`
`),
		)
	}
}
var yo = { major: 4, minor: 0, patch: 0 }
var j = u("$ZodType", (t, r) => {
		var n
		t ?? (t = {}), (t._zod.def = r), (t._zod.bag = t._zod.bag || {}), (t._zod.version = yo)
		const i = [...(t._zod.def.checks ?? [])]
		t._zod.traits.has("$ZodCheck") && i.unshift(t)
		for (const e of i) for (const o of e._zod.onattach) o(t)
		if (i.length === 0)
			(n = t._zod).deferred ?? (n.deferred = []),
				t._zod.deferred?.push(() => {
					t._zod.run = t._zod.parse
				})
		else {
			const e = (o, a, c) => {
				let p = ze(o),
					h
				for (const g of a) {
					if (g._zod.def.when) {
						if (!g._zod.def.when(o)) continue
					} else if (p) continue
					const m = o.issues.length,
						$ = g._zod.check(o)
					if ($ instanceof Promise && c?.async === !1) throw new se()
					if (h || $ instanceof Promise)
						h = (h ?? Promise.resolve()).then(async () => {
							await $, o.issues.length !== m && (p || (p = ze(o, m)))
						})
					else {
						if (o.issues.length === m) continue
						p || (p = ze(o, m))
					}
				}
				return h ? h.then(() => o) : o
			}
			t._zod.run = (o, a) => {
				const c = t._zod.parse(o, a)
				if (c instanceof Promise) {
					if (a.async === !1) throw new se()
					return c.then((p) => e(p, i, a))
				}
				return e(c, i, a)
			}
		}
		t["~standard"] = {
			validate: (e) => {
				try {
					const o = De(t, e)
					return o.success ? { value: o.data } : { issues: o.error?.issues }
				} catch {
					return ut(t, e).then((a) => (a.success ? { value: a.data } : { issues: a.error?.issues }))
				}
			},
			vendor: "zod",
			version: 1,
		}
	}),
	we = u("$ZodString", (t, r) => {
		j.init(t, r),
			(t._zod.pattern = [...(t?._zod.bag?.patterns ?? [])].pop() ?? Jn(t._zod.bag)),
			(t._zod.parse = (n, i) => {
				if (r.coerce)
					try {
						n.value = String(n.value)
					} catch {}
				return (
					typeof n.value == "string" ||
						n.issues.push({ expected: "string", code: "invalid_type", input: n.value, inst: t }),
					n
				)
			})
	}),
	A = u("$ZodStringFormat", (t, r) => {
		Re.init(t, r), we.init(t, r)
	}),
	xo = u("$ZodGUID", (t, r) => {
		r.pattern ?? (r.pattern = Un), A.init(t, r)
	}),
	zo = u("$ZodUUID", (t, r) => {
		if (r.version) {
			const i = { v1: 1, v2: 2, v3: 3, v4: 4, v5: 5, v6: 6, v7: 7, v8: 8 }[r.version]
			if (i === void 0) throw new Error(`Invalid UUID version: "${r.version}"`)
			r.pattern ?? (r.pattern = ke(i))
		} else r.pattern ?? (r.pattern = ke())
		A.init(t, r)
	}),
	ko = u("$ZodEmail", (t, r) => {
		r.pattern ?? (r.pattern = Zn), A.init(t, r)
	}),
	So = u("$ZodURL", (t, r) => {
		A.init(t, r),
			(t._zod.check = (n) => {
				try {
					const i = n.value,
						e = new URL(i),
						o = e.href
					r.hostname &&
						((r.hostname.lastIndex = 0),
						r.hostname.test(e.hostname) ||
							n.issues.push({
								code: "invalid_format",
								format: "url",
								note: "Invalid hostname",
								pattern: Mn.source,
								input: n.value,
								inst: t,
								continue: !r.abort,
							})),
						r.protocol &&
							((r.protocol.lastIndex = 0),
							r.protocol.test(e.protocol.endsWith(":") ? e.protocol.slice(0, -1) : e.protocol) ||
								n.issues.push({
									code: "invalid_format",
									format: "url",
									note: "Invalid protocol",
									pattern: r.protocol.source,
									input: n.value,
									inst: t,
									continue: !r.abort,
								})),
						!i.endsWith("/") && o.endsWith("/") ? (n.value = o.slice(0, -1)) : (n.value = o)
					return
				} catch {
					n.issues.push({ code: "invalid_format", format: "url", input: n.value, inst: t, continue: !r.abort })
				}
			})
	}),
	wo = u("$ZodEmoji", (t, r) => {
		r.pattern ?? (r.pattern = Dn()), A.init(t, r)
	}),
	Io = u("$ZodNanoID", (t, r) => {
		r.pattern ?? (r.pattern = On), A.init(t, r)
	}),
	jo = u("$ZodCUID", (t, r) => {
		r.pattern ?? (r.pattern = wn), A.init(t, r)
	}),
	Po = u("$ZodCUID2", (t, r) => {
		r.pattern ?? (r.pattern = In), A.init(t, r)
	}),
	To = u("$ZodULID", (t, r) => {
		r.pattern ?? (r.pattern = jn), A.init(t, r)
	}),
	Oo = u("$ZodXID", (t, r) => {
		r.pattern ?? (r.pattern = Pn), A.init(t, r)
	}),
	No = u("$ZodKSUID", (t, r) => {
		r.pattern ?? (r.pattern = Tn), A.init(t, r)
	}),
	Uo = u("$ZodISODateTime", (t, r) => {
		r.pattern ?? (r.pattern = Hn(r)), A.init(t, r)
	}),
	Zo = u("$ZodISODate", (t, r) => {
		r.pattern ?? (r.pattern = Vn), A.init(t, r)
	}),
	Do = u("$ZodISOTime", (t, r) => {
		r.pattern ?? (r.pattern = Fn(r)), A.init(t, r)
	}),
	Ro = u("$ZodISODuration", (t, r) => {
		r.pattern ?? (r.pattern = Nn), A.init(t, r)
	}),
	Eo = u("$ZodIPv4", (t, r) => {
		r.pattern ?? (r.pattern = Rn),
			A.init(t, r),
			t._zod.onattach.push((n) => {
				const i = n._zod.bag
				i.format = "ipv4"
			})
	}),
	Ao = u("$ZodIPv6", (t, r) => {
		r.pattern ?? (r.pattern = En),
			A.init(t, r),
			t._zod.onattach.push((n) => {
				const i = n._zod.bag
				i.format = "ipv6"
			}),
			(t._zod.check = (n) => {
				try {
					new URL(`http://[${n.value}]`)
				} catch {
					n.issues.push({ code: "invalid_format", format: "ipv6", input: n.value, inst: t, continue: !r.abort })
				}
			})
	}),
	Co = u("$ZodCIDRv4", (t, r) => {
		r.pattern ?? (r.pattern = An), A.init(t, r)
	}),
	Lo = u("$ZodCIDRv6", (t, r) => {
		r.pattern ?? (r.pattern = Cn),
			A.init(t, r),
			(t._zod.check = (n) => {
				const [i, e] = n.value.split("/")
				try {
					if (!e) throw new Error()
					const o = Number(e)
					if (`${o}` !== e) throw new Error()
					if (o < 0 || o > 128) throw new Error()
					new URL(`http://[${i}]`)
				} catch {
					n.issues.push({ code: "invalid_format", format: "cidrv6", input: n.value, inst: t, continue: !r.abort })
				}
			})
	})
function Mo(t) {
	if (t === "") return !0
	if (t.length % 4 !== 0) return !1
	try {
		return atob(t), !0
	} catch {
		return !1
	}
}
var qo = u("$ZodBase64", (t, r) => {
	r.pattern ?? (r.pattern = Ln),
		A.init(t, r),
		t._zod.onattach.push((n) => {
			n._zod.bag.contentEncoding = "base64"
		}),
		(t._zod.check = (n) => {
			Mo(n.value) ||
				n.issues.push({ code: "invalid_format", format: "base64", input: n.value, inst: t, continue: !r.abort })
		})
})
function Hs(t) {
	if (!rr.test(t)) return !1
	const r = t.replace(/[-_]/g, (i) => (i === "-" ? "+" : "/")),
		n = r.padEnd(Math.ceil(r.length / 4) * 4, "=")
	return Mo(n)
}
var Vo = u("$ZodBase64URL", (t, r) => {
		r.pattern ?? (r.pattern = rr),
			A.init(t, r),
			t._zod.onattach.push((n) => {
				n._zod.bag.contentEncoding = "base64url"
			}),
			(t._zod.check = (n) => {
				Hs(n.value) ||
					n.issues.push({ code: "invalid_format", format: "base64url", input: n.value, inst: t, continue: !r.abort })
			})
	}),
	Fo = u("$ZodE164", (t, r) => {
		r.pattern ?? (r.pattern = qn), A.init(t, r)
	})
function Js(t, r = null) {
	try {
		const n = t.split(".")
		if (n.length !== 3) return !1
		const [i] = n
		if (!i) return !1
		const e = JSON.parse(atob(i))
		return !(("typ" in e && e?.typ !== "JWT") || !e.alg || (r && (!("alg" in e) || e.alg !== r)))
	} catch {
		return !1
	}
}
var Ho = u("$ZodJWT", (t, r) => {
		A.init(t, r),
			(t._zod.check = (n) => {
				Js(n.value, r.alg) ||
					n.issues.push({ code: "invalid_format", format: "jwt", input: n.value, inst: t, continue: !r.abort })
			})
	}),
	Jo = u("$ZodCustomStringFormat", (t, r) => {
		A.init(t, r),
			(t._zod.check = (n) => {
				r.fn(n.value) ||
					n.issues.push({ code: "invalid_format", format: r.format, input: n.value, inst: t, continue: !r.abort })
			})
	}),
	sr = u("$ZodNumber", (t, r) => {
		j.init(t, r),
			(t._zod.pattern = t._zod.bag.pattern ?? Gn),
			(t._zod.parse = (n, i) => {
				if (r.coerce)
					try {
						n.value = Number(n.value)
					} catch {}
				const e = n.value
				if (typeof e == "number" && !Number.isNaN(e) && Number.isFinite(e)) return n
				const o = typeof e == "number" ? (Number.isNaN(e) ? "NaN" : Number.isFinite(e) ? void 0 : "Infinity") : void 0
				return (
					n.issues.push({ expected: "number", code: "invalid_type", input: e, inst: t, ...(o ? { received: o } : {}) }),
					n
				)
			})
	}),
	Bo = u("$ZodNumber", (t, r) => {
		ro.init(t, r), sr.init(t, r)
	}),
	mt = u("$ZodBoolean", (t, r) => {
		j.init(t, r),
			(t._zod.pattern = Kn),
			(t._zod.parse = (n, i) => {
				if (r.coerce)
					try {
						n.value = !!n.value
					} catch {}
				const e = n.value
				return (
					typeof e == "boolean" || n.issues.push({ expected: "boolean", code: "invalid_type", input: e, inst: t }), n
				)
			})
	}),
	cr = u("$ZodBigInt", (t, r) => {
		j.init(t, r),
			(t._zod.pattern = Bn),
			(t._zod.parse = (n, i) => {
				if (r.coerce)
					try {
						n.value = BigInt(n.value)
					} catch {}
				return (
					typeof n.value == "bigint" ||
						n.issues.push({ expected: "bigint", code: "invalid_type", input: n.value, inst: t }),
					n
				)
			})
	}),
	Wo = u("$ZodBigInt", (t, r) => {
		no.init(t, r), cr.init(t, r)
	}),
	Go = u("$ZodSymbol", (t, r) => {
		j.init(t, r),
			(t._zod.parse = (n, i) => {
				const e = n.value
				return typeof e == "symbol" || n.issues.push({ expected: "symbol", code: "invalid_type", input: e, inst: t }), n
			})
	}),
	Ko = u("$ZodUndefined", (t, r) => {
		j.init(t, r),
			(t._zod.pattern = Xn),
			(t._zod.values = new Set([void 0])),
			(t._zod.optin = "optional"),
			(t._zod.optout = "optional"),
			(t._zod.parse = (n, i) => {
				const e = n.value
				return typeof e > "u" || n.issues.push({ expected: "undefined", code: "invalid_type", input: e, inst: t }), n
			})
	}),
	Qo = u("$ZodNull", (t, r) => {
		j.init(t, r),
			(t._zod.pattern = Qn),
			(t._zod.values = new Set([null])),
			(t._zod.parse = (n, i) => {
				const e = n.value
				return e === null || n.issues.push({ expected: "null", code: "invalid_type", input: e, inst: t }), n
			})
	}),
	Xo = u("$ZodAny", (t, r) => {
		j.init(t, r), (t._zod.parse = (n) => n)
	}),
	Ee = u("$ZodUnknown", (t, r) => {
		j.init(t, r), (t._zod.parse = (n) => n)
	}),
	Yo = u("$ZodNever", (t, r) => {
		j.init(t, r),
			(t._zod.parse = (n, i) => (
				n.issues.push({ expected: "never", code: "invalid_type", input: n.value, inst: t }), n
			))
	}),
	ei = u("$ZodVoid", (t, r) => {
		j.init(t, r),
			(t._zod.parse = (n, i) => {
				const e = n.value
				return typeof e > "u" || n.issues.push({ expected: "void", code: "invalid_type", input: e, inst: t }), n
			})
	}),
	ti = u("$ZodDate", (t, r) => {
		j.init(t, r),
			(t._zod.parse = (n, i) => {
				if (r.coerce)
					try {
						n.value = new Date(n.value)
					} catch {}
				const e = n.value,
					o = e instanceof Date
				return (
					(o && !Number.isNaN(e.getTime())) ||
						n.issues.push({
							expected: "date",
							code: "invalid_type",
							input: e,
							...(o ? { received: "Invalid Date" } : {}),
							inst: t,
						}),
					n
				)
			})
	})
function Zs(t, r, n) {
	t.issues.length && r.issues.push(...Y(n, t.issues)), (r.value[n] = t.value)
}
var pt = u("$ZodArray", (t, r) => {
	j.init(t, r),
		(t._zod.parse = (n, i) => {
			const e = n.value
			if (!Array.isArray(e)) return n.issues.push({ expected: "array", code: "invalid_type", input: e, inst: t }), n
			n.value = Array(e.length)
			const o = []
			for (let a = 0; a < e.length; a++) {
				const c = e[a],
					p = r.element._zod.run({ value: c, issues: [] }, i)
				p instanceof Promise ? o.push(p.then((h) => Zs(h, n, a))) : Zs(p, n, a)
			}
			return o.length ? Promise.all(o).then(() => n) : n
		})
})
function ir(t, r, n) {
	t.issues.length && r.issues.push(...Y(n, t.issues)), (r.value[n] = t.value)
}
function Ds(t, r, n, i) {
	t.issues.length
		? i[n] === void 0
			? n in i
				? (r.value[n] = void 0)
				: (r.value[n] = t.value)
			: r.issues.push(...Y(n, t.issues))
		: t.value === void 0
			? n in i && (r.value[n] = void 0)
			: (r.value[n] = t.value)
}
var ri = u("$ZodObject", (t, r) => {
	j.init(t, r)
	const n = Ye(() => {
		const m = Object.keys(r.shape)
		for (const b of m)
			if (!(r.shape[b] instanceof j)) throw new Error(`Invalid element at key "${b}": expected a Zod schema`)
		const $ = yn(r.shape)
		return { shape: r.shape, keys: m, keySet: new Set(m), numKeys: m.length, optionalKeys: new Set($) }
	})
	U(t._zod, "propValues", () => {
		const m = r.shape,
			$ = {}
		for (const b in m) {
			const d = m[b]._zod
			if (d.values) {
				$[b] ?? ($[b] = new Set())
				for (const x of d.values) $[b].add(x)
			}
		}
		return $
	})
	let i = (m) => {
			const $ = new lt(["shape", "payload", "ctx"]),
				b = n.value,
				d = (S) => {
					const I = xe(S)
					return `shape[${I}]._zod.run({ value: input[${I}], issues: [] }, ctx)`
				}
			$.write("const input = payload.value;")
			let x = Object.create(null),
				k = 0
			for (const S of b.keys) x[S] = `key_${k++}`
			$.write("const newResult = {}")
			for (const S of b.keys)
				if (b.optionalKeys.has(S)) {
					const I = x[S]
					$.write(`const ${I} = ${d(S)};`)
					const O = xe(S)
					$.write(`
        if (${I}.issues.length) {
          if (input[${O}] === undefined) {
            if (${O} in input) {
              newResult[${O}] = undefined;
            }
          } else {
            payload.issues = payload.issues.concat(
              ${I}.issues.map((iss) => ({
                ...iss,
                path: iss.path ? [${O}, ...iss.path] : [${O}],
              }))
            );
          }
        } else if (${I}.value === undefined) {
          if (${O} in input) newResult[${O}] = undefined;
        } else {
          newResult[${O}] = ${I}.value;
        }
        `)
				} else {
					const I = x[S]
					$.write(`const ${I} = ${d(S)};`),
						$.write(`
          if (${I}.issues.length) payload.issues = payload.issues.concat(${I}.issues.map(iss => ({
            ...iss,
            path: iss.path ? [${xe(S)}, ...iss.path] : [${xe(S)}]
          })));`),
						$.write(`newResult[${xe(S)}] = ${I}.value`)
				}
			$.write("payload.value = newResult;"), $.write("return payload;")
			const D = $.compile()
			return (S, I) => D(m, S, I)
		},
		e,
		o = Ne,
		a = !Ke.jitless,
		p = a && bn.value,
		h = r.catchall,
		g
	t._zod.parse = (m, $) => {
		g ?? (g = n.value)
		const b = m.value
		if (!o(b)) return m.issues.push({ expected: "object", code: "invalid_type", input: b, inst: t }), m
		const d = []
		if (a && p && $?.async === !1 && $.jitless !== !0) e || (e = i(r.shape)), (m = e(m, $))
		else {
			m.value = {}
			const I = g.shape
			for (const O of g.keys) {
				const ye = I[O],
					Kt = ye._zod.run({ value: b[O], issues: [] }, $),
					ks = ye._zod.optin === "optional" && ye._zod.optout === "optional"
				Kt instanceof Promise
					? d.push(Kt.then((Ss) => (ks ? Ds(Ss, m, O, b) : ir(Ss, m, O))))
					: ks
						? Ds(Kt, m, O, b)
						: ir(Kt, m, O)
			}
		}
		if (!h) return d.length ? Promise.all(d).then(() => m) : m
		const x = [],
			k = g.keySet,
			D = h._zod,
			S = D.def.type
		for (const I of Object.keys(b)) {
			if (k.has(I)) continue
			if (S === "never") {
				x.push(I)
				continue
			}
			const O = D.run({ value: b[I], issues: [] }, $)
			O instanceof Promise ? d.push(O.then((ye) => ir(ye, m, I))) : ir(O, m, I)
		}
		return (
			x.length && m.issues.push({ code: "unrecognized_keys", keys: x, input: b, inst: t }),
			d.length ? Promise.all(d).then(() => m) : m
		)
	}
})
function Rs(t, r, n, i) {
	for (const e of t) if (e.issues.length === 0) return (r.value = e.value), r
	return (
		r.issues.push({
			code: "invalid_union",
			input: r.value,
			inst: n,
			errors: t.map((e) => e.issues.map((o) => re(o, i, F()))),
		}),
		r
	)
}
var ur = u("$ZodUnion", (t, r) => {
		j.init(t, r),
			U(t._zod, "optin", () => (r.options.some((n) => n._zod.optin === "optional") ? "optional" : void 0)),
			U(t._zod, "optout", () => (r.options.some((n) => n._zod.optout === "optional") ? "optional" : void 0)),
			U(t._zod, "values", () => {
				if (r.options.every((n) => n._zod.values)) return new Set(r.options.flatMap((n) => Array.from(n._zod.values)))
			}),
			U(t._zod, "pattern", () => {
				if (r.options.every((n) => n._zod.pattern)) {
					const n = r.options.map((i) => i._zod.pattern)
					return new RegExp(`^(${n.map((i) => et(i.source)).join("|")})$`)
				}
			}),
			(t._zod.parse = (n, i) => {
				let e = !1,
					o = []
				for (const a of r.options) {
					const c = a._zod.run({ value: n.value, issues: [] }, i)
					if (c instanceof Promise) o.push(c), (e = !0)
					else {
						if (c.issues.length === 0) return c
						o.push(c)
					}
				}
				return e ? Promise.all(o).then((a) => Rs(a, n, t, i)) : Rs(o, n, t, i)
			})
	}),
	ni = u("$ZodDiscriminatedUnion", (t, r) => {
		ur.init(t, r)
		const n = t._zod.parse
		U(t._zod, "propValues", () => {
			const e = {}
			for (const o of r.options) {
				const a = o._zod.propValues
				if (!a || Object.keys(a).length === 0)
					throw new Error(`Invalid discriminated union option at index "${r.options.indexOf(o)}"`)
				for (const [c, p] of Object.entries(a)) {
					e[c] || (e[c] = new Set())
					for (const h of p) e[c].add(h)
				}
			}
			return e
		})
		const i = Ye(() => {
			const e = r.options,
				o = new Map()
			for (const a of e) {
				const c = a._zod.propValues[r.discriminator]
				if (!c || c.size === 0) throw new Error(`Invalid discriminated union option at index "${r.options.indexOf(a)}"`)
				for (const p of c) {
					if (o.has(p)) throw new Error(`Duplicate discriminator value "${String(p)}"`)
					o.set(p, a)
				}
			}
			return o
		})
		t._zod.parse = (e, o) => {
			const a = e.value
			if (!Ne(a)) return e.issues.push({ code: "invalid_type", expected: "object", input: a, inst: t }), e
			const c = i.value.get(a?.[r.discriminator])
			return c
				? c._zod.run(e, o)
				: r.unionFallback
					? n(e, o)
					: (e.issues.push({
							code: "invalid_union",
							errors: [],
							note: "No matching discriminator",
							input: a,
							path: [r.discriminator],
							inst: t,
						}),
						e)
		}
	}),
	oi = u("$ZodIntersection", (t, r) => {
		j.init(t, r),
			(t._zod.parse = (n, i) => {
				const e = n.value,
					o = r.left._zod.run({ value: e, issues: [] }, i),
					a = r.right._zod.run({ value: e, issues: [] }, i)
				return o instanceof Promise || a instanceof Promise
					? Promise.all([o, a]).then(([p, h]) => Es(n, p, h))
					: Es(n, o, a)
			})
	})
function $o(t, r) {
	if (t === r) return { valid: !0, data: t }
	if (t instanceof Date && r instanceof Date && +t == +r) return { valid: !0, data: t }
	if (Ue(t) && Ue(r)) {
		const n = Object.keys(r),
			i = Object.keys(t).filter((o) => n.indexOf(o) !== -1),
			e = { ...t, ...r }
		for (const o of i) {
			const a = $o(t[o], r[o])
			if (!a.valid) return { valid: !1, mergeErrorPath: [o, ...a.mergeErrorPath] }
			e[o] = a.data
		}
		return { valid: !0, data: e }
	}
	if (Array.isArray(t) && Array.isArray(r)) {
		if (t.length !== r.length) return { valid: !1, mergeErrorPath: [] }
		const n = []
		for (let i = 0; i < t.length; i++) {
			const e = t[i],
				o = r[i],
				a = $o(e, o)
			if (!a.valid) return { valid: !1, mergeErrorPath: [i, ...a.mergeErrorPath] }
			n.push(a.data)
		}
		return { valid: !0, data: n }
	}
	return { valid: !1, mergeErrorPath: [] }
}
function Es(t, r, n) {
	if ((r.issues.length && t.issues.push(...r.issues), n.issues.length && t.issues.push(...n.issues), ze(t))) return t
	const i = $o(r.value, n.value)
	if (!i.valid) throw new Error(`Unmergable intersection. Error path: ${JSON.stringify(i.mergeErrorPath)}`)
	return (t.value = i.data), t
}
var Ie = u("$ZodTuple", (t, r) => {
	j.init(t, r)
	const n = r.items,
		i = n.length - [...n].reverse().findIndex((e) => e._zod.optin !== "optional")
	t._zod.parse = (e, o) => {
		const a = e.value
		if (!Array.isArray(a)) return e.issues.push({ input: a, inst: t, expected: "tuple", code: "invalid_type" }), e
		e.value = []
		const c = []
		if (!r.rest) {
			const h = a.length > n.length,
				g = a.length < i - 1
			if (h || g)
				return (
					e.issues.push({
						input: a,
						inst: t,
						origin: "array",
						...(h ? { code: "too_big", maximum: n.length } : { code: "too_small", minimum: n.length }),
					}),
					e
				)
		}
		let p = -1
		for (const h of n) {
			if ((p++, p >= a.length && p >= i)) continue
			const g = h._zod.run({ value: a[p], issues: [] }, o)
			g instanceof Promise ? c.push(g.then((m) => ar(m, e, p))) : ar(g, e, p)
		}
		if (r.rest) {
			const h = a.slice(n.length)
			for (const g of h) {
				p++
				const m = r.rest._zod.run({ value: g, issues: [] }, o)
				m instanceof Promise ? c.push(m.then(($) => ar($, e, p))) : ar(m, e, p)
			}
		}
		return c.length ? Promise.all(c).then(() => e) : e
	}
})
function ar(t, r, n) {
	t.issues.length && r.issues.push(...Y(n, t.issues)), (r.value[n] = t.value)
}
var ii = u("$ZodRecord", (t, r) => {
		j.init(t, r),
			(t._zod.parse = (n, i) => {
				const e = n.value
				if (!Ue(e)) return n.issues.push({ expected: "record", code: "invalid_type", input: e, inst: t }), n
				const o = []
				if (r.keyType._zod.values) {
					const a = r.keyType._zod.values
					n.value = {}
					for (const p of a)
						if (typeof p == "string" || typeof p == "number" || typeof p == "symbol") {
							const h = r.valueType._zod.run({ value: e[p], issues: [] }, i)
							h instanceof Promise
								? o.push(
										h.then((g) => {
											g.issues.length && n.issues.push(...Y(p, g.issues)), (n.value[p] = g.value)
										}),
									)
								: (h.issues.length && n.issues.push(...Y(p, h.issues)), (n.value[p] = h.value))
						}
					let c
					for (const p in e) a.has(p) || ((c = c ?? []), c.push(p))
					c && c.length > 0 && n.issues.push({ code: "unrecognized_keys", input: e, inst: t, keys: c })
				} else {
					n.value = {}
					for (const a of Reflect.ownKeys(e)) {
						if (a === "__proto__") continue
						const c = r.keyType._zod.run({ value: a, issues: [] }, i)
						if (c instanceof Promise) throw new Error("Async schemas not supported in object keys currently")
						if (c.issues.length) {
							n.issues.push({
								origin: "record",
								code: "invalid_key",
								issues: c.issues.map((h) => re(h, i, F())),
								input: a,
								path: [a],
								inst: t,
							}),
								(n.value[c.value] = c.value)
							continue
						}
						const p = r.valueType._zod.run({ value: e[a], issues: [] }, i)
						p instanceof Promise
							? o.push(
									p.then((h) => {
										h.issues.length && n.issues.push(...Y(a, h.issues)), (n.value[c.value] = h.value)
									}),
								)
							: (p.issues.length && n.issues.push(...Y(a, p.issues)), (n.value[c.value] = p.value))
					}
				}
				return o.length ? Promise.all(o).then(() => n) : n
			})
	}),
	ai = u("$ZodMap", (t, r) => {
		j.init(t, r),
			(t._zod.parse = (n, i) => {
				const e = n.value
				if (!(e instanceof Map)) return n.issues.push({ expected: "map", code: "invalid_type", input: e, inst: t }), n
				const o = []
				n.value = new Map()
				for (const [a, c] of e) {
					const p = r.keyType._zod.run({ value: a, issues: [] }, i),
						h = r.valueType._zod.run({ value: c, issues: [] }, i)
					p instanceof Promise || h instanceof Promise
						? o.push(
								Promise.all([p, h]).then(([g, m]) => {
									As(g, m, n, a, e, t, i)
								}),
							)
						: As(p, h, n, a, e, t, i)
				}
				return o.length ? Promise.all(o).then(() => n) : n
			})
	})
function As(t, r, n, i, e, o, a) {
	t.issues.length &&
		(tt.has(typeof i)
			? n.issues.push(...Y(i, t.issues))
			: n.issues.push({
					origin: "map",
					code: "invalid_key",
					input: e,
					inst: o,
					issues: t.issues.map((c) => re(c, a, F())),
				})),
		r.issues.length &&
			(tt.has(typeof i)
				? n.issues.push(...Y(i, r.issues))
				: n.issues.push({
						origin: "map",
						code: "invalid_element",
						input: e,
						inst: o,
						key: i,
						issues: r.issues.map((c) => re(c, a, F())),
					})),
		n.value.set(t.value, r.value)
}
var si = u("$ZodSet", (t, r) => {
	j.init(t, r),
		(t._zod.parse = (n, i) => {
			const e = n.value
			if (!(e instanceof Set)) return n.issues.push({ input: e, inst: t, expected: "set", code: "invalid_type" }), n
			const o = []
			n.value = new Set()
			for (const a of e) {
				const c = r.valueType._zod.run({ value: a, issues: [] }, i)
				c instanceof Promise ? o.push(c.then((p) => Cs(p, n))) : Cs(c, n)
			}
			return o.length ? Promise.all(o).then(() => n) : n
		})
})
function Cs(t, r) {
	t.issues.length && r.issues.push(...t.issues), r.value.add(t.value)
}
var ci = u("$ZodEnum", (t, r) => {
		j.init(t, r)
		const n = Xe(r.entries)
		;(t._zod.values = new Set(n)),
			(t._zod.pattern = new RegExp(
				`^(${n
					.filter((i) => tt.has(typeof i))
					.map((i) => (typeof i == "string" ? ue(i) : i.toString()))
					.join("|")})$`,
			)),
			(t._zod.parse = (i, e) => {
				const o = i.value
				return t._zod.values.has(o) || i.issues.push({ code: "invalid_value", values: n, input: o, inst: t }), i
			})
	}),
	ui = u("$ZodLiteral", (t, r) => {
		j.init(t, r),
			(t._zod.values = new Set(r.values)),
			(t._zod.pattern = new RegExp(
				`^(${r.values.map((n) => (typeof n == "string" ? ue(n) : n ? n.toString() : String(n))).join("|")})$`,
			)),
			(t._zod.parse = (n, i) => {
				const e = n.value
				return t._zod.values.has(e) || n.issues.push({ code: "invalid_value", values: r.values, input: e, inst: t }), n
			})
	}),
	li = u("$ZodFile", (t, r) => {
		j.init(t, r),
			(t._zod.parse = (n, i) => {
				const e = n.value
				return e instanceof File || n.issues.push({ expected: "file", code: "invalid_type", input: e, inst: t }), n
			})
	}),
	dt = u("$ZodTransform", (t, r) => {
		j.init(t, r),
			(t._zod.parse = (n, i) => {
				const e = r.transform(n.value, n)
				if (i.async) return (e instanceof Promise ? e : Promise.resolve(e)).then((a) => ((n.value = a), n))
				if (e instanceof Promise) throw new se()
				return (n.value = e), n
			})
	}),
	mi = u("$ZodOptional", (t, r) => {
		j.init(t, r),
			(t._zod.optin = "optional"),
			(t._zod.optout = "optional"),
			U(t._zod, "values", () => (r.innerType._zod.values ? new Set([...r.innerType._zod.values, void 0]) : void 0)),
			U(t._zod, "pattern", () => {
				const n = r.innerType._zod.pattern
				return n ? new RegExp(`^(${et(n.source)})?$`) : void 0
			}),
			(t._zod.parse = (n, i) =>
				r.innerType._zod.optin === "optional"
					? r.innerType._zod.run(n, i)
					: n.value === void 0
						? n
						: r.innerType._zod.run(n, i))
	}),
	pi = u("$ZodNullable", (t, r) => {
		j.init(t, r),
			U(t._zod, "optin", () => r.innerType._zod.optin),
			U(t._zod, "optout", () => r.innerType._zod.optout),
			U(t._zod, "pattern", () => {
				const n = r.innerType._zod.pattern
				return n ? new RegExp(`^(${et(n.source)}|null)$`) : void 0
			}),
			U(t._zod, "values", () => (r.innerType._zod.values ? new Set([...r.innerType._zod.values, null]) : void 0)),
			(t._zod.parse = (n, i) => (n.value === null ? n : r.innerType._zod.run(n, i)))
	}),
	di = u("$ZodDefault", (t, r) => {
		j.init(t, r),
			(t._zod.optin = "optional"),
			U(t._zod, "values", () => r.innerType._zod.values),
			(t._zod.parse = (n, i) => {
				if (n.value === void 0) return (n.value = r.defaultValue), n
				const e = r.innerType._zod.run(n, i)
				return e instanceof Promise ? e.then((o) => Ls(o, r)) : Ls(e, r)
			})
	})
function Ls(t, r) {
	return t.value === void 0 && (t.value = r.defaultValue), t
}
var fi = u("$ZodPrefault", (t, r) => {
		j.init(t, r),
			(t._zod.optin = "optional"),
			U(t._zod, "values", () => r.innerType._zod.values),
			(t._zod.parse = (n, i) => (n.value === void 0 && (n.value = r.defaultValue), r.innerType._zod.run(n, i)))
	}),
	gi = u("$ZodNonOptional", (t, r) => {
		j.init(t, r),
			U(t._zod, "values", () => {
				const n = r.innerType._zod.values
				return n ? new Set([...n].filter((i) => i !== void 0)) : void 0
			}),
			(t._zod.parse = (n, i) => {
				const e = r.innerType._zod.run(n, i)
				return e instanceof Promise ? e.then((o) => Ms(o, t)) : Ms(e, t)
			})
	})
function Ms(t, r) {
	return (
		!t.issues.length &&
			t.value === void 0 &&
			t.issues.push({ code: "invalid_type", expected: "nonoptional", input: t.value, inst: r }),
		t
	)
}
var hi = u("$ZodSuccess", (t, r) => {
		j.init(t, r),
			(t._zod.parse = (n, i) => {
				const e = r.innerType._zod.run(n, i)
				return e instanceof Promise
					? e.then((o) => ((n.value = o.issues.length === 0), n))
					: ((n.value = e.issues.length === 0), n)
			})
	}),
	vi = u("$ZodCatch", (t, r) => {
		j.init(t, r),
			(t._zod.optin = "optional"),
			U(t._zod, "optout", () => r.innerType._zod.optout),
			U(t._zod, "values", () => r.innerType._zod.values),
			(t._zod.parse = (n, i) => {
				const e = r.innerType._zod.run(n, i)
				return e instanceof Promise
					? e.then(
							(o) => (
								(n.value = o.value),
								o.issues.length &&
									((n.value = r.catchValue({
										...n,
										error: { issues: o.issues.map((a) => re(a, i, F())) },
										input: n.value,
									})),
									(n.issues = [])),
								n
							),
						)
					: ((n.value = e.value),
						e.issues.length &&
							((n.value = r.catchValue({
								...n,
								error: { issues: e.issues.map((o) => re(o, i, F())) },
								input: n.value,
							})),
							(n.issues = [])),
						n)
			})
	}),
	bi = u("$ZodNaN", (t, r) => {
		j.init(t, r),
			(t._zod.parse = (n, i) => (
				(typeof n.value != "number" || !Number.isNaN(n.value)) &&
					n.issues.push({ input: n.value, inst: t, expected: "nan", code: "invalid_type" }),
				n
			))
	}),
	ft = u("$ZodPipe", (t, r) => {
		j.init(t, r),
			U(t._zod, "values", () => r.in._zod.values),
			U(t._zod, "optin", () => r.in._zod.optin),
			U(t._zod, "optout", () => r.out._zod.optout),
			(t._zod.parse = (n, i) => {
				const e = r.in._zod.run(n, i)
				return e instanceof Promise ? e.then((o) => qs(o, r, i)) : qs(e, r, i)
			})
	})
function qs(t, r, n) {
	return ze(t) ? t : r.out._zod.run({ value: t.value, issues: t.issues }, n)
}
var _i = u("$ZodReadonly", (t, r) => {
	j.init(t, r),
		U(t._zod, "propValues", () => r.innerType._zod.propValues),
		U(t._zod, "values", () => r.innerType._zod.values),
		U(t._zod, "optin", () => r.innerType._zod.optin),
		U(t._zod, "optout", () => r.innerType._zod.optout),
		(t._zod.parse = (n, i) => {
			const e = r.innerType._zod.run(n, i)
			return e instanceof Promise ? e.then(Vs) : Vs(e)
		})
})
function Vs(t) {
	return (t.value = Object.freeze(t.value)), t
}
var yi = u("$ZodTemplateLiteral", (t, r) => {
		j.init(t, r)
		const n = []
		for (const i of r.parts)
			if (i instanceof j) {
				if (!i._zod.pattern)
					throw new Error(`Invalid template literal part, no pattern found: ${[...i._zod.traits].shift()}`)
				const e = i._zod.pattern instanceof RegExp ? i._zod.pattern.source : i._zod.pattern
				if (!e) throw new Error(`Invalid template literal part: ${i._zod.traits}`)
				const o = e.startsWith("^") ? 1 : 0,
					a = e.endsWith("$") ? e.length - 1 : e.length
				n.push(e.slice(o, a))
			} else if (i === null || _n.has(typeof i)) n.push(ue(`${i}`))
			else throw new Error(`Invalid template literal part: ${i}`)
		;(t._zod.pattern = new RegExp(`^${n.join("")}$`)),
			(t._zod.parse = (i, e) =>
				typeof i.value != "string"
					? (i.issues.push({ input: i.value, inst: t, expected: "template_literal", code: "invalid_type" }), i)
					: ((t._zod.pattern.lastIndex = 0),
						t._zod.pattern.test(i.value) ||
							i.issues.push({
								input: i.value,
								inst: t,
								code: "invalid_format",
								format: "template_literal",
								pattern: t._zod.pattern.source,
							}),
						i))
	}),
	$i = u("$ZodPromise", (t, r) => {
		j.init(t, r),
			(t._zod.parse = (n, i) => Promise.resolve(n.value).then((e) => r.innerType._zod.run({ value: e, issues: [] }, i)))
	}),
	xi = u("$ZodLazy", (t, r) => {
		j.init(t, r),
			U(t._zod, "innerType", () => r.getter()),
			U(t._zod, "pattern", () => t._zod.innerType._zod.pattern),
			U(t._zod, "propValues", () => t._zod.innerType._zod.propValues),
			U(t._zod, "optin", () => t._zod.innerType._zod.optin),
			U(t._zod, "optout", () => t._zod.innerType._zod.optout),
			(t._zod.parse = (n, i) => t._zod.innerType._zod.run(n, i))
	}),
	zi = u("$ZodCustom", (t, r) => {
		V.init(t, r),
			j.init(t, r),
			(t._zod.parse = (n, i) => n),
			(t._zod.check = (n) => {
				const i = n.value,
					e = r.fn(i)
				if (e instanceof Promise) return e.then((o) => Fs(o, n, i, t))
				Fs(e, n, i, t)
			})
	})
function Fs(t, r, n, i) {
	if (!t) {
		const e = { code: "custom", input: n, inst: i, path: [...(i._zod.def.path ?? [])], continue: !i._zod.def.abort }
		i._zod.def.params && (e.params = i._zod.def.params), r.issues.push(zn(e))
	}
}
var gt = {}
$e(gt, {
	ar: () => Ws,
	az: () => Gs,
	be: () => Qs,
	ca: () => Xs,
	cs: () => Ys,
	de: () => ec,
	en: () => lr,
	eo: () => tc,
	es: () => rc,
	fa: () => nc,
	fi: () => oc,
	fr: () => ic,
	frCA: () => ac,
	he: () => sc,
	hu: () => cc,
	id: () => uc,
	it: () => lc,
	ja: () => mc,
	kh: () => pc,
	ko: () => dc,
	mk: () => fc,
	ms: () => gc,
	nl: () => hc,
	no: () => vc,
	ota: () => bc,
	pl: () => yc,
	ps: () => _c,
	pt: () => $c,
	ru: () => zc,
	sl: () => kc,
	sv: () => Sc,
	ta: () => wc,
	th: () => Ic,
	tr: () => jc,
	ua: () => Pc,
	ur: () => Tc,
	vi: () => Oc,
	zhCN: () => Nc,
	zhTW: () => Uc,
})
var hl = () => {
	const t = {
		string: { unit: "\u062D\u0631\u0641", verb: "\u0623\u0646 \u064A\u062D\u0648\u064A" },
		file: { unit: "\u0628\u0627\u064A\u062A", verb: "\u0623\u0646 \u064A\u062D\u0648\u064A" },
		array: { unit: "\u0639\u0646\u0635\u0631", verb: "\u0623\u0646 \u064A\u062D\u0648\u064A" },
		set: { unit: "\u0639\u0646\u0635\u0631", verb: "\u0623\u0646 \u064A\u062D\u0648\u064A" },
	}
	function r(e) {
		return t[e] ?? null
	}
	const n = (e) => {
			const o = typeof e
			switch (o) {
				case "number":
					return Number.isNaN(e) ? "NaN" : "number"
				case "object": {
					if (Array.isArray(e)) return "array"
					if (e === null) return "null"
					if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name
				}
			}
			return o
		},
		i = {
			regex: "\u0645\u062F\u062E\u0644",
			email: "\u0628\u0631\u064A\u062F \u0625\u0644\u0643\u062A\u0631\u0648\u0646\u064A",
			url: "\u0631\u0627\u0628\u0637",
			emoji: "\u0625\u064A\u0645\u0648\u062C\u064A",
			uuid: "UUID",
			uuidv4: "UUIDv4",
			uuidv6: "UUIDv6",
			nanoid: "nanoid",
			guid: "GUID",
			cuid: "cuid",
			cuid2: "cuid2",
			ulid: "ULID",
			xid: "XID",
			ksuid: "KSUID",
			datetime: "\u062A\u0627\u0631\u064A\u062E \u0648\u0648\u0642\u062A \u0628\u0645\u0639\u064A\u0627\u0631 ISO",
			date: "\u062A\u0627\u0631\u064A\u062E \u0628\u0645\u0639\u064A\u0627\u0631 ISO",
			time: "\u0648\u0642\u062A \u0628\u0645\u0639\u064A\u0627\u0631 ISO",
			duration: "\u0645\u062F\u0629 \u0628\u0645\u0639\u064A\u0627\u0631 ISO",
			ipv4: "\u0639\u0646\u0648\u0627\u0646 IPv4",
			ipv6: "\u0639\u0646\u0648\u0627\u0646 IPv6",
			cidrv4: "\u0645\u062F\u0649 \u0639\u0646\u0627\u0648\u064A\u0646 \u0628\u0635\u064A\u063A\u0629 IPv4",
			cidrv6: "\u0645\u062F\u0649 \u0639\u0646\u0627\u0648\u064A\u0646 \u0628\u0635\u064A\u063A\u0629 IPv6",
			base64: "\u0646\u064E\u0635 \u0628\u062A\u0631\u0645\u064A\u0632 base64-encoded",
			base64url: "\u0646\u064E\u0635 \u0628\u062A\u0631\u0645\u064A\u0632 base64url-encoded",
			json_string: "\u0646\u064E\u0635 \u0639\u0644\u0649 \u0647\u064A\u0626\u0629 JSON",
			e164: "\u0631\u0642\u0645 \u0647\u0627\u062A\u0641 \u0628\u0645\u0639\u064A\u0627\u0631 E.164",
			jwt: "JWT",
			template_literal: "\u0645\u062F\u062E\u0644",
		}
	return (e) => {
		switch (e.code) {
			case "invalid_type":
				return `\u0645\u062F\u062E\u0644\u0627\u062A \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644\u0629: \u064A\u0641\u062A\u0631\u0636 \u0625\u062F\u062E\u0627\u0644 ${e.expected}\u060C \u0648\u0644\u0643\u0646 \u062A\u0645 \u0625\u062F\u062E\u0627\u0644 ${n(e.input)}`
			case "invalid_value":
				return e.values.length === 1
					? `\u0645\u062F\u062E\u0644\u0627\u062A \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644\u0629: \u064A\u0641\u062A\u0631\u0636 \u0625\u062F\u062E\u0627\u0644 ${_(e.values[0])}`
					: `\u0627\u062E\u062A\u064A\u0627\u0631 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644: \u064A\u062A\u0648\u0642\u0639 \u0627\u0646\u062A\u0642\u0627\u0621 \u0623\u062D\u062F \u0647\u0630\u0647 \u0627\u0644\u062E\u064A\u0627\u0631\u0627\u062A: ${f(e.values, "|")}`
			case "too_big": {
				const o = e.inclusive ? "<=" : "<",
					a = r(e.origin)
				return a
					? ` \u0623\u0643\u0628\u0631 \u0645\u0646 \u0627\u0644\u0644\u0627\u0632\u0645: \u064A\u0641\u062A\u0631\u0636 \u0623\u0646 \u062A\u0643\u0648\u0646 ${e.origin ?? "\u0627\u0644\u0642\u064A\u0645\u0629"} ${o} ${e.maximum.toString()} ${a.unit ?? "\u0639\u0646\u0635\u0631"}`
					: `\u0623\u0643\u0628\u0631 \u0645\u0646 \u0627\u0644\u0644\u0627\u0632\u0645: \u064A\u0641\u062A\u0631\u0636 \u0623\u0646 \u062A\u0643\u0648\u0646 ${e.origin ?? "\u0627\u0644\u0642\u064A\u0645\u0629"} ${o} ${e.maximum.toString()}`
			}
			case "too_small": {
				const o = e.inclusive ? ">=" : ">",
					a = r(e.origin)
				return a
					? `\u0623\u0635\u063A\u0631 \u0645\u0646 \u0627\u0644\u0644\u0627\u0632\u0645: \u064A\u0641\u062A\u0631\u0636 \u0644\u0640 ${e.origin} \u0623\u0646 \u064A\u0643\u0648\u0646 ${o} ${e.minimum.toString()} ${a.unit}`
					: `\u0623\u0635\u063A\u0631 \u0645\u0646 \u0627\u0644\u0644\u0627\u0632\u0645: \u064A\u0641\u062A\u0631\u0636 \u0644\u0640 ${e.origin} \u0623\u0646 \u064A\u0643\u0648\u0646 ${o} ${e.minimum.toString()}`
			}
			case "invalid_format": {
				const o = e
				return o.format === "starts_with"
					? `\u0646\u064E\u0635 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644: \u064A\u062C\u0628 \u0623\u0646 \u064A\u0628\u062F\u0623 \u0628\u0640 "${e.prefix}"`
					: o.format === "ends_with"
						? `\u0646\u064E\u0635 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644: \u064A\u062C\u0628 \u0623\u0646 \u064A\u0646\u062A\u0647\u064A \u0628\u0640 "${o.suffix}"`
						: o.format === "includes"
							? `\u0646\u064E\u0635 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644: \u064A\u062C\u0628 \u0623\u0646 \u064A\u062A\u0636\u0645\u0651\u064E\u0646 "${o.includes}"`
							: o.format === "regex"
								? `\u0646\u064E\u0635 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644: \u064A\u062C\u0628 \u0623\u0646 \u064A\u0637\u0627\u0628\u0642 \u0627\u0644\u0646\u0645\u0637 ${o.pattern}`
								: `${i[o.format] ?? e.format} \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644`
			}
			case "not_multiple_of":
				return `\u0631\u0642\u0645 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644: \u064A\u062C\u0628 \u0623\u0646 \u064A\u0643\u0648\u0646 \u0645\u0646 \u0645\u0636\u0627\u0639\u0641\u0627\u062A ${e.divisor}`
			case "unrecognized_keys":
				return `\u0645\u0639\u0631\u0641${e.keys.length > 1 ? "\u0627\u062A" : ""} \u063A\u0631\u064A\u0628${e.keys.length > 1 ? "\u0629" : ""}: ${f(e.keys, "\u060C ")}`
			case "invalid_key":
				return `\u0645\u0639\u0631\u0641 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644 \u0641\u064A ${e.origin}`
			case "invalid_union":
				return "\u0645\u062F\u062E\u0644 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644"
			case "invalid_element":
				return `\u0645\u062F\u062E\u0644 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644 \u0641\u064A ${e.origin}`
			default:
				return "\u0645\u062F\u062E\u0644 \u063A\u064A\u0631 \u0645\u0642\u0628\u0648\u0644"
		}
	}
}
function Ws() {
	return { localeError: hl() }
}
var vl = () => {
	const t = {
		string: { unit: "simvol", verb: "olmal\u0131d\u0131r" },
		file: { unit: "bayt", verb: "olmal\u0131d\u0131r" },
		array: { unit: "element", verb: "olmal\u0131d\u0131r" },
		set: { unit: "element", verb: "olmal\u0131d\u0131r" },
	}
	function r(e) {
		return t[e] ?? null
	}
	const n = (e) => {
			const o = typeof e
			switch (o) {
				case "number":
					return Number.isNaN(e) ? "NaN" : "number"
				case "object": {
					if (Array.isArray(e)) return "array"
					if (e === null) return "null"
					if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name
				}
			}
			return o
		},
		i = {
			regex: "input",
			email: "email address",
			url: "URL",
			emoji: "emoji",
			uuid: "UUID",
			uuidv4: "UUIDv4",
			uuidv6: "UUIDv6",
			nanoid: "nanoid",
			guid: "GUID",
			cuid: "cuid",
			cuid2: "cuid2",
			ulid: "ULID",
			xid: "XID",
			ksuid: "KSUID",
			datetime: "ISO datetime",
			date: "ISO date",
			time: "ISO time",
			duration: "ISO duration",
			ipv4: "IPv4 address",
			ipv6: "IPv6 address",
			cidrv4: "IPv4 range",
			cidrv6: "IPv6 range",
			base64: "base64-encoded string",
			base64url: "base64url-encoded string",
			json_string: "JSON string",
			e164: "E.164 number",
			jwt: "JWT",
			template_literal: "input",
		}
	return (e) => {
		switch (e.code) {
			case "invalid_type":
				return `Yanl\u0131\u015F d\u0259y\u0259r: g\xF6zl\u0259nil\u0259n ${e.expected}, daxil olan ${n(e.input)}`
			case "invalid_value":
				return e.values.length === 1
					? `Yanl\u0131\u015F d\u0259y\u0259r: g\xF6zl\u0259nil\u0259n ${_(e.values[0])}`
					: `Yanl\u0131\u015F se\xE7im: a\u015Fa\u011F\u0131dak\u0131lardan biri olmal\u0131d\u0131r: ${f(e.values, "|")}`
			case "too_big": {
				const o = e.inclusive ? "<=" : "<",
					a = r(e.origin)
				return a
					? `\xC7ox b\xF6y\xFCk: g\xF6zl\u0259nil\u0259n ${e.origin ?? "d\u0259y\u0259r"} ${o}${e.maximum.toString()} ${a.unit ?? "element"}`
					: `\xC7ox b\xF6y\xFCk: g\xF6zl\u0259nil\u0259n ${e.origin ?? "d\u0259y\u0259r"} ${o}${e.maximum.toString()}`
			}
			case "too_small": {
				const o = e.inclusive ? ">=" : ">",
					a = r(e.origin)
				return a
					? `\xC7ox ki\xE7ik: g\xF6zl\u0259nil\u0259n ${e.origin} ${o}${e.minimum.toString()} ${a.unit}`
					: `\xC7ox ki\xE7ik: g\xF6zl\u0259nil\u0259n ${e.origin} ${o}${e.minimum.toString()}`
			}
			case "invalid_format": {
				const o = e
				return o.format === "starts_with"
					? `Yanl\u0131\u015F m\u0259tn: "${o.prefix}" il\u0259 ba\u015Flamal\u0131d\u0131r`
					: o.format === "ends_with"
						? `Yanl\u0131\u015F m\u0259tn: "${o.suffix}" il\u0259 bitm\u0259lidir`
						: o.format === "includes"
							? `Yanl\u0131\u015F m\u0259tn: "${o.includes}" daxil olmal\u0131d\u0131r`
							: o.format === "regex"
								? `Yanl\u0131\u015F m\u0259tn: ${o.pattern} \u015Fablonuna uy\u011Fun olmal\u0131d\u0131r`
								: `Yanl\u0131\u015F ${i[o.format] ?? e.format}`
			}
			case "not_multiple_of":
				return `Yanl\u0131\u015F \u0259d\u0259d: ${e.divisor} il\u0259 b\xF6l\xFCn\u0259 bil\u0259n olmal\u0131d\u0131r`
			case "unrecognized_keys":
				return `Tan\u0131nmayan a\xE7ar${e.keys.length > 1 ? "lar" : ""}: ${f(e.keys, ", ")}`
			case "invalid_key":
				return `${e.origin} daxilind\u0259 yanl\u0131\u015F a\xE7ar`
			case "invalid_union":
				return "Yanl\u0131\u015F d\u0259y\u0259r"
			case "invalid_element":
				return `${e.origin} daxilind\u0259 yanl\u0131\u015F d\u0259y\u0259r`
			default:
				return "Yanl\u0131\u015F d\u0259y\u0259r"
		}
	}
}
function Gs() {
	return { localeError: vl() }
}
function Ks(t, r, n, i) {
	const e = Math.abs(t),
		o = e % 10,
		a = e % 100
	return a >= 11 && a <= 19 ? i : o === 1 ? r : o >= 2 && o <= 4 ? n : i
}
var bl = () => {
	const t = {
		string: {
			unit: {
				one: "\u0441\u0456\u043C\u0432\u0430\u043B",
				few: "\u0441\u0456\u043C\u0432\u0430\u043B\u044B",
				many: "\u0441\u0456\u043C\u0432\u0430\u043B\u0430\u045E",
			},
			verb: "\u043C\u0435\u0446\u044C",
		},
		array: {
			unit: {
				one: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442",
				few: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442\u044B",
				many: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442\u0430\u045E",
			},
			verb: "\u043C\u0435\u0446\u044C",
		},
		set: {
			unit: {
				one: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442",
				few: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442\u044B",
				many: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442\u0430\u045E",
			},
			verb: "\u043C\u0435\u0446\u044C",
		},
		file: {
			unit: {
				one: "\u0431\u0430\u0439\u0442",
				few: "\u0431\u0430\u0439\u0442\u044B",
				many: "\u0431\u0430\u0439\u0442\u0430\u045E",
			},
			verb: "\u043C\u0435\u0446\u044C",
		},
	}
	function r(e) {
		return t[e] ?? null
	}
	const n = (e) => {
			const o = typeof e
			switch (o) {
				case "number":
					return Number.isNaN(e) ? "NaN" : "\u043B\u0456\u043A"
				case "object": {
					if (Array.isArray(e)) return "\u043C\u0430\u0441\u0456\u045E"
					if (e === null) return "null"
					if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name
				}
			}
			return o
		},
		i = {
			regex: "\u0443\u0432\u043E\u0434",
			email: "email \u0430\u0434\u0440\u0430\u0441",
			url: "URL",
			emoji: "\u044D\u043C\u043E\u0434\u0437\u0456",
			uuid: "UUID",
			uuidv4: "UUIDv4",
			uuidv6: "UUIDv6",
			nanoid: "nanoid",
			guid: "GUID",
			cuid: "cuid",
			cuid2: "cuid2",
			ulid: "ULID",
			xid: "XID",
			ksuid: "KSUID",
			datetime: "ISO \u0434\u0430\u0442\u0430 \u0456 \u0447\u0430\u0441",
			date: "ISO \u0434\u0430\u0442\u0430",
			time: "ISO \u0447\u0430\u0441",
			duration: "ISO \u043F\u0440\u0430\u0446\u044F\u0433\u043B\u0430\u0441\u0446\u044C",
			ipv4: "IPv4 \u0430\u0434\u0440\u0430\u0441",
			ipv6: "IPv6 \u0430\u0434\u0440\u0430\u0441",
			cidrv4: "IPv4 \u0434\u044B\u044F\u043F\u0430\u0437\u043E\u043D",
			cidrv6: "IPv6 \u0434\u044B\u044F\u043F\u0430\u0437\u043E\u043D",
			base64: "\u0440\u0430\u0434\u043E\u043A \u0443 \u0444\u0430\u0440\u043C\u0430\u0446\u0435 base64",
			base64url: "\u0440\u0430\u0434\u043E\u043A \u0443 \u0444\u0430\u0440\u043C\u0430\u0446\u0435 base64url",
			json_string: "JSON \u0440\u0430\u0434\u043E\u043A",
			e164: "\u043D\u0443\u043C\u0430\u0440 E.164",
			jwt: "JWT",
			template_literal: "\u0443\u0432\u043E\u0434",
		}
	return (e) => {
		switch (e.code) {
			case "invalid_type":
				return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u045E\u0432\u043E\u0434: \u0447\u0430\u043A\u0430\u045E\u0441\u044F ${e.expected}, \u0430\u0442\u0440\u044B\u043C\u0430\u043D\u0430 ${n(e.input)}`
			case "invalid_value":
				return e.values.length === 1
					? `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u045E\u0432\u043E\u0434: \u0447\u0430\u043A\u0430\u043B\u0430\u0441\u044F ${_(e.values[0])}`
					: `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u0432\u0430\u0440\u044B\u044F\u043D\u0442: \u0447\u0430\u043A\u0430\u045E\u0441\u044F \u0430\u0434\u0437\u0456\u043D \u0437 ${f(e.values, "|")}`
			case "too_big": {
				const o = e.inclusive ? "<=" : "<",
					a = r(e.origin)
				if (a) {
					const c = Number(e.maximum),
						p = Ks(c, a.unit.one, a.unit.few, a.unit.many)
					return `\u0417\u0430\u043D\u0430\u0434\u0442\u0430 \u0432\u044F\u043B\u0456\u043A\u0456: \u0447\u0430\u043A\u0430\u043B\u0430\u0441\u044F, \u0448\u0442\u043E ${e.origin ?? "\u0437\u043D\u0430\u0447\u044D\u043D\u043D\u0435"} \u043F\u0430\u0432\u0456\u043D\u043D\u0430 ${a.verb} ${o}${e.maximum.toString()} ${p}`
				}
				return `\u0417\u0430\u043D\u0430\u0434\u0442\u0430 \u0432\u044F\u043B\u0456\u043A\u0456: \u0447\u0430\u043A\u0430\u043B\u0430\u0441\u044F, \u0448\u0442\u043E ${e.origin ?? "\u0437\u043D\u0430\u0447\u044D\u043D\u043D\u0435"} \u043F\u0430\u0432\u0456\u043D\u043D\u0430 \u0431\u044B\u0446\u044C ${o}${e.maximum.toString()}`
			}
			case "too_small": {
				const o = e.inclusive ? ">=" : ">",
					a = r(e.origin)
				if (a) {
					const c = Number(e.minimum),
						p = Ks(c, a.unit.one, a.unit.few, a.unit.many)
					return `\u0417\u0430\u043D\u0430\u0434\u0442\u0430 \u043C\u0430\u043B\u044B: \u0447\u0430\u043A\u0430\u043B\u0430\u0441\u044F, \u0448\u0442\u043E ${e.origin} \u043F\u0430\u0432\u0456\u043D\u043D\u0430 ${a.verb} ${o}${e.minimum.toString()} ${p}`
				}
				return `\u0417\u0430\u043D\u0430\u0434\u0442\u0430 \u043C\u0430\u043B\u044B: \u0447\u0430\u043A\u0430\u043B\u0430\u0441\u044F, \u0448\u0442\u043E ${e.origin} \u043F\u0430\u0432\u0456\u043D\u043D\u0430 \u0431\u044B\u0446\u044C ${o}${e.minimum.toString()}`
			}
			case "invalid_format": {
				const o = e
				return o.format === "starts_with"
					? `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u0440\u0430\u0434\u043E\u043A: \u043F\u0430\u0432\u0456\u043D\u0435\u043D \u043F\u0430\u0447\u044B\u043D\u0430\u0446\u0446\u0430 \u0437 "${o.prefix}"`
					: o.format === "ends_with"
						? `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u0440\u0430\u0434\u043E\u043A: \u043F\u0430\u0432\u0456\u043D\u0435\u043D \u0437\u0430\u043A\u0430\u043D\u0447\u0432\u0430\u0446\u0446\u0430 \u043D\u0430 "${o.suffix}"`
						: o.format === "includes"
							? `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u0440\u0430\u0434\u043E\u043A: \u043F\u0430\u0432\u0456\u043D\u0435\u043D \u0437\u043C\u044F\u0448\u0447\u0430\u0446\u044C "${o.includes}"`
							: o.format === "regex"
								? `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u0440\u0430\u0434\u043E\u043A: \u043F\u0430\u0432\u0456\u043D\u0435\u043D \u0430\u0434\u043F\u0430\u0432\u044F\u0434\u0430\u0446\u044C \u0448\u0430\u0431\u043B\u043E\u043D\u0443 ${o.pattern}`
								: `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B ${i[o.format] ?? e.format}`
			}
			case "not_multiple_of":
				return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u043B\u0456\u043A: \u043F\u0430\u0432\u0456\u043D\u0435\u043D \u0431\u044B\u0446\u044C \u043A\u0440\u0430\u0442\u043D\u044B\u043C ${e.divisor}`
			case "unrecognized_keys":
				return `\u041D\u0435\u0440\u0430\u0441\u043F\u0430\u0437\u043D\u0430\u043D\u044B ${e.keys.length > 1 ? "\u043A\u043B\u044E\u0447\u044B" : "\u043A\u043B\u044E\u0447"}: ${f(e.keys, ", ")}`
			case "invalid_key":
				return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u043A\u043B\u044E\u0447 \u0443 ${e.origin}`
			case "invalid_union":
				return "\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u045E\u0432\u043E\u0434"
			case "invalid_element":
				return `\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u0430\u0435 \u0437\u043D\u0430\u0447\u044D\u043D\u043D\u0435 \u045E ${e.origin}`
			default:
				return "\u041D\u044F\u043F\u0440\u0430\u0432\u0456\u043B\u044C\u043D\u044B \u045E\u0432\u043E\u0434"
		}
	}
}
function Qs() {
	return { localeError: bl() }
}
var _l = () => {
	const t = {
		string: { unit: "car\xE0cters", verb: "contenir" },
		file: { unit: "bytes", verb: "contenir" },
		array: { unit: "elements", verb: "contenir" },
		set: { unit: "elements", verb: "contenir" },
	}
	function r(e) {
		return t[e] ?? null
	}
	const n = (e) => {
			const o = typeof e
			switch (o) {
				case "number":
					return Number.isNaN(e) ? "NaN" : "number"
				case "object": {
					if (Array.isArray(e)) return "array"
					if (e === null) return "null"
					if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name
				}
			}
			return o
		},
		i = {
			regex: "entrada",
			email: "adre\xE7a electr\xF2nica",
			url: "URL",
			emoji: "emoji",
			uuid: "UUID",
			uuidv4: "UUIDv4",
			uuidv6: "UUIDv6",
			nanoid: "nanoid",
			guid: "GUID",
			cuid: "cuid",
			cuid2: "cuid2",
			ulid: "ULID",
			xid: "XID",
			ksuid: "KSUID",
			datetime: "data i hora ISO",
			date: "data ISO",
			time: "hora ISO",
			duration: "durada ISO",
			ipv4: "adre\xE7a IPv4",
			ipv6: "adre\xE7a IPv6",
			cidrv4: "rang IPv4",
			cidrv6: "rang IPv6",
			base64: "cadena codificada en base64",
			base64url: "cadena codificada en base64url",
			json_string: "cadena JSON",
			e164: "n\xFAmero E.164",
			jwt: "JWT",
			template_literal: "entrada",
		}
	return (e) => {
		switch (e.code) {
			case "invalid_type":
				return `Tipus inv\xE0lid: s'esperava ${e.expected}, s'ha rebut ${n(e.input)}`
			case "invalid_value":
				return e.values.length === 1
					? `Valor inv\xE0lid: s'esperava ${_(e.values[0])}`
					: `Opci\xF3 inv\xE0lida: s'esperava una de ${f(e.values, " o ")}`
			case "too_big": {
				const o = e.inclusive ? "com a m\xE0xim" : "menys de",
					a = r(e.origin)
				return a
					? `Massa gran: s'esperava que ${e.origin ?? "el valor"} contingu\xE9s ${o} ${e.maximum.toString()} ${a.unit ?? "elements"}`
					: `Massa gran: s'esperava que ${e.origin ?? "el valor"} fos ${o} ${e.maximum.toString()}`
			}
			case "too_small": {
				const o = e.inclusive ? "com a m\xEDnim" : "m\xE9s de",
					a = r(e.origin)
				return a
					? `Massa petit: s'esperava que ${e.origin} contingu\xE9s ${o} ${e.minimum.toString()} ${a.unit}`
					: `Massa petit: s'esperava que ${e.origin} fos ${o} ${e.minimum.toString()}`
			}
			case "invalid_format": {
				const o = e
				return o.format === "starts_with"
					? `Format inv\xE0lid: ha de comen\xE7ar amb "${o.prefix}"`
					: o.format === "ends_with"
						? `Format inv\xE0lid: ha d'acabar amb "${o.suffix}"`
						: o.format === "includes"
							? `Format inv\xE0lid: ha d'incloure "${o.includes}"`
							: o.format === "regex"
								? `Format inv\xE0lid: ha de coincidir amb el patr\xF3 ${o.pattern}`
								: `Format inv\xE0lid per a ${i[o.format] ?? e.format}`
			}
			case "not_multiple_of":
				return `N\xFAmero inv\xE0lid: ha de ser m\xFAltiple de ${e.divisor}`
			case "unrecognized_keys":
				return `Clau${e.keys.length > 1 ? "s" : ""} no reconeguda${e.keys.length > 1 ? "s" : ""}: ${f(e.keys, ", ")}`
			case "invalid_key":
				return `Clau inv\xE0lida a ${e.origin}`
			case "invalid_union":
				return "Entrada inv\xE0lida"
			case "invalid_element":
				return `Element inv\xE0lid a ${e.origin}`
			default:
				return "Entrada inv\xE0lida"
		}
	}
}
function Xs() {
	return { localeError: _l() }
}
var yl = () => {
	const t = {
		string: { unit: "znak\u016F", verb: "m\xEDt" },
		file: { unit: "bajt\u016F", verb: "m\xEDt" },
		array: { unit: "prvk\u016F", verb: "m\xEDt" },
		set: { unit: "prvk\u016F", verb: "m\xEDt" },
	}
	function r(e) {
		return t[e] ?? null
	}
	const n = (e) => {
			const o = typeof e
			switch (o) {
				case "number":
					return Number.isNaN(e) ? "NaN" : "\u010D\xEDslo"
				case "string":
					return "\u0159et\u011Bzec"
				case "boolean":
					return "boolean"
				case "bigint":
					return "bigint"
				case "function":
					return "funkce"
				case "symbol":
					return "symbol"
				case "undefined":
					return "undefined"
				case "object": {
					if (Array.isArray(e)) return "pole"
					if (e === null) return "null"
					if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name
				}
			}
			return o
		},
		i = {
			regex: "regul\xE1rn\xED v\xFDraz",
			email: "e-mailov\xE1 adresa",
			url: "URL",
			emoji: "emoji",
			uuid: "UUID",
			uuidv4: "UUIDv4",
			uuidv6: "UUIDv6",
			nanoid: "nanoid",
			guid: "GUID",
			cuid: "cuid",
			cuid2: "cuid2",
			ulid: "ULID",
			xid: "XID",
			ksuid: "KSUID",
			datetime: "datum a \u010Das ve form\xE1tu ISO",
			date: "datum ve form\xE1tu ISO",
			time: "\u010Das ve form\xE1tu ISO",
			duration: "doba trv\xE1n\xED ISO",
			ipv4: "IPv4 adresa",
			ipv6: "IPv6 adresa",
			cidrv4: "rozsah IPv4",
			cidrv6: "rozsah IPv6",
			base64: "\u0159et\u011Bzec zak\xF3dovan\xFD ve form\xE1tu base64",
			base64url: "\u0159et\u011Bzec zak\xF3dovan\xFD ve form\xE1tu base64url",
			json_string: "\u0159et\u011Bzec ve form\xE1tu JSON",
			e164: "\u010D\xEDslo E.164",
			jwt: "JWT",
			template_literal: "vstup",
		}
	return (e) => {
		switch (e.code) {
			case "invalid_type":
				return `Neplatn\xFD vstup: o\u010Dek\xE1v\xE1no ${e.expected}, obdr\u017Eeno ${n(e.input)}`
			case "invalid_value":
				return e.values.length === 1
					? `Neplatn\xFD vstup: o\u010Dek\xE1v\xE1no ${_(e.values[0])}`
					: `Neplatn\xE1 mo\u017Enost: o\u010Dek\xE1v\xE1na jedna z hodnot ${f(e.values, "|")}`
			case "too_big": {
				const o = e.inclusive ? "<=" : "<",
					a = r(e.origin)
				return a
					? `Hodnota je p\u0159\xEDli\u0161 velk\xE1: ${e.origin ?? "hodnota"} mus\xED m\xEDt ${o}${e.maximum.toString()} ${a.unit ?? "prvk\u016F"}`
					: `Hodnota je p\u0159\xEDli\u0161 velk\xE1: ${e.origin ?? "hodnota"} mus\xED b\xFDt ${o}${e.maximum.toString()}`
			}
			case "too_small": {
				const o = e.inclusive ? ">=" : ">",
					a = r(e.origin)
				return a
					? `Hodnota je p\u0159\xEDli\u0161 mal\xE1: ${e.origin ?? "hodnota"} mus\xED m\xEDt ${o}${e.minimum.toString()} ${a.unit ?? "prvk\u016F"}`
					: `Hodnota je p\u0159\xEDli\u0161 mal\xE1: ${e.origin ?? "hodnota"} mus\xED b\xFDt ${o}${e.minimum.toString()}`
			}
			case "invalid_format": {
				const o = e
				return o.format === "starts_with"
					? `Neplatn\xFD \u0159et\u011Bzec: mus\xED za\u010D\xEDnat na "${o.prefix}"`
					: o.format === "ends_with"
						? `Neplatn\xFD \u0159et\u011Bzec: mus\xED kon\u010Dit na "${o.suffix}"`
						: o.format === "includes"
							? `Neplatn\xFD \u0159et\u011Bzec: mus\xED obsahovat "${o.includes}"`
							: o.format === "regex"
								? `Neplatn\xFD \u0159et\u011Bzec: mus\xED odpov\xEDdat vzoru ${o.pattern}`
								: `Neplatn\xFD form\xE1t ${i[o.format] ?? e.format}`
			}
			case "not_multiple_of":
				return `Neplatn\xE9 \u010D\xEDslo: mus\xED b\xFDt n\xE1sobkem ${e.divisor}`
			case "unrecognized_keys":
				return `Nezn\xE1m\xE9 kl\xED\u010De: ${f(e.keys, ", ")}`
			case "invalid_key":
				return `Neplatn\xFD kl\xED\u010D v ${e.origin}`
			case "invalid_union":
				return "Neplatn\xFD vstup"
			case "invalid_element":
				return `Neplatn\xE1 hodnota v ${e.origin}`
			default:
				return "Neplatn\xFD vstup"
		}
	}
}
function Ys() {
	return { localeError: yl() }
}
var $l = () => {
	const t = {
		string: { unit: "Zeichen", verb: "zu haben" },
		file: { unit: "Bytes", verb: "zu haben" },
		array: { unit: "Elemente", verb: "zu haben" },
		set: { unit: "Elemente", verb: "zu haben" },
	}
	function r(e) {
		return t[e] ?? null
	}
	const n = (e) => {
			const o = typeof e
			switch (o) {
				case "number":
					return Number.isNaN(e) ? "NaN" : "Zahl"
				case "object": {
					if (Array.isArray(e)) return "Array"
					if (e === null) return "null"
					if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name
				}
			}
			return o
		},
		i = {
			regex: "Eingabe",
			email: "E-Mail-Adresse",
			url: "URL",
			emoji: "Emoji",
			uuid: "UUID",
			uuidv4: "UUIDv4",
			uuidv6: "UUIDv6",
			nanoid: "nanoid",
			guid: "GUID",
			cuid: "cuid",
			cuid2: "cuid2",
			ulid: "ULID",
			xid: "XID",
			ksuid: "KSUID",
			datetime: "ISO-Datum und -Uhrzeit",
			date: "ISO-Datum",
			time: "ISO-Uhrzeit",
			duration: "ISO-Dauer",
			ipv4: "IPv4-Adresse",
			ipv6: "IPv6-Adresse",
			cidrv4: "IPv4-Bereich",
			cidrv6: "IPv6-Bereich",
			base64: "Base64-codierter String",
			base64url: "Base64-URL-codierter String",
			json_string: "JSON-String",
			e164: "E.164-Nummer",
			jwt: "JWT",
			template_literal: "Eingabe",
		}
	return (e) => {
		switch (e.code) {
			case "invalid_type":
				return `Ung\xFCltige Eingabe: erwartet ${e.expected}, erhalten ${n(e.input)}`
			case "invalid_value":
				return e.values.length === 1
					? `Ung\xFCltige Eingabe: erwartet ${_(e.values[0])}`
					: `Ung\xFCltige Option: erwartet eine von ${f(e.values, "|")}`
			case "too_big": {
				const o = e.inclusive ? "<=" : "<",
					a = r(e.origin)
				return a
					? `Zu gro\xDF: erwartet, dass ${e.origin ?? "Wert"} ${o}${e.maximum.toString()} ${a.unit ?? "Elemente"} hat`
					: `Zu gro\xDF: erwartet, dass ${e.origin ?? "Wert"} ${o}${e.maximum.toString()} ist`
			}
			case "too_small": {
				const o = e.inclusive ? ">=" : ">",
					a = r(e.origin)
				return a
					? `Zu klein: erwartet, dass ${e.origin} ${o}${e.minimum.toString()} ${a.unit} hat`
					: `Zu klein: erwartet, dass ${e.origin} ${o}${e.minimum.toString()} ist`
			}
			case "invalid_format": {
				const o = e
				return o.format === "starts_with"
					? `Ung\xFCltiger String: muss mit "${o.prefix}" beginnen`
					: o.format === "ends_with"
						? `Ung\xFCltiger String: muss mit "${o.suffix}" enden`
						: o.format === "includes"
							? `Ung\xFCltiger String: muss "${o.includes}" enthalten`
							: o.format === "regex"
								? `Ung\xFCltiger String: muss dem Muster ${o.pattern} entsprechen`
								: `Ung\xFCltig: ${i[o.format] ?? e.format}`
			}
			case "not_multiple_of":
				return `Ung\xFCltige Zahl: muss ein Vielfaches von ${e.divisor} sein`
			case "unrecognized_keys":
				return `${e.keys.length > 1 ? "Unbekannte Schl\xFCssel" : "Unbekannter Schl\xFCssel"}: ${f(e.keys, ", ")}`
			case "invalid_key":
				return `Ung\xFCltiger Schl\xFCssel in ${e.origin}`
			case "invalid_union":
				return "Ung\xFCltige Eingabe"
			case "invalid_element":
				return `Ung\xFCltiger Wert in ${e.origin}`
			default:
				return "Ung\xFCltige Eingabe"
		}
	}
}
function ec() {
	return { localeError: $l() }
}
var xl = (t) => {
		const r = typeof t
		switch (r) {
			case "number":
				return Number.isNaN(t) ? "NaN" : "number"
			case "object": {
				if (Array.isArray(t)) return "array"
				if (t === null) return "null"
				if (Object.getPrototypeOf(t) !== Object.prototype && t.constructor) return t.constructor.name
			}
		}
		return r
	},
	zl = () => {
		const t = {
			string: { unit: "characters", verb: "to have" },
			file: { unit: "bytes", verb: "to have" },
			array: { unit: "items", verb: "to have" },
			set: { unit: "items", verb: "to have" },
		}
		function r(i) {
			return t[i] ?? null
		}
		const n = {
			regex: "input",
			email: "email address",
			url: "URL",
			emoji: "emoji",
			uuid: "UUID",
			uuidv4: "UUIDv4",
			uuidv6: "UUIDv6",
			nanoid: "nanoid",
			guid: "GUID",
			cuid: "cuid",
			cuid2: "cuid2",
			ulid: "ULID",
			xid: "XID",
			ksuid: "KSUID",
			datetime: "ISO datetime",
			date: "ISO date",
			time: "ISO time",
			duration: "ISO duration",
			ipv4: "IPv4 address",
			ipv6: "IPv6 address",
			cidrv4: "IPv4 range",
			cidrv6: "IPv6 range",
			base64: "base64-encoded string",
			base64url: "base64url-encoded string",
			json_string: "JSON string",
			e164: "E.164 number",
			jwt: "JWT",
			template_literal: "input",
		}
		return (i) => {
			switch (i.code) {
				case "invalid_type":
					return `Invalid input: expected ${i.expected}, received ${xl(i.input)}`
				case "invalid_value":
					return i.values.length === 1
						? `Invalid input: expected ${_(i.values[0])}`
						: `Invalid option: expected one of ${f(i.values, "|")}`
				case "too_big": {
					const e = i.inclusive ? "<=" : "<",
						o = r(i.origin)
					return o
						? `Too big: expected ${i.origin ?? "value"} to have ${e}${i.maximum.toString()} ${o.unit ?? "elements"}`
						: `Too big: expected ${i.origin ?? "value"} to be ${e}${i.maximum.toString()}`
				}
				case "too_small": {
					const e = i.inclusive ? ">=" : ">",
						o = r(i.origin)
					return o
						? `Too small: expected ${i.origin} to have ${e}${i.minimum.toString()} ${o.unit}`
						: `Too small: expected ${i.origin} to be ${e}${i.minimum.toString()}`
				}
				case "invalid_format": {
					const e = i
					return e.format === "starts_with"
						? `Invalid string: must start with "${e.prefix}"`
						: e.format === "ends_with"
							? `Invalid string: must end with "${e.suffix}"`
							: e.format === "includes"
								? `Invalid string: must include "${e.includes}"`
								: e.format === "regex"
									? `Invalid string: must match pattern ${e.pattern}`
									: `Invalid ${n[e.format] ?? i.format}`
				}
				case "not_multiple_of":
					return `Invalid number: must be a multiple of ${i.divisor}`
				case "unrecognized_keys":
					return `Unrecognized key${i.keys.length > 1 ? "s" : ""}: ${f(i.keys, ", ")}`
				case "invalid_key":
					return `Invalid key in ${i.origin}`
				case "invalid_union":
					return "Invalid input"
				case "invalid_element":
					return `Invalid value in ${i.origin}`
				default:
					return "Invalid input"
			}
		}
	}
function lr() {
	return { localeError: zl() }
}
var kl = (t) => {
		const r = typeof t
		switch (r) {
			case "number":
				return Number.isNaN(t) ? "NaN" : "nombro"
			case "object": {
				if (Array.isArray(t)) return "tabelo"
				if (t === null) return "senvalora"
				if (Object.getPrototypeOf(t) !== Object.prototype && t.constructor) return t.constructor.name
			}
		}
		return r
	},
	Sl = () => {
		const t = {
			string: { unit: "karaktrojn", verb: "havi" },
			file: { unit: "bajtojn", verb: "havi" },
			array: { unit: "elementojn", verb: "havi" },
			set: { unit: "elementojn", verb: "havi" },
		}
		function r(i) {
			return t[i] ?? null
		}
		const n = {
			regex: "enigo",
			email: "retadreso",
			url: "URL",
			emoji: "emo\u011Dio",
			uuid: "UUID",
			uuidv4: "UUIDv4",
			uuidv6: "UUIDv6",
			nanoid: "nanoid",
			guid: "GUID",
			cuid: "cuid",
			cuid2: "cuid2",
			ulid: "ULID",
			xid: "XID",
			ksuid: "KSUID",
			datetime: "ISO-datotempo",
			date: "ISO-dato",
			time: "ISO-tempo",
			duration: "ISO-da\u016Dro",
			ipv4: "IPv4-adreso",
			ipv6: "IPv6-adreso",
			cidrv4: "IPv4-rango",
			cidrv6: "IPv6-rango",
			base64: "64-ume kodita karaktraro",
			base64url: "URL-64-ume kodita karaktraro",
			json_string: "JSON-karaktraro",
			e164: "E.164-nombro",
			jwt: "JWT",
			template_literal: "enigo",
		}
		return (i) => {
			switch (i.code) {
				case "invalid_type":
					return `Nevalida enigo: atendi\u011Dis ${i.expected}, ricevi\u011Dis ${kl(i.input)}`
				case "invalid_value":
					return i.values.length === 1
						? `Nevalida enigo: atendi\u011Dis ${_(i.values[0])}`
						: `Nevalida opcio: atendi\u011Dis unu el ${f(i.values, "|")}`
				case "too_big": {
					const e = i.inclusive ? "<=" : "<",
						o = r(i.origin)
					return o
						? `Tro granda: atendi\u011Dis ke ${i.origin ?? "valoro"} havu ${e}${i.maximum.toString()} ${o.unit ?? "elementojn"}`
						: `Tro granda: atendi\u011Dis ke ${i.origin ?? "valoro"} havu ${e}${i.maximum.toString()}`
				}
				case "too_small": {
					const e = i.inclusive ? ">=" : ">",
						o = r(i.origin)
					return o
						? `Tro malgranda: atendi\u011Dis ke ${i.origin} havu ${e}${i.minimum.toString()} ${o.unit}`
						: `Tro malgranda: atendi\u011Dis ke ${i.origin} estu ${e}${i.minimum.toString()}`
				}
				case "invalid_format": {
					const e = i
					return e.format === "starts_with"
						? `Nevalida karaktraro: devas komenci\u011Di per "${e.prefix}"`
						: e.format === "ends_with"
							? `Nevalida karaktraro: devas fini\u011Di per "${e.suffix}"`
							: e.format === "includes"
								? `Nevalida karaktraro: devas inkluzivi "${e.includes}"`
								: e.format === "regex"
									? `Nevalida karaktraro: devas kongrui kun la modelo ${e.pattern}`
									: `Nevalida ${n[e.format] ?? i.format}`
				}
				case "not_multiple_of":
					return `Nevalida nombro: devas esti oblo de ${i.divisor}`
				case "unrecognized_keys":
					return `Nekonata${i.keys.length > 1 ? "j" : ""} \u015Dlosilo${i.keys.length > 1 ? "j" : ""}: ${f(i.keys, ", ")}`
				case "invalid_key":
					return `Nevalida \u015Dlosilo en ${i.origin}`
				case "invalid_union":
					return "Nevalida enigo"
				case "invalid_element":
					return `Nevalida valoro en ${i.origin}`
				default:
					return "Nevalida enigo"
			}
		}
	}
function tc() {
	return { localeError: Sl() }
}
var wl = () => {
	const t = {
		string: { unit: "caracteres", verb: "tener" },
		file: { unit: "bytes", verb: "tener" },
		array: { unit: "elementos", verb: "tener" },
		set: { unit: "elementos", verb: "tener" },
	}
	function r(e) {
		return t[e] ?? null
	}
	const n = (e) => {
			const o = typeof e
			switch (o) {
				case "number":
					return Number.isNaN(e) ? "NaN" : "n\xFAmero"
				case "object": {
					if (Array.isArray(e)) return "arreglo"
					if (e === null) return "nulo"
					if (Object.getPrototypeOf(e) !== Object.prototype) return e.constructor.name
				}
			}
			return o
		},
		i = {
			regex: "entrada",
			email: "direcci\xF3n de correo electr\xF3nico",
			url: "URL",
			emoji: "emoji",
			uuid: "UUID",
			uuidv4: "UUIDv4",
			uuidv6: "UUIDv6",
			nanoid: "nanoid",
			guid: "GUID",
			cuid: "cuid",
			cuid2: "cuid2",
			ulid: "ULID",
			xid: "XID",
			ksuid: "KSUID",
			datetime: "fecha y hora ISO",
			date: "fecha ISO",
			time: "hora ISO",
			duration: "duraci\xF3n ISO",
			ipv4: "direcci\xF3n IPv4",
			ipv6: "direcci\xF3n IPv6",
			cidrv4: "rango IPv4",
			cidrv6: "rango IPv6",
			base64: "cadena codificada en base64",
			base64url: "URL codificada en base64",
			json_string: "cadena JSON",
			e164: "n\xFAmero E.164",
			jwt: "JWT",
			template_literal: "entrada",
		}
	return (e) => {
		switch (e.code) {
			case "invalid_type":
				return `Entrada inv\xE1lida: se esperaba ${e.expected}, recibido ${n(e.input)}`
			case "invalid_value":
				return e.values.length === 1
					? `Entrada inv\xE1lida: se esperaba ${_(e.values[0])}`
					: `Opci\xF3n inv\xE1lida: se esperaba una de ${f(e.values, "|")}`
			case "too_big": {
				const o = e.inclusive ? "<=" : "<",
					a = r(e.origin)
				return a
					? `Demasiado grande: se esperaba que ${e.origin ?? "valor"} tuviera ${o}${e.maximum.toString()} ${a.unit ?? "elementos"}`
					: `Demasiado grande: se esperaba que ${e.origin ?? "valor"} fuera ${o}${e.maximum.toString()}`
			}
			case "too_small": {
				const o = e.inclusive ? ">=" : ">",
					a = r(e.origin)
				return a
					? `Demasiado peque\xF1o: se esperaba que ${e.origin} tuviera ${o}${e.minimum.toString()} ${a.unit}`
					: `Demasiado peque\xF1o: se esperaba que ${e.origin} fuera ${o}${e.minimum.toString()}`
			}
			case "invalid_format": {
				const o = e
				return o.format === "starts_with"
					? `Cadena inv\xE1lida: debe comenzar con "${o.prefix}"`
					: o.format === "ends_with"
						? `Cadena inv\xE1lida: debe terminar en "${o.suffix}"`
						: o.format === "includes"
							? `Cadena inv\xE1lida: debe incluir "${o.includes}"`
							: o.format === "regex"
								? `Cadena inv\xE1lida: debe coincidir con el patr\xF3n ${o.pattern}`
								: `Inv\xE1lido ${i[o.format] ?? e.format}`
			}
			case "not_multiple_of":
				return `N\xFAmero inv\xE1lido: debe ser m\xFAltiplo de ${e.divisor}`
			case "unrecognized_keys":
				return `Llave${e.keys.length > 1 ? "s" : ""} desconocida${e.keys.length > 1 ? "s" : ""}: ${f(e.keys, ", ")}`
			case "invalid_key":
				return `Llave inv\xE1lida en ${e.origin}`
			case "invalid_union":
				return "Entrada inv\xE1lida"
			case "invalid_element":
				return `Valor inv\xE1lido en ${e.origin}`
			default:
				return "Entrada inv\xE1lida"
		}
	}
}
function rc() {
	return { localeError: wl() }
}
var Il = () => {
	const t = {
		string: {
			unit: "\u06A9\u0627\u0631\u0627\u06A9\u062A\u0631",
			verb: "\u062F\u0627\u0634\u062A\u0647 \u0628\u0627\u0634\u062F",
		},
		file: { unit: "\u0628\u0627\u06CC\u062A", verb: "\u062F\u0627\u0634\u062A\u0647 \u0628\u0627\u0634\u062F" },
		array: { unit: "\u0622\u06CC\u062A\u0645", verb: "\u062F\u0627\u0634\u062A\u0647 \u0628\u0627\u0634\u062F" },
		set: { unit: "\u0622\u06CC\u062A\u0645", verb: "\u062F\u0627\u0634\u062A\u0647 \u0628\u0627\u0634\u062F" },
	}
	function r(e) {
		return t[e] ?? null
	}
	const n = (e) => {
			const o = typeof e
			switch (o) {
				case "number":
					return Number.isNaN(e) ? "NaN" : "\u0639\u062F\u062F"
				case "object": {
					if (Array.isArray(e)) return "\u0622\u0631\u0627\u06CC\u0647"
					if (e === null) return "null"
					if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name
				}
			}
			return o
		},
		i = {
			regex: "\u0648\u0631\u0648\u062F\u06CC",
			email: "\u0622\u062F\u0631\u0633 \u0627\u06CC\u0645\u06CC\u0644",
			url: "URL",
			emoji: "\u0627\u06CC\u0645\u0648\u062C\u06CC",
			uuid: "UUID",
			uuidv4: "UUIDv4",
			uuidv6: "UUIDv6",
			nanoid: "nanoid",
			guid: "GUID",
			cuid: "cuid",
			cuid2: "cuid2",
			ulid: "ULID",
			xid: "XID",
			ksuid: "KSUID",
			datetime: "\u062A\u0627\u0631\u06CC\u062E \u0648 \u0632\u0645\u0627\u0646 \u0627\u06CC\u0632\u0648",
			date: "\u062A\u0627\u0631\u06CC\u062E \u0627\u06CC\u0632\u0648",
			time: "\u0632\u0645\u0627\u0646 \u0627\u06CC\u0632\u0648",
			duration: "\u0645\u062F\u062A \u0632\u0645\u0627\u0646 \u0627\u06CC\u0632\u0648",
			ipv4: "IPv4 \u0622\u062F\u0631\u0633",
			ipv6: "IPv6 \u0622\u062F\u0631\u0633",
			cidrv4: "IPv4 \u062F\u0627\u0645\u0646\u0647",
			cidrv6: "IPv6 \u062F\u0627\u0645\u0646\u0647",
			base64: "base64-encoded \u0631\u0634\u062A\u0647",
			base64url: "base64url-encoded \u0631\u0634\u062A\u0647",
			json_string: "JSON \u0631\u0634\u062A\u0647",
			e164: "E.164 \u0639\u062F\u062F",
			jwt: "JWT",
			template_literal: "\u0648\u0631\u0648\u062F\u06CC",
		}
	return (e) => {
		switch (e.code) {
			case "invalid_type":
				return `\u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0645\u06CC\u200C\u0628\u0627\u06CC\u0633\u062A ${e.expected} \u0645\u06CC\u200C\u0628\u0648\u062F\u060C ${n(e.input)} \u062F\u0631\u06CC\u0627\u0641\u062A \u0634\u062F`
			case "invalid_value":
				return e.values.length === 1
					? `\u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0645\u06CC\u200C\u0628\u0627\u06CC\u0633\u062A ${_(e.values[0])} \u0645\u06CC\u200C\u0628\u0648\u062F`
					: `\u06AF\u0632\u06CC\u0646\u0647 \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0645\u06CC\u200C\u0628\u0627\u06CC\u0633\u062A \u06CC\u06A9\u06CC \u0627\u0632 ${f(e.values, "|")} \u0645\u06CC\u200C\u0628\u0648\u062F`
			case "too_big": {
				const o = e.inclusive ? "<=" : "<",
					a = r(e.origin)
				return a
					? `\u062E\u06CC\u0644\u06CC \u0628\u0632\u0631\u06AF: ${e.origin ?? "\u0645\u0642\u062F\u0627\u0631"} \u0628\u0627\u06CC\u062F ${o}${e.maximum.toString()} ${a.unit ?? "\u0639\u0646\u0635\u0631"} \u0628\u0627\u0634\u062F`
					: `\u062E\u06CC\u0644\u06CC \u0628\u0632\u0631\u06AF: ${e.origin ?? "\u0645\u0642\u062F\u0627\u0631"} \u0628\u0627\u06CC\u062F ${o}${e.maximum.toString()} \u0628\u0627\u0634\u062F`
			}
			case "too_small": {
				const o = e.inclusive ? ">=" : ">",
					a = r(e.origin)
				return a
					? `\u062E\u06CC\u0644\u06CC \u06A9\u0648\u0686\u06A9: ${e.origin} \u0628\u0627\u06CC\u062F ${o}${e.minimum.toString()} ${a.unit} \u0628\u0627\u0634\u062F`
					: `\u062E\u06CC\u0644\u06CC \u06A9\u0648\u0686\u06A9: ${e.origin} \u0628\u0627\u06CC\u062F ${o}${e.minimum.toString()} \u0628\u0627\u0634\u062F`
			}
			case "invalid_format": {
				const o = e
				return o.format === "starts_with"
					? `\u0631\u0634\u062A\u0647 \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0628\u0627\u06CC\u062F \u0628\u0627 "${o.prefix}" \u0634\u0631\u0648\u0639 \u0634\u0648\u062F`
					: o.format === "ends_with"
						? `\u0631\u0634\u062A\u0647 \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0628\u0627\u06CC\u062F \u0628\u0627 "${o.suffix}" \u062A\u0645\u0627\u0645 \u0634\u0648\u062F`
						: o.format === "includes"
							? `\u0631\u0634\u062A\u0647 \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0628\u0627\u06CC\u062F \u0634\u0627\u0645\u0644 "${o.includes}" \u0628\u0627\u0634\u062F`
							: o.format === "regex"
								? `\u0631\u0634\u062A\u0647 \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0628\u0627\u06CC\u062F \u0628\u0627 \u0627\u0644\u06AF\u0648\u06CC ${o.pattern} \u0645\u0637\u0627\u0628\u0642\u062A \u062F\u0627\u0634\u062A\u0647 \u0628\u0627\u0634\u062F`
								: `${i[o.format] ?? e.format} \u0646\u0627\u0645\u0639\u062A\u0628\u0631`
			}
			case "not_multiple_of":
				return `\u0639\u062F\u062F \u0646\u0627\u0645\u0639\u062A\u0628\u0631: \u0628\u0627\u06CC\u062F \u0645\u0636\u0631\u0628 ${e.divisor} \u0628\u0627\u0634\u062F`
			case "unrecognized_keys":
				return `\u06A9\u0644\u06CC\u062F${e.keys.length > 1 ? "\u0647\u0627\u06CC" : ""} \u0646\u0627\u0634\u0646\u0627\u0633: ${f(e.keys, ", ")}`
			case "invalid_key":
				return `\u06A9\u0644\u06CC\u062F \u0646\u0627\u0634\u0646\u0627\u0633 \u062F\u0631 ${e.origin}`
			case "invalid_union":
				return "\u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631"
			case "invalid_element":
				return `\u0645\u0642\u062F\u0627\u0631 \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u062F\u0631 ${e.origin}`
			default:
				return "\u0648\u0631\u0648\u062F\u06CC \u0646\u0627\u0645\u0639\u062A\u0628\u0631"
		}
	}
}
function nc() {
	return { localeError: Il() }
}
var jl = () => {
	const t = {
		string: { unit: "merkki\xE4", subject: "merkkijonon" },
		file: { unit: "tavua", subject: "tiedoston" },
		array: { unit: "alkiota", subject: "listan" },
		set: { unit: "alkiota", subject: "joukon" },
		number: { unit: "", subject: "luvun" },
		bigint: { unit: "", subject: "suuren kokonaisluvun" },
		int: { unit: "", subject: "kokonaisluvun" },
		date: { unit: "", subject: "p\xE4iv\xE4m\xE4\xE4r\xE4n" },
	}
	function r(e) {
		return t[e] ?? null
	}
	const n = (e) => {
			const o = typeof e
			switch (o) {
				case "number":
					return Number.isNaN(e) ? "NaN" : "number"
				case "object": {
					if (Array.isArray(e)) return "array"
					if (e === null) return "null"
					if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name
				}
			}
			return o
		},
		i = {
			regex: "s\xE4\xE4nn\xF6llinen lauseke",
			email: "s\xE4hk\xF6postiosoite",
			url: "URL-osoite",
			emoji: "emoji",
			uuid: "UUID",
			uuidv4: "UUIDv4",
			uuidv6: "UUIDv6",
			nanoid: "nanoid",
			guid: "GUID",
			cuid: "cuid",
			cuid2: "cuid2",
			ulid: "ULID",
			xid: "XID",
			ksuid: "KSUID",
			datetime: "ISO-aikaleima",
			date: "ISO-p\xE4iv\xE4m\xE4\xE4r\xE4",
			time: "ISO-aika",
			duration: "ISO-kesto",
			ipv4: "IPv4-osoite",
			ipv6: "IPv6-osoite",
			cidrv4: "IPv4-alue",
			cidrv6: "IPv6-alue",
			base64: "base64-koodattu merkkijono",
			base64url: "base64url-koodattu merkkijono",
			json_string: "JSON-merkkijono",
			e164: "E.164-luku",
			jwt: "JWT",
			template_literal: "templaattimerkkijono",
		}
	return (e) => {
		switch (e.code) {
			case "invalid_type":
				return `Virheellinen tyyppi: odotettiin ${e.expected}, oli ${n(e.input)}`
			case "invalid_value":
				return e.values.length === 1
					? `Virheellinen sy\xF6te: t\xE4ytyy olla ${_(e.values[0])}`
					: `Virheellinen valinta: t\xE4ytyy olla yksi seuraavista: ${f(e.values, "|")}`
			case "too_big": {
				const o = e.inclusive ? "<=" : "<",
					a = r(e.origin)
				return a
					? `Liian suuri: ${a.subject} t\xE4ytyy olla ${o}${e.maximum.toString()} ${a.unit}`.trim()
					: `Liian suuri: arvon t\xE4ytyy olla ${o}${e.maximum.toString()}`
			}
			case "too_small": {
				const o = e.inclusive ? ">=" : ">",
					a = r(e.origin)
				return a
					? `Liian pieni: ${a.subject} t\xE4ytyy olla ${o}${e.minimum.toString()} ${a.unit}`.trim()
					: `Liian pieni: arvon t\xE4ytyy olla ${o}${e.minimum.toString()}`
			}
			case "invalid_format": {
				const o = e
				return o.format === "starts_with"
					? `Virheellinen sy\xF6te: t\xE4ytyy alkaa "${o.prefix}"`
					: o.format === "ends_with"
						? `Virheellinen sy\xF6te: t\xE4ytyy loppua "${o.suffix}"`
						: o.format === "includes"
							? `Virheellinen sy\xF6te: t\xE4ytyy sis\xE4lt\xE4\xE4 "${o.includes}"`
							: o.format === "regex"
								? `Virheellinen sy\xF6te: t\xE4ytyy vastata s\xE4\xE4nn\xF6llist\xE4 lauseketta ${o.pattern}`
								: `Virheellinen ${i[o.format] ?? e.format}`
			}
			case "not_multiple_of":
				return `Virheellinen luku: t\xE4ytyy olla luvun ${e.divisor} monikerta`
			case "unrecognized_keys":
				return `${e.keys.length > 1 ? "Tuntemattomat avaimet" : "Tuntematon avain"}: ${f(e.keys, ", ")}`
			case "invalid_key":
				return "Virheellinen avain tietueessa"
			case "invalid_union":
				return "Virheellinen unioni"
			case "invalid_element":
				return "Virheellinen arvo joukossa"
			default:
				return "Virheellinen sy\xF6te"
		}
	}
}
function oc() {
	return { localeError: jl() }
}
var Pl = () => {
	const t = {
		string: { unit: "caract\xE8res", verb: "avoir" },
		file: { unit: "octets", verb: "avoir" },
		array: { unit: "\xE9l\xE9ments", verb: "avoir" },
		set: { unit: "\xE9l\xE9ments", verb: "avoir" },
	}
	function r(e) {
		return t[e] ?? null
	}
	const n = (e) => {
			const o = typeof e
			switch (o) {
				case "number":
					return Number.isNaN(e) ? "NaN" : "nombre"
				case "object": {
					if (Array.isArray(e)) return "tableau"
					if (e === null) return "null"
					if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name
				}
			}
			return o
		},
		i = {
			regex: "entr\xE9e",
			email: "adresse e-mail",
			url: "URL",
			emoji: "emoji",
			uuid: "UUID",
			uuidv4: "UUIDv4",
			uuidv6: "UUIDv6",
			nanoid: "nanoid",
			guid: "GUID",
			cuid: "cuid",
			cuid2: "cuid2",
			ulid: "ULID",
			xid: "XID",
			ksuid: "KSUID",
			datetime: "date et heure ISO",
			date: "date ISO",
			time: "heure ISO",
			duration: "dur\xE9e ISO",
			ipv4: "adresse IPv4",
			ipv6: "adresse IPv6",
			cidrv4: "plage IPv4",
			cidrv6: "plage IPv6",
			base64: "cha\xEEne encod\xE9e en base64",
			base64url: "cha\xEEne encod\xE9e en base64url",
			json_string: "cha\xEEne JSON",
			e164: "num\xE9ro E.164",
			jwt: "JWT",
			template_literal: "entr\xE9e",
		}
	return (e) => {
		switch (e.code) {
			case "invalid_type":
				return `Entr\xE9e invalide : ${e.expected} attendu, ${n(e.input)} re\xE7u`
			case "invalid_value":
				return e.values.length === 1
					? `Entr\xE9e invalide : ${_(e.values[0])} attendu`
					: `Option invalide : une valeur parmi ${f(e.values, "|")} attendue`
			case "too_big": {
				const o = e.inclusive ? "<=" : "<",
					a = r(e.origin)
				return a
					? `Trop grand : ${e.origin ?? "valeur"} doit ${a.verb} ${o}${e.maximum.toString()} ${a.unit ?? "\xE9l\xE9ment(s)"}`
					: `Trop grand : ${e.origin ?? "valeur"} doit \xEAtre ${o}${e.maximum.toString()}`
			}
			case "too_small": {
				const o = e.inclusive ? ">=" : ">",
					a = r(e.origin)
				return a
					? `Trop petit : ${e.origin} doit ${a.verb} ${o}${e.minimum.toString()} ${a.unit}`
					: `Trop petit : ${e.origin} doit \xEAtre ${o}${e.minimum.toString()}`
			}
			case "invalid_format": {
				const o = e
				return o.format === "starts_with"
					? `Cha\xEEne invalide : doit commencer par "${o.prefix}"`
					: o.format === "ends_with"
						? `Cha\xEEne invalide : doit se terminer par "${o.suffix}"`
						: o.format === "includes"
							? `Cha\xEEne invalide : doit inclure "${o.includes}"`
							: o.format === "regex"
								? `Cha\xEEne invalide : doit correspondre au mod\xE8le ${o.pattern}`
								: `${i[o.format] ?? e.format} invalide`
			}
			case "not_multiple_of":
				return `Nombre invalide : doit \xEAtre un multiple de ${e.divisor}`
			case "unrecognized_keys":
				return `Cl\xE9${e.keys.length > 1 ? "s" : ""} non reconnue${e.keys.length > 1 ? "s" : ""} : ${f(e.keys, ", ")}`
			case "invalid_key":
				return `Cl\xE9 invalide dans ${e.origin}`
			case "invalid_union":
				return "Entr\xE9e invalide"
			case "invalid_element":
				return `Valeur invalide dans ${e.origin}`
			default:
				return "Entr\xE9e invalide"
		}
	}
}
function ic() {
	return { localeError: Pl() }
}
var Tl = () => {
	const t = {
		string: { unit: "caract\xE8res", verb: "avoir" },
		file: { unit: "octets", verb: "avoir" },
		array: { unit: "\xE9l\xE9ments", verb: "avoir" },
		set: { unit: "\xE9l\xE9ments", verb: "avoir" },
	}
	function r(e) {
		return t[e] ?? null
	}
	const n = (e) => {
			const o = typeof e
			switch (o) {
				case "number":
					return Number.isNaN(e) ? "NaN" : "number"
				case "object": {
					if (Array.isArray(e)) return "array"
					if (e === null) return "null"
					if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name
				}
			}
			return o
		},
		i = {
			regex: "entr\xE9e",
			email: "adresse courriel",
			url: "URL",
			emoji: "emoji",
			uuid: "UUID",
			uuidv4: "UUIDv4",
			uuidv6: "UUIDv6",
			nanoid: "nanoid",
			guid: "GUID",
			cuid: "cuid",
			cuid2: "cuid2",
			ulid: "ULID",
			xid: "XID",
			ksuid: "KSUID",
			datetime: "date-heure ISO",
			date: "date ISO",
			time: "heure ISO",
			duration: "dur\xE9e ISO",
			ipv4: "adresse IPv4",
			ipv6: "adresse IPv6",
			cidrv4: "plage IPv4",
			cidrv6: "plage IPv6",
			base64: "cha\xEEne encod\xE9e en base64",
			base64url: "cha\xEEne encod\xE9e en base64url",
			json_string: "cha\xEEne JSON",
			e164: "num\xE9ro E.164",
			jwt: "JWT",
			template_literal: "entr\xE9e",
		}
	return (e) => {
		switch (e.code) {
			case "invalid_type":
				return `Entr\xE9e invalide : attendu ${e.expected}, re\xE7u ${n(e.input)}`
			case "invalid_value":
				return e.values.length === 1
					? `Entr\xE9e invalide : attendu ${_(e.values[0])}`
					: `Option invalide : attendu l'une des valeurs suivantes ${f(e.values, "|")}`
			case "too_big": {
				const o = e.inclusive ? "\u2264" : "<",
					a = r(e.origin)
				return a
					? `Trop grand : attendu que ${e.origin ?? "la valeur"} ait ${o}${e.maximum.toString()} ${a.unit}`
					: `Trop grand : attendu que ${e.origin ?? "la valeur"} soit ${o}${e.maximum.toString()}`
			}
			case "too_small": {
				const o = e.inclusive ? "\u2265" : ">",
					a = r(e.origin)
				return a
					? `Trop petit : attendu que ${e.origin} ait ${o}${e.minimum.toString()} ${a.unit}`
					: `Trop petit : attendu que ${e.origin} soit ${o}${e.minimum.toString()}`
			}
			case "invalid_format": {
				const o = e
				return o.format === "starts_with"
					? `Cha\xEEne invalide : doit commencer par "${o.prefix}"`
					: o.format === "ends_with"
						? `Cha\xEEne invalide : doit se terminer par "${o.suffix}"`
						: o.format === "includes"
							? `Cha\xEEne invalide : doit inclure "${o.includes}"`
							: o.format === "regex"
								? `Cha\xEEne invalide : doit correspondre au motif ${o.pattern}`
								: `${i[o.format] ?? e.format} invalide`
			}
			case "not_multiple_of":
				return `Nombre invalide : doit \xEAtre un multiple de ${e.divisor}`
			case "unrecognized_keys":
				return `Cl\xE9${e.keys.length > 1 ? "s" : ""} non reconnue${e.keys.length > 1 ? "s" : ""} : ${f(e.keys, ", ")}`
			case "invalid_key":
				return `Cl\xE9 invalide dans ${e.origin}`
			case "invalid_union":
				return "Entr\xE9e invalide"
			case "invalid_element":
				return `Valeur invalide dans ${e.origin}`
			default:
				return "Entr\xE9e invalide"
		}
	}
}
function ac() {
	return { localeError: Tl() }
}
var Ol = () => {
	const t = {
		string: { unit: "\u05D0\u05D5\u05EA\u05D9\u05D5\u05EA", verb: "\u05DC\u05DB\u05DC\u05D5\u05DC" },
		file: { unit: "\u05D1\u05D9\u05D9\u05D8\u05D9\u05DD", verb: "\u05DC\u05DB\u05DC\u05D5\u05DC" },
		array: { unit: "\u05E4\u05E8\u05D9\u05D8\u05D9\u05DD", verb: "\u05DC\u05DB\u05DC\u05D5\u05DC" },
		set: { unit: "\u05E4\u05E8\u05D9\u05D8\u05D9\u05DD", verb: "\u05DC\u05DB\u05DC\u05D5\u05DC" },
	}
	function r(e) {
		return t[e] ?? null
	}
	const n = (e) => {
			const o = typeof e
			switch (o) {
				case "number":
					return Number.isNaN(e) ? "NaN" : "number"
				case "object": {
					if (Array.isArray(e)) return "array"
					if (e === null) return "null"
					if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name
				}
			}
			return o
		},
		i = {
			regex: "\u05E7\u05DC\u05D8",
			email: "\u05DB\u05EA\u05D5\u05D1\u05EA \u05D0\u05D9\u05DE\u05D9\u05D9\u05DC",
			url: "\u05DB\u05EA\u05D5\u05D1\u05EA \u05E8\u05E9\u05EA",
			emoji: "\u05D0\u05D9\u05DE\u05D5\u05D2'\u05D9",
			uuid: "UUID",
			uuidv4: "UUIDv4",
			uuidv6: "UUIDv6",
			nanoid: "nanoid",
			guid: "GUID",
			cuid: "cuid",
			cuid2: "cuid2",
			ulid: "ULID",
			xid: "XID",
			ksuid: "KSUID",
			datetime: "\u05EA\u05D0\u05E8\u05D9\u05DA \u05D5\u05D6\u05DE\u05DF ISO",
			date: "\u05EA\u05D0\u05E8\u05D9\u05DA ISO",
			time: "\u05D6\u05DE\u05DF ISO",
			duration: "\u05DE\u05E9\u05DA \u05D6\u05DE\u05DF ISO",
			ipv4: "\u05DB\u05EA\u05D5\u05D1\u05EA IPv4",
			ipv6: "\u05DB\u05EA\u05D5\u05D1\u05EA IPv6",
			cidrv4: "\u05D8\u05D5\u05D5\u05D7 IPv4",
			cidrv6: "\u05D8\u05D5\u05D5\u05D7 IPv6",
			base64: "\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA \u05D1\u05D1\u05E1\u05D9\u05E1 64",
			base64url:
				"\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA \u05D1\u05D1\u05E1\u05D9\u05E1 64 \u05DC\u05DB\u05EA\u05D5\u05D1\u05D5\u05EA \u05E8\u05E9\u05EA",
			json_string: "\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA JSON",
			e164: "\u05DE\u05E1\u05E4\u05E8 E.164",
			jwt: "JWT",
			template_literal: "\u05E7\u05DC\u05D8",
		}
	return (e) => {
		switch (e.code) {
			case "invalid_type":
				return `\u05E7\u05DC\u05D8 \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF: \u05E6\u05E8\u05D9\u05DA ${e.expected}, \u05D4\u05EA\u05E7\u05D1\u05DC ${n(e.input)}`
			case "invalid_value":
				return e.values.length === 1
					? `\u05E7\u05DC\u05D8 \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF: \u05E6\u05E8\u05D9\u05DA ${_(e.values[0])}`
					: `\u05E7\u05DC\u05D8 \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF: \u05E6\u05E8\u05D9\u05DA \u05D0\u05D7\u05EA \u05DE\u05D4\u05D0\u05E4\u05E9\u05E8\u05D5\u05D9\u05D5\u05EA  ${f(e.values, "|")}`
			case "too_big": {
				const o = e.inclusive ? "<=" : "<",
					a = r(e.origin)
				return a
					? `\u05D2\u05D3\u05D5\u05DC \u05DE\u05D3\u05D9: ${e.origin ?? "value"} \u05E6\u05E8\u05D9\u05DA \u05DC\u05D4\u05D9\u05D5\u05EA ${o}${e.maximum.toString()} ${a.unit ?? "elements"}`
					: `\u05D2\u05D3\u05D5\u05DC \u05DE\u05D3\u05D9: ${e.origin ?? "value"} \u05E6\u05E8\u05D9\u05DA \u05DC\u05D4\u05D9\u05D5\u05EA ${o}${e.maximum.toString()}`
			}
			case "too_small": {
				const o = e.inclusive ? ">=" : ">",
					a = r(e.origin)
				return a
					? `\u05E7\u05D8\u05DF \u05DE\u05D3\u05D9: ${e.origin} \u05E6\u05E8\u05D9\u05DA \u05DC\u05D4\u05D9\u05D5\u05EA ${o}${e.minimum.toString()} ${a.unit}`
					: `\u05E7\u05D8\u05DF \u05DE\u05D3\u05D9: ${e.origin} \u05E6\u05E8\u05D9\u05DA \u05DC\u05D4\u05D9\u05D5\u05EA ${o}${e.minimum.toString()}`
			}
			case "invalid_format": {
				const o = e
				return o.format === "starts_with"
					? `\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA \u05DC\u05D0 \u05EA\u05E7\u05D9\u05E0\u05D4: \u05D7\u05D9\u05D9\u05D1\u05EA \u05DC\u05D4\u05EA\u05D7\u05D9\u05DC \u05D1"${o.prefix}"`
					: o.format === "ends_with"
						? `\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA \u05DC\u05D0 \u05EA\u05E7\u05D9\u05E0\u05D4: \u05D7\u05D9\u05D9\u05D1\u05EA \u05DC\u05D4\u05E1\u05EA\u05D9\u05D9\u05DD \u05D1 "${o.suffix}"`
						: o.format === "includes"
							? `\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA \u05DC\u05D0 \u05EA\u05E7\u05D9\u05E0\u05D4: \u05D7\u05D9\u05D9\u05D1\u05EA \u05DC\u05DB\u05DC\u05D5\u05DC "${o.includes}"`
							: o.format === "regex"
								? `\u05DE\u05D7\u05E8\u05D5\u05D6\u05EA \u05DC\u05D0 \u05EA\u05E7\u05D9\u05E0\u05D4: \u05D7\u05D9\u05D9\u05D1\u05EA \u05DC\u05D4\u05EA\u05D0\u05D9\u05DD \u05DC\u05EA\u05D1\u05E0\u05D9\u05EA ${o.pattern}`
								: `${i[o.format] ?? e.format} \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF`
			}
			case "not_multiple_of":
				return `\u05DE\u05E1\u05E4\u05E8 \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF: \u05D7\u05D9\u05D9\u05D1 \u05DC\u05D4\u05D9\u05D5\u05EA \u05DE\u05DB\u05E4\u05DC\u05D4 \u05E9\u05DC ${e.divisor}`
			case "unrecognized_keys":
				return `\u05DE\u05E4\u05EA\u05D7${e.keys.length > 1 ? "\u05D5\u05EA" : ""} \u05DC\u05D0 \u05DE\u05D6\u05D5\u05D4${e.keys.length > 1 ? "\u05D9\u05DD" : "\u05D4"}: ${f(e.keys, ", ")}`
			case "invalid_key":
				return `\u05DE\u05E4\u05EA\u05D7 \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF \u05D1${e.origin}`
			case "invalid_union":
				return "\u05E7\u05DC\u05D8 \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF"
			case "invalid_element":
				return `\u05E2\u05E8\u05DA \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF \u05D1${e.origin}`
			default:
				return "\u05E7\u05DC\u05D8 \u05DC\u05D0 \u05EA\u05E7\u05D9\u05DF"
		}
	}
}
function sc() {
	return { localeError: Ol() }
}
var Nl = () => {
	const t = {
		string: { unit: "karakter", verb: "legyen" },
		file: { unit: "byte", verb: "legyen" },
		array: { unit: "elem", verb: "legyen" },
		set: { unit: "elem", verb: "legyen" },
	}
	function r(e) {
		return t[e] ?? null
	}
	const n = (e) => {
			const o = typeof e
			switch (o) {
				case "number":
					return Number.isNaN(e) ? "NaN" : "sz\xE1m"
				case "object": {
					if (Array.isArray(e)) return "t\xF6mb"
					if (e === null) return "null"
					if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name
				}
			}
			return o
		},
		i = {
			regex: "bemenet",
			email: "email c\xEDm",
			url: "URL",
			emoji: "emoji",
			uuid: "UUID",
			uuidv4: "UUIDv4",
			uuidv6: "UUIDv6",
			nanoid: "nanoid",
			guid: "GUID",
			cuid: "cuid",
			cuid2: "cuid2",
			ulid: "ULID",
			xid: "XID",
			ksuid: "KSUID",
			datetime: "ISO id\u0151b\xE9lyeg",
			date: "ISO d\xE1tum",
			time: "ISO id\u0151",
			duration: "ISO id\u0151intervallum",
			ipv4: "IPv4 c\xEDm",
			ipv6: "IPv6 c\xEDm",
			cidrv4: "IPv4 tartom\xE1ny",
			cidrv6: "IPv6 tartom\xE1ny",
			base64: "base64-k\xF3dolt string",
			base64url: "base64url-k\xF3dolt string",
			json_string: "JSON string",
			e164: "E.164 sz\xE1m",
			jwt: "JWT",
			template_literal: "bemenet",
		}
	return (e) => {
		switch (e.code) {
			case "invalid_type":
				return `\xC9rv\xE9nytelen bemenet: a v\xE1rt \xE9rt\xE9k ${e.expected}, a kapott \xE9rt\xE9k ${n(e.input)}`
			case "invalid_value":
				return e.values.length === 1
					? `\xC9rv\xE9nytelen bemenet: a v\xE1rt \xE9rt\xE9k ${_(e.values[0])}`
					: `\xC9rv\xE9nytelen opci\xF3: valamelyik \xE9rt\xE9k v\xE1rt ${f(e.values, "|")}`
			case "too_big": {
				const o = e.inclusive ? "<=" : "<",
					a = r(e.origin)
				return a
					? `T\xFAl nagy: ${e.origin ?? "\xE9rt\xE9k"} m\xE9rete t\xFAl nagy ${o}${e.maximum.toString()} ${a.unit ?? "elem"}`
					: `T\xFAl nagy: a bemeneti \xE9rt\xE9k ${e.origin ?? "\xE9rt\xE9k"} t\xFAl nagy: ${o}${e.maximum.toString()}`
			}
			case "too_small": {
				const o = e.inclusive ? ">=" : ">",
					a = r(e.origin)
				return a
					? `T\xFAl kicsi: a bemeneti \xE9rt\xE9k ${e.origin} m\xE9rete t\xFAl kicsi ${o}${e.minimum.toString()} ${a.unit}`
					: `T\xFAl kicsi: a bemeneti \xE9rt\xE9k ${e.origin} t\xFAl kicsi ${o}${e.minimum.toString()}`
			}
			case "invalid_format": {
				const o = e
				return o.format === "starts_with"
					? `\xC9rv\xE9nytelen string: "${o.prefix}" \xE9rt\xE9kkel kell kezd\u0151dnie`
					: o.format === "ends_with"
						? `\xC9rv\xE9nytelen string: "${o.suffix}" \xE9rt\xE9kkel kell v\xE9gz\u0151dnie`
						: o.format === "includes"
							? `\xC9rv\xE9nytelen string: "${o.includes}" \xE9rt\xE9ket kell tartalmaznia`
							: o.format === "regex"
								? `\xC9rv\xE9nytelen string: ${o.pattern} mint\xE1nak kell megfelelnie`
								: `\xC9rv\xE9nytelen ${i[o.format] ?? e.format}`
			}
			case "not_multiple_of":
				return `\xC9rv\xE9nytelen sz\xE1m: ${e.divisor} t\xF6bbsz\xF6r\xF6s\xE9nek kell lennie`
			case "unrecognized_keys":
				return `Ismeretlen kulcs${e.keys.length > 1 ? "s" : ""}: ${f(e.keys, ", ")}`
			case "invalid_key":
				return `\xC9rv\xE9nytelen kulcs ${e.origin}`
			case "invalid_union":
				return "\xC9rv\xE9nytelen bemenet"
			case "invalid_element":
				return `\xC9rv\xE9nytelen \xE9rt\xE9k: ${e.origin}`
			default:
				return "\xC9rv\xE9nytelen bemenet"
		}
	}
}
function cc() {
	return { localeError: Nl() }
}
var Ul = () => {
	const t = {
		string: { unit: "karakter", verb: "memiliki" },
		file: { unit: "byte", verb: "memiliki" },
		array: { unit: "item", verb: "memiliki" },
		set: { unit: "item", verb: "memiliki" },
	}
	function r(e) {
		return t[e] ?? null
	}
	const n = (e) => {
			const o = typeof e
			switch (o) {
				case "number":
					return Number.isNaN(e) ? "NaN" : "number"
				case "object": {
					if (Array.isArray(e)) return "array"
					if (e === null) return "null"
					if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name
				}
			}
			return o
		},
		i = {
			regex: "input",
			email: "alamat email",
			url: "URL",
			emoji: "emoji",
			uuid: "UUID",
			uuidv4: "UUIDv4",
			uuidv6: "UUIDv6",
			nanoid: "nanoid",
			guid: "GUID",
			cuid: "cuid",
			cuid2: "cuid2",
			ulid: "ULID",
			xid: "XID",
			ksuid: "KSUID",
			datetime: "tanggal dan waktu format ISO",
			date: "tanggal format ISO",
			time: "jam format ISO",
			duration: "durasi format ISO",
			ipv4: "alamat IPv4",
			ipv6: "alamat IPv6",
			cidrv4: "rentang alamat IPv4",
			cidrv6: "rentang alamat IPv6",
			base64: "string dengan enkode base64",
			base64url: "string dengan enkode base64url",
			json_string: "string JSON",
			e164: "angka E.164",
			jwt: "JWT",
			template_literal: "input",
		}
	return (e) => {
		switch (e.code) {
			case "invalid_type":
				return `Input tidak valid: diharapkan ${e.expected}, diterima ${n(e.input)}`
			case "invalid_value":
				return e.values.length === 1
					? `Input tidak valid: diharapkan ${_(e.values[0])}`
					: `Pilihan tidak valid: diharapkan salah satu dari ${f(e.values, "|")}`
			case "too_big": {
				const o = e.inclusive ? "<=" : "<",
					a = r(e.origin)
				return a
					? `Terlalu besar: diharapkan ${e.origin ?? "value"} memiliki ${o}${e.maximum.toString()} ${a.unit ?? "elemen"}`
					: `Terlalu besar: diharapkan ${e.origin ?? "value"} menjadi ${o}${e.maximum.toString()}`
			}
			case "too_small": {
				const o = e.inclusive ? ">=" : ">",
					a = r(e.origin)
				return a
					? `Terlalu kecil: diharapkan ${e.origin} memiliki ${o}${e.minimum.toString()} ${a.unit}`
					: `Terlalu kecil: diharapkan ${e.origin} menjadi ${o}${e.minimum.toString()}`
			}
			case "invalid_format": {
				const o = e
				return o.format === "starts_with"
					? `String tidak valid: harus dimulai dengan "${o.prefix}"`
					: o.format === "ends_with"
						? `String tidak valid: harus berakhir dengan "${o.suffix}"`
						: o.format === "includes"
							? `String tidak valid: harus menyertakan "${o.includes}"`
							: o.format === "regex"
								? `String tidak valid: harus sesuai pola ${o.pattern}`
								: `${i[o.format] ?? e.format} tidak valid`
			}
			case "not_multiple_of":
				return `Angka tidak valid: harus kelipatan dari ${e.divisor}`
			case "unrecognized_keys":
				return `Kunci tidak dikenali ${e.keys.length > 1 ? "s" : ""}: ${f(e.keys, ", ")}`
			case "invalid_key":
				return `Kunci tidak valid di ${e.origin}`
			case "invalid_union":
				return "Input tidak valid"
			case "invalid_element":
				return `Nilai tidak valid di ${e.origin}`
			default:
				return "Input tidak valid"
		}
	}
}
function uc() {
	return { localeError: Ul() }
}
var Zl = () => {
	const t = {
		string: { unit: "caratteri", verb: "avere" },
		file: { unit: "byte", verb: "avere" },
		array: { unit: "elementi", verb: "avere" },
		set: { unit: "elementi", verb: "avere" },
	}
	function r(e) {
		return t[e] ?? null
	}
	const n = (e) => {
			const o = typeof e
			switch (o) {
				case "number":
					return Number.isNaN(e) ? "NaN" : "numero"
				case "object": {
					if (Array.isArray(e)) return "vettore"
					if (e === null) return "null"
					if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name
				}
			}
			return o
		},
		i = {
			regex: "input",
			email: "indirizzo email",
			url: "URL",
			emoji: "emoji",
			uuid: "UUID",
			uuidv4: "UUIDv4",
			uuidv6: "UUIDv6",
			nanoid: "nanoid",
			guid: "GUID",
			cuid: "cuid",
			cuid2: "cuid2",
			ulid: "ULID",
			xid: "XID",
			ksuid: "KSUID",
			datetime: "data e ora ISO",
			date: "data ISO",
			time: "ora ISO",
			duration: "durata ISO",
			ipv4: "indirizzo IPv4",
			ipv6: "indirizzo IPv6",
			cidrv4: "intervallo IPv4",
			cidrv6: "intervallo IPv6",
			base64: "stringa codificata in base64",
			base64url: "URL codificata in base64",
			json_string: "stringa JSON",
			e164: "numero E.164",
			jwt: "JWT",
			template_literal: "input",
		}
	return (e) => {
		switch (e.code) {
			case "invalid_type":
				return `Input non valido: atteso ${e.expected}, ricevuto ${n(e.input)}`
			case "invalid_value":
				return e.values.length === 1
					? `Input non valido: atteso ${_(e.values[0])}`
					: `Opzione non valida: atteso uno tra ${f(e.values, "|")}`
			case "too_big": {
				const o = e.inclusive ? "<=" : "<",
					a = r(e.origin)
				return a
					? `Troppo grande: ${e.origin ?? "valore"} deve avere ${o}${e.maximum.toString()} ${a.unit ?? "elementi"}`
					: `Troppo grande: ${e.origin ?? "valore"} deve essere ${o}${e.maximum.toString()}`
			}
			case "too_small": {
				const o = e.inclusive ? ">=" : ">",
					a = r(e.origin)
				return a
					? `Troppo piccolo: ${e.origin} deve avere ${o}${e.minimum.toString()} ${a.unit}`
					: `Troppo piccolo: ${e.origin} deve essere ${o}${e.minimum.toString()}`
			}
			case "invalid_format": {
				const o = e
				return o.format === "starts_with"
					? `Stringa non valida: deve iniziare con "${o.prefix}"`
					: o.format === "ends_with"
						? `Stringa non valida: deve terminare con "${o.suffix}"`
						: o.format === "includes"
							? `Stringa non valida: deve includere "${o.includes}"`
							: o.format === "regex"
								? `Stringa non valida: deve corrispondere al pattern ${o.pattern}`
								: `Invalid ${i[o.format] ?? e.format}`
			}
			case "not_multiple_of":
				return `Numero non valido: deve essere un multiplo di ${e.divisor}`
			case "unrecognized_keys":
				return `Chiav${e.keys.length > 1 ? "i" : "e"} non riconosciut${e.keys.length > 1 ? "e" : "a"}: ${f(e.keys, ", ")}`
			case "invalid_key":
				return `Chiave non valida in ${e.origin}`
			case "invalid_union":
				return "Input non valido"
			case "invalid_element":
				return `Valore non valido in ${e.origin}`
			default:
				return "Input non valido"
		}
	}
}
function lc() {
	return { localeError: Zl() }
}
var Dl = () => {
	const t = {
		string: { unit: "\u6587\u5B57", verb: "\u3067\u3042\u308B" },
		file: { unit: "\u30D0\u30A4\u30C8", verb: "\u3067\u3042\u308B" },
		array: { unit: "\u8981\u7D20", verb: "\u3067\u3042\u308B" },
		set: { unit: "\u8981\u7D20", verb: "\u3067\u3042\u308B" },
	}
	function r(e) {
		return t[e] ?? null
	}
	const n = (e) => {
			const o = typeof e
			switch (o) {
				case "number":
					return Number.isNaN(e) ? "NaN" : "\u6570\u5024"
				case "object": {
					if (Array.isArray(e)) return "\u914D\u5217"
					if (e === null) return "null"
					if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name
				}
			}
			return o
		},
		i = {
			regex: "\u5165\u529B\u5024",
			email: "\u30E1\u30FC\u30EB\u30A2\u30C9\u30EC\u30B9",
			url: "URL",
			emoji: "\u7D75\u6587\u5B57",
			uuid: "UUID",
			uuidv4: "UUIDv4",
			uuidv6: "UUIDv6",
			nanoid: "nanoid",
			guid: "GUID",
			cuid: "cuid",
			cuid2: "cuid2",
			ulid: "ULID",
			xid: "XID",
			ksuid: "KSUID",
			datetime: "ISO\u65E5\u6642",
			date: "ISO\u65E5\u4ED8",
			time: "ISO\u6642\u523B",
			duration: "ISO\u671F\u9593",
			ipv4: "IPv4\u30A2\u30C9\u30EC\u30B9",
			ipv6: "IPv6\u30A2\u30C9\u30EC\u30B9",
			cidrv4: "IPv4\u7BC4\u56F2",
			cidrv6: "IPv6\u7BC4\u56F2",
			base64: "base64\u30A8\u30F3\u30B3\u30FC\u30C9\u6587\u5B57\u5217",
			base64url: "base64url\u30A8\u30F3\u30B3\u30FC\u30C9\u6587\u5B57\u5217",
			json_string: "JSON\u6587\u5B57\u5217",
			e164: "E.164\u756A\u53F7",
			jwt: "JWT",
			template_literal: "\u5165\u529B\u5024",
		}
	return (e) => {
		switch (e.code) {
			case "invalid_type":
				return `\u7121\u52B9\u306A\u5165\u529B: ${e.expected}\u304C\u671F\u5F85\u3055\u308C\u307E\u3057\u305F\u304C\u3001${n(e.input)}\u304C\u5165\u529B\u3055\u308C\u307E\u3057\u305F`
			case "invalid_value":
				return e.values.length === 1
					? `\u7121\u52B9\u306A\u5165\u529B: ${_(e.values[0])}\u304C\u671F\u5F85\u3055\u308C\u307E\u3057\u305F`
					: `\u7121\u52B9\u306A\u9078\u629E: ${f(e.values, "\u3001")}\u306E\u3044\u305A\u308C\u304B\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`
			case "too_big": {
				const o = e.inclusive ? "\u4EE5\u4E0B\u3067\u3042\u308B" : "\u3088\u308A\u5C0F\u3055\u3044",
					a = r(e.origin)
				return a
					? `\u5927\u304D\u3059\u304E\u308B\u5024: ${e.origin ?? "\u5024"}\u306F${e.maximum.toString()}${a.unit ?? "\u8981\u7D20"}${o}\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`
					: `\u5927\u304D\u3059\u304E\u308B\u5024: ${e.origin ?? "\u5024"}\u306F${e.maximum.toString()}${o}\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`
			}
			case "too_small": {
				const o = e.inclusive ? "\u4EE5\u4E0A\u3067\u3042\u308B" : "\u3088\u308A\u5927\u304D\u3044",
					a = r(e.origin)
				return a
					? `\u5C0F\u3055\u3059\u304E\u308B\u5024: ${e.origin}\u306F${e.minimum.toString()}${a.unit}${o}\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`
					: `\u5C0F\u3055\u3059\u304E\u308B\u5024: ${e.origin}\u306F${e.minimum.toString()}${o}\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`
			}
			case "invalid_format": {
				const o = e
				return o.format === "starts_with"
					? `\u7121\u52B9\u306A\u6587\u5B57\u5217: "${o.prefix}"\u3067\u59CB\u307E\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`
					: o.format === "ends_with"
						? `\u7121\u52B9\u306A\u6587\u5B57\u5217: "${o.suffix}"\u3067\u7D42\u308F\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`
						: o.format === "includes"
							? `\u7121\u52B9\u306A\u6587\u5B57\u5217: "${o.includes}"\u3092\u542B\u3080\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`
							: o.format === "regex"
								? `\u7121\u52B9\u306A\u6587\u5B57\u5217: \u30D1\u30BF\u30FC\u30F3${o.pattern}\u306B\u4E00\u81F4\u3059\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`
								: `\u7121\u52B9\u306A${i[o.format] ?? e.format}`
			}
			case "not_multiple_of":
				return `\u7121\u52B9\u306A\u6570\u5024: ${e.divisor}\u306E\u500D\u6570\u3067\u3042\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059`
			case "unrecognized_keys":
				return `\u8A8D\u8B58\u3055\u308C\u3066\u3044\u306A\u3044\u30AD\u30FC${e.keys.length > 1 ? "\u7FA4" : ""}: ${f(e.keys, "\u3001")}`
			case "invalid_key":
				return `${e.origin}\u5185\u306E\u7121\u52B9\u306A\u30AD\u30FC`
			case "invalid_union":
				return "\u7121\u52B9\u306A\u5165\u529B"
			case "invalid_element":
				return `${e.origin}\u5185\u306E\u7121\u52B9\u306A\u5024`
			default:
				return "\u7121\u52B9\u306A\u5165\u529B"
		}
	}
}
function mc() {
	return { localeError: Dl() }
}
var Rl = () => {
	const t = {
		string: { unit: "\u178F\u17BD\u17A2\u1780\u17D2\u179F\u179A", verb: "\u1782\u17BD\u179A\u1798\u17B6\u1793" },
		file: { unit: "\u1794\u17C3", verb: "\u1782\u17BD\u179A\u1798\u17B6\u1793" },
		array: { unit: "\u1792\u17B6\u178F\u17BB", verb: "\u1782\u17BD\u179A\u1798\u17B6\u1793" },
		set: { unit: "\u1792\u17B6\u178F\u17BB", verb: "\u1782\u17BD\u179A\u1798\u17B6\u1793" },
	}
	function r(e) {
		return t[e] ?? null
	}
	const n = (e) => {
			const o = typeof e
			switch (o) {
				case "number":
					return Number.isNaN(e)
						? "\u1798\u17B7\u1793\u1798\u17C2\u1793\u1787\u17B6\u179B\u17C1\u1781 (NaN)"
						: "\u179B\u17C1\u1781"
				case "object": {
					if (Array.isArray(e)) return "\u17A2\u17B6\u179A\u17C1 (Array)"
					if (e === null) return "\u1782\u17D2\u1798\u17B6\u1793\u178F\u1798\u17D2\u179B\u17C3 (null)"
					if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name
				}
			}
			return o
		},
		i = {
			regex: "\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1794\u1789\u17D2\u1785\u17BC\u179B",
			email: "\u17A2\u17B6\u179F\u1799\u178A\u17D2\u178B\u17B6\u1793\u17A2\u17CA\u17B8\u1798\u17C2\u179B",
			url: "URL",
			emoji: "\u179F\u1789\u17D2\u1789\u17B6\u17A2\u17B6\u179A\u1798\u17D2\u1798\u178E\u17CD",
			uuid: "UUID",
			uuidv4: "UUIDv4",
			uuidv6: "UUIDv6",
			nanoid: "nanoid",
			guid: "GUID",
			cuid: "cuid",
			cuid2: "cuid2",
			ulid: "ULID",
			xid: "XID",
			ksuid: "KSUID",
			datetime:
				"\u1780\u17B6\u179B\u1794\u179A\u17B7\u1785\u17D2\u1786\u17C1\u1791 \u1793\u17B7\u1784\u1798\u17C9\u17C4\u1784 ISO",
			date: "\u1780\u17B6\u179B\u1794\u179A\u17B7\u1785\u17D2\u1786\u17C1\u1791 ISO",
			time: "\u1798\u17C9\u17C4\u1784 ISO",
			duration: "\u179A\u1799\u17C8\u1796\u17C1\u179B ISO",
			ipv4: "\u17A2\u17B6\u179F\u1799\u178A\u17D2\u178B\u17B6\u1793 IPv4",
			ipv6: "\u17A2\u17B6\u179F\u1799\u178A\u17D2\u178B\u17B6\u1793 IPv6",
			cidrv4: "\u178A\u17C2\u1793\u17A2\u17B6\u179F\u1799\u178A\u17D2\u178B\u17B6\u1793 IPv4",
			cidrv6: "\u178A\u17C2\u1793\u17A2\u17B6\u179F\u1799\u178A\u17D2\u178B\u17B6\u1793 IPv6",
			base64: "\u1781\u17D2\u179F\u17C2\u17A2\u1780\u17D2\u179F\u179A\u17A2\u17CA\u17B7\u1780\u17BC\u178A base64",
			base64url: "\u1781\u17D2\u179F\u17C2\u17A2\u1780\u17D2\u179F\u179A\u17A2\u17CA\u17B7\u1780\u17BC\u178A base64url",
			json_string: "\u1781\u17D2\u179F\u17C2\u17A2\u1780\u17D2\u179F\u179A JSON",
			e164: "\u179B\u17C1\u1781 E.164",
			jwt: "JWT",
			template_literal: "\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1794\u1789\u17D2\u1785\u17BC\u179B",
		}
	return (e) => {
		switch (e.code) {
			case "invalid_type":
				return `\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1794\u1789\u17D2\u1785\u17BC\u179B\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A ${e.expected} \u1794\u17C9\u17BB\u1793\u17D2\u178F\u17C2\u1791\u1791\u17BD\u179B\u1794\u17B6\u1793 ${n(e.input)}`
			case "invalid_value":
				return e.values.length === 1
					? `\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1794\u1789\u17D2\u1785\u17BC\u179B\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A ${_(e.values[0])}`
					: `\u1787\u1798\u17D2\u179A\u17BE\u179F\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1787\u17B6\u1798\u17BD\u1799\u1780\u17D2\u1793\u17BB\u1784\u1785\u17C6\u178E\u17C4\u1798 ${f(e.values, "|")}`
			case "too_big": {
				const o = e.inclusive ? "<=" : "<",
					a = r(e.origin)
				return a
					? `\u1792\u17C6\u1796\u17C1\u1780\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A ${e.origin ?? "\u178F\u1798\u17D2\u179B\u17C3"} ${o} ${e.maximum.toString()} ${a.unit ?? "\u1792\u17B6\u178F\u17BB"}`
					: `\u1792\u17C6\u1796\u17C1\u1780\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A ${e.origin ?? "\u178F\u1798\u17D2\u179B\u17C3"} ${o} ${e.maximum.toString()}`
			}
			case "too_small": {
				const o = e.inclusive ? ">=" : ">",
					a = r(e.origin)
				return a
					? `\u178F\u17BC\u1785\u1796\u17C1\u1780\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A ${e.origin} ${o} ${e.minimum.toString()} ${a.unit}`
					: `\u178F\u17BC\u1785\u1796\u17C1\u1780\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1780\u17B6\u179A ${e.origin} ${o} ${e.minimum.toString()}`
			}
			case "invalid_format": {
				const o = e
				return o.format === "starts_with"
					? `\u1781\u17D2\u179F\u17C2\u17A2\u1780\u17D2\u179F\u179A\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1785\u17B6\u1794\u17CB\u1795\u17D2\u178F\u17BE\u1798\u178A\u17C4\u1799 "${o.prefix}"`
					: o.format === "ends_with"
						? `\u1781\u17D2\u179F\u17C2\u17A2\u1780\u17D2\u179F\u179A\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1794\u1789\u17D2\u1785\u1794\u17CB\u178A\u17C4\u1799 "${o.suffix}"`
						: o.format === "includes"
							? `\u1781\u17D2\u179F\u17C2\u17A2\u1780\u17D2\u179F\u179A\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u1798\u17B6\u1793 "${o.includes}"`
							: o.format === "regex"
								? `\u1781\u17D2\u179F\u17C2\u17A2\u1780\u17D2\u179F\u179A\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u178F\u17C2\u1795\u17D2\u1782\u17BC\u1795\u17D2\u1782\u1784\u1793\u17B9\u1784\u1791\u1798\u17D2\u179A\u1784\u17CB\u178A\u17C2\u179B\u1794\u17B6\u1793\u1780\u17C6\u178E\u178F\u17CB ${o.pattern}`
								: `\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 ${i[o.format] ?? e.format}`
			}
			case "not_multiple_of":
				return `\u179B\u17C1\u1781\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u17D6 \u178F\u17D2\u179A\u17BC\u179C\u178F\u17C2\u1787\u17B6\u1796\u17A0\u17BB\u1782\u17BB\u178E\u1793\u17C3 ${e.divisor}`
			case "unrecognized_keys":
				return `\u179A\u1780\u1783\u17BE\u1789\u179F\u17C4\u1798\u17B7\u1793\u179F\u17D2\u1782\u17B6\u179B\u17CB\u17D6 ${f(e.keys, ", ")}`
			case "invalid_key":
				return `\u179F\u17C4\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u1793\u17C5\u1780\u17D2\u1793\u17BB\u1784 ${e.origin}`
			case "invalid_union":
				return "\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C"
			case "invalid_element":
				return `\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C\u1793\u17C5\u1780\u17D2\u1793\u17BB\u1784 ${e.origin}`
			default:
				return "\u1791\u17B7\u1793\u17D2\u1793\u1793\u17D0\u1799\u1798\u17B7\u1793\u178F\u17D2\u179A\u17B9\u1798\u178F\u17D2\u179A\u17BC\u179C"
		}
	}
}
function pc() {
	return { localeError: Rl() }
}
var El = () => {
	const t = {
		string: { unit: "\uBB38\uC790", verb: "to have" },
		file: { unit: "\uBC14\uC774\uD2B8", verb: "to have" },
		array: { unit: "\uAC1C", verb: "to have" },
		set: { unit: "\uAC1C", verb: "to have" },
	}
	function r(e) {
		return t[e] ?? null
	}
	const n = (e) => {
			const o = typeof e
			switch (o) {
				case "number":
					return Number.isNaN(e) ? "NaN" : "number"
				case "object": {
					if (Array.isArray(e)) return "array"
					if (e === null) return "null"
					if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name
				}
			}
			return o
		},
		i = {
			regex: "\uC785\uB825",
			email: "\uC774\uBA54\uC77C \uC8FC\uC18C",
			url: "URL",
			emoji: "\uC774\uBAA8\uC9C0",
			uuid: "UUID",
			uuidv4: "UUIDv4",
			uuidv6: "UUIDv6",
			nanoid: "nanoid",
			guid: "GUID",
			cuid: "cuid",
			cuid2: "cuid2",
			ulid: "ULID",
			xid: "XID",
			ksuid: "KSUID",
			datetime: "ISO \uB0A0\uC9DC\uC2DC\uAC04",
			date: "ISO \uB0A0\uC9DC",
			time: "ISO \uC2DC\uAC04",
			duration: "ISO \uAE30\uAC04",
			ipv4: "IPv4 \uC8FC\uC18C",
			ipv6: "IPv6 \uC8FC\uC18C",
			cidrv4: "IPv4 \uBC94\uC704",
			cidrv6: "IPv6 \uBC94\uC704",
			base64: "base64 \uC778\uCF54\uB529 \uBB38\uC790\uC5F4",
			base64url: "base64url \uC778\uCF54\uB529 \uBB38\uC790\uC5F4",
			json_string: "JSON \uBB38\uC790\uC5F4",
			e164: "E.164 \uBC88\uD638",
			jwt: "JWT",
			template_literal: "\uC785\uB825",
		}
	return (e) => {
		switch (e.code) {
			case "invalid_type":
				return `\uC798\uBABB\uB41C \uC785\uB825: \uC608\uC0C1 \uD0C0\uC785\uC740 ${e.expected}, \uBC1B\uC740 \uD0C0\uC785\uC740 ${n(e.input)}\uC785\uB2C8\uB2E4`
			case "invalid_value":
				return e.values.length === 1
					? `\uC798\uBABB\uB41C \uC785\uB825: \uAC12\uC740 ${_(e.values[0])} \uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4`
					: `\uC798\uBABB\uB41C \uC635\uC158: ${f(e.values, "\uB610\uB294 ")} \uC911 \uD558\uB098\uC5EC\uC57C \uD569\uB2C8\uB2E4`
			case "too_big": {
				const o = e.inclusive ? "\uC774\uD558" : "\uBBF8\uB9CC",
					a = o === "\uBBF8\uB9CC" ? "\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4" : "\uC5EC\uC57C \uD569\uB2C8\uB2E4",
					c = r(e.origin),
					p = c?.unit ?? "\uC694\uC18C"
				return c
					? `${e.origin ?? "\uAC12"}\uC774 \uB108\uBB34 \uD07D\uB2C8\uB2E4: ${e.maximum.toString()}${p} ${o}${a}`
					: `${e.origin ?? "\uAC12"}\uC774 \uB108\uBB34 \uD07D\uB2C8\uB2E4: ${e.maximum.toString()} ${o}${a}`
			}
			case "too_small": {
				const o = e.inclusive ? "\uC774\uC0C1" : "\uCD08\uACFC",
					a = o === "\uC774\uC0C1" ? "\uC774\uC5B4\uC57C \uD569\uB2C8\uB2E4" : "\uC5EC\uC57C \uD569\uB2C8\uB2E4",
					c = r(e.origin),
					p = c?.unit ?? "\uC694\uC18C"
				return c
					? `${e.origin ?? "\uAC12"}\uC774 \uB108\uBB34 \uC791\uC2B5\uB2C8\uB2E4: ${e.minimum.toString()}${p} ${o}${a}`
					: `${e.origin ?? "\uAC12"}\uC774 \uB108\uBB34 \uC791\uC2B5\uB2C8\uB2E4: ${e.minimum.toString()} ${o}${a}`
			}
			case "invalid_format": {
				const o = e
				return o.format === "starts_with"
					? `\uC798\uBABB\uB41C \uBB38\uC790\uC5F4: "${o.prefix}"(\uC73C)\uB85C \uC2DC\uC791\uD574\uC57C \uD569\uB2C8\uB2E4`
					: o.format === "ends_with"
						? `\uC798\uBABB\uB41C \uBB38\uC790\uC5F4: "${o.suffix}"(\uC73C)\uB85C \uB05D\uB098\uC57C \uD569\uB2C8\uB2E4`
						: o.format === "includes"
							? `\uC798\uBABB\uB41C \uBB38\uC790\uC5F4: "${o.includes}"\uC744(\uB97C) \uD3EC\uD568\uD574\uC57C \uD569\uB2C8\uB2E4`
							: o.format === "regex"
								? `\uC798\uBABB\uB41C \uBB38\uC790\uC5F4: \uC815\uADDC\uC2DD ${o.pattern} \uD328\uD134\uACFC \uC77C\uCE58\uD574\uC57C \uD569\uB2C8\uB2E4`
								: `\uC798\uBABB\uB41C ${i[o.format] ?? e.format}`
			}
			case "not_multiple_of":
				return `\uC798\uBABB\uB41C \uC22B\uC790: ${e.divisor}\uC758 \uBC30\uC218\uC5EC\uC57C \uD569\uB2C8\uB2E4`
			case "unrecognized_keys":
				return `\uC778\uC2DD\uD560 \uC218 \uC5C6\uB294 \uD0A4: ${f(e.keys, ", ")}`
			case "invalid_key":
				return `\uC798\uBABB\uB41C \uD0A4: ${e.origin}`
			case "invalid_union":
				return "\uC798\uBABB\uB41C \uC785\uB825"
			case "invalid_element":
				return `\uC798\uBABB\uB41C \uAC12: ${e.origin}`
			default:
				return "\uC798\uBABB\uB41C \uC785\uB825"
		}
	}
}
function dc() {
	return { localeError: El() }
}
var Al = () => {
	const t = {
		string: { unit: "\u0437\u043D\u0430\u0446\u0438", verb: "\u0434\u0430 \u0438\u043C\u0430\u0430\u0442" },
		file: { unit: "\u0431\u0430\u0458\u0442\u0438", verb: "\u0434\u0430 \u0438\u043C\u0430\u0430\u0442" },
		array: { unit: "\u0441\u0442\u0430\u0432\u043A\u0438", verb: "\u0434\u0430 \u0438\u043C\u0430\u0430\u0442" },
		set: { unit: "\u0441\u0442\u0430\u0432\u043A\u0438", verb: "\u0434\u0430 \u0438\u043C\u0430\u0430\u0442" },
	}
	function r(e) {
		return t[e] ?? null
	}
	const n = (e) => {
			const o = typeof e
			switch (o) {
				case "number":
					return Number.isNaN(e) ? "NaN" : "\u0431\u0440\u043E\u0458"
				case "object": {
					if (Array.isArray(e)) return "\u043D\u0438\u0437\u0430"
					if (e === null) return "null"
					if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name
				}
			}
			return o
		},
		i = {
			regex: "\u0432\u043D\u0435\u0441",
			email: "\u0430\u0434\u0440\u0435\u0441\u0430 \u043D\u0430 \u0435-\u043F\u043E\u0448\u0442\u0430",
			url: "URL",
			emoji: "\u0435\u043C\u043E\u045F\u0438",
			uuid: "UUID",
			uuidv4: "UUIDv4",
			uuidv6: "UUIDv6",
			nanoid: "nanoid",
			guid: "GUID",
			cuid: "cuid",
			cuid2: "cuid2",
			ulid: "ULID",
			xid: "XID",
			ksuid: "KSUID",
			datetime: "ISO \u0434\u0430\u0442\u0443\u043C \u0438 \u0432\u0440\u0435\u043C\u0435",
			date: "ISO \u0434\u0430\u0442\u0443\u043C",
			time: "ISO \u0432\u0440\u0435\u043C\u0435",
			duration: "ISO \u0432\u0440\u0435\u043C\u0435\u0442\u0440\u0430\u0435\u045A\u0435",
			ipv4: "IPv4 \u0430\u0434\u0440\u0435\u0441\u0430",
			ipv6: "IPv6 \u0430\u0434\u0440\u0435\u0441\u0430",
			cidrv4: "IPv4 \u043E\u043F\u0441\u0435\u0433",
			cidrv6: "IPv6 \u043E\u043F\u0441\u0435\u0433",
			base64: "base64-\u0435\u043D\u043A\u043E\u0434\u0438\u0440\u0430\u043D\u0430 \u043D\u0438\u0437\u0430",
			base64url: "base64url-\u0435\u043D\u043A\u043E\u0434\u0438\u0440\u0430\u043D\u0430 \u043D\u0438\u0437\u0430",
			json_string: "JSON \u043D\u0438\u0437\u0430",
			e164: "E.164 \u0431\u0440\u043E\u0458",
			jwt: "JWT",
			template_literal: "\u0432\u043D\u0435\u0441",
		}
	return (e) => {
		switch (e.code) {
			case "invalid_type":
				return `\u0413\u0440\u0435\u0448\u0435\u043D \u0432\u043D\u0435\u0441: \u0441\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430 ${e.expected}, \u043F\u0440\u0438\u043C\u0435\u043D\u043E ${n(e.input)}`
			case "invalid_value":
				return e.values.length === 1
					? `Invalid input: expected ${_(e.values[0])}`
					: `\u0413\u0440\u0435\u0448\u0430\u043D\u0430 \u043E\u043F\u0446\u0438\u0458\u0430: \u0441\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430 \u0435\u0434\u043D\u0430 ${f(e.values, "|")}`
			case "too_big": {
				const o = e.inclusive ? "<=" : "<",
					a = r(e.origin)
				return a
					? `\u041F\u0440\u0435\u043C\u043D\u043E\u0433\u0443 \u0433\u043E\u043B\u0435\u043C: \u0441\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430 ${e.origin ?? "\u0432\u0440\u0435\u0434\u043D\u043E\u0441\u0442\u0430"} \u0434\u0430 \u0438\u043C\u0430 ${o}${e.maximum.toString()} ${a.unit ?? "\u0435\u043B\u0435\u043C\u0435\u043D\u0442\u0438"}`
					: `\u041F\u0440\u0435\u043C\u043D\u043E\u0433\u0443 \u0433\u043E\u043B\u0435\u043C: \u0441\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430 ${e.origin ?? "\u0432\u0440\u0435\u0434\u043D\u043E\u0441\u0442\u0430"} \u0434\u0430 \u0431\u0438\u0434\u0435 ${o}${e.maximum.toString()}`
			}
			case "too_small": {
				const o = e.inclusive ? ">=" : ">",
					a = r(e.origin)
				return a
					? `\u041F\u0440\u0435\u043C\u043D\u043E\u0433\u0443 \u043C\u0430\u043B: \u0441\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430 ${e.origin} \u0434\u0430 \u0438\u043C\u0430 ${o}${e.minimum.toString()} ${a.unit}`
					: `\u041F\u0440\u0435\u043C\u043D\u043E\u0433\u0443 \u043C\u0430\u043B: \u0441\u0435 \u043E\u0447\u0435\u043A\u0443\u0432\u0430 ${e.origin} \u0434\u0430 \u0431\u0438\u0434\u0435 ${o}${e.minimum.toString()}`
			}
			case "invalid_format": {
				const o = e
				return o.format === "starts_with"
					? `\u041D\u0435\u0432\u0430\u0436\u0435\u0447\u043A\u0430 \u043D\u0438\u0437\u0430: \u043C\u043E\u0440\u0430 \u0434\u0430 \u0437\u0430\u043F\u043E\u0447\u043D\u0443\u0432\u0430 \u0441\u043E "${o.prefix}"`
					: o.format === "ends_with"
						? `\u041D\u0435\u0432\u0430\u0436\u0435\u0447\u043A\u0430 \u043D\u0438\u0437\u0430: \u043C\u043E\u0440\u0430 \u0434\u0430 \u0437\u0430\u0432\u0440\u0448\u0443\u0432\u0430 \u0441\u043E "${o.suffix}"`
						: o.format === "includes"
							? `\u041D\u0435\u0432\u0430\u0436\u0435\u0447\u043A\u0430 \u043D\u0438\u0437\u0430: \u043C\u043E\u0440\u0430 \u0434\u0430 \u0432\u043A\u043B\u0443\u0447\u0443\u0432\u0430 "${o.includes}"`
							: o.format === "regex"
								? `\u041D\u0435\u0432\u0430\u0436\u0435\u0447\u043A\u0430 \u043D\u0438\u0437\u0430: \u043C\u043E\u0440\u0430 \u0434\u0430 \u043E\u0434\u0433\u043E\u0430\u0440\u0430 \u043D\u0430 \u043F\u0430\u0442\u0435\u0440\u043D\u043E\u0442 ${o.pattern}`
								: `Invalid ${i[o.format] ?? e.format}`
			}
			case "not_multiple_of":
				return `\u0413\u0440\u0435\u0448\u0435\u043D \u0431\u0440\u043E\u0458: \u043C\u043E\u0440\u0430 \u0434\u0430 \u0431\u0438\u0434\u0435 \u0434\u0435\u043B\u0438\u0432 \u0441\u043E ${e.divisor}`
			case "unrecognized_keys":
				return `${e.keys.length > 1 ? "\u041D\u0435\u043F\u0440\u0435\u043F\u043E\u0437\u043D\u0430\u0435\u043D\u0438 \u043A\u043B\u0443\u0447\u0435\u0432\u0438" : "\u041D\u0435\u043F\u0440\u0435\u043F\u043E\u0437\u043D\u0430\u0435\u043D \u043A\u043B\u0443\u0447"}: ${f(e.keys, ", ")}`
			case "invalid_key":
				return `\u0413\u0440\u0435\u0448\u0435\u043D \u043A\u043B\u0443\u0447 \u0432\u043E ${e.origin}`
			case "invalid_union":
				return "\u0413\u0440\u0435\u0448\u0435\u043D \u0432\u043D\u0435\u0441"
			case "invalid_element":
				return `\u0413\u0440\u0435\u0448\u043D\u0430 \u0432\u0440\u0435\u0434\u043D\u043E\u0441\u0442 \u0432\u043E ${e.origin}`
			default:
				return "\u0413\u0440\u0435\u0448\u0435\u043D \u0432\u043D\u0435\u0441"
		}
	}
}
function fc() {
	return { localeError: Al() }
}
var Cl = () => {
	const t = {
		string: { unit: "aksara", verb: "mempunyai" },
		file: { unit: "bait", verb: "mempunyai" },
		array: { unit: "elemen", verb: "mempunyai" },
		set: { unit: "elemen", verb: "mempunyai" },
	}
	function r(e) {
		return t[e] ?? null
	}
	const n = (e) => {
			const o = typeof e
			switch (o) {
				case "number":
					return Number.isNaN(e) ? "NaN" : "nombor"
				case "object": {
					if (Array.isArray(e)) return "array"
					if (e === null) return "null"
					if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name
				}
			}
			return o
		},
		i = {
			regex: "input",
			email: "alamat e-mel",
			url: "URL",
			emoji: "emoji",
			uuid: "UUID",
			uuidv4: "UUIDv4",
			uuidv6: "UUIDv6",
			nanoid: "nanoid",
			guid: "GUID",
			cuid: "cuid",
			cuid2: "cuid2",
			ulid: "ULID",
			xid: "XID",
			ksuid: "KSUID",
			datetime: "tarikh masa ISO",
			date: "tarikh ISO",
			time: "masa ISO",
			duration: "tempoh ISO",
			ipv4: "alamat IPv4",
			ipv6: "alamat IPv6",
			cidrv4: "julat IPv4",
			cidrv6: "julat IPv6",
			base64: "string dikodkan base64",
			base64url: "string dikodkan base64url",
			json_string: "string JSON",
			e164: "nombor E.164",
			jwt: "JWT",
			template_literal: "input",
		}
	return (e) => {
		switch (e.code) {
			case "invalid_type":
				return `Input tidak sah: dijangka ${e.expected}, diterima ${n(e.input)}`
			case "invalid_value":
				return e.values.length === 1
					? `Input tidak sah: dijangka ${_(e.values[0])}`
					: `Pilihan tidak sah: dijangka salah satu daripada ${f(e.values, "|")}`
			case "too_big": {
				const o = e.inclusive ? "<=" : "<",
					a = r(e.origin)
				return a
					? `Terlalu besar: dijangka ${e.origin ?? "nilai"} ${a.verb} ${o}${e.maximum.toString()} ${a.unit ?? "elemen"}`
					: `Terlalu besar: dijangka ${e.origin ?? "nilai"} adalah ${o}${e.maximum.toString()}`
			}
			case "too_small": {
				const o = e.inclusive ? ">=" : ">",
					a = r(e.origin)
				return a
					? `Terlalu kecil: dijangka ${e.origin} ${a.verb} ${o}${e.minimum.toString()} ${a.unit}`
					: `Terlalu kecil: dijangka ${e.origin} adalah ${o}${e.minimum.toString()}`
			}
			case "invalid_format": {
				const o = e
				return o.format === "starts_with"
					? `String tidak sah: mesti bermula dengan "${o.prefix}"`
					: o.format === "ends_with"
						? `String tidak sah: mesti berakhir dengan "${o.suffix}"`
						: o.format === "includes"
							? `String tidak sah: mesti mengandungi "${o.includes}"`
							: o.format === "regex"
								? `String tidak sah: mesti sepadan dengan corak ${o.pattern}`
								: `${i[o.format] ?? e.format} tidak sah`
			}
			case "not_multiple_of":
				return `Nombor tidak sah: perlu gandaan ${e.divisor}`
			case "unrecognized_keys":
				return `Kunci tidak dikenali: ${f(e.keys, ", ")}`
			case "invalid_key":
				return `Kunci tidak sah dalam ${e.origin}`
			case "invalid_union":
				return "Input tidak sah"
			case "invalid_element":
				return `Nilai tidak sah dalam ${e.origin}`
			default:
				return "Input tidak sah"
		}
	}
}
function gc() {
	return { localeError: Cl() }
}
var Ll = () => {
	const t = {
		string: { unit: "tekens" },
		file: { unit: "bytes" },
		array: { unit: "elementen" },
		set: { unit: "elementen" },
	}
	function r(e) {
		return t[e] ?? null
	}
	const n = (e) => {
			const o = typeof e
			switch (o) {
				case "number":
					return Number.isNaN(e) ? "NaN" : "getal"
				case "object": {
					if (Array.isArray(e)) return "array"
					if (e === null) return "null"
					if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name
				}
			}
			return o
		},
		i = {
			regex: "invoer",
			email: "emailadres",
			url: "URL",
			emoji: "emoji",
			uuid: "UUID",
			uuidv4: "UUIDv4",
			uuidv6: "UUIDv6",
			nanoid: "nanoid",
			guid: "GUID",
			cuid: "cuid",
			cuid2: "cuid2",
			ulid: "ULID",
			xid: "XID",
			ksuid: "KSUID",
			datetime: "ISO datum en tijd",
			date: "ISO datum",
			time: "ISO tijd",
			duration: "ISO duur",
			ipv4: "IPv4-adres",
			ipv6: "IPv6-adres",
			cidrv4: "IPv4-bereik",
			cidrv6: "IPv6-bereik",
			base64: "base64-gecodeerde tekst",
			base64url: "base64 URL-gecodeerde tekst",
			json_string: "JSON string",
			e164: "E.164-nummer",
			jwt: "JWT",
			template_literal: "invoer",
		}
	return (e) => {
		switch (e.code) {
			case "invalid_type":
				return `Ongeldige invoer: verwacht ${e.expected}, ontving ${n(e.input)}`
			case "invalid_value":
				return e.values.length === 1
					? `Ongeldige invoer: verwacht ${_(e.values[0])}`
					: `Ongeldige optie: verwacht \xE9\xE9n van ${f(e.values, "|")}`
			case "too_big": {
				const o = e.inclusive ? "<=" : "<",
					a = r(e.origin)
				return a
					? `Te lang: verwacht dat ${e.origin ?? "waarde"} ${o}${e.maximum.toString()} ${a.unit ?? "elementen"} bevat`
					: `Te lang: verwacht dat ${e.origin ?? "waarde"} ${o}${e.maximum.toString()} is`
			}
			case "too_small": {
				const o = e.inclusive ? ">=" : ">",
					a = r(e.origin)
				return a
					? `Te kort: verwacht dat ${e.origin} ${o}${e.minimum.toString()} ${a.unit} bevat`
					: `Te kort: verwacht dat ${e.origin} ${o}${e.minimum.toString()} is`
			}
			case "invalid_format": {
				const o = e
				return o.format === "starts_with"
					? `Ongeldige tekst: moet met "${o.prefix}" beginnen`
					: o.format === "ends_with"
						? `Ongeldige tekst: moet op "${o.suffix}" eindigen`
						: o.format === "includes"
							? `Ongeldige tekst: moet "${o.includes}" bevatten`
							: o.format === "regex"
								? `Ongeldige tekst: moet overeenkomen met patroon ${o.pattern}`
								: `Ongeldig: ${i[o.format] ?? e.format}`
			}
			case "not_multiple_of":
				return `Ongeldig getal: moet een veelvoud van ${e.divisor} zijn`
			case "unrecognized_keys":
				return `Onbekende key${e.keys.length > 1 ? "s" : ""}: ${f(e.keys, ", ")}`
			case "invalid_key":
				return `Ongeldige key in ${e.origin}`
			case "invalid_union":
				return "Ongeldige invoer"
			case "invalid_element":
				return `Ongeldige waarde in ${e.origin}`
			default:
				return "Ongeldige invoer"
		}
	}
}
function hc() {
	return { localeError: Ll() }
}
var Ml = () => {
	const t = {
		string: { unit: "tegn", verb: "\xE5 ha" },
		file: { unit: "bytes", verb: "\xE5 ha" },
		array: { unit: "elementer", verb: "\xE5 inneholde" },
		set: { unit: "elementer", verb: "\xE5 inneholde" },
	}
	function r(e) {
		return t[e] ?? null
	}
	const n = (e) => {
			const o = typeof e
			switch (o) {
				case "number":
					return Number.isNaN(e) ? "NaN" : "tall"
				case "object": {
					if (Array.isArray(e)) return "liste"
					if (e === null) return "null"
					if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name
				}
			}
			return o
		},
		i = {
			regex: "input",
			email: "e-postadresse",
			url: "URL",
			emoji: "emoji",
			uuid: "UUID",
			uuidv4: "UUIDv4",
			uuidv6: "UUIDv6",
			nanoid: "nanoid",
			guid: "GUID",
			cuid: "cuid",
			cuid2: "cuid2",
			ulid: "ULID",
			xid: "XID",
			ksuid: "KSUID",
			datetime: "ISO dato- og klokkeslett",
			date: "ISO-dato",
			time: "ISO-klokkeslett",
			duration: "ISO-varighet",
			ipv4: "IPv4-omr\xE5de",
			ipv6: "IPv6-omr\xE5de",
			cidrv4: "IPv4-spekter",
			cidrv6: "IPv6-spekter",
			base64: "base64-enkodet streng",
			base64url: "base64url-enkodet streng",
			json_string: "JSON-streng",
			e164: "E.164-nummer",
			jwt: "JWT",
			template_literal: "input",
		}
	return (e) => {
		switch (e.code) {
			case "invalid_type":
				return `Ugyldig input: forventet ${e.expected}, fikk ${n(e.input)}`
			case "invalid_value":
				return e.values.length === 1
					? `Ugyldig verdi: forventet ${_(e.values[0])}`
					: `Ugyldig valg: forventet en av ${f(e.values, "|")}`
			case "too_big": {
				const o = e.inclusive ? "<=" : "<",
					a = r(e.origin)
				return a
					? `For stor(t): forventet ${e.origin ?? "value"} til \xE5 ha ${o}${e.maximum.toString()} ${a.unit ?? "elementer"}`
					: `For stor(t): forventet ${e.origin ?? "value"} til \xE5 ha ${o}${e.maximum.toString()}`
			}
			case "too_small": {
				const o = e.inclusive ? ">=" : ">",
					a = r(e.origin)
				return a
					? `For lite(n): forventet ${e.origin} til \xE5 ha ${o}${e.minimum.toString()} ${a.unit}`
					: `For lite(n): forventet ${e.origin} til \xE5 ha ${o}${e.minimum.toString()}`
			}
			case "invalid_format": {
				const o = e
				return o.format === "starts_with"
					? `Ugyldig streng: m\xE5 starte med "${o.prefix}"`
					: o.format === "ends_with"
						? `Ugyldig streng: m\xE5 ende med "${o.suffix}"`
						: o.format === "includes"
							? `Ugyldig streng: m\xE5 inneholde "${o.includes}"`
							: o.format === "regex"
								? `Ugyldig streng: m\xE5 matche m\xF8nsteret ${o.pattern}`
								: `Ugyldig ${i[o.format] ?? e.format}`
			}
			case "not_multiple_of":
				return `Ugyldig tall: m\xE5 v\xE6re et multiplum av ${e.divisor}`
			case "unrecognized_keys":
				return `${e.keys.length > 1 ? "Ukjente n\xF8kler" : "Ukjent n\xF8kkel"}: ${f(e.keys, ", ")}`
			case "invalid_key":
				return `Ugyldig n\xF8kkel i ${e.origin}`
			case "invalid_union":
				return "Ugyldig input"
			case "invalid_element":
				return `Ugyldig verdi i ${e.origin}`
			default:
				return "Ugyldig input"
		}
	}
}
function vc() {
	return { localeError: Ml() }
}
var ql = () => {
	const t = {
		string: { unit: "harf", verb: "olmal\u0131d\u0131r" },
		file: { unit: "bayt", verb: "olmal\u0131d\u0131r" },
		array: { unit: "unsur", verb: "olmal\u0131d\u0131r" },
		set: { unit: "unsur", verb: "olmal\u0131d\u0131r" },
	}
	function r(e) {
		return t[e] ?? null
	}
	const n = (e) => {
			const o = typeof e
			switch (o) {
				case "number":
					return Number.isNaN(e) ? "NaN" : "numara"
				case "object": {
					if (Array.isArray(e)) return "saf"
					if (e === null) return "gayb"
					if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name
				}
			}
			return o
		},
		i = {
			regex: "giren",
			email: "epostag\xE2h",
			url: "URL",
			emoji: "emoji",
			uuid: "UUID",
			uuidv4: "UUIDv4",
			uuidv6: "UUIDv6",
			nanoid: "nanoid",
			guid: "GUID",
			cuid: "cuid",
			cuid2: "cuid2",
			ulid: "ULID",
			xid: "XID",
			ksuid: "KSUID",
			datetime: "ISO heng\xE2m\u0131",
			date: "ISO tarihi",
			time: "ISO zaman\u0131",
			duration: "ISO m\xFCddeti",
			ipv4: "IPv4 ni\u015F\xE2n\u0131",
			ipv6: "IPv6 ni\u015F\xE2n\u0131",
			cidrv4: "IPv4 menzili",
			cidrv6: "IPv6 menzili",
			base64: "base64-\u015Fifreli metin",
			base64url: "base64url-\u015Fifreli metin",
			json_string: "JSON metin",
			e164: "E.164 say\u0131s\u0131",
			jwt: "JWT",
			template_literal: "giren",
		}
	return (e) => {
		switch (e.code) {
			case "invalid_type":
				return `F\xE2sit giren: umulan ${e.expected}, al\u0131nan ${n(e.input)}`
			case "invalid_value":
				return e.values.length === 1
					? `F\xE2sit giren: umulan ${_(e.values[0])}`
					: `F\xE2sit tercih: m\xFBteberler ${f(e.values, "|")}`
			case "too_big": {
				const o = e.inclusive ? "<=" : "<",
					a = r(e.origin)
				return a
					? `Fazla b\xFCy\xFCk: ${e.origin ?? "value"}, ${o}${e.maximum.toString()} ${a.unit ?? "elements"} sahip olmal\u0131yd\u0131.`
					: `Fazla b\xFCy\xFCk: ${e.origin ?? "value"}, ${o}${e.maximum.toString()} olmal\u0131yd\u0131.`
			}
			case "too_small": {
				const o = e.inclusive ? ">=" : ">",
					a = r(e.origin)
				return a
					? `Fazla k\xFC\xE7\xFCk: ${e.origin}, ${o}${e.minimum.toString()} ${a.unit} sahip olmal\u0131yd\u0131.`
					: `Fazla k\xFC\xE7\xFCk: ${e.origin}, ${o}${e.minimum.toString()} olmal\u0131yd\u0131.`
			}
			case "invalid_format": {
				const o = e
				return o.format === "starts_with"
					? `F\xE2sit metin: "${o.prefix}" ile ba\u015Flamal\u0131.`
					: o.format === "ends_with"
						? `F\xE2sit metin: "${o.suffix}" ile bitmeli.`
						: o.format === "includes"
							? `F\xE2sit metin: "${o.includes}" ihtiv\xE2 etmeli.`
							: o.format === "regex"
								? `F\xE2sit metin: ${o.pattern} nak\u015F\u0131na uymal\u0131.`
								: `F\xE2sit ${i[o.format] ?? e.format}`
			}
			case "not_multiple_of":
				return `F\xE2sit say\u0131: ${e.divisor} kat\u0131 olmal\u0131yd\u0131.`
			case "unrecognized_keys":
				return `Tan\u0131nmayan anahtar ${e.keys.length > 1 ? "s" : ""}: ${f(e.keys, ", ")}`
			case "invalid_key":
				return `${e.origin} i\xE7in tan\u0131nmayan anahtar var.`
			case "invalid_union":
				return "Giren tan\u0131namad\u0131."
			case "invalid_element":
				return `${e.origin} i\xE7in tan\u0131nmayan k\u0131ymet var.`
			default:
				return "K\u0131ymet tan\u0131namad\u0131."
		}
	}
}
function bc() {
	return { localeError: ql() }
}
var Vl = () => {
	const t = {
		string: { unit: "\u062A\u0648\u06A9\u064A", verb: "\u0648\u0644\u0631\u064A" },
		file: { unit: "\u0628\u0627\u06CC\u067C\u0633", verb: "\u0648\u0644\u0631\u064A" },
		array: { unit: "\u062A\u0648\u06A9\u064A", verb: "\u0648\u0644\u0631\u064A" },
		set: { unit: "\u062A\u0648\u06A9\u064A", verb: "\u0648\u0644\u0631\u064A" },
	}
	function r(e) {
		return t[e] ?? null
	}
	const n = (e) => {
			const o = typeof e
			switch (o) {
				case "number":
					return Number.isNaN(e) ? "NaN" : "\u0639\u062F\u062F"
				case "object": {
					if (Array.isArray(e)) return "\u0627\u0631\u06D0"
					if (e === null) return "null"
					if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name
				}
			}
			return o
		},
		i = {
			regex: "\u0648\u0631\u0648\u062F\u064A",
			email: "\u0628\u0631\u06CC\u069A\u0646\u0627\u0644\u06CC\u06A9",
			url: "\u06CC\u0648 \u0622\u0631 \u0627\u0644",
			emoji: "\u0627\u06CC\u0645\u0648\u062C\u064A",
			uuid: "UUID",
			uuidv4: "UUIDv4",
			uuidv6: "UUIDv6",
			nanoid: "nanoid",
			guid: "GUID",
			cuid: "cuid",
			cuid2: "cuid2",
			ulid: "ULID",
			xid: "XID",
			ksuid: "KSUID",
			datetime: "\u0646\u06CC\u067C\u0647 \u0627\u0648 \u0648\u062E\u062A",
			date: "\u0646\u06D0\u067C\u0647",
			time: "\u0648\u062E\u062A",
			duration: "\u0645\u0648\u062F\u0647",
			ipv4: "\u062F IPv4 \u067E\u062A\u0647",
			ipv6: "\u062F IPv6 \u067E\u062A\u0647",
			cidrv4: "\u062F IPv4 \u0633\u0627\u062D\u0647",
			cidrv6: "\u062F IPv6 \u0633\u0627\u062D\u0647",
			base64: "base64-encoded \u0645\u062A\u0646",
			base64url: "base64url-encoded \u0645\u062A\u0646",
			json_string: "JSON \u0645\u062A\u0646",
			e164: "\u062F E.164 \u0634\u0645\u06D0\u0631\u0647",
			jwt: "JWT",
			template_literal: "\u0648\u0631\u0648\u062F\u064A",
		}
	return (e) => {
		switch (e.code) {
			case "invalid_type":
				return `\u0646\u0627\u0633\u0645 \u0648\u0631\u0648\u062F\u064A: \u0628\u0627\u06CC\u062F ${e.expected} \u0648\u0627\u06CC, \u0645\u06AB\u0631 ${n(e.input)} \u062A\u0631\u0644\u0627\u0633\u0647 \u0634\u0648`
			case "invalid_value":
				return e.values.length === 1
					? `\u0646\u0627\u0633\u0645 \u0648\u0631\u0648\u062F\u064A: \u0628\u0627\u06CC\u062F ${_(e.values[0])} \u0648\u0627\u06CC`
					: `\u0646\u0627\u0633\u0645 \u0627\u0646\u062A\u062E\u0627\u0628: \u0628\u0627\u06CC\u062F \u06CC\u0648 \u0644\u0647 ${f(e.values, "|")} \u0685\u062E\u0647 \u0648\u0627\u06CC`
			case "too_big": {
				const o = e.inclusive ? "<=" : "<",
					a = r(e.origin)
				return a
					? `\u0689\u06CC\u0631 \u0644\u0648\u06CC: ${e.origin ?? "\u0627\u0631\u0632\u069A\u062A"} \u0628\u0627\u06CC\u062F ${o}${e.maximum.toString()} ${a.unit ?? "\u0639\u0646\u0635\u0631\u0648\u0646\u0647"} \u0648\u0644\u0631\u064A`
					: `\u0689\u06CC\u0631 \u0644\u0648\u06CC: ${e.origin ?? "\u0627\u0631\u0632\u069A\u062A"} \u0628\u0627\u06CC\u062F ${o}${e.maximum.toString()} \u0648\u064A`
			}
			case "too_small": {
				const o = e.inclusive ? ">=" : ">",
					a = r(e.origin)
				return a
					? `\u0689\u06CC\u0631 \u06A9\u0648\u0686\u0646\u06CC: ${e.origin} \u0628\u0627\u06CC\u062F ${o}${e.minimum.toString()} ${a.unit} \u0648\u0644\u0631\u064A`
					: `\u0689\u06CC\u0631 \u06A9\u0648\u0686\u0646\u06CC: ${e.origin} \u0628\u0627\u06CC\u062F ${o}${e.minimum.toString()} \u0648\u064A`
			}
			case "invalid_format": {
				const o = e
				return o.format === "starts_with"
					? `\u0646\u0627\u0633\u0645 \u0645\u062A\u0646: \u0628\u0627\u06CC\u062F \u062F "${o.prefix}" \u0633\u0631\u0647 \u067E\u06CC\u0644 \u0634\u064A`
					: o.format === "ends_with"
						? `\u0646\u0627\u0633\u0645 \u0645\u062A\u0646: \u0628\u0627\u06CC\u062F \u062F "${o.suffix}" \u0633\u0631\u0647 \u067E\u0627\u06CC \u062A\u0647 \u0648\u0631\u0633\u064A\u0696\u064A`
						: o.format === "includes"
							? `\u0646\u0627\u0633\u0645 \u0645\u062A\u0646: \u0628\u0627\u06CC\u062F "${o.includes}" \u0648\u0644\u0631\u064A`
							: o.format === "regex"
								? `\u0646\u0627\u0633\u0645 \u0645\u062A\u0646: \u0628\u0627\u06CC\u062F \u062F ${o.pattern} \u0633\u0631\u0647 \u0645\u0637\u0627\u0628\u0642\u062A \u0648\u0644\u0631\u064A`
								: `${i[o.format] ?? e.format} \u0646\u0627\u0633\u0645 \u062F\u06CC`
			}
			case "not_multiple_of":
				return `\u0646\u0627\u0633\u0645 \u0639\u062F\u062F: \u0628\u0627\u06CC\u062F \u062F ${e.divisor} \u0645\u0636\u0631\u0628 \u0648\u064A`
			case "unrecognized_keys":
				return `\u0646\u0627\u0633\u0645 ${e.keys.length > 1 ? "\u06A9\u0644\u06CC\u0689\u0648\u0646\u0647" : "\u06A9\u0644\u06CC\u0689"}: ${f(e.keys, ", ")}`
			case "invalid_key":
				return `\u0646\u0627\u0633\u0645 \u06A9\u0644\u06CC\u0689 \u067E\u0647 ${e.origin} \u06A9\u06D0`
			case "invalid_union":
				return "\u0646\u0627\u0633\u0645\u0647 \u0648\u0631\u0648\u062F\u064A"
			case "invalid_element":
				return `\u0646\u0627\u0633\u0645 \u0639\u0646\u0635\u0631 \u067E\u0647 ${e.origin} \u06A9\u06D0`
			default:
				return "\u0646\u0627\u0633\u0645\u0647 \u0648\u0631\u0648\u062F\u064A"
		}
	}
}
function _c() {
	return { localeError: Vl() }
}
var Fl = () => {
	const t = {
		string: { unit: "znak\xF3w", verb: "mie\u0107" },
		file: { unit: "bajt\xF3w", verb: "mie\u0107" },
		array: { unit: "element\xF3w", verb: "mie\u0107" },
		set: { unit: "element\xF3w", verb: "mie\u0107" },
	}
	function r(e) {
		return t[e] ?? null
	}
	const n = (e) => {
			const o = typeof e
			switch (o) {
				case "number":
					return Number.isNaN(e) ? "NaN" : "liczba"
				case "object": {
					if (Array.isArray(e)) return "tablica"
					if (e === null) return "null"
					if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name
				}
			}
			return o
		},
		i = {
			regex: "wyra\u017Cenie",
			email: "adres email",
			url: "URL",
			emoji: "emoji",
			uuid: "UUID",
			uuidv4: "UUIDv4",
			uuidv6: "UUIDv6",
			nanoid: "nanoid",
			guid: "GUID",
			cuid: "cuid",
			cuid2: "cuid2",
			ulid: "ULID",
			xid: "XID",
			ksuid: "KSUID",
			datetime: "data i godzina w formacie ISO",
			date: "data w formacie ISO",
			time: "godzina w formacie ISO",
			duration: "czas trwania ISO",
			ipv4: "adres IPv4",
			ipv6: "adres IPv6",
			cidrv4: "zakres IPv4",
			cidrv6: "zakres IPv6",
			base64: "ci\u0105g znak\xF3w zakodowany w formacie base64",
			base64url: "ci\u0105g znak\xF3w zakodowany w formacie base64url",
			json_string: "ci\u0105g znak\xF3w w formacie JSON",
			e164: "liczba E.164",
			jwt: "JWT",
			template_literal: "wej\u015Bcie",
		}
	return (e) => {
		switch (e.code) {
			case "invalid_type":
				return `Nieprawid\u0142owe dane wej\u015Bciowe: oczekiwano ${e.expected}, otrzymano ${n(e.input)}`
			case "invalid_value":
				return e.values.length === 1
					? `Nieprawid\u0142owe dane wej\u015Bciowe: oczekiwano ${_(e.values[0])}`
					: `Nieprawid\u0142owa opcja: oczekiwano jednej z warto\u015Bci ${f(e.values, "|")}`
			case "too_big": {
				const o = e.inclusive ? "<=" : "<",
					a = r(e.origin)
				return a
					? `Za du\u017Ca warto\u015B\u0107: oczekiwano, \u017Ce ${e.origin ?? "warto\u015B\u0107"} b\u0119dzie mie\u0107 ${o}${e.maximum.toString()} ${a.unit ?? "element\xF3w"}`
					: `Zbyt du\u017C(y/a/e): oczekiwano, \u017Ce ${e.origin ?? "warto\u015B\u0107"} b\u0119dzie wynosi\u0107 ${o}${e.maximum.toString()}`
			}
			case "too_small": {
				const o = e.inclusive ? ">=" : ">",
					a = r(e.origin)
				return a
					? `Za ma\u0142a warto\u015B\u0107: oczekiwano, \u017Ce ${e.origin ?? "warto\u015B\u0107"} b\u0119dzie mie\u0107 ${o}${e.minimum.toString()} ${a.unit ?? "element\xF3w"}`
					: `Zbyt ma\u0142(y/a/e): oczekiwano, \u017Ce ${e.origin ?? "warto\u015B\u0107"} b\u0119dzie wynosi\u0107 ${o}${e.minimum.toString()}`
			}
			case "invalid_format": {
				const o = e
				return o.format === "starts_with"
					? `Nieprawid\u0142owy ci\u0105g znak\xF3w: musi zaczyna\u0107 si\u0119 od "${o.prefix}"`
					: o.format === "ends_with"
						? `Nieprawid\u0142owy ci\u0105g znak\xF3w: musi ko\u0144czy\u0107 si\u0119 na "${o.suffix}"`
						: o.format === "includes"
							? `Nieprawid\u0142owy ci\u0105g znak\xF3w: musi zawiera\u0107 "${o.includes}"`
							: o.format === "regex"
								? `Nieprawid\u0142owy ci\u0105g znak\xF3w: musi odpowiada\u0107 wzorcowi ${o.pattern}`
								: `Nieprawid\u0142ow(y/a/e) ${i[o.format] ?? e.format}`
			}
			case "not_multiple_of":
				return `Nieprawid\u0142owa liczba: musi by\u0107 wielokrotno\u015Bci\u0105 ${e.divisor}`
			case "unrecognized_keys":
				return `Nierozpoznane klucze${e.keys.length > 1 ? "s" : ""}: ${f(e.keys, ", ")}`
			case "invalid_key":
				return `Nieprawid\u0142owy klucz w ${e.origin}`
			case "invalid_union":
				return "Nieprawid\u0142owe dane wej\u015Bciowe"
			case "invalid_element":
				return `Nieprawid\u0142owa warto\u015B\u0107 w ${e.origin}`
			default:
				return "Nieprawid\u0142owe dane wej\u015Bciowe"
		}
	}
}
function yc() {
	return { localeError: Fl() }
}
var Hl = () => {
	const t = {
		string: { unit: "caracteres", verb: "ter" },
		file: { unit: "bytes", verb: "ter" },
		array: { unit: "itens", verb: "ter" },
		set: { unit: "itens", verb: "ter" },
	}
	function r(e) {
		return t[e] ?? null
	}
	const n = (e) => {
			const o = typeof e
			switch (o) {
				case "number":
					return Number.isNaN(e) ? "NaN" : "n\xFAmero"
				case "object": {
					if (Array.isArray(e)) return "array"
					if (e === null) return "nulo"
					if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name
				}
			}
			return o
		},
		i = {
			regex: "padr\xE3o",
			email: "endere\xE7o de e-mail",
			url: "URL",
			emoji: "emoji",
			uuid: "UUID",
			uuidv4: "UUIDv4",
			uuidv6: "UUIDv6",
			nanoid: "nanoid",
			guid: "GUID",
			cuid: "cuid",
			cuid2: "cuid2",
			ulid: "ULID",
			xid: "XID",
			ksuid: "KSUID",
			datetime: "data e hora ISO",
			date: "data ISO",
			time: "hora ISO",
			duration: "dura\xE7\xE3o ISO",
			ipv4: "endere\xE7o IPv4",
			ipv6: "endere\xE7o IPv6",
			cidrv4: "faixa de IPv4",
			cidrv6: "faixa de IPv6",
			base64: "texto codificado em base64",
			base64url: "URL codificada em base64",
			json_string: "texto JSON",
			e164: "n\xFAmero E.164",
			jwt: "JWT",
			template_literal: "entrada",
		}
	return (e) => {
		switch (e.code) {
			case "invalid_type":
				return `Tipo inv\xE1lido: esperado ${e.expected}, recebido ${n(e.input)}`
			case "invalid_value":
				return e.values.length === 1
					? `Entrada inv\xE1lida: esperado ${_(e.values[0])}`
					: `Op\xE7\xE3o inv\xE1lida: esperada uma das ${f(e.values, "|")}`
			case "too_big": {
				const o = e.inclusive ? "<=" : "<",
					a = r(e.origin)
				return a
					? `Muito grande: esperado que ${e.origin ?? "valor"} tivesse ${o}${e.maximum.toString()} ${a.unit ?? "elementos"}`
					: `Muito grande: esperado que ${e.origin ?? "valor"} fosse ${o}${e.maximum.toString()}`
			}
			case "too_small": {
				const o = e.inclusive ? ">=" : ">",
					a = r(e.origin)
				return a
					? `Muito pequeno: esperado que ${e.origin} tivesse ${o}${e.minimum.toString()} ${a.unit}`
					: `Muito pequeno: esperado que ${e.origin} fosse ${o}${e.minimum.toString()}`
			}
			case "invalid_format": {
				const o = e
				return o.format === "starts_with"
					? `Texto inv\xE1lido: deve come\xE7ar com "${o.prefix}"`
					: o.format === "ends_with"
						? `Texto inv\xE1lido: deve terminar com "${o.suffix}"`
						: o.format === "includes"
							? `Texto inv\xE1lido: deve incluir "${o.includes}"`
							: o.format === "regex"
								? `Texto inv\xE1lido: deve corresponder ao padr\xE3o ${o.pattern}`
								: `${i[o.format] ?? e.format} inv\xE1lido`
			}
			case "not_multiple_of":
				return `N\xFAmero inv\xE1lido: deve ser m\xFAltiplo de ${e.divisor}`
			case "unrecognized_keys":
				return `Chave${e.keys.length > 1 ? "s" : ""} desconhecida${e.keys.length > 1 ? "s" : ""}: ${f(e.keys, ", ")}`
			case "invalid_key":
				return `Chave inv\xE1lida em ${e.origin}`
			case "invalid_union":
				return "Entrada inv\xE1lida"
			case "invalid_element":
				return `Valor inv\xE1lido em ${e.origin}`
			default:
				return "Campo inv\xE1lido"
		}
	}
}
function $c() {
	return { localeError: Hl() }
}
function xc(t, r, n, i) {
	const e = Math.abs(t),
		o = e % 10,
		a = e % 100
	return a >= 11 && a <= 19 ? i : o === 1 ? r : o >= 2 && o <= 4 ? n : i
}
var Jl = () => {
	const t = {
		string: {
			unit: {
				one: "\u0441\u0438\u043C\u0432\u043E\u043B",
				few: "\u0441\u0438\u043C\u0432\u043E\u043B\u0430",
				many: "\u0441\u0438\u043C\u0432\u043E\u043B\u043E\u0432",
			},
			verb: "\u0438\u043C\u0435\u0442\u044C",
		},
		file: {
			unit: {
				one: "\u0431\u0430\u0439\u0442",
				few: "\u0431\u0430\u0439\u0442\u0430",
				many: "\u0431\u0430\u0439\u0442",
			},
			verb: "\u0438\u043C\u0435\u0442\u044C",
		},
		array: {
			unit: {
				one: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442",
				few: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442\u0430",
				many: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442\u043E\u0432",
			},
			verb: "\u0438\u043C\u0435\u0442\u044C",
		},
		set: {
			unit: {
				one: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442",
				few: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442\u0430",
				many: "\u044D\u043B\u0435\u043C\u0435\u043D\u0442\u043E\u0432",
			},
			verb: "\u0438\u043C\u0435\u0442\u044C",
		},
	}
	function r(e) {
		return t[e] ?? null
	}
	const n = (e) => {
			const o = typeof e
			switch (o) {
				case "number":
					return Number.isNaN(e) ? "NaN" : "\u0447\u0438\u0441\u043B\u043E"
				case "object": {
					if (Array.isArray(e)) return "\u043C\u0430\u0441\u0441\u0438\u0432"
					if (e === null) return "null"
					if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name
				}
			}
			return o
		},
		i = {
			regex: "\u0432\u0432\u043E\u0434",
			email: "email \u0430\u0434\u0440\u0435\u0441",
			url: "URL",
			emoji: "\u044D\u043C\u043E\u0434\u0437\u0438",
			uuid: "UUID",
			uuidv4: "UUIDv4",
			uuidv6: "UUIDv6",
			nanoid: "nanoid",
			guid: "GUID",
			cuid: "cuid",
			cuid2: "cuid2",
			ulid: "ULID",
			xid: "XID",
			ksuid: "KSUID",
			datetime: "ISO \u0434\u0430\u0442\u0430 \u0438 \u0432\u0440\u0435\u043C\u044F",
			date: "ISO \u0434\u0430\u0442\u0430",
			time: "ISO \u0432\u0440\u0435\u043C\u044F",
			duration: "ISO \u0434\u043B\u0438\u0442\u0435\u043B\u044C\u043D\u043E\u0441\u0442\u044C",
			ipv4: "IPv4 \u0430\u0434\u0440\u0435\u0441",
			ipv6: "IPv6 \u0430\u0434\u0440\u0435\u0441",
			cidrv4: "IPv4 \u0434\u0438\u0430\u043F\u0430\u0437\u043E\u043D",
			cidrv6: "IPv6 \u0434\u0438\u0430\u043F\u0430\u0437\u043E\u043D",
			base64: "\u0441\u0442\u0440\u043E\u043A\u0430 \u0432 \u0444\u043E\u0440\u043C\u0430\u0442\u0435 base64",
			base64url: "\u0441\u0442\u0440\u043E\u043A\u0430 \u0432 \u0444\u043E\u0440\u043C\u0430\u0442\u0435 base64url",
			json_string: "JSON \u0441\u0442\u0440\u043E\u043A\u0430",
			e164: "\u043D\u043E\u043C\u0435\u0440 E.164",
			jwt: "JWT",
			template_literal: "\u0432\u0432\u043E\u0434",
		}
	return (e) => {
		switch (e.code) {
			case "invalid_type":
				return `\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 \u0432\u0432\u043E\u0434: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C ${e.expected}, \u043F\u043E\u043B\u0443\u0447\u0435\u043D\u043E ${n(e.input)}`
			case "invalid_value":
				return e.values.length === 1
					? `\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 \u0432\u0432\u043E\u0434: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C ${_(e.values[0])}`
					: `\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 \u0432\u0430\u0440\u0438\u0430\u043D\u0442: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C \u043E\u0434\u043D\u043E \u0438\u0437 ${f(e.values, "|")}`
			case "too_big": {
				const o = e.inclusive ? "<=" : "<",
					a = r(e.origin)
				if (a) {
					const c = Number(e.maximum),
						p = xc(c, a.unit.one, a.unit.few, a.unit.many)
					return `\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u0431\u043E\u043B\u044C\u0448\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C, \u0447\u0442\u043E ${e.origin ?? "\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435"} \u0431\u0443\u0434\u0435\u0442 \u0438\u043C\u0435\u0442\u044C ${o}${e.maximum.toString()} ${p}`
				}
				return `\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u0431\u043E\u043B\u044C\u0448\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C, \u0447\u0442\u043E ${e.origin ?? "\u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435"} \u0431\u0443\u0434\u0435\u0442 ${o}${e.maximum.toString()}`
			}
			case "too_small": {
				const o = e.inclusive ? ">=" : ">",
					a = r(e.origin)
				if (a) {
					const c = Number(e.minimum),
						p = xc(c, a.unit.one, a.unit.few, a.unit.many)
					return `\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u043C\u0430\u043B\u0435\u043D\u044C\u043A\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C, \u0447\u0442\u043E ${e.origin} \u0431\u0443\u0434\u0435\u0442 \u0438\u043C\u0435\u0442\u044C ${o}${e.minimum.toString()} ${p}`
				}
				return `\u0421\u043B\u0438\u0448\u043A\u043E\u043C \u043C\u0430\u043B\u0435\u043D\u044C\u043A\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435: \u043E\u0436\u0438\u0434\u0430\u043B\u043E\u0441\u044C, \u0447\u0442\u043E ${e.origin} \u0431\u0443\u0434\u0435\u0442 ${o}${e.minimum.toString()}`
			}
			case "invalid_format": {
				const o = e
				return o.format === "starts_with"
					? `\u041D\u0435\u0432\u0435\u0440\u043D\u0430\u044F \u0441\u0442\u0440\u043E\u043A\u0430: \u0434\u043E\u043B\u0436\u043D\u0430 \u043D\u0430\u0447\u0438\u043D\u0430\u0442\u044C\u0441\u044F \u0441 "${o.prefix}"`
					: o.format === "ends_with"
						? `\u041D\u0435\u0432\u0435\u0440\u043D\u0430\u044F \u0441\u0442\u0440\u043E\u043A\u0430: \u0434\u043E\u043B\u0436\u043D\u0430 \u0437\u0430\u043A\u0430\u043D\u0447\u0438\u0432\u0430\u0442\u044C\u0441\u044F \u043D\u0430 "${o.suffix}"`
						: o.format === "includes"
							? `\u041D\u0435\u0432\u0435\u0440\u043D\u0430\u044F \u0441\u0442\u0440\u043E\u043A\u0430: \u0434\u043E\u043B\u0436\u043D\u0430 \u0441\u043E\u0434\u0435\u0440\u0436\u0430\u0442\u044C "${o.includes}"`
							: o.format === "regex"
								? `\u041D\u0435\u0432\u0435\u0440\u043D\u0430\u044F \u0441\u0442\u0440\u043E\u043A\u0430: \u0434\u043E\u043B\u0436\u043D\u0430 \u0441\u043E\u043E\u0442\u0432\u0435\u0442\u0441\u0442\u0432\u043E\u0432\u0430\u0442\u044C \u0448\u0430\u0431\u043B\u043E\u043D\u0443 ${o.pattern}`
								: `\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 ${i[o.format] ?? e.format}`
			}
			case "not_multiple_of":
				return `\u041D\u0435\u0432\u0435\u0440\u043D\u043E\u0435 \u0447\u0438\u0441\u043B\u043E: \u0434\u043E\u043B\u0436\u043D\u043E \u0431\u044B\u0442\u044C \u043A\u0440\u0430\u0442\u043D\u044B\u043C ${e.divisor}`
			case "unrecognized_keys":
				return `\u041D\u0435\u0440\u0430\u0441\u043F\u043E\u0437\u043D\u0430\u043D\u043D${e.keys.length > 1 ? "\u044B\u0435" : "\u044B\u0439"} \u043A\u043B\u044E\u0447${e.keys.length > 1 ? "\u0438" : ""}: ${f(e.keys, ", ")}`
			case "invalid_key":
				return `\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0439 \u043A\u043B\u044E\u0447 \u0432 ${e.origin}`
			case "invalid_union":
				return "\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0435 \u0432\u0445\u043E\u0434\u043D\u044B\u0435 \u0434\u0430\u043D\u043D\u044B\u0435"
			case "invalid_element":
				return `\u041D\u0435\u0432\u0435\u0440\u043D\u043E\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u0438\u0435 \u0432 ${e.origin}`
			default:
				return "\u041D\u0435\u0432\u0435\u0440\u043D\u044B\u0435 \u0432\u0445\u043E\u0434\u043D\u044B\u0435 \u0434\u0430\u043D\u043D\u044B\u0435"
		}
	}
}
function zc() {
	return { localeError: Jl() }
}
var Bl = () => {
	const t = {
		string: { unit: "znakov", verb: "imeti" },
		file: { unit: "bajtov", verb: "imeti" },
		array: { unit: "elementov", verb: "imeti" },
		set: { unit: "elementov", verb: "imeti" },
	}
	function r(e) {
		return t[e] ?? null
	}
	const n = (e) => {
			const o = typeof e
			switch (o) {
				case "number":
					return Number.isNaN(e) ? "NaN" : "\u0161tevilo"
				case "object": {
					if (Array.isArray(e)) return "tabela"
					if (e === null) return "null"
					if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name
				}
			}
			return o
		},
		i = {
			regex: "vnos",
			email: "e-po\u0161tni naslov",
			url: "URL",
			emoji: "emoji",
			uuid: "UUID",
			uuidv4: "UUIDv4",
			uuidv6: "UUIDv6",
			nanoid: "nanoid",
			guid: "GUID",
			cuid: "cuid",
			cuid2: "cuid2",
			ulid: "ULID",
			xid: "XID",
			ksuid: "KSUID",
			datetime: "ISO datum in \u010Das",
			date: "ISO datum",
			time: "ISO \u010Das",
			duration: "ISO trajanje",
			ipv4: "IPv4 naslov",
			ipv6: "IPv6 naslov",
			cidrv4: "obseg IPv4",
			cidrv6: "obseg IPv6",
			base64: "base64 kodiran niz",
			base64url: "base64url kodiran niz",
			json_string: "JSON niz",
			e164: "E.164 \u0161tevilka",
			jwt: "JWT",
			template_literal: "vnos",
		}
	return (e) => {
		switch (e.code) {
			case "invalid_type":
				return `Neveljaven vnos: pri\u010Dakovano ${e.expected}, prejeto ${n(e.input)}`
			case "invalid_value":
				return e.values.length === 1
					? `Neveljaven vnos: pri\u010Dakovano ${_(e.values[0])}`
					: `Neveljavna mo\u017Enost: pri\u010Dakovano eno izmed ${f(e.values, "|")}`
			case "too_big": {
				const o = e.inclusive ? "<=" : "<",
					a = r(e.origin)
				return a
					? `Preveliko: pri\u010Dakovano, da bo ${e.origin ?? "vrednost"} imelo ${o}${e.maximum.toString()} ${a.unit ?? "elementov"}`
					: `Preveliko: pri\u010Dakovano, da bo ${e.origin ?? "vrednost"} ${o}${e.maximum.toString()}`
			}
			case "too_small": {
				const o = e.inclusive ? ">=" : ">",
					a = r(e.origin)
				return a
					? `Premajhno: pri\u010Dakovano, da bo ${e.origin} imelo ${o}${e.minimum.toString()} ${a.unit}`
					: `Premajhno: pri\u010Dakovano, da bo ${e.origin} ${o}${e.minimum.toString()}`
			}
			case "invalid_format": {
				const o = e
				return o.format === "starts_with"
					? `Neveljaven niz: mora se za\u010Deti z "${o.prefix}"`
					: o.format === "ends_with"
						? `Neveljaven niz: mora se kon\u010Dati z "${o.suffix}"`
						: o.format === "includes"
							? `Neveljaven niz: mora vsebovati "${o.includes}"`
							: o.format === "regex"
								? `Neveljaven niz: mora ustrezati vzorcu ${o.pattern}`
								: `Neveljaven ${i[o.format] ?? e.format}`
			}
			case "not_multiple_of":
				return `Neveljavno \u0161tevilo: mora biti ve\u010Dkratnik ${e.divisor}`
			case "unrecognized_keys":
				return `Neprepoznan${e.keys.length > 1 ? "i klju\u010Di" : " klju\u010D"}: ${f(e.keys, ", ")}`
			case "invalid_key":
				return `Neveljaven klju\u010D v ${e.origin}`
			case "invalid_union":
				return "Neveljaven vnos"
			case "invalid_element":
				return `Neveljavna vrednost v ${e.origin}`
			default:
				return "Neveljaven vnos"
		}
	}
}
function kc() {
	return { localeError: Bl() }
}
var Wl = () => {
	const t = {
		string: { unit: "tecken", verb: "att ha" },
		file: { unit: "bytes", verb: "att ha" },
		array: { unit: "objekt", verb: "att inneh\xE5lla" },
		set: { unit: "objekt", verb: "att inneh\xE5lla" },
	}
	function r(e) {
		return t[e] ?? null
	}
	const n = (e) => {
			const o = typeof e
			switch (o) {
				case "number":
					return Number.isNaN(e) ? "NaN" : "antal"
				case "object": {
					if (Array.isArray(e)) return "lista"
					if (e === null) return "null"
					if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name
				}
			}
			return o
		},
		i = {
			regex: "regulj\xE4rt uttryck",
			email: "e-postadress",
			url: "URL",
			emoji: "emoji",
			uuid: "UUID",
			uuidv4: "UUIDv4",
			uuidv6: "UUIDv6",
			nanoid: "nanoid",
			guid: "GUID",
			cuid: "cuid",
			cuid2: "cuid2",
			ulid: "ULID",
			xid: "XID",
			ksuid: "KSUID",
			datetime: "ISO-datum och tid",
			date: "ISO-datum",
			time: "ISO-tid",
			duration: "ISO-varaktighet",
			ipv4: "IPv4-intervall",
			ipv6: "IPv6-intervall",
			cidrv4: "IPv4-spektrum",
			cidrv6: "IPv6-spektrum",
			base64: "base64-kodad str\xE4ng",
			base64url: "base64url-kodad str\xE4ng",
			json_string: "JSON-str\xE4ng",
			e164: "E.164-nummer",
			jwt: "JWT",
			template_literal: "mall-literal",
		}
	return (e) => {
		switch (e.code) {
			case "invalid_type":
				return `Ogiltig inmatning: f\xF6rv\xE4ntat ${e.expected}, fick ${n(e.input)}`
			case "invalid_value":
				return e.values.length === 1
					? `Ogiltig inmatning: f\xF6rv\xE4ntat ${_(e.values[0])}`
					: `Ogiltigt val: f\xF6rv\xE4ntade en av ${f(e.values, "|")}`
			case "too_big": {
				const o = e.inclusive ? "<=" : "<",
					a = r(e.origin)
				return a
					? `F\xF6r stor(t): f\xF6rv\xE4ntade ${e.origin ?? "v\xE4rdet"} att ha ${o}${e.maximum.toString()} ${a.unit ?? "element"}`
					: `F\xF6r stor(t): f\xF6rv\xE4ntat ${e.origin ?? "v\xE4rdet"} att ha ${o}${e.maximum.toString()}`
			}
			case "too_small": {
				const o = e.inclusive ? ">=" : ">",
					a = r(e.origin)
				return a
					? `F\xF6r lite(t): f\xF6rv\xE4ntade ${e.origin ?? "v\xE4rdet"} att ha ${o}${e.minimum.toString()} ${a.unit}`
					: `F\xF6r lite(t): f\xF6rv\xE4ntade ${e.origin ?? "v\xE4rdet"} att ha ${o}${e.minimum.toString()}`
			}
			case "invalid_format": {
				const o = e
				return o.format === "starts_with"
					? `Ogiltig str\xE4ng: m\xE5ste b\xF6rja med "${o.prefix}"`
					: o.format === "ends_with"
						? `Ogiltig str\xE4ng: m\xE5ste sluta med "${o.suffix}"`
						: o.format === "includes"
							? `Ogiltig str\xE4ng: m\xE5ste inneh\xE5lla "${o.includes}"`
							: o.format === "regex"
								? `Ogiltig str\xE4ng: m\xE5ste matcha m\xF6nstret "${o.pattern}"`
								: `Ogiltig(t) ${i[o.format] ?? e.format}`
			}
			case "not_multiple_of":
				return `Ogiltigt tal: m\xE5ste vara en multipel av ${e.divisor}`
			case "unrecognized_keys":
				return `${e.keys.length > 1 ? "Ok\xE4nda nycklar" : "Ok\xE4nd nyckel"}: ${f(e.keys, ", ")}`
			case "invalid_key":
				return `Ogiltig nyckel i ${e.origin ?? "v\xE4rdet"}`
			case "invalid_union":
				return "Ogiltig input"
			case "invalid_element":
				return `Ogiltigt v\xE4rde i ${e.origin ?? "v\xE4rdet"}`
			default:
				return "Ogiltig input"
		}
	}
}
function Sc() {
	return { localeError: Wl() }
}
var Gl = () => {
	const t = {
		string: {
			unit: "\u0B8E\u0BB4\u0BC1\u0BA4\u0BCD\u0BA4\u0BC1\u0B95\u0BCD\u0B95\u0BB3\u0BCD",
			verb: "\u0B95\u0BCA\u0BA3\u0BCD\u0B9F\u0BBF\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD",
		},
		file: {
			unit: "\u0BAA\u0BC8\u0B9F\u0BCD\u0B9F\u0BC1\u0B95\u0BB3\u0BCD",
			verb: "\u0B95\u0BCA\u0BA3\u0BCD\u0B9F\u0BBF\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD",
		},
		array: {
			unit: "\u0B89\u0BB1\u0BC1\u0BAA\u0BCD\u0BAA\u0BC1\u0B95\u0BB3\u0BCD",
			verb: "\u0B95\u0BCA\u0BA3\u0BCD\u0B9F\u0BBF\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD",
		},
		set: {
			unit: "\u0B89\u0BB1\u0BC1\u0BAA\u0BCD\u0BAA\u0BC1\u0B95\u0BB3\u0BCD",
			verb: "\u0B95\u0BCA\u0BA3\u0BCD\u0B9F\u0BBF\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD",
		},
	}
	function r(e) {
		return t[e] ?? null
	}
	const n = (e) => {
			const o = typeof e
			switch (o) {
				case "number":
					return Number.isNaN(e)
						? "\u0B8E\u0BA3\u0BCD \u0B85\u0BB2\u0BCD\u0BB2\u0BBE\u0BA4\u0BA4\u0BC1"
						: "\u0B8E\u0BA3\u0BCD"
				case "object": {
					if (Array.isArray(e)) return "\u0B85\u0BA3\u0BBF"
					if (e === null) return "\u0BB5\u0BC6\u0BB1\u0BC1\u0BAE\u0BC8"
					if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name
				}
			}
			return o
		},
		i = {
			regex: "\u0B89\u0BB3\u0BCD\u0BB3\u0BC0\u0B9F\u0BC1",
			email: "\u0BAE\u0BBF\u0BA9\u0BCD\u0BA9\u0B9E\u0BCD\u0B9A\u0BB2\u0BCD \u0BAE\u0BC1\u0B95\u0BB5\u0BB0\u0BBF",
			url: "URL",
			emoji: "emoji",
			uuid: "UUID",
			uuidv4: "UUIDv4",
			uuidv6: "UUIDv6",
			nanoid: "nanoid",
			guid: "GUID",
			cuid: "cuid",
			cuid2: "cuid2",
			ulid: "ULID",
			xid: "XID",
			ksuid: "KSUID",
			datetime: "ISO \u0BA4\u0BC7\u0BA4\u0BBF \u0BA8\u0BC7\u0BB0\u0BAE\u0BCD",
			date: "ISO \u0BA4\u0BC7\u0BA4\u0BBF",
			time: "ISO \u0BA8\u0BC7\u0BB0\u0BAE\u0BCD",
			duration: "ISO \u0B95\u0BBE\u0BB2 \u0B85\u0BB3\u0BB5\u0BC1",
			ipv4: "IPv4 \u0BAE\u0BC1\u0B95\u0BB5\u0BB0\u0BBF",
			ipv6: "IPv6 \u0BAE\u0BC1\u0B95\u0BB5\u0BB0\u0BBF",
			cidrv4: "IPv4 \u0BB5\u0BB0\u0BAE\u0BCD\u0BAA\u0BC1",
			cidrv6: "IPv6 \u0BB5\u0BB0\u0BAE\u0BCD\u0BAA\u0BC1",
			base64: "base64-encoded \u0B9A\u0BB0\u0BAE\u0BCD",
			base64url: "base64url-encoded \u0B9A\u0BB0\u0BAE\u0BCD",
			json_string: "JSON \u0B9A\u0BB0\u0BAE\u0BCD",
			e164: "E.164 \u0B8E\u0BA3\u0BCD",
			jwt: "JWT",
			template_literal: "input",
		}
	return (e) => {
		switch (e.code) {
			case "invalid_type":
				return `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B89\u0BB3\u0BCD\u0BB3\u0BC0\u0B9F\u0BC1: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${e.expected}, \u0BAA\u0BC6\u0BB1\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${n(e.input)}`
			case "invalid_value":
				return e.values.length === 1
					? `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B89\u0BB3\u0BCD\u0BB3\u0BC0\u0B9F\u0BC1: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${_(e.values[0])}`
					: `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0BB5\u0BBF\u0BB0\u0BC1\u0BAA\u0BCD\u0BAA\u0BAE\u0BCD: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${f(e.values, "|")} \u0B87\u0BB2\u0BCD \u0B92\u0BA9\u0BCD\u0BB1\u0BC1`
			case "too_big": {
				const o = e.inclusive ? "<=" : "<",
					a = r(e.origin)
				return a
					? `\u0BAE\u0BBF\u0B95 \u0BAA\u0BC6\u0BB0\u0BBF\u0BAF\u0BA4\u0BC1: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${e.origin ?? "\u0BAE\u0BA4\u0BBF\u0BAA\u0BCD\u0BAA\u0BC1"} ${o}${e.maximum.toString()} ${a.unit ?? "\u0B89\u0BB1\u0BC1\u0BAA\u0BCD\u0BAA\u0BC1\u0B95\u0BB3\u0BCD"} \u0B86\u0B95 \u0B87\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`
					: `\u0BAE\u0BBF\u0B95 \u0BAA\u0BC6\u0BB0\u0BBF\u0BAF\u0BA4\u0BC1: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${e.origin ?? "\u0BAE\u0BA4\u0BBF\u0BAA\u0BCD\u0BAA\u0BC1"} ${o}${e.maximum.toString()} \u0B86\u0B95 \u0B87\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`
			}
			case "too_small": {
				const o = e.inclusive ? ">=" : ">",
					a = r(e.origin)
				return a
					? `\u0BAE\u0BBF\u0B95\u0B9A\u0BCD \u0B9A\u0BBF\u0BB1\u0BBF\u0BAF\u0BA4\u0BC1: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${e.origin} ${o}${e.minimum.toString()} ${a.unit} \u0B86\u0B95 \u0B87\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`
					: `\u0BAE\u0BBF\u0B95\u0B9A\u0BCD \u0B9A\u0BBF\u0BB1\u0BBF\u0BAF\u0BA4\u0BC1: \u0B8E\u0BA4\u0BBF\u0BB0\u0BCD\u0BAA\u0BBE\u0BB0\u0BCD\u0B95\u0BCD\u0B95\u0BAA\u0BCD\u0BAA\u0B9F\u0BCD\u0B9F\u0BA4\u0BC1 ${e.origin} ${o}${e.minimum.toString()} \u0B86\u0B95 \u0B87\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`
			}
			case "invalid_format": {
				const o = e
				return o.format === "starts_with"
					? `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B9A\u0BB0\u0BAE\u0BCD: "${o.prefix}" \u0B87\u0BB2\u0BCD \u0BA4\u0BCA\u0B9F\u0B99\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`
					: o.format === "ends_with"
						? `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B9A\u0BB0\u0BAE\u0BCD: "${o.suffix}" \u0B87\u0BB2\u0BCD \u0BAE\u0BC1\u0B9F\u0BBF\u0BB5\u0B9F\u0BC8\u0BAF \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`
						: o.format === "includes"
							? `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B9A\u0BB0\u0BAE\u0BCD: "${o.includes}" \u0B90 \u0B89\u0BB3\u0BCD\u0BB3\u0B9F\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`
							: o.format === "regex"
								? `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B9A\u0BB0\u0BAE\u0BCD: ${o.pattern} \u0BAE\u0BC1\u0BB1\u0BC8\u0BAA\u0BBE\u0B9F\u0BCD\u0B9F\u0BC1\u0B9F\u0BA9\u0BCD \u0BAA\u0BCA\u0BB0\u0BC1\u0BA8\u0BCD\u0BA4 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`
								: `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 ${i[o.format] ?? e.format}`
			}
			case "not_multiple_of":
				return `\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B8E\u0BA3\u0BCD: ${e.divisor} \u0B87\u0BA9\u0BCD \u0BAA\u0BB2\u0BAE\u0BBE\u0B95 \u0B87\u0BB0\u0BC1\u0B95\u0BCD\u0B95 \u0BB5\u0BC7\u0BA3\u0BCD\u0B9F\u0BC1\u0BAE\u0BCD`
			case "unrecognized_keys":
				return `\u0B85\u0B9F\u0BC8\u0BAF\u0BBE\u0BB3\u0BAE\u0BCD \u0BA4\u0BC6\u0BB0\u0BBF\u0BAF\u0BBE\u0BA4 \u0BB5\u0BBF\u0B9A\u0BC8${e.keys.length > 1 ? "\u0B95\u0BB3\u0BCD" : ""}: ${f(e.keys, ", ")}`
			case "invalid_key":
				return `${e.origin} \u0B87\u0BB2\u0BCD \u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0BB5\u0BBF\u0B9A\u0BC8`
			case "invalid_union":
				return "\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B89\u0BB3\u0BCD\u0BB3\u0BC0\u0B9F\u0BC1"
			case "invalid_element":
				return `${e.origin} \u0B87\u0BB2\u0BCD \u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0BAE\u0BA4\u0BBF\u0BAA\u0BCD\u0BAA\u0BC1`
			default:
				return "\u0BA4\u0BB5\u0BB1\u0BBE\u0BA9 \u0B89\u0BB3\u0BCD\u0BB3\u0BC0\u0B9F\u0BC1"
		}
	}
}
function wc() {
	return { localeError: Gl() }
}
var Kl = () => {
	const t = {
		string: { unit: "\u0E15\u0E31\u0E27\u0E2D\u0E31\u0E01\u0E29\u0E23", verb: "\u0E04\u0E27\u0E23\u0E21\u0E35" },
		file: { unit: "\u0E44\u0E1A\u0E15\u0E4C", verb: "\u0E04\u0E27\u0E23\u0E21\u0E35" },
		array: { unit: "\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23", verb: "\u0E04\u0E27\u0E23\u0E21\u0E35" },
		set: { unit: "\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23", verb: "\u0E04\u0E27\u0E23\u0E21\u0E35" },
	}
	function r(e) {
		return t[e] ?? null
	}
	const n = (e) => {
			const o = typeof e
			switch (o) {
				case "number":
					return Number.isNaN(e)
						? "\u0E44\u0E21\u0E48\u0E43\u0E0A\u0E48\u0E15\u0E31\u0E27\u0E40\u0E25\u0E02 (NaN)"
						: "\u0E15\u0E31\u0E27\u0E40\u0E25\u0E02"
				case "object": {
					if (Array.isArray(e)) return "\u0E2D\u0E32\u0E23\u0E4C\u0E40\u0E23\u0E22\u0E4C (Array)"
					if (e === null) return "\u0E44\u0E21\u0E48\u0E21\u0E35\u0E04\u0E48\u0E32 (null)"
					if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name
				}
			}
			return o
		},
		i = {
			regex: "\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E17\u0E35\u0E48\u0E1B\u0E49\u0E2D\u0E19",
			email: "\u0E17\u0E35\u0E48\u0E2D\u0E22\u0E39\u0E48\u0E2D\u0E35\u0E40\u0E21\u0E25",
			url: "URL",
			emoji: "\u0E2D\u0E34\u0E42\u0E21\u0E08\u0E34",
			uuid: "UUID",
			uuidv4: "UUIDv4",
			uuidv6: "UUIDv6",
			nanoid: "nanoid",
			guid: "GUID",
			cuid: "cuid",
			cuid2: "cuid2",
			ulid: "ULID",
			xid: "XID",
			ksuid: "KSUID",
			datetime: "\u0E27\u0E31\u0E19\u0E17\u0E35\u0E48\u0E40\u0E27\u0E25\u0E32\u0E41\u0E1A\u0E1A ISO",
			date: "\u0E27\u0E31\u0E19\u0E17\u0E35\u0E48\u0E41\u0E1A\u0E1A ISO",
			time: "\u0E40\u0E27\u0E25\u0E32\u0E41\u0E1A\u0E1A ISO",
			duration: "\u0E0A\u0E48\u0E27\u0E07\u0E40\u0E27\u0E25\u0E32\u0E41\u0E1A\u0E1A ISO",
			ipv4: "\u0E17\u0E35\u0E48\u0E2D\u0E22\u0E39\u0E48 IPv4",
			ipv6: "\u0E17\u0E35\u0E48\u0E2D\u0E22\u0E39\u0E48 IPv6",
			cidrv4: "\u0E0A\u0E48\u0E27\u0E07 IP \u0E41\u0E1A\u0E1A IPv4",
			cidrv6: "\u0E0A\u0E48\u0E27\u0E07 IP \u0E41\u0E1A\u0E1A IPv6",
			base64: "\u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E41\u0E1A\u0E1A Base64",
			base64url:
				"\u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E41\u0E1A\u0E1A Base64 \u0E2A\u0E33\u0E2B\u0E23\u0E31\u0E1A URL",
			json_string: "\u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E41\u0E1A\u0E1A JSON",
			e164: "\u0E40\u0E1A\u0E2D\u0E23\u0E4C\u0E42\u0E17\u0E23\u0E28\u0E31\u0E1E\u0E17\u0E4C\u0E23\u0E30\u0E2B\u0E27\u0E48\u0E32\u0E07\u0E1B\u0E23\u0E30\u0E40\u0E17\u0E28 (E.164)",
			jwt: "\u0E42\u0E17\u0E40\u0E04\u0E19 JWT",
			template_literal: "\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E17\u0E35\u0E48\u0E1B\u0E49\u0E2D\u0E19",
		}
	return (e) => {
		switch (e.code) {
			case "invalid_type":
				return `\u0E1B\u0E23\u0E30\u0E40\u0E20\u0E17\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E04\u0E27\u0E23\u0E40\u0E1B\u0E47\u0E19 ${e.expected} \u0E41\u0E15\u0E48\u0E44\u0E14\u0E49\u0E23\u0E31\u0E1A ${n(e.input)}`
			case "invalid_value":
				return e.values.length === 1
					? `\u0E04\u0E48\u0E32\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E04\u0E27\u0E23\u0E40\u0E1B\u0E47\u0E19 ${_(e.values[0])}`
					: `\u0E15\u0E31\u0E27\u0E40\u0E25\u0E37\u0E2D\u0E01\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E04\u0E27\u0E23\u0E40\u0E1B\u0E47\u0E19\u0E2B\u0E19\u0E36\u0E48\u0E07\u0E43\u0E19 ${f(e.values, "|")}`
			case "too_big": {
				const o = e.inclusive
						? "\u0E44\u0E21\u0E48\u0E40\u0E01\u0E34\u0E19"
						: "\u0E19\u0E49\u0E2D\u0E22\u0E01\u0E27\u0E48\u0E32",
					a = r(e.origin)
				return a
					? `\u0E40\u0E01\u0E34\u0E19\u0E01\u0E33\u0E2B\u0E19\u0E14: ${e.origin ?? "\u0E04\u0E48\u0E32"} \u0E04\u0E27\u0E23\u0E21\u0E35${o} ${e.maximum.toString()} ${a.unit ?? "\u0E23\u0E32\u0E22\u0E01\u0E32\u0E23"}`
					: `\u0E40\u0E01\u0E34\u0E19\u0E01\u0E33\u0E2B\u0E19\u0E14: ${e.origin ?? "\u0E04\u0E48\u0E32"} \u0E04\u0E27\u0E23\u0E21\u0E35${o} ${e.maximum.toString()}`
			}
			case "too_small": {
				const o = e.inclusive
						? "\u0E2D\u0E22\u0E48\u0E32\u0E07\u0E19\u0E49\u0E2D\u0E22"
						: "\u0E21\u0E32\u0E01\u0E01\u0E27\u0E48\u0E32",
					a = r(e.origin)
				return a
					? `\u0E19\u0E49\u0E2D\u0E22\u0E01\u0E27\u0E48\u0E32\u0E01\u0E33\u0E2B\u0E19\u0E14: ${e.origin} \u0E04\u0E27\u0E23\u0E21\u0E35${o} ${e.minimum.toString()} ${a.unit}`
					: `\u0E19\u0E49\u0E2D\u0E22\u0E01\u0E27\u0E48\u0E32\u0E01\u0E33\u0E2B\u0E19\u0E14: ${e.origin} \u0E04\u0E27\u0E23\u0E21\u0E35${o} ${e.minimum.toString()}`
			}
			case "invalid_format": {
				const o = e
				return o.format === "starts_with"
					? `\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E15\u0E49\u0E2D\u0E07\u0E02\u0E36\u0E49\u0E19\u0E15\u0E49\u0E19\u0E14\u0E49\u0E27\u0E22 "${o.prefix}"`
					: o.format === "ends_with"
						? `\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E15\u0E49\u0E2D\u0E07\u0E25\u0E07\u0E17\u0E49\u0E32\u0E22\u0E14\u0E49\u0E27\u0E22 "${o.suffix}"`
						: o.format === "includes"
							? `\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21\u0E15\u0E49\u0E2D\u0E07\u0E21\u0E35 "${o.includes}" \u0E2D\u0E22\u0E39\u0E48\u0E43\u0E19\u0E02\u0E49\u0E2D\u0E04\u0E27\u0E32\u0E21`
							: o.format === "regex"
								? `\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E15\u0E49\u0E2D\u0E07\u0E15\u0E23\u0E07\u0E01\u0E31\u0E1A\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E17\u0E35\u0E48\u0E01\u0E33\u0E2B\u0E19\u0E14 ${o.pattern}`
								: `\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: ${i[o.format] ?? e.format}`
			}
			case "not_multiple_of":
				return `\u0E15\u0E31\u0E27\u0E40\u0E25\u0E02\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E15\u0E49\u0E2D\u0E07\u0E40\u0E1B\u0E47\u0E19\u0E08\u0E33\u0E19\u0E27\u0E19\u0E17\u0E35\u0E48\u0E2B\u0E32\u0E23\u0E14\u0E49\u0E27\u0E22 ${e.divisor} \u0E44\u0E14\u0E49\u0E25\u0E07\u0E15\u0E31\u0E27`
			case "unrecognized_keys":
				return `\u0E1E\u0E1A\u0E04\u0E35\u0E22\u0E4C\u0E17\u0E35\u0E48\u0E44\u0E21\u0E48\u0E23\u0E39\u0E49\u0E08\u0E31\u0E01: ${f(e.keys, ", ")}`
			case "invalid_key":
				return `\u0E04\u0E35\u0E22\u0E4C\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07\u0E43\u0E19 ${e.origin}`
			case "invalid_union":
				return "\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07: \u0E44\u0E21\u0E48\u0E15\u0E23\u0E07\u0E01\u0E31\u0E1A\u0E23\u0E39\u0E1B\u0E41\u0E1A\u0E1A\u0E22\u0E39\u0E40\u0E19\u0E35\u0E22\u0E19\u0E17\u0E35\u0E48\u0E01\u0E33\u0E2B\u0E19\u0E14\u0E44\u0E27\u0E49"
			case "invalid_element":
				return `\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07\u0E43\u0E19 ${e.origin}`
			default:
				return "\u0E02\u0E49\u0E2D\u0E21\u0E39\u0E25\u0E44\u0E21\u0E48\u0E16\u0E39\u0E01\u0E15\u0E49\u0E2D\u0E07"
		}
	}
}
function Ic() {
	return { localeError: Kl() }
}
var Ql = (t) => {
		const r = typeof t
		switch (r) {
			case "number":
				return Number.isNaN(t) ? "NaN" : "number"
			case "object": {
				if (Array.isArray(t)) return "array"
				if (t === null) return "null"
				if (Object.getPrototypeOf(t) !== Object.prototype && t.constructor) return t.constructor.name
			}
		}
		return r
	},
	Xl = () => {
		const t = {
			string: { unit: "karakter", verb: "olmal\u0131" },
			file: { unit: "bayt", verb: "olmal\u0131" },
			array: { unit: "\xF6\u011Fe", verb: "olmal\u0131" },
			set: { unit: "\xF6\u011Fe", verb: "olmal\u0131" },
		}
		function r(i) {
			return t[i] ?? null
		}
		const n = {
			regex: "girdi",
			email: "e-posta adresi",
			url: "URL",
			emoji: "emoji",
			uuid: "UUID",
			uuidv4: "UUIDv4",
			uuidv6: "UUIDv6",
			nanoid: "nanoid",
			guid: "GUID",
			cuid: "cuid",
			cuid2: "cuid2",
			ulid: "ULID",
			xid: "XID",
			ksuid: "KSUID",
			datetime: "ISO tarih ve saat",
			date: "ISO tarih",
			time: "ISO saat",
			duration: "ISO s\xFCre",
			ipv4: "IPv4 adresi",
			ipv6: "IPv6 adresi",
			cidrv4: "IPv4 aral\u0131\u011F\u0131",
			cidrv6: "IPv6 aral\u0131\u011F\u0131",
			base64: "base64 ile \u015Fifrelenmi\u015F metin",
			base64url: "base64url ile \u015Fifrelenmi\u015F metin",
			json_string: "JSON dizesi",
			e164: "E.164 say\u0131s\u0131",
			jwt: "JWT",
			template_literal: "\u015Eablon dizesi",
		}
		return (i) => {
			switch (i.code) {
				case "invalid_type":
					return `Ge\xE7ersiz de\u011Fer: beklenen ${i.expected}, al\u0131nan ${Ql(i.input)}`
				case "invalid_value":
					return i.values.length === 1
						? `Ge\xE7ersiz de\u011Fer: beklenen ${_(i.values[0])}`
						: `Ge\xE7ersiz se\xE7enek: a\u015Fa\u011F\u0131dakilerden biri olmal\u0131: ${f(i.values, "|")}`
				case "too_big": {
					const e = i.inclusive ? "<=" : "<",
						o = r(i.origin)
					return o
						? `\xC7ok b\xFCy\xFCk: beklenen ${i.origin ?? "de\u011Fer"} ${e}${i.maximum.toString()} ${o.unit ?? "\xF6\u011Fe"}`
						: `\xC7ok b\xFCy\xFCk: beklenen ${i.origin ?? "de\u011Fer"} ${e}${i.maximum.toString()}`
				}
				case "too_small": {
					const e = i.inclusive ? ">=" : ">",
						o = r(i.origin)
					return o
						? `\xC7ok k\xFC\xE7\xFCk: beklenen ${i.origin} ${e}${i.minimum.toString()} ${o.unit}`
						: `\xC7ok k\xFC\xE7\xFCk: beklenen ${i.origin} ${e}${i.minimum.toString()}`
				}
				case "invalid_format": {
					const e = i
					return e.format === "starts_with"
						? `Ge\xE7ersiz metin: "${e.prefix}" ile ba\u015Flamal\u0131`
						: e.format === "ends_with"
							? `Ge\xE7ersiz metin: "${e.suffix}" ile bitmeli`
							: e.format === "includes"
								? `Ge\xE7ersiz metin: "${e.includes}" i\xE7ermeli`
								: e.format === "regex"
									? `Ge\xE7ersiz metin: ${e.pattern} desenine uymal\u0131`
									: `Ge\xE7ersiz ${n[e.format] ?? i.format}`
				}
				case "not_multiple_of":
					return `Ge\xE7ersiz say\u0131: ${i.divisor} ile tam b\xF6l\xFCnebilmeli`
				case "unrecognized_keys":
					return `Tan\u0131nmayan anahtar${i.keys.length > 1 ? "lar" : ""}: ${f(i.keys, ", ")}`
				case "invalid_key":
					return `${i.origin} i\xE7inde ge\xE7ersiz anahtar`
				case "invalid_union":
					return "Ge\xE7ersiz de\u011Fer"
				case "invalid_element":
					return `${i.origin} i\xE7inde ge\xE7ersiz de\u011Fer`
				default:
					return "Ge\xE7ersiz de\u011Fer"
			}
		}
	}
function jc() {
	return { localeError: Xl() }
}
var Yl = () => {
	const t = {
		string: { unit: "\u0441\u0438\u043C\u0432\u043E\u043B\u0456\u0432", verb: "\u043C\u0430\u0442\u0438\u043C\u0435" },
		file: { unit: "\u0431\u0430\u0439\u0442\u0456\u0432", verb: "\u043C\u0430\u0442\u0438\u043C\u0435" },
		array: {
			unit: "\u0435\u043B\u0435\u043C\u0435\u043D\u0442\u0456\u0432",
			verb: "\u043C\u0430\u0442\u0438\u043C\u0435",
		},
		set: {
			unit: "\u0435\u043B\u0435\u043C\u0435\u043D\u0442\u0456\u0432",
			verb: "\u043C\u0430\u0442\u0438\u043C\u0435",
		},
	}
	function r(e) {
		return t[e] ?? null
	}
	const n = (e) => {
			const o = typeof e
			switch (o) {
				case "number":
					return Number.isNaN(e) ? "NaN" : "\u0447\u0438\u0441\u043B\u043E"
				case "object": {
					if (Array.isArray(e)) return "\u043C\u0430\u0441\u0438\u0432"
					if (e === null) return "null"
					if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name
				}
			}
			return o
		},
		i = {
			regex: "\u0432\u0445\u0456\u0434\u043D\u0456 \u0434\u0430\u043D\u0456",
			email:
				"\u0430\u0434\u0440\u0435\u0441\u0430 \u0435\u043B\u0435\u043A\u0442\u0440\u043E\u043D\u043D\u043E\u0457 \u043F\u043E\u0448\u0442\u0438",
			url: "URL",
			emoji: "\u0435\u043C\u043E\u0434\u0437\u0456",
			uuid: "UUID",
			uuidv4: "UUIDv4",
			uuidv6: "UUIDv6",
			nanoid: "nanoid",
			guid: "GUID",
			cuid: "cuid",
			cuid2: "cuid2",
			ulid: "ULID",
			xid: "XID",
			ksuid: "KSUID",
			datetime: "\u0434\u0430\u0442\u0430 \u0442\u0430 \u0447\u0430\u0441 ISO",
			date: "\u0434\u0430\u0442\u0430 ISO",
			time: "\u0447\u0430\u0441 ISO",
			duration: "\u0442\u0440\u0438\u0432\u0430\u043B\u0456\u0441\u0442\u044C ISO",
			ipv4: "\u0430\u0434\u0440\u0435\u0441\u0430 IPv4",
			ipv6: "\u0430\u0434\u0440\u0435\u0441\u0430 IPv6",
			cidrv4: "\u0434\u0456\u0430\u043F\u0430\u0437\u043E\u043D IPv4",
			cidrv6: "\u0434\u0456\u0430\u043F\u0430\u0437\u043E\u043D IPv6",
			base64: "\u0440\u044F\u0434\u043E\u043A \u0443 \u043A\u043E\u0434\u0443\u0432\u0430\u043D\u043D\u0456 base64",
			base64url:
				"\u0440\u044F\u0434\u043E\u043A \u0443 \u043A\u043E\u0434\u0443\u0432\u0430\u043D\u043D\u0456 base64url",
			json_string: "\u0440\u044F\u0434\u043E\u043A JSON",
			e164: "\u043D\u043E\u043C\u0435\u0440 E.164",
			jwt: "JWT",
			template_literal: "\u0432\u0445\u0456\u0434\u043D\u0456 \u0434\u0430\u043D\u0456",
		}
	return (e) => {
		switch (e.code) {
			case "invalid_type":
				return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0456 \u0432\u0445\u0456\u0434\u043D\u0456 \u0434\u0430\u043D\u0456: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F ${e.expected}, \u043E\u0442\u0440\u0438\u043C\u0430\u043D\u043E ${n(e.input)}`
			case "invalid_value":
				return e.values.length === 1
					? `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0456 \u0432\u0445\u0456\u0434\u043D\u0456 \u0434\u0430\u043D\u0456: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F ${_(e.values[0])}`
					: `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0430 \u043E\u043F\u0446\u0456\u044F: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F \u043E\u0434\u043D\u0435 \u0437 ${f(e.values, "|")}`
			case "too_big": {
				const o = e.inclusive ? "<=" : "<",
					a = r(e.origin)
				return a
					? `\u0417\u0430\u043D\u0430\u0434\u0442\u043E \u0432\u0435\u043B\u0438\u043A\u0435: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F, \u0449\u043E ${e.origin ?? "\u0437\u043D\u0430\u0447\u0435\u043D\u043D\u044F"} ${a.verb} ${o}${e.maximum.toString()} ${a.unit ?? "\u0435\u043B\u0435\u043C\u0435\u043D\u0442\u0456\u0432"}`
					: `\u0417\u0430\u043D\u0430\u0434\u0442\u043E \u0432\u0435\u043B\u0438\u043A\u0435: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F, \u0449\u043E ${e.origin ?? "\u0437\u043D\u0430\u0447\u0435\u043D\u043D\u044F"} \u0431\u0443\u0434\u0435 ${o}${e.maximum.toString()}`
			}
			case "too_small": {
				const o = e.inclusive ? ">=" : ">",
					a = r(e.origin)
				return a
					? `\u0417\u0430\u043D\u0430\u0434\u0442\u043E \u043C\u0430\u043B\u0435: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F, \u0449\u043E ${e.origin} ${a.verb} ${o}${e.minimum.toString()} ${a.unit}`
					: `\u0417\u0430\u043D\u0430\u0434\u0442\u043E \u043C\u0430\u043B\u0435: \u043E\u0447\u0456\u043A\u0443\u0454\u0442\u044C\u0441\u044F, \u0449\u043E ${e.origin} \u0431\u0443\u0434\u0435 ${o}${e.minimum.toString()}`
			}
			case "invalid_format": {
				const o = e
				return o.format === "starts_with"
					? `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0438\u0439 \u0440\u044F\u0434\u043E\u043A: \u043F\u043E\u0432\u0438\u043D\u0435\u043D \u043F\u043E\u0447\u0438\u043D\u0430\u0442\u0438\u0441\u044F \u0437 "${o.prefix}"`
					: o.format === "ends_with"
						? `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0438\u0439 \u0440\u044F\u0434\u043E\u043A: \u043F\u043E\u0432\u0438\u043D\u0435\u043D \u0437\u0430\u043A\u0456\u043D\u0447\u0443\u0432\u0430\u0442\u0438\u0441\u044F \u043D\u0430 "${o.suffix}"`
						: o.format === "includes"
							? `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0438\u0439 \u0440\u044F\u0434\u043E\u043A: \u043F\u043E\u0432\u0438\u043D\u0435\u043D \u043C\u0456\u0441\u0442\u0438\u0442\u0438 "${o.includes}"`
							: o.format === "regex"
								? `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0438\u0439 \u0440\u044F\u0434\u043E\u043A: \u043F\u043E\u0432\u0438\u043D\u0435\u043D \u0432\u0456\u0434\u043F\u043E\u0432\u0456\u0434\u0430\u0442\u0438 \u0448\u0430\u0431\u043B\u043E\u043D\u0443 ${o.pattern}`
								: `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0438\u0439 ${i[o.format] ?? e.format}`
			}
			case "not_multiple_of":
				return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0435 \u0447\u0438\u0441\u043B\u043E: \u043F\u043E\u0432\u0438\u043D\u043D\u043E \u0431\u0443\u0442\u0438 \u043A\u0440\u0430\u0442\u043D\u0438\u043C ${e.divisor}`
			case "unrecognized_keys":
				return `\u041D\u0435\u0440\u043E\u0437\u043F\u0456\u0437\u043D\u0430\u043D\u0438\u0439 \u043A\u043B\u044E\u0447${e.keys.length > 1 ? "\u0456" : ""}: ${f(e.keys, ", ")}`
			case "invalid_key":
				return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0438\u0439 \u043A\u043B\u044E\u0447 \u0443 ${e.origin}`
			case "invalid_union":
				return "\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0456 \u0432\u0445\u0456\u0434\u043D\u0456 \u0434\u0430\u043D\u0456"
			case "invalid_element":
				return `\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0435 \u0437\u043D\u0430\u0447\u0435\u043D\u043D\u044F \u0443 ${e.origin}`
			default:
				return "\u041D\u0435\u043F\u0440\u0430\u0432\u0438\u043B\u044C\u043D\u0456 \u0432\u0445\u0456\u0434\u043D\u0456 \u0434\u0430\u043D\u0456"
		}
	}
}
function Pc() {
	return { localeError: Yl() }
}
var em = () => {
	const t = {
		string: { unit: "\u062D\u0631\u0648\u0641", verb: "\u06C1\u0648\u0646\u0627" },
		file: { unit: "\u0628\u0627\u0626\u0679\u0633", verb: "\u06C1\u0648\u0646\u0627" },
		array: { unit: "\u0622\u0626\u0679\u0645\u0632", verb: "\u06C1\u0648\u0646\u0627" },
		set: { unit: "\u0622\u0626\u0679\u0645\u0632", verb: "\u06C1\u0648\u0646\u0627" },
	}
	function r(e) {
		return t[e] ?? null
	}
	const n = (e) => {
			const o = typeof e
			switch (o) {
				case "number":
					return Number.isNaN(e) ? "NaN" : "\u0646\u0645\u0628\u0631"
				case "object": {
					if (Array.isArray(e)) return "\u0622\u0631\u06D2"
					if (e === null) return "\u0646\u0644"
					if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name
				}
			}
			return o
		},
		i = {
			regex: "\u0627\u0646 \u067E\u0679",
			email: "\u0627\u06CC \u0645\u06CC\u0644 \u0627\u06CC\u0688\u0631\u06CC\u0633",
			url: "\u06CC\u0648 \u0622\u0631 \u0627\u06CC\u0644",
			emoji: "\u0627\u06CC\u0645\u0648\u062C\u06CC",
			uuid: "\u06CC\u0648 \u06CC\u0648 \u0622\u0626\u06CC \u0688\u06CC",
			uuidv4: "\u06CC\u0648 \u06CC\u0648 \u0622\u0626\u06CC \u0688\u06CC \u0648\u06CC 4",
			uuidv6: "\u06CC\u0648 \u06CC\u0648 \u0622\u0626\u06CC \u0688\u06CC \u0648\u06CC 6",
			nanoid: "\u0646\u06CC\u0646\u0648 \u0622\u0626\u06CC \u0688\u06CC",
			guid: "\u062C\u06CC \u06CC\u0648 \u0622\u0626\u06CC \u0688\u06CC",
			cuid: "\u0633\u06CC \u06CC\u0648 \u0622\u0626\u06CC \u0688\u06CC",
			cuid2: "\u0633\u06CC \u06CC\u0648 \u0622\u0626\u06CC \u0688\u06CC 2",
			ulid: "\u06CC\u0648 \u0627\u06CC\u0644 \u0622\u0626\u06CC \u0688\u06CC",
			xid: "\u0627\u06CC\u06A9\u0633 \u0622\u0626\u06CC \u0688\u06CC",
			ksuid: "\u06A9\u06D2 \u0627\u06CC\u0633 \u06CC\u0648 \u0622\u0626\u06CC \u0688\u06CC",
			datetime: "\u0622\u0626\u06CC \u0627\u06CC\u0633 \u0627\u0648 \u0688\u06CC\u0679 \u0679\u0627\u0626\u0645",
			date: "\u0622\u0626\u06CC \u0627\u06CC\u0633 \u0627\u0648 \u062A\u0627\u0631\u06CC\u062E",
			time: "\u0622\u0626\u06CC \u0627\u06CC\u0633 \u0627\u0648 \u0648\u0642\u062A",
			duration: "\u0622\u0626\u06CC \u0627\u06CC\u0633 \u0627\u0648 \u0645\u062F\u062A",
			ipv4: "\u0622\u0626\u06CC \u067E\u06CC \u0648\u06CC 4 \u0627\u06CC\u0688\u0631\u06CC\u0633",
			ipv6: "\u0622\u0626\u06CC \u067E\u06CC \u0648\u06CC 6 \u0627\u06CC\u0688\u0631\u06CC\u0633",
			cidrv4: "\u0622\u0626\u06CC \u067E\u06CC \u0648\u06CC 4 \u0631\u06CC\u0646\u062C",
			cidrv6: "\u0622\u0626\u06CC \u067E\u06CC \u0648\u06CC 6 \u0631\u06CC\u0646\u062C",
			base64: "\u0628\u06CC\u0633 64 \u0627\u0646 \u06A9\u0648\u0688\u0688 \u0633\u0679\u0631\u0646\u06AF",
			base64url:
				"\u0628\u06CC\u0633 64 \u06CC\u0648 \u0622\u0631 \u0627\u06CC\u0644 \u0627\u0646 \u06A9\u0648\u0688\u0688 \u0633\u0679\u0631\u0646\u06AF",
			json_string: "\u062C\u06D2 \u0627\u06CC\u0633 \u0627\u0648 \u0627\u06CC\u0646 \u0633\u0679\u0631\u0646\u06AF",
			e164: "\u0627\u06CC 164 \u0646\u0645\u0628\u0631",
			jwt: "\u062C\u06D2 \u0688\u0628\u0644\u06CC\u0648 \u0679\u06CC",
			template_literal: "\u0627\u0646 \u067E\u0679",
		}
	return (e) => {
		switch (e.code) {
			case "invalid_type":
				return `\u063A\u0644\u0637 \u0627\u0646 \u067E\u0679: ${e.expected} \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u0627\u060C ${n(e.input)} \u0645\u0648\u0635\u0648\u0644 \u06C1\u0648\u0627`
			case "invalid_value":
				return e.values.length === 1
					? `\u063A\u0644\u0637 \u0627\u0646 \u067E\u0679: ${_(e.values[0])} \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u0627`
					: `\u063A\u0644\u0637 \u0622\u067E\u0634\u0646: ${f(e.values, "|")} \u0645\u06CC\u06BA \u0633\u06D2 \u0627\u06CC\u06A9 \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u0627`
			case "too_big": {
				const o = e.inclusive ? "<=" : "<",
					a = r(e.origin)
				return a
					? `\u0628\u06C1\u062A \u0628\u0691\u0627: ${e.origin ?? "\u0648\u06CC\u0644\u06CC\u0648"} \u06A9\u06D2 ${o}${e.maximum.toString()} ${a.unit ?? "\u0639\u0646\u0627\u0635\u0631"} \u06C1\u0648\u0646\u06D2 \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u06D2`
					: `\u0628\u06C1\u062A \u0628\u0691\u0627: ${e.origin ?? "\u0648\u06CC\u0644\u06CC\u0648"} \u06A9\u0627 ${o}${e.maximum.toString()} \u06C1\u0648\u0646\u0627 \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u0627`
			}
			case "too_small": {
				const o = e.inclusive ? ">=" : ">",
					a = r(e.origin)
				return a
					? `\u0628\u06C1\u062A \u0686\u06BE\u0648\u0679\u0627: ${e.origin} \u06A9\u06D2 ${o}${e.minimum.toString()} ${a.unit} \u06C1\u0648\u0646\u06D2 \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u06D2`
					: `\u0628\u06C1\u062A \u0686\u06BE\u0648\u0679\u0627: ${e.origin} \u06A9\u0627 ${o}${e.minimum.toString()} \u06C1\u0648\u0646\u0627 \u0645\u062A\u0648\u0642\u0639 \u062A\u06BE\u0627`
			}
			case "invalid_format": {
				const o = e
				return o.format === "starts_with"
					? `\u063A\u0644\u0637 \u0633\u0679\u0631\u0646\u06AF: "${o.prefix}" \u0633\u06D2 \u0634\u0631\u0648\u0639 \u06C1\u0648\u0646\u0627 \u0686\u0627\u06C1\u06CC\u06D2`
					: o.format === "ends_with"
						? `\u063A\u0644\u0637 \u0633\u0679\u0631\u0646\u06AF: "${o.suffix}" \u067E\u0631 \u062E\u062A\u0645 \u06C1\u0648\u0646\u0627 \u0686\u0627\u06C1\u06CC\u06D2`
						: o.format === "includes"
							? `\u063A\u0644\u0637 \u0633\u0679\u0631\u0646\u06AF: "${o.includes}" \u0634\u0627\u0645\u0644 \u06C1\u0648\u0646\u0627 \u0686\u0627\u06C1\u06CC\u06D2`
							: o.format === "regex"
								? `\u063A\u0644\u0637 \u0633\u0679\u0631\u0646\u06AF: \u067E\u06CC\u0679\u0631\u0646 ${o.pattern} \u0633\u06D2 \u0645\u06CC\u0686 \u06C1\u0648\u0646\u0627 \u0686\u0627\u06C1\u06CC\u06D2`
								: `\u063A\u0644\u0637 ${i[o.format] ?? e.format}`
			}
			case "not_multiple_of":
				return `\u063A\u0644\u0637 \u0646\u0645\u0628\u0631: ${e.divisor} \u06A9\u0627 \u0645\u0636\u0627\u0639\u0641 \u06C1\u0648\u0646\u0627 \u0686\u0627\u06C1\u06CC\u06D2`
			case "unrecognized_keys":
				return `\u063A\u06CC\u0631 \u062A\u0633\u0644\u06CC\u0645 \u0634\u062F\u06C1 \u06A9\u06CC${e.keys.length > 1 ? "\u0632" : ""}: ${f(e.keys, "\u060C ")}`
			case "invalid_key":
				return `${e.origin} \u0645\u06CC\u06BA \u063A\u0644\u0637 \u06A9\u06CC`
			case "invalid_union":
				return "\u063A\u0644\u0637 \u0627\u0646 \u067E\u0679"
			case "invalid_element":
				return `${e.origin} \u0645\u06CC\u06BA \u063A\u0644\u0637 \u0648\u06CC\u0644\u06CC\u0648`
			default:
				return "\u063A\u0644\u0637 \u0627\u0646 \u067E\u0679"
		}
	}
}
function Tc() {
	return { localeError: em() }
}
var tm = () => {
	const t = {
		string: { unit: "k\xFD t\u1EF1", verb: "c\xF3" },
		file: { unit: "byte", verb: "c\xF3" },
		array: { unit: "ph\u1EA7n t\u1EED", verb: "c\xF3" },
		set: { unit: "ph\u1EA7n t\u1EED", verb: "c\xF3" },
	}
	function r(e) {
		return t[e] ?? null
	}
	const n = (e) => {
			const o = typeof e
			switch (o) {
				case "number":
					return Number.isNaN(e) ? "NaN" : "s\u1ED1"
				case "object": {
					if (Array.isArray(e)) return "m\u1EA3ng"
					if (e === null) return "null"
					if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name
				}
			}
			return o
		},
		i = {
			regex: "\u0111\u1EA7u v\xE0o",
			email: "\u0111\u1ECBa ch\u1EC9 email",
			url: "URL",
			emoji: "emoji",
			uuid: "UUID",
			uuidv4: "UUIDv4",
			uuidv6: "UUIDv6",
			nanoid: "nanoid",
			guid: "GUID",
			cuid: "cuid",
			cuid2: "cuid2",
			ulid: "ULID",
			xid: "XID",
			ksuid: "KSUID",
			datetime: "ng\xE0y gi\u1EDD ISO",
			date: "ng\xE0y ISO",
			time: "gi\u1EDD ISO",
			duration: "kho\u1EA3ng th\u1EDDi gian ISO",
			ipv4: "\u0111\u1ECBa ch\u1EC9 IPv4",
			ipv6: "\u0111\u1ECBa ch\u1EC9 IPv6",
			cidrv4: "d\u1EA3i IPv4",
			cidrv6: "d\u1EA3i IPv6",
			base64: "chu\u1ED7i m\xE3 h\xF3a base64",
			base64url: "chu\u1ED7i m\xE3 h\xF3a base64url",
			json_string: "chu\u1ED7i JSON",
			e164: "s\u1ED1 E.164",
			jwt: "JWT",
			template_literal: "\u0111\u1EA7u v\xE0o",
		}
	return (e) => {
		switch (e.code) {
			case "invalid_type":
				return `\u0110\u1EA7u v\xE0o kh\xF4ng h\u1EE3p l\u1EC7: mong \u0111\u1EE3i ${e.expected}, nh\u1EADn \u0111\u01B0\u1EE3c ${n(e.input)}`
			case "invalid_value":
				return e.values.length === 1
					? `\u0110\u1EA7u v\xE0o kh\xF4ng h\u1EE3p l\u1EC7: mong \u0111\u1EE3i ${_(e.values[0])}`
					: `T\xF9y ch\u1ECDn kh\xF4ng h\u1EE3p l\u1EC7: mong \u0111\u1EE3i m\u1ED9t trong c\xE1c gi\xE1 tr\u1ECB ${f(e.values, "|")}`
			case "too_big": {
				const o = e.inclusive ? "<=" : "<",
					a = r(e.origin)
				return a
					? `Qu\xE1 l\u1EDBn: mong \u0111\u1EE3i ${e.origin ?? "gi\xE1 tr\u1ECB"} ${a.verb} ${o}${e.maximum.toString()} ${a.unit ?? "ph\u1EA7n t\u1EED"}`
					: `Qu\xE1 l\u1EDBn: mong \u0111\u1EE3i ${e.origin ?? "gi\xE1 tr\u1ECB"} ${o}${e.maximum.toString()}`
			}
			case "too_small": {
				const o = e.inclusive ? ">=" : ">",
					a = r(e.origin)
				return a
					? `Qu\xE1 nh\u1ECF: mong \u0111\u1EE3i ${e.origin} ${a.verb} ${o}${e.minimum.toString()} ${a.unit}`
					: `Qu\xE1 nh\u1ECF: mong \u0111\u1EE3i ${e.origin} ${o}${e.minimum.toString()}`
			}
			case "invalid_format": {
				const o = e
				return o.format === "starts_with"
					? `Chu\u1ED7i kh\xF4ng h\u1EE3p l\u1EC7: ph\u1EA3i b\u1EAFt \u0111\u1EA7u b\u1EB1ng "${o.prefix}"`
					: o.format === "ends_with"
						? `Chu\u1ED7i kh\xF4ng h\u1EE3p l\u1EC7: ph\u1EA3i k\u1EBFt th\xFAc b\u1EB1ng "${o.suffix}"`
						: o.format === "includes"
							? `Chu\u1ED7i kh\xF4ng h\u1EE3p l\u1EC7: ph\u1EA3i bao g\u1ED3m "${o.includes}"`
							: o.format === "regex"
								? `Chu\u1ED7i kh\xF4ng h\u1EE3p l\u1EC7: ph\u1EA3i kh\u1EDBp v\u1EDBi m\u1EABu ${o.pattern}`
								: `${i[o.format] ?? e.format} kh\xF4ng h\u1EE3p l\u1EC7`
			}
			case "not_multiple_of":
				return `S\u1ED1 kh\xF4ng h\u1EE3p l\u1EC7: ph\u1EA3i l\xE0 b\u1ED9i s\u1ED1 c\u1EE7a ${e.divisor}`
			case "unrecognized_keys":
				return `Kh\xF3a kh\xF4ng \u0111\u01B0\u1EE3c nh\u1EADn d\u1EA1ng: ${f(e.keys, ", ")}`
			case "invalid_key":
				return `Kh\xF3a kh\xF4ng h\u1EE3p l\u1EC7 trong ${e.origin}`
			case "invalid_union":
				return "\u0110\u1EA7u v\xE0o kh\xF4ng h\u1EE3p l\u1EC7"
			case "invalid_element":
				return `Gi\xE1 tr\u1ECB kh\xF4ng h\u1EE3p l\u1EC7 trong ${e.origin}`
			default:
				return "\u0110\u1EA7u v\xE0o kh\xF4ng h\u1EE3p l\u1EC7"
		}
	}
}
function Oc() {
	return { localeError: tm() }
}
var rm = () => {
	const t = {
		string: { unit: "\u5B57\u7B26", verb: "\u5305\u542B" },
		file: { unit: "\u5B57\u8282", verb: "\u5305\u542B" },
		array: { unit: "\u9879", verb: "\u5305\u542B" },
		set: { unit: "\u9879", verb: "\u5305\u542B" },
	}
	function r(e) {
		return t[e] ?? null
	}
	const n = (e) => {
			const o = typeof e
			switch (o) {
				case "number":
					return Number.isNaN(e) ? "\u975E\u6570\u5B57(NaN)" : "\u6570\u5B57"
				case "object": {
					if (Array.isArray(e)) return "\u6570\u7EC4"
					if (e === null) return "\u7A7A\u503C(null)"
					if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name
				}
			}
			return o
		},
		i = {
			regex: "\u8F93\u5165",
			email: "\u7535\u5B50\u90AE\u4EF6",
			url: "URL",
			emoji: "\u8868\u60C5\u7B26\u53F7",
			uuid: "UUID",
			uuidv4: "UUIDv4",
			uuidv6: "UUIDv6",
			nanoid: "nanoid",
			guid: "GUID",
			cuid: "cuid",
			cuid2: "cuid2",
			ulid: "ULID",
			xid: "XID",
			ksuid: "KSUID",
			datetime: "ISO\u65E5\u671F\u65F6\u95F4",
			date: "ISO\u65E5\u671F",
			time: "ISO\u65F6\u95F4",
			duration: "ISO\u65F6\u957F",
			ipv4: "IPv4\u5730\u5740",
			ipv6: "IPv6\u5730\u5740",
			cidrv4: "IPv4\u7F51\u6BB5",
			cidrv6: "IPv6\u7F51\u6BB5",
			base64: "base64\u7F16\u7801\u5B57\u7B26\u4E32",
			base64url: "base64url\u7F16\u7801\u5B57\u7B26\u4E32",
			json_string: "JSON\u5B57\u7B26\u4E32",
			e164: "E.164\u53F7\u7801",
			jwt: "JWT",
			template_literal: "\u8F93\u5165",
		}
	return (e) => {
		switch (e.code) {
			case "invalid_type":
				return `\u65E0\u6548\u8F93\u5165\uFF1A\u671F\u671B ${e.expected}\uFF0C\u5B9E\u9645\u63A5\u6536 ${n(e.input)}`
			case "invalid_value":
				return e.values.length === 1
					? `\u65E0\u6548\u8F93\u5165\uFF1A\u671F\u671B ${_(e.values[0])}`
					: `\u65E0\u6548\u9009\u9879\uFF1A\u671F\u671B\u4EE5\u4E0B\u4E4B\u4E00 ${f(e.values, "|")}`
			case "too_big": {
				const o = e.inclusive ? "<=" : "<",
					a = r(e.origin)
				return a
					? `\u6570\u503C\u8FC7\u5927\uFF1A\u671F\u671B ${e.origin ?? "\u503C"} ${o}${e.maximum.toString()} ${a.unit ?? "\u4E2A\u5143\u7D20"}`
					: `\u6570\u503C\u8FC7\u5927\uFF1A\u671F\u671B ${e.origin ?? "\u503C"} ${o}${e.maximum.toString()}`
			}
			case "too_small": {
				const o = e.inclusive ? ">=" : ">",
					a = r(e.origin)
				return a
					? `\u6570\u503C\u8FC7\u5C0F\uFF1A\u671F\u671B ${e.origin} ${o}${e.minimum.toString()} ${a.unit}`
					: `\u6570\u503C\u8FC7\u5C0F\uFF1A\u671F\u671B ${e.origin} ${o}${e.minimum.toString()}`
			}
			case "invalid_format": {
				const o = e
				return o.format === "starts_with"
					? `\u65E0\u6548\u5B57\u7B26\u4E32\uFF1A\u5FC5\u987B\u4EE5 "${o.prefix}" \u5F00\u5934`
					: o.format === "ends_with"
						? `\u65E0\u6548\u5B57\u7B26\u4E32\uFF1A\u5FC5\u987B\u4EE5 "${o.suffix}" \u7ED3\u5C3E`
						: o.format === "includes"
							? `\u65E0\u6548\u5B57\u7B26\u4E32\uFF1A\u5FC5\u987B\u5305\u542B "${o.includes}"`
							: o.format === "regex"
								? `\u65E0\u6548\u5B57\u7B26\u4E32\uFF1A\u5FC5\u987B\u6EE1\u8DB3\u6B63\u5219\u8868\u8FBE\u5F0F ${o.pattern}`
								: `\u65E0\u6548${i[o.format] ?? e.format}`
			}
			case "not_multiple_of":
				return `\u65E0\u6548\u6570\u5B57\uFF1A\u5FC5\u987B\u662F ${e.divisor} \u7684\u500D\u6570`
			case "unrecognized_keys":
				return `\u51FA\u73B0\u672A\u77E5\u7684\u952E(key): ${f(e.keys, ", ")}`
			case "invalid_key":
				return `${e.origin} \u4E2D\u7684\u952E(key)\u65E0\u6548`
			case "invalid_union":
				return "\u65E0\u6548\u8F93\u5165"
			case "invalid_element":
				return `${e.origin} \u4E2D\u5305\u542B\u65E0\u6548\u503C(value)`
			default:
				return "\u65E0\u6548\u8F93\u5165"
		}
	}
}
function Nc() {
	return { localeError: rm() }
}
var nm = () => {
	const t = {
		string: { unit: "\u5B57\u5143", verb: "\u64C1\u6709" },
		file: { unit: "\u4F4D\u5143\u7D44", verb: "\u64C1\u6709" },
		array: { unit: "\u9805\u76EE", verb: "\u64C1\u6709" },
		set: { unit: "\u9805\u76EE", verb: "\u64C1\u6709" },
	}
	function r(e) {
		return t[e] ?? null
	}
	const n = (e) => {
			const o = typeof e
			switch (o) {
				case "number":
					return Number.isNaN(e) ? "NaN" : "number"
				case "object": {
					if (Array.isArray(e)) return "array"
					if (e === null) return "null"
					if (Object.getPrototypeOf(e) !== Object.prototype && e.constructor) return e.constructor.name
				}
			}
			return o
		},
		i = {
			regex: "\u8F38\u5165",
			email: "\u90F5\u4EF6\u5730\u5740",
			url: "URL",
			emoji: "emoji",
			uuid: "UUID",
			uuidv4: "UUIDv4",
			uuidv6: "UUIDv6",
			nanoid: "nanoid",
			guid: "GUID",
			cuid: "cuid",
			cuid2: "cuid2",
			ulid: "ULID",
			xid: "XID",
			ksuid: "KSUID",
			datetime: "ISO \u65E5\u671F\u6642\u9593",
			date: "ISO \u65E5\u671F",
			time: "ISO \u6642\u9593",
			duration: "ISO \u671F\u9593",
			ipv4: "IPv4 \u4F4D\u5740",
			ipv6: "IPv6 \u4F4D\u5740",
			cidrv4: "IPv4 \u7BC4\u570D",
			cidrv6: "IPv6 \u7BC4\u570D",
			base64: "base64 \u7DE8\u78BC\u5B57\u4E32",
			base64url: "base64url \u7DE8\u78BC\u5B57\u4E32",
			json_string: "JSON \u5B57\u4E32",
			e164: "E.164 \u6578\u503C",
			jwt: "JWT",
			template_literal: "\u8F38\u5165",
		}
	return (e) => {
		switch (e.code) {
			case "invalid_type":
				return `\u7121\u6548\u7684\u8F38\u5165\u503C\uFF1A\u9810\u671F\u70BA ${e.expected}\uFF0C\u4F46\u6536\u5230 ${n(e.input)}`
			case "invalid_value":
				return e.values.length === 1
					? `\u7121\u6548\u7684\u8F38\u5165\u503C\uFF1A\u9810\u671F\u70BA ${_(e.values[0])}`
					: `\u7121\u6548\u7684\u9078\u9805\uFF1A\u9810\u671F\u70BA\u4EE5\u4E0B\u5176\u4E2D\u4E4B\u4E00 ${f(e.values, "|")}`
			case "too_big": {
				const o = e.inclusive ? "<=" : "<",
					a = r(e.origin)
				return a
					? `\u6578\u503C\u904E\u5927\uFF1A\u9810\u671F ${e.origin ?? "\u503C"} \u61C9\u70BA ${o}${e.maximum.toString()} ${a.unit ?? "\u500B\u5143\u7D20"}`
					: `\u6578\u503C\u904E\u5927\uFF1A\u9810\u671F ${e.origin ?? "\u503C"} \u61C9\u70BA ${o}${e.maximum.toString()}`
			}
			case "too_small": {
				const o = e.inclusive ? ">=" : ">",
					a = r(e.origin)
				return a
					? `\u6578\u503C\u904E\u5C0F\uFF1A\u9810\u671F ${e.origin} \u61C9\u70BA ${o}${e.minimum.toString()} ${a.unit}`
					: `\u6578\u503C\u904E\u5C0F\uFF1A\u9810\u671F ${e.origin} \u61C9\u70BA ${o}${e.minimum.toString()}`
			}
			case "invalid_format": {
				const o = e
				return o.format === "starts_with"
					? `\u7121\u6548\u7684\u5B57\u4E32\uFF1A\u5FC5\u9808\u4EE5 "${o.prefix}" \u958B\u982D`
					: o.format === "ends_with"
						? `\u7121\u6548\u7684\u5B57\u4E32\uFF1A\u5FC5\u9808\u4EE5 "${o.suffix}" \u7D50\u5C3E`
						: o.format === "includes"
							? `\u7121\u6548\u7684\u5B57\u4E32\uFF1A\u5FC5\u9808\u5305\u542B "${o.includes}"`
							: o.format === "regex"
								? `\u7121\u6548\u7684\u5B57\u4E32\uFF1A\u5FC5\u9808\u7B26\u5408\u683C\u5F0F ${o.pattern}`
								: `\u7121\u6548\u7684 ${i[o.format] ?? e.format}`
			}
			case "not_multiple_of":
				return `\u7121\u6548\u7684\u6578\u5B57\uFF1A\u5FC5\u9808\u70BA ${e.divisor} \u7684\u500D\u6578`
			case "unrecognized_keys":
				return `\u7121\u6CD5\u8B58\u5225\u7684\u9375\u503C${e.keys.length > 1 ? "\u5011" : ""}\uFF1A${f(e.keys, "\u3001")}`
			case "invalid_key":
				return `${e.origin} \u4E2D\u6709\u7121\u6548\u7684\u9375\u503C`
			case "invalid_union":
				return "\u7121\u6548\u7684\u8F38\u5165\u503C"
			case "invalid_element":
				return `${e.origin} \u4E2D\u6709\u7121\u6548\u7684\u503C`
			default:
				return "\u7121\u6548\u7684\u8F38\u5165\u503C"
		}
	}
}
function Uc() {
	return { localeError: nm() }
}
var ki = Symbol("ZodOutput"),
	Si = Symbol("ZodInput"),
	Ae = class {
		constructor() {
			;(this._map = new Map()), (this._idmap = new Map())
		}
		add(r, ...n) {
			const i = n[0]
			if ((this._map.set(r, i), i && typeof i == "object" && "id" in i)) {
				if (this._idmap.has(i.id)) throw new Error(`ID ${i.id} already exists in the registry`)
				this._idmap.set(i.id, r)
			}
			return this
		}
		clear() {
			return (this._map = new Map()), (this._idmap = new Map()), this
		}
		remove(r) {
			const n = this._map.get(r)
			return n && typeof n == "object" && "id" in n && this._idmap.delete(n.id), this._map.delete(r), this
		}
		get(r) {
			const n = r._zod.parent
			if (n) {
				const i = { ...(this.get(n) ?? {}) }
				return delete i.id, { ...i, ...this._map.get(r) }
			}
			return this._map.get(r)
		}
		has(r) {
			return this._map.has(r)
		}
	}
function mr() {
	return new Ae()
}
var ce = mr()
function wi(t, r) {
	return new t({ type: "string", ...v(r) })
}
function Ii(t, r) {
	return new t({ type: "string", coerce: !0, ...v(r) })
}
function pr(t, r) {
	return new t({ type: "string", format: "email", check: "string_format", abort: !1, ...v(r) })
}
function ht(t, r) {
	return new t({ type: "string", format: "guid", check: "string_format", abort: !1, ...v(r) })
}
function dr(t, r) {
	return new t({ type: "string", format: "uuid", check: "string_format", abort: !1, ...v(r) })
}
function fr(t, r) {
	return new t({ type: "string", format: "uuid", check: "string_format", abort: !1, version: "v4", ...v(r) })
}
function gr(t, r) {
	return new t({ type: "string", format: "uuid", check: "string_format", abort: !1, version: "v6", ...v(r) })
}
function hr(t, r) {
	return new t({ type: "string", format: "uuid", check: "string_format", abort: !1, version: "v7", ...v(r) })
}
function vr(t, r) {
	return new t({ type: "string", format: "url", check: "string_format", abort: !1, ...v(r) })
}
function br(t, r) {
	return new t({ type: "string", format: "emoji", check: "string_format", abort: !1, ...v(r) })
}
function _r(t, r) {
	return new t({ type: "string", format: "nanoid", check: "string_format", abort: !1, ...v(r) })
}
function yr(t, r) {
	return new t({ type: "string", format: "cuid", check: "string_format", abort: !1, ...v(r) })
}
function $r(t, r) {
	return new t({ type: "string", format: "cuid2", check: "string_format", abort: !1, ...v(r) })
}
function xr(t, r) {
	return new t({ type: "string", format: "ulid", check: "string_format", abort: !1, ...v(r) })
}
function zr(t, r) {
	return new t({ type: "string", format: "xid", check: "string_format", abort: !1, ...v(r) })
}
function kr(t, r) {
	return new t({ type: "string", format: "ksuid", check: "string_format", abort: !1, ...v(r) })
}
function Sr(t, r) {
	return new t({ type: "string", format: "ipv4", check: "string_format", abort: !1, ...v(r) })
}
function wr(t, r) {
	return new t({ type: "string", format: "ipv6", check: "string_format", abort: !1, ...v(r) })
}
function Ir(t, r) {
	return new t({ type: "string", format: "cidrv4", check: "string_format", abort: !1, ...v(r) })
}
function jr(t, r) {
	return new t({ type: "string", format: "cidrv6", check: "string_format", abort: !1, ...v(r) })
}
function Pr(t, r) {
	return new t({ type: "string", format: "base64", check: "string_format", abort: !1, ...v(r) })
}
function Tr(t, r) {
	return new t({ type: "string", format: "base64url", check: "string_format", abort: !1, ...v(r) })
}
function Or(t, r) {
	return new t({ type: "string", format: "e164", check: "string_format", abort: !1, ...v(r) })
}
function Nr(t, r) {
	return new t({ type: "string", format: "jwt", check: "string_format", abort: !1, ...v(r) })
}
var ji = { Any: null, Minute: -1, Second: 0, Millisecond: 3, Microsecond: 6 }
function Pi(t, r) {
	return new t({
		type: "string",
		format: "datetime",
		check: "string_format",
		offset: !1,
		local: !1,
		precision: null,
		...v(r),
	})
}
function Ti(t, r) {
	return new t({ type: "string", format: "date", check: "string_format", ...v(r) })
}
function Oi(t, r) {
	return new t({ type: "string", format: "time", check: "string_format", precision: null, ...v(r) })
}
function Ni(t, r) {
	return new t({ type: "string", format: "duration", check: "string_format", ...v(r) })
}
function Ui(t, r) {
	return new t({ type: "number", checks: [], ...v(r) })
}
function Zi(t, r) {
	return new t({ type: "number", coerce: !0, checks: [], ...v(r) })
}
function Di(t, r) {
	return new t({ type: "number", check: "number_format", abort: !1, format: "safeint", ...v(r) })
}
function Ri(t, r) {
	return new t({ type: "number", check: "number_format", abort: !1, format: "float32", ...v(r) })
}
function Ei(t, r) {
	return new t({ type: "number", check: "number_format", abort: !1, format: "float64", ...v(r) })
}
function Ai(t, r) {
	return new t({ type: "number", check: "number_format", abort: !1, format: "int32", ...v(r) })
}
function Ci(t, r) {
	return new t({ type: "number", check: "number_format", abort: !1, format: "uint32", ...v(r) })
}
function Li(t, r) {
	return new t({ type: "boolean", ...v(r) })
}
function Mi(t, r) {
	return new t({ type: "boolean", coerce: !0, ...v(r) })
}
function qi(t, r) {
	return new t({ type: "bigint", ...v(r) })
}
function Vi(t, r) {
	return new t({ type: "bigint", coerce: !0, ...v(r) })
}
function Fi(t, r) {
	return new t({ type: "bigint", check: "bigint_format", abort: !1, format: "int64", ...v(r) })
}
function Hi(t, r) {
	return new t({ type: "bigint", check: "bigint_format", abort: !1, format: "uint64", ...v(r) })
}
function Ji(t, r) {
	return new t({ type: "symbol", ...v(r) })
}
function Bi(t, r) {
	return new t({ type: "undefined", ...v(r) })
}
function Wi(t, r) {
	return new t({ type: "null", ...v(r) })
}
function Gi(t) {
	return new t({ type: "any" })
}
function Ce(t) {
	return new t({ type: "unknown" })
}
function Ki(t, r) {
	return new t({ type: "never", ...v(r) })
}
function Qi(t, r) {
	return new t({ type: "void", ...v(r) })
}
function Xi(t, r) {
	return new t({ type: "date", ...v(r) })
}
function Yi(t, r) {
	return new t({ type: "date", coerce: !0, ...v(r) })
}
function ea(t, r) {
	return new t({ type: "nan", ...v(r) })
}
function le(t, r) {
	return new nr({ check: "less_than", ...v(r), value: t, inclusive: !1 })
}
function oe(t, r) {
	return new nr({ check: "less_than", ...v(r), value: t, inclusive: !0 })
}
function me(t, r) {
	return new or({ check: "greater_than", ...v(r), value: t, inclusive: !1 })
}
function ee(t, r) {
	return new or({ check: "greater_than", ...v(r), value: t, inclusive: !0 })
}
function ta(t) {
	return me(0, t)
}
function ra(t) {
	return le(0, t)
}
function na(t) {
	return oe(0, t)
}
function oa(t) {
	return ee(0, t)
}
function je(t, r) {
	return new to({ check: "multiple_of", ...v(r), value: t })
}
function Le(t, r) {
	return new oo({ check: "max_size", ...v(r), maximum: t })
}
function Pe(t, r) {
	return new io({ check: "min_size", ...v(r), minimum: t })
}
function vt(t, r) {
	return new ao({ check: "size_equals", ...v(r), size: t })
}
function Me(t, r) {
	return new so({ check: "max_length", ...v(r), maximum: t })
}
function ve(t, r) {
	return new co({ check: "min_length", ...v(r), minimum: t })
}
function qe(t, r) {
	return new uo({ check: "length_equals", ...v(r), length: t })
}
function bt(t, r) {
	return new lo({ check: "string_format", format: "regex", ...v(r), pattern: t })
}
function _t(t) {
	return new mo({ check: "string_format", format: "lowercase", ...v(t) })
}
function yt(t) {
	return new po({ check: "string_format", format: "uppercase", ...v(t) })
}
function $t(t, r) {
	return new fo({ check: "string_format", format: "includes", ...v(r), includes: t })
}
function xt(t, r) {
	return new go({ check: "string_format", format: "starts_with", ...v(r), prefix: t })
}
function zt(t, r) {
	return new ho({ check: "string_format", format: "ends_with", ...v(r), suffix: t })
}
function ia(t, r, n) {
	return new vo({ check: "property", property: t, schema: r, ...v(n) })
}
function kt(t, r) {
	return new bo({ check: "mime_type", mime: t, ...v(r) })
}
function pe(t) {
	return new _o({ check: "overwrite", tx: t })
}
function St(t) {
	return pe((r) => r.normalize(t))
}
function wt() {
	return pe((t) => t.trim())
}
function It() {
	return pe((t) => t.toLowerCase())
}
function jt() {
	return pe((t) => t.toUpperCase())
}
function Pt(t, r, n) {
	return new t({ type: "array", element: r, ...v(n) })
}
function om(t, r, n) {
	return new t({ type: "union", options: r, ...v(n) })
}
function im(t, r, n, i) {
	return new t({ type: "union", options: n, discriminator: r, ...v(i) })
}
function am(t, r, n) {
	return new t({ type: "intersection", left: r, right: n })
}
function aa(t, r, n, i) {
	const e = n instanceof j,
		o = e ? i : n,
		a = e ? n : null
	return new t({ type: "tuple", items: r, rest: a, ...v(o) })
}
function sm(t, r, n, i) {
	return new t({ type: "record", keyType: r, valueType: n, ...v(i) })
}
function cm(t, r, n, i) {
	return new t({ type: "map", keyType: r, valueType: n, ...v(i) })
}
function um(t, r, n) {
	return new t({ type: "set", valueType: r, ...v(n) })
}
function lm(t, r, n) {
	const i = Array.isArray(r) ? Object.fromEntries(r.map((e) => [e, e])) : r
	return new t({ type: "enum", entries: i, ...v(n) })
}
function mm(t, r, n) {
	return new t({ type: "enum", entries: r, ...v(n) })
}
function pm(t, r, n) {
	return new t({ type: "literal", values: Array.isArray(r) ? r : [r], ...v(n) })
}
function sa(t, r) {
	return new t({ type: "file", ...v(r) })
}
function dm(t, r) {
	return new t({ type: "transform", transform: r })
}
function fm(t, r) {
	return new t({ type: "optional", innerType: r })
}
function gm(t, r) {
	return new t({ type: "nullable", innerType: r })
}
function hm(t, r, n) {
	return new t({
		type: "default",
		innerType: r,
		get defaultValue() {
			return typeof n == "function" ? n() : n
		},
	})
}
function vm(t, r, n) {
	return new t({ type: "nonoptional", innerType: r, ...v(n) })
}
function bm(t, r) {
	return new t({ type: "success", innerType: r })
}
function _m(t, r, n) {
	return new t({ type: "catch", innerType: r, catchValue: typeof n == "function" ? n : () => n })
}
function ym(t, r, n) {
	return new t({ type: "pipe", in: r, out: n })
}
function $m(t, r) {
	return new t({ type: "readonly", innerType: r })
}
function xm(t, r, n) {
	return new t({ type: "template_literal", parts: r, ...v(n) })
}
function zm(t, r) {
	return new t({ type: "lazy", getter: r })
}
function km(t, r) {
	return new t({ type: "promise", innerType: r })
}
function ca(t, r, n) {
	const i = v(n)
	return i.abort ?? (i.abort = !0), new t({ type: "custom", check: "custom", fn: r, ...i })
}
function ua(t, r, n) {
	return new t({ type: "custom", check: "custom", fn: r, ...v(n) })
}
function la(t, r) {
	let n = v(r),
		i = n.truthy ?? ["true", "1", "yes", "on", "y", "enabled"],
		e = n.falsy ?? ["false", "0", "no", "off", "n", "disabled"]
	n.case !== "sensitive" &&
		((i = i.map((d) => (typeof d == "string" ? d.toLowerCase() : d))),
		(e = e.map((d) => (typeof d == "string" ? d.toLowerCase() : d))))
	const o = new Set(i),
		a = new Set(e),
		c = t.Pipe ?? ft,
		p = t.Boolean ?? mt,
		h = t.String ?? we,
		g = t.Transform ?? dt,
		m = new g({
			type: "transform",
			transform: (d, x) => {
				let k = d
				return (
					n.case !== "sensitive" && (k = k.toLowerCase()),
					o.has(k)
						? !0
						: a.has(k)
							? !1
							: (x.issues.push({
									code: "invalid_value",
									expected: "stringbool",
									values: [...o, ...a],
									input: x.value,
									inst: m,
								}),
								{})
				)
			},
			error: n.error,
		}),
		$ = new c({ type: "pipe", in: new h({ type: "string", error: n.error }), out: m, error: n.error })
	return new c({ type: "pipe", in: $, out: new p({ type: "boolean", error: n.error }), error: n.error })
}
function ma(t, r, n, i = {}) {
	const e = v(i),
		o = {
			...v(i),
			check: "string_format",
			type: "string",
			format: r,
			fn: typeof n == "function" ? n : (c) => n.test(c),
			...e,
		}
	return n instanceof RegExp && (o.pattern = n), new t(o)
}
var Ur = class {
	constructor(r) {
		;(this._def = r), (this.def = r)
	}
	implement(r) {
		if (typeof r != "function") throw new Error("implement() must be called with a function")
		const n = (...i) => {
			const e = this._def.input ? st(this._def.input, i, void 0, { callee: n }) : i
			if (!Array.isArray(e)) throw new Error("Invalid arguments schema: not an array or tuple schema.")
			const o = r(...e)
			return this._def.output ? st(this._def.output, o, void 0, { callee: n }) : o
		}
		return n
	}
	implementAsync(r) {
		if (typeof r != "function") throw new Error("implement() must be called with a function")
		const n = async (...i) => {
			const e = this._def.input ? await ct(this._def.input, i, void 0, { callee: n }) : i
			if (!Array.isArray(e)) throw new Error("Invalid arguments schema: not an array or tuple schema.")
			const o = await r(...e)
			return this._def.output ? ct(this._def.output, o, void 0, { callee: n }) : o
		}
		return n
	}
	input(...r) {
		const n = this.constructor
		return Array.isArray(r[0])
			? new n({ type: "function", input: new Ie({ type: "tuple", items: r[0], rest: r[1] }), output: this._def.output })
			: new n({ type: "function", input: r[0], output: this._def.output })
	}
	output(r) {
		const n = this.constructor
		return new n({ type: "function", input: this._def.input, output: r })
	}
}
function pa(t) {
	return new Ur({
		type: "function",
		input: Array.isArray(t?.input) ? aa(Ie, t?.input) : (t?.input ?? Pt(pt, Ce(Ee))),
		output: t?.output ?? Ce(Ee),
	})
}
var Tt = class {
	constructor(r) {
		;(this.counter = 0),
			(this.metadataRegistry = r?.metadata ?? ce),
			(this.target = r?.target ?? "draft-2020-12"),
			(this.unrepresentable = r?.unrepresentable ?? "throw"),
			(this.override = r?.override ?? (() => {})),
			(this.io = r?.io ?? "output"),
			(this.seen = new Map())
	}
	process(r, n = { path: [], schemaPath: [] }) {
		var i
		const e = r._zod.def,
			o = { guid: "uuid", url: "uri", datetime: "date-time", json_string: "json-string", regex: "" },
			a = this.seen.get(r)
		if (a) return a.count++, n.schemaPath.includes(r) && (a.cycle = n.path), a.schema
		const c = { schema: {}, count: 1, cycle: void 0, path: n.path }
		this.seen.set(r, c)
		const p = r._zod.toJSONSchema?.()
		if (p) c.schema = p
		else {
			const m = { ...n, schemaPath: [...n.schemaPath, r], path: n.path },
				$ = r._zod.parent
			if ($) (c.ref = $), this.process($, m), (this.seen.get($).isParent = !0)
			else {
				const b = c.schema
				switch (e.type) {
					case "string": {
						const d = b
						d.type = "string"
						const { minimum: x, maximum: k, format: D, patterns: S, contentEncoding: I } = r._zod.bag
						if (
							(typeof x == "number" && (d.minLength = x),
							typeof k == "number" && (d.maxLength = k),
							D && ((d.format = o[D] ?? D), d.format === "" && delete d.format),
							I && (d.contentEncoding = I),
							S && S.size > 0)
						) {
							const O = [...S]
							O.length === 1
								? (d.pattern = O[0].source)
								: O.length > 1 &&
									(c.schema.allOf = [
										...O.map((ye) => ({
											...(this.target === "draft-7" ? { type: "string" } : {}),
											pattern: ye.source,
										})),
									])
						}
						break
					}
					case "number": {
						const d = b,
							{
								minimum: x,
								maximum: k,
								format: D,
								multipleOf: S,
								exclusiveMaximum: I,
								exclusiveMinimum: O,
							} = r._zod.bag
						typeof D == "string" && D.includes("int") ? (d.type = "integer") : (d.type = "number"),
							typeof O == "number" && (d.exclusiveMinimum = O),
							typeof x == "number" &&
								((d.minimum = x), typeof O == "number" && (O >= x ? delete d.minimum : delete d.exclusiveMinimum)),
							typeof I == "number" && (d.exclusiveMaximum = I),
							typeof k == "number" &&
								((d.maximum = k), typeof I == "number" && (I <= k ? delete d.maximum : delete d.exclusiveMaximum)),
							typeof S == "number" && (d.multipleOf = S)
						break
					}
					case "boolean": {
						const d = b
						d.type = "boolean"
						break
					}
					case "bigint": {
						if (this.unrepresentable === "throw") throw new Error("BigInt cannot be represented in JSON Schema")
						break
					}
					case "symbol": {
						if (this.unrepresentable === "throw") throw new Error("Symbols cannot be represented in JSON Schema")
						break
					}
					case "null": {
						b.type = "null"
						break
					}
					case "any":
						break
					case "unknown":
						break
					case "undefined": {
						if (this.unrepresentable === "throw") throw new Error("Undefined cannot be represented in JSON Schema")
						break
					}
					case "void": {
						if (this.unrepresentable === "throw") throw new Error("Void cannot be represented in JSON Schema")
						break
					}
					case "never": {
						b.not = {}
						break
					}
					case "date": {
						if (this.unrepresentable === "throw") throw new Error("Date cannot be represented in JSON Schema")
						break
					}
					case "array": {
						const d = b,
							{ minimum: x, maximum: k } = r._zod.bag
						typeof x == "number" && (d.minItems = x),
							typeof k == "number" && (d.maxItems = k),
							(d.type = "array"),
							(d.items = this.process(e.element, { ...m, path: [...m.path, "items"] }))
						break
					}
					case "object": {
						const d = b
						;(d.type = "object"), (d.properties = {})
						const x = e.shape
						for (const S in x) d.properties[S] = this.process(x[S], { ...m, path: [...m.path, "properties", S] })
						const k = new Set(Object.keys(x)),
							D = new Set(
								[...k].filter((S) => {
									const I = e.shape[S]._zod
									return this.io === "input" ? I.optin === void 0 : I.optout === void 0
								}),
							)
						D.size > 0 && (d.required = Array.from(D)),
							e.catchall?._zod.def.type === "never"
								? (d.additionalProperties = !1)
								: e.catchall
									? e.catchall &&
										(d.additionalProperties = this.process(e.catchall, {
											...m,
											path: [...m.path, "additionalProperties"],
										}))
									: this.io === "output" && (d.additionalProperties = !1)
						break
					}
					case "union": {
						const d = b
						d.anyOf = e.options.map((x, k) => this.process(x, { ...m, path: [...m.path, "anyOf", k] }))
						break
					}
					case "intersection": {
						const d = b,
							x = this.process(e.left, { ...m, path: [...m.path, "allOf", 0] }),
							k = this.process(e.right, { ...m, path: [...m.path, "allOf", 1] }),
							D = (I) => "allOf" in I && Object.keys(I).length === 1,
							S = [...(D(x) ? x.allOf : [x]), ...(D(k) ? k.allOf : [k])]
						d.allOf = S
						break
					}
					case "tuple": {
						const d = b
						d.type = "array"
						const x = e.items.map((S, I) => this.process(S, { ...m, path: [...m.path, "prefixItems", I] }))
						if ((this.target === "draft-2020-12" ? (d.prefixItems = x) : (d.items = x), e.rest)) {
							const S = this.process(e.rest, { ...m, path: [...m.path, "items"] })
							this.target === "draft-2020-12" ? (d.items = S) : (d.additionalItems = S)
						}
						e.rest && (d.items = this.process(e.rest, { ...m, path: [...m.path, "items"] }))
						const { minimum: k, maximum: D } = r._zod.bag
						typeof k == "number" && (d.minItems = k), typeof D == "number" && (d.maxItems = D)
						break
					}
					case "record": {
						const d = b
						;(d.type = "object"),
							(d.propertyNames = this.process(e.keyType, { ...m, path: [...m.path, "propertyNames"] })),
							(d.additionalProperties = this.process(e.valueType, { ...m, path: [...m.path, "additionalProperties"] }))
						break
					}
					case "map": {
						if (this.unrepresentable === "throw") throw new Error("Map cannot be represented in JSON Schema")
						break
					}
					case "set": {
						if (this.unrepresentable === "throw") throw new Error("Set cannot be represented in JSON Schema")
						break
					}
					case "enum": {
						const d = b,
							x = Xe(e.entries)
						x.every((k) => typeof k == "number") && (d.type = "number"),
							x.every((k) => typeof k == "string") && (d.type = "string"),
							(d.enum = x)
						break
					}
					case "literal": {
						const d = b,
							x = []
						for (const k of e.values)
							if (k === void 0) {
								if (this.unrepresentable === "throw")
									throw new Error("Literal `undefined` cannot be represented in JSON Schema")
							} else if (typeof k == "bigint") {
								if (this.unrepresentable === "throw")
									throw new Error("BigInt literals cannot be represented in JSON Schema")
								x.push(Number(k))
							} else x.push(k)
						if (x.length !== 0)
							if (x.length === 1) {
								const k = x[0]
								;(d.type = k === null ? "null" : typeof k), (d.const = k)
							} else
								x.every((k) => typeof k == "number") && (d.type = "number"),
									x.every((k) => typeof k == "string") && (d.type = "string"),
									x.every((k) => typeof k == "boolean") && (d.type = "string"),
									x.every((k) => k === null) && (d.type = "null"),
									(d.enum = x)
						break
					}
					case "file": {
						const d = b,
							x = { type: "string", format: "binary", contentEncoding: "binary" },
							{ minimum: k, maximum: D, mime: S } = r._zod.bag
						k !== void 0 && (x.minLength = k),
							D !== void 0 && (x.maxLength = D),
							S
								? S.length === 1
									? ((x.contentMediaType = S[0]), Object.assign(d, x))
									: (d.anyOf = S.map((I) => ({ ...x, contentMediaType: I })))
								: Object.assign(d, x)
						break
					}
					case "transform": {
						if (this.unrepresentable === "throw") throw new Error("Transforms cannot be represented in JSON Schema")
						break
					}
					case "nullable": {
						const d = this.process(e.innerType, m)
						b.anyOf = [d, { type: "null" }]
						break
					}
					case "nonoptional": {
						this.process(e.innerType, m), (c.ref = e.innerType)
						break
					}
					case "success": {
						const d = b
						d.type = "boolean"
						break
					}
					case "default": {
						this.process(e.innerType, m),
							(c.ref = e.innerType),
							(b.default = JSON.parse(JSON.stringify(e.defaultValue)))
						break
					}
					case "prefault": {
						this.process(e.innerType, m),
							(c.ref = e.innerType),
							this.io === "input" && (b._prefault = JSON.parse(JSON.stringify(e.defaultValue)))
						break
					}
					case "catch": {
						this.process(e.innerType, m), (c.ref = e.innerType)
						let d
						try {
							d = e.catchValue(void 0)
						} catch {
							throw new Error("Dynamic catch values are not supported in JSON Schema")
						}
						b.default = d
						break
					}
					case "nan": {
						if (this.unrepresentable === "throw") throw new Error("NaN cannot be represented in JSON Schema")
						break
					}
					case "template_literal": {
						const d = b,
							x = r._zod.pattern
						if (!x) throw new Error("Pattern not found in template literal")
						;(d.type = "string"), (d.pattern = x.source)
						break
					}
					case "pipe": {
						const d = this.io === "input" ? (e.in._zod.def.type === "transform" ? e.out : e.in) : e.out
						this.process(d, m), (c.ref = d)
						break
					}
					case "readonly": {
						this.process(e.innerType, m), (c.ref = e.innerType), (b.readOnly = !0)
						break
					}
					case "promise": {
						this.process(e.innerType, m), (c.ref = e.innerType)
						break
					}
					case "optional": {
						this.process(e.innerType, m), (c.ref = e.innerType)
						break
					}
					case "lazy": {
						const d = r._zod.innerType
						this.process(d, m), (c.ref = d)
						break
					}
					case "custom": {
						if (this.unrepresentable === "throw") throw new Error("Custom types cannot be represented in JSON Schema")
						break
					}
					default:
				}
			}
		}
		const h = this.metadataRegistry.get(r)
		return (
			h && Object.assign(c.schema, h),
			this.io === "input" && J(r) && (delete c.schema.examples, delete c.schema.default),
			this.io === "input" && c.schema._prefault && ((i = c.schema).default ?? (i.default = c.schema._prefault)),
			delete c.schema._prefault,
			this.seen.get(r).schema
		)
	}
	emit(r, n) {
		const i = { cycles: n?.cycles ?? "ref", reused: n?.reused ?? "inline", external: n?.external ?? void 0 },
			e = this.seen.get(r)
		if (!e) throw new Error("Unprocessed schema. This is a bug in Zod.")
		const o = (g) => {
				const m = this.target === "draft-2020-12" ? "$defs" : "definitions"
				if (i.external) {
					const x = i.external.registry.get(g[0])?.id,
						k = i.external.uri ?? ((S) => S)
					if (x) return { ref: k(x) }
					const D = g[1].defId ?? g[1].schema.id ?? `schema${this.counter++}`
					return (g[1].defId = D), { defId: D, ref: `${k("__shared")}#/${m}/${D}` }
				}
				if (g[1] === e) return { ref: "#" }
				const b = `#/${m}/`,
					d = g[1].schema.id ?? `__schema${this.counter++}`
				return { defId: d, ref: b + d }
			},
			a = (g) => {
				if (g[1].schema.$ref) return
				const m = g[1],
					{ ref: $, defId: b } = o(g)
				;(m.def = { ...m.schema }), b && (m.defId = b)
				const d = m.schema
				for (const x in d) delete d[x]
				d.$ref = $
			}
		if (i.cycles === "throw")
			for (const g of this.seen.entries()) {
				const m = g[1]
				if (m.cycle)
					throw new Error(`Cycle detected: #/${m.cycle?.join("/")}/<root>

Set the \`cycles\` parameter to \`"ref"\` to resolve cyclical schemas with defs.`)
			}
		for (const g of this.seen.entries()) {
			const m = g[1]
			if (r === g[0]) {
				a(g)
				continue
			}
			if (i.external) {
				const b = i.external.registry.get(g[0])?.id
				if (r !== g[0] && b) {
					a(g)
					continue
				}
			}
			if (this.metadataRegistry.get(g[0])?.id) {
				a(g)
				continue
			}
			if (m.cycle) {
				a(g)
				continue
			}
			if (m.count > 1 && i.reused === "ref") {
				a(g)
				continue
			}
		}
		const c = (g, m) => {
			const $ = this.seen.get(g),
				b = $.def ?? $.schema,
				d = { ...b }
			if ($.ref === null) return
			const x = $.ref
			if ((($.ref = null), x)) {
				c(x, m)
				const k = this.seen.get(x).schema
				k.$ref && m.target === "draft-7"
					? ((b.allOf = b.allOf ?? []), b.allOf.push(k))
					: (Object.assign(b, k), Object.assign(b, d))
			}
			$.isParent || this.override({ zodSchema: g, jsonSchema: b, path: $.path ?? [] })
		}
		for (const g of [...this.seen.entries()].reverse()) c(g[0], { target: this.target })
		const p = {}
		if (
			(this.target === "draft-2020-12"
				? (p.$schema = "https://json-schema.org/draft/2020-12/schema")
				: this.target === "draft-7"
					? (p.$schema = "http://json-schema.org/draft-07/schema#")
					: console.warn(`Invalid target: ${this.target}`),
			i.external?.uri)
		) {
			const g = i.external.registry.get(r)?.id
			if (!g) throw new Error("Schema is missing an `id` property")
			p.$id = i.external.uri(g)
		}
		Object.assign(p, e.def)
		const h = i.external?.defs ?? {}
		for (const g of this.seen.entries()) {
			const m = g[1]
			m.def && m.defId && (h[m.defId] = m.def)
		}
		i.external || (Object.keys(h).length > 0 && (this.target === "draft-2020-12" ? (p.$defs = h) : (p.definitions = h)))
		try {
			return JSON.parse(JSON.stringify(p))
		} catch {
			throw new Error("Error converting schema to JSON.")
		}
	}
}
function da(t, r) {
	if (t instanceof Ae) {
		const i = new Tt(r),
			e = {}
		for (const c of t._idmap.entries()) {
			const [p, h] = c
			i.process(h)
		}
		const o = {},
			a = { registry: t, uri: r?.uri, defs: e }
		for (const c of t._idmap.entries()) {
			const [p, h] = c
			o[p] = i.emit(h, { ...r, external: a })
		}
		if (Object.keys(e).length > 0) {
			const c = i.target === "draft-2020-12" ? "$defs" : "definitions"
			o.__shared = { [c]: e }
		}
		return { schemas: o }
	}
	const n = new Tt(r)
	return n.process(t), n.emit(t, r)
}
function J(t, r) {
	const n = r ?? { seen: new Set() }
	if (n.seen.has(t)) return !1
	n.seen.add(t)
	const e = t._zod.def
	switch (e.type) {
		case "string":
		case "number":
		case "bigint":
		case "boolean":
		case "date":
		case "symbol":
		case "undefined":
		case "null":
		case "any":
		case "unknown":
		case "never":
		case "void":
		case "literal":
		case "enum":
		case "nan":
		case "file":
		case "template_literal":
			return !1
		case "array":
			return J(e.element, n)
		case "object": {
			for (const o in e.shape) if (J(e.shape[o], n)) return !0
			return !1
		}
		case "union": {
			for (const o of e.options) if (J(o, n)) return !0
			return !1
		}
		case "intersection":
			return J(e.left, n) || J(e.right, n)
		case "tuple": {
			for (const o of e.items) if (J(o, n)) return !0
			return !!(e.rest && J(e.rest, n))
		}
		case "record":
			return J(e.keyType, n) || J(e.valueType, n)
		case "map":
			return J(e.keyType, n) || J(e.valueType, n)
		case "set":
			return J(e.valueType, n)
		case "promise":
		case "optional":
		case "nonoptional":
		case "nullable":
		case "readonly":
			return J(e.innerType, n)
		case "lazy":
			return J(e.getter(), n)
		case "default":
			return J(e.innerType, n)
		case "prefault":
			return J(e.innerType, n)
		case "custom":
			return !1
		case "transform":
			return !0
		case "pipe":
			return J(e.in, n) || J(e.out, n)
		case "success":
			return !1
		case "catch":
			return !1
		default:
	}
	throw new Error(`Unknown schema type: ${e.type}`)
}
var Zc = {}
var Ve = {}
$e(Ve, {
	ZodISODate: () => Dr,
	ZodISODateTime: () => Zr,
	ZodISODuration: () => Er,
	ZodISOTime: () => Rr,
	date: () => ga,
	datetime: () => fa,
	duration: () => va,
	time: () => ha,
})
var Zr = u("ZodISODateTime", (t, r) => {
	Uo.init(t, r), C.init(t, r)
})
function fa(t) {
	return Pi(Zr, t)
}
var Dr = u("ZodISODate", (t, r) => {
	Zo.init(t, r), C.init(t, r)
})
function ga(t) {
	return Ti(Dr, t)
}
var Rr = u("ZodISOTime", (t, r) => {
	Do.init(t, r), C.init(t, r)
})
function ha(t) {
	return Oi(Rr, t)
}
var Er = u("ZodISODuration", (t, r) => {
	Ro.init(t, r), C.init(t, r)
})
function va(t) {
	return Ni(Er, t)
}
var Rc = (t, r) => {
		ot.init(t, r),
			(t.name = "ZodError"),
			Object.defineProperties(t, {
				format: { value: (n) => at(t, n) },
				flatten: { value: (n) => it(t, n) },
				addIssue: { value: (n) => t.issues.push(n) },
				addIssues: { value: (n) => t.issues.push(...n) },
				isEmpty: {
					get() {
						return t.issues.length === 0
					},
				},
			})
	},
	wm = u("ZodError", Rc),
	Fe = u("ZodError", Rc, { Parent: Error })
var ba = Xt(Fe),
	_a = Yt(Fe),
	ya = er(Fe),
	$a = tr(Fe)
var P = u(
		"ZodType",
		(t, r) => (
			j.init(t, r),
			(t.def = r),
			Object.defineProperty(t, "_def", { value: r }),
			(t.check = (...n) =>
				t.clone({
					...r,
					checks: [
						...(r.checks ?? []),
						...n.map((i) =>
							typeof i == "function" ? { _zod: { check: i, def: { check: "custom" }, onattach: [] } } : i,
						),
					],
				})),
			(t.clone = (n, i) => te(t, n, i)),
			(t.brand = () => t),
			(t.register = (n, i) => (n.add(t, i), t)),
			(t.parse = (n, i) => ba(t, n, i, { callee: t.parse })),
			(t.safeParse = (n, i) => ya(t, n, i)),
			(t.parseAsync = async (n, i) => _a(t, n, i, { callee: t.parseAsync })),
			(t.safeParseAsync = async (n, i) => $a(t, n, i)),
			(t.spa = t.safeParseAsync),
			(t.refine = (n, i) => t.check(hu(n, i))),
			(t.superRefine = (n) => t.check(vu(n))),
			(t.overwrite = (n) => t.check(pe(n))),
			(t.optional = () => q(t)),
			(t.nullable = () => Cr(t)),
			(t.nullish = () => q(Cr(t))),
			(t.nonoptional = (n) => ou(t, n)),
			(t.array = () => T(t)),
			(t.or = (n) => R([t, n])),
			(t.and = (n) => Et(t, n)),
			(t.transform = (n) => Lr(t, Ha(n))),
			(t.default = (n) => tu(t, n)),
			(t.prefault = (n) => nu(t, n)),
			(t.catch = (n) => su(t, n)),
			(t.pipe = (n) => Lr(t, n)),
			(t.readonly = () => lu(t)),
			(t.describe = (n) => {
				const i = t.clone()
				return ce.add(i, { description: n }), i
			}),
			Object.defineProperty(t, "description", {
				get() {
					return ce.get(t)?.description
				},
				configurable: !0,
			}),
			(t.meta = (...n) => {
				if (n.length === 0) return ce.get(t)
				const i = t.clone()
				return ce.add(i, n[0]), i
			}),
			(t.isOptional = () => t.safeParse(void 0).success),
			(t.isNullable = () => t.safeParse(null).success),
			t
		),
	),
	za = u("_ZodString", (t, r) => {
		we.init(t, r), P.init(t, r)
		const n = t._zod.bag
		;(t.format = n.format ?? null),
			(t.minLength = n.minimum ?? null),
			(t.maxLength = n.maximum ?? null),
			(t.regex = (...i) => t.check(bt(...i))),
			(t.includes = (...i) => t.check($t(...i))),
			(t.startsWith = (...i) => t.check(xt(...i))),
			(t.endsWith = (...i) => t.check(zt(...i))),
			(t.min = (...i) => t.check(ve(...i))),
			(t.max = (...i) => t.check(Me(...i))),
			(t.length = (...i) => t.check(qe(...i))),
			(t.nonempty = (...i) => t.check(ve(1, ...i))),
			(t.lowercase = (i) => t.check(_t(i))),
			(t.uppercase = (i) => t.check(yt(i))),
			(t.trim = () => t.check(wt())),
			(t.normalize = (...i) => t.check(St(...i))),
			(t.toLowerCase = () => t.check(It())),
			(t.toUpperCase = () => t.check(jt()))
	}),
	Nt = u("ZodString", (t, r) => {
		we.init(t, r),
			za.init(t, r),
			(t.email = (n) => t.check(pr(ka, n))),
			(t.url = (n) => t.check(vr(Sa, n))),
			(t.jwt = (n) => t.check(Nr(La, n))),
			(t.emoji = (n) => t.check(br(wa, n))),
			(t.guid = (n) => t.check(ht(Ar, n))),
			(t.uuid = (n) => t.check(dr(fe, n))),
			(t.uuidv4 = (n) => t.check(fr(fe, n))),
			(t.uuidv6 = (n) => t.check(gr(fe, n))),
			(t.uuidv7 = (n) => t.check(hr(fe, n))),
			(t.nanoid = (n) => t.check(_r(Ia, n))),
			(t.guid = (n) => t.check(ht(Ar, n))),
			(t.cuid = (n) => t.check(yr(ja, n))),
			(t.cuid2 = (n) => t.check($r(Pa, n))),
			(t.ulid = (n) => t.check(xr(Ta, n))),
			(t.base64 = (n) => t.check(Pr(Ea, n))),
			(t.base64url = (n) => t.check(Tr(Aa, n))),
			(t.xid = (n) => t.check(zr(Oa, n))),
			(t.ksuid = (n) => t.check(kr(Na, n))),
			(t.ipv4 = (n) => t.check(Sr(Ua, n))),
			(t.ipv6 = (n) => t.check(wr(Za, n))),
			(t.cidrv4 = (n) => t.check(Ir(Da, n))),
			(t.cidrv6 = (n) => t.check(jr(Ra, n))),
			(t.e164 = (n) => t.check(Or(Ca, n))),
			(t.datetime = (n) => t.check(fa(n))),
			(t.date = (n) => t.check(ga(n))),
			(t.time = (n) => t.check(ha(n))),
			(t.duration = (n) => t.check(va(n)))
	})
function l(t) {
	return wi(Nt, t)
}
var C = u("ZodStringFormat", (t, r) => {
		A.init(t, r), za.init(t, r)
	}),
	ka = u("ZodEmail", (t, r) => {
		ko.init(t, r), C.init(t, r)
	})
function jm(t) {
	return pr(ka, t)
}
var Ar = u("ZodGUID", (t, r) => {
	xo.init(t, r), C.init(t, r)
})
function Pm(t) {
	return ht(Ar, t)
}
var fe = u("ZodUUID", (t, r) => {
	zo.init(t, r), C.init(t, r)
})
function Tm(t) {
	return dr(fe, t)
}
function Om(t) {
	return fr(fe, t)
}
function Nm(t) {
	return gr(fe, t)
}
function Um(t) {
	return hr(fe, t)
}
var Sa = u("ZodURL", (t, r) => {
	So.init(t, r), C.init(t, r)
})
function Zm(t) {
	return vr(Sa, t)
}
var wa = u("ZodEmoji", (t, r) => {
	wo.init(t, r), C.init(t, r)
})
function Dm(t) {
	return br(wa, t)
}
var Ia = u("ZodNanoID", (t, r) => {
	Io.init(t, r), C.init(t, r)
})
function Rm(t) {
	return _r(Ia, t)
}
var ja = u("ZodCUID", (t, r) => {
	jo.init(t, r), C.init(t, r)
})
function Em(t) {
	return yr(ja, t)
}
var Pa = u("ZodCUID2", (t, r) => {
	Po.init(t, r), C.init(t, r)
})
function Am(t) {
	return $r(Pa, t)
}
var Ta = u("ZodULID", (t, r) => {
	To.init(t, r), C.init(t, r)
})
function Cm(t) {
	return xr(Ta, t)
}
var Oa = u("ZodXID", (t, r) => {
	Oo.init(t, r), C.init(t, r)
})
function Lm(t) {
	return zr(Oa, t)
}
var Na = u("ZodKSUID", (t, r) => {
	No.init(t, r), C.init(t, r)
})
function Mm(t) {
	return kr(Na, t)
}
var Ua = u("ZodIPv4", (t, r) => {
	Eo.init(t, r), C.init(t, r)
})
function qm(t) {
	return Sr(Ua, t)
}
var Za = u("ZodIPv6", (t, r) => {
	Ao.init(t, r), C.init(t, r)
})
function Vm(t) {
	return wr(Za, t)
}
var Da = u("ZodCIDRv4", (t, r) => {
	Co.init(t, r), C.init(t, r)
})
function Fm(t) {
	return Ir(Da, t)
}
var Ra = u("ZodCIDRv6", (t, r) => {
	Lo.init(t, r), C.init(t, r)
})
function Hm(t) {
	return jr(Ra, t)
}
var Ea = u("ZodBase64", (t, r) => {
	qo.init(t, r), C.init(t, r)
})
function Jm(t) {
	return Pr(Ea, t)
}
var Aa = u("ZodBase64URL", (t, r) => {
	Vo.init(t, r), C.init(t, r)
})
function Bm(t) {
	return Tr(Aa, t)
}
var Ca = u("ZodE164", (t, r) => {
	Fo.init(t, r), C.init(t, r)
})
function Wm(t) {
	return Or(Ca, t)
}
var La = u("ZodJWT", (t, r) => {
	Ho.init(t, r), C.init(t, r)
})
function Gm(t) {
	return Nr(La, t)
}
var Ec = u("ZodCustomStringFormat", (t, r) => {
	Jo.init(t, r), C.init(t, r)
})
function Km(t, r, n = {}) {
	return ma(Ec, t, r, n)
}
var Ut = u("ZodNumber", (t, r) => {
	sr.init(t, r),
		P.init(t, r),
		(t.gt = (i, e) => t.check(me(i, e))),
		(t.gte = (i, e) => t.check(ee(i, e))),
		(t.min = (i, e) => t.check(ee(i, e))),
		(t.lt = (i, e) => t.check(le(i, e))),
		(t.lte = (i, e) => t.check(oe(i, e))),
		(t.max = (i, e) => t.check(oe(i, e))),
		(t.int = (i) => t.check(xa(i))),
		(t.safe = (i) => t.check(xa(i))),
		(t.positive = (i) => t.check(me(0, i))),
		(t.nonnegative = (i) => t.check(ee(0, i))),
		(t.negative = (i) => t.check(le(0, i))),
		(t.nonpositive = (i) => t.check(oe(0, i))),
		(t.multipleOf = (i, e) => t.check(je(i, e))),
		(t.step = (i, e) => t.check(je(i, e))),
		(t.finite = () => t)
	const n = t._zod.bag
	;(t.minValue =
		Math.max(n.minimum ?? Number.NEGATIVE_INFINITY, n.exclusiveMinimum ?? Number.NEGATIVE_INFINITY) ?? null),
		(t.maxValue =
			Math.min(n.maximum ?? Number.POSITIVE_INFINITY, n.exclusiveMaximum ?? Number.POSITIVE_INFINITY) ?? null),
		(t.isInt = (n.format ?? "").includes("int") || Number.isSafeInteger(n.multipleOf ?? 0.5)),
		(t.isFinite = !0),
		(t.format = n.format ?? null)
})
function Z(t) {
	return Ui(Ut, t)
}
var He = u("ZodNumberFormat", (t, r) => {
	Bo.init(t, r), Ut.init(t, r)
})
function xa(t) {
	return Di(He, t)
}
function Qm(t) {
	return Ri(He, t)
}
function Xm(t) {
	return Ei(He, t)
}
function Ym(t) {
	return Ai(He, t)
}
function ep(t) {
	return Ci(He, t)
}
var Zt = u("ZodBoolean", (t, r) => {
	mt.init(t, r), P.init(t, r)
})
function H(t) {
	return Li(Zt, t)
}
var Dt = u("ZodBigInt", (t, r) => {
	cr.init(t, r),
		P.init(t, r),
		(t.gte = (i, e) => t.check(ee(i, e))),
		(t.min = (i, e) => t.check(ee(i, e))),
		(t.gt = (i, e) => t.check(me(i, e))),
		(t.gte = (i, e) => t.check(ee(i, e))),
		(t.min = (i, e) => t.check(ee(i, e))),
		(t.lt = (i, e) => t.check(le(i, e))),
		(t.lte = (i, e) => t.check(oe(i, e))),
		(t.max = (i, e) => t.check(oe(i, e))),
		(t.positive = (i) => t.check(me(BigInt(0), i))),
		(t.negative = (i) => t.check(le(BigInt(0), i))),
		(t.nonpositive = (i) => t.check(oe(BigInt(0), i))),
		(t.nonnegative = (i) => t.check(ee(BigInt(0), i))),
		(t.multipleOf = (i, e) => t.check(je(i, e)))
	const n = t._zod.bag
	;(t.minValue = n.minimum ?? null), (t.maxValue = n.maximum ?? null), (t.format = n.format ?? null)
})
function tp(t) {
	return qi(Dt, t)
}
var Ma = u("ZodBigIntFormat", (t, r) => {
	Wo.init(t, r), Dt.init(t, r)
})
function rp(t) {
	return Fi(Ma, t)
}
function np(t) {
	return Hi(Ma, t)
}
var Ac = u("ZodSymbol", (t, r) => {
	Go.init(t, r), P.init(t, r)
})
function op(t) {
	return Ji(Ac, t)
}
var Cc = u("ZodUndefined", (t, r) => {
	Ko.init(t, r), P.init(t, r)
})
function ip(t) {
	return Bi(Cc, t)
}
var Lc = u("ZodNull", (t, r) => {
	Qo.init(t, r), P.init(t, r)
})
function Rt(t) {
	return Wi(Lc, t)
}
var Mc = u("ZodAny", (t, r) => {
	Xo.init(t, r), P.init(t, r)
})
function ap() {
	return Gi(Mc)
}
var qc = u("ZodUnknown", (t, r) => {
	Ee.init(t, r), P.init(t, r)
})
function M() {
	return Ce(qc)
}
var Vc = u("ZodNever", (t, r) => {
	Yo.init(t, r), P.init(t, r)
})
function Mr(t) {
	return Ki(Vc, t)
}
var Fc = u("ZodVoid", (t, r) => {
	ei.init(t, r), P.init(t, r)
})
function sp(t) {
	return Qi(Fc, t)
}
var qr = u("ZodDate", (t, r) => {
	ti.init(t, r), P.init(t, r), (t.min = (i, e) => t.check(ee(i, e))), (t.max = (i, e) => t.check(oe(i, e)))
	const n = t._zod.bag
	;(t.minDate = n.minimum ? new Date(n.minimum) : null), (t.maxDate = n.maximum ? new Date(n.maximum) : null)
})
function cp(t) {
	return Xi(qr, t)
}
var Hc = u("ZodArray", (t, r) => {
	pt.init(t, r),
		P.init(t, r),
		(t.element = r.element),
		(t.min = (n, i) => t.check(ve(n, i))),
		(t.nonempty = (n) => t.check(ve(1, n))),
		(t.max = (n, i) => t.check(Me(n, i))),
		(t.length = (n, i) => t.check(qe(n, i))),
		(t.unwrap = () => t.element)
})
function T(t, r) {
	return Pt(Hc, t, r)
}
function up(t) {
	const r = t._zod.def.shape
	return w(Object.keys(r))
}
var Vr = u("ZodObject", (t, r) => {
	ri.init(t, r),
		P.init(t, r),
		y.defineLazy(t, "shape", () => r.shape),
		(t.keyof = () => X(Object.keys(t._zod.def.shape))),
		(t.catchall = (n) => t.clone({ ...t._zod.def, catchall: n })),
		(t.passthrough = () => t.clone({ ...t._zod.def, catchall: M() })),
		(t.loose = () => t.clone({ ...t._zod.def, catchall: M() })),
		(t.strict = () => t.clone({ ...t._zod.def, catchall: Mr() })),
		(t.strip = () => t.clone({ ...t._zod.def, catchall: void 0 })),
		(t.extend = (n) => y.extend(t, n)),
		(t.merge = (n) => y.merge(t, n)),
		(t.pick = (n) => y.pick(t, n)),
		(t.omit = (n) => y.omit(t, n)),
		(t.partial = (...n) => y.partial(Ja, t, n[0])),
		(t.required = (...n) => y.required(Ba, t, n[0]))
})
function z(t, r) {
	const n = {
		type: "object",
		get shape() {
			return y.assignProp(this, "shape", { ...t }), this.shape
		},
		...y.normalizeParams(r),
	}
	return new Vr(n)
}
function lp(t, r) {
	return new Vr({
		type: "object",
		get shape() {
			return y.assignProp(this, "shape", { ...t }), this.shape
		},
		catchall: Mr(),
		...y.normalizeParams(r),
	})
}
function Q(t, r) {
	return new Vr({
		type: "object",
		get shape() {
			return y.assignProp(this, "shape", { ...t }), this.shape
		},
		catchall: M(),
		...y.normalizeParams(r),
	})
}
var qa = u("ZodUnion", (t, r) => {
	ur.init(t, r), P.init(t, r), (t.options = r.options)
})
function R(t, r) {
	return new qa({ type: "union", options: t, ...y.normalizeParams(r) })
}
var Jc = u("ZodDiscriminatedUnion", (t, r) => {
	qa.init(t, r), ni.init(t, r)
})
function Fr(t, r, n) {
	return new Jc({ type: "union", options: r, discriminator: t, ...y.normalizeParams(n) })
}
var Bc = u("ZodIntersection", (t, r) => {
	oi.init(t, r), P.init(t, r)
})
function Et(t, r) {
	return new Bc({ type: "intersection", left: t, right: r })
}
var Wc = u("ZodTuple", (t, r) => {
	Ie.init(t, r), P.init(t, r), (t.rest = (n) => t.clone({ ...t._zod.def, rest: n }))
})
function mp(t, r, n) {
	const i = r instanceof j,
		e = i ? n : r,
		o = i ? r : null
	return new Wc({ type: "tuple", items: t, rest: o, ...y.normalizeParams(e) })
}
var Va = u("ZodRecord", (t, r) => {
	ii.init(t, r), P.init(t, r), (t.keyType = r.keyType), (t.valueType = r.valueType)
})
function L(t, r, n) {
	return new Va({ type: "record", keyType: t, valueType: r, ...y.normalizeParams(n) })
}
function pp(t, r, n) {
	return new Va({ type: "record", keyType: R([t, Mr()]), valueType: r, ...y.normalizeParams(n) })
}
var Gc = u("ZodMap", (t, r) => {
	ai.init(t, r), P.init(t, r), (t.keyType = r.keyType), (t.valueType = r.valueType)
})
function dp(t, r, n) {
	return new Gc({ type: "map", keyType: t, valueType: r, ...y.normalizeParams(n) })
}
var Kc = u("ZodSet", (t, r) => {
	si.init(t, r),
		P.init(t, r),
		(t.min = (...n) => t.check(Pe(...n))),
		(t.nonempty = (n) => t.check(Pe(1, n))),
		(t.max = (...n) => t.check(Le(...n))),
		(t.size = (...n) => t.check(vt(...n)))
})
function fp(t, r) {
	return new Kc({ type: "set", valueType: t, ...y.normalizeParams(r) })
}
var Ot = u("ZodEnum", (t, r) => {
	ci.init(t, r), P.init(t, r), (t.enum = r.entries), (t.options = Object.values(r.entries))
	const n = new Set(Object.keys(r.entries))
	;(t.extract = (i, e) => {
		const o = {}
		for (const a of i)
			if (n.has(a)) o[a] = r.entries[a]
			else throw new Error(`Key ${a} not found in enum`)
		return new Ot({ ...r, checks: [], ...y.normalizeParams(e), entries: o })
	}),
		(t.exclude = (i, e) => {
			const o = { ...r.entries }
			for (const a of i)
				if (n.has(a)) delete o[a]
				else throw new Error(`Key ${a} not found in enum`)
			return new Ot({ ...r, checks: [], ...y.normalizeParams(e), entries: o })
		})
})
function X(t, r) {
	const n = Array.isArray(t) ? Object.fromEntries(t.map((i) => [i, i])) : t
	return new Ot({ type: "enum", entries: n, ...y.normalizeParams(r) })
}
function gp(t, r) {
	return new Ot({ type: "enum", entries: t, ...y.normalizeParams(r) })
}
var Qc = u("ZodLiteral", (t, r) => {
	ui.init(t, r),
		P.init(t, r),
		(t.values = new Set(r.values)),
		Object.defineProperty(t, "value", {
			get() {
				if (r.values.length > 1)
					throw new Error("This schema contains multiple valid literal values. Use `.values` instead.")
				return r.values[0]
			},
		})
})
function w(t, r) {
	return new Qc({ type: "literal", values: Array.isArray(t) ? t : [t], ...y.normalizeParams(r) })
}
var Xc = u("ZodFile", (t, r) => {
	li.init(t, r),
		P.init(t, r),
		(t.min = (n, i) => t.check(Pe(n, i))),
		(t.max = (n, i) => t.check(Le(n, i))),
		(t.mime = (n, i) => t.check(kt(Array.isArray(n) ? n : [n], i)))
})
function hp(t) {
	return sa(Xc, t)
}
var Fa = u("ZodTransform", (t, r) => {
	dt.init(t, r),
		P.init(t, r),
		(t._zod.parse = (n, i) => {
			n.addIssue = (o) => {
				if (typeof o == "string") n.issues.push(y.issue(o, n.value, r))
				else {
					const a = o
					a.fatal && (a.continue = !1),
						a.code ?? (a.code = "custom"),
						a.input ?? (a.input = n.value),
						a.inst ?? (a.inst = t),
						a.continue ?? (a.continue = !0),
						n.issues.push(y.issue(a))
				}
			}
			const e = r.transform(n.value, n)
			return e instanceof Promise ? e.then((o) => ((n.value = o), n)) : ((n.value = e), n)
		})
})
function Ha(t) {
	return new Fa({ type: "transform", transform: t })
}
var Ja = u("ZodOptional", (t, r) => {
	mi.init(t, r), P.init(t, r), (t.unwrap = () => t._zod.def.innerType)
})
function q(t) {
	return new Ja({ type: "optional", innerType: t })
}
var Yc = u("ZodNullable", (t, r) => {
	pi.init(t, r), P.init(t, r), (t.unwrap = () => t._zod.def.innerType)
})
function Cr(t) {
	return new Yc({ type: "nullable", innerType: t })
}
function vp(t) {
	return q(Cr(t))
}
var eu = u("ZodDefault", (t, r) => {
	di.init(t, r), P.init(t, r), (t.unwrap = () => t._zod.def.innerType), (t.removeDefault = t.unwrap)
})
function tu(t, r) {
	return new eu({
		type: "default",
		innerType: t,
		get defaultValue() {
			return typeof r == "function" ? r() : r
		},
	})
}
var ru = u("ZodPrefault", (t, r) => {
	fi.init(t, r), P.init(t, r), (t.unwrap = () => t._zod.def.innerType)
})
function nu(t, r) {
	return new ru({
		type: "prefault",
		innerType: t,
		get defaultValue() {
			return typeof r == "function" ? r() : r
		},
	})
}
var Ba = u("ZodNonOptional", (t, r) => {
	gi.init(t, r), P.init(t, r), (t.unwrap = () => t._zod.def.innerType)
})
function ou(t, r) {
	return new Ba({ type: "nonoptional", innerType: t, ...y.normalizeParams(r) })
}
var iu = u("ZodSuccess", (t, r) => {
	hi.init(t, r), P.init(t, r), (t.unwrap = () => t._zod.def.innerType)
})
function bp(t) {
	return new iu({ type: "success", innerType: t })
}
var au = u("ZodCatch", (t, r) => {
	vi.init(t, r), P.init(t, r), (t.unwrap = () => t._zod.def.innerType), (t.removeCatch = t.unwrap)
})
function su(t, r) {
	return new au({ type: "catch", innerType: t, catchValue: typeof r == "function" ? r : () => r })
}
var cu = u("ZodNaN", (t, r) => {
	bi.init(t, r), P.init(t, r)
})
function _p(t) {
	return ea(cu, t)
}
var Wa = u("ZodPipe", (t, r) => {
	ft.init(t, r), P.init(t, r), (t.in = r.in), (t.out = r.out)
})
function Lr(t, r) {
	return new Wa({ type: "pipe", in: t, out: r })
}
var uu = u("ZodReadonly", (t, r) => {
	_i.init(t, r), P.init(t, r)
})
function lu(t) {
	return new uu({ type: "readonly", innerType: t })
}
var mu = u("ZodTemplateLiteral", (t, r) => {
	yi.init(t, r), P.init(t, r)
})
function yp(t, r) {
	return new mu({ type: "template_literal", parts: t, ...y.normalizeParams(r) })
}
var pu = u("ZodLazy", (t, r) => {
	xi.init(t, r), P.init(t, r), (t.unwrap = () => t._zod.def.getter())
})
function du(t) {
	return new pu({ type: "lazy", getter: t })
}
var fu = u("ZodPromise", (t, r) => {
	$i.init(t, r), P.init(t, r), (t.unwrap = () => t._zod.def.innerType)
})
function $p(t) {
	return new fu({ type: "promise", innerType: t })
}
var Hr = u("ZodCustom", (t, r) => {
	zi.init(t, r), P.init(t, r)
})
function gu(t) {
	const r = new V({ check: "custom" })
	return (r._zod.check = t), r
}
function Ga(t, r) {
	return ca(Hr, t ?? (() => !0), r)
}
function hu(t, r = {}) {
	return ua(Hr, t, r)
}
function vu(t) {
	const r = gu(
		(n) => (
			(n.addIssue = (i) => {
				if (typeof i == "string") n.issues.push(y.issue(i, n.value, r._zod.def))
				else {
					const e = i
					e.fatal && (e.continue = !1),
						e.code ?? (e.code = "custom"),
						e.input ?? (e.input = n.value),
						e.inst ?? (e.inst = r),
						e.continue ?? (e.continue = !r._zod.def.abort),
						n.issues.push(y.issue(e))
				}
			}),
			t(n.value, n)
		),
	)
	return r
}
function xp(t, r = { error: `Input not instance of ${t.name}` }) {
	const n = new Hr({ type: "custom", check: "custom", fn: (i) => i instanceof t, abort: !0, ...y.normalizeParams(r) })
	return (n._zod.bag.Class = t), n
}
var zp = (...t) => la({ Pipe: Wa, Boolean: Zt, String: Nt, Transform: Fa }, ...t)
function kp(t) {
	const r = du(() => R([l(t), Z(), H(), Rt(), T(r), L(l(), r)]))
	return r
}
function Jr(t, r) {
	return Lr(Ha(t), r)
}
var Sp = {
	invalid_type: "invalid_type",
	too_big: "too_big",
	too_small: "too_small",
	invalid_format: "invalid_format",
	not_multiple_of: "not_multiple_of",
	unrecognized_keys: "unrecognized_keys",
	invalid_union: "invalid_union",
	invalid_key: "invalid_key",
	invalid_element: "invalid_element",
	invalid_value: "invalid_value",
	custom: "custom",
}
function wp(t) {
	F({ customError: t })
}
function Ip() {
	return F().customError
}
var Ka = {}
$e(Ka, { bigint: () => Op, boolean: () => Tp, date: () => Np, number: () => Pp, string: () => jp })
function jp(t) {
	return Ii(Nt, t)
}
function Pp(t) {
	return Zi(Ut, t)
}
function Tp(t) {
	return Mi(Zt, t)
}
function Op(t) {
	return Vi(Dt, t)
}
function Np(t) {
	return Yi(qr, t)
}
F(lr())
var be = "io.modelcontextprotocol/related-task",
	Wr = "2.0",
	B = Ga((t) => t !== null && (typeof t == "object" || typeof t == "function")),
	bu = R([l(), Z().int()]),
	_u = l(),
	Gh = Q({ ttl: R([Z(), Rt()]).optional(), pollInterval: Z().optional() }),
	Up = z({ ttl: Z().optional() }),
	Zp = z({ taskId: l() }),
	Xa = Q({ progressToken: bu.optional(), [be]: Zp.optional() }),
	ne = z({ _meta: Xa.optional() }),
	At = ne.extend({ task: Up.optional() }),
	yu = (t) => At.safeParse(t).success,
	W = z({ method: l(), params: ne.loose().optional() }),
	ie = z({ _meta: Xa.optional() }),
	ae = z({ method: l(), params: ie.loose().optional() }),
	G = Q({ _meta: Xa.optional() }),
	Be = R([l(), Z().int()]),
	$u = z({ jsonrpc: w(Wr), id: Be, ...W.shape }).strict(),
	Ya = (t) => $u.safeParse(t).success,
	xu = z({ jsonrpc: w(Wr), ...ae.shape }).strict(),
	zu = (t) => xu.safeParse(t).success,
	es = z({ jsonrpc: w(Wr), id: Be, result: G }).strict(),
	Ct = (t) => es.safeParse(t).success
var E
;((t) => {
	;(t[(t.ConnectionClosed = -32e3)] = "ConnectionClosed"),
		(t[(t.RequestTimeout = -32001)] = "RequestTimeout"),
		(t[(t.ParseError = -32700)] = "ParseError"),
		(t[(t.InvalidRequest = -32600)] = "InvalidRequest"),
		(t[(t.MethodNotFound = -32601)] = "MethodNotFound"),
		(t[(t.InvalidParams = -32602)] = "InvalidParams"),
		(t[(t.InternalError = -32603)] = "InternalError"),
		(t[(t.UrlElicitationRequired = -32042)] = "UrlElicitationRequired")
})(E || (E = {}))
var ts = z({
	jsonrpc: w(Wr),
	id: Be.optional(),
	error: z({ code: Z().int(), message: l(), data: M().optional() }),
}).strict()
var ku = (t) => ts.safeParse(t).success
var Su = R([$u, xu, es, ts]),
	Kh = R([es, ts]),
	rs = G.strict(),
	Dp = ie.extend({ requestId: Be.optional(), reason: l().optional() }),
	Gr = ae.extend({ method: w("notifications/cancelled"), params: Dp }),
	Rp = z({ src: l(), mimeType: l().optional(), sizes: T(l()).optional(), theme: X(["light", "dark"]).optional() }),
	Lt = z({ icons: T(Rp).optional() }),
	Je = z({ name: l(), title: l().optional() }),
	Mt = Je.extend({ ...Je.shape, ...Lt.shape, version: l(), websiteUrl: l().optional(), description: l().optional() }),
	Ep = Et(z({ applyDefaults: H().optional() }), L(l(), M())),
	Ap = Jr(
		(t) => (t && typeof t == "object" && !Array.isArray(t) && Object.keys(t).length === 0 ? { form: {} } : t),
		Et(z({ form: Ep.optional(), url: B.optional() }), L(l(), M()).optional()),
	),
	Cp = Q({
		list: B.optional(),
		cancel: B.optional(),
		requests: Q({
			sampling: Q({ createMessage: B.optional() }).optional(),
			elicitation: Q({ create: B.optional() }).optional(),
		}).optional(),
	}),
	Lp = Q({
		list: B.optional(),
		cancel: B.optional(),
		requests: Q({ tools: Q({ call: B.optional() }).optional() }).optional(),
	}),
	Mp = z({
		experimental: L(l(), B).optional(),
		sampling: z({ context: B.optional(), tools: B.optional() }).optional(),
		elicitation: Ap.optional(),
		roots: z({ listChanged: H().optional() }).optional(),
		tasks: Cp.optional(),
	}),
	qp = ne.extend({ protocolVersion: l(), capabilities: Mp, clientInfo: Mt }),
	Vp = W.extend({ method: w("initialize"), params: qp })
var Fp = z({
		experimental: L(l(), B).optional(),
		logging: B.optional(),
		completions: B.optional(),
		prompts: z({ listChanged: H().optional() }).optional(),
		resources: z({ subscribe: H().optional(), listChanged: H().optional() }).optional(),
		tools: z({ listChanged: H().optional() }).optional(),
		tasks: Lp.optional(),
	}),
	Hp = G.extend({ protocolVersion: l(), capabilities: Fp, serverInfo: Mt, instructions: l().optional() }),
	Jp = ae.extend({ method: w("notifications/initialized"), params: ie.optional() })
var Te = W.extend({ method: w("ping"), params: ne.optional() }),
	Bp = z({ progress: Z(), total: q(Z()), message: q(l()) }),
	Wp = z({ ...ie.shape, ...Bp.shape, progressToken: bu }),
	Kr = ae.extend({ method: w("notifications/progress"), params: Wp }),
	Gp = ne.extend({ cursor: _u.optional() }),
	qt = W.extend({ params: Gp.optional() }),
	Vt = G.extend({ nextCursor: _u.optional() }),
	Kp = X(["working", "input_required", "completed", "failed", "cancelled"]),
	Ft = z({
		taskId: l(),
		status: Kp,
		ttl: R([Z(), Rt()]),
		createdAt: l(),
		lastUpdatedAt: l(),
		pollInterval: q(Z()),
		statusMessage: q(l()),
	}),
	Qr = G.extend({ task: Ft }),
	Qp = ie.merge(Ft),
	Ht = ae.extend({ method: w("notifications/tasks/status"), params: Qp }),
	Xr = W.extend({ method: w("tasks/get"), params: ne.extend({ taskId: l() }) }),
	Yr = G.merge(Ft),
	en = W.extend({ method: w("tasks/result"), params: ne.extend({ taskId: l() }) }),
	Qh = G.loose(),
	tn = qt.extend({ method: w("tasks/list") }),
	rn = Vt.extend({ tasks: T(Ft) }),
	nn = W.extend({ method: w("tasks/cancel"), params: ne.extend({ taskId: l() }) }),
	wu = G.merge(Ft),
	Iu = z({ uri: l(), mimeType: q(l()), _meta: L(l(), M()).optional() }),
	ju = Iu.extend({ text: l() }),
	ns = l().refine(
		(t) => {
			try {
				return atob(t), !0
			} catch {
				return !1
			}
		},
		{ message: "Invalid Base64 string" },
	),
	Pu = Iu.extend({ blob: ns }),
	Jt = X(["user", "assistant"]),
	We = z({
		audience: T(Jt).optional(),
		priority: Z().min(0).max(1).optional(),
		lastModified: Ve.datetime({ offset: !0 }).optional(),
	}),
	Tu = z({
		...Je.shape,
		...Lt.shape,
		uri: l(),
		description: q(l()),
		mimeType: q(l()),
		annotations: We.optional(),
		_meta: q(Q({})),
	}),
	Xp = z({
		...Je.shape,
		...Lt.shape,
		uriTemplate: l(),
		description: q(l()),
		mimeType: q(l()),
		annotations: We.optional(),
		_meta: q(Q({})),
	}),
	os = qt.extend({ method: w("resources/list") }),
	on = Vt.extend({ resources: T(Tu) }),
	is = qt.extend({ method: w("resources/templates/list") }),
	as = Vt.extend({ resourceTemplates: T(Xp) }),
	ss = ne.extend({ uri: l() }),
	Yp = ss,
	cs = W.extend({ method: w("resources/read"), params: Yp }),
	an = G.extend({ contents: T(R([ju, Pu])) }),
	us = ae.extend({ method: w("notifications/resources/list_changed"), params: ie.optional() }),
	ed = ss,
	td = W.extend({ method: w("resources/subscribe"), params: ed }),
	rd = ss,
	nd = W.extend({ method: w("resources/unsubscribe"), params: rd }),
	od = ie.extend({ uri: l() }),
	id = ae.extend({ method: w("notifications/resources/updated"), params: od }),
	ad = z({ name: l(), description: q(l()), required: q(H()) }),
	sd = z({ ...Je.shape, ...Lt.shape, description: q(l()), arguments: q(T(ad)), _meta: q(Q({})) }),
	ls = qt.extend({ method: w("prompts/list") }),
	ms = Vt.extend({ prompts: T(sd) }),
	cd = ne.extend({ name: l(), arguments: L(l(), l()).optional() }),
	ud = W.extend({ method: w("prompts/get"), params: cd }),
	ps = z({ type: w("text"), text: l(), annotations: We.optional(), _meta: L(l(), M()).optional() }),
	ds = z({ type: w("image"), data: ns, mimeType: l(), annotations: We.optional(), _meta: L(l(), M()).optional() }),
	fs = z({ type: w("audio"), data: ns, mimeType: l(), annotations: We.optional(), _meta: L(l(), M()).optional() }),
	ld = z({ type: w("tool_use"), name: l(), id: l(), input: L(l(), M()), _meta: L(l(), M()).optional() }),
	gs = z({ type: w("resource"), resource: R([ju, Pu]), annotations: We.optional(), _meta: L(l(), M()).optional() }),
	hs = Tu.extend({ type: w("resource_link") }),
	Ge = R([ps, ds, fs, hs, gs]),
	md = z({ role: Jt, content: Ge }),
	pd = G.extend({ description: l().optional(), messages: T(md) }),
	vs = ae.extend({ method: w("notifications/prompts/list_changed"), params: ie.optional() }),
	dd = z({
		title: l().optional(),
		readOnlyHint: H().optional(),
		destructiveHint: H().optional(),
		idempotentHint: H().optional(),
		openWorldHint: H().optional(),
	}),
	fd = z({ taskSupport: X(["required", "optional", "forbidden"]).optional() }),
	sn = z({
		...Je.shape,
		...Lt.shape,
		description: l().optional(),
		inputSchema: z({ type: w("object"), properties: L(l(), B).optional(), required: T(l()).optional() }).catchall(M()),
		outputSchema: z({ type: w("object"), properties: L(l(), B).optional(), required: T(l()).optional() })
			.catchall(M())
			.optional(),
		annotations: dd.optional(),
		execution: fd.optional(),
		_meta: L(l(), M()).optional(),
	}),
	Ou = qt.extend({ method: w("tools/list") }),
	gd = Vt.extend({ tools: T(sn) }),
	Oe = G.extend({ content: T(Ge).default([]), structuredContent: L(l(), M()).optional(), isError: H().optional() }),
	Xh = Oe.or(G.extend({ toolResult: M() })),
	hd = At.extend({ name: l(), arguments: L(l(), M()).optional() }),
	cn = W.extend({ method: w("tools/call"), params: hd }),
	bs = ae.extend({ method: w("notifications/tools/list_changed"), params: ie.optional() }),
	Yh = z({ autoRefresh: H().default(!0), debounceMs: Z().int().nonnegative().default(300) }),
	Nu = X(["debug", "info", "notice", "warning", "error", "critical", "alert", "emergency"]),
	vd = ne.extend({ level: Nu }),
	bd = W.extend({ method: w("logging/setLevel"), params: vd }),
	_d = ie.extend({ level: Nu, logger: l().optional(), data: M() }),
	_s = ae.extend({ method: w("notifications/message"), params: _d }),
	yd = z({ name: l().optional() }),
	$d = z({
		hints: T(yd).optional(),
		costPriority: Z().min(0).max(1).optional(),
		speedPriority: Z().min(0).max(1).optional(),
		intelligencePriority: Z().min(0).max(1).optional(),
	}),
	xd = z({ mode: X(["auto", "required", "none"]).optional() }),
	zd = z({
		type: w("tool_result"),
		toolUseId: l().describe("The unique identifier for the corresponding tool call."),
		content: T(Ge).default([]),
		structuredContent: z({}).loose().optional(),
		isError: H().optional(),
		_meta: L(l(), M()).optional(),
	}),
	kd = Fr("type", [ps, ds, fs]),
	Br = Fr("type", [ps, ds, fs, ld, zd]),
	Sd = z({ role: Jt, content: R([Br, T(Br)]), _meta: L(l(), M()).optional() }),
	wd = At.extend({
		messages: T(Sd),
		modelPreferences: $d.optional(),
		systemPrompt: l().optional(),
		includeContext: X(["none", "thisServer", "allServers"]).optional(),
		temperature: Z().optional(),
		maxTokens: Z().int(),
		stopSequences: T(l()).optional(),
		metadata: B.optional(),
		tools: T(sn).optional(),
		toolChoice: xd.optional(),
	}),
	Id = W.extend({ method: w("sampling/createMessage"), params: wd }),
	jd = G.extend({
		model: l(),
		stopReason: q(X(["endTurn", "stopSequence", "maxTokens"]).or(l())),
		role: Jt,
		content: kd,
	}),
	Pd = G.extend({
		model: l(),
		stopReason: q(X(["endTurn", "stopSequence", "maxTokens", "toolUse"]).or(l())),
		role: Jt,
		content: R([Br, T(Br)]),
	}),
	Td = z({ type: w("boolean"), title: l().optional(), description: l().optional(), default: H().optional() }),
	Od = z({
		type: w("string"),
		title: l().optional(),
		description: l().optional(),
		minLength: Z().optional(),
		maxLength: Z().optional(),
		format: X(["email", "uri", "date", "date-time"]).optional(),
		default: l().optional(),
	}),
	Nd = z({
		type: X(["number", "integer"]),
		title: l().optional(),
		description: l().optional(),
		minimum: Z().optional(),
		maximum: Z().optional(),
		default: Z().optional(),
	}),
	Ud = z({
		type: w("string"),
		title: l().optional(),
		description: l().optional(),
		enum: T(l()),
		default: l().optional(),
	}),
	Zd = z({
		type: w("string"),
		title: l().optional(),
		description: l().optional(),
		oneOf: T(z({ const: l(), title: l() })),
		default: l().optional(),
	}),
	Dd = z({
		type: w("string"),
		title: l().optional(),
		description: l().optional(),
		enum: T(l()),
		enumNames: T(l()).optional(),
		default: l().optional(),
	}),
	Rd = R([Ud, Zd]),
	Ed = z({
		type: w("array"),
		title: l().optional(),
		description: l().optional(),
		minItems: Z().optional(),
		maxItems: Z().optional(),
		items: z({ type: w("string"), enum: T(l()) }),
		default: T(l()).optional(),
	}),
	Ad = z({
		type: w("array"),
		title: l().optional(),
		description: l().optional(),
		minItems: Z().optional(),
		maxItems: Z().optional(),
		items: z({ anyOf: T(z({ const: l(), title: l() })) }),
		default: T(l()).optional(),
	}),
	Cd = R([Ed, Ad]),
	Ld = R([Dd, Rd, Cd]),
	Md = R([Ld, Td, Od, Nd]),
	qd = At.extend({
		mode: w("form").optional(),
		message: l(),
		requestedSchema: z({ type: w("object"), properties: L(l(), Md), required: T(l()).optional() }),
	}),
	Vd = At.extend({ mode: w("url"), message: l(), elicitationId: l(), url: l().url() }),
	Fd = R([qd, Vd]),
	Hd = W.extend({ method: w("elicitation/create"), params: Fd }),
	Jd = ie.extend({ elicitationId: l() }),
	Bd = ae.extend({ method: w("notifications/elicitation/complete"), params: Jd }),
	Wd = G.extend({
		action: X(["accept", "decline", "cancel"]),
		content: Jr((t) => (t === null ? void 0 : t), L(l(), R([l(), Z(), H(), T(l())])).optional()),
	}),
	Gd = z({ type: w("ref/resource"), uri: l() })
var Kd = z({ type: w("ref/prompt"), name: l() }),
	Qd = ne.extend({
		ref: R([Kd, Gd]),
		argument: z({ name: l(), value: l() }),
		context: z({ arguments: L(l(), l()).optional() }).optional(),
	}),
	Xd = W.extend({ method: w("completion/complete"), params: Qd })
var Yd = G.extend({ completion: Q({ values: T(l()).max(100), total: q(Z().int()), hasMore: q(H()) }) }),
	ef = z({ uri: l().startsWith("file://"), name: l().optional(), _meta: L(l(), M()).optional() }),
	tf = W.extend({ method: w("roots/list"), params: ne.optional() }),
	rf = G.extend({ roots: T(ef) }),
	nf = ae.extend({ method: w("notifications/roots/list_changed"), params: ie.optional() }),
	ev = R([Te, Vp, Xd, bd, ud, ls, os, is, cs, td, nd, cn, Ou, Xr, en, tn, nn]),
	tv = R([Gr, Kr, Jp, nf, Ht]),
	rv = R([rs, jd, Pd, Wd, rf, Yr, rn, Qr]),
	nv = R([Te, Id, Hd, tf, Xr, en, tn, nn]),
	ov = R([Gr, Kr, _s, id, us, bs, vs, Ht, Bd]),
	iv = R([rs, Hp, Yd, pd, ms, on, as, an, Oe, gd, Yr, rn, Qr]),
	N = class t extends Error {
		constructor(r, n, i) {
			super(`MCP error ${r}: ${n}`), (this.code = r), (this.data = i), (this.name = "McpError")
		}
		static fromError(r, n, i) {
			if (r === E.UrlElicitationRequired && i) {
				const e = i
				if (e.elicitations) return new Qa(e.elicitations, n)
			}
			return new t(r, n, i)
		}
	},
	Qa = class extends N {
		constructor(r, n = `URL elicitation${r.length > 1 ? "s" : ""} required`) {
			super(E.UrlElicitationRequired, n, { elicitations: r })
		}
		get elicitations() {
			return this.data?.elicitations ?? []
		}
	}
function un(t) {
	return !!t._zod
}
function ln(t, r) {
	return un(t) ? De(t, r) : t.safeParse(r)
}
function Uu(t) {
	if (!t) return
	let r
	if ((un(t) ? (r = t._zod?.def?.shape) : (r = t.shape), !!r)) {
		if (typeof r == "function")
			try {
				return r()
			} catch {
				return
			}
		return r
	}
}
function Zu(t) {
	if (un(t)) {
		const o = t._zod?.def
		if (o) {
			if (o.value !== void 0) return o.value
			if (Array.isArray(o.values) && o.values.length > 0) return o.values[0]
		}
	}
	const n = t._def
	if (n) {
		if (n.value !== void 0) return n.value
		if (Array.isArray(n.values) && n.values.length > 0) return n.values[0]
	}
	const i = t.value
	if (i !== void 0) return i
}
function _e(t) {
	return t === "completed" || t === "failed" || t === "cancelled"
}
var Vv = new Set("ABCDEFGHIJKLMNOPQRSTUVXYZabcdefghijklmnopqrstuvxyz0123456789")
function ys(t) {
	const n = Uu(t)?.method
	if (!n) throw new Error("Schema is missing a method literal")
	const i = Zu(n)
	if (typeof i != "string") throw new Error("Schema method literal must be a string")
	return i
}
function $s(t, r) {
	const n = ln(t, r)
	if (!n.success) throw n.error
	return n.data
}
var lf = 6e4,
	Wt = class {
		constructor(r) {
			;(this._options = r),
				(this._requestMessageId = 0),
				(this._requestHandlers = new Map()),
				(this._requestHandlerAbortControllers = new Map()),
				(this._notificationHandlers = new Map()),
				(this._responseHandlers = new Map()),
				(this._progressHandlers = new Map()),
				(this._timeoutInfo = new Map()),
				(this._pendingDebouncedNotifications = new Set()),
				(this._taskProgressTokens = new Map()),
				(this._requestResolvers = new Map()),
				this.setNotificationHandler(Gr, (n) => {
					this._oncancel(n)
				}),
				this.setNotificationHandler(Kr, (n) => {
					this._onprogress(n)
				}),
				this.setRequestHandler(Te, (n) => ({})),
				(this._taskStore = r?.taskStore),
				(this._taskMessageQueue = r?.taskMessageQueue),
				this._taskStore &&
					(this.setRequestHandler(Xr, async (n, i) => {
						const e = await this._taskStore.getTask(n.params.taskId, i.sessionId)
						if (!e) throw new N(E.InvalidParams, "Failed to retrieve task: Task not found")
						return { ...e }
					}),
					this.setRequestHandler(en, async (n, i) => {
						const e = async () => {
							const o = n.params.taskId
							if (this._taskMessageQueue) {
								let c
								while ((c = await this._taskMessageQueue.dequeue(o, i.sessionId))) {
									if (c.type === "response" || c.type === "error") {
										const p = c.message,
											h = p.id,
											g = this._requestResolvers.get(h)
										if (g)
											if ((this._requestResolvers.delete(h), c.type === "response")) g(p)
											else {
												const m = p,
													$ = new N(m.error.code, m.error.message, m.error.data)
												g($)
											}
										else {
											const m = c.type === "response" ? "Response" : "Error"
											this._onerror(new Error(`${m} handler missing for request ${h}`))
										}
										continue
									}
									await this._transport?.send(c.message, { relatedRequestId: i.requestId })
								}
							}
							const a = await this._taskStore.getTask(o, i.sessionId)
							if (!a) throw new N(E.InvalidParams, `Task not found: ${o}`)
							if (!_e(a.status)) return await this._waitForTaskUpdate(o, i.signal), await e()
							if (_e(a.status)) {
								const c = await this._taskStore.getTaskResult(o, i.sessionId)
								return this._clearTaskQueue(o), { ...c, _meta: { ...c._meta, [be]: { taskId: o } } }
							}
							return await e()
						}
						return await e()
					}),
					this.setRequestHandler(tn, async (n, i) => {
						try {
							const { tasks: e, nextCursor: o } = await this._taskStore.listTasks(n.params?.cursor, i.sessionId)
							return { tasks: e, nextCursor: o, _meta: {} }
						} catch (e) {
							throw new N(E.InvalidParams, `Failed to list tasks: ${e instanceof Error ? e.message : String(e)}`)
						}
					}),
					this.setRequestHandler(nn, async (n, i) => {
						try {
							const e = await this._taskStore.getTask(n.params.taskId, i.sessionId)
							if (!e) throw new N(E.InvalidParams, `Task not found: ${n.params.taskId}`)
							if (_e(e.status)) throw new N(E.InvalidParams, `Cannot cancel task in terminal status: ${e.status}`)
							await this._taskStore.updateTaskStatus(
								n.params.taskId,
								"cancelled",
								"Client cancelled task execution.",
								i.sessionId,
							),
								this._clearTaskQueue(n.params.taskId)
							const o = await this._taskStore.getTask(n.params.taskId, i.sessionId)
							if (!o) throw new N(E.InvalidParams, `Task not found after cancellation: ${n.params.taskId}`)
							return { _meta: {}, ...o }
						} catch (e) {
							throw e instanceof N
								? e
								: new N(E.InvalidRequest, `Failed to cancel task: ${e instanceof Error ? e.message : String(e)}`)
						}
					}))
		}
		async _oncancel(r) {
			if (!r.params.requestId) return
			this._requestHandlerAbortControllers.get(r.params.requestId)?.abort(r.params.reason)
		}
		_setupTimeout(r, n, i, e, o = !1) {
			this._timeoutInfo.set(r, {
				timeoutId: setTimeout(e, n),
				startTime: Date.now(),
				timeout: n,
				maxTotalTimeout: i,
				resetTimeoutOnProgress: o,
				onTimeout: e,
			})
		}
		_resetTimeout(r) {
			const n = this._timeoutInfo.get(r)
			if (!n) return !1
			const i = Date.now() - n.startTime
			if (n.maxTotalTimeout && i >= n.maxTotalTimeout)
				throw (
					(this._timeoutInfo.delete(r),
					N.fromError(E.RequestTimeout, "Maximum total timeout exceeded", {
						maxTotalTimeout: n.maxTotalTimeout,
						totalElapsed: i,
					}))
				)
			return clearTimeout(n.timeoutId), (n.timeoutId = setTimeout(n.onTimeout, n.timeout)), !0
		}
		_cleanupTimeout(r) {
			const n = this._timeoutInfo.get(r)
			n && (clearTimeout(n.timeoutId), this._timeoutInfo.delete(r))
		}
		async connect(r) {
			this._transport = r
			const n = this.transport?.onclose
			this._transport.onclose = () => {
				n?.(), this._onclose()
			}
			const i = this.transport?.onerror
			this._transport.onerror = (o) => {
				i?.(o), this._onerror(o)
			}
			const e = this._transport?.onmessage
			;(this._transport.onmessage = (o, a) => {
				e?.(o, a),
					Ct(o) || ku(o)
						? this._onresponse(o)
						: Ya(o)
							? this._onrequest(o, a)
							: zu(o)
								? this._onnotification(o)
								: this._onerror(new Error(`Unknown message type: ${JSON.stringify(o)}`))
			}),
				await this._transport.start()
		}
		_onclose() {
			const r = this._responseHandlers
			;(this._responseHandlers = new Map()),
				this._progressHandlers.clear(),
				this._taskProgressTokens.clear(),
				this._pendingDebouncedNotifications.clear()
			const n = N.fromError(E.ConnectionClosed, "Connection closed")
			;(this._transport = void 0), this.onclose?.()
			for (const i of r.values()) i(n)
		}
		_onerror(r) {
			this.onerror?.(r)
		}
		_onnotification(r) {
			const n = this._notificationHandlers.get(r.method) ?? this.fallbackNotificationHandler
			n !== void 0 &&
				Promise.resolve()
					.then(() => n(r))
					.catch((i) => this._onerror(new Error(`Uncaught error in notification handler: ${i}`)))
		}
		_onrequest(r, n) {
			const i = this._requestHandlers.get(r.method) ?? this.fallbackRequestHandler,
				e = this._transport,
				o = r.params?._meta?.[be]?.taskId
			if (i === void 0) {
				const g = { jsonrpc: "2.0", id: r.id, error: { code: E.MethodNotFound, message: "Method not found" } }
				o && this._taskMessageQueue
					? this._enqueueTaskMessage(o, { type: "error", message: g, timestamp: Date.now() }, e?.sessionId).catch((m) =>
							this._onerror(new Error(`Failed to enqueue error response: ${m}`)),
						)
					: e?.send(g).catch((m) => this._onerror(new Error(`Failed to send an error response: ${m}`)))
				return
			}
			const a = new AbortController()
			this._requestHandlerAbortControllers.set(r.id, a)
			const c = yu(r.params) ? r.params.task : void 0,
				p = this._taskStore ? this.requestTaskStore(r, e?.sessionId) : void 0,
				h = {
					signal: a.signal,
					sessionId: e?.sessionId,
					_meta: r.params?._meta,
					sendNotification: async (g) => {
						const m = { relatedRequestId: r.id }
						o && (m.relatedTask = { taskId: o }), await this.notification(g, m)
					},
					sendRequest: async (g, m, $) => {
						const b = { ...$, relatedRequestId: r.id }
						o && !b.relatedTask && (b.relatedTask = { taskId: o })
						const d = b.relatedTask?.taskId ?? o
						return d && p && (await p.updateTaskStatus(d, "input_required")), await this.request(g, m, b)
					},
					authInfo: n?.authInfo,
					requestId: r.id,
					requestInfo: n?.requestInfo,
					taskId: o,
					taskStore: p,
					taskRequestedTtl: c?.ttl,
					closeSSEStream: n?.closeSSEStream,
					closeStandaloneSSEStream: n?.closeStandaloneSSEStream,
				}
			Promise.resolve()
				.then(() => {
					c && this.assertTaskHandlerCapability(r.method)
				})
				.then(() => i(r, h))
				.then(
					async (g) => {
						if (a.signal.aborted) return
						const m = { result: g, jsonrpc: "2.0", id: r.id }
						o && this._taskMessageQueue
							? await this._enqueueTaskMessage(o, { type: "response", message: m, timestamp: Date.now() }, e?.sessionId)
							: await e?.send(m)
					},
					async (g) => {
						if (a.signal.aborted) return
						const m = {
							jsonrpc: "2.0",
							id: r.id,
							error: {
								code: Number.isSafeInteger(g.code) ? g.code : E.InternalError,
								message: g.message ?? "Internal error",
								...(g.data !== void 0 && { data: g.data }),
							},
						}
						o && this._taskMessageQueue
							? await this._enqueueTaskMessage(o, { type: "error", message: m, timestamp: Date.now() }, e?.sessionId)
							: await e?.send(m)
					},
				)
				.catch((g) => this._onerror(new Error(`Failed to send response: ${g}`)))
				.finally(() => {
					this._requestHandlerAbortControllers.delete(r.id)
				})
		}
		_onprogress(r) {
			const { progressToken: n, ...i } = r.params,
				e = Number(n),
				o = this._progressHandlers.get(e)
			if (!o) {
				this._onerror(new Error(`Received a progress notification for an unknown token: ${JSON.stringify(r)}`))
				return
			}
			const a = this._responseHandlers.get(e),
				c = this._timeoutInfo.get(e)
			if (c && a && c.resetTimeoutOnProgress)
				try {
					this._resetTimeout(e)
				} catch (p) {
					this._responseHandlers.delete(e), this._progressHandlers.delete(e), this._cleanupTimeout(e), a(p)
					return
				}
			o(i)
		}
		_onresponse(r) {
			const n = Number(r.id),
				i = this._requestResolvers.get(n)
			if (i) {
				if ((this._requestResolvers.delete(n), Ct(r))) i(r)
				else {
					const a = new N(r.error.code, r.error.message, r.error.data)
					i(a)
				}
				return
			}
			const e = this._responseHandlers.get(n)
			if (e === void 0) {
				this._onerror(new Error(`Received a response for an unknown message ID: ${JSON.stringify(r)}`))
				return
			}
			this._responseHandlers.delete(n), this._cleanupTimeout(n)
			let o = !1
			if (Ct(r) && r.result && typeof r.result == "object") {
				const a = r.result
				if (a.task && typeof a.task == "object") {
					const c = a.task
					typeof c.taskId == "string" && ((o = !0), this._taskProgressTokens.set(c.taskId, n))
				}
			}
			if ((o || this._progressHandlers.delete(n), Ct(r))) e(r)
			else {
				const a = N.fromError(r.error.code, r.error.message, r.error.data)
				e(a)
			}
		}
		get transport() {
			return this._transport
		}
		async close() {
			await this._transport?.close()
		}
		async *requestStream(r, n, i) {
			const { task: e } = i ?? {}
			if (!e) {
				try {
					yield { type: "result", result: await this.request(r, n, i) }
				} catch (a) {
					yield { type: "error", error: a instanceof N ? a : new N(E.InternalError, String(a)) }
				}
				return
			}
			let o
			try {
				const a = await this.request(r, Qr, i)
				if (a.task) (o = a.task.taskId), yield { type: "taskCreated", task: a.task }
				else throw new N(E.InternalError, "Task creation did not return a task")
				for (;;) {
					const c = await this.getTask({ taskId: o }, i)
					if ((yield { type: "taskStatus", task: c }, _e(c.status))) {
						c.status === "completed"
							? yield { type: "result", result: await this.getTaskResult({ taskId: o }, n, i) }
							: c.status === "failed"
								? yield { type: "error", error: new N(E.InternalError, `Task ${o} failed`) }
								: c.status === "cancelled" &&
									(yield { type: "error", error: new N(E.InternalError, `Task ${o} was cancelled`) })
						return
					}
					if (c.status === "input_required") {
						yield { type: "result", result: await this.getTaskResult({ taskId: o }, n, i) }
						return
					}
					const p = c.pollInterval ?? this._options?.defaultTaskPollInterval ?? 1e3
					await new Promise((h) => setTimeout(h, p)), i?.signal?.throwIfAborted()
				}
			} catch (a) {
				yield { type: "error", error: a instanceof N ? a : new N(E.InternalError, String(a)) }
			}
		}
		request(r, n, i) {
			const { relatedRequestId: e, resumptionToken: o, onresumptiontoken: a, task: c, relatedTask: p } = i ?? {}
			return new Promise((h, g) => {
				const m = (S) => {
					g(S)
				}
				if (!this._transport) {
					m(new Error("Not connected"))
					return
				}
				if (this._options?.enforceStrictCapabilities === !0)
					try {
						this.assertCapabilityForMethod(r.method), c && this.assertTaskCapability(r.method)
					} catch (S) {
						m(S)
						return
					}
				i?.signal?.throwIfAborted()
				const $ = this._requestMessageId++,
					b = { ...r, jsonrpc: "2.0", id: $ }
				i?.onprogress &&
					(this._progressHandlers.set($, i.onprogress),
					(b.params = { ...r.params, _meta: { ...(r.params?._meta || {}), progressToken: $ } })),
					c && (b.params = { ...b.params, task: c }),
					p && (b.params = { ...b.params, _meta: { ...(b.params?._meta || {}), [be]: p } })
				const d = (S) => {
					this._responseHandlers.delete($),
						this._progressHandlers.delete($),
						this._cleanupTimeout($),
						this._transport
							?.send(
								{ jsonrpc: "2.0", method: "notifications/cancelled", params: { requestId: $, reason: String(S) } },
								{ relatedRequestId: e, resumptionToken: o, onresumptiontoken: a },
							)
							.catch((O) => this._onerror(new Error(`Failed to send cancellation: ${O}`)))
					const I = S instanceof N ? S : new N(E.RequestTimeout, String(S))
					g(I)
				}
				this._responseHandlers.set($, (S) => {
					if (!i?.signal?.aborted) {
						if (S instanceof Error) return g(S)
						try {
							const I = ln(n, S.result)
							I.success ? h(I.data) : g(I.error)
						} catch (I) {
							g(I)
						}
					}
				}),
					i?.signal?.addEventListener("abort", () => {
						d(i?.signal?.reason)
					})
				const x = i?.timeout ?? lf,
					k = () => d(N.fromError(E.RequestTimeout, "Request timed out", { timeout: x }))
				this._setupTimeout($, x, i?.maxTotalTimeout, k, i?.resetTimeoutOnProgress ?? !1)
				const D = p?.taskId
				if (D) {
					const S = (I) => {
						const O = this._responseHandlers.get($)
						O ? O(I) : this._onerror(new Error(`Response handler missing for side-channeled request ${$}`))
					}
					this._requestResolvers.set($, S),
						this._enqueueTaskMessage(D, { type: "request", message: b, timestamp: Date.now() }).catch((I) => {
							this._cleanupTimeout($), g(I)
						})
				} else
					this._transport.send(b, { relatedRequestId: e, resumptionToken: o, onresumptiontoken: a }).catch((S) => {
						this._cleanupTimeout($), g(S)
					})
			})
		}
		async getTask(r, n) {
			return this.request({ method: "tasks/get", params: r }, Yr, n)
		}
		async getTaskResult(r, n, i) {
			return this.request({ method: "tasks/result", params: r }, n, i)
		}
		async listTasks(r, n) {
			return this.request({ method: "tasks/list", params: r }, rn, n)
		}
		async cancelTask(r, n) {
			return this.request({ method: "tasks/cancel", params: r }, wu, n)
		}
		async notification(r, n) {
			if (!this._transport) throw new Error("Not connected")
			this.assertNotificationCapability(r.method)
			const i = n?.relatedTask?.taskId
			if (i) {
				const c = {
					...r,
					jsonrpc: "2.0",
					params: { ...r.params, _meta: { ...(r.params?._meta || {}), [be]: n.relatedTask } },
				}
				await this._enqueueTaskMessage(i, { type: "notification", message: c, timestamp: Date.now() })
				return
			}
			if (
				(this._options?.debouncedNotificationMethods ?? []).includes(r.method) &&
				!r.params &&
				!n?.relatedRequestId &&
				!n?.relatedTask
			) {
				if (this._pendingDebouncedNotifications.has(r.method)) return
				this._pendingDebouncedNotifications.add(r.method),
					Promise.resolve().then(() => {
						if ((this._pendingDebouncedNotifications.delete(r.method), !this._transport)) return
						let c = { ...r, jsonrpc: "2.0" }
						n?.relatedTask &&
							(c = { ...c, params: { ...c.params, _meta: { ...(c.params?._meta || {}), [be]: n.relatedTask } } }),
							this._transport?.send(c, n).catch((p) => this._onerror(p))
					})
				return
			}
			let a = { ...r, jsonrpc: "2.0" }
			n?.relatedTask &&
				(a = { ...a, params: { ...a.params, _meta: { ...(a.params?._meta || {}), [be]: n.relatedTask } } }),
				await this._transport.send(a, n)
		}
		setRequestHandler(r, n) {
			const i = ys(r)
			this.assertRequestHandlerCapability(i),
				this._requestHandlers.set(i, (e, o) => {
					const a = $s(r, e)
					return Promise.resolve(n(a, o))
				})
		}
		removeRequestHandler(r) {
			this._requestHandlers.delete(r)
		}
		assertCanSetRequestHandler(r) {
			if (this._requestHandlers.has(r))
				throw new Error(`A request handler for ${r} already exists, which would be overridden`)
		}
		setNotificationHandler(r, n) {
			const i = ys(r)
			this._notificationHandlers.set(i, (e) => {
				const o = $s(r, e)
				return Promise.resolve(n(o))
			})
		}
		removeNotificationHandler(r) {
			this._notificationHandlers.delete(r)
		}
		_cleanupTaskProgressHandler(r) {
			const n = this._taskProgressTokens.get(r)
			n !== void 0 && (this._progressHandlers.delete(n), this._taskProgressTokens.delete(r))
		}
		async _enqueueTaskMessage(r, n, i) {
			if (!this._taskStore || !this._taskMessageQueue)
				throw new Error("Cannot enqueue task message: taskStore and taskMessageQueue are not configured")
			const e = this._options?.maxTaskQueueSize
			await this._taskMessageQueue.enqueue(r, n, i, e)
		}
		async _clearTaskQueue(r, n) {
			if (this._taskMessageQueue) {
				const i = await this._taskMessageQueue.dequeueAll(r, n)
				for (const e of i)
					if (e.type === "request" && Ya(e.message)) {
						const o = e.message.id,
							a = this._requestResolvers.get(o)
						a
							? (a(new N(E.InternalError, "Task cancelled or completed")), this._requestResolvers.delete(o))
							: this._onerror(new Error(`Resolver missing for request ${o} during task ${r} cleanup`))
					}
			}
		}
		async _waitForTaskUpdate(r, n) {
			let i = this._options?.defaultTaskPollInterval ?? 1e3
			try {
				const e = await this._taskStore?.getTask(r)
				e?.pollInterval && (i = e.pollInterval)
			} catch {}
			return new Promise((e, o) => {
				if (n.aborted) {
					o(new N(E.InvalidRequest, "Request cancelled"))
					return
				}
				const a = setTimeout(e, i)
				n.addEventListener(
					"abort",
					() => {
						clearTimeout(a), o(new N(E.InvalidRequest, "Request cancelled"))
					},
					{ once: !0 },
				)
			})
		}
		requestTaskStore(r, n) {
			const i = this._taskStore
			if (!i) throw new Error("No task store configured")
			return {
				createTask: async (e) => {
					if (!r) throw new Error("No request provided")
					return await i.createTask(e, r.id, { method: r.method, params: r.params }, n)
				},
				getTask: async (e) => {
					const o = await i.getTask(e, n)
					if (!o) throw new N(E.InvalidParams, "Failed to retrieve task: Task not found")
					return o
				},
				storeTaskResult: async (e, o, a) => {
					await i.storeTaskResult(e, o, a, n)
					const c = await i.getTask(e, n)
					if (c) {
						const p = Ht.parse({ method: "notifications/tasks/status", params: c })
						await this.notification(p), _e(c.status) && this._cleanupTaskProgressHandler(e)
					}
				},
				getTaskResult: (e) => i.getTaskResult(e, n),
				updateTaskStatus: async (e, o, a) => {
					const c = await i.getTask(e, n)
					if (!c) throw new N(E.InvalidParams, `Task "${e}" not found - it may have been cleaned up`)
					if (_e(c.status))
						throw new N(
							E.InvalidParams,
							`Cannot update task "${e}" from terminal status "${c.status}" to "${o}". Terminal states (completed, failed, cancelled) cannot transition to other states.`,
						)
					await i.updateTaskStatus(e, o, a, n)
					const p = await i.getTask(e, n)
					if (p) {
						const h = Ht.parse({ method: "notifications/tasks/status", params: p })
						await this.notification(h), _e(p.status) && this._cleanupTaskProgressHandler(e)
					}
				},
				listTasks: (e) => i.listTasks(e, n),
			}
		}
	}
var Cu = "2026-01-26",
	Fy = "ui/open-link",
	Hy = "ui/download-file",
	Jy = "ui/message",
	By = "ui/notifications/sandbox-proxy-ready",
	Wy = "ui/notifications/sandbox-resource-ready",
	Gy = "ui/notifications/size-changed",
	Ky = "ui/notifications/tool-input",
	mf = "ui/notifications/tool-input-partial",
	Qy = "ui/notifications/tool-result",
	Xy = "ui/notifications/tool-cancelled",
	Yy = "ui/notifications/host-context-changed",
	e$ = "ui/resource-teardown",
	t$ = "ui/initialize",
	r$ = "ui/notifications/initialized",
	n$ = "ui/request-display-mode",
	pf = s.union([s.literal("light"), s.literal("dark")]).describe("Color theme preference for the host environment."),
	Gt = s
		.union([s.literal("inline"), s.literal("fullscreen"), s.literal("pip")])
		.describe("Display mode for UI presentation."),
	df = s
		.union([
			s.literal("--color-background-primary"),
			s.literal("--color-background-secondary"),
			s.literal("--color-background-tertiary"),
			s.literal("--color-background-inverse"),
			s.literal("--color-background-ghost"),
			s.literal("--color-background-info"),
			s.literal("--color-background-danger"),
			s.literal("--color-background-success"),
			s.literal("--color-background-warning"),
			s.literal("--color-background-disabled"),
			s.literal("--color-text-primary"),
			s.literal("--color-text-secondary"),
			s.literal("--color-text-tertiary"),
			s.literal("--color-text-inverse"),
			s.literal("--color-text-ghost"),
			s.literal("--color-text-info"),
			s.literal("--color-text-danger"),
			s.literal("--color-text-success"),
			s.literal("--color-text-warning"),
			s.literal("--color-text-disabled"),
			s.literal("--color-border-primary"),
			s.literal("--color-border-secondary"),
			s.literal("--color-border-tertiary"),
			s.literal("--color-border-inverse"),
			s.literal("--color-border-ghost"),
			s.literal("--color-border-info"),
			s.literal("--color-border-danger"),
			s.literal("--color-border-success"),
			s.literal("--color-border-warning"),
			s.literal("--color-border-disabled"),
			s.literal("--color-ring-primary"),
			s.literal("--color-ring-secondary"),
			s.literal("--color-ring-inverse"),
			s.literal("--color-ring-info"),
			s.literal("--color-ring-danger"),
			s.literal("--color-ring-success"),
			s.literal("--color-ring-warning"),
			s.literal("--font-sans"),
			s.literal("--font-mono"),
			s.literal("--font-weight-normal"),
			s.literal("--font-weight-medium"),
			s.literal("--font-weight-semibold"),
			s.literal("--font-weight-bold"),
			s.literal("--font-text-xs-size"),
			s.literal("--font-text-sm-size"),
			s.literal("--font-text-md-size"),
			s.literal("--font-text-lg-size"),
			s.literal("--font-heading-xs-size"),
			s.literal("--font-heading-sm-size"),
			s.literal("--font-heading-md-size"),
			s.literal("--font-heading-lg-size"),
			s.literal("--font-heading-xl-size"),
			s.literal("--font-heading-2xl-size"),
			s.literal("--font-heading-3xl-size"),
			s.literal("--font-text-xs-line-height"),
			s.literal("--font-text-sm-line-height"),
			s.literal("--font-text-md-line-height"),
			s.literal("--font-text-lg-line-height"),
			s.literal("--font-heading-xs-line-height"),
			s.literal("--font-heading-sm-line-height"),
			s.literal("--font-heading-md-line-height"),
			s.literal("--font-heading-lg-line-height"),
			s.literal("--font-heading-xl-line-height"),
			s.literal("--font-heading-2xl-line-height"),
			s.literal("--font-heading-3xl-line-height"),
			s.literal("--border-radius-xs"),
			s.literal("--border-radius-sm"),
			s.literal("--border-radius-md"),
			s.literal("--border-radius-lg"),
			s.literal("--border-radius-xl"),
			s.literal("--border-radius-full"),
			s.literal("--border-width-regular"),
			s.literal("--shadow-hairline"),
			s.literal("--shadow-sm"),
			s.literal("--shadow-md"),
			s.literal("--shadow-lg"),
		])
		.describe("CSS variable keys available to MCP apps for theming."),
	ff = s
		.record(
			df.describe(`Style variables for theming MCP apps.

Individual style keys are optional - hosts may provide any subset of these values.
Values are strings containing CSS values (colors, sizes, font stacks, etc.).

Note: This type uses \`Record<K, string | undefined>\` rather than \`Partial<Record<K, string>>\`
for compatibility with Zod schema generation. Both are functionally equivalent for validation.`),
			s.union([s.string(), s.undefined()]).describe(`Style variables for theming MCP apps.

Individual style keys are optional - hosts may provide any subset of these values.
Values are strings containing CSS values (colors, sizes, font stacks, etc.).

Note: This type uses \`Record<K, string | undefined>\` rather than \`Partial<Record<K, string>>\`
for compatibility with Zod schema generation. Both are functionally equivalent for validation.`),
		)
		.describe(`Style variables for theming MCP apps.

Individual style keys are optional - hosts may provide any subset of these values.
Values are strings containing CSS values (colors, sizes, font stacks, etc.).

Note: This type uses \`Record<K, string | undefined>\` rather than \`Partial<Record<K, string>>\`
for compatibility with Zod schema generation. Both are functionally equivalent for validation.`),
	gf = s.object({
		method: s.literal("ui/open-link"),
		params: s.object({ url: s.string().describe("URL to open in the host's browser") }),
	}),
	a$ = s
		.object({
			isError: s
				.boolean()
				.optional()
				.describe("True if the host failed to open the URL (e.g., due to security policy)."),
		})
		.passthrough(),
	s$ = s
		.object({
			isError: s.boolean().optional().describe("True if the download failed (e.g., user cancelled or host denied)."),
		})
		.passthrough(),
	c$ = s
		.object({ isError: s.boolean().optional().describe("True if the host rejected or failed to deliver the message.") })
		.passthrough(),
	hf = s.object({ method: s.literal("ui/notifications/sandbox-proxy-ready"), params: s.object({}) }),
	xs = s.object({
		connectDomains: s
			.array(s.string())
			.optional()
			.describe(`Origins for network requests (fetch/XHR/WebSocket).

- Maps to CSP \`connect-src\` directive
- Empty or omitted \u2192 no network connections (secure default)`),
		resourceDomains: s
			.array(s.string())
			.optional()
			.describe(
				"Origins for static resources (images, scripts, stylesheets, fonts, media).\n\n- Maps to CSP `img-src`, `script-src`, `style-src`, `font-src`, `media-src` directives\n- Wildcard subdomains supported: `https://*.example.com`\n- Empty or omitted \u2192 no network resources (secure default)",
			),
		frameDomains: s
			.array(s.string())
			.optional()
			.describe(
				"Origins for nested iframes.\n\n- Maps to CSP `frame-src` directive\n- Empty or omitted \u2192 no nested iframes allowed (`frame-src 'none'`)",
			),
		baseUriDomains: s
			.array(s.string())
			.optional()
			.describe(
				"Allowed base URIs for the document.\n\n- Maps to CSP `base-uri` directive\n- Empty or omitted \u2192 only same origin allowed (`base-uri 'self'`)",
			),
	}),
	zs = s.object({
		camera: s.object({}).optional().describe("Request camera access.\n\nMaps to Permission Policy `camera` feature."),
		microphone: s
			.object({})
			.optional()
			.describe("Request microphone access.\n\nMaps to Permission Policy `microphone` feature."),
		geolocation: s
			.object({})
			.optional()
			.describe("Request geolocation access.\n\nMaps to Permission Policy `geolocation` feature."),
		clipboardWrite: s
			.object({})
			.optional()
			.describe("Request clipboard write access.\n\nMaps to Permission Policy `clipboard-write` feature."),
	}),
	vf = s.object({
		method: s.literal("ui/notifications/size-changed"),
		params: s.object({
			width: s.number().optional().describe("New width in pixels."),
			height: s.number().optional().describe("New height in pixels."),
		}),
	}),
	u$ = s.object({
		method: s.literal("ui/notifications/tool-input"),
		params: s.object({
			arguments: s
				.record(s.string(), s.unknown().describe("Complete tool call arguments as key-value pairs."))
				.optional()
				.describe("Complete tool call arguments as key-value pairs."),
		}),
	}),
	l$ = s.object({
		method: s.literal("ui/notifications/tool-input-partial"),
		params: s.object({
			arguments: s
				.record(s.string(), s.unknown().describe("Partial tool call arguments (incomplete, may change)."))
				.optional()
				.describe("Partial tool call arguments (incomplete, may change)."),
		}),
	}),
	m$ = s.object({
		method: s.literal("ui/notifications/tool-cancelled"),
		params: s.object({
			reason: s.string().optional().describe('Optional reason for the cancellation (e.g., "user action", "timeout").'),
		}),
	}),
	bf = s.object({ fonts: s.string().optional() }),
	_f = s.object({
		variables: ff.optional().describe("CSS variables for theming the app."),
		css: bf.optional().describe("CSS blocks that apps can inject."),
	}),
	p$ = s.object({ method: s.literal("ui/resource-teardown"), params: s.object({}) }),
	yf = s.record(s.string(), s.unknown()),
	Du = s.object({
		text: s.object({}).optional().describe("Host supports text content blocks."),
		image: s.object({}).optional().describe("Host supports image content blocks."),
		audio: s.object({}).optional().describe("Host supports audio content blocks."),
		resource: s.object({}).optional().describe("Host supports resource content blocks."),
		resourceLink: s.object({}).optional().describe("Host supports resource link content blocks."),
		structuredContent: s.object({}).optional().describe("Host supports structured content."),
	}),
	$f = s.object({
		experimental: s.object({}).optional().describe("Experimental features (structure TBD)."),
		openLinks: s.object({}).optional().describe("Host supports opening external URLs."),
		downloadFile: s.object({}).optional().describe("Host supports file downloads via ui/download-file."),
		serverTools: s
			.object({ listChanged: s.boolean().optional().describe("Host supports tools/list_changed notifications.") })
			.optional()
			.describe("Host can proxy tool calls to the MCP server."),
		serverResources: s
			.object({ listChanged: s.boolean().optional().describe("Host supports resources/list_changed notifications.") })
			.optional()
			.describe("Host can proxy resource reads to the MCP server."),
		logging: s.object({}).optional().describe("Host accepts log messages."),
		sandbox: s
			.object({
				permissions: zs.optional().describe("Permissions granted by the host (camera, microphone, geolocation)."),
				csp: xs.optional().describe("CSP domains approved by the host."),
			})
			.optional()
			.describe("Sandbox configuration applied by the host."),
		updateModelContext: Du.optional().describe(
			"Host accepts context updates (ui/update-model-context) to be included in the model's context for future turns.",
		),
		message: Du.optional().describe("Host supports receiving content messages (ui/message) from the view."),
	}),
	xf = s.object({
		experimental: s.object({}).optional().describe("Experimental features (structure TBD)."),
		tools: s
			.object({ listChanged: s.boolean().optional().describe("App supports tools/list_changed notifications.") })
			.optional()
			.describe("App exposes MCP-style tools that the host can call."),
		availableDisplayModes: s.array(Gt).optional().describe("Display modes the app supports."),
	}),
	zf = s.object({ method: s.literal("ui/notifications/initialized"), params: s.object({}).optional() }),
	d$ = s.object({
		csp: xs.optional().describe("Content Security Policy configuration for UI resources."),
		permissions: zs.optional().describe("Sandbox permissions requested by the UI resource."),
		domain: s
			.string()
			.optional()
			.describe(`Dedicated origin for view sandbox.

Useful when views need stable, dedicated origins for OAuth callbacks, CORS policies, or API key allowlists.

**Host-dependent:** The format and validation rules for this field are determined by each host. Servers MUST consult host-specific documentation for the expected domain format. Common patterns include:
- Hash-based subdomains (e.g., \`{hash}.claudemcpcontent.com\`)
- URL-derived subdomains (e.g., \`www-example-com.oaiusercontent.com\`)

If omitted, host uses default sandbox origin (typically per-conversation).`),
		prefersBorder: s
			.boolean()
			.optional()
			.describe(`Visual boundary preference - true if view prefers a visible border.

Boolean requesting whether a visible border and background is provided by the host. Specifying an explicit value for this is recommended because hosts' defaults may vary.

- \`true\`: request visible border + background
- \`false\`: request no visible border + background
- omitted: host decides border`),
	}),
	Ru = s.object({
		method: s.literal("ui/request-display-mode"),
		params: s.object({ mode: Gt.describe("The display mode being requested.") }),
	}),
	f$ = s
		.object({
			mode: Gt.describe("The display mode that was actually set. May differ from requested if not supported."),
		})
		.passthrough(),
	kf = s.union([s.literal("model"), s.literal("app")]).describe("Tool visibility scope - who can access the tool."),
	g$ = s.object({
		resourceUri: s.string().optional(),
		visibility: s
			.array(kf)
			.optional()
			.describe(`Who can access this tool. Default: ["model", "app"]
- "model": Tool visible to and callable by the agent
- "app": Tool callable by the app from this server only`),
	}),
	h$ = s.object({
		mimeTypes: s
			.array(s.string())
			.optional()
			.describe(
				'Array of supported MIME types for UI resources.\nMust include `"text/html;profile=mcp-app"` for MCP Apps support.',
			),
	}),
	Sf = s.object({
		method: s.literal("ui/download-file"),
		params: s.object({
			contents: s
				.array(s.union([gs, hs]))
				.describe(
					"Resource contents to download \u2014 embedded (inline data) or linked (host fetches). Uses standard MCP resource types.",
				),
		}),
	}),
	wf = s.object({
		method: s.literal("ui/message"),
		params: s.object({
			role: s.literal("user").describe('Message role, currently only "user" is supported.'),
			content: s.array(Ge).describe("Message content blocks (text, image, etc.)."),
		}),
	}),
	v$ = s.object({
		method: s.literal("ui/notifications/sandbox-resource-ready"),
		params: s.object({
			html: s.string().describe("HTML content to load into the inner iframe."),
			sandbox: s.string().optional().describe("Optional override for the inner iframe's sandbox attribute."),
			csp: xs.optional().describe("CSP configuration from resource metadata."),
			permissions: zs.optional().describe("Sandbox permissions from resource metadata."),
		}),
	}),
	b$ = s.object({
		method: s.literal("ui/notifications/tool-result"),
		params: Oe.describe("Standard MCP tool execution result."),
	}),
	Lu = s
		.object({
			toolInfo: s
				.object({
					id: Be.optional().describe("JSON-RPC id of the tools/call request."),
					tool: sn.describe("Tool definition including name, inputSchema, etc."),
				})
				.optional()
				.describe("Metadata of the tool call that instantiated this App."),
			theme: pf.optional().describe("Current color theme preference."),
			styles: _f.optional().describe("Style configuration for theming the app."),
			displayMode: Gt.optional().describe("How the UI is currently displayed."),
			availableDisplayModes: s.array(Gt).optional().describe("Display modes the host supports."),
			containerDimensions: s
				.union([
					s.object({ height: s.number().describe("Fixed container height in pixels.") }),
					s.object({
						maxHeight: s.union([s.number(), s.undefined()]).optional().describe("Maximum container height in pixels."),
					}),
				])
				.and(
					s.union([
						s.object({ width: s.number().describe("Fixed container width in pixels.") }),
						s.object({
							maxWidth: s.union([s.number(), s.undefined()]).optional().describe("Maximum container width in pixels."),
						}),
					]),
				)
				.optional()
				.describe(`Container dimensions. Represents the dimensions of the iframe or other
container holding the app. Specify either width or maxWidth, and either height or maxHeight.`),
			locale: s.string().optional().describe("User's language and region preference in BCP 47 format."),
			timeZone: s.string().optional().describe("User's timezone in IANA format."),
			userAgent: s.string().optional().describe("Host application identifier."),
			platform: s
				.union([s.literal("web"), s.literal("desktop"), s.literal("mobile")])
				.optional()
				.describe("Platform type for responsive design decisions."),
			deviceCapabilities: s
				.object({
					touch: s.boolean().optional().describe("Whether the device supports touch input."),
					hover: s.boolean().optional().describe("Whether the device supports hover interactions."),
				})
				.optional()
				.describe("Device input capabilities."),
			safeAreaInsets: s
				.object({
					top: s.number().describe("Top safe area inset in pixels."),
					right: s.number().describe("Right safe area inset in pixels."),
					bottom: s.number().describe("Bottom safe area inset in pixels."),
					left: s.number().describe("Left safe area inset in pixels."),
				})
				.optional()
				.describe("Mobile safe area boundaries in pixels."),
		})
		.passthrough(),
	_$ = s.object({
		method: s.literal("ui/notifications/host-context-changed"),
		params: Lu.describe("Partial context update containing only changed fields."),
	}),
	If = s.object({
		method: s.literal("ui/update-model-context"),
		params: s.object({
			content: s.array(Ge).optional().describe("Context content blocks (text, image, etc.)."),
			structuredContent: s
				.record(s.string(), s.unknown().describe("Structured content for machine-readable context data."))
				.optional()
				.describe("Structured content for machine-readable context data."),
		}),
	}),
	jf = s.object({
		method: s.literal("ui/initialize"),
		params: s.object({
			appInfo: Mt.describe("App identification (name and version)."),
			appCapabilities: xf.describe("Features and capabilities this app provides."),
			protocolVersion: s.string().describe("Protocol version this app supports."),
		}),
	}),
	y$ = s
		.object({
			protocolVersion: s.string().describe('Negotiated protocol version string (e.g., "2025-11-21").'),
			hostInfo: Mt.describe("Host application identification and version."),
			hostCapabilities: $f.describe("Features and capabilities provided by the host."),
			hostContext: Lu.describe("Rich context about the host environment."),
		})
		.passthrough(),
	Eu = class {
		eventTarget
		eventSource
		messageListener
		constructor(r = window.parent, n) {
			;(this.eventTarget = r),
				(this.eventSource = n),
				(this.messageListener = (i) => {
					if (n && i.source !== this.eventSource) {
						console.debug("Ignoring message from unknown source", i)
						return
					}
					const e = Su.safeParse(i.data)
					e.success
						? (console.debug("Parsed message", e.data), this.onmessage?.(e.data))
						: i.data?.jsonrpc !== "2.0"
							? console.debug("Ignoring non-JSON-RPC message", e.error.message, i)
							: (console.error("Failed to parse message", e.error.message, i),
								this.onerror?.(Error("Invalid JSON-RPC message received: " + e.error.message)))
				})
		}
		async start() {
			window.addEventListener("message", this.messageListener)
		}
		async send(r, n) {
			r.method !== mf && console.debug("Sending message", r), this.eventTarget.postMessage(r, "*")
		}
		async close() {
			window.removeEventListener("message", this.messageListener), this.onclose?.()
		}
		onclose
		onerror
		onmessage
		sessionId
		setProtocolVersion
	},
	Pf = "ui/resourceUri",
	k$ = "text/html;profile=mcp-app"
function S$(t) {
	let r = t._meta?.ui?.resourceUri
	if ((r === void 0 && (r = t._meta?.[Pf]), typeof r == "string" && r.startsWith("ui://"))) return r
	if (r !== void 0) throw Error(`Invalid UI resource URI: ${JSON.stringify(r)}`)
}
function w$(t) {
	const r = t._meta?.ui?.visibility
	return r ? r.length === 1 && r[0] === "model" : !1
}
function I$(t) {
	const r = t._meta?.ui?.visibility
	return r ? r.length === 1 && r[0] === "app" : !1
}
function j$(t) {
	if (!t) return ""
	const r = []
	return (
		t.camera && r.push("camera"),
		t.microphone && r.push("microphone"),
		t.geolocation && r.push("geolocation"),
		t.clipboardWrite && r.push("clipboard-write"),
		r.join("; ")
	)
}
var Tf = [Cu],
	Au = class extends Wt {
		_client
		_hostInfo
		_capabilities
		_appCapabilities
		_hostContext = {}
		_appInfo
		constructor(r, n, i, e) {
			super(e),
				(this._client = r),
				(this._hostInfo = n),
				(this._capabilities = i),
				(this._hostContext = e?.hostContext || {}),
				this.setRequestHandler(jf, (o) => this._oninitialize(o)),
				this.setRequestHandler(Te, (o, a) => (this.onping?.(o.params, a), {})),
				this.setRequestHandler(Ru, (o) => ({ mode: this._hostContext.displayMode ?? "inline" }))
		}
		getAppCapabilities() {
			return this._appCapabilities
		}
		getAppVersion() {
			return this._appInfo
		}
		onping
		set onsizechange(r) {
			this.setNotificationHandler(vf, (n) => r(n.params))
		}
		set onsandboxready(r) {
			this.setNotificationHandler(hf, (n) => r(n.params))
		}
		set oninitialized(r) {
			this.setNotificationHandler(zf, (n) => r(n.params))
		}
		set onmessage(r) {
			this.setRequestHandler(wf, async (n, i) => r(n.params, i))
		}
		set onopenlink(r) {
			this.setRequestHandler(gf, async (n, i) => r(n.params, i))
		}
		set ondownloadfile(r) {
			this.setRequestHandler(Sf, async (n, i) => r(n.params, i))
		}
		set onrequestdisplaymode(r) {
			this.setRequestHandler(Ru, async (n, i) => r(n.params, i))
		}
		set onloggingmessage(r) {
			this.setNotificationHandler(_s, async (n) => {
				r(n.params)
			})
		}
		set onupdatemodelcontext(r) {
			this.setRequestHandler(If, async (n, i) => r(n.params, i))
		}
		set oncalltool(r) {
			this.setRequestHandler(cn, async (n, i) => r(n.params, i))
		}
		sendToolListChanged(r = {}) {
			return this.notification({ method: "notifications/tools/list_changed", params: r })
		}
		set onlistresources(r) {
			this.setRequestHandler(os, async (n, i) => r(n.params, i))
		}
		set onlistresourcetemplates(r) {
			this.setRequestHandler(is, async (n, i) => r(n.params, i))
		}
		set onreadresource(r) {
			this.setRequestHandler(cs, async (n, i) => r(n.params, i))
		}
		sendResourceListChanged(r = {}) {
			return this.notification({ method: "notifications/resources/list_changed", params: r })
		}
		set onlistprompts(r) {
			this.setRequestHandler(ls, async (n, i) => r(n.params, i))
		}
		sendPromptListChanged(r = {}) {
			return this.notification({ method: "notifications/prompts/list_changed", params: r })
		}
		assertCapabilityForMethod(r) {}
		assertRequestHandlerCapability(r) {}
		assertNotificationCapability(r) {}
		assertTaskCapability(r) {
			throw Error("Tasks are not supported in MCP Apps")
		}
		assertTaskHandlerCapability(r) {
			throw Error("Task handlers are not supported in MCP Apps")
		}
		getCapabilities() {
			return this._capabilities
		}
		async _oninitialize(r) {
			const n = r.params.protocolVersion
			return (
				(this._appCapabilities = r.params.appCapabilities),
				(this._appInfo = r.params.appInfo),
				{
					protocolVersion: Tf.includes(n) ? n : Cu,
					hostCapabilities: this.getCapabilities(),
					hostInfo: this._hostInfo,
					hostContext: this._hostContext,
				}
			)
		}
		setHostContext(r) {
			let n = {},
				i = !1
			for (const e of Object.keys(r)) {
				const o = this._hostContext[e],
					a = r[e]
				Of(o, a) || ((n[e] = a), (i = !0))
			}
			i && ((this._hostContext = r), this.sendHostContextChange(n))
		}
		sendHostContextChange(r) {
			return this.notification({ method: "ui/notifications/host-context-changed", params: r })
		}
		sendToolInput(r) {
			return this.notification({ method: "ui/notifications/tool-input", params: r })
		}
		sendToolInputPartial(r) {
			return this.notification({ method: "ui/notifications/tool-input-partial", params: r })
		}
		sendToolResult(r) {
			return this.notification({ method: "ui/notifications/tool-result", params: r })
		}
		sendToolCancelled(r) {
			return this.notification({ method: "ui/notifications/tool-cancelled", params: r })
		}
		sendSandboxResourceReady(r) {
			return this.notification({ method: "ui/notifications/sandbox-resource-ready", params: r })
		}
		teardownResource(r, n) {
			return this.request({ method: "ui/resource-teardown", params: r }, yf, n)
		}
		sendResourceTeardown = this.teardownResource
		async connect(r) {
			if (this.transport) throw Error("AppBridge is already connected. Call close() before connecting again.")
			if (this._client) {
				const n = this._client.getServerCapabilities()
				if (!n) throw Error("Client server capabilities not available")
				n.tools &&
					((this.oncalltool = async (i, e) =>
						this._client.request({ method: "tools/call", params: i }, Oe, { signal: e.signal })),
					n.tools.listChanged && this._client.setNotificationHandler(bs, (i) => this.sendToolListChanged(i.params))),
					n.resources &&
						((this.onlistresources = async (i, e) =>
							this._client.request({ method: "resources/list", params: i }, on, { signal: e.signal })),
						(this.onlistresourcetemplates = async (i, e) =>
							this._client.request({ method: "resources/templates/list", params: i }, as, { signal: e.signal })),
						(this.onreadresource = async (i, e) =>
							this._client.request({ method: "resources/read", params: i }, an, { signal: e.signal })),
						n.resources.listChanged &&
							this._client.setNotificationHandler(us, (i) => this.sendResourceListChanged(i.params))),
					n.prompts &&
						((this.onlistprompts = async (i, e) =>
							this._client.request({ method: "prompts/list", params: i }, ms, { signal: e.signal })),
						n.prompts.listChanged &&
							this._client.setNotificationHandler(vs, (i) => this.sendPromptListChanged(i.params)))
			}
			return super.connect(r)
		}
	}
function Of(t, r) {
	return JSON.stringify(t) === JSON.stringify(r)
}
export {
	Au as AppBridge,
	Hy as DOWNLOAD_FILE_METHOD,
	Yy as HOST_CONTEXT_CHANGED_METHOD,
	r$ as INITIALIZED_METHOD,
	t$ as INITIALIZE_METHOD,
	Cu as LATEST_PROTOCOL_VERSION,
	Jy as MESSAGE_METHOD,
	xf as McpUiAppCapabilitiesSchema,
	Gt as McpUiDisplayModeSchema,
	Sf as McpUiDownloadFileRequestSchema,
	s$ as McpUiDownloadFileResultSchema,
	$f as McpUiHostCapabilitiesSchema,
	_$ as McpUiHostContextChangedNotificationSchema,
	Lu as McpUiHostContextSchema,
	bf as McpUiHostCssSchema,
	_f as McpUiHostStylesSchema,
	jf as McpUiInitializeRequestSchema,
	y$ as McpUiInitializeResultSchema,
	zf as McpUiInitializedNotificationSchema,
	wf as McpUiMessageRequestSchema,
	c$ as McpUiMessageResultSchema,
	gf as McpUiOpenLinkRequestSchema,
	a$ as McpUiOpenLinkResultSchema,
	Ru as McpUiRequestDisplayModeRequestSchema,
	f$ as McpUiRequestDisplayModeResultSchema,
	xs as McpUiResourceCspSchema,
	d$ as McpUiResourceMetaSchema,
	zs as McpUiResourcePermissionsSchema,
	p$ as McpUiResourceTeardownRequestSchema,
	yf as McpUiResourceTeardownResultSchema,
	hf as McpUiSandboxProxyReadyNotificationSchema,
	v$ as McpUiSandboxResourceReadyNotificationSchema,
	vf as McpUiSizeChangedNotificationSchema,
	Du as McpUiSupportedContentBlockModalitiesSchema,
	pf as McpUiThemeSchema,
	m$ as McpUiToolCancelledNotificationSchema,
	u$ as McpUiToolInputNotificationSchema,
	l$ as McpUiToolInputPartialNotificationSchema,
	g$ as McpUiToolMetaSchema,
	b$ as McpUiToolResultNotificationSchema,
	kf as McpUiToolVisibilitySchema,
	If as McpUiUpdateModelContextRequestSchema,
	Fy as OPEN_LINK_METHOD,
	Eu as PostMessageTransport,
	n$ as REQUEST_DISPLAY_MODE_METHOD,
	k$ as RESOURCE_MIME_TYPE,
	e$ as RESOURCE_TEARDOWN_METHOD,
	Pf as RESOURCE_URI_META_KEY,
	By as SANDBOX_PROXY_READY_METHOD,
	Wy as SANDBOX_RESOURCE_READY_METHOD,
	Gy as SIZE_CHANGED_METHOD,
	Tf as SUPPORTED_PROTOCOL_VERSIONS,
	Xy as TOOL_CANCELLED_METHOD,
	Ky as TOOL_INPUT_METHOD,
	mf as TOOL_INPUT_PARTIAL_METHOD,
	Qy as TOOL_RESULT_METHOD,
	j$ as buildAllowAttribute,
	S$ as getToolUiResourceUri,
	I$ as isToolVisibilityAppOnly,
	w$ as isToolVisibilityModelOnly,
}
