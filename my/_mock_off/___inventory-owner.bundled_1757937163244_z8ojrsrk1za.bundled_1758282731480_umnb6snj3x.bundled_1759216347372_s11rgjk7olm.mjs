// mock/__inventory-owner.bundled_1757937163244_z8ojrsrk1za.bundled_1758282731480_umnb6snj3x.mjs
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibW9jay9tb2NrL21vY2svaW52ZW50b3J5LW93bmVyLmpzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX2luamVjdGVkX2ZpbGVuYW1lX18gPSBcIkU6XFxcXG15LXN1cHBseVxcXFxteVxcXFxtb2NrXFxcXGludmVudG9yeS1vd25lci5qc1wiO2NvbnN0IF9faW5qZWN0ZWRfZGlybmFtZV9fID0gXCJFOlxcXFxteS1zdXBwbHlcXFxcbXlcXFxcbW9ja1wiO2NvbnN0IF9faW5qZWN0ZWRfaW1wb3J0X21ldGFfdXJsX18gPSBcImZpbGU6Ly8vRTovbXktc3VwcGx5L215L21vY2svaW52ZW50b3J5LW93bmVyLmpzXCI7aW1wb3J0IGZzIGZyb20gJ2ZzJztcclxuaW1wb3J0IHBhdGggZnJvbSAncGF0aCc7XHJcblxyXG5jb25zdCBkYXRhRGlyID0gcGF0aC5yZXNvbHZlKHByb2Nlc3MuY3dkKCksICdtb2NrJywgJ2RhdGEnKTtcclxuY29uc3QgZGF0YUZpbGUgPSBwYXRoLnJlc29sdmUoZGF0YURpciwgJ2ludmVudG9yeS1vd25lcnMuanNvbicpO1xyXG5cclxuZnVuY3Rpb24gZW5zdXJlRGF0YURpcigpIHtcclxuICB0cnkgeyBpZiAoIWZzLmV4aXN0c1N5bmMoZGF0YURpcikpIGZzLm1rZGlyU3luYyhkYXRhRGlyLCB7IHJlY3Vyc2l2ZTogdHJ1ZSB9KTsgfSBjYXRjaCB7fVxyXG59XHJcbmZ1bmN0aW9uIGxvYWRGcm9tRmlsZSgpIHtcclxuICB0cnkge1xyXG4gICAgaWYgKGZzLmV4aXN0c1N5bmMoZGF0YUZpbGUpKSB7XHJcbiAgICAgIGNvbnN0IHJhdyA9IGZzLnJlYWRGaWxlU3luYyhkYXRhRmlsZSwgJ3V0ZjgnKTtcclxuICAgICAgY29uc3QganNvbiA9IEpTT04ucGFyc2UocmF3KTtcclxuICAgICAgaWYgKEFycmF5LmlzQXJyYXkoanNvbikpIHJldHVybiBqc29uO1xyXG4gICAgfVxyXG4gIH0gY2F0Y2gge31cclxuICByZXR1cm4gbnVsbDtcclxufVxyXG5mdW5jdGlvbiBzYXZlVG9GaWxlKGRhdGEpIHtcclxuICB0cnkge1xyXG4gICAgZW5zdXJlRGF0YURpcigpO1xyXG4gICAgZnMud3JpdGVGaWxlU3luYyhkYXRhRmlsZSwgSlNPTi5zdHJpbmdpZnkoZGF0YSwgbnVsbCwgMiksICd1dGY4Jyk7XHJcbiAgfSBjYXRjaCB7fVxyXG59XHJcblxyXG5sZXQgb3duZXJzID0gW1xyXG4gIHsgaWQ6IDEsIGNvbXBhbnk6ICdcdTlCNTRcdTUyOUJcdTc5RDFcdTYyODAnLCBjb2RlOiAnQzAwMScsXHJcbiAgICBjcmVkaXRDb2RlOiAnOTEzMTAwMDBNQTFLWFhYWFgnLCByZWdBZGRyZXNzOiAnXHU0RTBBXHU2RDc3XHU1RTAyXHU2RDY2XHU0RTFDXHU2NUIwXHU1MzNBJywgbGVnYWxSZXBOYW1lOiAnXHU3MzhCXHU1RjNBJywgbGVnYWxSZXBJZDogJzMxMDEqKioqKioqKioqMTIzNCcsIGVzdGFibGlzaERhdGU6ICcyMDE1LTA2LTAxJywgcmVnaXN0ZXJlZENhcGl0YWw6ICc1MDAwXHU0RTA3XHU0RUJBXHU2QzExXHU1RTAxJywgYnVzaW5lc3NTY29wZTogJ1x1OEJBMVx1N0I5N1x1NjczQVx1OEY2Rlx1Nzg2Q1x1NEVGNlx1MzAwMVx1NEZFMVx1NjA2Rlx1N0NGQlx1N0VERlx1OTZDNlx1NjIxMCcsXHJcbiAgICBiYW5rTmFtZTogJ1x1NEUyRFx1NTZGRFx1NURFNVx1NTU0Nlx1OTRGNlx1ODg0Q1x1NEUwQVx1NkQ3N1x1NTIwNlx1ODg0QycsIGJhbmtBY2NvdW50OiAnNjIyMioqKioqKioqKjAwMScsIGNvbXBhbnlFbWFpbDogJ2luZm9AbWFnaWMuY29tJywgY29tcGFueVBob25lOiAnMDIxLTg4ODg4ODg4JyxcclxuICAgIGFubnVhbFJldmVudWVSYW5nZTogJzUwMDAtMTAwMDBcdTRFMDcnLCBtYWluQnVzaW5lc3M6ICdcdThGNkZcdTRFRjZcdTVGMDBcdTUzRDFcdTRFMEVcdThGRDBcdTdFRjRcdTY3MERcdTUyQTEnLCBwYXJ0bmVyczogJ1x1OTg3QVx1NEUzMCxcdTRFQUNcdTRFMUNcdTcyNjlcdTZENDEnLFxyXG4gICAgYWRtaW5OYW1lOiAnXHU1MjE4XHU0RjFGJywgYWRtaW5EZXB0OiAnXHU0RkUxXHU2MDZGXHU5MEU4JywgYWRtaW5UaXRsZTogJ1x1OEZEMFx1N0VGNFx1N0VDRlx1NzQwNicsIGFkbWluUGhvbmU6ICcxMzkwMDAwMDAwMicsXHJcbiAgICBjb250YWN0OiAnXHU1RjIwXHU0RTA5JywgcGhvbmU6ICcxMzgwMDAwMDAwMCcsIGFkZHJlc3M6ICdcdTRFMEFcdTZENzdcdTVFMDJcdTZENjZcdTRFMUNcdTY1QjBcdTUzM0EnLCBsaWNlbnNlOiAnXHU4NDI1XHU0RTFBXHU2MjY3XHU3MTY3QScsIGxlZ2FsSWRGcm9udDogJ1x1NkNENVx1NEVCQVx1OEJDMVx1NTI0REEnLCBsZWdhbElkQmFjazogJ1x1NkNENVx1NEVCQVx1OEJDMVx1NTQwRUEnLCBiYW5rUGVybWl0OiAnXHU1RjAwXHU2MjM3XHU4QkI4XHU1M0VGXHU0RUU1QScsIGF1dGhMZXR0ZXI6ICdcdTYzODhcdTY3NDNcdTRFNjZBJywgc2VhbDogJ1x1NTE2Q1x1N0FFMEEnIH0sXHJcbiAgeyBpZDogMiwgY29tcGFueTogJ1x1OThERVx1NTkyOVx1NzI2OVx1NkQ0MScsIGNvZGU6ICdDMDAyJyxcclxuICAgIGNyZWRpdENvZGU6ICc5MTMxMDAwME1BMktZWVlZWScsIHJlZ0FkZHJlc3M6ICdcdTUzMTdcdTRFQUNcdTVFMDJcdTY3MURcdTk2MzNcdTUzM0EnLCBsZWdhbFJlcE5hbWU6ICdcdTY3NEVcdTY1NEYnLCBsZWdhbFJlcElkOiAnMTEwMSoqKioqKioqKio1Njc4JywgZXN0YWJsaXNoRGF0ZTogJzIwMTgtMDMtMTUnLCByZWdpc3RlcmVkQ2FwaXRhbDogJzIwMDBcdTRFMDdcdTRFQkFcdTZDMTFcdTVFMDEnLCBidXNpbmVzc1Njb3BlOiAnXHU4RkQwXHU4RjkzXHU0RTBFXHU0RUQzXHU1MEE4XHU2NzBEXHU1MkExJyxcclxuICAgIGJhbmtOYW1lOiAnXHU0RTJEXHU1NkZEXHU1MTlDXHU0RTFBXHU5NEY2XHU4ODRDXHU1MzE3XHU0RUFDXHU1MjA2XHU4ODRDJywgYmFua0FjY291bnQ6ICc2MjI4KioqKioqKioqMDAyJywgY29tcGFueUVtYWlsOiAnY29udGFjdEBmbHkuY29tJywgY29tcGFueVBob25lOiAnMDEwLTY2NjY2NjY2JyxcclxuICAgIGFubnVhbFJldmVudWVSYW5nZTogJzEwMDAtMzAwMFx1NEUwNycsIG1haW5CdXNpbmVzczogJ1x1NzI2OVx1NkQ0MVx1OEZEMFx1OEY5MycsIHBhcnRuZXJzOiAnXHU1RkI3XHU5MEE2LFx1NEVBQ1x1NEUxQ1x1NEVEMycsXHJcbiAgICBhZG1pbk5hbWU6ICdcdThENzVcdTRFOTEnLCBhZG1pbkRlcHQ6ICdcdThGRDBcdTg0MjVcdTkwRTgnLCBhZG1pblRpdGxlOiAnXHU0RTNCXHU3QkExJywgYWRtaW5QaG9uZTogJzEzNzAwMDAwMDAxJyxcclxuICAgIGNvbnRhY3Q6ICdcdTY3NEVcdTU2REInLCBwaG9uZTogJzEzOTAwMDAwMDAxJywgYWRkcmVzczogJ1x1NTMxN1x1NEVBQ1x1NUUwMlx1NjcxRFx1OTYzM1x1NTMzQScsIGxpY2Vuc2U6ICdcdTg0MjVcdTRFMUFcdTYyNjdcdTcxNjdCJywgbGVnYWxJZEZyb250OiAnXHU2Q0Q1XHU0RUJBXHU4QkMxXHU1MjREQicsIGxlZ2FsSWRCYWNrOiAnXHU2Q0Q1XHU0RUJBXHU4QkMxXHU1NDBFQicsIGJhbmtQZXJtaXQ6ICdcdTVGMDBcdTYyMzdcdThCQjhcdTUzRUZCJywgYXV0aExldHRlcjogJ1x1NjM4OFx1Njc0M1x1NEU2NkInLCBzZWFsOiAnXHU1MTZDXHU3QUUwQicgfVxyXG5dO1xyXG5cclxuY29uc3QgZmlsZURhdGEgPSBsb2FkRnJvbUZpbGUoKTtcclxuaWYgKGZpbGVEYXRhKSBvd25lcnMgPSBmaWxlRGF0YTtcclxuZnVuY3Rpb24gcGVyc2lzdCgpIHsgc2F2ZVRvRmlsZShvd25lcnMpOyB9XHJcblxyXG5leHBvcnQgZGVmYXVsdCBbXHJcbiAgLy8gXHU1MjE3XHU4ODY4XHJcbiAge1xyXG4gICAgdXJsOiAnL2FwaS9pbnZlbnRvcnktb3duZXIvbGlzdCcsXHJcbiAgICBtZXRob2Q6ICdnZXQnLFxyXG4gICAgcmVzcG9uc2U6ICh7IHF1ZXJ5IH0pID0+IHtcclxuICAgICAgY29uc3Qga2V5d29yZCA9IChxdWVyeT8ua2V5d29yZCB8fCAnJykudG9TdHJpbmcoKS50cmltKCkudG9Mb3dlckNhc2UoKTtcclxuICAgICAgY29uc3QgcGFnZSA9IHBhcnNlSW50KHF1ZXJ5Py5wYWdlIHx8ICcxJywgMTApIHx8IDE7XHJcbiAgICAgIGNvbnN0IHBhZ2VTaXplID0gcGFyc2VJbnQocXVlcnk/LnBhZ2VTaXplIHx8ICcxMCcsIDEwKSB8fCAxMDtcclxuICAgICAgY29uc3Qgc29ydEJ5ID0gKHF1ZXJ5Py5zb3J0QnkgfHwgJycpLnRvU3RyaW5nKCk7XHJcbiAgICAgIGNvbnN0IHNvcnRPcmRlciA9IChxdWVyeT8uc29ydE9yZGVyIHx8ICdhc2MnKS50b1N0cmluZygpLnRvTG93ZXJDYXNlKCkgPT09ICdkZXNjJyA/ICdkZXNjJyA6ICdhc2MnO1xyXG5cclxuICAgICAgY29uc3QgZmlsdGVyZWQgPSBrZXl3b3JkXHJcbiAgICAgICAgPyBvd25lcnMuZmlsdGVyKG8gPT4gW28uY29tcGFueSwgby5jb2RlLCBvLmNyZWRpdENvZGUsIG8uY29udGFjdCwgby5waG9uZSwgby5jb21wYW55UGhvbmUsIG8uYWRkcmVzcywgby5yZWdBZGRyZXNzXVxyXG4gICAgICAgICAgICAuc29tZSh2ID0+IFN0cmluZyh2IHx8ICcnKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKGtleXdvcmQpKSlcclxuICAgICAgICA6IG93bmVycztcclxuXHJcbiAgICAgIGNvbnN0IHNvcnRhYmxlRmllbGRzID0gbmV3IFNldChbJ2lkJywnY29tcGFueScsJ2NvZGUnLCdjcmVkaXRDb2RlJywnY29udGFjdCcsJ3Bob25lJywnY29tcGFueVBob25lJywnYWRkcmVzcycsJ3JlZ0FkZHJlc3MnLCdsaWNlbnNlJ10pO1xyXG4gICAgICBjb25zdCBzb3J0ZWQgPSAoc29ydEJ5ICYmIHNvcnRhYmxlRmllbGRzLmhhcyhzb3J0QnkpKSA/IFsuLi5maWx0ZXJlZF0uc29ydCgoYSwgYikgPT4ge1xyXG4gICAgICAgIGNvbnN0IGF2ID0gYVtzb3J0QnldO1xyXG4gICAgICAgIGNvbnN0IGJ2ID0gYltzb3J0QnldO1xyXG4gICAgICAgIGlmICh0eXBlb2YgYXYgPT09ICdudW1iZXInICYmIHR5cGVvZiBidiA9PT0gJ251bWJlcicpIHtcclxuICAgICAgICAgIHJldHVybiBzb3J0T3JkZXIgPT09ICdhc2MnID8gYXYgLSBidiA6IGJ2IC0gYXY7XHJcbiAgICAgICAgfVxyXG4gICAgICAgIGNvbnN0IGFzID0gU3RyaW5nKGF2ID8/ICcnKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgIGNvbnN0IGJzID0gU3RyaW5nKGJ2ID8/ICcnKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgIGlmIChhcyA9PT0gYnMpIHJldHVybiAwO1xyXG4gICAgICAgIHJldHVybiBzb3J0T3JkZXIgPT09ICdhc2MnID8gKGFzID4gYnMgPyAxIDogLTEpIDogKGFzIDwgYnMgPyAxIDogLTEpO1xyXG4gICAgICB9KSA6IGZpbHRlcmVkO1xyXG5cclxuICAgICAgY29uc3QgdG90YWwgPSBzb3J0ZWQubGVuZ3RoO1xyXG4gICAgICBjb25zdCBzdGFydCA9IChwYWdlIC0gMSkgKiBwYWdlU2l6ZTtcclxuICAgICAgY29uc3QgbGlzdCA9IHNvcnRlZC5zbGljZShzdGFydCwgc3RhcnQgKyBwYWdlU2l6ZSk7XHJcblxyXG4gICAgICByZXR1cm4geyBjb2RlOiAwLCBkYXRhOiB7IGxpc3QsIHRvdGFsLCBwYWdlLCBwYWdlU2l6ZSB9IH07XHJcbiAgICB9XHJcbiAgfSxcclxuICAvLyBcdTY1ODdcdTRFRjZcdTRFMEJcdThGN0RcdUZGMDhsaWNlbnNlL3NlYWwgXHU1MzYwXHU0RjREXHVGRjA5XHJcbiAge1xyXG4gICAgdXJsOiAnL2FwaS9pbnZlbnRvcnktb3duZXIvZmlsZScsXHJcbiAgICBtZXRob2Q6ICdnZXQnLFxyXG4gICAgcmF3UmVzcG9uc2U6IGFzeW5jIChyZXEsIHJlcykgPT4ge1xyXG4gICAgICBjb25zdCB7IFVSTCB9ID0gYXdhaXQgaW1wb3J0KCd1cmwnKTtcclxuICAgICAgY29uc3QgdSA9IG5ldyBVUkwocmVxLnVybCwgJ2h0dHA6Ly9sb2NhbGhvc3QnKTtcclxuICAgICAgY29uc3QgaWQgPSB1LnNlYXJjaFBhcmFtcy5nZXQoJ2lkJyk7XHJcbiAgICAgIGNvbnN0IHR5cGUgPSB1LnNlYXJjaFBhcmFtcy5nZXQoJ3R5cGUnKTtcclxuICAgICAgY29uc3QgZmlsZW5hbWUgPSB1LnNlYXJjaFBhcmFtcy5nZXQoJ2ZpbGVuYW1lJykgfHwgYCR7dHlwZSB8fCAnZmlsZSd9LSR7aWQgfHwgJyd9LnBuZ2A7XHJcbiAgICAgIGNvbnN0IG93bmVyID0gb3duZXJzLmZpbmQobyA9PiBTdHJpbmcoby5pZCkgPT09IFN0cmluZyhpZCkpO1xyXG4gICAgICBpZiAoIW93bmVyKSB7XHJcbiAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA0MDQ7XHJcbiAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcclxuICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgY29kZTogMSwgbXNnOiAnXHU2NzJBXHU2MjdFXHU1MjMwJyB9KSk7XHJcbiAgICAgICAgcmV0dXJuO1xyXG4gICAgICB9XHJcbiAgICAgIGNvbnN0IGxhYmVsID0gYCR7b3duZXIuY29tcGFueX0gLyAke3R5cGUgfHwgJyd9YDtcclxuICAgICAgY29uc3Qgc3ViID0gU3RyaW5nKG93bmVyW3R5cGVdIHx8IGZpbGVuYW1lKTtcclxuICAgICAgLy8gXHU3NTFGXHU2MjEwXHU1MTg1XHU1RDRDIFNWRyBcdTk4ODRcdTg5QzhcdTU2RkVcclxuICAgICAgY29uc3Qgc3ZnID0gYDw/eG1sIHZlcnNpb249XCIxLjBcIiBlbmNvZGluZz1cIlVURi04XCI/PlxyXG48c3ZnIHhtbG5zPSdodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Zycgd2lkdGg9JzQyMCcgaGVpZ2h0PScyNjAnPlxyXG4gIDxkZWZzPlxyXG4gICAgPGxpbmVhckdyYWRpZW50IGlkPSdnJyB4MT0nMCcgeTE9JzAnIHgyPScxJyB5Mj0nMSc+XHJcbiAgICAgIDxzdG9wIG9mZnNldD0nMCUnIHN0b3AtY29sb3I9JyNmMWY1ZjknLz5cclxuICAgICAgPHN0b3Agb2Zmc2V0PScxMDAlJyBzdG9wLWNvbG9yPScjZTJlOGYwJy8+XHJcbiAgICA8L2xpbmVhckdyYWRpZW50PlxyXG4gIDwvZGVmcz5cclxuICA8cmVjdCB4PScwJyB5PScwJyB3aWR0aD0nMTAwJScgaGVpZ2h0PScxMDAlJyBmaWxsPSd1cmwoI2cpJy8+XHJcbiAgPHJlY3QgeD0nMTAnIHk9JzEwJyB3aWR0aD0nNDAwJyBoZWlnaHQ9JzI0MCcgcng9JzEyJyByeT0nMTInIGZpbGw9JyNmZmZmZmYnIHN0cm9rZT0nIzk0YTNiOCcvPlxyXG4gIDx0ZXh0IHg9JzMwJyB5PSc5MCcgZm9udC1zaXplPScxOCcgZmlsbD0nIzBmMTcyYSc+JHtsYWJlbH08L3RleHQ+XHJcbiAgPHRleHQgeD0nMzAnIHk9JzEzMCcgZm9udC1zaXplPScxNCcgZmlsbD0nIzMzNDE1NSc+JHtzdWJ9PC90ZXh0PlxyXG4gIDx0ZXh0IHg9JzMwJyB5PScxNzAnIGZvbnQtc2l6ZT0nMTInIGZpbGw9JyM2NDc0OGInPk1vY2sgUHJldmlldzwvdGV4dD5cclxuPC9zdmc+YDtcclxuICAgICAgY29uc3QgYXNjaWlGYWxsYmFjayA9IChTdHJpbmcoZmlsZW5hbWUpLm1hdGNoKC9bXFx4MDAtXFx4N0ZdKy9nKSB8fCBbJ3ByZXZpZXcuc3ZnJ10pLmpvaW4oJycpIHx8ICdwcmV2aWV3LnN2Zyc7XHJcbiAgICAgIHJlcy5zdGF0dXNDb2RlID0gMjAwO1xyXG4gICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnaW1hZ2Uvc3ZnK3htbDsgY2hhcnNldD11dGYtOCcpO1xyXG4gICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LURpc3Bvc2l0aW9uJywgYGlubGluZTsgZmlsZW5hbWU9XCIke2FzY2lpRmFsbGJhY2t9XCJgKTtcclxuICAgICAgcmVzLmVuZChzdmcpO1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgLy8gXHU1QkZDXHU1MUZBQ1NWXHVGRjA4XHU2NzBEXHU1MkExXHU3QUVGXHU3NTFGXHU2MjEwXHVGRjA5XHJcbiAge1xyXG4gICAgdXJsOiAnL2FwaS9pbnZlbnRvcnktb3duZXIvZXhwb3J0JyxcclxuICAgIG1ldGhvZDogJ2dldCcsXHJcbiAgICByYXdSZXNwb25zZTogYXN5bmMgKHJlcSwgcmVzKSA9PiB7XHJcbiAgICAgIHRyeSB7XHJcbiAgICAgICAgY29uc3QgeyBVUkwgfSA9IGF3YWl0IGltcG9ydCgndXJsJyk7XHJcbiAgICAgICAgY29uc3QgdSA9IG5ldyBVUkwocmVxLnVybCwgJ2h0dHA6Ly9sb2NhbGhvc3QnKTtcclxuICAgICAgICBjb25zdCBrZXl3b3JkID0gKHUuc2VhcmNoUGFyYW1zLmdldCgna2V5d29yZCcpIHx8ICcnKS50b1N0cmluZygpLnRyaW0oKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgIGNvbnN0IHNvcnRCeSA9ICh1LnNlYXJjaFBhcmFtcy5nZXQoJ3NvcnRCeScpIHx8ICcnKS50b1N0cmluZygpO1xyXG4gICAgICAgIGNvbnN0IHNvcnRPcmRlciA9ICh1LnNlYXJjaFBhcmFtcy5nZXQoJ3NvcnRPcmRlcicpIHx8ICdhc2MnKS50b1N0cmluZygpLnRvTG93ZXJDYXNlKCkgPT09ICdkZXNjJyA/ICdkZXNjJyA6ICdhc2MnO1xyXG5cclxuICAgICAgICBjb25zdCBmaWx0ZXJlZCA9IGtleXdvcmRcclxuICAgICAgICAgID8gb3duZXJzLmZpbHRlcihvID0+IFtvLmNvbXBhbnksIG8uY29kZSwgby5jcmVkaXRDb2RlLCBvLnJlZ0FkZHJlc3MsIG8ubGVnYWxSZXBOYW1lLCBvLmxlZ2FsUmVwSWQsIG8ucmVnaXN0ZXJlZENhcGl0YWwsIG8uYnVzaW5lc3NTY29wZSwgby5iYW5rTmFtZSwgby5iYW5rQWNjb3VudCwgby5jb21wYW55RW1haWwsIG8uY29tcGFueVBob25lLCBvLmFubnVhbFJldmVudWVSYW5nZSwgby5tYWluQnVzaW5lc3MsIG8ucGFydG5lcnMsIG8uYWRtaW5OYW1lLCBvLmFkbWluRGVwdCwgby5hZG1pblRpdGxlLCBvLmFkbWluUGhvbmUsIG8uY29udGFjdCwgby5waG9uZSwgby5hZGRyZXNzXVxyXG4gICAgICAgICAgICAgIC5zb21lKHYgPT4gU3RyaW5nKHYgfHwgJycpLnRvTG93ZXJDYXNlKCkuaW5jbHVkZXMoa2V5d29yZCkpKVxyXG4gICAgICAgICAgOiBvd25lcnM7XHJcblxyXG4gICAgICAgIGNvbnN0IHNvcnRhYmxlRmllbGRzID0gbmV3IFNldChbJ2lkJywnY29tcGFueScsJ2NvZGUnLCdjcmVkaXRDb2RlJywncmVnQWRkcmVzcycsJ2xlZ2FsUmVwTmFtZScsJ2xlZ2FsUmVwSWQnLCdyZWdpc3RlcmVkQ2FwaXRhbCcsJ2J1c2luZXNzU2NvcGUnLCdiYW5rTmFtZScsJ2JhbmtBY2NvdW50JywnY29tcGFueUVtYWlsJywnY29tcGFueVBob25lJywnYW5udWFsUmV2ZW51ZVJhbmdlJywnbWFpbkJ1c2luZXNzJywncGFydG5lcnMnLCdhZG1pbk5hbWUnLCdhZG1pbkRlcHQnLCdhZG1pblRpdGxlJywnYWRtaW5QaG9uZScsJ2NvbnRhY3QnLCdwaG9uZScsJ2FkZHJlc3MnXSk7XHJcbiAgICAgICAgY29uc3Qgc29ydGVkID0gKHNvcnRCeSAmJiBzb3J0YWJsZUZpZWxkcy5oYXMoc29ydEJ5KSkgPyBbLi4uZmlsdGVyZWRdLnNvcnQoKGEsIGIpID0+IHtcclxuICAgICAgICAgIGNvbnN0IGF2ID0gYVtzb3J0QnldO1xyXG4gICAgICAgICAgY29uc3QgYnYgPSBiW3NvcnRCeV07XHJcbiAgICAgICAgICBpZiAodHlwZW9mIGF2ID09PSAnbnVtYmVyJyAmJiB0eXBlb2YgYnYgPT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgICAgIHJldHVybiBzb3J0T3JkZXIgPT09ICdhc2MnID8gYXYgLSBidiA6IGJ2IC0gYXY7XHJcbiAgICAgICAgICB9XHJcbiAgICAgICAgICBjb25zdCBhcyA9IFN0cmluZyhhdiA/PyAnJykudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgIGNvbnN0IGJzID0gU3RyaW5nKGJ2ID8/ICcnKS50b0xvd2VyQ2FzZSgpO1xyXG4gICAgICAgICAgaWYgKGFzID09PSBicykgcmV0dXJuIDA7XHJcbiAgICAgICAgICByZXR1cm4gc29ydE9yZGVyID09PSAnYXNjJyA/IChhcyA+IGJzID8gMSA6IC0xKSA6IChhcyA8IGJzID8gMSA6IC0xKTtcclxuICAgICAgICB9KSA6IGZpbHRlcmVkO1xyXG5cclxuICAgICAgICBjb25zdCBoZWFkZXIgPSBbXHJcbiAgICAgICAgICAnXHU0RjAxXHU0RTFBXHU1NDBEXHU3OUYwJywnXHU1QjU4XHU4RDI3XHU0RUJBXHU3RjE2XHU3ODAxJywnXHU3RURGXHU0RTAwXHU3OTNFXHU0RjFBXHU0RkUxXHU3NTI4XHU0RUUzXHU3ODAxJywnXHU0RjAxXHU0RTFBXHU2Q0U4XHU1MThDXHU1NzMwXHU1NzQwJywnXHU2Q0Q1XHU1QjlBXHU0RUUzXHU4ODY4XHU0RUJBXHU1OUQzXHU1NDBEJywnXHU2Q0Q1XHU1QjlBXHU0RUUzXHU4ODY4XHU0RUJBXHU4RUFCXHU0RUZEXHU4QkMxXHU1M0Y3JywnXHU2MjEwXHU3QUNCXHU2NUU1XHU2NzFGJywnXHU2Q0U4XHU1MThDXHU4RDQ0XHU2NzJDJywnXHU3RUNGXHU4NDI1XHU4MzAzXHU1NkY0JyxcclxuICAgICAgICAgICdcdTVCRjlcdTUxNkNcdThEMjZcdTYyMzdcdTVGMDBcdTYyMzdcdTg4NEMnLCdcdTVCRjlcdTUxNkNcdThEMjZcdTYyMzdcdTUzRjcnLCdcdTRGMDFcdTRFMUFcdTVFMzhcdTc1MjhcdTkwQUVcdTdCQjEnLCdcdTRGMDFcdTRFMUFcdTgwNTRcdTdDRkJcdTc1MzVcdThCREQnLFxyXG4gICAgICAgICAgJ1x1NUU3NFx1ODQyNVx1NEUxQVx1OTg5RFx1ODMwM1x1NTZGNCcsJ1x1NEUzQlx1ODQyNVx1NEUxQVx1NTJBMVx1ODMwM1x1NTZGNCcsJ1x1NUUzOFx1NzUyOFx1NTQwOFx1NEY1Q1x1NjVCOScsXHJcbiAgICAgICAgICAnXHU3QkExXHU3NDA2XHU1NDU4XHU1OUQzXHU1NDBEJywnXHU5MEU4XHU5NUU4JywnXHU4MDRDXHU0RjREJywnXHU3QkExXHU3NDA2XHU1NDU4XHU2MjRCXHU2NzNBXHU1M0Y3JyxcclxuICAgICAgICAgICdcdTgwNTRcdTdDRkJcdTRFQkEnLCdcdTc1MzVcdThCREQnLCdcdTU3MzBcdTU3NDAnXHJcbiAgICAgICAgXTtcclxuICAgICAgICBjb25zdCBsaW5lcyA9IFtoZWFkZXIuam9pbignLCcpXS5jb25jYXQoXHJcbiAgICAgICAgICBzb3J0ZWQubWFwKHIgPT4gW1xyXG4gICAgICAgICAgICByLmNvbXBhbnksIHIuY29kZSwgci5jcmVkaXRDb2RlLCByLnJlZ0FkZHJlc3MsIHIubGVnYWxSZXBOYW1lLCByLmxlZ2FsUmVwSWQsIHIuZXN0YWJsaXNoRGF0ZSwgci5yZWdpc3RlcmVkQ2FwaXRhbCwgci5idXNpbmVzc1Njb3BlLFxyXG4gICAgICAgICAgICByLmJhbmtOYW1lLCByLmJhbmtBY2NvdW50LCByLmNvbXBhbnlFbWFpbCwgci5jb21wYW55UGhvbmUsXHJcbiAgICAgICAgICAgIHIuYW5udWFsUmV2ZW51ZVJhbmdlLCByLm1haW5CdXNpbmVzcywgci5wYXJ0bmVycyxcclxuICAgICAgICAgICAgci5hZG1pbk5hbWUsIHIuYWRtaW5EZXB0LCByLmFkbWluVGl0bGUsIHIuYWRtaW5QaG9uZSxcclxuICAgICAgICAgICAgci5jb250YWN0LCByLnBob25lLCByLmFkZHJlc3NcclxuICAgICAgICAgIF1cclxuICAgICAgICAgICAgLm1hcCh2ID0+IFN0cmluZyh2ID8/ICcnKS5yZXBsYWNlKC9cIi9nLCAnXCJcIicpKVxyXG4gICAgICAgICAgICAubWFwKHMgPT4gL1tcIixcXG5dLy50ZXN0KHMpID8gJ1wiJyArIHMgKyAnXCInIDogcylcclxuICAgICAgICAgICAgLmpvaW4oJywnKSlcclxuICAgICAgICApO1xyXG4gICAgICAgIGNvbnN0IGNzdiA9ICdcXHVmZWZmJyArIGxpbmVzLmpvaW4oJ1xcbicpO1xyXG4gICAgICAgIGNvbnN0IGFzY2lpTmFtZSA9IGBpbnZlbnRvcnktb3duZXJzLSR7RGF0ZS5ub3coKX0uY3N2YDtcclxuICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDIwMDtcclxuICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAndGV4dC9jc3Y7IGNoYXJzZXQ9dXRmLTgnKTtcclxuICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LURpc3Bvc2l0aW9uJywgYGF0dGFjaG1lbnQ7IGZpbGVuYW1lPVwiJHthc2NpaU5hbWV9XCJgKTtcclxuICAgICAgICByZXMuZW5kKGNzdik7XHJcbiAgICAgIH0gY2F0Y2ggKGUpIHtcclxuICAgICAgICByZXMuc3RhdHVzQ29kZSA9IDUwMDtcclxuICAgICAgICByZXMuc2V0SGVhZGVyKCdDb250ZW50LVR5cGUnLCAnYXBwbGljYXRpb24vanNvbicpO1xyXG4gICAgICAgIHJlcy5lbmQoSlNPTi5zdHJpbmdpZnkoeyBjb2RlOiAxLCBtc2c6ICdcdTVCRkNcdTUxRkFcdTU5MzFcdThEMjUnIH0pKTtcclxuICAgICAgfVxyXG4gICAgfVxyXG4gIH0sXHJcbiAgLy8gXHU4QkU2XHU2MEM1XHJcbiAge1xyXG4gICAgdXJsOiAnL2FwaS9pbnZlbnRvcnktb3duZXIvZGV0YWlsJyxcclxuICAgIG1ldGhvZDogJ2dldCcsXHJcbiAgICByZXNwb25zZTogKHsgcXVlcnkgfSkgPT4ge1xyXG4gICAgICBjb25zdCBpdGVtID0gb3duZXJzLmZpbmQoZCA9PiBkLmlkID09IHF1ZXJ5LmlkKTtcclxuICAgICAgcmV0dXJuIHsgY29kZTogaXRlbSA/IDAgOiAxLCBkYXRhOiBpdGVtIHx8IG51bGwgfTtcclxuICAgIH1cclxuICB9LFxyXG4gIC8vIFx1NTIxQlx1NUVGQVxyXG4gIHtcclxuICAgIHVybDogJy9hcGkvaW52ZW50b3J5LW93bmVyL2NyZWF0ZScsXHJcbiAgICBtZXRob2Q6ICdwb3N0JyxcclxuICAgIHJlc3BvbnNlOiAoeyBib2R5IH0pID0+IHtcclxuICAgICAgY29uc3QgaWQgPSBNYXRoLm1heCgwLCAuLi5vd25lcnMubWFwKG8gPT4gby5pZCkpICsgMTtcclxuICAgICAgY29uc3QgY29tcGFueSA9IFN0cmluZyhib2R5Py5jb21wYW55IHx8ICcnKS50cmltKCk7XHJcbiAgICAgIC8vIFx1ODFFQVx1NTJBOFx1NzUxRlx1NjIxMFx1N0YxNlx1NzgwMVx1RkYxQUlOVi0wMDAwMSBcdTkwMTJcdTU4OUVcclxuICAgICAgY29uc3QgZ2VuTmV4dCA9ICgpID0+IHtcclxuICAgICAgICBjb25zdCBudW1zID0gb3duZXJzXHJcbiAgICAgICAgICAubWFwKG8gPT4gU3RyaW5nKG8uY29kZSB8fCAnJykpXHJcbiAgICAgICAgICAubWFwKGMgPT4gKGMuc3RhcnRzV2l0aCgnSU5WLScpID8gcGFyc2VJbnQoYy5zbGljZSg0KSwgMTApIDogTmFOKSlcclxuICAgICAgICAgIC5maWx0ZXIobiA9PiBOdW1iZXIuaXNGaW5pdGUobikpO1xyXG4gICAgICAgIGNvbnN0IG5leHQgPSAobnVtcy5sZW5ndGggPyBNYXRoLm1heCguLi5udW1zKSA6IDApICsgMTtcclxuICAgICAgICByZXR1cm4gJ0lOVi0nICsgU3RyaW5nKG5leHQpLnBhZFN0YXJ0KDUsICcwJyk7XHJcbiAgICAgIH07XHJcbiAgICAgIGNvbnN0IGNvZGUgPSBTdHJpbmcoYm9keT8uY29kZSB8fCAnJykudHJpbSgpIHx8IGdlbk5leHQoKTtcclxuICAgICAgaWYgKCFjb2RlIHx8ICFjb21wYW55KSB7XHJcbiAgICAgICAgcmV0dXJuIHsgY29kZTogMSwgbXNnOiAnXHU1MTZDXHU1M0Y4XHU1NDBEXHU3OUYwXHU0RTBFXHU1QjU4XHU4RDI3XHU0RUJBXHU3RjE2XHU3ODAxXHU1RkM1XHU1ODZCJyB9O1xyXG4gICAgICB9XHJcbiAgICAgIC8vIFx1NTkwRFx1NTQwOFx1NEUzQlx1OTUyRVx1RkYxQWNvbXBhbnkgKyBjb2RlIFx1NTNCQlx1OTFDRFx1RkYwOFx1ODJFNVx1NUI1OFx1NTcyOFx1NTIxOVx1NzZGNFx1NjNBNVx1OEZENFx1NTZERVx1NURGMlx1NjcwOVx1OEJCMFx1NUY1NVx1RkYwQ1x1NjVCOVx1NEZCRlx1NkYxNFx1NzkzQVx1RkYwOVxyXG4gICAgICBjb25zdCBleGlzdGVkID0gb3duZXJzLmZpbmQobyA9PiBvLmNvbXBhbnkgPT09IGNvbXBhbnkgJiYgby5jb2RlID09PSBjb2RlKTtcclxuICAgICAgaWYgKGV4aXN0ZWQpIHtcclxuICAgICAgICByZXR1cm4geyBjb2RlOiAwLCBkYXRhOiBleGlzdGVkLCBtc2c6ICdcdThCRTVcdTUxNkNcdTUzRjgrXHU3RjE2XHU3ODAxXHU1REYyXHU1QjU4XHU1NzI4XHVGRjBDXHU4RkQ0XHU1NkRFXHU3M0IwXHU2NzA5XHU4QkIwXHU1RjU1JyB9O1xyXG4gICAgICB9XHJcbiAgICAgIGNvbnN0IGl0ZW0gPSB7IGlkLCAuLi5ib2R5LCBjb2RlIH07XHJcbiAgICAgIG93bmVycy5wdXNoKGl0ZW0pO1xyXG4gICAgICBwZXJzaXN0KCk7XHJcbiAgICAgIHJldHVybiB7IGNvZGU6IDAsIGRhdGE6IGl0ZW0sIG1zZzogJ1x1NTIxQlx1NUVGQVx1NjIxMFx1NTI5RicgfTtcclxuICAgIH1cclxuICB9LFxyXG4gIC8vIFx1NjZGNFx1NjVCMFxyXG4gIHtcclxuICAgIHVybDogJy9hcGkvaW52ZW50b3J5LW93bmVyL3VwZGF0ZScsXHJcbiAgICBtZXRob2Q6ICdwb3N0JyxcclxuICAgIHJlc3BvbnNlOiAoeyBib2R5IH0pID0+IHtcclxuICAgICAgY29uc3QgaWR4ID0gb3duZXJzLmZpbmRJbmRleChvID0+IG8uaWQgPT0gYm9keS5pZCk7XHJcbiAgICAgIGlmIChpZHggPT09IC0xKSByZXR1cm4geyBjb2RlOiAxLCBtc2c6ICdcdTY3MkFcdTYyN0VcdTUyMzAnIH07XHJcbiAgICAgIC8vIFx1NjZGNFx1NjVCMFx1NjVGNlx1NEU1Rlx1NjgyMVx1OUE4Q1x1NTkwRFx1NTQwOFx1NEUzQlx1OTUyRVx1NTUyRlx1NEUwMFxyXG4gICAgICBjb25zdCBjb2RlID0gU3RyaW5nKGJvZHk/LmNvZGUgPz8gb3duZXJzW2lkeF0uY29kZSkudHJpbSgpO1xyXG4gICAgICBjb25zdCBjb21wYW55ID0gU3RyaW5nKGJvZHk/LmNvbXBhbnkgPz8gb3duZXJzW2lkeF0uY29tcGFueSkudHJpbSgpO1xyXG4gICAgICBjb25zdCBkdXAgPSBvd25lcnMuZmluZChvID0+IG8uY29tcGFueSA9PT0gY29tcGFueSAmJiBvLmNvZGUgPT09IGNvZGUgJiYgby5pZCAhPT0gb3duZXJzW2lkeF0uaWQpO1xyXG4gICAgICBpZiAoZHVwKSB7XHJcbiAgICAgICAgcmV0dXJuIHsgY29kZTogMSwgbXNnOiAnXHU1MTZDXHU1M0Y4XHU1NDBEXHU3OUYwK1x1N0YxNlx1NzgwMVx1OTFDRFx1NTkwRCcgfTtcclxuICAgICAgfVxyXG4gICAgICBvd25lcnNbaWR4XSA9IHsgLi4ub3duZXJzW2lkeF0sIC4uLmJvZHksIGNvZGUsIGNvbXBhbnkgfTtcclxuICAgICAgcGVyc2lzdCgpO1xyXG4gICAgICByZXR1cm4geyBjb2RlOiAwLCBkYXRhOiBvd25lcnNbaWR4XSwgbXNnOiAnXHU2NkY0XHU2NUIwXHU2MjEwXHU1MjlGJyB9O1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgLy8gXHU1MjIwXHU5NjY0XHJcbiAge1xyXG4gICAgdXJsOiAnL2FwaS9pbnZlbnRvcnktb3duZXIvZGVsZXRlJyxcclxuICAgIG1ldGhvZDogJ3Bvc3QnLFxyXG4gICAgcmVzcG9uc2U6ICh7IGJvZHkgfSkgPT4ge1xyXG4gICAgICBvd25lcnMgPSBvd25lcnMuZmlsdGVyKG8gPT4gby5pZCAhPSBib2R5LmlkKTtcclxuICAgICAgcGVyc2lzdCgpO1xyXG4gICAgICByZXR1cm4geyBjb2RlOiAwLCBtc2c6ICdcdTUyMjBcdTk2NjRcdTYyMTBcdTUyOUYnIH07XHJcbiAgICB9XHJcbiAgfVxyXG5dO1xyXG4iXSwKICAibWFwcGluZ3MiOiAiO0FBQTBOLE9BQU8sUUFBUTtBQUN6TyxPQUFPLFVBQVU7QUFFakIsSUFBTSxVQUFVLEtBQUssUUFBUSxRQUFRLElBQUksR0FBRyxRQUFRLE1BQU07QUFDMUQsSUFBTSxXQUFXLEtBQUssUUFBUSxTQUFTLHVCQUF1QjtBQUU5RCxTQUFTLGdCQUFnQjtBQUN2QixNQUFJO0FBQUUsUUFBSSxDQUFDLEdBQUcsV0FBVyxPQUFPLEVBQUcsSUFBRyxVQUFVLFNBQVMsRUFBRSxXQUFXLEtBQUssQ0FBQztFQUFHLFFBQVE7RUFBQztBQUMxRjtBQUNBLFNBQVMsZUFBZTtBQUN0QixNQUFJO0FBQ0YsUUFBSSxHQUFHLFdBQVcsUUFBUSxHQUFHO0FBQzNCLFlBQU0sTUFBTSxHQUFHLGFBQWEsVUFBVSxNQUFNO0FBQzVDLFlBQU0sT0FBTyxLQUFLLE1BQU0sR0FBRztBQUMzQixVQUFJLE1BQU0sUUFBUSxJQUFJLEVBQUcsUUFBTztJQUNsQztFQUNGLFFBQVE7RUFBQztBQUNULFNBQU87QUFDVDtBQUNBLFNBQVMsV0FBVyxNQUFNO0FBQ3hCLE1BQUk7QUFDRixrQkFBYztBQUNkLE9BQUcsY0FBYyxVQUFVLEtBQUssVUFBVSxNQUFNLE1BQU0sQ0FBQyxHQUFHLE1BQU07RUFDbEUsUUFBUTtFQUFDO0FBQ1g7QUFFQSxJQUFJLFNBQVM7RUFDWDtJQUFFLElBQUk7SUFBRyxTQUFTO0lBQVEsTUFBTTtJQUM5QixZQUFZO0lBQXFCLFlBQVk7SUFBVyxjQUFjO0lBQU0sWUFBWTtJQUFzQixlQUFlO0lBQWMsbUJBQW1CO0lBQVksZUFBZTtJQUN6TCxVQUFVO0lBQWMsYUFBYTtJQUFvQixjQUFjO0lBQWtCLGNBQWM7SUFDdkcsb0JBQW9CO0lBQWUsY0FBYztJQUFhLFVBQVU7SUFDeEUsV0FBVztJQUFNLFdBQVc7SUFBTyxZQUFZO0lBQVEsWUFBWTtJQUNuRSxTQUFTO0lBQU0sT0FBTztJQUFlLFNBQVM7SUFBVyxTQUFTO0lBQVMsY0FBYztJQUFTLGFBQWE7SUFBUyxZQUFZO0lBQVUsWUFBWTtJQUFRLE1BQU07RUFBTTtFQUNoTDtJQUFFLElBQUk7SUFBRyxTQUFTO0lBQVEsTUFBTTtJQUM5QixZQUFZO0lBQXFCLFlBQVk7SUFBVSxjQUFjO0lBQU0sWUFBWTtJQUFzQixlQUFlO0lBQWMsbUJBQW1CO0lBQVksZUFBZTtJQUN4TCxVQUFVO0lBQWMsYUFBYTtJQUFvQixjQUFjO0lBQW1CLGNBQWM7SUFDeEcsb0JBQW9CO0lBQWMsY0FBYztJQUFRLFVBQVU7SUFDbEUsV0FBVztJQUFNLFdBQVc7SUFBTyxZQUFZO0lBQU0sWUFBWTtJQUNqRSxTQUFTO0lBQU0sT0FBTztJQUFlLFNBQVM7SUFBVSxTQUFTO0lBQVMsY0FBYztJQUFTLGFBQWE7SUFBUyxZQUFZO0lBQVMsWUFBWTtJQUFRLE1BQU07RUFBTTtBQUNoTDtBQUVBLElBQU0sV0FBVyxhQUFhO0FBQzlCLElBQUksU0FBVSxVQUFTO0FBQ3ZCLFNBQVMsVUFBVTtBQUFFLGFBQVcsTUFBTTtBQUFHO0FBRXpDLElBQU8sMEJBQVE7O0VBRWI7SUFDRSxLQUFLO0lBQ0wsUUFBUTtJQUNSLFVBQVUsQ0FBQyxFQUFFLE1BQU0sTUFBTTtBQUN2QixZQUFNLFdBQVcsT0FBTyxXQUFXLElBQUksU0FBUyxFQUFFLEtBQUssRUFBRSxZQUFZO0FBQ3JFLFlBQU0sT0FBTyxTQUFTLE9BQU8sUUFBUSxLQUFLLEVBQUUsS0FBSztBQUNqRCxZQUFNLFdBQVcsU0FBUyxPQUFPLFlBQVksTUFBTSxFQUFFLEtBQUs7QUFDMUQsWUFBTSxVQUFVLE9BQU8sVUFBVSxJQUFJLFNBQVM7QUFDOUMsWUFBTSxhQUFhLE9BQU8sYUFBYSxPQUFPLFNBQVMsRUFBRSxZQUFZLE1BQU0sU0FBUyxTQUFTO0FBRTdGLFlBQU0sV0FBVyxVQUNiLE9BQU8sT0FBTyxDQUFBLE1BQUssQ0FBQyxFQUFFLFNBQVMsRUFBRSxNQUFNLEVBQUUsWUFBWSxFQUFFLFNBQVMsRUFBRSxPQUFPLEVBQUUsY0FBYyxFQUFFLFNBQVMsRUFBRSxVQUFVLEVBQzdHLEtBQUssQ0FBQSxNQUFLLE9BQU8sS0FBSyxFQUFFLEVBQUUsWUFBWSxFQUFFLFNBQVMsT0FBTyxDQUFDLENBQUMsSUFDN0Q7QUFFSixZQUFNLGlCQUFpQixvQkFBSSxJQUFJLENBQUMsTUFBSyxXQUFVLFFBQU8sY0FBYSxXQUFVLFNBQVEsZ0JBQWUsV0FBVSxjQUFhLFNBQVMsQ0FBQztBQUNySSxZQUFNLFNBQVUsVUFBVSxlQUFlLElBQUksTUFBTSxJQUFLLENBQUMsR0FBRyxRQUFRLEVBQUUsS0FBSyxDQUFDLEdBQUcsTUFBTTtBQUNuRixjQUFNLEtBQUssRUFBRSxNQUFNO0FBQ25CLGNBQU0sS0FBSyxFQUFFLE1BQU07QUFDbkIsWUFBSSxPQUFPLE9BQU8sWUFBWSxPQUFPLE9BQU8sVUFBVTtBQUNwRCxpQkFBTyxjQUFjLFFBQVEsS0FBSyxLQUFLLEtBQUs7UUFDOUM7QUFDQSxjQUFNLEtBQUssT0FBTyxNQUFNLEVBQUUsRUFBRSxZQUFZO0FBQ3hDLGNBQU0sS0FBSyxPQUFPLE1BQU0sRUFBRSxFQUFFLFlBQVk7QUFDeEMsWUFBSSxPQUFPLEdBQUksUUFBTztBQUN0QixlQUFPLGNBQWMsUUFBUyxLQUFLLEtBQUssSUFBSSxLQUFPLEtBQUssS0FBSyxJQUFJO01BQ25FLENBQUMsSUFBSTtBQUVMLFlBQU0sUUFBUSxPQUFPO0FBQ3JCLFlBQU0sU0FBUyxPQUFPLEtBQUs7QUFDM0IsWUFBTSxPQUFPLE9BQU8sTUFBTSxPQUFPLFFBQVEsUUFBUTtBQUVqRCxhQUFPLEVBQUUsTUFBTSxHQUFHLE1BQU0sRUFBRSxNQUFNLE9BQU8sTUFBTSxTQUFTLEVBQUU7SUFDMUQ7RUFDRjs7RUFFQTtJQUNFLEtBQUs7SUFDTCxRQUFRO0lBQ1IsYUFBYSxPQUFPLEtBQUssUUFBUTtBQUMvQixZQUFNLEVBQUUsSUFBSSxJQUFJLE1BQU0sT0FBTyxLQUFLO0FBQ2xDLFlBQU0sSUFBSSxJQUFJLElBQUksSUFBSSxLQUFLLGtCQUFrQjtBQUM3QyxZQUFNLEtBQUssRUFBRSxhQUFhLElBQUksSUFBSTtBQUNsQyxZQUFNLE9BQU8sRUFBRSxhQUFhLElBQUksTUFBTTtBQUN0QyxZQUFNLFdBQVcsRUFBRSxhQUFhLElBQUksVUFBVSxLQUFLLEdBQUcsUUFBUSxNQUFNLElBQUksTUFBTSxFQUFFO0FBQ2hGLFlBQU0sUUFBUSxPQUFPLEtBQUssQ0FBQSxNQUFLLE9BQU8sRUFBRSxFQUFFLE1BQU0sT0FBTyxFQUFFLENBQUM7QUFDMUQsVUFBSSxDQUFDLE9BQU87QUFDVixZQUFJLGFBQWE7QUFDakIsWUFBSSxVQUFVLGdCQUFnQixrQkFBa0I7QUFDaEQsWUFBSSxJQUFJLEtBQUssVUFBVSxFQUFFLE1BQU0sR0FBRyxLQUFLLHFCQUFNLENBQUMsQ0FBQztBQUMvQztNQUNGO0FBQ0EsWUFBTSxRQUFRLEdBQUcsTUFBTSxPQUFPLE1BQU0sUUFBUSxFQUFFO0FBQzlDLFlBQU0sTUFBTSxPQUFPLE1BQU0sSUFBSSxLQUFLLFFBQVE7QUFFMUMsWUFBTSxNQUFNOzs7Ozs7Ozs7O3NEQVVvQyxLQUFLO3VEQUNKLEdBQUc7OztBQUdwRCxZQUFNLGlCQUFpQixPQUFPLFFBQVEsRUFBRSxNQUFNLGVBQWUsS0FBSyxDQUFDLGFBQWEsR0FBRyxLQUFLLEVBQUUsS0FBSztBQUMvRixVQUFJLGFBQWE7QUFDakIsVUFBSSxVQUFVLGdCQUFnQiw4QkFBOEI7QUFDNUQsVUFBSSxVQUFVLHVCQUF1QixxQkFBcUIsYUFBYSxHQUFHO0FBQzFFLFVBQUksSUFBSSxHQUFHO0lBQ2I7RUFDRjs7RUFFQTtJQUNFLEtBQUs7SUFDTCxRQUFRO0lBQ1IsYUFBYSxPQUFPLEtBQUssUUFBUTtBQUMvQixVQUFJO0FBQ0YsY0FBTSxFQUFFLElBQUksSUFBSSxNQUFNLE9BQU8sS0FBSztBQUNsQyxjQUFNLElBQUksSUFBSSxJQUFJLElBQUksS0FBSyxrQkFBa0I7QUFDN0MsY0FBTSxXQUFXLEVBQUUsYUFBYSxJQUFJLFNBQVMsS0FBSyxJQUFJLFNBQVMsRUFBRSxLQUFLLEVBQUUsWUFBWTtBQUNwRixjQUFNLFVBQVUsRUFBRSxhQUFhLElBQUksUUFBUSxLQUFLLElBQUksU0FBUztBQUM3RCxjQUFNLGFBQWEsRUFBRSxhQUFhLElBQUksV0FBVyxLQUFLLE9BQU8sU0FBUyxFQUFFLFlBQVksTUFBTSxTQUFTLFNBQVM7QUFFNUcsY0FBTSxXQUFXLFVBQ2IsT0FBTyxPQUFPLENBQUEsTUFBSyxDQUFDLEVBQUUsU0FBUyxFQUFFLE1BQU0sRUFBRSxZQUFZLEVBQUUsWUFBWSxFQUFFLGNBQWMsRUFBRSxZQUFZLEVBQUUsbUJBQW1CLEVBQUUsZUFBZSxFQUFFLFVBQVUsRUFBRSxhQUFhLEVBQUUsY0FBYyxFQUFFLGNBQWMsRUFBRSxvQkFBb0IsRUFBRSxjQUFjLEVBQUUsVUFBVSxFQUFFLFdBQVcsRUFBRSxXQUFXLEVBQUUsWUFBWSxFQUFFLFlBQVksRUFBRSxTQUFTLEVBQUUsT0FBTyxFQUFFLE9BQU8sRUFDcFUsS0FBSyxDQUFBLE1BQUssT0FBTyxLQUFLLEVBQUUsRUFBRSxZQUFZLEVBQUUsU0FBUyxPQUFPLENBQUMsQ0FBQyxJQUM3RDtBQUVKLGNBQU0saUJBQWlCLG9CQUFJLElBQUksQ0FBQyxNQUFLLFdBQVUsUUFBTyxjQUFhLGNBQWEsZ0JBQWUsY0FBYSxxQkFBb0IsaUJBQWdCLFlBQVcsZUFBYyxnQkFBZSxnQkFBZSxzQkFBcUIsZ0JBQWUsWUFBVyxhQUFZLGFBQVksY0FBYSxjQUFhLFdBQVUsU0FBUSxTQUFTLENBQUM7QUFDcFUsY0FBTSxTQUFVLFVBQVUsZUFBZSxJQUFJLE1BQU0sSUFBSyxDQUFDLEdBQUcsUUFBUSxFQUFFLEtBQUssQ0FBQyxHQUFHLE1BQU07QUFDbkYsZ0JBQU0sS0FBSyxFQUFFLE1BQU07QUFDbkIsZ0JBQU0sS0FBSyxFQUFFLE1BQU07QUFDbkIsY0FBSSxPQUFPLE9BQU8sWUFBWSxPQUFPLE9BQU8sVUFBVTtBQUNwRCxtQkFBTyxjQUFjLFFBQVEsS0FBSyxLQUFLLEtBQUs7VUFDOUM7QUFDQSxnQkFBTSxLQUFLLE9BQU8sTUFBTSxFQUFFLEVBQUUsWUFBWTtBQUN4QyxnQkFBTSxLQUFLLE9BQU8sTUFBTSxFQUFFLEVBQUUsWUFBWTtBQUN4QyxjQUFJLE9BQU8sR0FBSSxRQUFPO0FBQ3RCLGlCQUFPLGNBQWMsUUFBUyxLQUFLLEtBQUssSUFBSSxLQUFPLEtBQUssS0FBSyxJQUFJO1FBQ25FLENBQUMsSUFBSTtBQUVMLGNBQU0sU0FBUztVQUNiO1VBQU87VUFBUTtVQUFXO1VBQVM7VUFBVTtVQUFZO1VBQU87VUFBTztVQUN2RTtVQUFVO1VBQVE7VUFBUztVQUMzQjtVQUFTO1VBQVM7VUFDbEI7VUFBUTtVQUFLO1VBQUs7VUFDbEI7VUFBTTtVQUFLO1FBQ2I7QUFDQSxjQUFNLFFBQVEsQ0FBQyxPQUFPLEtBQUssR0FBRyxDQUFDLEVBQUU7VUFDL0IsT0FBTyxJQUFJLENBQUEsTUFBSztZQUNkLEVBQUU7WUFBUyxFQUFFO1lBQU0sRUFBRTtZQUFZLEVBQUU7WUFBWSxFQUFFO1lBQWMsRUFBRTtZQUFZLEVBQUU7WUFBZSxFQUFFO1lBQW1CLEVBQUU7WUFDckgsRUFBRTtZQUFVLEVBQUU7WUFBYSxFQUFFO1lBQWMsRUFBRTtZQUM3QyxFQUFFO1lBQW9CLEVBQUU7WUFBYyxFQUFFO1lBQ3hDLEVBQUU7WUFBVyxFQUFFO1lBQVcsRUFBRTtZQUFZLEVBQUU7WUFDMUMsRUFBRTtZQUFTLEVBQUU7WUFBTyxFQUFFO1VBQ3hCLEVBQ0csSUFBSSxDQUFBLE1BQUssT0FBTyxLQUFLLEVBQUUsRUFBRSxRQUFRLE1BQU0sSUFBSSxDQUFDLEVBQzVDLElBQUksQ0FBQSxNQUFLLFNBQVMsS0FBSyxDQUFDLElBQUksTUFBTSxJQUFJLE1BQU0sQ0FBQyxFQUM3QyxLQUFLLEdBQUcsQ0FBQztRQUNkO0FBQ0EsY0FBTSxNQUFNLFdBQVcsTUFBTSxLQUFLLElBQUk7QUFDdEMsY0FBTSxZQUFZLG9CQUFvQixLQUFLLElBQUksQ0FBQztBQUNoRCxZQUFJLGFBQWE7QUFDakIsWUFBSSxVQUFVLGdCQUFnQix5QkFBeUI7QUFDdkQsWUFBSSxVQUFVLHVCQUF1Qix5QkFBeUIsU0FBUyxHQUFHO0FBQzFFLFlBQUksSUFBSSxHQUFHO01BQ2IsU0FBUyxHQUFHO0FBQ1YsWUFBSSxhQUFhO0FBQ2pCLFlBQUksVUFBVSxnQkFBZ0Isa0JBQWtCO0FBQ2hELFlBQUksSUFBSSxLQUFLLFVBQVUsRUFBRSxNQUFNLEdBQUcsS0FBSywyQkFBTyxDQUFDLENBQUM7TUFDbEQ7SUFDRjtFQUNGOztFQUVBO0lBQ0UsS0FBSztJQUNMLFFBQVE7SUFDUixVQUFVLENBQUMsRUFBRSxNQUFNLE1BQU07QUFDdkIsWUFBTSxPQUFPLE9BQU8sS0FBSyxDQUFBLE1BQUssRUFBRSxNQUFNLE1BQU0sRUFBRTtBQUM5QyxhQUFPLEVBQUUsTUFBTSxPQUFPLElBQUksR0FBRyxNQUFNLFFBQVEsS0FBSztJQUNsRDtFQUNGOztFQUVBO0lBQ0UsS0FBSztJQUNMLFFBQVE7SUFDUixVQUFVLENBQUMsRUFBRSxLQUFLLE1BQU07QUFDdEIsWUFBTSxLQUFLLEtBQUssSUFBSSxHQUFHLEdBQUcsT0FBTyxJQUFJLENBQUEsTUFBSyxFQUFFLEVBQUUsQ0FBQyxJQUFJO0FBQ25ELFlBQU0sVUFBVSxPQUFPLE1BQU0sV0FBVyxFQUFFLEVBQUUsS0FBSztBQUVqRCxZQUFNLFVBQVUsTUFBTTtBQUNwQixjQUFNLE9BQU8sT0FDVixJQUFJLENBQUEsTUFBSyxPQUFPLEVBQUUsUUFBUSxFQUFFLENBQUMsRUFDN0IsSUFBSSxDQUFBLE1BQU0sRUFBRSxXQUFXLE1BQU0sSUFBSSxTQUFTLEVBQUUsTUFBTSxDQUFDLEdBQUcsRUFBRSxJQUFJLEdBQUksRUFDaEUsT0FBTyxDQUFBLE1BQUssT0FBTyxTQUFTLENBQUMsQ0FBQztBQUNqQyxjQUFNLFFBQVEsS0FBSyxTQUFTLEtBQUssSUFBSSxHQUFHLElBQUksSUFBSSxLQUFLO0FBQ3JELGVBQU8sU0FBUyxPQUFPLElBQUksRUFBRSxTQUFTLEdBQUcsR0FBRztNQUM5QztBQUNBLFlBQU0sT0FBTyxPQUFPLE1BQU0sUUFBUSxFQUFFLEVBQUUsS0FBSyxLQUFLLFFBQVE7QUFDeEQsVUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTO0FBQ3JCLGVBQU8sRUFBRSxNQUFNLEdBQUcsS0FBSywyRUFBZTtNQUN4QztBQUVBLFlBQU0sVUFBVSxPQUFPLEtBQUssQ0FBQSxNQUFLLEVBQUUsWUFBWSxXQUFXLEVBQUUsU0FBUyxJQUFJO0FBQ3pFLFVBQUksU0FBUztBQUNYLGVBQU8sRUFBRSxNQUFNLEdBQUcsTUFBTSxTQUFTLEtBQUssOEZBQW1CO01BQzNEO0FBQ0EsWUFBTSxPQUFPLEVBQUUsSUFBSSxHQUFHLE1BQU0sS0FBSztBQUNqQyxhQUFPLEtBQUssSUFBSTtBQUNoQixjQUFRO0FBQ1IsYUFBTyxFQUFFLE1BQU0sR0FBRyxNQUFNLE1BQU0sS0FBSywyQkFBTztJQUM1QztFQUNGOztFQUVBO0lBQ0UsS0FBSztJQUNMLFFBQVE7SUFDUixVQUFVLENBQUMsRUFBRSxLQUFLLE1BQU07QUFDdEIsWUFBTSxNQUFNLE9BQU8sVUFBVSxDQUFBLE1BQUssRUFBRSxNQUFNLEtBQUssRUFBRTtBQUNqRCxVQUFJLFFBQVEsR0FBSSxRQUFPLEVBQUUsTUFBTSxHQUFHLEtBQUsscUJBQU07QUFFN0MsWUFBTSxPQUFPLE9BQU8sTUFBTSxRQUFRLE9BQU8sR0FBRyxFQUFFLElBQUksRUFBRSxLQUFLO0FBQ3pELFlBQU0sVUFBVSxPQUFPLE1BQU0sV0FBVyxPQUFPLEdBQUcsRUFBRSxPQUFPLEVBQUUsS0FBSztBQUNsRSxZQUFNLE1BQU0sT0FBTyxLQUFLLENBQUEsTUFBSyxFQUFFLFlBQVksV0FBVyxFQUFFLFNBQVMsUUFBUSxFQUFFLE9BQU8sT0FBTyxHQUFHLEVBQUUsRUFBRTtBQUNoRyxVQUFJLEtBQUs7QUFDUCxlQUFPLEVBQUUsTUFBTSxHQUFHLEtBQUssb0RBQVk7TUFDckM7QUFDQSxhQUFPLEdBQUcsSUFBSSxFQUFFLEdBQUcsT0FBTyxHQUFHLEdBQUcsR0FBRyxNQUFNLE1BQU0sUUFBUTtBQUN2RCxjQUFRO0FBQ1IsYUFBTyxFQUFFLE1BQU0sR0FBRyxNQUFNLE9BQU8sR0FBRyxHQUFHLEtBQUssMkJBQU87SUFDbkQ7RUFDRjs7RUFFQTtJQUNFLEtBQUs7SUFDTCxRQUFRO0lBQ1IsVUFBVSxDQUFDLEVBQUUsS0FBSyxNQUFNO0FBQ3RCLGVBQVMsT0FBTyxPQUFPLENBQUEsTUFBSyxFQUFFLE1BQU0sS0FBSyxFQUFFO0FBQzNDLGNBQVE7QUFDUixhQUFPLEVBQUUsTUFBTSxHQUFHLEtBQUssMkJBQU87SUFDaEM7RUFDRjtBQUNGOyIsCiAgIm5hbWVzIjogW10KfQo=
