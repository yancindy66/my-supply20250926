# 后端 API 分组与服务边界草案

## 服务边界（按域划分）
- inbound-service（入库域）：入库申请、审核、详情
- outbound-service（出库域）：出库申请、审核、查询
- warehouse-receipt-service（仓单域）：仓单列表、验真、质检信息
- transfer-service（移库域）：申请、审核、记录
- financing-service（融资域）：申请、风险、信息、还款
- ownership-service（过户域）：申请、审核
- renewal-service（续期域）：申请、审核
- trading-service（交易域）：申请、列表
- fee-service（费用域）：参数、计费、报表
- member-service（会员域）：各类机构与存货人管理
- warehouse-service（仓库域）：仓库信息
- announcement-service（公告域）：公告列表
- auth-service（认证/用户域）：用户/角色/岗位/组织/在线用户
- log-service（日志域）：业务日志、登录日志
- sms-service（短信域）：模板、发送、记录

## 业务主线（入库→仓单→质押→监管→出库）
- 入库：预约 -> 到货 -> 质检 -> 上架 -> 入库单
- 仓单：生成 -> 生效/质押可用 -> 冻结/解冻 -> 过户/续期
- 质押：申请 -> 审批 -> 放款 -> 监管 -> 解押/处置
- 出库：申请 -> 审批 -> 出库 -> 结算

## 角色与数据域（对接权限矩阵）
- 存货人：主体域（organization）
- 仓储方：主体域（organization）
- 金融机构：主体域（organization，限本机构关联质押）
- 监管方：主体域（organization，IoT 监管视图）
- 平台运营：平台域（platform_summary，需代入主体看详情）

## 典型路由草案（示例）
- POST /api/inbound/apply
- GET  /api/inbound/list
- GET  /api/inbound/detail/:id
- POST /api/inbound/review/:id

- GET  /api/warehouse-receipt/list
- GET  /api/warehouse-receipt/detail/:id
- POST /api/warehouse-receipt/update-quality/:id
- POST /api/warehouse-receipt/outbound-apply

- GET  /api/outbound/list
- GET  /api/outbound/detail/:id
- POST /api/outbound/review/:id

- POST /api/transfer/apply
- GET  /api/transfer/list
- GET  /api/transfer/detail/:id
- POST /api/transfer/review/:id

- POST /api/financing/apply
- GET  /api/financing/list
- GET  /api/financing/risk
- GET  /api/financing/detail/:id
- POST /api/financing/review/:id
- POST /api/financing/repayment/:id

- POST /api/transfer-ownership/apply
- GET  /api/transfer-ownership/list
- GET  /api/transfer-ownership/detail/:id
- POST /api/transfer-ownership/review/:id

- POST /api/renewal/apply
- GET  /api/renewal/list
- GET  /api/renewal/detail/:id
- POST /api/renewal/review/:id

- POST /api/trading/apply
- GET  /api/trading/list

- GET  /api/fee/report
- GET  /api/fee/payable
- GET  /api/fee/refund
- GET  /api/fee/prepaid-list
- GET  /api/fee/penalty-list
- POST /api/fee/param-config

- GET  /api/announcement/list

- 会员与仓库等模块略（后续按表设计细化）

## 统一约定
- 错误返回：{ code, message, details? }
- 成功返回：{ code: 0, data }
- 列表：{ list: [], total }
- 时间：ISO8601 字符串，统一 UTC 存储，本地展示换时区
- 鉴权：建议 JWT（Header: Authorization: Bearer <token>）
- 追踪：返回头 X-Request-Id，便于日志关联
