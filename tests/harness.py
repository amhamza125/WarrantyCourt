"""Offline harness: stub genlayer runtime, load WarrantyCourt.py, drive it.

Adapted from the DepositCourt/ExpenseCheck harness pattern. The jury is
stubbed deterministically: WEB maps url -> bytes (missing = fetch failure),
PROMPT_FN(prompt, images) returns the model's loose report. strict_eq modes:
  - default: run the jury fn once, return its envelope string.
  - CONSENSUS_FAIL: strict_eq raises (raw consensus failure, SPEC 7.8).
  - DIVERGE: PROMPT_FN is a list of reports; the fn is run once per report
    (validators); if the canonical envelopes differ, strict_eq raises
    (NO_MAJORITY); if identical, the first is returned.
"""
import sys, types, json, hashlib, datetime as _dt

TRANSFERS = []          # (recipient, amount) emitted via _Recipient.emit_transfer
WEB = {}                # url -> bytes (missing key = fetch failure)
PROMPT_FN = None        # callable(prompt, images) -> loose report (dict/str)
PROMPTS = []            # every prompt the jury assembled (for W-42)
STRICT_MODE = {"mode": "single"}   # single | fail | diverge
CLOCK = {"iso": "2026-11-10T12:00:00"}


class UserError(Exception):
    pass


class _Msg:
    sender_address = "0x" + "a" * 40
    value = 0

    @property
    def datetime(self):
        return CLOCK["iso"]


class _Resp:
    def __init__(self, body):
        self.body = body
        self.status = 200


class _Web:
    @staticmethod
    def get(url):
        if url not in WEB:
            raise Exception("unreachable: " + str(url))
        return _Resp(WEB[url])


class _Nondet:
    web = _Web()

    @staticmethod
    def exec_prompt(prompt, response_format=None, images=None):
        assert PROMPT_FN is not None, "no jury stub set"
        PROMPTS.append(prompt)
        if isinstance(PROMPT_FN, list):
            raise AssertionError("list PROMPT_FN only valid in diverge mode")
        return PROMPT_FN(prompt, images)


class _Eq:
    @staticmethod
    def strict_eq(fn):
        mode = STRICT_MODE["mode"]
        if mode == "fail":
            raise Exception("NO_MAJORITY (simulated consensus failure)")
        if mode == "diverge":
            global PROMPT_FN
            reports = PROMPT_FN
            assert isinstance(reports, list), "diverge mode needs a report list"
            outs = []
            for rep in reports:
                PROMPT_FN = (lambda r: (lambda p, i: r))(rep)
                outs.append(fn())
            PROMPT_FN = reports
            if len(set(outs)) != 1:
                raise Exception("NO_MAJORITY (divergent validators)")
            return outs[0]
        return fn()


class _Public:
    def write(self, fn):
        return fn
    write.payable = staticmethod(lambda fn: fn)

    def view(self, fn):
        return fn


class _Recipient:
    def __init__(self, addr):
        self.addr = str(addr)

    def emit_transfer(self, value=None):
        TRANSFERS.append((self.addr, int(value)))


def _contract_interface(cls):
    return _Recipient


class _Contract:
    balance = 0


gl = types.ModuleType("genlayer")
gl.contract = types.SimpleNamespace(Contract=_Contract)
gl.public = _Public()
gl.vm = types.SimpleNamespace(UserError=UserError)
gl.message = _Msg()
gl.nondet = _Nondet()
gl.eq_principle = _Eq()
gl.evm = types.SimpleNamespace(contract_interface=_contract_interface)
storage = types.ModuleType("genlayer.storage")


class TreeMap(dict):
    pass


storage.TreeMap = TreeMap
gtypes = types.ModuleType("genlayer.types")
gtypes.Address = lambda a: str(a)
gtypes.u256 = int
gtypes.bigint = int
sys.modules["genlayer"] = gl
sys.modules["genlayer.storage"] = storage
sys.modules["genlayer.types"] = gtypes

SRC = open("/home/hatch/workspace/warrantycourt/build/WarrantyCourt.py").read()
ns = {}
exec(compile(SRC, "WarrantyCourt.py", "exec"), ns)
WarrantyCourt = ns["WarrantyCourt"]

OWNER = "0xd2af69bb67d446526661a80a280820599c601ed3"   # deployer / owner
SELLER = "0x1111111111111111111111111111111111111111"
SELLER2 = "0x2222222222222222222222222222222222222222"
BUYER = "0x0bba411375d7074178980e610b5311dd6ed34d74"
BUYER2 = "0x3333333333333333333333333333333333333333"
STRANGER = "0x6fa23bd191266a8680c195ec6a618d2d9d584cab"
DAY = 86400
GEN = 10 ** 18

TREEMAPS = ["policies", "purchases", "claims", "claimable_credits",
            "pending_withdrawals", "receipt_registry", "photo_registry",
            "seller_policy_ids", "buyer_purchase_ids", "purchase_claim_ids",
            "activity"]
SCALARS = ["owner", "pending_owner", "paused", "policy_count",
           "purchase_counter", "claim_counter", "total_claimable_wei",
           "total_pending_wei", "total_pool_unreserved_wei",
           "total_pool_reserved_wei", "activity_count"]


def set_time(unix):
    CLOCK["iso"] = _dt.datetime.utcfromtimestamp(unix).strftime("%Y-%m-%dT%H:%M:%S")


def unix(y, mo, d, h=0, mi=0, s=0):
    return int(_dt.datetime(y, mo, d, h, mi, s, tzinfo=_dt.timezone.utc).timestamp())


T0 = unix(2026, 11, 10, 12, 0, 0)   # default clock: 2026-11-10 12:00 UTC


def fresh(balance=0):
    TRANSFERS.clear()
    WEB.clear()
    PROMPTS.clear()
    STRICT_MODE["mode"] = "single"
    set_time(T0)
    gl.message.sender_address = OWNER
    gl.message.value = 0
    c = WarrantyCourt.__new__(WarrantyCourt)
    for name in TREEMAPS:
        setattr(c, name, TreeMap())
    WarrantyCourt.__init__(c)
    c.balance = balance
    return c


def call(c, sender, fn, *args, value=0):
    """One top-level call. Payable value lands in the balance first.
    Emitted transfers are recorded in TRANSFERS but do NOT debit the
    balance here: in the SPEC 5.1 accounting model a pending withdrawal's
    wei still sit in the contract until the holder confirms receipt (the
    pending bucket is one of the four places GEN sits). The debit is
    realised by confirm() below, mirroring the holder observing the
    balance increase on their own account (SPEC 10.3 step 3)."""
    gl.message.sender_address = sender
    gl.message.value = value
    if value:
        c.balance += value
    return fn(*args)


def confirm(c, sender):
    """A successful confirm_withdrawal: the pending amount leaves the
    contract's accounted balance (the transfer has landed for real)."""
    raw = c.pending_withdrawals.get(sender)
    amt = int(json.loads(raw)["amount_wei"]) if raw else 0
    out = call(c, sender, c.confirm_withdrawal)
    c.balance -= amt
    return out


def snapshot(c):
    state = {}
    for name in TREEMAPS:
        state[name] = {k: v for k, v in getattr(c, name).items()}
    for name in SCALARS:
        state[name] = getattr(c, name)
    return json.dumps(state, sort_keys=True), int(c.balance), len(TRANSFERS)


def expect_err(c, sender, fn, *args, code, value=0):
    """Assert the exact UserError code AND byte-identical state, balance,
    and transfer log afterwards (the contract mutates only after gates)."""
    snap = snapshot(c)
    try:
        call(c, sender, fn, *args, value=value)
    except UserError as e:
        assert str(e) == code, f"expected {code}, got {e}"
        now = snapshot(c)
        assert now == snap, f"state changed on {code}:\n{snap}\n{now}"
        return
    raise AssertionError(f"expected UserError {code}, call succeeded")


def conserve(c, dust=0):
    """The SPEC 5.1 invariant over the four running counters, plus the
    test-side check that counters == sum of per-policy/per-address fields."""
    tracked = (int(c.total_pool_unreserved_wei) + int(c.total_pool_reserved_wei)
               + int(c.total_claimable_wei) + int(c.total_pending_wei))
    assert int(c.balance) == tracked + dust, (
        f"conservation broken: balance={c.balance} tracked={tracked} dust={dust}")
    su = sr = 0
    for raw in c.policies.values():
        p = json.loads(raw)
        su += int(p["pool_unreserved_wei"])
        sr += int(p["pool_reserved_wei"])
    assert su == int(c.total_pool_unreserved_wei), "counter != sum(unreserved)"
    assert sr == int(c.total_pool_reserved_wei), "counter != sum(reserved)"
    sc = sum(int(v) for v in c.claimable_credits.values())
    assert sc == int(c.total_claimable_wei), "counter != sum(claimable)"
    sp = 0
    for raw in c.pending_withdrawals.values():
        sp += int(json.loads(raw)["amount_wei"])
    assert sp == int(c.total_pending_wei), "counter != sum(pending)"


def sha(b):
    return hashlib.sha256(b).hexdigest()


# -- shared fixtures ----------------------------------------------------------

TERMS_URL = "https://files.example.com/terms-kettle.txt"
RECEIPT_URL = "https://files.example.com/receipt-kettle.txt"
PHOTO_URL = "https://files.example.com/photo-kettle.png"
TERMS_FULL = (b"AquaPure warranty terms. The thermostat, heating element and "
              b"all internal components are covered in full for the coverage "
              b"period. Accidental damage is excluded.")
TERMS_PARTIAL = (b"AquaPure warranty terms. The thermostat is covered on a "
                 b"parts-only basis at 50%. Other internal components are "
                 b"covered in full.")
RECEIPT_TXT = (b"RECEIPT - AquaPure Pro Electric Kettle AP-K200\n"
               b"Date: 2026-11-02\nTotal: 45 GEN\nThank you.")
PHOTO_PNG = b"\x89PNG\r\n\x1a\n" + b"fake-photo-bytes-kettle-thermostat"
PRODUCT = "AquaPure Pro Electric Kettle AP-K200"
PDATE = "2026-11-02"

FULL_REPORT = {"coverage": "FULL", "terms_pct": None, "defect_visible": True,
               "receipt_date": "2026-11-02", "receipt_total_text": "45 GEN",
               "product_match": True}
PARTIAL50_REPORT = {"coverage": "PARTIAL", "terms_pct": 50, "defect_visible": True,
                    "receipt_date": "2026-11-02", "receipt_total_text": "45 GEN",
                    "product_match": True}
NONE_REPORT = {"coverage": "NONE", "terms_pct": None, "defect_visible": True,
               "receipt_date": "2026-11-02", "receipt_total_text": "45 GEN",
               "product_match": True}


def set_web(terms=TERMS_FULL, receipt=RECEIPT_TXT, photo=PHOTO_PNG):
    if terms is not None:
        WEB[TERMS_URL] = terms
    if receipt is not None:
        WEB[RECEIPT_URL] = receipt
    if photo is not None:
        WEB[PHOTO_URL] = photo


def policy(c, seller=SELLER, duration=730, cap=100 * GEN, terms=TERMS_FULL,
           terms_url=TERMS_URL, product=PRODUCT):
    set_web(terms=terms)
    out = call(c, seller, c.create_policy, product, terms_url, sha(terms), duration, cap)
    return out.split("#")[1].strip()


def funded_policy(c, seller=SELLER, amount=200 * GEN, **kw):
    pid = policy(c, seller=seller, **kw)
    call(c, seller, c.fund_policy, int(pid), value=amount)
    return pid


def purchase(c, pid, buyer=BUYER, receipt=RECEIPT_TXT, receipt_url=RECEIPT_URL,
             pdate=PDATE):
    if receipt is not None:
        WEB[receipt_url] = receipt
    out = call(c, buyer, c.register_purchase, int(pid), receipt_url,
               sha(receipt) if receipt is not None else "0" * 64, pdate)
    return out.split("#")[1].strip()


def claim(c, puid, buyer=BUYER, amount=40 * GEN, photo=PHOTO_PNG,
          photo_url=PHOTO_URL, defect="The thermostat stopped heating the kettle."):
    if photo is not None:
        WEB[photo_url] = photo
    out = call(c, buyer, c.file_claim, int(puid), defect, photo_url,
               sha(photo) if photo is not None else "0" * 64, amount)
    return out.split("#")[1].split()[0]


def pol(c, pid):
    return json.loads(c.policies[str(pid)])


def pur(c, puid):
    return json.loads(c.purchases[str(puid)])


def clm(c, cid):
    return json.loads(c.claims[str(cid)])


def jury(report):
    global PROMPT_FN
    PROMPT_FN = lambda p, i: report
