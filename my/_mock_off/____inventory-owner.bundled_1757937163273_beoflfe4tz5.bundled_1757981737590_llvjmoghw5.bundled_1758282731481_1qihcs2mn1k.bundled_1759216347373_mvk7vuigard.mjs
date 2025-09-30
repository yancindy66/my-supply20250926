// mock/___inventory-owner.bundled_1757937163273_beoflfe4tz5.bundled_1757981737590_llvjmoghw5.bundled_1758282731481_1qihcs2mn1k.mjs
import fs from "fs";
import path from "path";
var dataDir = path.resolve(process.cwd(), "mock", "data");
var dataFile = path.resolve(dataDir, "inventory-owners.json");
function ensureDataDir() {
  try {
    if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  } catch {
  }
}
function loadFromFile() {
  try {
    if (fs.existsSync(dataFile)) {
      const raw = fs.readFileSync(dataFile, "utf8");
      const json = JSON.parse(raw);
      if (Array.isArray(json)) return json;
    }
  } catch {
  }
  return null;
}
function saveToFile(data) {
  try {
    ensureDataDir();
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2), "utf8");
  } catch {
  }
}
var owners = [
  {
    id: 1,
    company: "\u9B54\u529B\u79D1\u6280",
    code: "C001",
    creditCode: "91310000MA1KXXXXX",
    regAddress: "\u4E0A\u6D77\u5E02\u6D66\u4E1C\u65B0\u533A",
    legalRepName: "\u738B\u5F3A",
    legalRepId: "3101**********1234",
    establishDate: "2015-06-01",
    registeredCapital: "5000\u4E07\u4EBA\u6C11\u5E01",
    businessScope: "\u8BA1\u7B97\u673A\u8F6F\u786C\u4EF6\u3001\u4FE1\u606F\u7CFB\u7EDF\u96C6\u6210",
    bankName: "\u4E2D\u56FD\u5DE5\u5546\u94F6\u884C\u4E0A\u6D77\u5206\u884C",
    bankAccount: "6222*********001",
    companyEmail: "info@magic.com",
    companyPhone: "021-88888888",
    annualRevenueRange: "5000-10000\u4E07",
    mainBusiness: "\u8F6F\u4EF6\u5F00\u53D1\u4E0E\u8FD0\u7EF4\u670D\u52A1",
    partners: "\u987A\u4E30,\u4EAC\u4E1C\u7269\u6D41",
    adminName: "\u5218\u4F1F",
    adminDept: "\u4FE1\u606F\u90E8",
    adminTitle: "\u8FD0\u7EF4\u7ECF\u7406",
    adminPhone: "13900000002",
    contact: "\u5F20\u4E09",
    phone: "13800000000",
    address: "\u4E0A\u6D77\u5E02\u6D66\u4E1C\u65B0\u533A",
    license: "\u8425\u4E1A\u6267\u7167A",
    legalIdFront: "\u6CD5\u4EBA\u8BC1\u524DA",
    legalIdBack: "\u6CD5\u4EBA\u8BC1\u540EA",
    bankPermit: "\u5F00\u6237\u8BB8\u53EF\u4EE5A",
    authLetter: "\u6388\u6743\u4E66A",
    seal: "\u516C\u7AE0A"
  },
  {
    id: 2,
    company: "\u98DE\u5929\u7269\u6D41",
    code: "C002",
    creditCode: "91310000MA2KYYYYY",
    regAddress: "\u5317\u4EAC\u5E02\u671D\u9633\u533A",
    legalRepName: "\u674E\u654F",
    legalRepId: "1101**********5678",
    establishDate: "2018-03-15",
    registeredCapital: "2000\u4E07\u4EBA\u6C11\u5E01",
    businessScope: "\u8FD0\u8F93\u4E0E\u4ED3\u50A8\u670D\u52A1",
    bankName: "\u4E2D\u56FD\u519C\u4E1A\u94F6\u884C\u5317\u4EAC\u5206\u884C",
    bankAccount: "6228*********002",
    companyEmail: "contact@fly.com",
    companyPhone: "010-66666666",
    annualRevenueRange: "1000-3000\u4E07",
    mainBusiness: "\u7269\u6D41\u8FD0\u8F93",
    partners: "\u5FB7\u90A6,\u4EAC\u4E1C\u4ED3",
    adminName: "\u8D75\u4E91",
    adminDept: "\u8FD0\u8425\u90E8",
    adminTitle: "\u4E3B\u7BA1",
    adminPhone: "13700000001",
    contact: "\u674E\u56DB",
    phone: "13900000001",
    address: "\u5317\u4EAC\u5E02\u671D\u9633\u533A",
    license: "\u8425\u4E1A\u6267\u7167B",
    legalIdFront: "\u6CD5\u4EBA\u8BC1\u524DB",
    legalIdBack: "\u6CD5\u4EBA\u8BC1\u540EB",
    bankPermit: "\u5F00\u6237\u8BB8\u53EFB",
    authLetter: "\u6388\u6743\u4E66B",
    seal: "\u516C\u7AE0B"
  }
];
var fileData = loadFromFile();
if (fileData) owners = fileData;
function persist() {
  saveToFile(owners);
}
var inventory_owner_default = [
  // 列表
  {
    url: "/api/inventory-owner/list",
    method: "get",
    response: ({ query }) => {
      const keyword = (query?.keyword || "").toString().trim().toLowerCase();
      const page = parseInt(query?.page || "1", 10) || 1;
      const pageSize = parseInt(query?.pageSize || "10", 10) || 10;
      const sortBy = (query?.sortBy || "").toString();
      const sortOrder = (query?.sortOrder || "asc").toString().toLowerCase() === "desc" ? "desc" : "asc";
      const filtered = keyword ? owners.filter((o) => [o.company, o.code, o.creditCode, o.contact, o.phone, o.companyPhone, o.address, o.regAddress].some((v) => String(v || "").toLowerCase().includes(keyword))) : owners;
      const sortableFields = /* @__PURE__ */ new Set(["id", "company", "code", "creditCode", "contact", "phone", "companyPhone", "address", "regAddress", "license"]);
      const sorted = sortBy && sortableFields.has(sortBy) ? [...filtered].sort((a, b) => {
        const av = a[sortBy];
        const bv = b[sortBy];
        if (typeof av === "number" && typeof bv === "number") {
          return sortOrder === "asc" ? av - bv : bv - av;
        }
        const as = String(av ?? "").toLowerCase();
        const bs = String(bv ?? "").toLowerCase();
        if (as === bs) return 0;
        return sortOrder === "asc" ? as > bs ? 1 : -1 : as < bs ? 1 : -1;
      }) : filtered;
      const total = sorted.length;
      const start = (page - 1) * pageSize;
      const list = sorted.slice(start, start + pageSize);
      return { code: 0, data: { list, total, page, pageSize } };
    }
  },
  // 文件下载（license/seal 占位）
  {
    url: "/api/inventory-owner/file",
    method: "get",
    rawResponse: async (req, res) => {
      const { URL } = await import("url");
      const u = new URL(req.url, "http://localhost");
      const id = u.searchParams.get("id");
      const type = u.searchParams.get("type");
      const filename = u.searchParams.get("filename") || `${type || "file"}-${id || ""}.png`;
      const owner = owners.find((o) => String(o.id) === String(id));
      if (!owner) {
        res.statusCode = 404;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ code: 1, msg: "\u672A\u627E\u5230" }));
        return;
      }
      const label = `${owner.company} / ${type || ""}`;
      const sub = String(owner[type] || filename);
      const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns='http://www.w3.org/2000/svg' width='420' height='260'>
  <defs>
    <linearGradient id='g' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0%' stop-color='#f1f5f9'/>
      <stop offset='100%' stop-color='#e2e8f0'/>
    </linearGradient>
  </defs>
  <rect x='0' y='0' width='100%' height='100%' fill='url(#g)'/>
  <rect x='10' y='10' width='400' height='240' rx='12' ry='12' fill='#ffffff' stroke='#94a3b8'/>
  <text x='30' y='90' font-size='18' fill='#0f172a'>${label}</text>
  <text x='30' y='130' font-size='14' fill='#334155'>${sub}</text>
  <text x='30' y='170' font-size='12' fill='#64748b'>Mock Preview</text>
</svg>`;
      const asciiFallback = (String(filename).match(/[\x00-\x7F]+/g) || ["preview.svg"]).join("") || "preview.svg";
      res.statusCode = 200;
      res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
      res.setHeader("Content-Disposition", `inline; filename="${asciiFallback}"`);
      res.end(svg);
    }
  },
  // 导出CSV（服务端生成）
  {
    url: "/api/inventory-owner/export",
    method: "get",
    rawResponse: async (req, res) => {
      try {
        const { URL } = await import("url");
        const u = new URL(req.url, "http://localhost");
        const keyword = (u.searchParams.get("keyword") || "").toString().trim().toLowerCase();
        const sortBy = (u.searchParams.get("sortBy") || "").toString();
        const sortOrder = (u.searchParams.get("sortOrder") || "asc").toString().toLowerCase() === "desc" ? "desc" : "asc";
        const filtered = keyword ? owners.filter((o) => [o.company, o.code, o.creditCode, o.regAddress, o.legalRepName, o.legalRepId, o.registeredCapital, o.businessScope, o.bankName, o.bankAccount, o.companyEmail, o.companyPhone, o.annualRevenueRange, o.mainBusiness, o.partners, o.adminName, o.adminDept, o.adminTitle, o.adminPhone, o.contact, o.phone, o.address].some((v) => String(v || "").toLowerCase().includes(keyword))) : owners;
        const sortableFields = /* @__PURE__ */ new Set(["id", "company", "code", "creditCode", "regAddress", "legalRepName", "legalRepId", "registeredCapital", "businessScope", "bankName", "bankAccount", "companyEmail", "companyPhone", "annualRevenueRange", "mainBusiness", "partners", "adminName", "adminDept", "adminTitle", "adminPhone", "contact", "phone", "address"]);
        const sorted = sortBy && sortableFields.has(sortBy) ? [...filtered].sort((a, b) => {
          const av = a[sortBy];
          const bv = b[sortBy];
          if (typeof av === "number" && typeof bv === "number") {
            return sortOrder === "asc" ? av - bv : bv - av;
          }
          const as = String(av ?? "").toLowerCase();
          const bs = String(bv ?? "").toLowerCase();
          if (as === bs) return 0;
          return sortOrder === "asc" ? as > bs ? 1 : -1 : as < bs ? 1 : -1;
        }) : filtered;
        const header = [
          "\u4F01\u4E1A\u540D\u79F0",
          "\u5B58\u8D27\u4EBA\u7F16\u7801",
          "\u7EDF\u4E00\u793E\u4F1A\u4FE1\u7528\u4EE3\u7801",
          "\u4F01\u4E1A\u6CE8\u518C\u5730\u5740",
          "\u6CD5\u5B9A\u4EE3\u8868\u4EBA\u59D3\u540D",
          "\u6CD5\u5B9A\u4EE3\u8868\u4EBA\u8EAB\u4EFD\u8BC1\u53F7",
          "\u6210\u7ACB\u65E5\u671F",
          "\u6CE8\u518C\u8D44\u672C",
          "\u7ECF\u8425\u8303\u56F4",
          "\u5BF9\u516C\u8D26\u6237\u5F00\u6237\u884C",
          "\u5BF9\u516C\u8D26\u6237\u53F7",
          "\u4F01\u4E1A\u5E38\u7528\u90AE\u7BB1",
          "\u4F01\u4E1A\u8054\u7CFB\u7535\u8BDD",
          "\u5E74\u8425\u4E1A\u989D\u8303\u56F4",
          "\u4E3B\u8425\u4E1A\u52A1\u8303\u56F4",
          "\u5E38\u7528\u5408\u4F5C\u65B9",
          "\u7BA1\u7406\u5458\u59D3\u540D",
          "\u90E8\u95E8",
          "\u804C\u4F4D",
          "\u7BA1\u7406\u5458\u624B\u673A\u53F7",
          "\u8054\u7CFB\u4EBA",
          "\u7535\u8BDD",
          "\u5730\u5740"
        ];
        const lines = [header.join(",")].concat(
          sorted.map((r) => [
            r.company,
            r.code,
            r.creditCode,
            r.regAddress,
            r.legalRepName,
            r.legalRepId,
            r.establishDate,
            r.registeredCapital,
            r.businessScope,
            r.bankName,
            r.bankAccount,
            r.companyEmail,
            r.companyPhone,
            r.annualRevenueRange,
            r.mainBusiness,
            r.partners,
            r.adminName,
            r.adminDept,
            r.adminTitle,
            r.adminPhone,
            r.contact,
            r.phone,
            r.address
          ].map((v) => String(v ?? "").replace(/"/g, '""')).map((s) => /[",\n]/.test(s) ? '"' + s + '"' : s).join(","))
        );
        const csv = "\uFEFF" + lines.join("\n");
        const asciiName = `inventory-owners-${Date.now()}.csv`;
        res.statusCode = 200;
        res.setHeader("Content-Type", "text/csv; charset=utf-8");
        res.setHeader("Content-Disposition", `attachment; filename="${asciiName}"`);
        res.end(csv);
      } catch (e) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ code: 1, msg: "\u5BFC\u51FA\u5931\u8D25" }));
      }
    }
  },
  // 详情
  {
    url: "/api/inventory-owner/detail",
    method: "get",
    response: ({ query }) => {
      const item = owners.find((d) => d.id == query.id);
      return { code: item ? 0 : 1, data: item || null };
    }
  },
  // 创建
  {
    url: "/api/inventory-owner/create",
    method: "post",
    response: ({ body }) => {
      const id = Math.max(0, ...owners.map((o) => o.id)) + 1;
      const company = String(body?.company || "").trim();
      const genNext = () => {
        const nums = owners.map((o) => String(o.code || "")).map((c) => c.startsWith("INV-") ? parseInt(c.slice(4), 10) : NaN).filter((n) => Number.isFinite(n));
        const next = (nums.length ? Math.max(...nums) : 0) + 1;
        return "INV-" + String(next).padStart(5, "0");
      };
      const code = String(body?.code || "").trim() || genNext();
      if (!code || !company) {
        return { code: 1, msg: "\u516C\u53F8\u540D\u79F0\u4E0E\u5B58\u8D27\u4EBA\u7F16\u7801\u5FC5\u586B" };
      }
      const existed = owners.find((o) => o.company === company && o.code === code);
      if (existed) {
        return { code: 0, data: existed, msg: "\u8BE5\u516C\u53F8+\u7F16\u7801\u5DF2\u5B58\u5728\uFF0C\u8FD4\u56DE\u73B0\u6709\u8BB0\u5F55" };
      }
      const item = { id, ...body, code };
      owners.push(item);
      persist();
      return { code: 0, data: item, msg: "\u521B\u5EFA\u6210\u529F" };
    }
  },
  // 更新
  {
    url: "/api/inventory-owner/update",
    method: "post",
    response: ({ body }) => {
      const idx = owners.findIndex((o) => o.id == body.id);
      if (idx === -1) return { code: 1, msg: "\u672A\u627E\u5230" };
      const code = String(body?.code ?? owners[idx].code).trim();
      const company = String(body?.company ?? owners[idx].company).trim();
      const dup = owners.find((o) => o.company === company && o.code === code && o.id !== owners[idx].id);
      if (dup) {
        return { code: 1, msg: "\u516C\u53F8\u540D\u79F0+\u7F16\u7801\u91CD\u590D" };
      }
      owners[idx] = { ...owners[idx], ...body, code, company };
      persist();
      return { code: 0, data: owners[idx], msg: "\u66F4\u65B0\u6210\u529F" };
    }
  },
  // 删除
  {
    url: "/api/inventory-owner/delete",
    method: "post",
    response: ({ body }) => {
      owners = owners.filter((o) => o.id != body.id);
      persist();
      return { code: 0, msg: "\u5220\u9664\u6210\u529F" };
    }
  }
];
export {
  inventory_owner_default as default
};
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibW9jay9tb2NrL21vY2svbW9jay9pbnZlbnRvcnktb3duZXIuanMiXSwKICAic291cmNlc0NvbnRlbnQiOiBbImNvbnN0IF9faW5qZWN0ZWRfZmlsZW5hbWVfXyA9IFwiRTpcXFxcbXktc3VwcGx5XFxcXG15XFxcXG1vY2tcXFxcaW52ZW50b3J5LW93bmVyLmpzXCI7Y29uc3QgX19pbmplY3RlZF9kaXJuYW1lX18gPSBcIkU6XFxcXG15LXN1cHBseVxcXFxteVxcXFxtb2NrXCI7Y29uc3QgX19pbmplY3RlZF9pbXBvcnRfbWV0YV91cmxfXyA9IFwiZmlsZTovLy9FOi9teS1zdXBwbHkvbXkvbW9jay9pbnZlbnRvcnktb3duZXIuanNcIjtpbXBvcnQgZnMgZnJvbSAnZnMnO1xyXG5pbXBvcnQgcGF0aCBmcm9tICdwYXRoJztcclxuXHJcbmNvbnN0IGRhdGFEaXIgPSBwYXRoLnJlc29sdmUocHJvY2Vzcy5jd2QoKSwgJ21vY2snLCAnZGF0YScpO1xyXG5jb25zdCBkYXRhRmlsZSA9IHBhdGgucmVzb2x2ZShkYXRhRGlyLCAnaW52ZW50b3J5LW93bmVycy5qc29uJyk7XHJcblxyXG5mdW5jdGlvbiBlbnN1cmVEYXRhRGlyKCkge1xyXG4gIHRyeSB7IGlmICghZnMuZXhpc3RzU3luYyhkYXRhRGlyKSkgZnMubWtkaXJTeW5jKGRhdGFEaXIsIHsgcmVjdXJzaXZlOiB0cnVlIH0pOyB9IGNhdGNoIHt9XHJcbn1cclxuZnVuY3Rpb24gbG9hZEZyb21GaWxlKCkge1xyXG4gIHRyeSB7XHJcbiAgICBpZiAoZnMuZXhpc3RzU3luYyhkYXRhRmlsZSkpIHtcclxuICAgICAgY29uc3QgcmF3ID0gZnMucmVhZEZpbGVTeW5jKGRhdGFGaWxlLCAndXRmOCcpO1xyXG4gICAgICBjb25zdCBqc29uID0gSlNPTi5wYXJzZShyYXcpO1xyXG4gICAgICBpZiAoQXJyYXkuaXNBcnJheShqc29uKSkgcmV0dXJuIGpzb247XHJcbiAgICB9XHJcbiAgfSBjYXRjaCB7fVxyXG4gIHJldHVybiBudWxsO1xyXG59XHJcbmZ1bmN0aW9uIHNhdmVUb0ZpbGUoZGF0YSkge1xyXG4gIHRyeSB7XHJcbiAgICBlbnN1cmVEYXRhRGlyKCk7XHJcbiAgICBmcy53cml0ZUZpbGVTeW5jKGRhdGFGaWxlLCBKU09OLnN0cmluZ2lmeShkYXRhLCBudWxsLCAyKSwgJ3V0ZjgnKTtcclxuICB9IGNhdGNoIHt9XHJcbn1cclxuXHJcbmxldCBvd25lcnMgPSBbXHJcbiAgeyBpZDogMSwgY29tcGFueTogJ1x1OUI1NFx1NTI5Qlx1NzlEMVx1NjI4MCcsIGNvZGU6ICdDMDAxJyxcclxuICAgIGNyZWRpdENvZGU6ICc5MTMxMDAwME1BMUtYWFhYWCcsIHJlZ0FkZHJlc3M6ICdcdTRFMEFcdTZENzdcdTVFMDJcdTZENjZcdTRFMUNcdTY1QjBcdTUzM0EnLCBsZWdhbFJlcE5hbWU6ICdcdTczOEJcdTVGM0EnLCBsZWdhbFJlcElkOiAnMzEwMSoqKioqKioqKioxMjM0JywgZXN0YWJsaXNoRGF0ZTogJzIwMTUtMDYtMDEnLCByZWdpc3RlcmVkQ2FwaXRhbDogJzUwMDBcdTRFMDdcdTRFQkFcdTZDMTFcdTVFMDEnLCBidXNpbmVzc1Njb3BlOiAnXHU4QkExXHU3Qjk3XHU2NzNBXHU4RjZGXHU3ODZDXHU0RUY2XHUzMDAxXHU0RkUxXHU2MDZGXHU3Q0ZCXHU3RURGXHU5NkM2XHU2MjEwJyxcclxuICAgIGJhbmtOYW1lOiAnXHU0RTJEXHU1NkZEXHU1REU1XHU1NTQ2XHU5NEY2XHU4ODRDXHU0RTBBXHU2RDc3XHU1MjA2XHU4ODRDJywgYmFua0FjY291bnQ6ICc2MjIyKioqKioqKioqMDAxJywgY29tcGFueUVtYWlsOiAnaW5mb0BtYWdpYy5jb20nLCBjb21wYW55UGhvbmU6ICcwMjEtODg4ODg4ODgnLFxyXG4gICAgYW5udWFsUmV2ZW51ZVJhbmdlOiAnNTAwMC0xMDAwMFx1NEUwNycsIG1haW5CdXNpbmVzczogJ1x1OEY2Rlx1NEVGNlx1NUYwMFx1NTNEMVx1NEUwRVx1OEZEMFx1N0VGNFx1NjcwRFx1NTJBMScsIHBhcnRuZXJzOiAnXHU5ODdBXHU0RTMwLFx1NEVBQ1x1NEUxQ1x1NzI2OVx1NkQ0MScsXHJcbiAgICBhZG1pbk5hbWU6ICdcdTUyMThcdTRGMUYnLCBhZG1pbkRlcHQ6ICdcdTRGRTFcdTYwNkZcdTkwRTgnLCBhZG1pblRpdGxlOiAnXHU4RkQwXHU3RUY0XHU3RUNGXHU3NDA2JywgYWRtaW5QaG9uZTogJzEzOTAwMDAwMDAyJyxcclxuICAgIGNvbnRhY3Q6ICdcdTVGMjBcdTRFMDknLCBwaG9uZTogJzEzODAwMDAwMDAwJywgYWRkcmVzczogJ1x1NEUwQVx1NkQ3N1x1NUUwMlx1NkQ2Nlx1NEUxQ1x1NjVCMFx1NTMzQScsIGxpY2Vuc2U6ICdcdTg0MjVcdTRFMUFcdTYyNjdcdTcxNjdBJywgbGVnYWxJZEZyb250OiAnXHU2Q0Q1XHU0RUJBXHU4QkMxXHU1MjREQScsIGxlZ2FsSWRCYWNrOiAnXHU2Q0Q1XHU0RUJBXHU4QkMxXHU1NDBFQScsIGJhbmtQZXJtaXQ6ICdcdTVGMDBcdTYyMzdcdThCQjhcdTUzRUZcdTRFRTVBJywgYXV0aExldHRlcjogJ1x1NjM4OFx1Njc0M1x1NEU2NkEnLCBzZWFsOiAnXHU1MTZDXHU3QUUwQScgfSxcclxuICB7IGlkOiAyLCBjb21wYW55OiAnXHU5OERFXHU1OTI5XHU3MjY5XHU2RDQxJywgY29kZTogJ0MwMDInLFxyXG4gICAgY3JlZGl0Q29kZTogJzkxMzEwMDAwTUEyS1lZWVlZJywgcmVnQWRkcmVzczogJ1x1NTMxN1x1NEVBQ1x1NUUwMlx1NjcxRFx1OTYzM1x1NTMzQScsIGxlZ2FsUmVwTmFtZTogJ1x1Njc0RVx1NjU0RicsIGxlZ2FsUmVwSWQ6ICcxMTAxKioqKioqKioqKjU2NzgnLCBlc3RhYmxpc2hEYXRlOiAnMjAxOC0wMy0xNScsIHJlZ2lzdGVyZWRDYXBpdGFsOiAnMjAwMFx1NEUwN1x1NEVCQVx1NkMxMVx1NUUwMScsIGJ1c2luZXNzU2NvcGU6ICdcdThGRDBcdThGOTNcdTRFMEVcdTRFRDNcdTUwQThcdTY3MERcdTUyQTEnLFxyXG4gICAgYmFua05hbWU6ICdcdTRFMkRcdTU2RkRcdTUxOUNcdTRFMUFcdTk0RjZcdTg4NENcdTUzMTdcdTRFQUNcdTUyMDZcdTg4NEMnLCBiYW5rQWNjb3VudDogJzYyMjgqKioqKioqKiowMDInLCBjb21wYW55RW1haWw6ICdjb250YWN0QGZseS5jb20nLCBjb21wYW55UGhvbmU6ICcwMTAtNjY2NjY2NjYnLFxyXG4gICAgYW5udWFsUmV2ZW51ZVJhbmdlOiAnMTAwMC0zMDAwXHU0RTA3JywgbWFpbkJ1c2luZXNzOiAnXHU3MjY5XHU2RDQxXHU4RkQwXHU4RjkzJywgcGFydG5lcnM6ICdcdTVGQjdcdTkwQTYsXHU0RUFDXHU0RTFDXHU0RUQzJyxcclxuICAgIGFkbWluTmFtZTogJ1x1OEQ3NVx1NEU5MScsIGFkbWluRGVwdDogJ1x1OEZEMFx1ODQyNVx1OTBFOCcsIGFkbWluVGl0bGU6ICdcdTRFM0JcdTdCQTEnLCBhZG1pblBob25lOiAnMTM3MDAwMDAwMDEnLFxyXG4gICAgY29udGFjdDogJ1x1Njc0RVx1NTZEQicsIHBob25lOiAnMTM5MDAwMDAwMDEnLCBhZGRyZXNzOiAnXHU1MzE3XHU0RUFDXHU1RTAyXHU2NzFEXHU5NjMzXHU1MzNBJywgbGljZW5zZTogJ1x1ODQyNVx1NEUxQVx1NjI2N1x1NzE2N0InLCBsZWdhbElkRnJvbnQ6ICdcdTZDRDVcdTRFQkFcdThCQzFcdTUyNERCJywgbGVnYWxJZEJhY2s6ICdcdTZDRDVcdTRFQkFcdThCQzFcdTU0MEVCJywgYmFua1Blcm1pdDogJ1x1NUYwMFx1NjIzN1x1OEJCOFx1NTNFRkInLCBhdXRoTGV0dGVyOiAnXHU2Mzg4XHU2NzQzXHU0RTY2QicsIHNlYWw6ICdcdTUxNkNcdTdBRTBCJyB9XHJcbl07XHJcblxyXG5jb25zdCBmaWxlRGF0YSA9IGxvYWRGcm9tRmlsZSgpO1xyXG5pZiAoZmlsZURhdGEpIG93bmVycyA9IGZpbGVEYXRhO1xyXG5mdW5jdGlvbiBwZXJzaXN0KCkgeyBzYXZlVG9GaWxlKG93bmVycyk7IH1cclxuXHJcbmV4cG9ydCBkZWZhdWx0IFtcclxuICAvLyBcdTUyMTdcdTg4NjhcclxuICB7XHJcbiAgICB1cmw6ICcvYXBpL2ludmVudG9yeS1vd25lci9saXN0JyxcclxuICAgIG1ldGhvZDogJ2dldCcsXHJcbiAgICByZXNwb25zZTogKHsgcXVlcnkgfSkgPT4ge1xyXG4gICAgICBjb25zdCBrZXl3b3JkID0gKHF1ZXJ5Py5rZXl3b3JkIHx8ICcnKS50b1N0cmluZygpLnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICBjb25zdCBwYWdlID0gcGFyc2VJbnQocXVlcnk/LnBhZ2UgfHwgJzEnLCAxMCkgfHwgMTtcclxuICAgICAgY29uc3QgcGFnZVNpemUgPSBwYXJzZUludChxdWVyeT8ucGFnZVNpemUgfHwgJzEwJywgMTApIHx8IDEwO1xyXG4gICAgICBjb25zdCBzb3J0QnkgPSAocXVlcnk/LnNvcnRCeSB8fCAnJykudG9TdHJpbmcoKTtcclxuICAgICAgY29uc3Qgc29ydE9yZGVyID0gKHF1ZXJ5Py5zb3J0T3JkZXIgfHwgJ2FzYycpLnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKSA9PT0gJ2Rlc2MnID8gJ2Rlc2MnIDogJ2FzYyc7XHJcblxyXG4gICAgICBjb25zdCBmaWx0ZXJlZCA9IGtleXdvcmRcclxuICAgICAgICA/IG93bmVycy5maWx0ZXIobyA9PiBbby5jb21wYW55LCBvLmNvZGUsIG8uY3JlZGl0Q29kZSwgby5jb250YWN0LCBvLnBob25lLCBvLmNvbXBhbnlQaG9uZSwgby5hZGRyZXNzLCBvLnJlZ0FkZHJlc3NdXHJcbiAgICAgICAgICAgIC5zb21lKHYgPT4gU3RyaW5nKHYgfHwgJycpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoa2V5d29yZCkpKVxyXG4gICAgICAgIDogb3duZXJzO1xyXG5cclxuICAgICAgY29uc3Qgc29ydGFibGVGaWVsZHMgPSBuZXcgU2V0KFsnaWQnLCdjb21wYW55JywnY29kZScsJ2NyZWRpdENvZGUnLCdjb250YWN0JywncGhvbmUnLCdjb21wYW55UGhvbmUnLCdhZGRyZXNzJywncmVnQWRkcmVzcycsJ2xpY2Vuc2UnXSk7XHJcbiAgICAgIGNvbnN0IHNvcnRlZCA9IChzb3J0QnkgJiYgc29ydGFibGVGaWVsZHMuaGFzKHNvcnRCeSkpID8gWy4uLmZpbHRlcmVkXS5zb3J0KChhLCBiKSA9PiB7XHJcbiAgICAgICAgY29uc3QgYXYgPSBhW3NvcnRCeV07XHJcbiAgICAgICAgY29uc3QgYnYgPSBiW3NvcnRCeV07XHJcbiAgICAgICAgaWYgKHR5cGVvZiBhdiA9PT0gJ251bWJlcicgJiYgdHlwZW9mIGJ2ID09PSAnbnVtYmVyJykge1xyXG4gICAgICAgICAgcmV0dXJuIHNvcnRPcmRlciA9PT0gJ2FzYycgPyBhdiAtIGJ2IDogYnYgLSBhdjtcclxuICAgICAgICB9XHJcbiAgICAgICAgY29uc3QgYXMgPSBTdHJpbmcoYXYgPz8gJycpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgY29uc3QgYnMgPSBTdHJpbmcoYnYgPz8gJycpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgaWYgKGFzID09PSBicykgcmV0dXJuIDA7XHJcbiAgICAgICAgcmV0dXJuIHNvcnRPcmRlciA9PT0gJ2FzYycgPyAoYXMgPiBicyA/IDEgOiAtMSkgOiAoYXMgPCBicyA/IDEgOiAtMSk7XHJcbiAgICAgIH0pIDogZmlsdGVyZWQ7XHJcblxyXG4gICAgICBjb25zdCB0b3RhbCA9IHNvcnRlZC5sZW5ndGg7XHJcbiAgICAgIGNvbnN0IHN0YXJ0ID0gKHBhZ2UgLSAxKSAqIHBhZ2VTaXplO1xyXG4gICAgICBjb25zdCBsaXN0ID0gc29ydGVkLnNsaWNlKHN0YXJ0LCBzdGFydCArIHBhZ2VTaXplKTtcclxuXHJcbiAgICAgIHJldHVybiB7IGNvZGU6IDAsIGRhdGE6IHsgbGlzdCwgdG90YWwsIHBhZ2UsIHBhZ2VTaXplIH0gfTtcclxuICAgIH1cclxuICB9LFxyXG4gIC8vIFx1NjU4N1x1NEVGNlx1NEUwQlx1OEY3RFx1RkYwOGxpY2Vuc2Uvc2VhbCBcdTUzNjBcdTRGNERcdUZGMDlcclxuICB7XHJcbiAgICB1cmw6ICcvYXBpL2ludmVudG9yeS1vd25lci9maWxlJyxcclxuICAgIG1ldGhvZDogJ2dldCcsXHJcbiAgICByYXdSZXNwb25zZTogYXN5bmMgKHJlcSwgcmVzKSA9PiB7XHJcbiAgICAgIGNvbnN0IHsgVVJMIH0gPSBhd2FpdCBpbXBvcnQoJ3VybCcpO1xyXG4gICAgICBjb25zdCB1ID0gbmV3IFVSTChyZXEudXJsLCAnaHR0cDovL2xvY2FsaG9zdCcpO1xyXG4gICAgICBjb25zdCBpZCA9IHUuc2VhcmNoUGFyYW1zLmdldCgnaWQnKTtcclxuICAgICAgY29uc3QgdHlwZSA9IHUuc2VhcmNoUGFyYW1zLmdldCgndHlwZScpO1xyXG4gICAgICBjb25zdCBmaWxlbmFtZSA9IHUuc2VhcmNoUGFyYW1zLmdldCgnZmlsZW5hbWUnKSB8fCBgJHt0eXBlIHx8ICdmaWxlJ30tJHtpZCB8fCAnJ30ucG5nYDtcclxuICAgICAgY29uc3Qgb3duZXIgPSBvd25lcnMuZmluZChvID0+IFN0cmluZyhvLmlkKSA9PT0gU3RyaW5nKGlkKSk7XHJcbiAgICAgIGlmICghb3duZXIpIHtcclxuICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDQwNDtcclxuICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xyXG4gICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBjb2RlOiAxLCBtc2c6ICdcdTY3MkFcdTYyN0VcdTUyMzAnIH0pKTtcclxuICAgICAgICByZXR1cm47XHJcbiAgICAgIH1cclxuICAgICAgY29uc3QgbGFiZWwgPSBgJHtvd25lci5jb21wYW55fSAvICR7dHlwZSB8fCAnJ31gO1xyXG4gICAgICBjb25zdCBzdWIgPSBTdHJpbmcob3duZXJbdHlwZV0gfHwgZmlsZW5hbWUpO1xyXG4gICAgICAvLyBcdTc1MUZcdTYyMTBcdTUxODVcdTVENEMgU1ZHIFx1OTg4NFx1ODlDOFx1NTZGRVxyXG4gICAgICBjb25zdCBzdmcgPSBgPD94bWwgdmVyc2lvbj1cIjEuMFwiIGVuY29kaW5nPVwiVVRGLThcIj8+XHJcbjxzdmcgeG1sbnM9J2h0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnJyB3aWR0aD0nNDIwJyBoZWlnaHQ9JzI2MCc+XHJcbiAgPGRlZnM+XHJcbiAgICA8bGluZWFyR3JhZGllbnQgaWQ9J2cnIHgxPScwJyB5MT0nMCcgeDI9JzEnIHkyPScxJz5cclxuICAgICAgPHN0b3Agb2Zmc2V0PScwJScgc3RvcC1jb2xvcj0nI2YxZjVmOScvPlxyXG4gICAgICA8c3RvcCBvZmZzZXQ9JzEwMCUnIHN0b3AtY29sb3I9JyNlMmU4ZjAnLz5cclxuICAgIDwvbGluZWFyR3JhZGllbnQ+XHJcbiAgPC9kZWZzPlxyXG4gIDxyZWN0IHg9JzAnIHk9JzAnIHdpZHRoPScxMDAlJyBoZWlnaHQ9JzEwMCUnIGZpbGw9J3VybCgjZyknLz5cclxuICA8cmVjdCB4PScxMCcgeT0nMTAnIHdpZHRoPSc0MDAnIGhlaWdodD0nMjQwJyByeD0nMTInIHJ5PScxMicgZmlsbD0nI2ZmZmZmZicgc3Ryb2tlPScjOTRhM2I4Jy8+XHJcbiAgPHRleHQgeD0nMzAnIHk9JzkwJyBmb250LXNpemU9JzE4JyBmaWxsPScjMGYxNzJhJz4ke2xhYmVsfTwvdGV4dD5cclxuICA8dGV4dCB4PSczMCcgeT0nMTMwJyBmb250LXNpemU9JzE0JyBmaWxsPScjMzM0MTU1Jz4ke3N1Yn08L3RleHQ+XHJcbiAgPHRleHQgeD0nMzAnIHk9JzE3MCcgZm9udC1zaXplPScxMicgZmlsbD0nIzY0NzQ4Yic+TW9jayBQcmV2aWV3PC90ZXh0PlxyXG48L3N2Zz5gO1xyXG4gICAgICBjb25zdCBhc2NpaUZhbGxiYWNrID0gKFN0cmluZyhmaWxlbmFtZSkubWF0Y2goL1tcXHgwMC1cXHg3Rl0rL2cpIHx8IFsncHJldmlldy5zdmcnXSkuam9pbignJykgfHwgJ3ByZXZpZXcuc3ZnJztcclxuICAgICAgcmVzLnN0YXR1c0NvZGUgPSAyMDA7XHJcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdpbWFnZS9zdmcreG1sOyBjaGFyc2V0PXV0Zi04Jyk7XHJcbiAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtRGlzcG9zaXRpb24nLCBgaW5saW5lOyBmaWxlbmFtZT1cIiR7YXNjaWlGYWxsYmFja31cImApO1xyXG4gICAgICByZXMuZW5kKHN2Zyk7XHJcbiAgICB9XHJcbiAgfSxcclxuICAvLyBcdTVCRkNcdTUxRkFDU1ZcdUZGMDhcdTY3MERcdTUyQTFcdTdBRUZcdTc1MUZcdTYyMTBcdUZGMDlcclxuICB7XHJcbiAgICB1cmw6ICcvYXBpL2ludmVudG9yeS1vd25lci9leHBvcnQnLFxyXG4gICAgbWV0aG9kOiAnZ2V0JyxcclxuICAgIHJhd1Jlc3BvbnNlOiBhc3luYyAocmVxLCByZXMpID0+IHtcclxuICAgICAgdHJ5IHtcclxuICAgICAgICBjb25zdCB7IFVSTCB9ID0gYXdhaXQgaW1wb3J0KCd1cmwnKTtcclxuICAgICAgICBjb25zdCB1ID0gbmV3IFVSTChyZXEudXJsLCAnaHR0cDovL2xvY2FsaG9zdCcpO1xyXG4gICAgICAgIGNvbnN0IGtleXdvcmQgPSAodS5zZWFyY2hQYXJhbXMuZ2V0KCdrZXl3b3JkJykgfHwgJycpLnRvU3RyaW5nKCkudHJpbSgpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgY29uc3Qgc29ydEJ5ID0gKHUuc2VhcmNoUGFyYW1zLmdldCgnc29ydEJ5JykgfHwgJycpLnRvU3RyaW5nKCk7XHJcbiAgICAgICAgY29uc3Qgc29ydE9yZGVyID0gKHUuc2VhcmNoUGFyYW1zLmdldCgnc29ydE9yZGVyJykgfHwgJ2FzYycpLnRvU3RyaW5nKCkudG9Mb3dlckNhc2UoKSA9PT0gJ2Rlc2MnID8gJ2Rlc2MnIDogJ2FzYyc7XHJcblxyXG4gICAgICAgIGNvbnN0IGZpbHRlcmVkID0ga2V5d29yZFxyXG4gICAgICAgICAgPyBvd25lcnMuZmlsdGVyKG8gPT4gW28uY29tcGFueSwgby5jb2RlLCBvLmNyZWRpdENvZGUsIG8ucmVnQWRkcmVzcywgby5sZWdhbFJlcE5hbWUsIG8ubGVnYWxSZXBJZCwgby5yZWdpc3RlcmVkQ2FwaXRhbCwgby5idXNpbmVzc1Njb3BlLCBvLmJhbmtOYW1lLCBvLmJhbmtBY2NvdW50LCBvLmNvbXBhbnlFbWFpbCwgby5jb21wYW55UGhvbmUsIG8uYW5udWFsUmV2ZW51ZVJhbmdlLCBvLm1haW5CdXNpbmVzcywgby5wYXJ0bmVycywgby5hZG1pbk5hbWUsIG8uYWRtaW5EZXB0LCBvLmFkbWluVGl0bGUsIG8uYWRtaW5QaG9uZSwgby5jb250YWN0LCBvLnBob25lLCBvLmFkZHJlc3NdXHJcbiAgICAgICAgICAgICAgLnNvbWUodiA9PiBTdHJpbmcodiB8fCAnJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhrZXl3b3JkKSkpXHJcbiAgICAgICAgICA6IG93bmVycztcclxuXHJcbiAgICAgICAgY29uc3Qgc29ydGFibGVGaWVsZHMgPSBuZXcgU2V0KFsnaWQnLCdjb21wYW55JywnY29kZScsJ2NyZWRpdENvZGUnLCdyZWdBZGRyZXNzJywnbGVnYWxSZXBOYW1lJywnbGVnYWxSZXBJZCcsJ3JlZ2lzdGVyZWRDYXBpdGFsJywnYnVzaW5lc3NTY29wZScsJ2JhbmtOYW1lJywnYmFua0FjY291bnQnLCdjb21wYW55RW1haWwnLCdjb21wYW55UGhvbmUnLCdhbm51YWxSZXZlbnVlUmFuZ2UnLCdtYWluQnVzaW5lc3MnLCdwYXJ0bmVycycsJ2FkbWluTmFtZScsJ2FkbWluRGVwdCcsJ2FkbWluVGl0bGUnLCdhZG1pblBob25lJywnY29udGFjdCcsJ3Bob25lJywnYWRkcmVzcyddKTtcclxuICAgICAgICBjb25zdCBzb3J0ZWQgPSAoc29ydEJ5ICYmIHNvcnRhYmxlRmllbGRzLmhhcyhzb3J0QnkpKSA/IFsuLi5maWx0ZXJlZF0uc29ydCgoYSwgYikgPT4ge1xyXG4gICAgICAgICAgY29uc3QgYXYgPSBhW3NvcnRCeV07XHJcbiAgICAgICAgICBjb25zdCBidiA9IGJbc29ydEJ5XTtcclxuICAgICAgICAgIGlmICh0eXBlb2YgYXYgPT09ICdudW1iZXInICYmIHR5cGVvZiBidiA9PT0gJ251bWJlcicpIHtcclxuICAgICAgICAgICAgcmV0dXJuIHNvcnRPcmRlciA9PT0gJ2FzYycgPyBhdiAtIGJ2IDogYnYgLSBhdjtcclxuICAgICAgICAgIH1cclxuICAgICAgICAgIGNvbnN0IGFzID0gU3RyaW5nKGF2ID8/ICcnKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgY29uc3QgYnMgPSBTdHJpbmcoYnYgPz8gJycpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICBpZiAoYXMgPT09IGJzKSByZXR1cm4gMDtcclxuICAgICAgICAgIHJldHVybiBzb3J0T3JkZXIgPT09ICdhc2MnID8gKGFzID4gYnMgPyAxIDogLTEpIDogKGFzIDwgYnMgPyAxIDogLTEpO1xyXG4gICAgICAgIH0pIDogZmlsdGVyZWQ7XHJcblxyXG4gICAgICAgIGNvbnN0IGhlYWRlciA9IFtcclxuICAgICAgICAgICdcdTRGMDFcdTRFMUFcdTU0MERcdTc5RjAnLCdcdTVCNThcdThEMjdcdTRFQkFcdTdGMTZcdTc4MDEnLCdcdTdFREZcdTRFMDBcdTc5M0VcdTRGMUFcdTRGRTFcdTc1MjhcdTRFRTNcdTc4MDEnLCdcdTRGMDFcdTRFMUFcdTZDRThcdTUxOENcdTU3MzBcdTU3NDAnLCdcdTZDRDVcdTVCOUFcdTRFRTNcdTg4NjhcdTRFQkFcdTU5RDNcdTU0MEQnLCdcdTZDRDVcdTVCOUFcdTRFRTNcdTg4NjhcdTRFQkFcdThFQUJcdTRFRkRcdThCQzFcdTUzRjcnLCdcdTYyMTBcdTdBQ0JcdTY1RTVcdTY3MUYnLCdcdTZDRThcdTUxOENcdThENDRcdTY3MkMnLCdcdTdFQ0ZcdTg0MjVcdTgzMDNcdTU2RjQnLFxyXG4gICAgICAgICAgJ1x1NUJGOVx1NTE2Q1x1OEQyNlx1NjIzN1x1NUYwMFx1NjIzN1x1ODg0QycsJ1x1NUJGOVx1NTE2Q1x1OEQyNlx1NjIzN1x1NTNGNycsJ1x1NEYwMVx1NEUxQVx1NUUzOFx1NzUyOFx1OTBBRVx1N0JCMScsJ1x1NEYwMVx1NEUxQVx1ODA1NFx1N0NGQlx1NzUzNVx1OEJERCcsXHJcbiAgICAgICAgICAnXHU1RTc0XHU4NDI1XHU0RTFBXHU5ODlEXHU4MzAzXHU1NkY0JywnXHU0RTNCXHU4NDI1XHU0RTFBXHU1MkExXHU4MzAzXHU1NkY0JywnXHU1RTM4XHU3NTI4XHU1NDA4XHU0RjVDXHU2NUI5JyxcclxuICAgICAgICAgICdcdTdCQTFcdTc0MDZcdTU0NThcdTU5RDNcdTU0MEQnLCdcdTkwRThcdTk1RTgnLCdcdTgwNENcdTRGNEQnLCdcdTdCQTFcdTc0MDZcdTU0NThcdTYyNEJcdTY3M0FcdTUzRjcnLFxyXG4gICAgICAgICAgJ1x1ODA1NFx1N0NGQlx1NEVCQScsJ1x1NzUzNVx1OEJERCcsJ1x1NTczMFx1NTc0MCdcclxuICAgICAgICBdO1xyXG4gICAgICAgIGNvbnN0IGxpbmVzID0gW2hlYWRlci5qb2luKCcsJyldLmNvbmNhdChcclxuICAgICAgICAgIHNvcnRlZC5tYXAociA9PiBbXHJcbiAgICAgICAgICAgIHIuY29tcGFueSwgci5jb2RlLCByLmNyZWRpdENvZGUsIHIucmVnQWRkcmVzcywgci5sZWdhbFJlcE5hbWUsIHIubGVnYWxSZXBJZCwgci5lc3RhYmxpc2hEYXRlLCByLnJlZ2lzdGVyZWRDYXBpdGFsLCByLmJ1c2luZXNzU2NvcGUsXHJcbiAgICAgICAgICAgIHIuYmFua05hbWUsIHIuYmFua0FjY291bnQsIHIuY29tcGFueUVtYWlsLCByLmNvbXBhbnlQaG9uZSxcclxuICAgICAgICAgICAgci5hbm51YWxSZXZlbnVlUmFuZ2UsIHIubWFpbkJ1c2luZXNzLCByLnBhcnRuZXJzLFxyXG4gICAgICAgICAgICByLmFkbWluTmFtZSwgci5hZG1pbkRlcHQsIHIuYWRtaW5UaXRsZSwgci5hZG1pblBob25lLFxyXG4gICAgICAgICAgICByLmNvbnRhY3QsIHIucGhvbmUsIHIuYWRkcmVzc1xyXG4gICAgICAgICAgXVxyXG4gICAgICAgICAgICAubWFwKHYgPT4gU3RyaW5nKHYgPz8gJycpLnJlcGxhY2UoL1wiL2csICdcIlwiJykpXHJcbiAgICAgICAgICAgIC5tYXAocyA9PiAvW1wiLFxcbl0vLnRlc3QocykgPyAnXCInICsgcyArICdcIicgOiBzKVxyXG4gICAgICAgICAgICAuam9pbignLCcpKVxyXG4gICAgICAgICk7XHJcbiAgICAgICAgY29uc3QgY3N2ID0gJ1xcdWZlZmYnICsgbGluZXMuam9pbignXFxuJyk7XHJcbiAgICAgICAgY29uc3QgYXNjaWlOYW1lID0gYGludmVudG9yeS1vd25lcnMtJHtEYXRlLm5vdygpfS5jc3ZgO1xyXG4gICAgICAgIHJlcy5zdGF0dXNDb2RlID0gMjAwO1xyXG4gICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICd0ZXh0L2NzdjsgY2hhcnNldD11dGYtOCcpO1xyXG4gICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtRGlzcG9zaXRpb24nLCBgYXR0YWNobWVudDsgZmlsZW5hbWU9XCIke2FzY2lpTmFtZX1cImApO1xyXG4gICAgICAgIHJlcy5lbmQoY3N2KTtcclxuICAgICAgfSBjYXRjaCAoZSkge1xyXG4gICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNTAwO1xyXG4gICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XHJcbiAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGNvZGU6IDEsIG1zZzogJ1x1NUJGQ1x1NTFGQVx1NTkzMVx1OEQyNScgfSkpO1xyXG4gICAgICB9XHJcbiAgICB9XHJcbiAgfSxcclxuICAvLyBcdThCRTZcdTYwQzVcclxuICB7XHJcbiAgICB1cmw6ICcvYXBpL2ludmVudG9yeS1vd25lci9kZXRhaWwnLFxyXG4gICAgbWV0aG9kOiAnZ2V0JyxcclxuICAgIHJlc3BvbnNlOiAoeyBxdWVyeSB9KSA9PiB7XHJcbiAgICAgIGNvbnN0IGl0ZW0gPSBvd25lcnMuZmluZChkID0+IGQuaWQgPT0gcXVlcnkuaWQpO1xyXG4gICAgICByZXR1cm4geyBjb2RlOiBpdGVtID8gMCA6IDEsIGRhdGE6IGl0ZW0gfHwgbnVsbCB9O1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgLy8gXHU1MjFCXHU1RUZBXHJcbiAge1xyXG4gICAgdXJsOiAnL2FwaS9pbnZlbnRvcnktb3duZXIvY3JlYXRlJyxcclxuICAgIG1ldGhvZDogJ3Bvc3QnLFxyXG4gICAgcmVzcG9uc2U6ICh7IGJvZHkgfSkgPT4ge1xyXG4gICAgICBjb25zdCBpZCA9IE1hdGgubWF4KDAsIC4uLm93bmVycy5tYXAobyA9PiBvLmlkKSkgKyAxO1xyXG4gICAgICBjb25zdCBjb21wYW55ID0gU3RyaW5nKGJvZHk/LmNvbXBhbnkgfHwgJycpLnRyaW0oKTtcclxuICAgICAgLy8gXHU4MUVBXHU1MkE4XHU3NTFGXHU2MjEwXHU3RjE2XHU3ODAxXHVGRjFBSU5WLTAwMDAxIFx1OTAxMlx1NTg5RVxyXG4gICAgICBjb25zdCBnZW5OZXh0ID0gKCkgPT4ge1xyXG4gICAgICAgIGNvbnN0IG51bXMgPSBvd25lcnNcclxuICAgICAgICAgIC5tYXAobyA9PiBTdHJpbmcoby5jb2RlIHx8ICcnKSlcclxuICAgICAgICAgIC5tYXAoYyA9PiAoYy5zdGFydHNXaXRoKCdJTlYtJykgPyBwYXJzZUludChjLnNsaWNlKDQpLCAxMCkgOiBOYU4pKVxyXG4gICAgICAgICAgLmZpbHRlcihuID0+IE51bWJlci5pc0Zpbml0ZShuKSk7XHJcbiAgICAgICAgY29uc3QgbmV4dCA9IChudW1zLmxlbmd0aCA/IE1hdGgubWF4KC4uLm51bXMpIDogMCkgKyAxO1xyXG4gICAgICAgIHJldHVybiAnSU5WLScgKyBTdHJpbmcobmV4dCkucGFkU3RhcnQoNSwgJzAnKTtcclxuICAgICAgfTtcclxuICAgICAgY29uc3QgY29kZSA9IFN0cmluZyhib2R5Py5jb2RlIHx8ICcnKS50cmltKCkgfHwgZ2VuTmV4dCgpO1xyXG4gICAgICBpZiAoIWNvZGUgfHwgIWNvbXBhbnkpIHtcclxuICAgICAgICByZXR1cm4geyBjb2RlOiAxLCBtc2c6ICdcdTUxNkNcdTUzRjhcdTU0MERcdTc5RjBcdTRFMEVcdTVCNThcdThEMjdcdTRFQkFcdTdGMTZcdTc4MDFcdTVGQzVcdTU4NkInIH07XHJcbiAgICAgIH1cclxuICAgICAgLy8gXHU1OTBEXHU1NDA4XHU0RTNCXHU5NTJFXHVGRjFBY29tcGFueSArIGNvZGUgXHU1M0JCXHU5MUNEXHVGRjA4XHU4MkU1XHU1QjU4XHU1NzI4XHU1MjE5XHU3NkY0XHU2M0E1XHU4RkQ0XHU1NkRFXHU1REYyXHU2NzA5XHU4QkIwXHU1RjU1XHVGRjBDXHU2NUI5XHU0RkJGXHU2RjE0XHU3OTNBXHVGRjA5XHJcbiAgICAgIGNvbnN0IGV4aXN0ZWQgPSBvd25lcnMuZmluZChvID0+IG8uY29tcGFueSA9PT0gY29tcGFueSAmJiBvLmNvZGUgPT09IGNvZGUpO1xyXG4gICAgICBpZiAoZXhpc3RlZCkge1xyXG4gICAgICAgIHJldHVybiB7IGNvZGU6IDAsIGRhdGE6IGV4aXN0ZWQsIG1zZzogJ1x1OEJFNVx1NTE2Q1x1NTNGOCtcdTdGMTZcdTc4MDFcdTVERjJcdTVCNThcdTU3MjhcdUZGMENcdThGRDRcdTU2REVcdTczQjBcdTY3MDlcdThCQjBcdTVGNTUnIH07XHJcbiAgICAgIH1cclxuICAgICAgY29uc3QgaXRlbSA9IHsgaWQsIC4uLmJvZHksIGNvZGUgfTtcclxuICAgICAgb3duZXJzLnB1c2goaXRlbSk7XHJcbiAgICAgIHBlcnNpc3QoKTtcclxuICAgICAgcmV0dXJuIHsgY29kZTogMCwgZGF0YTogaXRlbSwgbXNnOiAnXHU1MjFCXHU1RUZBXHU2MjEwXHU1MjlGJyB9O1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgLy8gXHU2NkY0XHU2NUIwXHJcbiAge1xyXG4gICAgdXJsOiAnL2FwaS9pbnZlbnRvcnktb3duZXIvdXBkYXRlJyxcclxuICAgIG1ldGhvZDogJ3Bvc3QnLFxyXG4gICAgcmVzcG9uc2U6ICh7IGJvZHkgfSkgPT4ge1xyXG4gICAgICBjb25zdCBpZHggPSBvd25lcnMuZmluZEluZGV4KG8gPT4gby5pZCA9PSBib2R5LmlkKTtcclxuICAgICAgaWYgKGlkeCA9PT0gLTEpIHJldHVybiB7IGNvZGU6IDEsIG1zZzogJ1x1NjcyQVx1NjI3RVx1NTIzMCcgfTtcclxuICAgICAgLy8gXHU2NkY0XHU2NUIwXHU2NUY2XHU0RTVGXHU2ODIxXHU5QThDXHU1OTBEXHU1NDA4XHU0RTNCXHU5NTJFXHU1NTJGXHU0RTAwXHJcbiAgICAgIGNvbnN0IGNvZGUgPSBTdHJpbmcoYm9keT8uY29kZSA/PyBvd25lcnNbaWR4XS5jb2RlKS50cmltKCk7XHJcbiAgICAgIGNvbnN0IGNvbXBhbnkgPSBTdHJpbmcoYm9keT8uY29tcGFueSA/PyBvd25lcnNbaWR4XS5jb21wYW55KS50cmltKCk7XHJcbiAgICAgIGNvbnN0IGR1cCA9IG93bmVycy5maW5kKG8gPT4gby5jb21wYW55ID09PSBjb21wYW55ICYmIG8uY29kZSA9PT0gY29kZSAmJiBvLmlkICE9PSBvd25lcnNbaWR4XS5pZCk7XHJcbiAgICAgIGlmIChkdXApIHtcclxuICAgICAgICByZXR1cm4geyBjb2RlOiAxLCBtc2c6ICdcdTUxNkNcdTUzRjhcdTU0MERcdTc5RjArXHU3RjE2XHU3ODAxXHU5MUNEXHU1OTBEJyB9O1xyXG4gICAgICB9XHJcbiAgICAgIG93bmVyc1tpZHhdID0geyAuLi5vd25lcnNbaWR4XSwgLi4uYm9keSwgY29kZSwgY29tcGFueSB9O1xyXG4gICAgICBwZXJzaXN0KCk7XHJcbiAgICAgIHJldHVybiB7IGNvZGU6IDAsIGRhdGE6IG93bmVyc1tpZHhdLCBtc2c6ICdcdTY2RjRcdTY1QjBcdTYyMTBcdTUyOUYnIH07XHJcbiAgICB9XHJcbiAgfSxcclxuICAvLyBcdTUyMjBcdTk2NjRcclxuICB7XHJcbiAgICB1cmw6ICcvYXBpL2ludmVudG9yeS1vd25lci9kZWxldGUnLFxyXG4gICAgbWV0aG9kOiAncG9zdCcsXHJcbiAgICByZXNwb25zZTogKHsgYm9keSB9KSA9PiB7XHJcbiAgICAgIG93bmVycyA9IG93bmVycy5maWx0ZXIobyA9PiBvLmlkICE9IGJvZHkuaWQpO1xyXG4gICAgICBwZXJzaXN0KCk7XHJcbiAgICAgIHJldHVybiB7IGNvZGU6IDAsIG1zZzogJ1x1NTIyMFx1OTY2NFx1NjIxMFx1NTI5RicgfTtcclxuICAgIH1cclxuICB9XHJcbl07XHJcbiJdLAogICJtYXBwaW5ncyI6ICI7QUFBME4sT0FBTyxRQUFRO0FBQ3pPLE9BQU8sVUFBVTtBQUVqQixJQUFNLFVBQVUsS0FBSyxRQUFRLFFBQVEsSUFBSSxHQUFHLFFBQVEsTUFBTTtBQUMxRCxJQUFNLFdBQVcsS0FBSyxRQUFRLFNBQVMsdUJBQXVCO0FBRTlELFNBQVMsZ0JBQWdCO0FBQ3ZCLE1BQUk7QUFBRSxRQUFJLENBQUMsR0FBRyxXQUFXLE9BQU8sRUFBRyxJQUFHLFVBQVUsU0FBUyxFQUFFLFdBQVcsS0FBSyxDQUFDO0VBQUcsUUFBUTtFQUFDO0FBQzFGO0FBQ0EsU0FBUyxlQUFlO0FBQ3RCLE1BQUk7QUFDRixRQUFJLEdBQUcsV0FBVyxRQUFRLEdBQUc7QUFDM0IsWUFBTSxNQUFNLEdBQUcsYUFBYSxVQUFVLE1BQU07QUFDNUMsWUFBTSxPQUFPLEtBQUssTUFBTSxHQUFHO0FBQzNCLFVBQUksTUFBTSxRQUFRLElBQUksRUFBRyxRQUFPO0lBQ2xDO0VBQ0YsUUFBUTtFQUFDO0FBQ1QsU0FBTztBQUNUO0FBQ0EsU0FBUyxXQUFXLE1BQU07QUFDeEIsTUFBSTtBQUNGLGtCQUFjO0FBQ2QsT0FBRyxjQUFjLFVBQVUsS0FBSyxVQUFVLE1BQU0sTUFBTSxDQUFDLEdBQUcsTUFBTTtFQUNsRSxRQUFRO0VBQUM7QUFDWDtBQUVBLElBQUksU0FBUztFQUNYO0lBQUUsSUFBSTtJQUFHLFNBQVM7SUFBUSxNQUFNO0lBQzlCLFlBQVk7SUFBcUIsWUFBWTtJQUFXLGNBQWM7SUFBTSxZQUFZO0lBQXNCLGVBQWU7SUFBYyxtQkFBbUI7SUFBWSxlQUFlO0lBQ3pMLFVBQVU7SUFBYyxhQUFhO0lBQW9CLGNBQWM7SUFBa0IsY0FBYztJQUN2RyxvQkFBb0I7SUFBZSxjQUFjO0lBQWEsVUFBVTtJQUN4RSxXQUFXO0lBQU0sV0FBVztJQUFPLFlBQVk7SUFBUSxZQUFZO0lBQ25FLFNBQVM7SUFBTSxP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TyxFQUFFLE1BQU0sR0FBRyxLQUFLLDJFQUFlO01BQ3hDO0FBRUEsWUFBTSxVQUFVLE9BQU8sS0FBSyxDQUFBLE1BQUssRUFBRSxZQUFZLFdBQVcsRUFBRSxTQUFTLElBQUk7QUFDekUsVUFBSSxTQUFTO0FBQ1gsZUFBTyxFQUFFLE1BQU0sR0FBRyxNQUFNLFNBQVMsS0FBSyw4RkFBbUI7TUFDM0Q7QUFDQSxZQUFNLE9BQU8sRUFBRSxJQUFJLEdBQUcsTUFBTSxLQUFLO0FBQ2pDLGFBQU8sS0FBSyxJQUFJO0FBQ2hCLGNBQVE7QUFDUixhQUFPLEVBQUUsTUFBTSxHQUFHLE1BQU0sTUFBTSxLQUFLLDJCQUFPO0lBQzVDO0VBQ0Y7O0VBRUE7SUFDRSxLQUFLO0lBQ0wsUUFBUTtJQUNSLFVBQVUsQ0FBQyxFQUFFLEtBQUssTUFBTTtBQUN0QixZQUFNLE1BQU0sT0FBTyxVQUFVLENBQUEsTUFBSyxFQUFFLE1BQU0sS0FBSyxFQUFFO0FBQ2pELFVBQUksUUFBUSxHQUFJLFFBQU8sRUFBRSxNQUFNLEdBQUcsS0FBSyxxQkFBTTtBQUU3QyxZQUFNLE9BQU8sT0FBTyxNQUFNLFFBQVEsT0FBTyxHQUFHLEVBQUUsSUFBSSxFQUFFLEtBQUs7QUFDekQsWUFBTSxVQUFVLE9BQU8sTUFBTSxXQUFXLE9BQU8sR0FBRyxFQUFFLE9BQU8sRUFBRSxLQUFLO0FBQ2xFLFlBQU0sTUFBTSxPQUFPLEtBQUssQ0FBQSxNQUFLLEVBQUUsWUFBWSxXQUFXLEVBQUUsU0FBUyxRQUFRLEVBQUUsT0FBTyxPQUFPLEdBQUcsRUFBRSxFQUFFO0FBQ2hHLFVBQUksS0FBSztBQUNQLGVBQU8sRUFBRSxNQUFNLEdBQUcsS0FBSyxvREFBWTtNQUNyQztBQUNBLGFBQU8sR0FBRyxJQUFJLEVBQUUsR0FBRyxPQUFPLEdBQUcsR0FBRyxHQUFHLE1BQU0sTUFBTSxRQUFRO0FBQ3ZELGNBQVE7QUFDUixhQUFPLEVBQUUsTUFBTSxHQUFHLE1BQU0sT0FBTyxHQUFHLEdBQUcsS0FBSywyQkFBTztJQUNuRDtFQUNGOztFQUVBO0lBQ0UsS0FBSztJQUNMLFFBQVE7SUFDUixVQUFVLENBQUMsRUFBRSxLQUFLLE1BQU07QUFDdEIsZUFBUyxPQUFPLE9BQU8sQ0FBQSxNQUFLLEVBQUUsTUFBTSxLQUFLLEVBQUU7QUFDM0MsY0FBUTtBQUNSLGFBQU8sRUFBRSxNQUFNLEdBQUcsS0FBSywyQkFBTztJQUNoQztFQUNGO0FBQ0Y7IiwKICAibmFtZXMiOiBbXQp9Cg==
