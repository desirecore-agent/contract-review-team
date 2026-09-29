## 复审结论

**NO-GO**

- P0：0
- P1：2
- P2：0

HEAD 始终为 `9fe002a96d366ce9f3825f7dd9a6b442d794275e`。未修改文件，未访问成员上游、运行实例或凭据，未委派 agent，未执行 commit/push/fetch/merge。

## Findings

### P1 — ceiling checker 没有按成员实际有效权限求交集

[check-member-tool-ceiling.mjs:98](<team-workspace>/shared/resources/check-member-tool-ceiling.mjs:98) 返回成员的 `allowed` 和 `denied`，但 [check-member-tool-ceiling.mjs:110](<team-workspace>/shared/resources/check-member-tool-ceiling.mjs:110) 遍历整个 `member.allowed`，没有先扣除成员自己的 `denied`。

因此成员声明：

```json
{
  "allowed": ["Read", "Shell"],
  "denied": ["Shell"]
}
```

其实际有效权限只有 `Read`；若 lead 仅允许 `Read`，当前 checker 仍错误报告 `Shell` 超出上限。

复现：

```sh
node -e 'const norm=x=>String(x).trim().toLowerCase(),leadAllowed=new Set(["read"].map(norm)),leadDenied=new Set(),member={allowed:["Read","Shell"],denied:["Shell"]},memberDenied=new Set(member.denied.map(norm)),effective=member.allowed.filter(x=>!memberDenied.has(norm(x))),failures=[];for(const tool of member.allowed){const key=norm(tool);if(leadDenied.has(key))failures.push(`denied:${tool}`);else if(!leadAllowed.has(key))failures.push(`not-allowed:${tool}`)};console.log(JSON.stringify({effective,failures}))'
```

实际输出：

```json
{"effective":["Read"],"failures":["not-allowed:Shell"]}
```

测试文件只覆盖匹配、错 HEAD、缺仓库、dirty blob、缺 lock 和 CLI 参数，[member-tool-ceiling.test.mjs:28](<team-workspace>/shared/resources/tests/member-tool-ceiling.test.mjs:28) 至第 34 行没有成员 `denied` 与 lead 权限求交集的用例。

建议协调者将比较对象改为成员有效允许集 `member.allowed − member.denied`，同时保留 lead 的 `allowed − denied` 约束，并增加正反例。

### P1 — evidence generator 不保证覆盖每个 normative source

[generate-evidence-index.mjs:26](<team-workspace>/testdata/contracts/generate-evidence-index.mjs:26) 遍历每个 normative case 并读取 `own` source，但只在遇到 literal 时才把 source 写入 `sources`，见第 29–37 行。

一个合法、具有 source、但暂时没有 literal evidence 的 normative case 会从索引完全消失。运行时 checker 只能验证索引已列出的 source，[check-evidence.mjs:40](<team-workspace>/testdata/contracts/check-evidence.mjs:40)，无法发现该遗漏。

最小复现：

```sh
node -e 'const cases={A:{source:{file:"A.md"},evidence:[]},B:{source:{file:"B.md"},evidence:[{kind:"literal",quote:"x"}]}};const sources={};for(const [caseId,item] of Object.entries(cases)){for(const ev of item.evidence??[]){if(ev.kind!=="literal")continue;const sourceCase=ev.source_case??caseId,file=cases[sourceCase]?.source?.file;sources[file]??="digest"}}console.log(JSON.stringify({normativeSources:Object.values(cases).map(x=>x.source.file),generatedSources:Object.keys(sources)}))'
```

输出：

```json
{"normativeSources":["A.md","B.md"],"generatedSources":["B.md"]}
```

[evidence-index.test.mjs:12](<team-workspace>/shared/resources/tests/evidence-index.test.mjs:12) 的 fixture 只有一个 normative case 且恰有一个 literal，因此没有覆盖“case source 存在但无 literal”的反例。

当前实际索引确实包含 14 个 source、96 个 literal；此 finding 针对生成器和测试没有机械保证“所有 normative source 均被覆盖”。

## 原 3 项关闭状态

1. **C09 原始字节 SHA：已关闭。**

   - C09a 实际 SHA：`98f546c3f6bf68ce8336cdef4d5e53d31f8cffd9bc0f3a6fd4f997283b7779f6`
   - C09b 实际 SHA：`20a9462e3d02ff466f0c09a0a370237244e3203f73300c65bd5c53dd9a687aaf`
   - 两值分别与 [ground-truth.yaml:957](<team-workspace>/testdata/contracts/ground-truth.yaml:957)、[ground-truth.yaml:1192](<team-workspace>/testdata/contracts/ground-truth.yaml:1192) 及 bindings 第 1437、1723 行一致。

2. **成员 ceiling：部分关闭，整体仍未关闭。**

   已关闭：同版本错 HEAD、完整 commit、repo root、提交内 `agent.json` 原始 blob、缺成员/缺 lock fail-closed。  
   未关闭：成员自身 denied 未参与实际有效权限交集，见 P1。

3. **上游事实/命令/evidence checker 保真：部分关闭，整体仍未关闭。**

   - 双语 README、maintenance、contracts README、CHANGELOG 保留 0.1.37 事实、两个检查命令、C09 对照语义和单次非盲历史限制。
   - 文档明确静态检查不等于真机或法律验收，例如 [README.md:53](<team-workspace>/README.md:53)、[README.zh-CN.md:53](<team-workspace>/README.zh-CN.md:53)。
   - 默认 evidence CLI 当前通过：`96 current normative literal evidence values match 14 source files`。
   - 但 generator 未机械覆盖所有 normative source，见 P1。

## 测试隔离说明

执行：

```sh
node --test shared/resources/tests/member-tool-ceiling.test.mjs \
  shared/resources/tests/evidence-index.test.mjs
```

宿主只读沙箱禁止 `mkdtemp`，16 个 fixture 用例均在建立临时目录时以 `EPERM` 中止；这不是产品断言失败，但也不能计作通过。仅两个不需 fixture 的用例完成。未运行真实成员 ceiling，成员兼容性继续为 **unverified**。

本次只做源码 review、固定 fixture/索引检查和纯内存反例；没有真机验证。

## 当前核心 SHA-256

```text
00d8aee7935f75d65ccba959fa6d31b4f74b1757326795b9fab368ebd71bb632  check-member-tool-ceiling.mjs
225cf7f29aa268e2b5d3943da9ab7de38f57a20f7ae1c588f275cb052901156e  member-tool-ceiling.test.mjs
3c53ce047adbdf3be3d51bbccf4c2764f49efd6dd3c7f9b3c7cfbb128673203e  check-evidence.mjs
557abd6463598d0e6adcd6082c39b5f66406e1ea3b0d57a69c67ff4bf7d4cf86  generate-evidence-index.mjs
b4dbbe6effca260f8bab99b3548865d69c0c309505038eaa729d46081b9900fb  evidence-index.json
393c4fadc3331d528d93bef0f400d8f51e64253667a2d1d168f75d4b3aaa70ef  evidence-index.test.mjs
c4474f683f2b4dbb46e41787b9f8ef73d617c5edae7422bd8342e24c65f73e6a  ground-truth.yaml
e34149b17bb55614ff1c4c427aa8ab3b5bb3be09c2812b7f4ca404b8b9777f18  oracle-source-bindings.json
```