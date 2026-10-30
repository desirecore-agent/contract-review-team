# Takeover evidence / 接手证据

This directory stores selected, non-secret source snapshots and receipts from the new 2026-09-29 takeover. It does not contain predecessor-local artifacts, credentials, customer contracts, or private runtime configuration.

此目录保存 2026-09-29 接手中新取得的非敏感源码快照及回执。原始回执与来源摘要保留；派生说明不替代原始事实。静态测试、安装探针、真实模型调用及自主合同交付分别判定。

An installation receipt can report a created team while individual members failed. Neither HTTP success nor a green UI is full installation acceptance. Platform v3 member identity hashes cover the fields defined by the canonical implementation, not every skill file; exact commits and a separate file manifest identify the full candidate.

安装创建成功不等于全员安装完成。`postInstallTodos` 保留待用户处理的授权事项，不意味着 Agent 已替用户确认。工具声明不等于运行时可用工具，更不等于真实文件已生成。

Do not add raw provider responses, tokens, personal contract data, or machine-specific authentication files here. Full runtime traces stay in the isolated evidence workspace unless individually reviewed for publication.
