
# ===== B+ RE-PROOF 2026-11-14 — contract 0x389b1524a976A8fF90087d15338A8f7937c7236E (deploy tx 0x7275d01436098b414398584a1231ef21d02a7fca7ba92cd43b78a0035efb9ee3) =====
- Baselines: {"A":{"address":"0xD2aF69BB67d446526661A80a280820599c601ed3","balance_wei":"7521527411217834616"},"S":{"address":"0xD0Ec4561b79533e174eAe8e803473fe082bb4090","balance_wei":"528349238459901656"},"S2":{"address":"0xaAfBC8eC68fB05AccdD295202DF5Cf2d2c977574","balance_wei":"246300207609989648"},"B":{"address":"0x0BbA411375d7074178980E610B5311dD6Ed34d74","balance_wei":"1500721630749550995"},"B2":{"address":"0x8EEb9e644E5916066231E5f077A0931F72baE0C5","balance_wei":"248148842179971532"},"C":{"address":"0x6FA23bD191266A8680C195eC6a618d2d9d584CaB","balance_wei":"486466309519828608"}}
  CONSERVATION reproof start (fresh contract): counters=0 contract_balance=0 raw_eth=0 -> PASS
  R-4 create_policy P (S, terms-covered): tx=0xdd9787e52ad1e84d416329ae60c4cf37e490f2047b0bb3be653ba89ca4fb11a0 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  R-4 fund_policy P 0.15 (S): tx=0x8f07ddc152e75ce879e8343755725cd55d62a3676bc14c2447f5f9c6dee79744 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  R-4 register_purchase U (B, receipt-t88002): tx=0x3704a77d123cca47f0ef406b1afcc0e3cb6192b3fcf9a21c2ce8032fa024658e exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  R-4 setup: policy=1 purchase=1
  CONSERVATION after R-4 setup: counters=150000000000000000 contract_balance=150000000000000000 raw_eth=150000000000000000 -> PASS
  file_claim A 0.02 heating (B, kettle-3.png): tx=0xe152610a431fbb69d19fd53d716e1836b8c4dab5c68b0c7798e19918d4bb4359 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  claim A id=1
  CONSERVATION after claim A filed: counters=150000000000000000 contract_balance=150000000000000000 raw_eth=150000000000000000 -> PASS
  assess claim A attempt 1: tx=0xcc0cdc8656e924d681506376bd71a91b50851ce6eefc95e569dcb01f1ca0c58e exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  assess claim A: SETTLED verdict={"payout_pct":100,"reasons":"DEFECT_COVERED","receipt_date":"2026-11-02","receipt_total_wei":45000000000000000000,"verdict":"COVERED"}
  VERDICT-VALIDATION claim A: keys=true pct=100(true) reasons=DEFECT_COVERED(true) denialShape=true grounding=true noRaw=true -> CANONICAL OK
  release_claim claim A (B): tx=0x601f629b2daceac1f54a6b3b7d8c9eaa726aea06d5a800e4c267774d7caedaec exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  CHECK claim A release credit == amount*pct/100: PASS 20000000000000000 vs 20000000000000000
  CONSERVATION after claim A release: counters=150000000000000000 contract_balance=150000000000000000 raw_eth=150000000000000000 -> PASS
## R-4 lifecycle smoke COMPLETE: claim A COVERED 100%, released credit=20000000000000000

## R-3 — collusion: delivered, unconfirmed, aged; owner restore must hit NO_EXCESS
  withdraw_claim R-3 (B): tx=0xe8617343895dcb5c16ada82e0bc2631810aa0845ab22fda05d47a5642ce74de9 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  R-3: pending={"amount_wei":"20000000000000000","initiated_at":1794672580} claimableB=0
  R-3: DELIVERED delta=19862569439998706 (amount 20000000000000000)
  file_claim B 0.02 heating (B, kettle-4.png): tx=0xa6c4df35c154d036effbb0f08aa2c9eeb50ae5754dc9adf6e2fc4afc993c653f exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  claim B id=2
  CONSERVATION after claim B filed: counters=150000000000000000 contract_balance=130000000000000000 raw_eth=130000000000000000 -> MISMATCH (attempt 1)
  CONSERVATION after claim B filed: counters=150000000000000000 contract_balance=130000000000000000 raw_eth=130000000000000000 -> MISMATCH (attempt 2)
  CONSERVATION after claim B filed: counters=150000000000000000 contract_balance=130000000000000000 raw_eth=130000000000000000 -> MISMATCH (attempt 3)

## HARD STOP — conservation mismatch at after claim B filed

# ===== B+ RE-PROOF 2026-11-14 — contract 0x389b1524a976A8fF90087d15338A8f7937c7236E (deploy tx 0x7275d01436098b414398584a1231ef21d02a7fca7ba92cd43b78a0035efb9ee3) =====
- Baselines: {"A":{"address":"0xD2aF69BB67d446526661A80a280820599c601ed3","balance_wei":"7521527411217834616"},"S":{"address":"0xD0Ec4561b79533e174eAe8e803473fe082bb4090","balance_wei":"528349238459901656"},"S2":{"address":"0xaAfBC8eC68fB05AccdD295202DF5Cf2d2c977574","balance_wei":"246300207609989648"},"B":{"address":"0x0BbA411375d7074178980E610B5311dD6Ed34d74","balance_wei":"1500721630749550995"},"B2":{"address":"0x8EEb9e644E5916066231E5f077A0931F72baE0C5","balance_wei":"248148842179971532"},"C":{"address":"0x6FA23bD191266A8680C195eC6a618d2d9d584CaB","balance_wei":"486466309519828608"}}
- CHECKER CORRECTION (resume): the first run hard-stopped on 3 MISMATCH lines at "after claim B filed" — the quiescent identity (counters incl pending == balance) applied while R-3's DELIVERED pending stood open by design. Attribution measured on chain before resuming: pending(B) = 0.02 GEN open, delivery delta to B = 19862569439998706 wei verified, backed (U+R+C) = 0.13 GEN == physical == contract_balance to the wei; the 0.02 gap is exactly the open pending, which resolves at confirm. Checker corrected to the pending-aware identity (consMid) for mid-cycle points; quiescent checks unchanged. Resume bound from verified chain state.
  CONSERVATION(mid) reproof start: raw=130000000000000000 contract_balance=130000000000000000 backed=130000000000000000 pending=20000000000000000 -> PASS
## R-4 lifecycle smoke COMPLETE: claim A COVERED 100%, released credit=20000000000000000

## R-3 — collusion: delivered, unconfirmed, aged; owner restore must hit NO_EXCESS
  assess claim B attempt 1: tx=0x04019a2bdfbdaffcc8ec24565748f99a45825f8e9f111b4337c8a2ab2c971926 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  assess claim B: SETTLED verdict={"payout_pct":100,"reasons":"DEFECT_COVERED","receipt_date":"2026-11-02","receipt_total_wei":45000000000000000000,"verdict":"COVERED"}
  VERDICT-VALIDATION claim B: keys=true pct=100(true) reasons=DEFECT_COVERED(true) denialShape=true grounding=true noRaw=true -> CANONICAL OK
  R-3: pending initiated_at=1794672580; aging until 1794673270 (now 1794673230, wait 40s)
  R-3: aging… 10s left
  R-3: aging… -20s left
  R-3 restore_pending(B) by owner A: tx=0x0ecfea806c9f49f197216f5e573699ea4763bf2e57b86bf63bdaccf95696a976 exec=FINISHED_WITH_ERROR code=NO_EXCESS expected=NO_EXCESS stateIdentical=true balB 1520247439879544525 -> 1520247439879544525
  CHECK R-3 restore blocked with NO_EXCESS: PASS got=NO_EXCESS
  CHECK R-3 state byte-identical after blocked restore: PASS 
  CHECK R-3 pending record still standing: PASS {"amount_wei":"20000000000000000","initiated_at":1794672580}
  R-3 confirm_withdrawal (B) — close cleanly: tx=0xd180880eb7fab371665b04d7a0bff5f30f9c15f3927e2fa680f0e5938d15f474 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  CHECK R-3 pending zero after confirm: PASS {"amount_wei":"0","initiated_at":0}
  CONSERVATION after R-3: counters=130000000000000000 contract_balance=130000000000000000 raw_eth=130000000000000000 -> PASS
## R-3 COMPLETE

## R-1 — unbacked restore blocked; pending stands; buyer confirms
  release_claim claim B (B): tx=0x91c4fe25dd3d21a7412f0ac1a6f1bb679715d8383311d71b50217f448ccdcb2d exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  CHECK claim B release credit == amount*pct/100: PASS 20000000000000000 vs 20000000000000000
  CONSERVATION after claim B release: counters=130000000000000000 contract_balance=130000000000000000 raw_eth=130000000000000000 -> PASS
  R-1 spends claim B released credit=20000000000000000
  withdraw_claim R-1 (B): tx=0xd8a621a1b26db304369ddf19474946506fd01d4e048a35dd715b39484f1f0526 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  R-1: pending={"amount_wei":"20000000000000000","initiated_at":1794673660} claimableB=0
  R-1 (informational): DELIVERED delta=19862570609998706 (amount 20000000000000000)
  R-1 delivery state: {"delivered":true,"delta":"19862570609998706"} (gate outcome is identical either way: balance == backed)
  file_claim C 0.02 heating (B, kettle-5.png): tx=0xb6b3193fcb6b38b50d561c77d065d8b8a2035fd09ab6afbacb7de93cc755f483 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  claim C id=3
  CONSERVATION(mid) after claim C filed: raw=110000000000000000 contract_balance=110000000000000000 backed=110000000000000000 pending=20000000000000000 -> PASS
  assess claim C attempt 1: tx=0x532470f9c9a95c476e780a1f6043349dd1c4eaf4f5db3995e5af61c684282b84 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  assess claim C: SETTLED verdict={"payout_pct":100,"reasons":"DEFECT_COVERED","receipt_date":"2026-11-02","receipt_total_wei":45000000000000000000,"verdict":"COVERED"}
  VERDICT-VALIDATION claim C: keys=true pct=100(true) reasons=DEFECT_COVERED(true) denialShape=true grounding=true noRaw=true -> CANONICAL OK
  R-1: pending initiated_at=1794673660; aging until 1794674350 (now 1794674056, wait 294s)
  R-1: aging… 264s left
  R-1: aging… 233s left
  R-1: aging… 203s left
  R-1: aging… 173s left
  R-1: aging… 143s left
  R-1: aging… 113s left
  R-1: aging… 83s left
  R-1: aging… 53s left
  R-1: aging… 23s left
  R-1: aging… -7s left
  R-1 restore_pending(B) by owner A: tx=0xca687b0608b28547e292d62ff84e856bec554dbc3842f74918bb48eab906c03d exec=FINISHED_WITH_ERROR code=NO_EXCESS expected=NO_EXCESS stateIdentical=true balB 1539859500219539349 -> 1539859500219539349
  CHECK R-1 restore blocked with NO_EXCESS: PASS got=NO_EXCESS
  CHECK R-1 state byte-identical after blocked restore: PASS 
  CHECK R-1 pending record still standing: PASS {"amount_wei":"20000000000000000","initiated_at":1794673660}
  R-1 confirm_withdrawal (B) — close cleanly: tx=0xef41428e5e2669bb5f9f4fb663be14769913ebe394fedc4941af66a8c4eaf785 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  CHECK R-1 pending zero after confirm: PASS {"amount_wei":"0","initiated_at":0}
  CONSERVATION after R-1: counters=110000000000000000 contract_balance=110000000000000000 raw_eth=110000000000000000 -> PASS
## R-1 COMPLETE

## R-2 — backed restore: owner top-up of exactly the pending amount, restore succeeds, cycle completed
  release_claim claim C (B): tx=0xb9815306af2ffa9e2c127d5a322399f097f1f3c8ef1b7622ff3226ed05092a07 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  CHECK claim C release credit == amount*pct/100: PASS 20000000000000000 vs 20000000000000000
  CONSERVATION after claim C release: counters=110000000000000000 contract_balance=110000000000000000 raw_eth=110000000000000000 -> PASS
  R-2 spends claim C released credit=20000000000000000
  withdraw_claim R-2 (B): tx=0x1780337c872f520161f28fa232ba02b35818583a2001bc239a0510e85e362af1 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  R-2: pending={"amount_wei":"20000000000000000","initiated_at":1794674708} claimableB=0
  R-2 (informational): DELIVERED delta=19862567109998706 (amount 20000000000000000)
  R-2: pending initiated_at=1794674708; aging until 1794675398 (now 1794674818, wait 580s)
  R-2: aging… 550s left
  R-2: aging… 520s left
  R-2: aging… 490s left
  R-2: aging… 460s left
  R-2: aging… 430s left
  R-2: aging… 400s left
  R-2: aging… 370s left
  R-2: aging… 340s left
  R-2: aging… 310s left
  R-2: aging… 280s left
  R-2: aging… 249s left
  R-2: aging… 219s left
  R-2: aging… 189s left
  R-2: aging… 159s left
  R-2: aging… 129s left
  R-2: aging… 99s left
  R-2: aging… 69s left
  R-2: aging… 39s left
  R-2: aging… 9s left
  R-2: aging… -21s left
  CHECK R-2 claimable(B) == 0 before restore: PASS 0
  top-up A -> contract 20000000000000000 wei: tx=0x1e1ab0209337dcdb644ac0e8672bfebb991b38724dbf7c8b9d81808983acd51f status=success contractRaw 90000000000000000 -> 110000000000000000
  CHECK R-2 top-up raised contract raw balance by exactly the pending amount: PASS 20000000000000000 vs 20000000000000000
  R-2 restore_pending (B) by owner A — backed, must succeed: tx=0x0734f6d872dd667e30f78cb332a7868f12c41403d2868a966317940e6a9d56de exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  CHECK R-2 restore returned PENDING_RESTORED: PASS n	backtrace data�PENDING_RESTORED: 20000000000000000 wei restored to claimable for 0x0bba411375d7074178980e610b5311dd6
  CHECK R-2 claimable(B) == restored amount: PASS 20000000000000000 vs 20000000000000000
  CHECK R-2 pending zeroed by restore: PASS {"amount_wei":"0","initiated_at":0}
  CONSERVATION after R-2 restore: counters=110000000000000000 contract_balance=110000000000000000 raw_eth=110000000000000000 -> PASS
  withdraw_claim R-2 restored credit (B): tx=0x88e23393a18842f45b677419a276ddbd34d9d2b2b3528be12fbebdc1041e6dca exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  R-2 restored credit: pending={"amount_wei":"20000000000000000","initiated_at":1794675540} claimableB=0
  R-2 restored: DELIVERED delta=19862570109998706 (amount 20000000000000000)
  R-2 confirm_withdrawal (B) — restored cycle complete: tx=0xe1afe04b7da1d2f628f0bfad98e23a4f054b353b1bf8b80b7ecfc0ed586f21e3 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  CONSERVATION after R-2 restored cycle: counters=90000000000000000 contract_balance=90000000000000000 raw_eth=90000000000000000 -> PASS
## R-2 COMPLETE

## END STATE — total_pending == 0 and physical balance == backed, to the wei
  overview={"claim_count":3,"contract_balance":"90000000000000000","owner":"0xd2af69bb67d446526661a80a280820599c601ed3","paused":false,"pending_owner":"","policy_count":1,"purchase_count":1,"total_claimable_wei":"0","total_pending_wei":"0","total_pool_reserved_wei":"0","total_pool_unreserved_wei":"90000000000000000"}
  raw physical=90000000000000000 backed(U+R+C)=90000000000000000 total_pending=0 contract_balance=90000000000000000
  CHECK END total_pending_wei == 0: PASS 0
  CHECK END physical balance == backed (0 discrepancy): PASS raw=90000000000000000 backed=90000000000000000
  CHECK END contract_balance == backed: PASS 90000000000000000
  CONSERVATION END STATE: counters=90000000000000000 contract_balance=90000000000000000 raw_eth=90000000000000000 -> PASS
  wallet A: baseline=7521527411217834616 final=7500910998217829440 netOut=20616413000005176
  wallet S: baseline=528349238459901656 final=378181435459899068 netOut=150167803000002588
  wallet S2: baseline=246300207609989648 final=246300207609989648 netOut=0
  wallet B: baseline=1500721630749550995 final=1579336328999532879 netOut=-78614698249981884
  wallet B2: baseline=248148842179971532 final=248148842179971532 netOut=0
  wallet C: baseline=486466309519828608 final=486403587199828549 netOut=62722320000059
  contract end balance=90000000000000000 (pool remainder, backed by unreserved policy funds)
  TOTAL desk-wallet net outflow=92232240070025939 wei

## B+ RE-PROOF COMPLETE — R-1, R-2, R-3, R-4 all recorded

# ===== TALLIES & OUTCOME (B+ re-proof, compiled 2026-11-14) =====
- Contract: 0x389b1524a976A8fF90087d15338A8f7937c7236E (deploy tx 0x7275d01436098b414398584a1231ef21d02a7fca7ba92cd43b78a0035efb9ee3, FINALIZED / MAJORITY_AGREE, source sha256 6676eecc… verbatim in deploy calldata; record: deployment-bplus.json)
- R-4 lifecycle smoke: PASS — policy 1 funded 0.15 GEN; purchase 1; claims 1/2/3 each settled COVERED 100 / DEFECT_COVERED on assess attempt 1, canonical verdicts, each release credited exactly 0.02 GEN.
- R-3 collusion: PASS — delivered withdrawal (B delta 19862569439998706 wei), unconfirmed, aged 690s; owner restore_pending tx 0x0ecfea806c9f49f197216f5e573699ea4763bf2e57b86bf63bdaccf95696a976 -> FINISHED_WITH_ERROR NO_EXCESS, state byte-identical, B balance untouched; buyer confirm closed cleanly.
- R-1 unbacked restore blocked: PASS — second credit withdrawn (delivered, delta 19862570609998706 wei), aged 690s; owner restore_pending tx 0xca687b0608b28547e292d62ff84e856bec554dbc3842f74918bb48eab906c03d -> FINISHED_WITH_ERROR NO_EXCESS, state byte-identical, pending stood; buyer confirm closed cleanly.
- R-2 backed restore: PASS — third credit withdrawn (delivered, delta 19862567109998706 wei), aged 690s; owner top-up exactly 20000000000000000 wei (tx 0x1e1ab0209337dcdb644ac0e8672bfebb991b38724dbf7c8b9d81808983acd51f, contract raw 0.09 -> 0.11 GEN exact); restore_pending tx 0x0734f6d872dd667e30f78cb332a7868f12c41403d2868a966317940e6a9d56de -> PENDING_RESTORED, claimable(B) == 0.02 GEN, pending zeroed; restored credit withdrawn (delivered, delta 19862570109998706 wei) + confirmed, cycle complete.
- Checks: 19/19 PASS. Verdicts: 3/3 canonical COVERED 100. Blocked-restore negatives: 2/2 PASS (NO_EXCESS + state identical).
- Checker note: one hard stop occurred mid-run when the quiescent conservation identity was applied while R-3's delivered pending stood open by design; attribution was measured on chain (backed == physical == 0.13 GEN to the wei, gap exactly the open pending) and the checker was corrected to a pending-aware identity for mid-cycle points (see the CHECKER CORRECTION entry above and live-results.json notes). The 3 MISMATCH log lines and the single pass:false conservation entry from that stop are superseded by that correction.
- End state (Gemini sequencing rule): total_pending_wei == 0 AND physical balance 90000000000000000 wei == backed (unreserved 0.09 + reserved 0 + claimable 0) == contract_balance — 0 wei discrepancy, verified by direct reads.
- Spend (baselines in live/reproof-baselines.json): A net out 20616413000005176 wei (incl. 0.02 GEN top-up + deploy 365779460001294 wei); S net out 150167803000002588 wei (0.15 GEN policy funding + fees); B net IN 78614698249981884 wei (four delivered payouts minus own fees); C net out 62722320000059 wei (assess fees); S2/B2 untouched. Total desk-wallet net outflow 92232240070025939 wei (~0.092232 GEN), of which 0.09 GEN remains as the contract's pool remainder (unreserved, backed) and ~0.002232 GEN was network/consensus fees.
- Left open: nothing in the R-1..R-4 scope. The new contract's policy 1 still holds 0.09 GEN unreserved pool funds (seller S may withdraw/close per the contract's normal mechanics; outside this run's scope). Old production 0xd08c… and old twin 0xd87A… untouched.
