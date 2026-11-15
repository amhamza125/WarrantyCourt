# WarrantyCourt

Warranty claims decided by an AI validator jury on GenLayer Bradbury. A seller registers a warranty policy and funds a GEN pool. A buyer registers a purchase against the policy. When something breaks, the buyer files a claim with a photo of the defect, and the jury reads the coverage terms, the receipt, and the photo before any money moves.

Live contract (Bradbury, chain 4221): 0x389b1524a976A8fF90087d15338A8f7937c7236E
Deploy transaction: 0x7275d01436098b414398584a1231ef21d02a7fca7ba92cd43b78a0035efb9ee3
Source: `WarrantyCourt.py` in this repository (sha256 6676eecc8e155298316df1b8e0520cd7eee08c56cd528bc1075c8f7792ed9cf2)

## How a claim flows

1. **Policy.** A seller calls `create_policy` with the product name, a link to the coverage terms, the SHA-256 of those terms, the coverage length in days, and a per-claim cap. `fund_policy` adds GEN to the policy pool. The seller can top up or withdraw unreserved funds at any time, and can close the policy once nothing is owed.
2. **Purchase.** A buyer calls `register_purchase` with the receipt link, the SHA-256 of the receipt, and the purchase date. Coverage runs from the purchase date for the policy's coverage length.
3. **Claim.** The buyer calls `file_claim` with a description of the defect, one photo of the defect, and the amount claimed. The amount is reserved against the pool as soon as the claim is filed, so a seller cannot drain the pool out from under an open claim. Each defect photo can back only one claim.
4. **Assessment.** Anyone can call `assess_claim`. The jury fetches the terms and the receipt, checks both against the SHA-256 hashes recorded on chain (any mismatch fails closed), reads the receipt total and date, views the defect photo, and returns a verdict: COVERED or NOT_COVERED, with a payout of 0, 25, 50, 75, or 100 percent of the claim depending on what the terms cover. Validators settle on one canonical verdict under strict equality consensus.
5. **Appeal.** The buyer may appeal once within 24 hours (`request_appeal`). The appeal is a fresh blind adjudication that replaces the first verdict in full. `resolve_appeal` settles it; if an appeal is left unresolved for 3 days, anyone can call `resolve_stale_appeal` and the first verdict stands.
6. **Payout.** After the appeal window, `release_claim` turns the verdict into a withdrawable credit for the buyer. Credits are paid pull-pattern: `withdraw_claim` starts the transfer, `confirm_withdrawal` completes it, and `restore_pending` can return a pending withdrawal to claimable only when the contract physically holds the GEN to back it — a transfer that has already left the contract is never restored against other funds. A claim paid in full at 100 percent can be released without waiting for the appeal window.

## Money rules

- A claim's amount is reserved from the pool at filing time and released back if the claim is denied, cancelled, or expires.
- Total payouts for one purchase can never exceed the purchase price read from its receipt. The cap is enforced when the jury rules, when later claims are filed, and again at release.
- Open claims expire after 30 days (`expire_claim`, callable by anyone); a buyer can cancel their own open claim at any time.
- The contract owner can sweep only pool funds that are neither reserved nor owed (`sweep_excess`); the sweep is computed from running counters, not by scanning policies.
- The owner can pause new claims and assessments (`set_paused`). Payouts, releases, and exits are never paused.
- Ownership transfers in two steps (`transfer_ownership` / `accept_ownership`).

## Reading the contract

All state is public and readable without a wallet. Views: `get_policy`, `get_purchase`, `get_claim`, `get_claimable`, `get_pending`, `get_protocol_overview`, `get_policies_for_seller`, `get_purchases_for_buyer`, `get_claims_for_purchase`, `get_activity`.

Write methods (20): `create_policy`, `fund_policy`, `withdraw_from_pool`, `close_policy`, `register_purchase`, `file_claim`, `cancel_claim`, `expire_claim`, `assess_claim`, `request_appeal`, `resolve_appeal`, `resolve_stale_appeal`, `release_claim`, `withdraw_claim`, `confirm_withdrawal`, `restore_pending`, `set_paused`, `sweep_excess`, `transfer_ownership`, `accept_ownership`.

Every rejected call raises a named error (for example `ONLY_SELLER`, `AGGREGATE_CAP_EXCEEDED`, `RECEIPT_MISMATCH`, `POLICY_CLOSED`) and changes no state and moves no funds. If the chain clock is unavailable during an assessment, the call raises `TIME_UNAVAILABLE` and can simply be retried.
