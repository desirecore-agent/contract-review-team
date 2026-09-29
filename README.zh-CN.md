---
last-reviewed: 2026-09-29
---

# 合同审查团队

[English](README.md)

由六名 DesireCore 智能体组成，分别承担输入治理、条款抽取、风险观察、法域分析、独立复核和交付。法律服务范围为中国大陆；域外合同即使可继续通用文档治理，也必须明确转介，不能冒充已完成域外法律审查。

**当前状态：**团队 0.1.36；文档于 2026-09-29 基于 aa67148 审计。本文不是生产就绪证明：共享规则冲突与端到端证据缺口见[测试说明](docs/testing.zh-CN.md)。

## 从这里开始

- [安装及首次审查](docs/quickstart.zh-CN.md)
- [设计、成员职责与好/不好判据](docs/design.zh-CN.md)
- [测试、证据边界与修订 DOCX 验收](docs/testing.zh-CN.md)
- [维护、发布及回退](docs/maintenance.zh-CN.md)
- [共享资源](shared/resources/README.zh-CN.md)、[测试语料](testdata/contracts/README.zh-CN.md)、[变更记录](CHANGELOG.zh-CN.md)

提交原始合同、附件、我方身份、法域和目标。统筹官应交付可追溯发现、待解决事项及真实产物路径。合同评分不等于团队质量评分。平台全部放行不代表用户已经作出法律或业务决定。

## 发布基线

[team.json](team.json) 包含一名统筹官与五名成员。[members.lock.json](members.lock.json) 固定精确来源提交和内容摘要，是安装核对依据。

| 成员 | 锁定版本 | 职责 |
|---|---|---|
| contract-review-lead | 1.0.21 | 登记范围、派发、对账与交付 |
| contract-intake | 1.0.6 | 输入完整性、事实冻结和门禁 |
| clause-extractor | 1.1.0 | 可追溯条款事实及显式未知项 |
| risk-scanner | 1.1.0 | 有证据的商业风险候选 |
| jurisdiction-auditor | 1.3.0 | 法域及法律适用观察 |
| review-reporter | 1.0.6 | 隔离独立复核，再评分和报告 |

O3 风险与法域工作在抽取后可并行；O4、O5 是同一报告官的两次独立调用，不是第七名成员。旧共享规则仍存在七步顺序约束冲突，不能据此宣称执行一致性已经验证。

## 资源与检查

CN 包标识为 cn-v3；法条索引声明 29 部、4,096 条、1,270,526 字节。这是仓库元数据，不是法律完整性、时效性或适用性认证。

语料共 12 份文件、11 个案例编号：C 系列九份合成文本（C06 为两份）、公开空白采购模板 R01、生成衍生样本 R02/R03。R02 含人工植入缺陷；衍生样本不能证明真实客户已签合同验收。

```sh
npm ci
npm run check:gates
node shared/resources/jurisdiction-packs/jurisdiction-cn/statutes/check-temporal.mjs
```

以上仅为静态一致性检查，不等于智能体或法律验收。私有工具包版本仍为 0.1.30；发布团队版本读取 team.json。本次文档修订不调整版本配置。

## 许可与责任

许可见 [LICENSE](LICENSE)。团队辅助审查，不能替代专业法律意见，不能仅凭打字姓名验证签章，也不能代为授权签署。使用前应保护合同隐私，核对适用法律、原文证据与最终修订。
