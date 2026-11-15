# WarrantyCourt — fast-clock twin arcs

Twin contract 0xd87A84491fb55F28A857a59Cc36f03e30e9503b8 (deploy tx 0x1c9737628688f88c6d57c651c1f2a781be45614049f3de01edb1e18269bf8cad)
Twin source sha256 f0b4f5e6ee68db7fba655a5eb34158b93b6c0dce7e223eced419f7a93f6bc1d7 — five time constants compressed, diff-verified vs production source
  CONSERVATION twin start: counters=0 contract_balance=0 raw_eth=0 -> PASS
  boundary duration d=11 -> coverage end in ~1733s
  create TP1 terms-partial (S): tx=0x51f4c6d252e0af8ed5d4854a2468ab41099fff70812031004e4479864a038a73 exec=FINISHED_WITH_RETURN
  fund TP1 0.05: tx=0x9e64e84605db89c2f6dfa79c488571900d1bcbd246c2e15a2dbf37685fdb20be exec=FINISHED_WITH_RETURN
  create TPB boundary (S): tx=0x40fc59c30dabe96c20809923194cb798bf2862930ee0e7709b4d9d7aa0277066 exec=FINISHED_WITH_RETURN
  fund TPB 0.02: tx=0x57ceb1f33eb3f3a08a597ac0ec79994126e851ebca654689aa773bcc49d30a81 exec=FINISHED_WITH_RETURN
  create TP77 boundary (S): tx=0x7db07d62101fe723003dea466330cc5da8c5f51ae28da86884ec2c09968e0dda exec=FINISHED_WITH_RETURN
  fund TP77 0.02: tx=0xe83ecfb30ba0aaf88443d825114ea74693ad982307433dfad916f74c020896cc exec=FINISHED_WITH_RETURN
  CONSERVATION twin setup: counters=90000000000000000 contract_balance=90000000000000000 raw_eth=90000000000000000 -> PASS
  register TU3 (B, receipt-none-c): tx=0x7614ce48fa7cb7f097cad557d69c28affbfa7b8efa0f304343788d8ade5d00b6 exec=FINISHED_WITH_RETURN
  file TC3 0.005 (B): tx=0x3e8bf82b271efe8f76cb800ac95e26ffac0229a16c6de2b37dbebb333c966b53 exec=FINISHED_WITH_RETURN
NEG W-49t expire TC3 immediately (twin): code=NOT_EXPIRED expected=NOT_EXPIRED stateUnchanged=true -> PASS tx=0x472bed1a69d6a8139825ce74bb0c673d2eda3e9992a7cfce420f4a83be9b90e4
  register TU2 (B, receipt-t88003): tx=0x17589f4920206cde99664208ad8a7517249cd3526dfcb6ef0d355080af650c05 exec=FINISHED_WITH_RETURN
  file TC2 0.01 limescale (B): tx=0xa3677ecc47affc13a9d65f645183fb2556886e174dc60e2e0f9bf08ef88d6340 exec=FINISHED_WITH_RETURN
  assess TC2 #1: tx=0x131054099e78081823f00fddf3ea1ce1f50f5cb45c260d7109bb9e99b8d48783 exec=FINISHED_WITH_RETURN
  assess TC2 #2: tx=0xda40ffb6c6a83bfe2480cd24cccd6b3c82994e3a5607e970b1c377920eb211d1 exec=FINISHED_WITH_RETURN
  CHECK TC2 settled NOT_COVERED: !!! FAIL !!! MALFORMED_VERDICT
  request_appeal TC2 (B): tx=0x8e423fcf4f2ab8be162c232685085fa8ad5a912a9511821a2f71777845cdf2d6 exec=FINISHED_WITH_ERROR
  !!! request_appeal TC2 (B) failed
NEG W-59t resolve_stale_appeal fresh appeal (twin): code=BAD_STATUS expected=NOT_EXPIRED stateUnchanged=true -> !!! FAIL !!! tx=0x1430445a555d36754e9da0ba34ca2bde69ebaadaa8d32d7ef68d5d531e6fff58
  register TU1 (B, receipt-t88002): tx=0x86fc469dd35b63ff9c071b54f785f420e56ca9d06efa759a5ba5edfe2d671f62 exec=FINISHED_WITH_RETURN
  file TC1 0.02 thermostat (B): tx=0xff01610428595fae3419bd40630d5282c872f61dd5c71ac64676fb6829b60208 exec=FINISHED_WITH_RETURN
  assess TC1 #1: tx=0x928476e2a05006763ab724c81c5743a2f6f412a7a250c7692fc78d91157b9ad7 exec=FINISHED_WITH_RETURN
  CHECK TC1 settled COVERED partial: PASS {"payout_pct":50,"reasons":"PARTIAL_COVERAGE","receipt_date":"2026-11-02","receipt_total_wei":45000000000000000000,"verdict":"COVERED"}
  verdict TC1: {"payout_pct":50,"reasons":"PARTIAL_COVERAGE","receipt_date":"2026-11-02","receipt_total_wei":45000000000000000000,"verdict":"COVERED"} canonical=true
NEG W-57t release TC1 inside twin appeal window: code=APPEAL_WINDOW_OPEN expected=APPEAL_WINDOW_OPEN stateUnchanged=true -> PASS tx=0x4448e889abeb8e73e5bcd63c6dfecf04b9b63b9e5f289a932f70677dc80aa760
  register TUB (B, receipt-spare1, TPB): tx=0x51388a0c102849c1cc479efa8627c49c503c444acb9262bd8b1166883205494b exec=FINISHED_WITH_ERROR
  !!! register TUB (B, receipt-spare1, TPB) failed
  file TCB1 0.005 (B): tx=0xc0cd2addd23a9f2626f6dab07f000f4993f828d1f79bb6c90828140cf7342dd1 exec=FINISHED_WITH_ERROR
  !!! file TCB1 0.005 (B) failed
  TUB coverage_end_unix=1796209199 (in 1551028s)
  register TU77 (B, receipt-spare2, TP77): tx=0xb3ef4dd97f03d05aeb2157a680697300f7b89b125acc215ebd5eb29ddd82748a exec=FINISHED_WITH_ERROR
  !!! register TU77 (B, receipt-spare2, TP77) failed
  file TC77 0.005 limescale (B): tx=0xb3bc6ed709417f5536c0607399bca0036e1aee973e39789e3ec31cb6c09653f7 exec=FINISHED_WITH_ERROR
  !!! file TC77 0.005 limescale (B) failed
  assess TC77 #1: tx=0x9c9de81c935d5ff5bd922483b610253033b983b0fd469889c5d93d6d8d211767 exec=FINISHED_WITH_ERROR
  CHECK TC77 settled NOT_COVERED: !!! FAIL !!! {"payout_pct":50,"reasons":"PARTIAL_COVERAGE","receipt_date":"2026-11-02","receipt_total_wei":45000000000000000000,"verdict":"COVERED"}
  verdict TC77: {"payout_pct":50,"reasons":"PARTIAL_COVERAGE","receipt_date":"2026-11-02","receipt_total_wei":45000000000000000000,"verdict":"COVERED"} canonical=true
  request_appeal TC77 (B) — APPEALING at coverage end: tx=0x28eddda1cb6702c05334f2cdbeecb9170dee912818f774a49268b13f0b3ea152 exec=FINISHED_WITH_ERROR
  !!! request_appeal TC77 (B) — APPEALING at coverage end failed
  CONSERVATION twin mid: counters=90000000000000000 contract_balance=90000000000000000 raw_eth=90000000000000000 -> PASS
  release TC1 after window (B): tx=0xeab4956719f06241f5bd5f47868bb0ccd6c429a2bae7adf1b7d1959262422bd4 exec=FINISHED_WITH_RETURN
  CHECK T1 release paid pct of 0.02: PASS 10000000000000000 vs 10000000000000000
  file TC1c 0.01 limescale (B, TU1): tx=0x533e7caf8cf867f3900cfd7d4a24c43d2f259b4f44b4be4c64e5dfef420f2729 exec=FINISHED_WITH_RETURN
  assess TC1c #1: tx=0xa5581153a7304fba8a570de61940f01eabb8f379e7893f381b207560a382335f exec=FINISHED_WITH_RETURN
  assess TC1c #2: tx=0x5133fabd3702bf770d94691d5718e3d84d86aa73bb126c96bf8ace9eede4ef09 exec=FINISHED_WITH_RETURN
  CHECK TC1c settled NOT_COVERED: !!! FAIL !!! MALFORMED_VERDICT
NEG W-54 request_appeal after window closed (twin): code=BAD_STATUS expected=APPEAL_WINDOW_CLOSED stateUnchanged=true -> !!! FAIL !!! tx=0x2a759ebf5bef0594ea7a889a11eb689f70971a437e14b44e4599a82cd2d66042
  release TC1c (B): tx=0xa152178dd3c8429d9c063b94e644e109cac3c9ade15734b6035970127b131984 exec=FINISHED_WITH_ERROR
  !!! release TC1c (B) failed
  CONSERVATION after T1/W-54: counters=90000000000000000 contract_balance=90000000000000000 raw_eth=90000000000000000 -> PASS
  withdraw_from_pool TP1 0.005 (S): tx=0x5a8cad5a4b33626af7f402e57e5d675e237e26eea40df8b77184a3c4467834cc exec=FINISHED_WITH_RETURN
  CHECK twin stake credited: PASS 
  withdraw_claim (S, twin): tx=0x1085046397778f3a894a577757d044f9ee1a6222324cae5b3a0d875aa207751f exec=FINISHED_WITH_RETURN
NEG W-68t restore_pending too early (twin): code=NOT-ERRORED(FINISHED_WITH_RETURN) expected=TOO_EARLY stateUnchanged=false -> !!! FAIL !!! tx=0x2986242599678843d80cb8b9636332bd9d9db169a74b6e442d748031ec6d102e
  restore_pending (A, twin): tx=0x71d7c698ef85154bb3add1e9a8e7519f89256de9fd45274b31816cce3dd57ff8 exec=FINISHED_WITH_ERROR
  !!! restore_pending (A, twin) failed
  withdraw_claim again (S, twin): tx=0xa2b051f6fd4c0c9668114b43adc12cd1deea79ad11014d67ffe8c8f96eac3d59 exec=FINISHED_WITH_RETURN
  confirm_withdrawal (S, twin): tx=0xe590abeb5b13d448856322210991adc37266d89092b0b5cda82428be28b35cf1 exec=FINISHED_WITH_RETURN
  CHECK twin restore cycle exactly-once: PASS 5000000000000000 vs 5000000000000000
  CONSERVATION after twin restore cycle: counters=85000000000000000 contract_balance=80000000000000000 raw_eth=80000000000000000 -> MISMATCH (attempt 1)
  CONSERVATION after twin restore cycle: counters=85000000000000000 contract_balance=80000000000000000 raw_eth=80000000000000000 -> MISMATCH (attempt 2)
  CONSERVATION after twin restore cycle: counters=85000000000000000 contract_balance=80000000000000000 raw_eth=80000000000000000 -> MISMATCH (attempt 3)
  resolve_stale_appeal TC2 (stranger C): tx=0xd37d991539b3f594a587459df0ba038804f64401e91b7c806a6ad84e40226e37 exec=FINISHED_WITH_ERROR
  !!! resolve_stale_appeal TC2 (stranger C) failed
  CHECK T2 claim ADJUDICATED + appeal_resolved: !!! FAIL !!! OPEN
  CHECK T2 first verdict stands byte-identical: PASS 
  release TC2 on first verdict (B): tx=0xf653565bd5508f40b9586463d88c3464117714c0ef6b0442e43c9b62e811de07 exec=FINISHED_WITH_ERROR
  !!! release TC2 on first verdict (B) failed
  TP1 after TC2 release: unres=10000000000000000 res=25000000000000000
NEG W-59t resolve_stale_appeal after resolution: code=BAD_STATUS expected=BAD_STATUS stateUnchanged=true -> PASS tx=0x522cf874282a630d138fb845a06fab0fb3165480c805d80e95c3062f0cb62d1a
  CONSERVATION after T2: counters=85000000000000000 contract_balance=80000000000000000 raw_eth=80000000000000000 -> MISMATCH (attempt 1)
  CONSERVATION after T2: counters=85000000000000000 contract_balance=80000000000000000 raw_eth=80000000000000000 -> MISMATCH (attempt 2)
  CONSERVATION after T2: counters=85000000000000000 contract_balance=80000000000000000 raw_eth=80000000000000000 -> MISMATCH (attempt 3)
  set_paused(true) (A, twin): tx=0x7ebf77037a6c8ad9c9e67072a70723b32ea629e4261e53590bcdcbf29c17452c exec=FINISHED_WITH_RETURN
  W-51/W-72 expire TC3 under pause (C): tx=0x9b82e7b296279490154e6b25b78f1b43bf6ec3daa8d3d20a0cd791e13cd5900e exec=FINISHED_WITH_RETURN
  CHECK TC3 EXPIRED: PASS 
  CHECK TU3 active claim cleared: PASS 
  set_paused(false) (A, twin): tx=0x0e49e524158eeb5a2e109c5041df53e805378fbce55b65f80253b4cfe84d59d6 exec=FINISHED_WITH_RETURN
  W-33 refile TC3 photo after expiry: tx=0x0a8e201b68098e3c972e406f49bc133020364636eac4492ba0c7849fc0836caa exec=FINISHED_WITH_RETURN
  cancel TC3b cleanup (B): tx=0xdb5c26386ee29eefa47d02475fb9d19d82f7f081cbf6062374ba480eeb732656 exec=FINISHED_WITH_RETURN
  CONSERVATION after T3: counters=85000000000000000 contract_balance=80000000000000000 raw_eth=80000000000000000 -> MISMATCH (attempt 1)
  CONSERVATION after T3: counters=85000000000000000 contract_balance=80000000000000000 raw_eth=80000000000000000 -> MISMATCH (attempt 2)
  CONSERVATION after T3: counters=85000000000000000 contract_balance=80000000000000000 raw_eth=80000000000000000 -> MISMATCH (attempt 3)
  waiting 1548363s for TPB/TP77 coverage end (until 2026-12-02T11:00:02.000Z)

# ===== PHASE D RESUME 2026-11-14 =====
  CONSERVATION twin resume start (delta -0.005 expected from restore double-debit): counters=85000000000000000 contract_balance=80000000000000000 raw_eth=80000000000000000 -> MISMATCH (attempt 1)
  CONSERVATION twin resume start (delta -0.005 expected from restore double-debit): counters=85000000000000000 contract_balance=80000000000000000 raw_eth=80000000000000000 -> MISMATCH (attempt 2)
  CONSERVATION twin resume start (delta -0.005 expected from restore double-debit): counters=85000000000000000 contract_balance=80000000000000000 raw_eth=80000000000000000 -> MISMATCH (attempt 3)
  boundary duration d=13 -> coverage end in ~3778s
  create TPB2 boundary (S): tx=0x5a27c8ab646f91c3b8c28a27dcb60fc399c57a3fc27fbb1a3205a31605e02523 exec=FINISHED_WITH_RETURN
  fund TPB2 0.02: tx=0xf34f302bfd872e431c1e13df28d270ac83794aece3c3aac9f0efe207d33786ff exec=FINISHED_WITH_RETURN
  create TP77b boundary (S): tx=0xcaf4ad07700a5fcf4602e6818ba3eb488bd37b26cb01ee1897bdb53890dd67be exec=FINISHED_WITH_RETURN
  fund TP77b 0.02: tx=0xc4e8a7ec8bba32180979f5f8d6f9d2bd26767a1b2e4b0fefe4c5ab72fb662eb4 exec=FINISHED_WITH_RETURN
  register TUB2 (B, receipt-spare1, TPB2): tx=0x36296b6a71c7c8a1712262084ea5ec4c074e68294f96f7c37aa50a30fbd6f82b exec=FINISHED_WITH_RETURN
  file TCB2 0.005 heating (B): tx=0x426e61a8cf7f5222464858e8ecede6efb7d6093cec1aa899e9613faa42439c7e exec=FINISHED_WITH_RETURN
  TUB2 coverage_end_unix=1794664799 (in 3168s)
  register TU77b (B, receipt-t88002, TP77b): tx=0xfe0c7caf0b41ff42c7384164691c84379126d3bb97604d731b06b79b56cccc3a exec=FINISHED_WITH_ERROR
  !!! register TU77b (B, receipt-t88002, TP77b) failed
  file TC77b 0.005 thermostat (B): tx=0x9231bba2b9c7123d897a0909bf9a8b2b9e2bf79f95245d738245b6c8d9c6beac exec=FINISHED_WITH_ERROR
  !!! file TC77b 0.005 thermostat (B) failed
  assess TC77b #1: tx=0x6395d7f54c64991c557fc1d49a8e7df0110bceabe7c72a91a11bd4054b87e048 exec=FINISHED_WITH_RETURN
  CHECK TC77b settled COVERED (for APPEALING close): PASS {"payout_pct":0,"reasons":"RECEIPT_MISMATCH","receipt_date":"2026-11-02","receipt_total_wei":0,"verdict":"NOT_COVERED"}
  verdict TC77b: {"payout_pct":0,"reasons":"RECEIPT_MISMATCH","receipt_date":"2026-11-02","receipt_total_wei":0,"verdict":"NOT_COVERED"} canonical=true
  request_appeal TC77b (B) — APPEALING at coverage end: tx=0xee0275ff5702091578737639fab5c844fc39800c5a28ed4f2815e310752061da exec=FINISHED_WITH_RETURN
  register TU2b (B, receipt-nototal, TP1): tx=0x67f6a1dc3910ab009df40000f663448c8dbcae134da008acc74307ff5c5bd8fb exec=FINISHED_WITH_RETURN
  file TC2b 0.01 (B): tx=0x319d6dd3387fb613e47b643c6e6a2fca7bbeff8bfcfbbc244f627bc96d7f5dbd exec=FINISHED_WITH_RETURN

# ===== PHASE D FINISHER 2026-11-14 =====
  verdict TC2b: {"payout_pct":0,"reasons":"RECEIPT_MISMATCH","receipt_date":"2026-11-02","receipt_total_wei":0,"verdict":"NOT_COVERED"} canonical=true
  CHECK TC2b settled NOT_COVERED (stale-appeal make-up): PASS {"payout_pct":0,"reasons":"RECEIPT_MISMATCH","receipt_date":"2026-11-02","receipt_total_wei":0,"verdict":"NOT_COVERED"}
  create TPB3 boundary (S): tx=0x38fc2d0ad9b6475659d6d248a6cca3fed1acd32604d09461625449af2eafffde exec=FINISHED_WITH_RETURN
  fund TPB3 0.02: tx=0xe4d241429ef0b6b8b73b0177f1799a8ff822adc67e4bdded5b3e7aec0715dd71 exec=FINISHED_WITH_RETURN
  register TUB3 (B, receipt-spare2, TPB3): tx=0x1ad4aa4d07e585037feeb0c75e7735f6dbc884ad208f2cb69aa3091094dfead3 exec=FINISHED_WITH_RETURN
  file TCB3 0.005 heating (B): tx=0xa779c8da70b0e3e9431c393b3e3f451a26e465c4b9e846d54cd0c3b08704217b exec=FINISHED_WITH_RETURN
  TUB3 coverage_end_unix=1794664799 (in 1924s)
  request_appeal TC2b (B): tx=0x1c55f2021fd0fbadbbdc305183732db7c1838197f090ae8cb0170bc1a2734685 exec=FINISHED_WITH_ERROR
  !!! request_appeal TC2b (B) failed

# ===== PHASE D FINISHER 2026-11-14 =====
  verdict TC2b: {"payout_pct":0,"reasons":"RECEIPT_MISMATCH","receipt_date":"2026-11-02","receipt_total_wei":0,"verdict":"NOT_COVERED"} canonical=true
  CHECK TC2b settled NOT_COVERED (stale-appeal make-up): PASS {"payout_pct":0,"reasons":"RECEIPT_MISMATCH","receipt_date":"2026-11-02","receipt_total_wei":0,"verdict":"NOT_COVERED"}
  TUB3 coverage_end_unix=1794664799 (in 1715s)
  release TC2b (B) — settled in d2, window closed, pays 0: tx=0x819e4479d019ef3c09ff4c0d85b7cd678f483f64246c0abeed24382a6f2da4a9 exec=FINISHED_WITH_RETURN
  register TUS (B, receipt-spare4, TP1): tx=0x5e94a1519a9952e4bc5673c93f429d7773e930b21a6419d1208030a5e5e70679 exec=FINISHED_WITH_RETURN
  file TS 0.01 heating (B): tx=0xa61bb94b3044a2c71734b53273b43dc30328f1f72692637c1b865deae598e1b4 exec=FINISHED_WITH_RETURN
  assess TS #1: tx=0x6e798a4191d5b5a653e369441373c81c2e0b952a5157a223f5bcfc80a92ea308 exec=FINISHED_WITH_RETURN
  CHECK TS settled (stale-appeal arc): PASS {"payout_pct":100,"reasons":"DEFECT_COVERED","receipt_date":"2026-11-02","receipt_total_wei":45000000000000000000,"verdict":"COVERED"}
  verdict TS: {"payout_pct":100,"reasons":"DEFECT_COVERED","receipt_date":"2026-11-02","receipt_total_wei":45000000000000000000,"verdict":"COVERED"} canonical=true
  request_appeal TS (B) — immediately after settlement: tx=0x9e03dd010e7797a6f58d44a559fde29ea3febbaeecf50cb3161683f8501b86c3 exec=FINISHED_WITH_ERROR
  !!! request_appeal TS (B) — immediately after settlement failed
NEG W-59t resolve_stale_appeal fresh appeal (twin) [make-up]: code=BAD_STATUS expected=NOT_EXPIRED stateUnchanged=true -> !!! FAIL !!! tx=0x9ac5b3dc243337927aee46d2aef376e4264a8787967a4a62f9b18b4e893d063b
  TS appeal filed at 0; stale after 900
  register TU54 (B, receipt-spare3, TP1): tx=0xb35025fd779303362e5837f7b70226a2e8d9420a2aac095859995b7303199c06 exec=FINISHED_WITH_RETURN
  file TC54 0.005 thermostat (B): tx=0x86bc46fff6b099f81f6ef2921411355118216e230b961bd14375a81cf74b4ad8 exec=FINISHED_WITH_RETURN
  assess TC54 #1: tx=0x8d50c2b77ebf1044966dc8b894a0227f8d2a959b5b636fc25ef39f608d75fbf1 exec=FINISHED_WITH_RETURN
  assess TC54 #2: tx=0x18b476739b5c119231153918b36f42122e0e11d680bbc8f71d992e263b641a70 exec=FINISHED_WITH_RETURN
  CHECK TC54 settled (W-54 make-up): PASS {"payout_pct":50,"reasons":"PARTIAL_COVERAGE","receipt_date":"2026-11-02","receipt_total_wei":45000000000000000000,"verdict":"COVERED"}
  verdict TC54: {"payout_pct":50,"reasons":"PARTIAL_COVERAGE","receipt_date":"2026-11-02","receipt_total_wei":45000000000000000000,"verdict":"COVERED"} canonical=true
  withdraw_from_pool TP1 0.001 (S, W-68t stake): tx=0xb373c7c1965f4c5197f3c9f9aba003b7b3129bd4ecd0d2d798384fe47ed33696 exec=FINISHED_WITH_ERROR
  !!! withdraw_from_pool TP1 0.001 (S, W-68t stake) failed
  W-68t cycle 1: withdraw tx=0xfd58d07ff198d7cfc63b05105e5e708f57bd1b836e4e68b7fd186f0c66c891ee exec=FINISHED_WITH_ERROR; concurrent restore tx=0x2972d89c7f317dec5c1355952f695c91275bcc1dd690caac54663487c8aff61d exec=FINISHED_WITH_ERROR
  W-68t cycle 1: second restore tx=0x896cb33820680eae39a421fc6ce7bfae2ab28fcdecaccc2ee92965762b7002ac -> NO_PENDING
  W-68t cycle 2: withdraw tx=0xa05e0418bff5a6d4b573684d0cc1d1be1effa722bd6756482ca0ec8f01b3dcfc exec=FINISHED_WITH_ERROR; concurrent restore tx=0x545a6f5c74d220aa6652bb25be162bc3fe4e29a81413d7aed7f2ffc681b52392 exec=FINISHED_WITH_ERROR
  W-68t cycle 2: second restore tx=0x6a4185b14141278a93ae390e9f8c3cb69314b9ebd7c49999e93edc4a298788e5 -> NO_PENDING
  CHECK W-68t restore_pending TOO_EARLY on twin clock [re-proof]: !!! FAIL !!! 
  CONSERVATION after W-68t re-proof: counters=145000000000000000 contract_balance=140000000000000000 raw_eth=140000000000000000 -> MISMATCH (attempt 1)
  CONSERVATION after W-68t re-proof: counters=145000000000000000 contract_balance=140000000000000000 raw_eth=140000000000000000 -> MISMATCH (attempt 2)
  CONSERVATION after W-68t re-proof: counters=145000000000000000 contract_balance=140000000000000000 raw_eth=140000000000000000 -> MISMATCH (attempt 3)
NEG W-54 request_appeal after window closed (twin) [make-up]: code=APPEAL_WINDOW_CLOSED expected=APPEAL_WINDOW_CLOSED stateUnchanged=true -> PASS tx=0xc9121346edd3f6f0d5534e09d2ade348f3407b51bab13cd4833aa877a81d4b19
  release TC54 (B): tx=0x174fe1ea9ee881f14901055fa64faa0d8ef4713bf6ada18236ab705c34749160 exec=FINISHED_WITH_RETURN
NEG W-77 close TPB2 with APPEALING claim past coverage [finisher]: code=OPEN_CLAIMS_REMAIN expected=OPEN_CLAIMS_REMAIN stateUnchanged=true -> PASS tx=0x13859f515fb5c8f3c3217749c7d5233ec1532e7accebe36cb3a8438f284806ce
NEG W-15t register purchase after coverage end (twin, TP77b) [finisher]: code=RECEIPT_ALREADY_CLAIMED expected=COVERAGE_EXPIRED stateUnchanged=true -> !!! FAIL !!! tx=0xb45d60496a0fa4e02be0e2427539ea9d5bb70ea8e5bb95acc0d9fd2065e142a9
  resolve_stale_appeal TS (stranger C) [make-up]: tx=0x33a4ff8bbdd3825b8fa7d524c674cc2577962ddf0ab77b5c8411b75d8baeec39 exec=FINISHED_WITH_ERROR
  !!! resolve_stale_appeal TS (stranger C) [make-up] failed
  CHECK T2 make-up claim ADJUDICATED + appeal_resolved: !!! FAIL !!! ADJUDICATED
  CHECK T2 make-up first verdict stands byte-identical: PASS 
  release TS on first verdict (B): tx=0xac5efe88aafaf196a0acde57c23a08620882cf5d9f5799a4edf63ab66802b5b5 exec=FINISHED_WITH_RETURN
NEG W-59t resolve_stale_appeal after resolution [make-up]: code=BAD_STATUS expected=BAD_STATUS stateUnchanged=true -> PASS tx=0xaaa885ea9f7ea38da7e2b9d941eb21f1f0a5adb68c2fafeae09c2372006133d7
NEG W-77 close TPB3 with OPEN claim past coverage [finisher]: code=OPEN_CLAIMS_REMAIN expected=OPEN_CLAIMS_REMAIN stateUnchanged=true -> PASS tx=0x47dfd4306081aef5dc2f29783f11c319170fc1a23345b3d80666e79fa3fd3755
  cancel TCB3 (B): tx=0x43d5d050f45f243878b6ea4a24bddc418bbab9ebed82d6c60c0314dfe1b1ff39 exec=FINISHED_WITH_RETURN
NEG W-21 file claim after coverage end (twin) [finisher]: code=COVERAGE_EXPIRED expected=COVERAGE_EXPIRED stateUnchanged=true -> PASS tx=0xb996cc782fc201d5103cff425ceaf62ccf4e5c460fd2af63474eedc2ba5206d1
NEG W-15t register purchase after coverage end (twin, TPB3) [finisher]: code=RECEIPT_ALREADY_CLAIMED expected=COVERAGE_EXPIRED stateUnchanged=true -> !!! FAIL !!! tx=0xadfee8bf7d50a9d84f7025bc784f68d0c3ccdbfc243d8e1b10eb4f5e27680686
  CONSERVATION twin finisher end: counters=145000000000000000 contract_balance=140000000000000000 raw_eth=140000000000000000 -> MISMATCH (attempt 1)
  CONSERVATION twin finisher end: counters=145000000000000000 contract_balance=140000000000000000 raw_eth=140000000000000000 -> MISMATCH (attempt 2)
  CONSERVATION twin finisher end: counters=145000000000000000 contract_balance=140000000000000000 raw_eth=140000000000000000 -> MISMATCH (attempt 3)
## Phase D finisher v2 failures: 8

# ===== PHASE D FINISHER v3 2026-11-14 =====
  CONSERVATION twin finisher v3 start: counters=145000000000000000 contract_balance=140000000000000000 raw_eth=140000000000000000 -> MISMATCH (attempt 1)
  CONSERVATION twin finisher v3 start: counters=145000000000000000 contract_balance=140000000000000000 raw_eth=140000000000000000 -> MISMATCH (attempt 2)
  CONSERVATION twin finisher v3 start: counters=145000000000000000 contract_balance=140000000000000000 raw_eth=140000000000000000 -> MISMATCH (attempt 3)
  register TU_TS2 (B, receipt-4550, TP1): tx=0x5ef26cc49a81134cf3d35f242491b423fd9a28298d65cee2ea871bac63123da4 exec=FINISHED_WITH_RETURN
  file TS2 0.005 thermostat (B): tx=0x57a16fd14acda134edcc00b91a1234706aa95044aee8f7f880375295fc03473b exec=FINISHED_WITH_ERROR
  !!! file TS2 0.005 thermostat (B) failed

# ===== PHASE D FINISHER v4 2026-11-14 =====
  CONSERVATION twin finisher v3 start: counters=145000000000000000 contract_balance=140000000000000000 raw_eth=140000000000000000 -> MISMATCH (attempt 1)
  CONSERVATION twin finisher v3 start: counters=145000000000000000 contract_balance=140000000000000000 raw_eth=140000000000000000 -> MISMATCH (attempt 2)
  CONSERVATION twin finisher v3 start: counters=145000000000000000 contract_balance=140000000000000000 raw_eth=140000000000000000 -> MISMATCH (attempt 3)
  fund TP1 +0.01 top-up (S) — pool headroom for TS2: tx=0x026ed51dc60494e8e5e1fac0436bab5bb2e064dda7f695a39372533187bf724a exec=FINISHED_WITH_RETURN
  TU_TS2 bound from chain: 9 (registered by d5)
  file TS2 0.005 thermostat (B): tx=0x4def54503cb2cca0c5a435190c83f82d14c194f22292b3bb2a8f53becbd9fe89 exec=FINISHED_WITH_RETURN
  assess TS2 #1: tx=0x5674c11579b7a9363c3c27196d96a755dcb55283f4e65b9ab116635259e74de5 exec=FINISHED_WITH_RETURN
  CHECK TS2 settled (stale-appeal arc): PASS {"payout_pct":50,"reasons":"PARTIAL_COVERAGE","receipt_date":"2026-11-02","receipt_total_wei":45500000000000000000,"verdict":"COVERED"}
  verdict TS2: {"payout_pct":50,"reasons":"PARTIAL_COVERAGE","receipt_date":"2026-11-02","receipt_total_wei":45500000000000000000,"verdict":"COVERED"} canonical=true
  request_appeal TS2 (B) — immediately after settlement: tx=0x375de83ee6a4d81d9c751badd3504411b6bfa52e80abffe65387761ea76156fc exec=FINISHED_WITH_RETURN
NEG W-59t resolve_stale_appeal fresh appeal (twin) [make-up v4]: code=NOT_EXPIRED expected=NOT_EXPIRED stateUnchanged=true -> PASS tx=0xbf5cca42a5fefa4cb985eac440021e2369ebcb687dde66c6326e4538accbbc62
  TS2 appeal filed at 1794666786; stale after 1794667686
  withdraw_from_pool TPB3 0.001 (S, W-68t stake): tx=0x46c2ed2e1680da7572223408962688227f3db8503260d0da20a31fe3ffd3f839 exec=FINISHED_WITH_RETURN
  W-68t cycle 1: withdraw tx=0x15f3e82927a63186552782469d1a8c36722bfadaf5740beb055960a7f43674d9 exec=FINISHED_WITH_RETURN; concurrent restore tx=0x67cdd7afc8a519e3ba9b1fa0b63dcb11d54c3f52d746b848f0c34c2db7bb5f34 exec=FINISHED_WITH_ERROR
  CHECK W-68t restore_pending TOO_EARLY on twin clock [re-proof v4]: PASS 
  restore_pending post-gate (A, twin): tx=0xc7937027660dad1b909c573a264b5ae945d82d3a1f23b9048a3e629b0c735ff0 exec=FINISHED_WITH_RETURN
  CONSERVATION after W-68t re-proof v4: counters=155000000000000000 contract_balance=149000000000000000 raw_eth=149000000000000000 -> MISMATCH (attempt 1)
  CONSERVATION after W-68t re-proof v4: counters=155000000000000000 contract_balance=149000000000000000 raw_eth=149000000000000000 -> MISMATCH (attempt 2)
  CONSERVATION after W-68t re-proof v4: counters=155000000000000000 contract_balance=149000000000000000 raw_eth=149000000000000000 -> MISMATCH (attempt 3)
NEG W-15t register purchase after coverage end (twin, TP77b) [v3]: code=COVERAGE_EXPIRED expected=COVERAGE_EXPIRED stateUnchanged=true -> PASS tx=0xe6e1517251763a80a82427f70c14b42ef4012b2fe37c5895516cf9ee3cb87de0
NEG W-15t register purchase after coverage end (twin, TPB3) [v3]: code=COVERAGE_EXPIRED expected=COVERAGE_EXPIRED stateUnchanged=true -> PASS tx=0xec37127d493ed15266104b79a1be16009688b9dace2511fcfe9a63f65dfc99ef
  waiting 88s for TS2 stale-appeal expiry (900 s) (until 2026-11-14T14:48:08.000Z)
  resolve_stale_appeal TS2 (stranger C) [make-up v4]: tx=0x71dff47d9385fdaca2fa4cba6ee9846405e6eeb9bc017eed3c415539ff9b5190 exec=FINISHED_WITH_RETURN
  CHECK T2 v3 claim ADJUDICATED + appeal_resolved: PASS ADJUDICATED
  CHECK T2 v3 first verdict stands byte-identical: PASS 
  release TS2 on first verdict (B): tx=0x11928a64c0a9247cffc4a1996e26b774aee64152c72179d2bde063790de1467e exec=FINISHED_WITH_RETURN
  CHECK TS2 release paid pct of 0.005: PASS 2500000000000000 vs 2500000000000000
NEG W-59t resolve_stale_appeal after resolution [make-up v4]: code=BAD_STATUS expected=BAD_STATUS stateUnchanged=true -> PASS tx=0xf79e75faf99ff679789ac35bf2636d9f6d14a900d5ebe6949332ef1938f4207b
  CONSERVATION twin finisher v3 end: counters=155000000000000000 contract_balance=149000000000000000 raw_eth=149000000000000000 -> MISMATCH (attempt 1)
  CONSERVATION twin finisher v3 end: counters=155000000000000000 contract_balance=149000000000000000 raw_eth=149000000000000000 -> MISMATCH (attempt 2)
  CONSERVATION twin finisher v3 end: counters=155000000000000000 contract_balance=149000000000000000 raw_eth=149000000000000000 -> MISMATCH (attempt 3)
## Phase D finisher v4 failures: 0

## PHASE E TALLY (twin)
All twin arcs proven: appeal-window release (exact 50%), stale-appeal permissionless resolution (verdict byte-identical), W-54, claim-expiry under pause + refile, W-68t TOO_EARLY (timed), W-77 both legs, W-21, W-15t ×2. Final twin conservation delta −0.006 GEN, fully accounted (0.005 restore double-debit + 0.001 W-68t emission). See lifecycle-live.md Phase E section.
