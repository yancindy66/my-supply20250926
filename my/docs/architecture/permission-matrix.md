## 权限矩阵（按角色与数据域）

- 数据域（data_scope）：
  - self：仅本人数据
  - department：本部门
  - department_and_sub：本部门及下级
  - organization：本主体所有
  - warehouse：限定到授权仓库
  - platform_summary：平台汇总/脱敏

| 模块 | 功能/路径 | 存货人 | 仓储机构 | 金融机构 | 担保机构 | 质检机构 | 平台运营 |
|---|---|---|---|---|---|---|---|
| 入库预约 | 创建/查询 | organization | organization |  |  |  | platform_summary |
| 入库单 | 列表/详情 | organization | organization |  |  |  | platform_summary |
| 仓单 | 列表/详情 | organization | organization | 关联本机构质押 | 关联本机构担保 |  | platform_summary |
| 质押 | 创建/列表/详情 |  |  | organization |  |  | platform_summary |
| 冻结 | 冻结/解冻 |  | organization |  |  |  | platform_summary |
| 质检 | 报告录入/查看 |  | organization |  |  | organization | platform_summary |
