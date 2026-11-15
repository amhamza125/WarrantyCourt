# WarrantyCourt — live negative suite (production)

Production contract 0xd08c6Ca5ed4399e58444949C5f306Dcc29976CcC; P1=1 P2=2
  CONSERVATION phase C start: counters=80000000000000000 contract_balance=80000000000000000 raw_eth=80000000000000000 -> PASS

## Creation negatives
NEG W-02 create bad hash short: exec=FINISHED_WITH_ERROR code=BAD_HASH expected=BAD_HASH stateUnchanged=true -> PASS tx=0xdd36cc0e52507405795a52f76738d90d569a43f36ae62dea515012a72edfa54a
NEG W-02 create bad hash z*64: exec=FINISHED_WITH_ERROR code=BAD_HASH expected=BAD_HASH stateUnchanged=true -> PASS tx=0xa552f3c243feab41fc2139f9b55a7316257f25a3fda50e100dfbe37e2b0fa3e2
NEG W-02 create bad hash a*63: exec=FINISHED_WITH_ERROR code=BAD_HASH expected=BAD_HASH stateUnchanged=true -> PASS tx=0x12b79466223b4280217cfa8601baaa3b9cd582b52e560172269e1d00e4e72527
NEG W-03 create url too long: exec=FINISHED_WITH_ERROR code=LINK_TOO_LONG expected=LINK_TOO_LONG stateUnchanged=true -> PASS tx=0x602f23674515915ddae6b2e157f48e41075325b3fe0ed8f10cab225513f6d307
NEG W-03 create ftp url: exec=FINISHED_WITH_ERROR code=BAD_URL expected=BAD_URL stateUnchanged=true -> PASS tx=0xdc6403b43dfc9fe130fae794713c7d918a4df73eaf686e8b2f7f7fe55df7e97f
NEG W-03 create empty url: exec=FINISHED_WITH_ERROR code=BAD_URL expected=BAD_URL stateUnchanged=true -> PASS tx=0x61005be7e53206b6fb4bb9a4b7de635509dde877d1a0ea834f21eea78b69869c
NEG W-03 create 127.0.0.1 url: exec=FINISHED_WITH_ERROR code=PRIVATE_URL_NOT_ALLOWED expected=PRIVATE_URL_NOT_ALLOWED stateUnchanged=true -> PASS tx=0x81ea776114dd270d8d3bad5b0937e6bd383b4031db96f78d6d72de22e1439575
NEG W-03 create localhost url: exec=FINISHED_WITH_ERROR code=PRIVATE_URL_NOT_ALLOWED expected=PRIVATE_URL_NOT_ALLOWED stateUnchanged=true -> PASS tx=0x20de0c46d447519a5e94bac7042bbd8970c3cae4e8539f0517a36ee414b4c3cf
NEG W-03 create 169.254 url: exec=FINISHED_WITH_ERROR code=PRIVATE_URL_NOT_ALLOWED expected=PRIVATE_URL_NOT_ALLOWED stateUnchanged=true -> PASS tx=0xf9e14265e639af2f2c75c2f05207c242025d9b603ffe082ea4bd665a69ea657d
NEG W-03 create .internal url: exec=FINISHED_WITH_ERROR code=PRIVATE_URL_NOT_ALLOWED expected=PRIVATE_URL_NOT_ALLOWED stateUnchanged=true -> PASS tx=0xf3292c1947597e105176a73fa75a3b3d44c16c141b7b06a6d84d9772e7147e8d
NEG W-03 create aton url: exec=FINISHED_WITH_ERROR code=PRIVATE_URL_NOT_ALLOWED expected=PRIVATE_URL_NOT_ALLOWED stateUnchanged=true -> PASS tx=0xc112c0f4951a2ecfe69aab7bc03410a05c811ca4db51887a40f7e22619afe800
NEG W-04 create duration 0: exec=FINISHED_WITH_ERROR code=BAD_DURATION expected=BAD_DURATION stateUnchanged=true -> PASS tx=0x43a15b0b40d9c7fdc48733b52b85b5a012b2081b09d74383fc29a59312b4fe2a
NEG W-04 create duration 3651: exec=FINISHED_WITH_ERROR code=BAD_DURATION expected=BAD_DURATION stateUnchanged=true -> PASS tx=0x94a74267b534ddb9808044adc31b90a7ab5233e880bab73956853576160f2084
NEG W-05 create cap 0: exec=FINISHED_WITH_ERROR code=BAD_CAP expected=BAD_CAP stateUnchanged=true -> PASS tx=0x8250bfb2e89dc3cb4765ec2d8fb2f7540e7797f56573565ca0da66669ab04c27
NEG W-07 create product 129 chars: exec=FINISHED_WITH_ERROR code=TEXT_TOO_LONG expected=TEXT_TOO_LONG stateUnchanged=true -> PASS tx=0xea1d542004ec4adba94d94e8758ab76054faa55d0d0dc83db2b2a50234a0f294
NEG W-07 create empty product: exec=FINISHED_WITH_ERROR code=EMPTY_PRODUCT expected=EMPTY_PRODUCT stateUnchanged=true -> PASS tx=0x9e7db5435d7ee13b91f4b77f73e472064370ef659810dc083419ef113b04fa19
NEG W-07 create blank product: exec=FINISHED_WITH_ERROR code=EMPTY_PRODUCT expected=EMPTY_PRODUCT stateUnchanged=true -> PASS tx=0x90e8784e57398e45639196d565f9d72dc07268a27014c6ee6dd0a88b87213c3d
  CONSERVATION after creation negatives: counters=80000000000000000 contract_balance=80000000000000000 raw_eth=80000000000000000 -> PASS

## Closed policy P0 (seller2)
Production contract 0xd08c6Ca5ed4399e58444949C5f306Dcc29976CcC; P1=1 P2=2
  CONSERVATION phase C start: counters=80000000000000000 contract_balance=80000000000000000 raw_eth=80000000000000000 -> PASS

# ===== RESUME 2026-11-14 — Phase C resumes at section 2 (P0 = policy 3, already on chain) =====
  CONSERVATION phase C resume start: counters=80000000000000000 contract_balance=80000000000000000 raw_eth=80000000000000000 -> PASS

## Closed policy P0 (seller2)
  P0=3 (created pre-restart, resumed)
  close_policy P0 (S2): tx=0x70a6e66b0b9d41f6b659eb0adfea1b0aba43c044ad08a7cd1eec365e1feb0f29 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  W-09 fund closed policy (S2): tx=0xd85f705ff9867079689427d28507d44ab256cd0b4b36bcc5d60473ea614a75a5 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  CHECK W-09 closed-policy fund credited back: PASS 3000000000000000
  W-09 fund policy 999 (B): tx=0x6f470e1c44e59011f785f26175fc769e5196464390b1647ff1743c56735cfa7a exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  CHECK W-09 fund 999 credited back: PASS 2000000000000000
NEG W-16 register on closed policy: exec=FINISHED_WITH_ERROR code=POLICY_CLOSED expected=POLICY_CLOSED stateUnchanged=true -> PASS tx=0x5cfb67344af5f803df0d7ba5489c0c0c2a48a308fcc0e8c23caed35cac3f29ae
NEG W-16 register on policy 999: exec=FINISHED_WITH_ERROR code=POLICY_NOT_FOUND expected=POLICY_NOT_FOUND stateUnchanged=true -> PASS tx=0xd5410b6b4bb68b20883f222e4f206d87b9785eec94eee60e4d592bd5e795a930
NEG W-91 withdraw_from_pool closed by stranger: exec=FINISHED_WITH_ERROR code=ONLY_SELLER expected=ONLY_SELLER stateUnchanged=true -> PASS tx=0xfbff68f1b2d7acb10756f8c68eeb2be47b922f9c457dab6d588931f7015b732b
NEG W-91 withdraw_from_pool on CLOSED policy: exec=FINISHED_WITH_ERROR code=POLICY_CLOSED expected=POLICY_CLOSED stateUnchanged=true -> PASS tx=0x0268872ba1fb6ba3e770ec8312f4c0f67effe64b174d23bef859888f4a14938c
Production contract 0xd08c6Ca5ed4399e58444949C5f306Dcc29976CcC; P1=1 P2=2
  CONSERVATION phase C start: counters=85000000000000000 contract_balance=85000000000000000 raw_eth=85000000000000000 -> PASS

# ===== RESUME 2 2026-11-14 — Phase C resumes at section 3 (funding negatives) =====
  CONSERVATION phase C resume-2 start: counters=85000000000000000 contract_balance=85000000000000000 raw_eth=85000000000000000 -> PASS

## Funding negatives
  W-08 stranger funds P1: tx=0xa62470e197321e6c2aafd8e82a2aaacdaef4f83520fefa03763d6bd1e9e222cc exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
Production contract 0xd08c6Ca5ed4399e58444949C5f306Dcc29976CcC; P1=1 P2=2
  CONSERVATION phase C start: counters=86000000000000000 contract_balance=86000000000000000 raw_eth=86000000000000000 -> PASS

# ===== RESUME 3 2026-11-14 — Phase C resumes in section 3 (W-08 read-only assert, then W-10) =====
  CHECK W-08 stranger fund credited back, pool untouched (read-only assert): PASS claimableC=1000000000000000 P1 unres=20000000000000000 res=10000000000000000
  CONSERVATION phase C resume-3 start: counters=86000000000000000 contract_balance=86000000000000000 raw_eth=86000000000000000 -> PASS
NEG W-10 fund_policy value 0: exec=FINISHED_WITH_ERROR code=BAD_AMOUNT expected=BAD_AMOUNT stateUnchanged=true -> PASS tx=0xe063a85ab7042d475e3c28fff307527af31ad1ed4d6217db425f2d6c97917927
  CONSERVATION after funding negatives: counters=86000000000000000 contract_balance=86000000000000000 raw_eth=86000000000000000 -> PASS

## Purchase negatives
NEG W-12 seller registers own purchase: exec=FINISHED_WITH_ERROR code=SELLER_CANNOT_REGISTER expected=SELLER_CANNOT_REGISTER stateUnchanged=true -> PASS tx=0xcc83bd38a8331b80de69d1c28ab83b512b5cce0919fc091d7098647ed5617f66
NEG W-13 duplicate receipt on P1: exec=FINISHED_WITH_ERROR code=RECEIPT_ALREADY_CLAIMED expected=RECEIPT_ALREADY_CLAIMED stateUnchanged=true -> PASS tx=0xe03f7409afa354360a8f1a97add0e1eecfce353213775de8acd1af060e154467
NEG W-13 duplicate receipt on P2: exec=FINISHED_WITH_ERROR code=RECEIPT_ALREADY_CLAIMED expected=RECEIPT_ALREADY_CLAIMED stateUnchanged=true -> PASS tx=0xeabf609426cc41e89a604ea6aa1d420be26ce44b1e92b31fa048d85b9842b4e0
NEG W-14 register date 2026-13-40: exec=FINISHED_WITH_ERROR code=BAD_DATE expected=BAD_DATE stateUnchanged=true -> PASS tx=0xe9ef1a287aea8b75d71a87de16d289cb5c8b65f678a6299519726d346e697136
NEG W-14 register date 11/02/2026: exec=FINISHED_WITH_ERROR code=BAD_DATE expected=BAD_DATE stateUnchanged=true -> PASS tx=0x1f7f636c1f2e54aa6b5887bbd7e5cf2a7db0fb1a619754fb34f3e6971d9c74dd
NEG W-14 register future date (tomorrow): exec=FINISHED_WITH_ERROR code=BAD_DATE expected=BAD_DATE stateUnchanged=true -> PASS tx=0xed7771bb2662b00dca197ad8db63e2431489f31e2fa42b9a979f344bd07bff3b
  create_policy P15 duration 1 (S): tx=0x044baf66e522bfdf57622ba42af02c10212b9407c34cf8e713a7feb2443dbe91 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
NEG W-15 register past-coverage purchase: exec=FINISHED_WITH_ERROR code=COVERAGE_EXPIRED expected=COVERAGE_EXPIRED stateUnchanged=true -> PASS tx=0x514f70d7fc795a19b817dbfe7dd1a54e46331658b66bdef3c44dfbbf71c49ae1
NEG W-17 register bad receipt hash: exec=FINISHED_WITH_ERROR code=BAD_HASH expected=BAD_HASH stateUnchanged=true -> PASS tx=0x22e7eb1531f87e30e94994c8efdb47b137dc7760e345641982f956967187cf6b
NEG W-17 register private receipt url 192.168: exec=FINISHED_WITH_ERROR code=PRIVATE_URL_NOT_ALLOWED expected=PRIVATE_URL_NOT_ALLOWED stateUnchanged=true -> PASS tx=0x7d76139187ab0ce41ead2ed83f17c33f0e7adde55eea2d4771828f0895fb9691
NEG W-17 register private receipt url .local: exec=FINISHED_WITH_ERROR code=PRIVATE_URL_NOT_ALLOWED expected=PRIVATE_URL_NOT_ALLOWED stateUnchanged=true -> PASS tx=0x580b12cda6182e3cadd080b849a4cab273e9874dce6d4d182c95b258d59e9280
NEG W-19 register date below floor 2019-12-31: exec=FINISHED_WITH_ERROR code=BAD_DATE expected=BAD_DATE stateUnchanged=true -> PASS tx=0x03a61631502396ea1866fc4dd0e6fb04e31857eebfb53aefe7f8a43d657daaec
  create_policy P19 duration 1 (S): tx=0x0b47e6e758cc9f53a4454b97cf02f54270b1364d1197d91450e94310e975a9c7 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  fund_policy P19 0.05: tx=0xf9dea9c13954a61c17ba4ad2d1d7521d4be841485878d47c5058426761243d30 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  W-19 register purchase dated today: tx=0x7dd1545807d38c95aff2b94772aed2c589543f005417e63f2e4759edeae99ff4 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  W-19 file claim same day: tx=0x3044714fbca6aa48344b42c2763686e083368be7d1ebf35fcd025f1372962f67 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  CHECK W-19 same-day claim OPEN: PASS 
  cancel C19 cleanup (B): tx=0xf214e5fbdfc3ac5fb083d261c5097b4fd3a5712504fe27650822b41b0670dc7f exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  CONSERVATION after purchase negatives: counters=136000000000000000 contract_balance=136000000000000000 raw_eth=136000000000000000 -> PASS

## Filing negatives
  register_purchase U4 (B, receipt-spare1, P1): tx=0xa042ebfd14cfaf586c72789ef8969edc23fca6251bcc9f9b56d735454acb4542 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
NEG W-20 file by seller: exec=FINISHED_WITH_ERROR code=ONLY_BUYER expected=ONLY_BUYER stateUnchanged=true -> PASS tx=0xca9810d6438c55039f95e80b917574dbdb24a86cce9575344df9ca164fd6c6f7
NEG W-20 file by stranger: exec=FINISHED_WITH_ERROR code=ONLY_BUYER expected=ONLY_BUYER stateUnchanged=true -> PASS tx=0xce6610f37599157f20d6ef3eeecca758efedf3aa2c91f6a395241f769e6d70dd
NEG W-23 file amount 0: exec=FINISHED_WITH_ERROR code=BAD_AMOUNT expected=BAD_AMOUNT stateUnchanged=true -> PASS tx=0x214af0e40f3c55eb6a22c73c36fd44c01bceb62ae9e2dc46e99644045a15d70c
NEG W-23 file amount 2^256: exec=FINISHED_WITH_ERROR code=BAD_AMOUNT
NEG W-24 file over per-claim cap: exec=FINISHED_WITH_ERROR code=OVER_CAP expected=OVER_CAP stateUnchanged=true -> PASS tx=0xb23ba60c2f0156e77454e9a6b48320bea289beb59c2cd2a711648ec23fac9ad9
NEG W-26 file bad photo hash: exec=FINISHED_WITH_ERROR code=BAD_HASH expected=BAD_HASH stateUnchanged=true -> PASS tx=0xe2173c941f6f8e520b36ce1e0ac511831dc2c7f4ba190e70cbac26bb77315372
NEG W-26 file private photo url: exec=FINISHED_WITH_ERROR code=PRIVATE_URL_NOT_ALLOWED expected=PRIVATE_URL_NOT_ALLOWED stateUnchanged=true -> PASS tx=0xd4547d745d0fb3aea974b76ac74405152135bc9af945c99614de23dea15eb5b2
NEG W-27 file defect 1001 chars: exec=FINISHED_WITH_ERROR code=TEXT_TOO_LONG expected=TEXT_TOO_LONG stateUnchanged=true -> PASS tx=0x4d146d6c56aa5943cf00b5121b706c2a8bb9c3fbd904716c7312331d7c0bf66d
NEG W-27 file empty defect: exec=FINISHED_WITH_ERROR code=EMPTY_DEFECT expected=EMPTY_DEFECT stateUnchanged=true -> PASS tx=0x2f59308bfe8edba5708f6597f12cc70c444c578e73913373428fe73b9c74a16c
NEG W-27 file control-char defect: exec=FINISHED_WITH_ERROR code=EMPTY_DEFECT expected=EMPTY_DEFECT stateUnchanged=true -> PASS tx=0x4f1d2dcf2d8b2071a3eef08025be30529429dea83e4f4026f0e13b140a0eea5e
NEG W-29 file on purchase 999: exec=FINISHED_WITH_ERROR code=PURCHASE_NOT_FOUND expected=PURCHASE_NOT_FOUND stateUnchanged=true -> PASS tx=0xfd50db7ccf5f5e321dd027e4ae6b0c68275d2314f2c6d87c308cd15c8e0e6842
  create_policy P3 (S): tx=0xf35517a76d1ceba9e512f8ca4328fe98255fc28f6be799fd2c501739deaddecf exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  fund_policy P3 0.005: tx=0x842c448cb798d70c8085f09db0a1272d7204546e4d295845e513333150e546c6 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  register_purchase U25 (B, P3): tx=0xeca3d7e2f7829aca87b93516053bfb28e7667d2abf94bc1a8a1bb730d229ae16 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
NEG W-25 file over pool unreserved: exec=FINISHED_WITH_ERROR code=POOL_INSUFFICIENT expected=POOL_INSUFFICIENT stateUnchanged=true -> PASS tx=0x4d8909f76309c5343b6312f4ff472463c312b74456ef567859375f860181d42b
  file_claim C4 0.01 (B, U4): tx=0x3f5f160edb04a4e6078543ecb6e6c876c02082283fc8176367acefd19e240559 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
NEG W-22 second claim while C4 OPEN: exec=FINISHED_WITH_ERROR code=CLAIM_ALREADY_OPEN expected=CLAIM_ALREADY_OPEN stateUnchanged=true -> PASS tx=0xec7e7fe3fd08cfaa09e334262e42a0051f9aa6ddc1c62a0d086f633b84c611dc
NEG W-46 cancel C4 by seller: exec=FINISHED_WITH_ERROR code=ONLY_BUYER expected=ONLY_BUYER stateUnchanged=true -> PASS tx=0x612fee0f1040cc51724b49272874cbc96774057372be0b1f33603da3e34238a3
NEG W-46 cancel C4 by stranger: exec=FINISHED_WITH_ERROR code=ONLY_BUYER expected=ONLY_BUYER stateUnchanged=true -> PASS tx=0xdb1fc4b1259fa58c555ecb550c84e3b96b5a88a9ae7e3b567d9f5492a4817a28
NEG W-56 appeal on OPEN claim C4: exec=FINISHED_WITH_ERROR code=BAD_STATUS expected=BAD_STATUS stateUnchanged=true -> PASS tx=0x5bfe177f222f2d2c8813a08c87543a5f166ae5a00515e59ef32954ddc087c492
NEG W-62 release OPEN claim C4: exec=FINISHED_WITH_ERROR code=NO_VERDICT expected=NO_VERDICT stateUnchanged=true -> PASS tx=0x70e3dd9e3a0a18e2e2b8a0456239a2127a3cbf7c1ce6c8f81877da04688f58e7
NEG W-49 expire fresh claim C4: exec=FINISHED_WITH_ERROR code=NOT_EXPIRED expected=NOT_EXPIRED stateUnchanged=true -> PASS tx=0xb19b5d4c7e64430872efca3ed0e1a51cf8674d1eb3a0d202d8be7c2eeb40d9f1
NEG W-65 withdraw_claim with no credit (S2): exec=FINISHED_WITH_RETURN code=NOT-ERRORED(FINISHED_WITH_RETURN) expected=NO_CLAIM stateUnchanged=false -> !!! FAIL !!! tx=0x8a1393b6a44f6a0c02aac7bab6d093a24909c529b821792233e40bd3ca96fddf
NEG W-67 confirm_withdrawal with no pending (S2): exec=FINISHED_WITH_RETURN code=NOT-ERRORED(FINISHED_WITH_RETURN) expected=NO_PENDING stateUnchanged=false -> !!! FAIL !!! tx=0x5a78971881ca0c0ffdb094dcce7caf0a8656cf841e0de31a54d4e3e10d4b054a
NEG W-92 restore_pending by stranger, malformed addr: exec=FINISHED_WITH_ERROR code=ONLY_OWNER expected=ONLY_OWNER stateUnchanged=true -> PASS tx=0xbb7d5e816519113b2a3d170c50d8a75fa48ab07771d3df0f68a5ec39f603d87e
NEG W-92 restore_pending malformed addr, no pending: exec=FINISHED_WITH_ERROR code=NO_PENDING expected=NO_PENDING stateUnchanged=true -> PASS tx=0xf2df67cf4d0b8899f767729e3738f530854534aac1ee78d802ba00964f2fc835
NEG W-92 restore_pending B2, no pending: exec=FINISHED_WITH_ERROR code=NO_PENDING expected=NO_PENDING stateUnchanged=true -> PASS tx=0xdcc09956a750bedccee0675ce45969a0fa67ebcdf9d5a3486f26ca8e3950c412
  CONSERVATION after filing negatives: counters=138000000000000000 contract_balance=141000000000000000 raw_eth=141000000000000000 -> MISMATCH (attempt 1)
  CONSERVATION after filing negatives: counters=138000000000000000 contract_balance=141000000000000000 raw_eth=141000000000000000 -> MISMATCH (attempt 2)
  CONSERVATION after filing negatives: counters=138000000000000000 contract_balance=141000000000000000 raw_eth=141000000000000000 -> MISMATCH (attempt 3)

## Photo registry

## INTERVENTION — W-65/W-67 episode + recovery
W-65/W-67 as scripted used S2, which section 2 had credited 0.003 GEN (W-09 credit-back): withdraw_claim and confirm_withdrawal therefore CORRECTLY succeeded (txs in live-results.json). The unallocated withdraw never transferred, leaving exactly 0.003 GEN untracked excess; owner sweep_excess tx=0x9af579e6b6b6357c1c216cb50f1dcc622540f2c686d2668cda02785473bce374 recovered it to owner claimable and restored counters==balance. Real NO_CLAIM/NO_PENDING proofs run as make-up negatives after Phase C.
Production contract 0xd08c6Ca5ed4399e58444949C5f306Dcc29976CcC; P1=1 P2=2
  CONSERVATION phase C start: counters=141000000000000000 contract_balance=141000000000000000 raw_eth=141000000000000000 -> PASS

# ===== RESUME 4 2026-11-14 — Phase C resumes at section 6 (photo registry) =====
  CONSERVATION phase C resume-4 start: counters=141000000000000000 contract_balance=141000000000000000 raw_eth=141000000000000000 -> PASS

## Photo registry
  U34=7 (registered pre-intervention, resumed)
NEG W-32/W-34 file with SETTLED claim photo (kettle-1): exec=FINISHED_WITH_ERROR code=PHOTO_ALREADY_USED expected=PHOTO_ALREADY_USED stateUnchanged=true -> PASS tx=0xbde983cd9a7f4b96f55787cacb21de25ce07f02846250278c5fec5dffa7f4838
NEG W-34 file with ADJUDICATED claim photo (toaster-1): exec=FINISHED_WITH_ERROR code=PHOTO_ALREADY_USED expected=PHOTO_ALREADY_USED stateUnchanged=true -> PASS tx=0xca3b541c1d7c2104db83c6cbee7570d5b3cb6f76f25c9fddd5179a555f49d490
  file_claim C33 kettle-6 (B2, U34): tx=0xbba5e9e657f304b9e6045d5c04ab67668925fd9d5aa7879bf7f05e163f8ead19 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  cancel C33 (B2): tx=0x8280de7cd971f13205d52779a4827e0ef0697f80a35914b89dc9a9d3383e257a exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  W-33 refile same photo after cancel: tx=0x7a752ff128db316397552d4d0bdf36a514846fc41db2325bd50e141949f520aa exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  CHECK W-33 refiled claim OPEN: PASS 
  cancel C33b cleanup (B2): tx=0x82ccb072d469f208f1e2413e8658fa209357b1e6227fb2bfd426bdb7d9ea6dc9 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  CONSERVATION after photo registry block: counters=141000000000000000 contract_balance=141000000000000000 raw_eth=141000000000000000 -> PASS

## Aggregate cap
  create_policy P4 (S, cap 0.01): tx=0xeff1d192fce7a3e633982bc306f4a483511fd81d60ab8480ebd13c89e0521ae5 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  fund_policy P4 0.02: tx=0x6dd8bf499a2a77e1f326a2708153a17edbb854cf0a626976ced04a5ee4f31ba3 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  register_purchase U30 (B, receipt-small): tx=0x095fa8f6a87b7dfebac10c6d1dd3b662e573601e3554e432a7952bf7a412124a exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  file AGG1: tx=0xe323da98fa48279200dd0a559ec4dcfb1fde6dc6d418c1d4a7ce65272bbaf113 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  assess AGG1 #1: tx=0x25c3c1e773af9351fe35489d7f39aa572906f7d3e4349860e50fef395d57d4ef exec=FINISHED_WITH_RETURN
  assess AGG1: no-consensus — retrying
  assess AGG1 #2: tx=0x8f7cc36e14022bbb19bf029b2bc2e5764a32d1c77121be6eab3d55e307c6d2e9 exec=FINISHED_WITH_RETURN
  assess AGG1: no-consensus — retrying
  assess AGG1 #3: tx=0x6de474590bad181cb891917a63b4db092e0f08976f93f697be011495a2d795be exec=NOT_VOTED
  assess AGG1: no-consensus — retrying
  assess AGG1 #4: tx=0x3dade1ded9aa35dbaf5846f14a760550c11b1ca6c0d870c5be35717bbd9ef857 exec=FINISHED_WITH_RETURN
  CHECK AGG1 settled COVERED: PASS {"payout_pct":100,"reasons":"DEFECT_COVERED","receipt_date":"2026-11-02","receipt_total_wei":10000000000000000,"verdict":"COVERED"}
  verdict AGG1: {"payout_pct":100,"reasons":"DEFECT_COVERED","receipt_date":"2026-11-02","receipt_total_wei":10000000000000000,"verdict":"COVERED"} canonical=true
Production contract 0xd08c6Ca5ed4399e58444949C5f306Dcc29976CcC; P1=1 P2=2
  CONSERVATION phase C start: counters=161000000000000000 contract_balance=161000000000000000 raw_eth=161000000000000000 -> PASS

# ===== RESUME 5 2026-11-14 — Phase C resumes in section 7 at AGG2 =====
  CHECK AGG1 complete on re-read (SETTLED, cum 0.004): PASS status=SETTLED cum=4000000000000000
  CONSERVATION phase C resume-5 start: counters=161000000000000000 contract_balance=161000000000000000 raw_eth=161000000000000000 -> PASS
  file AGG2: tx=0x60735cac54e83db9332e18217a40440e57f692bd4fed359abf90d93b9eaf94a5 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  assess AGG2 #1: tx=0xb3efa81eaac43513d962a10ba8f355a3991a1d8c4be9a0c79f686c3bfe78a199 exec=FINISHED_WITH_RETURN
  assess AGG2: no-consensus — retrying
  assess AGG2 #2: tx=0xb51eb44ffc1b412129ca3b742af18686be48aa04484a75453d7eb860f2890859 exec=FINISHED_WITH_RETURN
  CHECK AGG2 settled COVERED: PASS {"payout_pct":100,"reasons":"DEFECT_COVERED","receipt_date":"2026-11-02","receipt_total_wei":10000000000000000,"verdict":"COVERED"}
  verdict AGG2: {"payout_pct":100,"reasons":"DEFECT_COVERED","receipt_date":"2026-11-02","receipt_total_wei":10000000000000000,"verdict":"COVERED"} canonical=true
  release AGG2: tx=0x7b381b5e581145ace4f7567efb184685837262f67dc7a67ad0469f45e09859dd exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  CHECK U30 cumulative == 0.008, total == 0.01: PASS {"purchase_id":"8","policy_id":"7","buyer":"0x0bba411375d7074178980e610b5311dd6ed34d74","receipt_url":"https://muse.ai/files/1362570570277562/39878235521822076/7gjbjaa193cuhj9bakka40ud/receipt-small.txt","receipt_sha256":"b72b45a49df5b52aef7f9f9272678540ebc5d64b82daf77bab69b0a9d411fcf6","purchase_date":"2026-11-02","purchase_date_unix":1793577600,"coverage_end_unix":1856735999,"registered_at":1794640455,"active_claim_id":"","claim_count":2,"cumulative_paid_wei":"8000000000000000","receipt_total_wei":"10000000000000000"}
NEG W-30 file pushing cumulative over total: exec=FINISHED_WITH_ERROR code=AGGREGATE_CAP_EXCEEDED expected=AGGREGATE_CAP_EXCEEDED stateUnchanged=true -> PASS tx=0xaddff26b5c68c165124cdcb2be1e1208ce9559f8d9e6fc9ee79edbd2adcc832c
  W-30 boundary file exactly to total (0.002): tx=0x5db67db407cf08708e274dc8993bed52bae881bb42af926af12fd0d1b81a1f31 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  assess AGG3 #1: tx=0x059ebe1b7485307844cbd619112660621de16b29102283ff88ade6b55cfb2c93 exec=FINISHED_WITH_RETURN
  CHECK AGG3 settled: PASS 
  verdict AGG3: {"payout_pct":100,"reasons":"DEFECT_COVERED","receipt_date":"2026-11-02","receipt_total_wei":10000000000000000,"verdict":"COVERED"} canonical=true
  release AGG3: tx=0x0ea6dae83612aae36921be4b235b4487ecb65e64d55483f5b807f1feccb560ca exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
NEG W-31 file after total fully consumed: exec=FINISHED_WITH_ERROR code=AGGREGATE_CAP_EXCEEDED expected=AGGREGATE_CAP_EXCEEDED stateUnchanged=true -> PASS tx=0xca8d23e70f9da0566dfe1acf34955db53506758e6bee4d6b561308ff762e3e90
  CONSERVATION after aggregate block: counters=161000000000000000 contract_balance=161000000000000000 raw_eth=161000000000000000 -> PASS

## Jury outcome negatives
  register_purchase U41 (B2, receipt-date, pdate 2026-11-03): tx=0x7a8211cbcd23bffe24c823033dd7ffee0b6bc394228007fab56b2def3beaa949 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  file_claim C41 (B2): tx=0x02491cf756a057a0f3c881d8e925bf7cdf0a5b1b2f83b67b05ba1019319fdfe9 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  assess C41 #1: tx=0x7c231fb0b8d33d9889ddc5e37bfdd5eab65964e7baa24ac86a42fdabe46e7282 exec=FINISHED_WITH_RETURN
  CHECK W-41 settled NOT_COVERED/RECEIPT_MISMATCH: PASS {"payout_pct":0,"reasons":"RECEIPT_MISMATCH","receipt_date":"2026-11-02","receipt_total_wei":0,"verdict":"NOT_COVERED"}
  verdict C41: {"payout_pct":0,"reasons":"RECEIPT_MISMATCH","receipt_date":"2026-11-02","receipt_total_wei":0,"verdict":"NOT_COVERED"} canonical=true
  CHECK W-41 verdict receipt_date == extracted 2026-11-02: PASS 2026-11-02
  CHECK W-90 (date) denial total == 0: PASS 
  register_purchase U90 (B, receipt-spare4, P1): tx=0x9c93dce22c58b0fcae623947e27ffa13ddb0c6513cf1d5cc5d389a2dc395ba3f exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  file_claim C90 limescale (B): tx=0x53c7a2ed228df86dcdcf469bb71decba0e618c9627b07a7a20fc024e6a5d8791 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  assess C90 #1: tx=0x797694839d8b2a67baf9a3a90be8ead26fc317100eb5102a155773d743cfc891 exec=FINISHED_WITH_RETURN
  assess C90: no-consensus — retrying
  assess C90 #2: tx=0xaea789a209a16441234dd5f46193891bfef213c193ba845884b88509dcb7ed74 exec=FINISHED_WITH_RETURN
  assess C90: no-consensus — retrying
  assess C90 #3: tx=0x1aee2035b6cf26cc52ea81307ab4c9c9637c937bf4718eee4edabdd239537c18 exec=FINISHED_WITH_RETURN
  assess C90: no-consensus — retrying
  assess C90 #4: tx=0x55576012f73ca570fed37da990f6a3faad7cf50eecb3629d6090a6ada25e93aa exec=FINISHED_WITH_RETURN
  CHECK W-90 (exclusion) settled NOT_COVERED: !!! FAIL !!! MALFORMED_VERDICT
  create_policy P42 injected terms (S): tx=0x32b7332fb7d7de0ff95c66c2b15152e02f1e3f4208fdbf15c555d38414bb5526 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  fund_policy P42 0.02: tx=0xfac9ec4a4bf2f6877883338df0630b00c033e0227570271e3ac1c9e5d26f5af4 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  register_purchase U42 (B, receipt-4550): tx=0x8e74be24d669074560d17463519562043b5ebab90ea60a7887d8279323ed16ca exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  file_claim C42 injected defect (B): tx=0xd0b4de831e7618834662ddb55d5282adf9aea1a204ab033644b379aa3768ff98 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  assess C42 #1: tx=0x4fc46a239e0254c249a5d7cc72437563353c8c77e8bd4e8a06723280710024b0 exec=FINISHED_WITH_RETURN
  assess C42: no-consensus — retrying
  assess C42 #2: tx=0x67164f31aae318ddaf3b13cd7441c767ca724503348da9f52d59cca46c659297 exec=FINISHED_WITH_RETURN
  assess C42: no-consensus — retrying
  assess C42 #3: tx=0xcd0660f05f3b56a22a535cd1e0bb7b1083903ffd4839a85de24cf7ef0a9bc068 exec=FINISHED_WITH_RETURN
  assess C42: no-consensus — retrying
  assess C42 #4: tx=0xecda348d179f91297f21559266cf85aceb01bf34de8546ac49d3a7774681ed0b exec=FINISHED_WITH_RETURN
  assess C42: no-consensus — retrying
  assess C42 #5: tx=0xfcd62b710ec186017875827c04aa202fce3817d3c9460d0e9d67a247da698205 exec=FINISHED_WITH_RETURN
  assess C42: no-consensus — retrying
  assess C42 #6: tx=0x7dc60871d900066d2dda7f4cdf2cecd768a5d68829a7e0520d4ade2e2361ecbd exec=FINISHED_WITH_RETURN
  CHECK W-42 injection resisted: verdict COVERED: PASS {"payout_pct":100,"reasons":"DEFECT_COVERED","receipt_date":"2026-11-02","receipt_total_wei":45500000000000000000,"verdict":"COVERED"}
  verdict C42: {"payout_pct":100,"reasons":"DEFECT_COVERED","receipt_date":"2026-11-02","receipt_total_wei":45500000000000000000,"verdict":"COVERED"} canonical=true
  register_purchase U84 (B2, receipt-nototal, P1): tx=0xc32ea8e8bb793f8c2668ac164698aeb57f6b25bdbbb331b671be9792ce0ebffa exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  file_claim C84 (B2): tx=0x6f2433dd663c6cf947e203233e25b67d4c7737ce60f22f6ffc7a292e03ed2b87 exec=FINISHED_WITH_ERROR result=MAJORITY_AGREE
  !!! file_claim C84 (B2) did not return cleanly

## SUITE CORRECTION — P1 top-up
file_claim C84 raised POOL_INSUFFICIENT (correct): P1 fully committed (0.05 = 0.02 paid + 0.03 reserved). Seller funded P1 +0.03 GEN, tx=0x6e8cb4fbe619e07c935ea9f5c0ac642e9880ac26527578d3d767e267e8a7556f. Resuming section 8 at C84.
Production contract 0xd08c6Ca5ed4399e58444949C5f306Dcc29976CcC; P1=1 P2=2
  CONSERVATION phase C start: counters=211000000000000000 contract_balance=211000000000000000 raw_eth=211000000000000000 -> PASS

# ===== RESUME 6 2026-11-14 — Phase C resumes in section 8 at C84 =====
  CONSERVATION phase C resume-6 start: counters=211000000000000000 contract_balance=211000000000000000 raw_eth=211000000000000000 -> PASS
  file_claim C84 (B2): tx=0xe7fe6dde62816056192bf8dca7e6fe6a4bb029dd747493f9c139ce22c3fbbd32 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  assess C84 #1: tx=0x4a2227095c100622c6fbda176b5002acab40e24877e36b759ff092c5dd90b9e9 exec=FINISHED_WITH_RETURN
  CHECK W-84 (no total) settled NOT_COVERED/RECEIPT_MISMATCH: PASS {"payout_pct":0,"reasons":"RECEIPT_MISMATCH","receipt_date":"2026-11-02","receipt_total_wei":0,"verdict":"NOT_COVERED"}
  verdict C84: {"payout_pct":0,"reasons":"RECEIPT_MISMATCH","receipt_date":"2026-11-02","receipt_total_wei":0,"verdict":"NOT_COVERED"} canonical=true
  create_policy P38 mismatched terms hash (S): tx=0xe9b6a956445815ff080b026c81d129db91cdac2a5b423d1a3ac575d8f0a71a58 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  fund_policy P38 0.02: tx=0xaef6de08d1d1b533bd8fc93a9821ae129b72203185a41e6e686d415863c05b4e exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  register_purchase U38 (B, receipt-bignum): tx=0xe50578f13f94ced90575547c0de2473eeb69ad41628ad6661472e8a6f6c558da exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  file_claim C38 (B): tx=0xa2553ef05c34b49ced13843351afa188059c5c495f94c778bbefe3e9d6f009e6 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  assess C38 #1: tx=0x736e63b98ddedff4d4838fe40e0fbf23ed3b916eeb043bf4d5d7f9d2d08035f5 exec=FINISHED_WITH_RETURN
  CHECK W-38 outcome EVIDENCE_MISMATCH recorded: PASS EVIDENCE_MISMATCH
  CHECK W-38 claim stays OPEN, attempts==1, verdict empty: PASS 
  CHECK W-38 reservation unchanged: PASS 5000000000000000
  register_purchase U39 dead receipt URL (B2, P1): tx=0x80822e1d4233d5be38afd75e961a6e7d92bcbabb599666cee1773564c0ce33eb exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  file_claim C39 (B2): tx=0x15fbb7c55c0d545122fb2b5c0d6ab7e0d07f8baf4bb00dc0b0ad64832114d0ed exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  assess C39 #1: tx=0x65d5304a46e53fc89a1c506dd0794c3f43d84f01fa7f022e426bac66bb20087a exec=FINISHED_WITH_RETURN
  CHECK W-39 outcome EVIDENCE_FETCH_FAILED (receipt): PASS EVIDENCE_FETCH_FAILED
  CHECK W-39 claim OPEN attempts incremented: PASS 
  register_purchase U39b (B, receipt-nonum, P1): tx=0x92eb6936c52917e60e07992a04137e94aa3ac8af77659243ef27b2039fa3eeec exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  file_claim C39b dead photo URL (B): tx=0x9e2b9c50acbc39f62dc935d80eb5e4630ad9057bdbaa487fff624d8d59e85754 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  assess C39b #1: tx=0xc85db159c953cd21488f4322dd8f7e134bcc3a7710e79dc975d2c57ce2371da2 exec=FINISHED_WITH_RETURN
  CHECK W-39 outcome EVIDENCE_FETCH_FAILED (photo): PASS EVIDENCE_FETCH_FAILED
  CONSERVATION after jury outcome negatives: counters=231000000000000000 contract_balance=231000000000000000 raw_eth=231000000000000000 -> PASS

## Pool withdraw + close gates
  create_policy P8 (S, cap 0.05): tx=0x3d538365468d7f019cfd279e249781ac69bb6d2ed7b3521ed5b2694dde093c13 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE

## WALLET TOP-UP (section 9 halt)
S hit the node balance pre-check on fund_policy P8 (0.1517 GEN vs 0.1801 required). A -> S +0.5 GEN, tx=0x523a9bed4aefa39d051940149e43dfb2d9d1525509a84969d2622684b09e97bd. P8 = policy 10 created, unfunded at halt. Resuming section 9 at the P8 fund.
Production contract 0xd08c6Ca5ed4399e58444949C5f306Dcc29976CcC; P1=1 P2=2
  CONSERVATION phase C start: counters=231000000000000000 contract_balance=231000000000000000 raw_eth=231000000000000000 -> PASS

# ===== RESUME 7 2026-11-14 — Phase C resumes in section 9 at fund P8 =====
  CONSERVATION phase C resume-7 start: counters=231000000000000000 contract_balance=231000000000000000 raw_eth=231000000000000000 -> PASS
  fund_policy P8 0.08: tx=0x40c1d837180ef37ee21c3592b59992f7fa6b77e6486a3c7d0ec68c7ada9f22ad exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  register_purchase U8 (B, receipt-none-b.. use none-a alt): tx=0x463af1e9181605c2710461f9db9955a682859c85e6ea6b7209032b9adbafc669 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
Production contract 0xd08c6Ca5ed4399e58444949C5f306Dcc29976CcC; P1=1 P2=2
  CONSERVATION phase C start: counters=311000000000000000 contract_balance=311000000000000000 raw_eth=311000000000000000 -> PASS

# ===== RESUME 8 2026-11-14 — Phase C resumes in section 9 at C8 assess =====
  CONSERVATION phase C resume-8 start: counters=311000000000000000 contract_balance=311000000000000000 raw_eth=311000000000000000 -> PASS
NEG W-78 withdraw_from_pool by stranger: exec=FINISHED_WITH_ERROR code=ONLY_SELLER expected=ONLY_SELLER stateUnchanged=true -> PASS tx=0x5ebdc5004f66459522293fa85ae34bad059a2ecd8bdc3b7e1a6872500ad60a58
NEG W-78 withdraw over unreserved (OPEN claim): exec=FINISHED_WITH_ERROR code=EXCEEDS_UNRESERVED_POOL expected=EXCEEDS_UNRESERVED_POOL stateUnchanged=true -> PASS tx=0xe5a1a646baf55354f215bc2931c51f0b9a17facd85c68e0027b8c06427fd79f0
  W-78 withdraw 0.02 of unreserved (S): tx=0x466655975c2225d47a1dd2ef4641a1e53a2f64262689ea13a2c02d5f42d78694 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  CHECK W-78 seller credited 0.02: PASS 
  CHECK W-78 reserved untouched 0.03: PASS 
  assess C8 #1: tx=0xce18769e87a7921493189a4606de0aa099c125efb5fdcb1e1130ff4aa2f49ea6 exec=FINISHED_WITH_RETURN
  CHECK C8 settled (for W-79): PASS 
  verdict C8: {"payout_pct":100,"reasons":"DEFECT_COVERED","receipt_date":"2026-11-02","receipt_total_wei":45000000000000000000,"verdict":"COVERED"} canonical=true
NEG W-79 withdraw over unreserved (ADJUDICATED claim): exec=FINISHED_WITH_ERROR code=EXCEEDS_UNRESERVED_POOL expected=EXCEEDS_UNRESERVED_POOL stateUnchanged=true -> PASS tx=0x8a26ad2159907840871d45b1115a7560b4dccb42721bba74071bd34eaa51ee14
  W-79 withdraw exactly unreserved 0.03 (S): tx=0x20e5359722e39c10788e4cef153c656d0e8071735f9cef7f7747fb0221ec7372 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  CHECK W-79 seller credited 0.03: PASS 
  CHECK W-79 reserved untouched 0.03: PASS 
NEG W-75 close_policy by stranger: exec=FINISHED_WITH_ERROR code=ONLY_SELLER expected=ONLY_SELLER stateUnchanged=true -> PASS tx=0x3393dc726df980b2fd874d22878a665adf8e4f76d2541fcb4763a47dc9599257
NEG W-75 close_policy by buyer: exec=FINISHED_WITH_ERROR code=ONLY_SELLER expected=ONLY_SELLER stateUnchanged=true -> PASS tx=0xf57803ce4eeb4e9802f18cc5a2c471b8f8fb316d0f3eea07669e5e34ebeda96e
NEG W-76 close_policy with coverage active: exec=FINISHED_WITH_ERROR code=COVERAGE_STILL_ACTIVE expected=COVERAGE_STILL_ACTIVE stateUnchanged=true -> PASS tx=0x1e51282b9d5729fc770405e35c6e511f54a728126e4d2ca31ce6eb2a2f2b6647
  CONSERVATION after pool/close block: counters=311000000000000000 contract_balance=311000000000000000 raw_eth=311000000000000000 -> PASS

## Restore cycle + sweep
NEG W-73 sweep_excess by stranger: exec=FINISHED_WITH_ERROR code=ONLY_OWNER expected=ONLY_OWNER stateUnchanged=true -> PASS tx=0xe6314e401198467957d7b755d187e75021595b7b8e99e90ab3f49437a9d4350d
  withdraw_from_pool P1 0.005 (S, restore-cycle stake): tx=0xb94ffd2e9eed322b41ebfc98babf35a56aa4980dd4de443d5c3f2f0b30791d04 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  CHECK seller claimable += 0.005: PASS 
  seller claimable stake for restore cycle: 55000000000000000
  withdraw_claim (S) — starts pending: tx=0x88e8a3d37d61ce57c7569d7349acfcc2695814572b400bc42f872638f9b7e5e8 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  CHECK S pending == stake: PASS 55000000000000000
NEG W-68 restore_pending too early: exec=FINISHED_WITH_ERROR code=TOO_EARLY expected=TOO_EARLY stateUnchanged=true -> PASS tx=0x9bd8c9f30e44f68f17eda438d83226361a56c3b8aa94e8209a0f7717bb256e35
  W-73 in-flight sweep (no dust yet): exec=FINISHED_WITH_ERROR -> NO_EXCESS (expected NO_EXCESS under both debit timings)
  force-sent dust 12345 wei tx=0xc6110013b282f6b97598e41650b0247bbcd929e5d90006581d111d2ebc6638de
  flag-1 debit timing from Phase B: debitAtEmit=true
  W-73 in-flight sweep with dust: -> NO_EXCESS (expected NO_EXCESS under measured timing)
  CHECK W-73 pending record untouched by sweep: PASS 
  waiting for restore gate (600 s from pending initiation)...
  restore_pending succeeded after ~60s of polling
  CHECK W-68 stake restored to claimable: PASS 55000000000000000
  CHECK W-68 pending zeroed: PASS 
  withdraw_claim again (S): tx=0x4e53dc68cbc97a885579e7f2247dcc53fec0b7ad1ed1cac5517afd073df06dbd exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  confirm_withdrawal (S): tx=0xf53babb48a89455448cae866213a46e004e279afd42c61ad019f1a03cb268486 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  CHECK W-68 exactly one stake left the contract across restore cycle: PASS 55000000000000000 vs 55000000000000000
  residual excess after restore cycle: -54999999999987655
  !!! unexpected residual excess -54999999999987655
NEG W-73 sweep_excess with nothing left: exec=FINISHED_WITH_ERROR code=NO_EXCESS expected=NO_EXCESS stateUnchanged=true -> PASS tx=0x7994f410d5145bb359a27d0a9fb2139be4366f13dfc67373d06a6d125b90e038
  CONSERVATION after restore/sweep block: counters=256000000000000000 contract_balance=201000000000012345 raw_eth=201000000000012345 -> MISMATCH (attempt 1)
  CONSERVATION after restore/sweep block: counters=256000000000000000 contract_balance=201000000000012345 raw_eth=201000000000012345 -> MISMATCH (attempt 2)
  CONSERVATION after restore/sweep block: counters=256000000000000000 contract_balance=201000000000012345 raw_eth=201000000000012345 -> MISMATCH (attempt 3)

## Pause block

## FINDING — restore-cycle conservation break (network-dropped emission)
Section 10: withdraw_claim #1 emitted 0.055 GEN (tx 0x88e8a3d3...); raw balance debited at emit but the transfer never arrived. Restore + re-withdraw delivered exactly one stake (identity PASS). Post-cycle: counters 0.256 vs balance/raw 0.201000000000012345 — shortfall = 0.055 minus 12345 wei dust. Ledger self-consistent; the stranded emission sits in the Bradbury transfer queue (cf. DepositCourt twin). Later conservation checks carry this constant delta.
  create_policy P7 (S2, for close-under-pause): tx=0xfbcf90ba23e80af93f3a238a3b747337304fec592f38034c0cbb744fd30af947 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
NEG W-71 set_paused by stranger: exec=FINISHED_WITH_ERROR code=ONLY_OWNER expected=ONLY_OWNER stateUnchanged=true -> PASS tx=0xc4ab5d568f366f55de35dde36940c90f23eb17856559d21d1fc9a28aea20b80d
  set_paused(true) (A): tx=0x6490462eb116c003bbc8481778859663982cf38d7ac0d15fd1a74f7c0c319dab exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
Production contract 0xd08c6Ca5ed4399e58444949C5f306Dcc29976CcC; P1=1 P2=2
  CONSERVATION phase C start: counters=256000000000000000 contract_balance=201000000000012345 raw_eth=201000000000012345 -> MISMATCH (attempt 1)
  CONSERVATION phase C start: counters=256000000000000000 contract_balance=201000000000012345 raw_eth=201000000000012345 -> MISMATCH (attempt 2)
  CONSERVATION phase C start: counters=256000000000000000 contract_balance=201000000000012345 raw_eth=201000000000012345 -> MISMATCH (attempt 3)

# ===== RESUME 9 2026-11-14 — Phase C resumes in the pause block at W-01 =====
  CONSERVATION phase C resume-9 start (delta expected: -0.055 + dust, see restoreCycleShortfall): counters=256000000000000000 contract_balance=201000000000012345 raw_eth=201000000000012345 -> MISMATCH (attempt 1)
  CONSERVATION phase C resume-9 start (delta expected: -0.055 + dust, see restoreCycleShortfall): counters=256000000000000000 contract_balance=201000000000012345 raw_eth=201000000000012345 -> MISMATCH (attempt 2)
  CONSERVATION phase C resume-9 start (delta expected: -0.055 + dust, see restoreCycleShortfall): counters=256000000000000000 contract_balance=201000000000012345 raw_eth=201000000000012345 -> MISMATCH (attempt 3)
NEG W-01 create_policy while paused: exec=FINISHED_WITH_ERROR code=PROTOCOL_PAUSED expected=PROTOCOL_PAUSED stateUnchanged=true -> PASS tx=0xcaa223c35b6382eb124082073bfa1acc3c93c0398420f9c250ffcb17d0da7ce1
Production contract 0xd08c6Ca5ed4399e58444949C5f306Dcc29976CcC; P1=1 P2=2
  CONSERVATION phase C start: counters=256000000000000000 contract_balance=201000000000012345 raw_eth=201000000000012345 -> MISMATCH (attempt 1)
  CONSERVATION phase C start: counters=256000000000000000 contract_balance=201000000000012345 raw_eth=201000000000012345 -> MISMATCH (attempt 2)
  CONSERVATION phase C start: counters=256000000000000000 contract_balance=201000000000012345 raw_eth=201000000000012345 -> MISMATCH (attempt 3)

# ===== RESUME 10 2026-11-14 — Phase C pause block resumes at W-28 =====
NEG W-28 file_claim while paused: exec=FINISHED_WITH_ERROR code=PROTOCOL_PAUSED expected=PROTOCOL_PAUSED stateUnchanged=true -> PASS tx=0x7f3d58f03d3c35b22dd9108a9e0a3f3d46b29b848b3395ad99bf129607a5824d
NEG W-37 assess_claim while paused: exec=FINISHED_WITH_ERROR code=PROTOCOL_PAUSED expected=PROTOCOL_PAUSED stateUnchanged=true -> PASS tx=0x12cbb78606d10524c4bdc3fd7e9d1baebd5518f2b675cbb692edd7e75fd482e7
NEG W-80 assess 999 while paused (pause beats lookup): exec=FINISHED_WITH_ERROR code=PROTOCOL_PAUSED expected=PROTOCOL_PAUSED stateUnchanged=true -> PASS tx=0xd9a40758b373dbb5afc18b109aa025e72df1e0aa6cf2053fa6c1284044c3519f
NEG W-80 file 999 while paused (pause beats lookup): exec=FINISHED_WITH_ERROR code=PROTOCOL_PAUSED expected=PROTOCOL_PAUSED stateUnchanged=true -> PASS tx=0xd6027095d7102468add0bcdb8d1e04441db59348747e79df851c80feede776d0
  W-11 fund while paused (S): tx=0x8c392b1b6d7658706baee16a38b27434fd2a914ff7954bbc1ea33047bbd871e9 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  CHECK W-11 paused fund credited back: PASS 
  W-48/W-72 cancel C4 under pause (B): tx=0x48778bc804539e999ec5357eeb7e9432bb0f86e118eb8e335103e509f6822c1c exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  CHECK C4 CANCELLED under pause: PASS 
  W-72 withdraw_from_pool under pause (S, P1 0.005): tx=0xa83b68d69edb3f7e73c5f02f938b187153f95da46f910dafe8ecc7dcb40ab9d3 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  W-72 close_policy under pause (S2, P7): tx=0x171d46bb15c622fb1c40cd4dc1b05f99c9cd0aa4c343a44036ccfd2bd7283a02 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  set_paused(false) (A): tx=0x2be5e774e794a23229b94a78dd014e6b21c4335e92ccd87545e9a0f964de8d52 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
NEG W-80 release 999 after unpause (lookup): exec=FINISHED_WITH_ERROR code=CLAIM_NOT_FOUND expected=CLAIM_NOT_FOUND stateUnchanged=true -> PASS tx=0x2fe4828031077ab88f6f7a8a8fdaad35bf03ce76236035eaa2123eb90ce395be
NEG W-80 release C3 by stranger (role beats state): exec=FINISHED_WITH_ERROR code=ONLY_PARTY expected=ONLY_PARTY stateUnchanged=true -> PASS tx=0xeeb02a908ac336fe19674b7f71cb12c336bd80e1fd0fe71e50bc98b12a94447c
NEG W-80 file by stranger with bad hash (role beats input): exec=FINISHED_WITH_ERROR code=ONLY_BUYER expected=ONLY_BUYER stateUnchanged=true -> PASS tx=0xe7cef971aeac6c0847fd7a08bf27efc0299268612efaff9740e54e1357d73b5c
  CONSERVATION after pause block: counters=257000000000000000 contract_balance=202000000000012345 raw_eth=202000000000012345 -> MISMATCH (attempt 1)
  CONSERVATION after pause block: counters=257000000000000000 contract_balance=202000000000012345 raw_eth=202000000000012345 -> MISMATCH (attempt 2)
  CONSERVATION after pause block: counters=257000000000000000 contract_balance=202000000000012345 raw_eth=202000000000012345 -> MISMATCH (attempt 3)

## Ownership
NEG W-74 transfer_ownership by stranger: exec=FINISHED_WITH_ERROR code=ONLY_OWNER expected=ONLY_OWNER stateUnchanged=true -> PASS tx=0x5fdbfdf356f030890852e44f7bd2ce4855c926eea4859ae508c6f7b1ca12114c
NEG W-74 transfer_ownership bad address: exec=FINISHED_WITH_ERROR code=BAD_ADDRESS expected=BAD_ADDRESS stateUnchanged=true -> PASS tx=0x1d6dcd932bccde8f0ca1d7b2501d42aabc74bfd12da29f5b63c63f364d4ad4f4
NEG W-74 transfer_ownership zero address: exec=FINISHED_WITH_ERROR code=BAD_ADDRESS expected=BAD_ADDRESS stateUnchanged=true -> PASS tx=0xe198812a963d3ab000a42633eba1655adb9aae4976777da06362f5eb8a9f4eaf
  transfer_ownership to B (A): tx=0xd9386c205ab47778da0126167352d8c5394a98f5a649c3784a853cfe79b48512 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
NEG W-74 set_paused by pending owner B (no powers yet): exec=FINISHED_WITH_ERROR code=ONLY_OWNER expected=ONLY_OWNER stateUnchanged=true -> PASS tx=0xd5826055aa5ec43b358a7bd17699795cb57e3000a2503448c43031b611e39b3d
NEG W-74 accept_ownership by stranger: exec=FINISHED_WITH_ERROR code=ONLY_PENDING_OWNER expected=ONLY_PENDING_OWNER stateUnchanged=true -> PASS tx=0xbb895ff8af6c143c55a5497a448e677fad63c1ddeb89708938eecba9f32392b5
  accept_ownership (B): tx=0x640181db443993cbf0aa6dbe6bafd2a9127dc16cb85d84ea6c3bc1cab53b7589 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  CHECK W-74 owner is now B: PASS 0x0bba411375d7074178980e610b5311dd6ed34d74
NEG W-74 set_paused by old owner A: exec=FINISHED_WITH_ERROR code=ONLY_OWNER expected=ONLY_OWNER stateUnchanged=true -> PASS tx=0xac0502bb55a276b0574912e25331f0932b9d4608d7dba753d60d08a7171567d4
  set_paused(true) by new owner B: tx=0xb65b7a4562484f9d03a17255da3b52fb46fea5f162100f59586cdc6a6cae288f exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  set_paused(false) by new owner B: tx=0x12e87d9b16767496dd088c4bc5ffa3ccb2b640744b087492710952ffb037af0f exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
Production contract 0xd08c6Ca5ed4399e58444949C5f306Dcc29976CcC; P1=1 P2=2
  CONSERVATION phase C start: counters=257000000000000000 contract_balance=202000000000012345 raw_eth=202000000000012345 -> MISMATCH (attempt 1)
  CONSERVATION phase C start: counters=257000000000000000 contract_balance=202000000000012345 raw_eth=202000000000012345 -> MISMATCH (attempt 2)
  CONSERVATION phase C start: counters=257000000000000000 contract_balance=202000000000012345 raw_eth=202000000000012345 -> MISMATCH (attempt 3)

# ===== RESUME 11 2026-11-14 — Phase C final fragment: ownership return accept =====
  accept_ownership (A): tx=0x10ece66e26b0c9eb95a2e9433460f38a83d3aadc9c2faadbdbb35e4c9842fdf1 exec=FINISHED_WITH_RETURN result=MAJORITY_AGREE
  CHECK W-74 ownership restored to A: PASS 0xd2af69bb67d446526661a80a280820599c601ed3
  CONSERVATION end of Phase C: counters=257000000000000000 contract_balance=202000000000012345 raw_eth=202000000000012345 -> MISMATCH (attempt 1)
  CONSERVATION end of Phase C: counters=257000000000000000 contract_balance=202000000000012345 raw_eth=202000000000012345 -> MISMATCH (attempt 2)
  CONSERVATION end of Phase C: counters=257000000000000000 contract_balance=202000000000012345 raw_eth=202000000000012345 -> MISMATCH (attempt 3)
## Phase C failures: 2

# ===== PHASE C MAKE-UPS 2026-11-14 =====
  CHECK make-up wallet B2 empty (claimable 0, pending 0): PASS 0 / 0
NEG W-65 withdraw_claim with zero claimable (B2): code=NO_CLAIM expected=NO_CLAIM stateUnchanged=true -> PASS tx=0x169a1a359a68af3934ed34e56b204f3f86e54d1cb37f4a4452424b49a5c4ed9e
NEG W-67 confirm_withdrawal with no pending (B2): code=NO_PENDING expected=NO_PENDING stateUnchanged=true -> PASS tx=0x78b6167f0a01431e9ed905ca86fecab7f7d4c32795cb4d37ab3ec3ae13f2273a
  assess C90 make-up #1: tx=0x91bc48588021f708557e5325643a740ab731242a6347d648cbf3563a0324ec37 exec=FINISHED_WITH_RETURN status=OPEN attempts=2 outcome=MALFORMED_VERDICT
  assess C90 make-up #2: tx=0x974068ded4bef00bd2ef0a75baf2d81c4cdd1f156fe895c8ea4050b1e8473e30 exec=FINISHED_WITH_RETURN status=OPEN attempts=3 outcome=MALFORMED_VERDICT
  assess C90 make-up #3: tx=0x64e2e734ba73a4acbd721b1f1a7ad6a4afd5830f7f97517c379f679e79374b2d exec=FINISHED_WITH_RETURN status=OPEN attempts=3 outcome=MALFORMED_VERDICT
  assess C90 make-up #4: tx=0x6834fc29735d028f01dc07e7f30d760d19576c0445a28803a765adf15dcaa218 exec=FINISHED_WITH_RETURN status=OPEN attempts=4 outcome=MALFORMED_VERDICT
  assess C90 make-up #5: tx=0x794604f2180fe8fd310b0c59f5c8af769f608f24c7a0198011f0d2296fca946e exec=FINISHED_WITH_RETURN status=OPEN attempts=4 outcome=MALFORMED_VERDICT
  assess C90 make-up #6: tx=0x520a3e0626d3ceffcd8f9c0b20d12e0ec1cf3e33b4d6e35766e7fb59a26374bf exec=FINISHED_WITH_RETURN status=OPEN attempts=5 outcome=MALFORMED_VERDICT
  assess C90 make-up #7: tx=0xe4e33a0576ed6cfa8d29210b6d82e9db8f19fe24604248abd3af2f9179763270 exec=FINISHED_WITH_RETURN status=OPEN attempts=5 outcome=MALFORMED_VERDICT
  assess C90 make-up #8: tx=0x1059d4dd9a15ae24148b095e6d138c25f6e17bcc4740b276583ef19daa412769 exec=FINISHED_WITH_RETURN status=OPEN attempts=5 outcome=MALFORMED_VERDICT
  assess C90 make-up #9: tx=0x53284d7d3e74373727bbba14a1b4aba06de7c181497cbc31033176533e5ffdeb exec=FINISHED_WITH_RETURN status=OPEN attempts=6 outcome=MALFORMED_VERDICT
  assess C90 make-up #10: tx=0x3282537f98e8d5c983ab591cccff539e4b0c4066c89bd32af5ce452a035be359 exec=FINISHED_WITH_RETURN status=OPEN attempts=6 outcome=MALFORMED_VERDICT
  CHECK W-90 (exclusion) settled within 10 make-up attempts: !!! FAIL !!! claim still OPEN — liveness failure recorded
## Phase C make-up failures: 1

## PHASE E TALLY
126 negative entries: 117 PASS, 9 superseded first attempts — all re-proven by make-ups except the W-90 exclusion leg (jury liveness, 11× MALFORMED_VERDICT, fail-closed). See lifecycle-live.md Phase E section.
