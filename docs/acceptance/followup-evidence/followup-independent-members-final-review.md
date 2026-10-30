# 独立只读最终复审结论

## 判定

- 源码候选：**GO**
- 候选锁前置检查源码：**GO**
- 发布/上线：**NO-GO**
- P0：**0**
- P1：**0**

旧成员接口 2 项 P1、候选锁预检 2 项 P1 均已实质闭环，未发现新的源码级 P0/P1。

发布仍不可放行，因为六成员工作树尚未提交且不 clean，候选锁 clean 正例尚未执行；真实 dispatch、安装、DOCX、授权真机、法律有效性等也没有本轮证据。这些是发布门禁，不反向算作源码修复 P1。

Oracle 未读取、未测试、未评价。

## 源码核验

### Lead–Intake

旧 `receipt.valid` 契约冲突已关闭：

- Lead 的普通 `npm test` 保持单仓独立 6 项，不猜相邻仓库。
- 跨仓入口必须显式传绝对 `CONTRACT_INTAKE_SOURCE`，[intake-integration.contract.test.mjs:10](<<team-workspace>/workspace/sources/contract-review-lead/tests/intake-integration.contract.test.mjs:10>)。
- 集成检查实际读取 Intake 的 schema、fixture 和 decision 源，[intake-integration.contract.test.mjs:14](<<team-workspace>/workspace/sources/contract-review-lead/tests/intake-integration.contract.test.mjs:14>)。
- `decideReceiptAdmission` 只接受真实工具报告的布尔 `valid`，并要求 document/schema 两个完整 SHA-256 与调用者从实际字节计算的期望摘要一致，[intake-decision.mjs:12](<<team-workspace>/workspace/sources/contract-intake/skills/contract-intake-gate/lib/intake-decision.mjs:12>)。
- `unknown`、缺失或非法 verdict 均不能进入 O2，[intake-decision.mjs:22](<<team-workspace>/workspace/sources/contract-intake/skills/contract-intake-gate/lib/intake-decision.mjs:22>)。
- helper 明确声明不认证工具来源、不调用 runtime，fixture 不是 live dispatch 证据，[intake-decision.mjs:5](<<team-workspace>/workspace/sources/contract-intake/skills/contract-intake-gate/lib/intake-decision.mjs:5>)。
- Lead 技能要求完整回读实际回执/schema 字节、核对工具摘要；detail 和 validation sidecar 仅用于审计，不能自签授权，[review-orchestration/SKILL.md:41](<<team-workspace>/workspace/sources/contract-review-lead/skills/review-orchestration/SKILL.md:41>)、[review-orchestration/SKILL.md:51](<<team-workspace>/workspace/sources/contract-review-lead/skills/review-orchestration/SKILL.md:51>)。

负例真实覆盖了缺摘要、错摘要、未知/缺失 verdict、顶层自签 `valid`、工具失败与 `report.valid:false` 分离。旧缺陷日志为 10/12，修复后同组为 12/12。

### Reporter

旧 helper P1 已关闭：

- helper 位于 `tests/support`，没有运行时 `lib/reporter-contract.mjs`。
- O4 对 null/畸形项、空或重复 ID、非法三态、confirmed/refuted 缺实质证据、unlocatable 缺检索范围/原因、additional 与候选重合均失败关闭，[reporter-evidence-record.mjs:18](<<team-workspace>/workspace/sources/review-reporter/tests/support/reporter-evidence-record.mjs:18>)。
- 使用正确的 `childContext.memoryScope`，[reporter-evidence-record.mjs:36](<<team-workspace>/workspace/sources/review-reporter/tests/support/reporter-evidence-record.mjs:36>)。
- 文件检查仅验证绝对路径语法及是否出现在调用方提供的观察清单中；没有扩展名推断，也没有承诺文件存在性、类型或权限，[reporter-evidence-record.mjs:7](<<team-workspace>/workspace/sources/review-reporter/tests/support/reporter-evidence-record.mjs:7>)。
- 技能明确 `memoryScope:none` 不构成文件级强制隔离，真机仍需越界读取负测，[independent-verification/SKILL.md:20](<<team-workspace>/workspace/sources/review-reporter/skills/independent-verification/SKILL.md:20>)。

没有理由为接平台新增强制业务 schema。

### Canonical 路径

实跑通过：

- 6 个消费者
- 5 个 POSIX/Windows 场景
- 75 条产物路径
- 2 个旧根反例拒绝
- 4 个无效身份反例拒绝

该 checker 明确只是 source contract，不证明路径权限、文件存在或真实 Delegate 执行。测试名中的 “true parallel” 仍只检查规则/fixture，不构成实际并发 dispatch 证据。

## 候选锁预检两项 P1

两项均已闭环：

1. exact-six 集合检查拒绝缺成员、多成员及重复冒充，[candidate-lock-preconditions.mjs:2](<<platform-workspace>/workspace/candidate-lock-preconditions.mjs:2>)、[candidate-lock-preconditions.mjs:7](<<platform-workspace>/workspace/candidate-lock-preconditions.mjs:7>)。
2. 平台 HEAD 固定为 `1536138e8c71db71b906d436212812086268e3c9`，且要求 tracked-clean，[candidate-lock-preconditions.mjs:1](<<platform-workspace>/workspace/candidate-lock-preconditions.mjs:1>)。
3. 两项检查在处理成员前执行，并在 schema/hash 计算后、输出前再次执行，[prepare-followup-candidate-lock.mts:23](<<platform-workspace>/workspace/prepare-followup-candidate-lock.mts:23>)、[prepare-followup-candidate-lock.mts:66](<<platform-workspace>/workspace/prepare-followup-candidate-lock.mts:66>)。
4. 每个成员仍须 committed-clean；身份文件通过 `git show <HEAD>` 读取，再调用平台正式 `computeMemberContentHash` 和正式 schema validator，[prepare-followup-candidate-lock.mts:30](<<platform-workspace>/workspace/prepare-followup-candidate-lock.mts:30>)、[prepare-followup-candidate-lock.mts:52](<<platform-workspace>/workspace/prepare-followup-candidate-lock.mts:52>)。
5. 输出明确标记为候选源码预检，不是已发布、已安装或模型结果，[prepare-followup-candidate-lock.mts:68](<<platform-workspace>/workspace/prepare-followup-candidate-lock.mts:68>)。

负例日志为旧实现 2/8、修复后 8/8；我也独立实跑得到 8/8。没有运行 clean 成员正例，也没有生成候选锁。

## 本次独立实跑

- 六成员 `npm test`：**49/49**
  - Lead 6
  - Intake 23
  - Clause 2
  - Risk 2
  - Jurisdiction 2
  - Reporter 14
- Lead 显式 `test:intake`：**4/4**
- 候选锁前置测试：**8/8**
- canonical checker：6 消费者、5 场景、75 路径，全部通过

合计 Node 测试：**61/61**。未执行 `npm ci`、平台全量测试或大 lint。

## SHA 与冻结状态

六仓复审前后 HEAD 完全不变：

```text
clause-extractor       3daecf141194ca0b5d0b64c7464c8036799cba59
contract-intake        586f1b5d9ab04950934ac7b9d4231a2b8bf75551
contract-review-lead   f11a7cea1309465bac23ea3cda12e852cb2bad8c
jurisdiction-auditor   70eeeb7255cb3949e3fa6eb37499752d50c7738c
review-reporter        27ca925f3c556744d4e57766dc214ac977b8c447
risk-scanner           63fdfe8c7bc637a9611e925b1fc11c7049b68f2f
```

这些是 Draft 分支现有提交；本轮候选修复仍位于 dirty 工作树中。

关键修复前后 SHA-256：

```text
intake-decision.mjs
HEAD: a9860eea651629533649d8f7f185d2c21b1f3e8f11845ddf383511ed40f84e54
WORK: 231548fd4d529eb6b747cb2371c98ee0265863188dfc5472f598cb0516b3ff21

consistency.contract.test.mjs
HEAD: 6c1ac8c44648fda9ba6ac9095af015cff500c68e16501f97c7b536038d9f875d
WORK: 132a9ed99fb43ff818060c3b408c13b7709681e6cd51dc6a3868c39adbfb4d8d

Lead intake integration
HEAD: absent
WORK: 62d5a9e1ae09f036e56553f445920dc99b75856d2437ddd7f065bca96d7b5fc5

Reporter evidence helper
HEAD: absent
WORK: ad1ac5e3858aff38aa8f783cdfdfe03d840ec4218f6493531c3a1bc9503cdc57

prepare-followup-candidate-lock.mts
旧复审源: 909e3c790b713fbad4db6c9c1d0d0bc39a2431e2fbdf994dc8bb4338a9aab56c
当前源:   76f0dea45d01fae9492c360d17b35c4d6de6838a800f150b550315372c5bc781

candidate-lock-preconditions.mjs
当前源: df47030a3bb221e247f89dc1d174628ad4207de5a9723767d136d2f98191fb54
```

平台正式 `lock.ts` 的 HEAD 字节与工作树字节一致，SHA-256 均为：

```text
dd9927de849086c073bba93a0209ee356bb84b4371b935151e23b939cdb1b999
```

## 发布门禁

源码可 GO，但发布继续 NO-GO，直至至少完成：

- 六成员候选提交后全部 committed-clean；
- 在固定平台 HEAD、tracked-clean 条件下实际完成候选锁 clean 正例；
- 审核并发布正式锁，而不是把候选锁预检当成发布；
- 独立完成真实 dispatch/并发、文件隔离负测、安装/升级、DOCX、授权真机和法律验证。

本次未修改文件、未 commit/push、未联网、未调用其他 Agent，也未操作实例、端口、进程或凭据。