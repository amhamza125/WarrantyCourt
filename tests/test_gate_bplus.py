"""B+ backing-gate add-on tests (post-proof fix, 2026-11-14).

Kept separate from test_warranty.py so the frozen 93-group suite stays
byte-identical. Covers the three physical states restore_pending can meet
after an emission, in harness terms (balance debits when a transfer is
treated as having left the contract):

  G-1 STRANDED  emission left the contract, never arrived -> NO_EXCESS,
                state untouched; the user's own confirm_withdrawal is
                still an exit for the pending slot.
  G-2 RESCUE    owner tops the contract up by the stranded amount ->
                restore succeeds, fully backed, conservation exact.
  G-3 COLLUSION emission landed for the buyer, buyer never confirms,
                owner tries to restore anyway -> NO_EXCESS (the SPEC 10.3
                double-withdraw vector is closed).
"""
import json
import sys

sys.path.insert(0, ".")
import harness as H
from harness import call, expect_err as err, conserve, set_time
from test_warranty import _adjudicated, OWNER, BUYER, GEN, T0


def _released_withdrawn():
    c, pid, puid, cid = _adjudicated(H.FULL_REPORT)
    call(c, BUYER, c.release_claim, int(cid))
    call(c, BUYER, c.withdraw_claim)
    assert H.TRANSFERS[-1] == (BUYER, 40 * GEN)
    return c


def g1_stranded():
    c = _released_withdrawn()
    c.balance -= 40 * GEN  # emission left the contract; never arrived
    set_time(T0 + 601)
    err(c, OWNER, c.restore_pending, BUYER, code="NO_EXCESS")
    assert int(json.loads(c.pending_withdrawals[BUYER])["amount_wei"]) == 40 * GEN
    assert int(c.claimable_credits.get(BUYER, "0")) == 0
    call(c, BUYER, c.confirm_withdrawal)  # user's own exit still works
    assert int(c.total_pending_wei) == 0
    conserve(c)
    print("PASS G-1 stranded restore blocked (NO_EXCESS), user exit intact")


def g2_rescue():
    c = _released_withdrawn()
    c.balance -= 40 * GEN  # stranded
    c.balance += 40 * GEN  # owner top-up covers the stranded packet
    set_time(T0 + 601)
    out = call(c, OWNER, c.restore_pending, BUYER)
    assert out.startswith("PENDING_RESTORED")
    assert int(c.claimable_credits[BUYER]) == 40 * GEN
    assert int(c.total_pending_wei) == 0
    conserve(c)
    print("PASS G-2 topped-up restore succeeds, fully backed")


def g3_collusion():
    c = _released_withdrawn()
    # Transfer landed for real (balance debited) but the buyer never calls
    # confirm_withdrawal. From the contract's seat this is the same physical
    # state as G-1 — balance == backed — which is exactly why the gate must
    # block both: it cannot tell a stranded packet from a landed one.
    c.balance -= 40 * GEN
    set_time(T0 + 601)
    err(c, OWNER, c.restore_pending, BUYER, code="NO_EXCESS")
    call(c, BUYER, c.confirm_withdrawal)
    conserve(c)
    print("PASS G-3 collusion restore blocked (NO_EXCESS)")


if __name__ == "__main__":
    g1_stranded()
    g2_rescue()
    g3_collusion()
    print("\n3/3 B+ gate groups passed")
