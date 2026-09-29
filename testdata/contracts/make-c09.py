# -*- coding: utf-8 -*-
"""
从 C01 派生 C09a / C09b：附件清单三条判据的控制变量对照组。

C01 本身就是 R7 的对照组——正式附件清单（第 17.4 款）完整登记了附件一至三，
正文引用全部落在清单内，而三份附件正文都没有随材料送达。期望 `passed`：
附件正文没来 ≠ 附件缺失，只记范围事实 SCOPE-ATTACHMENT-BODY-ABSENT。

在它的基础上各改**一处**，让另外两条判据分别单独成立：

  C09a  R9  第 17.4 款引导句改为「完整清单以另行签署的《合同附件目录》为准」，
            而该目录没有随材料送达 → 完整 declared 集合无法冻结
            → 期望 `conditional` + FLG-ATTACHMENT-MANIFEST-INCOMPLETE + 恰好一个 PEND-001
  C09b  R1  第 14.1 款末尾追加一句引用「附件四」，第 17.4 款清单不动
            → 正文引用的附件在正式清单中没有条目
            → 期望 `blocked` + BLK-ATTACHMENT-MISSING，**不得**降级为 conditional

三份放在一起才有意义：同一份合同，只因附件条款的一句话不同，门禁结论必须分别是
passed / conditional / blocked。任何一份判错，都说明判据在这一处的分界没守住：

  · C01 被判 conditional —— 把 R7（正文未送达）错当成 R9，大批正常合同会被误降级
  · C09a 被判 blocked   —— 把 R9 当成缺陷阻断，条件通过的流水线被错误中断
  · C09b 被判 conditional —— 把 R1 的缺失附件降级放行，带病材料进入下游

合同编号各加后缀，避免被当作 C01 的复审；除此之外正文零差异。
"""
import hashlib
import sys

SRC = 'C01-saas-subscription.md'
BASE = open(SRC, encoding='utf-8').read()

NO_OLD = '合同编号：XHKJ-SAAS-2026-0117'

VARIANTS = {
    'C09a-saas-manifest-deferred.md': {
        'rule': 'R9',
        'subs': [
            (NO_OLD, NO_OLD + '-R9'),
            ('17.4 本协议附件清单如下：',
             '17.4 本协议附件包括但不限于下列各项；完整附件清单以双方另行签署的'
             '《合同附件目录》（编号 XHKJ-FJML-2026-0117）为准，'
             '该目录为本协议附件清单的唯一权威来源：'),
        ],
        # 这一份里「另附目录」必须恰好出现一次，且三条已列附件原样保留
        'must_contain_once': ['《合同附件目录》'],
    },
    'C09b-saas-attachment-unlisted.md': {
        'rule': 'R1',
        'subs': [
            (NO_OLD, NO_OLD + '-R1'),
            ('审计范围包括安全控制措施、数据处理记录与分包管理情况。',
             '审计范围包括安全控制措施、数据处理记录与分包管理情况。'
             '审计所需的安全合规证明材料清单以附件四《安全合规证明材料清单 V1.0》为准。'),
        ],
        'must_contain_once': ['附件四'],
    },
}

# 三份都必须原样保留的内容：C01 的条款存在证据 + 附件清单三行 + 签署与页码。
# 丢了任何一条，派生语料就不再是「只差一处」的对照组。
MUST_KEEP = [
    '不超过索赔事件发生前 12 个月内甲方实际支付的服务费用总额',
    '## 第十一条　违约责任与救济',
    '该期间为违约治愈宽限期',
    '甲方有权提前 60 日书面通知乙方无理由终止本协议（便利终止）',
    '## 第十三条　分包与变更控制',
    '## 第十四条　审计权',
    '提交上海国际经济贸易仲裁委员会',
    '## 第十五条　不可抗力',
    '乙方应继续为甲方保留数据导出通道 90 日',
    '　　附件一　《服务规格说明书 V1.0》',
    '　　附件二　《服务水平协议 SLA-v1.2》',
    '　　附件三　《数据处理附录 V1.0》',
    '授权代表签字：陈慕远',
    '授权代表签字：赵砚青',
    '第 9 页 / 共 9 页',
]

src_lines = BASE.split('\n')
results = []

for dst, spec in VARIANTS.items():
    body = BASE
    for old, new in spec['subs']:
        got = body.count(old)
        if got != 1:
            sys.exit(f'✗ {dst}: 替换源命中 {got} 次（应为 1）：{old[:40]!r}')
        body = body.replace(old, new)

    for k in MUST_KEEP:
        if k not in body:
            sys.exit(f'✗ {dst}: 应原样保留的内容丢了：{k!r}')
    for k in spec['must_contain_once']:
        if body.count(k) != 1:
            sys.exit(f'✗ {dst}: {k!r} 出现 {body.count(k)} 次（应为 1）')

    # R1 专项：附件四只能出现在正文引用处，绝不能进第 17.4 款清单——
    # 进了清单就不再是 R1，而是一份干净合同。
    if spec['rule'] == 'R1':
        manifest = body[body.index('17.4 本协议附件清单如下：'):body.index('（以下无正文）')]
        if '附件四' in manifest:
            sys.exit(f'✗ {dst}: 附件四进了正式清单，R1 不成立')

    # R9 专项：已列的三条附件与正文引用全部对得上，确保 R1 不会先于 R9 命中
    if spec['rule'] == 'R9':
        for ref in ['附件一《服务规格说明书 V1.0》', '附件二《服务水平协议 SLA-v1.2》']:
            if ref not in body:
                sys.exit(f'✗ {dst}: 正文引用 {ref} 丢失，R1/R9 分界失去控制')

    # 差异只能是预定的那两行，行数也必须不变
    dst_lines = body.split('\n')
    if len(dst_lines) != len(src_lines):
        sys.exit(f'✗ {dst}: 行数 {len(dst_lines)} ≠ C01 的 {len(src_lines)}')
    diff = [(i + 1, a, b) for i, (a, b) in enumerate(zip(src_lines, dst_lines)) if a != b]
    expected_changed = {old for old, _ in spec['subs']}
    for ln, a, _ in diff:
        if not any(old in a for old in expected_changed):
            sys.exit(f'✗ {dst}: 第 {ln} 行出现预期外的改动：{a[:50]!r}')
    if len(diff) != len(spec['subs']):
        sys.exit(f'✗ {dst}: 差异 {len(diff)} 行，应恰好 {len(spec["subs"])} 行')

    open(dst, 'w', encoding='utf-8').write(body)
    results.append((dst, spec['rule'], diff, hashlib.sha256(body.encode()).hexdigest()))

for dst, rule, diff, digest in results:
    print(f'✓ {dst}（{rule}）与 C01 仅差 {len(diff)} 行：')
    for ln, a, b in diff:
        print(f'    行{ln}: {a.strip()[:34]}')
        print(f'       → {b.strip()[:60]}')
    print(f'  sha256 {digest}')
