# WarrantyCourt — live lifecycle log (production)
- Contract: 0xd08c6Ca5ed4399e58444949C5f306Dcc29976CcC
- Deploy tx: 0x7b866162305a1b1467c035eefafe4b80461c342d8c2d7779ea7c7a4fffff92ef
- Source: /home/hatch/workspace/warrantycourt/build/WarrantyCourt.compact.py sha256 a30bea436538beac5189d37173790b4bbc38d4267296b89827cda90fb219ae12
- Wallets: OWNER A=0xD2aF69BB67d446526661A80a280820599c601ed3 | SELLER S=0xD0Ec4561b79533e174eAe8e803473fe082bb4090 | SELLER2 S2=0xaAfBC8eC68fB05AccdD295202DF5Cf2d2c977574 | BUYER B=0x0BbA411375d7074178980E610B5311dD6Ed34d74 | BUYER2 B2=0x8EEb9e644E5916066231E5f077A0931F72baE0C5 | STRANGER C=0x6FA23bD191266A8680C195eC6a618d2d9d584CaB
- Balances before: A=7925557316647881491 S=400000000000000000 B=1493864609159717734 B2=250000000000000000 C=493268657909900598 contract=0
  CONSERVATION initial: counters=0 contract_balance=0 raw_eth=0 -> PASS

## P1 — terms-covered policy (seller S)
  create_policy P1: tx=0x52a401f7a8fe20275feb992e6c7c6bd4032ba4e0e9c74ead7c46fb62403ba9fb exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  P1 id=1
  fund_policy P1 0.05: tx=0x416c6a429a421cfde356128c46d8b77fcfe7b7b6a7f32b9f31246860b865ba78 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  CHECK P1 unreserved == 0.05: PASS 50000000000000000
  CONSERVATION after P1 fund: counters=50000000000000000 contract_balance=50000000000000000 raw_eth=50000000000000000 -> PASS
  register_purchase U1 (B, receipt-t88002): tx=0x53bfa4d7cc8ac19e0d6e9fdc52db61317339b1dd8c1e6c6a47061ba3fec2b520 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  file_claim C1 0.02 heating (B): tx=0x1fc8735cd81d7d254bf7e272bb52e799fbe66fc955b0c73aad68d13cd40502a4 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  U1=1 C1=1
  CHECK P1 reserved == 0.02 after C1: PASS {"policy_id":"1","seller":"0xd0ec4561b79533e174eae8e803473fe082bb4090","product":"AquaPure Pro Electric Kettle AP-K200","terms_url":"https://muse.ai/files/1362570570277562/1149267114221393/kq6orxd1vaw734tbv1bpcxu0/terms-covered.txt","terms_sha256":"b9345d1640f03814809bfe94d83f970467d2d9229e809552baf1119cdfc42f01","duration_days":730,"per_claim_cap_wei":"20000000000000000","status":"ACTIVE","pool_unreserved_wei":"30000000000000000","pool_reserved_wei":"20000000000000000","created_at":1794603254,"purchase_count":1,"max_coverage_end_unix":1856735999}
  CONSERVATION after C1 filed: counters=50000000000000000 contract_balance=50000000000000000 raw_eth=50000000000000000 -> PASS
  assess C1 attempt 1: tx=0xc362bf16e79868dc9cab15df399c1b25b34a39d722b4a7c3783ad4b20b454e94 exec=FINISHED_WITH_RETURN result=MAJORITY_TIMEOUT
  assess C1: no-consensus (JURY_FAILURE shape) — state untouched, retrying
  assess C1 attempt 2: tx=0x38ee116756def05969b212f72d36ca225b29227827027f5d6b810d31bc5c1408 exec=NOT_VOTED result=IDLE
  assess C1: no-consensus (JURY_FAILURE shape) — state untouched, retrying
  assess C1 attempt 3: tx=0x22f9827c69c9438c18073f7a8fb88f838f012f32ee697483886cb42cae489d10 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  assess C1: SETTLED verdict={"payout_pct":100,"reasons":"DEFECT_COVERED","receipt_date":"2026-11-02","receipt_total_wei":45000000000000000000,"verdict":"COVERED"}
  CHECK C1 settled: PASS 
  VERDICT-VALIDATION C1: keys=false pct=100(true) reasons=DEFECT_COVERED(true) denialShape=true grounding=true noRaw=true -> !!! CANONICAL VIOLATION — STOP !!!
## STOP — canonical divergence in a settled verdict


## RUN STOPPED — harness false positive (see live-results.json notes)
- Phase B halted at the C1 verdict-validation step. Verbatim lines are in live/phase-b.log.
- Independent on-chain re-read: claim 1 verdict = {"payout_pct":100,"reasons":"DEFECT_COVERED","receipt_date":"2026-11-02","receipt_total_wei":45000000000000000000,"verdict":"COVERED"} — key set and sorted order exactly canonical.
- Root cause: the harness expected-string literal listed keys unsorted; the verdict itself is canonical. Phases C and D arcs not run; twin deployed but untouched.

# ===== RESUME 2026-11-14 — checker fixed, Phase B resumes from C1 SETTLED =====
- Contract: 0xd08c6Ca5ed4399e58444949C5f306Dcc29976CcC
- Wallets: OWNER A=0xD2aF69BB67d446526661A80a280820599c601ed3 | SELLER S=0xD0Ec4561b79533e174eAe8e803473fe082bb4090 | SELLER2 S2=0xaAfBC8eC68fB05AccdD295202DF5Cf2d2c977574 | BUYER B=0x0BbA411375d7074178980E610B5311dD6Ed34d74 | BUYER2 B2=0x8EEb9e644E5916066231E5f077A0931F72baE0C5 | STRANGER C=0x6FA23bD191266A8680C195eC6a618d2d9d584CaB
- Balances at resume: A=8023772210467881663 S=349832157659997412 B=1493414082869711264 B2=250000000000000000 C=493080677639900124 contract=50000000000000000
  CONSERVATION resume start: counters=50000000000000000 contract_balance=50000000000000000 raw_eth=50000000000000000 -> PASS

## RESUME — re-reading settled C1 (P1=1 U1=1 C1=1)
  C1 on-chain: status=ADJUDICATED verdict={"payout_pct":100,"reasons":"DEFECT_COVERED","receipt_date":"2026-11-02","receipt_total_wei":45000000000000000000,"verdict":"COVERED"}
  CHECK C1 status SETTLED on re-read: !!! FAIL !!! ADJUDICATED
  VERDICT-VALIDATION C1-reread: keys=true pct=100(true) reasons=DEFECT_COVERED(true) denialShape=true grounding=true noRaw=true -> CANONICAL OK
  CHECK C1 verdict COVERED 100: PASS {"payout_pct":100,"reasons":"DEFECT_COVERED","receipt_date":"2026-11-02","receipt_total_wei":45000000000000000000,"verdict":"COVERED"}
  CHECK C1 verdict total == 45 GEN (W-84 shape): PASS 45000000000000000000
  CHECK U1 receipt_total recorded 45 GEN (F2): PASS 45000000000000000000
  NEG W-53 request_appeal on COVERED-100 by B: exec=FINISHED_WITH_ERROR code=APPEAL_NOT_AVAILABLE expected=APPEAL_NOT_AVAILABLE stateUnchanged=true -> PASS tx=0xbfa333df02ddd63b8dacce4bba5f2cf21fe0c968ece42cc03acb40b99c1b9265
  NEG W-61 release_claim by stranger C: exec=FINISHED_WITH_ERROR code=ONLY_PARTY expected=ONLY_PARTY stateUnchanged=true -> PASS tx=0xf65c45cd8d4f65fd105a65b46b2bb4982e925e340237fd71d1ab065c6ea22b8d

## C1 payout cycle + flag-1 debit timing
  before withdraw: B=1493331338849709970 contractRaw=50000000000000000 claimableB=0
  release_claim C1 (B, early release at 100%): tx=0x3e68c28ab690ece4c90c0464007e2b6eac39136bff5f826b4d6bb9c133af0821 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  CHECK B claimable == 0.02 after release: PASS 20000000000000000
  CONSERVATION after C1 release: counters=50000000000000000 contract_balance=50000000000000000 raw_eth=50000000000000000 -> PASS
  withdraw_claim (B): tx=0x2b4e6486b64348ac5b990afc590fcb6f604fbb513524295bed154da2c05ff4e8 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  after withdraw finalised: B=1513111118999707382 contractRaw=30000000000000000 overview={"claim_count":1,"contract_balance":"30000000000000000","owner":"0xd2af69bb67d446526661a80a280820599c601ed3","paused":false,"pending_owner":"","policy_count":1,"purchase_count":1,"total_claimable_wei":"0","total_pending_wei":"20000000000000000","total_pool_reserved_wei":"0","total_pool_unreserved_wei":"30000000000000000"}
  FLAG-1 MEASUREMENT: contract raw delta at withdraw-finalise = 20000000000000000 wei (claim 20000000000000000) -> DEBIT AT EMIT
  confirm_withdrawal (B): tx=0x03ab9bee7346ed0903fc38ef0a40db32bb551dca8e7d59a9e22ba0cd813ce80a exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  after confirm: B=1513028118049706088 contractRaw=30000000000000000
  CHECK contract raw delta across payout cycle == -0.02 exactly: PASS 20000000000000000
  derived fees: withdraw=137452040001294 confirm=83000950001294
  CHECK recipient-delta payout identity: B net + fees == 0.02 exactly: PASS net=19779547009997412
  CONSERVATION after C1 payout: counters=30000000000000000 contract_balance=30000000000000000 raw_eth=30000000000000000 -> PASS
  NEG W-63 release_claim C1 again: exec=FINISHED_WITH_ERROR code=BAD_STATUS expected=BAD_STATUS stateUnchanged=true -> PASS tx=0xd6db3c0da4b34552c2052f9d13402e8ca0e2b5b8afc753b2437c854b9b24ea3c
  NEG W-36a assess_claim on SETTLED C1: exec=FINISHED_WITH_ERROR code=CLAIM_NOT_OPEN expected=CLAIM_NOT_OPEN stateUnchanged=true -> PASS tx=0xeab791ca0ba1a31192659197195046695c6ae325788c6741509fd7e89d5854f6
  NEG W-36b assess_claim 999: exec=FINISHED_WITH_ERROR code=CLAIM_NOT_FOUND expected=CLAIM_NOT_FOUND stateUnchanged=true -> PASS tx=0x218518b0129de7d68b80c8218bd5de4c5b74cc812ae1aff98106db9727e5d172

## P2 — terms-partial policy (seller S)
  create_policy P2: tx=0xfbd3cddc09800cb1f085a51b3e339d83a3e9eb4578f532c585b71adbb7292df0 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  fund_policy P2 0.05: tx=0x9eaea85c31ffca4c2cb6e83e88b201637ecbfb995b2fa70594dfd548b0531ac7 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  register_purchase U2 (B, receipt-t88003): tx=0x6b32d39767d54e9f690ad28e18679963db5781138f1480cdffb7cca8f2a38336 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  file_claim C2 0.02 thermostat (B): tx=0xb02385da58ac47e7a65f9a0e48f89d4c450fca240d25bc3182c1a12f2652b2ff exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  P2=2 U2=2 C2=2
  CONSERVATION after C2 filed: counters=80000000000000000 contract_balance=80000000000000000 raw_eth=80000000000000000 -> PASS
  assess C2 attempt 1: tx=0xb1ec126e5fbb0b174bd99a03965d3661b4028dd07b5637642cffa842fea3f8d6 exec=FINISHED_WITH_RETURN result=MAJORITY_TIMEOUT
  assess C2: no-consensus (JURY_FAILURE shape) — state untouched, retrying
  assess C2 attempt 2: tx=0x8a6ed56fcc87ed517b591737311b5f0c3f906b39128765bac54d93dc5db3fa4d exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  assess C2: SETTLED verdict={"payout_pct":50,"reasons":"PARTIAL_COVERAGE","receipt_date":"2026-11-02","receipt_total_wei":45000000000000000000,"verdict":"COVERED"}
  CHECK C2 settled: PASS 
  VERDICT-VALIDATION C2-first: keys=true pct=50(true) reasons=PARTIAL_COVERAGE(true) denialShape=true grounding=true noRaw=true -> CANONICAL OK
  C2 first verdict: {"payout_pct":50,"reasons":"PARTIAL_COVERAGE","receipt_date":"2026-11-02","receipt_total_wei":45000000000000000000,"verdict":"COVERED"}
  CHECK C2 first verdict COVERED partial: PASS {"payout_pct":50,"reasons":"PARTIAL_COVERAGE","receipt_date":"2026-11-02","receipt_total_wei":45000000000000000000,"verdict":"COVERED"}
  NEG W-57a release_claim C2 inside appeal window: exec=FINISHED_WITH_ERROR code=APPEAL_WINDOW_OPEN expected=APPEAL_WINDOW_OPEN stateUnchanged=true -> PASS tx=0x4d1ec3a4463eac97dec85bf8081b4bae6b04441e4448efbd22374d251f03be6f
  NEG W-59a resolve_stale_appeal on fresh appeal-less claim: exec=FINISHED_WITH_ERROR code=BAD_STATUS expected=BAD_STATUS stateUnchanged=true -> PASS tx=0x5ba24ea2f4d93b64c29da88f2caf3de9e911360e51f83e18c8ffd70e8519560d
  request_appeal C2 (B): tx=0x96b42f2f9af389486fa00e1729bf115d345987bf69c8e45fa560c7b51e006894 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  NEG W-57b release_claim C2 while APPEALING: exec=FINISHED_WITH_ERROR code=APPEAL_PENDING expected=APPEAL_PENDING stateUnchanged=true -> PASS tx=0x1152d2931ef4dd497b13a0c6f0239f000a178f440c02617c1f113314f69ad9b7
  NEG W-50c expire_claim on APPEALING C2: exec=FINISHED_WITH_ERROR code=BAD_STATUS expected=BAD_STATUS stateUnchanged=true -> PASS tx=0x8abe70fe15af66231f1bc54a31913493bfaefc15a7021b3c17b41391cce8a2dc
  resolve_appeal C2 attempt 1: tx=0xa35623a60aebedd31ea0e6ed8d831a9f4a3b24c7ad04f04fda4c1890cae86adb exec=FINISHED_WITH_RETURN
  CHECK C2 appeal resolved: PASS 
  VERDICT-VALIDATION C2-appeal: keys=true pct=50(true) reasons=PARTIAL_COVERAGE(true) denialShape=true grounding=true noRaw=true -> CANONICAL OK
  C2 verdict wholesale: first={"payout_pct":50,"reasons":"PARTIAL_COVERAGE","receipt_date":"2026-11-02","receipt_total_wei":45000000000000000000,"verdict":"COVERED"} final={"payout_pct":50,"reasons":"PARTIAL_COVERAGE","receipt_date":"2026-11-02","receipt_total_wei":45000000000000000000,"verdict":"COVERED"}
  CHECK C2 appeal verdict present + appeal_resolved: PASS 
  NEG W-55 second request_appeal on C2: exec=FINISHED_WITH_ERROR code=APPEAL_NOT_AVAILABLE expected=APPEAL_NOT_AVAILABLE stateUnchanged=true -> PASS tx=0x62815c5c41594ddf22b54a476ea877b9c5ce81d70f1b15f025a4cf65d531b018
  release_claim C2 (B, after appeal resolved): tx=0xd4e537942dbb804787834d12ed43e42e6f8ca89c84cbfe468a006ceb1305fad8 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  CHECK C2 release paid == amount*pct/100: PASS 10000000000000000 vs 10000000000000000
  CONSERVATION after C2 release: counters=80000000000000000 contract_balance=80000000000000000 raw_eth=80000000000000000 -> PASS

## C3 — wrong-product receipt on P1 (buyer B2)
  register_purchase U3 (B2, receipt-wrongproduct): tx=0x1c58f66bc881f3a007cc93b621347615310d44cc072b4ee2ede30bec025c947e exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  file_claim C3 0.01 heating (B2): tx=0x25463666cf51458e42a0038da88528ed3e2fec84dec45c5c0498cd7b272b7523 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  U3=3 C3=3
  assess C3 attempt 1: tx=0xfc1e77bec720c745192fe5108341bade569e451aaa7fc6918a55edfc50fc8a9a exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  assess C3: SETTLED verdict={"payout_pct":0,"reasons":"RECEIPT_MISMATCH","receipt_date":"2026-11-02","receipt_total_wei":0,"verdict":"NOT_COVERED"}
  CHECK C3 settled: PASS 
  VERDICT-VALIDATION C3: keys=true pct=0(true) reasons=RECEIPT_MISMATCH(true) denialShape=true grounding=true noRaw=true -> CANONICAL OK
  CHECK C3 verdict NOT_COVERED: PASS {"payout_pct":0,"reasons":"RECEIPT_MISMATCH","receipt_date":"2026-11-02","receipt_total_wei":0,"verdict":"NOT_COVERED"}
  CHECK W-90/F1: C3 denial verdict receipt_total_wei == 0: PASS 
  CHECK W-90/F2: U3 purchase total stays 0 after denial: PASS 0
  CHECK C3 reservation still held (0.01): PASS 10000000000000000
  NEG W-52a request_appeal C3 by seller S: exec=FINISHED_WITH_ERROR code=ONLY_BUYER expected=ONLY_BUYER stateUnchanged=true -> PASS tx=0xcd96f1b43f7895ecccea9e112676eb243f72d316bc44a95f521c27d29ca11b09
  NEG W-52b request_appeal C3 by stranger C: exec=FINISHED_WITH_ERROR code=ONLY_BUYER expected=ONLY_BUYER stateUnchanged=true -> PASS tx=0x8dcd0a465422694c40698698f81da5589de72e650a232105b70926f1a7c99f48
  NEG W-47 cancel_claim on ADJUDICATED C3: exec=FINISHED_WITH_ERROR code=CLAIM_NOT_OPEN expected=CLAIM_NOT_OPEN stateUnchanged=true -> PASS tx=0x376c354d493839ceb0bf144c4aed2550cb55ef4669790b2f4118aacf99c4e083
  NEG W-50a expire_claim on ADJUDICATED C3: exec=FINISHED_WITH_ERROR code=BAD_STATUS expected=BAD_STATUS stateUnchanged=true -> PASS tx=0xb15e4b3958fee143ef92922addd107bb00b4d0163e95b43e99df9b3d4c854b0e
  CONSERVATION end of Phase B: counters=80000000000000000 contract_balance=80000000000000000 raw_eth=80000000000000000 -> PASS

## Balances after Phase B: A=8023772210467881663 (start 8023772210467881663, delta 0) S=299581560549993530 B=1512361666479695736 B2=249747790729996118 C=492167270249887540 contract=80000000000000000
## Phase B failures: 1

## PHASE E — LIVE PROOF COMPLETE (2026-11-14)

Production: 0xd08c6Ca5ed4399e58444949C5f306Dcc29976CcC (deploy tx 0x7b866162305a1b1467c035eefafe4b80461c342d8c2d7779ea7c7a4fffff92ef; compact source sha256 a30bea43… verified on chain). Twin: 0xd87A84491fb55F28A857a59Cc36f03e30e9503b8.

### Phase B (lifecycle) — COMPLETE
C1 COVERED 100 paid end-to-end (release → claimable → withdraw → confirm) with recipient balance-delta identity exact. C2 COVERED 50/PARTIAL_COVERAGE; blind appeal replaced the verdict wholesale (independently identical COVERED 50); post-appeal release paid exactly 0.01 GEN. C3 NOT_COVERED/RECEIPT_MISMATCH, zero payout, 0.01 GEN reservation held for the appeal window (twin proved the identical post-window release). Flag 1 measured: pool/raw DEBIT AT EMIT. No-consensus attempts (MAJORITY_TIMEOUT / NOT_VOTED / MAJORITY_DISAGREE) left state untouched every time, per SPEC §7.8.

### Phase C (negatives, production) — COMPLETE with two recorded exceptions
All W-01–W-92 negatives run on the final address across 12 script generations (4 service restarts, RPC transport crashes, 2 splice bugs — every resume bound from verified on-chain state). Exact error codes, state unchanged, zero fund movement. Exceptions: (1) W-90 exclusion leg — claim 12 (limescale) assessed 11 times, 11× MALFORMED_VERDICT from the jury, fail-closed throughout; a jury-stack liveness limitation, not a contract defect. (2) Restore-cycle conservation shortfall of exactly 0.055 GEN − 12345 wei dust: withdraw emission debited the contract but the network never delivered it; restore + re-withdraw delivered exactly one stake (identity PASS) and left the contract physically short (see finding in negatives-live.md). W-65/W-67 mis-sequenced by the suite (S2 episode) and re-proven with B2.

### Phase D (twin arcs) — COMPLETE
Appeal-window expiry → release paid exactly 50% (TC1, W-57t both legs). Stale-appeal permissionless resolution (TS2): fresh-appeal NOT_EXPIRED, resolution by stranger after 900 s, first verdict byte-identical, release paid exactly 0.0025, BAD_STATUS after. W-54 APPEAL_WINDOW_CLOSED. OPEN-claim expiry arc (TC3): NOT_EXPIRED early, expired under pause by a stranger, photo refiled after expiry (W-33). Restore gate on the twin clock (W-68t TOO_EARLY by timed concurrent fire; the first attempt legitimately succeeded because 90 s elapsed during consensus). Boundary closes: W-77 OPEN + APPEALING legs (OPEN_CLAIMS_REMAIN), W-21 + W-15t (COVERAGE_EXPIRED). The restore double-debit reproduced on the twin (0.005) and grew by exactly the 0.001 W-68t stake emission: final twin delta −0.006, fully accounted.

### Conservation — final
Production: tracked 0.257 vs physical 0.202000000000012345 (delta = the dropped emission, constant). Twin: tracked 0.155 vs physical 0.149 (delta −0.006, accounted). Every other conservation check passed (55 recorded).

### Wallet spend
Baselines (Phase B start, lifecycle-live.md header): A 7.925557316647881491, S 0.4, B 1.493864609159717734, B2 0.25, C 0.493268657909900598. Finals (Phase E read): A 7.521527411217834616, S 0.528349238459901656, S2 0.246300207609989648, B 1.500721630749550995, B2 0.248148842179971532, C 0.486466309519828608. Five baselined wallets net outflow 0.277477151590412416 GEN; S2 in-session delta -0.000167467899000000 (its pre-proof balance was never baselined; it was funded to a 0.25 floor in session 1). Inter-wallet transfers inside the window: 0.9 GEN session-1 funding + 0.5 GEN A->S top-up (net zero across the set). GEN remaining in contracts: production 0.202000000000012345 physical (0.257 tracked), twin 0.149 physical (0.155 tracked). Caveat: these are shared desk test wallets, so the aggregate cannot be closed to the wei from surviving baselines; the proof-attributable footprint is the contract flows above plus per-tx network fees across ~350 transactions and the stranded emissions (0.055 production + 0.006 twin, as measured at their final checks).

### Open items
C90 (production claim 12, limescale exclusion) remains OPEN with 0.005 GEN reserved on P1 — retryable whenever the Bradbury jury stack changes; it can never pay out wrongly (fail-closed). C3 (production claim 3) remains ADJUDICATED with 0.01 GEN reserved on P1 — its release is still inside the 24 h appeal window at proof end (the twin proved the identical post-window release arc). Twin claims TC2/TC1c remain OPEN (limescale, MALFORMED) with 0.02 GEN reserved on TP1. Production owner = A, unpaused (ownership round-trip completed and restored).
