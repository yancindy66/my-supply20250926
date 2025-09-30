// mock/____inventory-owner.bundled_1757937163273_beoflfe4tz5.bundled_1757986258360_ylzhqtljnn9.bundled_1757987818231_52r40t4u5uk.bundled_1759216347192_0txdcn0bdsn.mjs
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
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsibW9jay9tb2NrL21vY2svbW9jay9tb2NrL2ludmVudG9yeS1vd25lci5qcyJdLAogICJzb3VyY2VzQ29udGVudCI6IFsiY29uc3QgX19pbmplY3RlZF9maWxlbmFtZV9fID0gXCJFOlxcXFxteS1zdXBwbHlcXFxcbXlcXFxcbW9ja1xcXFxpbnZlbnRvcnktb3duZXIuanNcIjtjb25zdCBfX2luamVjdGVkX2Rpcm5hbWVfXyA9IFwiRTpcXFxcbXktc3VwcGx5XFxcXG15XFxcXG1vY2tcIjtjb25zdCBfX2luamVjdGVkX2ltcG9ydF9tZXRhX3VybF9fID0gXCJmaWxlOi8vL0U6L215LXN1cHBseS9teS9tb2NrL2ludmVudG9yeS1vd25lci5qc1wiO2ltcG9ydCBmcyBmcm9tICdmcyc7XHJcbmltcG9ydCBwYXRoIGZyb20gJ3BhdGgnO1xyXG5cclxuY29uc3QgZGF0YURpciA9IHBhdGgucmVzb2x2ZShwcm9jZXNzLmN3ZCgpLCAnbW9jaycsICdkYXRhJyk7XHJcbmNvbnN0IGRhdGFGaWxlID0gcGF0aC5yZXNvbHZlKGRhdGFEaXIsICdpbnZlbnRvcnktb3duZXJzLmpzb24nKTtcclxuXHJcbmZ1bmN0aW9uIGVuc3VyZURhdGFEaXIoKSB7XHJcbiAgdHJ5IHsgaWYgKCFmcy5leGlzdHNTeW5jKGRhdGFEaXIpKSBmcy5ta2RpclN5bmMoZGF0YURpciwgeyByZWN1cnNpdmU6IHRydWUgfSk7IH0gY2F0Y2gge31cclxufVxyXG5mdW5jdGlvbiBsb2FkRnJvbUZpbGUoKSB7XHJcbiAgdHJ5IHtcclxuICAgIGlmIChmcy5leGlzdHNTeW5jKGRhdGFGaWxlKSkge1xyXG4gICAgICBjb25zdCByYXcgPSBmcy5yZWFkRmlsZVN5bmMoZGF0YUZpbGUsICd1dGY4Jyk7XHJcbiAgICAgIGNvbnN0IGpzb24gPSBKU09OLnBhcnNlKHJhdyk7XHJcbiAgICAgIGlmIChBcnJheS5pc0FycmF5KGpzb24pKSByZXR1cm4ganNvbjtcclxuICAgIH1cclxuICB9IGNhdGNoIHt9XHJcbiAgcmV0dXJuIG51bGw7XHJcbn1cclxuZnVuY3Rpb24gc2F2ZVRvRmlsZShkYXRhKSB7XHJcbiAgdHJ5IHtcclxuICAgIGVuc3VyZURhdGFEaXIoKTtcclxuICAgIGZzLndyaXRlRmlsZVN5bmMoZGF0YUZpbGUsIEpTT04uc3RyaW5naWZ5KGRhdGEsIG51bGwsIDIpLCAndXRmOCcpO1xyXG4gIH0gY2F0Y2gge31cclxufVxyXG5cclxubGV0IG93bmVycyA9IFtcclxuICB7IGlkOiAxLCBjb21wYW55OiAnXHU5QjU0XHU1MjlCXHU3OUQxXHU2MjgwJywgY29kZTogJ0MwMDEnLFxyXG4gICAgY3JlZGl0Q29kZTogJzkxMzEwMDAwTUExS1hYWFhYJywgcmVnQWRkcmVzczogJ1x1NEUwQVx1NkQ3N1x1NUUwMlx1NkQ2Nlx1NEUxQ1x1NjVCMFx1NTMzQScsIGxlZ2FsUmVwTmFtZTogJ1x1NzM4Qlx1NUYzQScsIGxlZ2FsUmVwSWQ6ICczMTAxKioqKioqKioqKjEyMzQnLCBlc3RhYmxpc2hEYXRlOiAnMjAxNS0wNi0wMScsIHJlZ2lzdGVyZWRDYXBpdGFsOiAnNTAwMFx1NEUwN1x1NEVCQVx1NkMxMVx1NUUwMScsIGJ1c2luZXNzU2NvcGU6ICdcdThCQTFcdTdCOTdcdTY3M0FcdThGNkZcdTc4NkNcdTRFRjZcdTMwMDFcdTRGRTFcdTYwNkZcdTdDRkJcdTdFREZcdTk2QzZcdTYyMTAnLFxyXG4gICAgYmFua05hbWU6ICdcdTRFMkRcdTU2RkRcdTVERTVcdTU1NDZcdTk0RjZcdTg4NENcdTRFMEFcdTZENzdcdTUyMDZcdTg4NEMnLCBiYW5rQWNjb3VudDogJzYyMjIqKioqKioqKiowMDEnLCBjb21wYW55RW1haWw6ICdpbmZvQG1hZ2ljLmNvbScsIGNvbXBhbnlQaG9uZTogJzAyMS04ODg4ODg4OCcsXHJcbiAgICBhbm51YWxSZXZlbnVlUmFuZ2U6ICc1MDAwLTEwMDAwXHU0RTA3JywgbWFpbkJ1c2luZXNzOiAnXHU4RjZGXHU0RUY2XHU1RjAwXHU1M0QxXHU0RTBFXHU4RkQwXHU3RUY0XHU2NzBEXHU1MkExJywgcGFydG5lcnM6ICdcdTk4N0FcdTRFMzAsXHU0RUFDXHU0RTFDXHU3MjY5XHU2RDQxJyxcclxuICAgIGFkbWluTmFtZTogJ1x1NTIxOFx1NEYxRicsIGFkbWluRGVwdDogJ1x1NEZFMVx1NjA2Rlx1OTBFOCcsIGFkbWluVGl0bGU6ICdcdThGRDBcdTdFRjRcdTdFQ0ZcdTc0MDYnLCBhZG1pblBob25lOiAnMTM5MDAwMDAwMDInLFxyXG4gICAgY29udGFjdDogJ1x1NUYyMFx1NEUwOScsIHBob25lOiAnMTM4MDAwMDAwMDAnLCBhZGRyZXNzOiAnXHU0RTBBXHU2RDc3XHU1RTAyXHU2RDY2XHU0RTFDXHU2NUIwXHU1MzNBJywgbGljZW5zZTogJ1x1ODQyNVx1NEUxQVx1NjI2N1x1NzE2N0EnLCBsZWdhbElkRnJvbnQ6ICdcdTZDRDVcdTRFQkFcdThCQzFcdTUyNERBJywgbGVnYWxJZEJhY2s6ICdcdTZDRDVcdTRFQkFcdThCQzFcdTU0MEVBJywgYmFua1Blcm1pdDogJ1x1NUYwMFx1NjIzN1x1OEJCOFx1NTNFRlx1NEVFNUEnLCBhdXRoTGV0dGVyOiAnXHU2Mzg4XHU2NzQzXHU0RTY2QScsIHNlYWw6ICdcdTUxNkNcdTdBRTBBJyB9LFxyXG4gIHsgaWQ6IDIsIGNvbXBhbnk6ICdcdTk4REVcdTU5MjlcdTcyNjlcdTZENDEnLCBjb2RlOiAnQzAwMicsXHJcbiAgICBjcmVkaXRDb2RlOiAnOTEzMTAwMDBNQTJLWVlZWVknLCByZWdBZGRyZXNzOiAnXHU1MzE3XHU0RUFDXHU1RTAyXHU2NzFEXHU5NjMzXHU1MzNBJywgbGVnYWxSZXBOYW1lOiAnXHU2NzRFXHU2NTRGJywgbGVnYWxSZXBJZDogJzExMDEqKioqKioqKioqNTY3OCcsIGVzdGFibGlzaERhdGU6ICcyMDE4LTAzLTE1JywgcmVnaXN0ZXJlZENhcGl0YWw6ICcyMDAwXHU0RTA3XHU0RUJBXHU2QzExXHU1RTAxJywgYnVzaW5lc3NTY29wZTogJ1x1OEZEMFx1OEY5M1x1NEUwRVx1NEVEM1x1NTBBOFx1NjcwRFx1NTJBMScsXHJcbiAgICBiYW5rTmFtZTogJ1x1NEUyRFx1NTZGRFx1NTE5Q1x1NEUxQVx1OTRGNlx1ODg0Q1x1NTMxN1x1NEVBQ1x1NTIwNlx1ODg0QycsIGJhbmtBY2NvdW50OiAnNjIyOCoqKioqKioqKjAwMicsIGNvbXBhbnlFbWFpbDogJ2NvbnRhY3RAZmx5LmNvbScsIGNvbXBhbnlQaG9uZTogJzAxMC02NjY2NjY2NicsXHJcbiAgICBhbm51YWxSZXZlbnVlUmFuZ2U6ICcxMDAwLTMwMDBcdTRFMDcnLCBtYWluQnVzaW5lc3M6ICdcdTcyNjlcdTZENDFcdThGRDBcdThGOTMnLCBwYXJ0bmVyczogJ1x1NUZCN1x1OTBBNixcdTRFQUNcdTRFMUNcdTRFRDMnLFxyXG4gICAgYWRtaW5OYW1lOiAnXHU4RDc1XHU0RTkxJywgYWRtaW5EZXB0OiAnXHU4RkQwXHU4NDI1XHU5MEU4JywgYWRtaW5UaXRsZTogJ1x1NEUzQlx1N0JBMScsIGFkbWluUGhvbmU6ICcxMzcwMDAwMDAwMScsXHJcbiAgICBjb250YWN0OiAnXHU2NzRFXHU1NkRCJywgcGhvbmU6ICcxMzkwMDAwMDAwMScsIGFkZHJlc3M6ICdcdTUzMTdcdTRFQUNcdTVFMDJcdTY3MURcdTk2MzNcdTUzM0EnLCBsaWNlbnNlOiAnXHU4NDI1XHU0RTFBXHU2MjY3XHU3MTY3QicsIGxlZ2FsSWRGcm9udDogJ1x1NkNENVx1NEVCQVx1OEJDMVx1NTI0REInLCBsZWdhbElkQmFjazogJ1x1NkNENVx1NEVCQVx1OEJDMVx1NTQwRUInLCBiYW5rUGVybWl0OiAnXHU1RjAwXHU2MjM3XHU4QkI4XHU1M0VGQicsIGF1dGhMZXR0ZXI6ICdcdTYzODhcdTY3NDNcdTRFNjZCJywgc2VhbDogJ1x1NTE2Q1x1N0FFMEInIH1cclxuXTtcclxuXHJcbmNvbnN0IGZpbGVEYXRhID0gbG9hZEZyb21GaWxlKCk7XHJcbmlmIChmaWxlRGF0YSkgb3duZXJzID0gZmlsZURhdGE7XHJcbmZ1bmN0aW9uIHBlcnNpc3QoKSB7IHNhdmVUb0ZpbGUob3duZXJzKTsgfVxyXG5cclxuZXhwb3J0IGRlZmF1bHQgW1xyXG4gIC8vIFx1NTIxN1x1ODg2OFxyXG4gIHtcclxuICAgIHVybDogJy9hcGkvaW52ZW50b3J5LW93bmVyL2xpc3QnLFxyXG4gICAgbWV0aG9kOiAnZ2V0JyxcclxuICAgIHJlc3BvbnNlOiAoeyBxdWVyeSB9KSA9PiB7XHJcbiAgICAgIGNvbnN0IGtleXdvcmQgPSAocXVlcnk/LmtleXdvcmQgfHwgJycpLnRvU3RyaW5nKCkudHJpbSgpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgIGNvbnN0IHBhZ2UgPSBwYXJzZUludChxdWVyeT8ucGFnZSB8fCAnMScsIDEwKSB8fCAxO1xyXG4gICAgICBjb25zdCBwYWdlU2l6ZSA9IHBhcnNlSW50KHF1ZXJ5Py5wYWdlU2l6ZSB8fCAnMTAnLCAxMCkgfHwgMTA7XHJcbiAgICAgIGNvbnN0IHNvcnRCeSA9IChxdWVyeT8uc29ydEJ5IHx8ICcnKS50b1N0cmluZygpO1xyXG4gICAgICBjb25zdCBzb3J0T3JkZXIgPSAocXVlcnk/LnNvcnRPcmRlciB8fCAnYXNjJykudG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpID09PSAnZGVzYycgPyAnZGVzYycgOiAnYXNjJztcclxuXHJcbiAgICAgIGNvbnN0IGZpbHRlcmVkID0ga2V5d29yZFxyXG4gICAgICAgID8gb3duZXJzLmZpbHRlcihvID0+IFtvLmNvbXBhbnksIG8uY29kZSwgby5jcmVkaXRDb2RlLCBvLmNvbnRhY3QsIG8ucGhvbmUsIG8uY29tcGFueVBob25lLCBvLmFkZHJlc3MsIG8ucmVnQWRkcmVzc11cclxuICAgICAgICAgICAgLnNvbWUodiA9PiBTdHJpbmcodiB8fCAnJykudG9Mb3dlckNhc2UoKS5pbmNsdWRlcyhrZXl3b3JkKSkpXHJcbiAgICAgICAgOiBvd25lcnM7XHJcblxyXG4gICAgICBjb25zdCBzb3J0YWJsZUZpZWxkcyA9IG5ldyBTZXQoWydpZCcsJ2NvbXBhbnknLCdjb2RlJywnY3JlZGl0Q29kZScsJ2NvbnRhY3QnLCdwaG9uZScsJ2NvbXBhbnlQaG9uZScsJ2FkZHJlc3MnLCdyZWdBZGRyZXNzJywnbGljZW5zZSddKTtcclxuICAgICAgY29uc3Qgc29ydGVkID0gKHNvcnRCeSAmJiBzb3J0YWJsZUZpZWxkcy5oYXMoc29ydEJ5KSkgPyBbLi4uZmlsdGVyZWRdLnNvcnQoKGEsIGIpID0+IHtcclxuICAgICAgICBjb25zdCBhdiA9IGFbc29ydEJ5XTtcclxuICAgICAgICBjb25zdCBidiA9IGJbc29ydEJ5XTtcclxuICAgICAgICBpZiAodHlwZW9mIGF2ID09PSAnbnVtYmVyJyAmJiB0eXBlb2YgYnYgPT09ICdudW1iZXInKSB7XHJcbiAgICAgICAgICByZXR1cm4gc29ydE9yZGVyID09PSAnYXNjJyA/IGF2IC0gYnYgOiBidiAtIGF2O1xyXG4gICAgICAgIH1cclxuICAgICAgICBjb25zdCBhcyA9IFN0cmluZyhhdiA/PyAnJykudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICBjb25zdCBicyA9IFN0cmluZyhidiA/PyAnJykudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICBpZiAoYXMgPT09IGJzKSByZXR1cm4gMDtcclxuICAgICAgICByZXR1cm4gc29ydE9yZGVyID09PSAnYXNjJyA/IChhcyA+IGJzID8gMSA6IC0xKSA6IChhcyA8IGJzID8gMSA6IC0xKTtcclxuICAgICAgfSkgOiBmaWx0ZXJlZDtcclxuXHJcbiAgICAgIGNvbnN0IHRvdGFsID0gc29ydGVkLmxlbmd0aDtcclxuICAgICAgY29uc3Qgc3RhcnQgPSAocGFnZSAtIDEpICogcGFnZVNpemU7XHJcbiAgICAgIGNvbnN0IGxpc3QgPSBzb3J0ZWQuc2xpY2Uoc3RhcnQsIHN0YXJ0ICsgcGFnZVNpemUpO1xyXG5cclxuICAgICAgcmV0dXJuIHsgY29kZTogMCwgZGF0YTogeyBsaXN0LCB0b3RhbCwgcGFnZSwgcGFnZVNpemUgfSB9O1xyXG4gICAgfVxyXG4gIH0sXHJcbiAgLy8gXHU2NTg3XHU0RUY2XHU0RTBCXHU4RjdEXHVGRjA4bGljZW5zZS9zZWFsIFx1NTM2MFx1NEY0RFx1RkYwOVxyXG4gIHtcclxuICAgIHVybDogJy9hcGkvaW52ZW50b3J5LW93bmVyL2ZpbGUnLFxyXG4gICAgbWV0aG9kOiAnZ2V0JyxcclxuICAgIHJhd1Jlc3BvbnNlOiBhc3luYyAocmVxLCByZXMpID0+IHtcclxuICAgICAgY29uc3QgeyBVUkwgfSA9IGF3YWl0IGltcG9ydCgndXJsJyk7XHJcbiAgICAgIGNvbnN0IHUgPSBuZXcgVVJMKHJlcS51cmwsICdodHRwOi8vbG9jYWxob3N0Jyk7XHJcbiAgICAgIGNvbnN0IGlkID0gdS5zZWFyY2hQYXJhbXMuZ2V0KCdpZCcpO1xyXG4gICAgICBjb25zdCB0eXBlID0gdS5zZWFyY2hQYXJhbXMuZ2V0KCd0eXBlJyk7XHJcbiAgICAgIGNvbnN0IGZpbGVuYW1lID0gdS5zZWFyY2hQYXJhbXMuZ2V0KCdmaWxlbmFtZScpIHx8IGAke3R5cGUgfHwgJ2ZpbGUnfS0ke2lkIHx8ICcnfS5wbmdgO1xyXG4gICAgICBjb25zdCBvd25lciA9IG93bmVycy5maW5kKG8gPT4gU3RyaW5nKG8uaWQpID09PSBTdHJpbmcoaWQpKTtcclxuICAgICAgaWYgKCFvd25lcikge1xyXG4gICAgICAgIHJlcy5zdGF0dXNDb2RlID0gNDA0O1xyXG4gICAgICAgIHJlcy5zZXRIZWFkZXIoJ0NvbnRlbnQtVHlwZScsICdhcHBsaWNhdGlvbi9qc29uJyk7XHJcbiAgICAgICAgcmVzLmVuZChKU09OLnN0cmluZ2lmeSh7IGNvZGU6IDEsIG1zZzogJ1x1NjcyQVx1NjI3RVx1NTIzMCcgfSkpO1xyXG4gICAgICAgIHJldHVybjtcclxuICAgICAgfVxyXG4gICAgICBjb25zdCBsYWJlbCA9IGAke293bmVyLmNvbXBhbnl9IC8gJHt0eXBlIHx8ICcnfWA7XHJcbiAgICAgIGNvbnN0IHN1YiA9IFN0cmluZyhvd25lclt0eXBlXSB8fCBmaWxlbmFtZSk7XHJcbiAgICAgIC8vIFx1NzUxRlx1NjIxMFx1NTE4NVx1NUQ0QyBTVkcgXHU5ODg0XHU4OUM4XHU1NkZFXHJcbiAgICAgIGNvbnN0IHN2ZyA9IGA8P3htbCB2ZXJzaW9uPVwiMS4wXCIgZW5jb2Rpbmc9XCJVVEYtOFwiPz5cclxuPHN2ZyB4bWxucz0naHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmcnIHdpZHRoPSc0MjAnIGhlaWdodD0nMjYwJz5cclxuICA8ZGVmcz5cclxuICAgIDxsaW5lYXJHcmFkaWVudCBpZD0nZycgeDE9JzAnIHkxPScwJyB4Mj0nMScgeTI9JzEnPlxyXG4gICAgICA8c3RvcCBvZmZzZXQ9JzAlJyBzdG9wLWNvbG9yPScjZjFmNWY5Jy8+XHJcbiAgICAgIDxzdG9wIG9mZnNldD0nMTAwJScgc3RvcC1jb2xvcj0nI2UyZThmMCcvPlxyXG4gICAgPC9saW5lYXJHcmFkaWVudD5cclxuICA8L2RlZnM+XHJcbiAgPHJlY3QgeD0nMCcgeT0nMCcgd2lkdGg9JzEwMCUnIGhlaWdodD0nMTAwJScgZmlsbD0ndXJsKCNnKScvPlxyXG4gIDxyZWN0IHg9JzEwJyB5PScxMCcgd2lkdGg9JzQwMCcgaGVpZ2h0PScyNDAnIHJ4PScxMicgcnk9JzEyJyBmaWxsPScjZmZmZmZmJyBzdHJva2U9JyM5NGEzYjgnLz5cclxuICA8dGV4dCB4PSczMCcgeT0nOTAnIGZvbnQtc2l6ZT0nMTgnIGZpbGw9JyMwZjE3MmEnPiR7bGFiZWx9PC90ZXh0PlxyXG4gIDx0ZXh0IHg9JzMwJyB5PScxMzAnIGZvbnQtc2l6ZT0nMTQnIGZpbGw9JyMzMzQxNTUnPiR7c3VifTwvdGV4dD5cclxuICA8dGV4dCB4PSczMCcgeT0nMTcwJyBmb250LXNpemU9JzEyJyBmaWxsPScjNjQ3NDhiJz5Nb2NrIFByZXZpZXc8L3RleHQ+XHJcbjwvc3ZnPmA7XHJcbiAgICAgIGNvbnN0IGFzY2lpRmFsbGJhY2sgPSAoU3RyaW5nKGZpbGVuYW1lKS5tYXRjaCgvW1xceDAwLVxceDdGXSsvZykgfHwgWydwcmV2aWV3LnN2ZyddKS5qb2luKCcnKSB8fCAncHJldmlldy5zdmcnO1xyXG4gICAgICByZXMuc3RhdHVzQ29kZSA9IDIwMDtcclxuICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ2ltYWdlL3N2Zyt4bWw7IGNoYXJzZXQ9dXRmLTgnKTtcclxuICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1EaXNwb3NpdGlvbicsIGBpbmxpbmU7IGZpbGVuYW1lPVwiJHthc2NpaUZhbGxiYWNrfVwiYCk7XHJcbiAgICAgIHJlcy5lbmQoc3ZnKTtcclxuICAgIH1cclxuICB9LFxyXG4gIC8vIFx1NUJGQ1x1NTFGQUNTVlx1RkYwOFx1NjcwRFx1NTJBMVx1N0FFRlx1NzUxRlx1NjIxMFx1RkYwOVxyXG4gIHtcclxuICAgIHVybDogJy9hcGkvaW52ZW50b3J5LW93bmVyL2V4cG9ydCcsXHJcbiAgICBtZXRob2Q6ICdnZXQnLFxyXG4gICAgcmF3UmVzcG9uc2U6IGFzeW5jIChyZXEsIHJlcykgPT4ge1xyXG4gICAgICB0cnkge1xyXG4gICAgICAgIGNvbnN0IHsgVVJMIH0gPSBhd2FpdCBpbXBvcnQoJ3VybCcpO1xyXG4gICAgICAgIGNvbnN0IHUgPSBuZXcgVVJMKHJlcS51cmwsICdodHRwOi8vbG9jYWxob3N0Jyk7XHJcbiAgICAgICAgY29uc3Qga2V5d29yZCA9ICh1LnNlYXJjaFBhcmFtcy5nZXQoJ2tleXdvcmQnKSB8fCAnJykudG9TdHJpbmcoKS50cmltKCkudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICBjb25zdCBzb3J0QnkgPSAodS5zZWFyY2hQYXJhbXMuZ2V0KCdzb3J0QnknKSB8fCAnJykudG9TdHJpbmcoKTtcclxuICAgICAgICBjb25zdCBzb3J0T3JkZXIgPSAodS5zZWFyY2hQYXJhbXMuZ2V0KCdzb3J0T3JkZXInKSB8fCAnYXNjJykudG9TdHJpbmcoKS50b0xvd2VyQ2FzZSgpID09PSAnZGVzYycgPyAnZGVzYycgOiAnYXNjJztcclxuXHJcbiAgICAgICAgY29uc3QgZmlsdGVyZWQgPSBrZXl3b3JkXHJcbiAgICAgICAgICA/IG93bmVycy5maWx0ZXIobyA9PiBbby5jb21wYW55LCBvLmNvZGUsIG8uY3JlZGl0Q29kZSwgby5yZWdBZGRyZXNzLCBvLmxlZ2FsUmVwTmFtZSwgby5sZWdhbFJlcElkLCBvLnJlZ2lzdGVyZWRDYXBpdGFsLCBvLmJ1c2luZXNzU2NvcGUsIG8uYmFua05hbWUsIG8uYmFua0FjY291bnQsIG8uY29tcGFueUVtYWlsLCBvLmNvbXBhbnlQaG9uZSwgby5hbm51YWxSZXZlbnVlUmFuZ2UsIG8ubWFpbkJ1c2luZXNzLCBvLnBhcnRuZXJzLCBvLmFkbWluTmFtZSwgby5hZG1pbkRlcHQsIG8uYWRtaW5UaXRsZSwgby5hZG1pblBob25lLCBvLmNvbnRhY3QsIG8ucGhvbmUsIG8uYWRkcmVzc11cclxuICAgICAgICAgICAgICAuc29tZSh2ID0+IFN0cmluZyh2IHx8ICcnKS50b0xvd2VyQ2FzZSgpLmluY2x1ZGVzKGtleXdvcmQpKSlcclxuICAgICAgICAgIDogb3duZXJzO1xyXG5cclxuICAgICAgICBjb25zdCBzb3J0YWJsZUZpZWxkcyA9IG5ldyBTZXQoWydpZCcsJ2NvbXBhbnknLCdjb2RlJywnY3JlZGl0Q29kZScsJ3JlZ0FkZHJlc3MnLCdsZWdhbFJlcE5hbWUnLCdsZWdhbFJlcElkJywncmVnaXN0ZXJlZENhcGl0YWwnLCdidXNpbmVzc1Njb3BlJywnYmFua05hbWUnLCdiYW5rQWNjb3VudCcsJ2NvbXBhbnlFbWFpbCcsJ2NvbXBhbnlQaG9uZScsJ2FubnVhbFJldmVudWVSYW5nZScsJ21haW5CdXNpbmVzcycsJ3BhcnRuZXJzJywnYWRtaW5OYW1lJywnYWRtaW5EZXB0JywnYWRtaW5UaXRsZScsJ2FkbWluUGhvbmUnLCdjb250YWN0JywncGhvbmUnLCdhZGRyZXNzJ10pO1xyXG4gICAgICAgIGNvbnN0IHNvcnRlZCA9IChzb3J0QnkgJiYgc29ydGFibGVGaWVsZHMuaGFzKHNvcnRCeSkpID8gWy4uLmZpbHRlcmVkXS5zb3J0KChhLCBiKSA9PiB7XHJcbiAgICAgICAgICBjb25zdCBhdiA9IGFbc29ydEJ5XTtcclxuICAgICAgICAgIGNvbnN0IGJ2ID0gYltzb3J0QnldO1xyXG4gICAgICAgICAgaWYgKHR5cGVvZiBhdiA9PT0gJ251bWJlcicgJiYgdHlwZW9mIGJ2ID09PSAnbnVtYmVyJykge1xyXG4gICAgICAgICAgICByZXR1cm4gc29ydE9yZGVyID09PSAnYXNjJyA/IGF2IC0gYnYgOiBidiAtIGF2O1xyXG4gICAgICAgICAgfVxyXG4gICAgICAgICAgY29uc3QgYXMgPSBTdHJpbmcoYXYgPz8gJycpLnRvTG93ZXJDYXNlKCk7XHJcbiAgICAgICAgICBjb25zdCBicyA9IFN0cmluZyhidiA/PyAnJykudG9Mb3dlckNhc2UoKTtcclxuICAgICAgICAgIGlmIChhcyA9PT0gYnMpIHJldHVybiAwO1xyXG4gICAgICAgICAgcmV0dXJuIHNvcnRPcmRlciA9PT0gJ2FzYycgPyAoYXMgPiBicyA/IDEgOiAtMSkgOiAoYXMgPCBicyA/IDEgOiAtMSk7XHJcbiAgICAgICAgfSkgOiBmaWx0ZXJlZDtcclxuXHJcbiAgICAgICAgY29uc3QgaGVhZGVyID0gW1xyXG4gICAgICAgICAgJ1x1NEYwMVx1NEUxQVx1NTQwRFx1NzlGMCcsJ1x1NUI1OFx1OEQyN1x1NEVCQVx1N0YxNlx1NzgwMScsJ1x1N0VERlx1NEUwMFx1NzkzRVx1NEYxQVx1NEZFMVx1NzUyOFx1NEVFM1x1NzgwMScsJ1x1NEYwMVx1NEUxQVx1NkNFOFx1NTE4Q1x1NTczMFx1NTc0MCcsJ1x1NkNENVx1NUI5QVx1NEVFM1x1ODg2OFx1NEVCQVx1NTlEM1x1NTQwRCcsJ1x1NkNENVx1NUI5QVx1NEVFM1x1ODg2OFx1NEVCQVx1OEVBQlx1NEVGRFx1OEJDMVx1NTNGNycsJ1x1NjIxMFx1N0FDQlx1NjVFNVx1NjcxRicsJ1x1NkNFOFx1NTE4Q1x1OEQ0NFx1NjcyQycsJ1x1N0VDRlx1ODQyNVx1ODMwM1x1NTZGNCcsXHJcbiAgICAgICAgICAnXHU1QkY5XHU1MTZDXHU4RDI2XHU2MjM3XHU1RjAwXHU2MjM3XHU4ODRDJywnXHU1QkY5XHU1MTZDXHU4RDI2XHU2MjM3XHU1M0Y3JywnXHU0RjAxXHU0RTFBXHU1RTM4XHU3NTI4XHU5MEFFXHU3QkIxJywnXHU0RjAxXHU0RTFBXHU4MDU0XHU3Q0ZCXHU3NTM1XHU4QkREJyxcclxuICAgICAgICAgICdcdTVFNzRcdTg0MjVcdTRFMUFcdTk4OURcdTgzMDNcdTU2RjQnLCdcdTRFM0JcdTg0MjVcdTRFMUFcdTUyQTFcdTgzMDNcdTU2RjQnLCdcdTVFMzhcdTc1MjhcdTU0MDhcdTRGNUNcdTY1QjknLFxyXG4gICAgICAgICAgJ1x1N0JBMVx1NzQwNlx1NTQ1OFx1NTlEM1x1NTQwRCcsJ1x1OTBFOFx1OTVFOCcsJ1x1ODA0Q1x1NEY0RCcsJ1x1N0JBMVx1NzQwNlx1NTQ1OFx1NjI0Qlx1NjczQVx1NTNGNycsXHJcbiAgICAgICAgICAnXHU4MDU0XHU3Q0ZCXHU0RUJBJywnXHU3NTM1XHU4QkREJywnXHU1NzMwXHU1NzQwJ1xyXG4gICAgICAgIF07XHJcbiAgICAgICAgY29uc3QgbGluZXMgPSBbaGVhZGVyLmpvaW4oJywnKV0uY29uY2F0KFxyXG4gICAgICAgICAgc29ydGVkLm1hcChyID0+IFtcclxuICAgICAgICAgICAgci5jb21wYW55LCByLmNvZGUsIHIuY3JlZGl0Q29kZSwgci5yZWdBZGRyZXNzLCByLmxlZ2FsUmVwTmFtZSwgci5sZWdhbFJlcElkLCByLmVzdGFibGlzaERhdGUsIHIucmVnaXN0ZXJlZENhcGl0YWwsIHIuYnVzaW5lc3NTY29wZSxcclxuICAgICAgICAgICAgci5iYW5rTmFtZSwgci5iYW5rQWNjb3VudCwgci5jb21wYW55RW1haWwsIHIuY29tcGFueVBob25lLFxyXG4gICAgICAgICAgICByLmFubnVhbFJldmVudWVSYW5nZSwgci5tYWluQnVzaW5lc3MsIHIucGFydG5lcnMsXHJcbiAgICAgICAgICAgIHIuYWRtaW5OYW1lLCByLmFkbWluRGVwdCwgci5hZG1pblRpdGxlLCByLmFkbWluUGhvbmUsXHJcbiAgICAgICAgICAgIHIuY29udGFjdCwgci5waG9uZSwgci5hZGRyZXNzXHJcbiAgICAgICAgICBdXHJcbiAgICAgICAgICAgIC5tYXAodiA9PiBTdHJpbmcodiA/PyAnJykucmVwbGFjZSgvXCIvZywgJ1wiXCInKSlcclxuICAgICAgICAgICAgLm1hcChzID0+IC9bXCIsXFxuXS8udGVzdChzKSA/ICdcIicgKyBzICsgJ1wiJyA6IHMpXHJcbiAgICAgICAgICAgIC5qb2luKCcsJykpXHJcbiAgICAgICAgKTtcclxuICAgICAgICBjb25zdCBjc3YgPSAnXFx1ZmVmZicgKyBsaW5lcy5qb2luKCdcXG4nKTtcclxuICAgICAgICBjb25zdCBhc2NpaU5hbWUgPSBgaW52ZW50b3J5LW93bmVycy0ke0RhdGUubm93KCl9LmNzdmA7XHJcbiAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSAyMDA7XHJcbiAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ3RleHQvY3N2OyBjaGFyc2V0PXV0Zi04Jyk7XHJcbiAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1EaXNwb3NpdGlvbicsIGBhdHRhY2htZW50OyBmaWxlbmFtZT1cIiR7YXNjaWlOYW1lfVwiYCk7XHJcbiAgICAgICAgcmVzLmVuZChjc3YpO1xyXG4gICAgICB9IGNhdGNoIChlKSB7XHJcbiAgICAgICAgcmVzLnN0YXR1c0NvZGUgPSA1MDA7XHJcbiAgICAgICAgcmVzLnNldEhlYWRlcignQ29udGVudC1UeXBlJywgJ2FwcGxpY2F0aW9uL2pzb24nKTtcclxuICAgICAgICByZXMuZW5kKEpTT04uc3RyaW5naWZ5KHsgY29kZTogMSwgbXNnOiAnXHU1QkZDXHU1MUZBXHU1OTMxXHU4RDI1JyB9KSk7XHJcbiAgICAgIH1cclxuICAgIH1cclxuICB9LFxyXG4gIC8vIFx1OEJFNlx1NjBDNVxyXG4gIHtcclxuICAgIHVybDogJy9hcGkvaW52ZW50b3J5LW93bmVyL2RldGFpbCcsXHJcbiAgICBtZXRob2Q6ICdnZXQnLFxyXG4gICAgcmVzcG9uc2U6ICh7IHF1ZXJ5IH0pID0+IHtcclxuICAgICAgY29uc3QgaXRlbSA9IG93bmVycy5maW5kKGQgPT4gZC5pZCA9PSBxdWVyeS5pZCk7XHJcbiAgICAgIHJldHVybiB7IGNvZGU6IGl0ZW0gPyAwIDogMSwgZGF0YTogaXRlbSB8fCBudWxsIH07XHJcbiAgICB9XHJcbiAgfSxcclxuICAvLyBcdTUyMUJcdTVFRkFcclxuICB7XHJcbiAgICB1cmw6ICcvYXBpL2ludmVudG9yeS1vd25lci9jcmVhdGUnLFxyXG4gICAgbWV0aG9kOiAncG9zdCcsXHJcbiAgICByZXNwb25zZTogKHsgYm9keSB9KSA9PiB7XHJcbiAgICAgIGNvbnN0IGlkID0gTWF0aC5tYXgoMCwgLi4ub3duZXJzLm1hcChvID0+IG8uaWQpKSArIDE7XHJcbiAgICAgIGNvbnN0IGNvbXBhbnkgPSBTdHJpbmcoYm9keT8uY29tcGFueSB8fCAnJykudHJpbSgpO1xyXG4gICAgICAvLyBcdTgxRUFcdTUyQThcdTc1MUZcdTYyMTBcdTdGMTZcdTc4MDFcdUZGMUFJTlYtMDAwMDEgXHU5MDEyXHU1ODlFXHJcbiAgICAgIGNvbnN0IGdlbk5leHQgPSAoKSA9PiB7XHJcbiAgICAgICAgY29uc3QgbnVtcyA9IG93bmVyc1xyXG4gICAgICAgICAgLm1hcChvID0+IFN0cmluZyhvLmNvZGUgfHwgJycpKVxyXG4gICAgICAgICAgLm1hcChjID0+IChjLnN0YXJ0c1dpdGgoJ0lOVi0nKSA/IHBhcnNlSW50KGMuc2xpY2UoNCksIDEwKSA6IE5hTikpXHJcbiAgICAgICAgICAuZmlsdGVyKG4gPT4gTnVtYmVyLmlzRmluaXRlKG4pKTtcclxuICAgICAgICBjb25zdCBuZXh0ID0gKG51bXMubGVuZ3RoID8gTWF0aC5tYXgoLi4ubnVtcykgOiAwKSArIDE7XHJcbiAgICAgICAgcmV0dXJuICdJTlYtJyArIFN0cmluZyhuZXh0KS5wYWRTdGFydCg1LCAnMCcpO1xyXG4gICAgICB9O1xyXG4gICAgICBjb25zdCBjb2RlID0gU3RyaW5nKGJvZHk/LmNvZGUgfHwgJycpLnRyaW0oKSB8fCBnZW5OZXh0KCk7XHJcbiAgICAgIGlmICghY29kZSB8fCAhY29tcGFueSkge1xyXG4gICAgICAgIHJldHVybiB7IGNvZGU6IDEsIG1zZzogJ1x1NTE2Q1x1NTNGOFx1NTQwRFx1NzlGMFx1NEUwRVx1NUI1OFx1OEQyN1x1NEVCQVx1N0YxNlx1NzgwMVx1NUZDNVx1NTg2QicgfTtcclxuICAgICAgfVxyXG4gICAgICAvLyBcdTU5MERcdTU0MDhcdTRFM0JcdTk1MkVcdUZGMUFjb21wYW55ICsgY29kZSBcdTUzQkJcdTkxQ0RcdUZGMDhcdTgyRTVcdTVCNThcdTU3MjhcdTUyMTlcdTc2RjRcdTYzQTVcdThGRDRcdTU2REVcdTVERjJcdTY3MDlcdThCQjBcdTVGNTVcdUZGMENcdTY1QjlcdTRGQkZcdTZGMTRcdTc5M0FcdUZGMDlcclxuICAgICAgY29uc3QgZXhpc3RlZCA9IG93bmVycy5maW5kKG8gPT4gby5jb21wYW55ID09PSBjb21wYW55ICYmIG8uY29kZSA9PT0gY29kZSk7XHJcbiAgICAgIGlmIChleGlzdGVkKSB7XHJcbiAgICAgICAgcmV0dXJuIHsgY29kZTogMCwgZGF0YTogZXhpc3RlZCwgbXNnOiAnXHU4QkU1XHU1MTZDXHU1M0Y4K1x1N0YxNlx1NzgwMVx1NURGMlx1NUI1OFx1NTcyOFx1RkYwQ1x1OEZENFx1NTZERVx1NzNCMFx1NjcwOVx1OEJCMFx1NUY1NScgfTtcclxuICAgICAgfVxyXG4gICAgICBjb25zdCBpdGVtID0geyBpZCwgLi4uYm9keSwgY29kZSB9O1xyXG4gICAgICBvd25lcnMucHVzaChpdGVtKTtcclxuICAgICAgcGVyc2lzdCgpO1xyXG4gICAgICByZXR1cm4geyBjb2RlOiAwLCBkYXRhOiBpdGVtLCBtc2c6ICdcdTUyMUJcdTVFRkFcdTYyMTBcdTUyOUYnIH07XHJcbiAgICB9XHJcbiAgfSxcclxuICAvLyBcdTY2RjRcdTY1QjBcclxuICB7XHJcbiAgICB1cmw6ICcvYXBpL2ludmVudG9yeS1vd25lci91cGRhdGUnLFxyXG4gICAgbWV0aG9kOiAncG9zdCcsXHJcbiAgICByZXNwb25zZTogKHsgYm9keSB9KSA9PiB7XHJcbiAgICAgIGNvbnN0IGlkeCA9IG93bmVycy5maW5kSW5kZXgobyA9PiBvLmlkID09IGJvZHkuaWQpO1xyXG4gICAgICBpZiAoaWR4ID09PSAtMSkgcmV0dXJuIHsgY29kZTogMSwgbXNnOiAnXHU2NzJBXHU2MjdFXHU1MjMwJyB9O1xyXG4gICAgICAvLyBcdTY2RjRcdTY1QjBcdTY1RjZcdTRFNUZcdTY4MjFcdTlBOENcdTU5MERcdTU0MDhcdTRFM0JcdTk1MkVcdTU1MkZcdTRFMDBcclxuICAgICAgY29uc3QgY29kZSA9IFN0cmluZyhib2R5Py5jb2RlID8/IG93bmVyc1tpZHhdLmNvZGUpLnRyaW0oKTtcclxuICAgICAgY29uc3QgY29tcGFueSA9IFN0cmluZyhib2R5Py5jb21wYW55ID8/IG93bmVyc1tpZHhdLmNvbXBhbnkpLnRyaW0oKTtcclxuICAgICAgY29uc3QgZHVwID0gb3duZXJzLmZpbmQobyA9PiBvLmNvbXBhbnkgPT09IGNvbXBhbnkgJiYgby5jb2RlID09PSBjb2RlICYmIG8uaWQgIT09IG93bmVyc1tpZHhdLmlkKTtcclxuICAgICAgaWYgKGR1cCkge1xyXG4gICAgICAgIHJldHVybiB7IGNvZGU6IDEsIG1zZzogJ1x1NTE2Q1x1NTNGOFx1NTQwRFx1NzlGMCtcdTdGMTZcdTc4MDFcdTkxQ0RcdTU5MEQnIH07XHJcbiAgICAgIH1cclxuICAgICAgb3duZXJzW2lkeF0gPSB7IC4uLm93bmVyc1tpZHhdLCAuLi5ib2R5LCBjb2RlLCBjb21wYW55IH07XHJcbiAgICAgIHBlcnNpc3QoKTtcclxuICAgICAgcmV0dXJuIHsgY29kZTogMCwgZGF0YTogb3duZXJzW2lkeF0sIG1zZzogJ1x1NjZGNFx1NjVCMFx1NjIxMFx1NTI5RicgfTtcclxuICAgIH1cclxuICB9LFxyXG4gIC8vIFx1NTIyMFx1OTY2NFxyXG4gIHtcclxuICAgIHVybDogJy9hcGkvaW52ZW50b3J5LW93bmVyL2RlbGV0ZScsXHJcbiAgICBtZXRob2Q6ICdwb3N0JyxcclxuICAgIHJlc3BvbnNlOiAoeyBib2R5IH0pID0+IHtcclxuICAgICAgb3duZXJzID0gb3duZXJzLmZpbHRlcihvID0+IG8uaWQgIT0gYm9keS5pZCk7XHJcbiAgICAgIHBlcnNpc3QoKTtcclxuICAgICAgcmV0dXJuIHsgY29kZTogMCwgbXNnOiAnXHU1MjIwXHU5NjY0XHU2MjEwXHU1MjlGJyB9O1xyXG4gICAgfVxyXG4gIH1cclxuXTtcclxuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUEwTixPQUFPLFFBQVE7QUFDek8sT0FBTyxVQUFVO0FBRWpCLElBQU0sVUFBVSxLQUFLLFFBQVEsUUFBUSxJQUFJLEdBQUcsUUFBUSxNQUFNO0FBQzFELElBQU0sV0FBVyxLQUFLLFFBQVEsU0FBUyx1QkFBdUI7QUFFOUQsU0FBUyxnQkFBZ0I7QUFDdkIsTUFBSTtBQUFFLFFBQUksQ0FBQyxHQUFHLFdBQVcsT0FBTyxFQUFHLElBQUcsVUFBVSxTQUFTLEVBQUUsV0FBVyxLQUFLLENBQUM7RUFBRyxRQUFRO0VBQUM7QUFDMUY7QUFDQSxTQUFTLGVBQWU7QUFDdEIsTUFBSTtBQUNGLFFBQUksR0FBRyxXQUFXLFFBQVEsR0FBRztBQUMzQixZQUFNLE1BQU0sR0FBRyxhQUFhLFVBQVUsTUFBTTtBQUM1QyxZQUFNLE9BQU8sS0FBSyxNQUFNLEdBQUc7QUFDM0IsVUFBSSxNQUFNLFFBQVEsSUFBSSxFQUFHLFFBQU87SUFDbEM7RUFDRixRQUFRO0VBQUM7QUFDVCxTQUFPO0FBQ1Q7QUFDQSxTQUFTLFdBQVcsTUFBTTtBQUN4QixNQUFJO0FBQ0Ysa0JBQWM7QUFDZCxPQUFHLGNBQWMsVUFBVSxLQUFLLFVBQVUsTUFBTSxNQUFNLENBQUMsR0FBRyxNQUFNO0VBQ2xFLFFBQVE7RUFBQztBQUNYO0FBRUEsSUFBSSxTQUFTO0VBQ1g7SUFBRSxJQUFJO0lBQUcsU0FBUztJQUFRLE1BQU07SUFDOUIsWUFBWTtJQUFxQixZQUFZO0lBQVcsY0FBYztJQUFNLFlBQVk7SUFBc0IsZUFBZTtJQUFjLG1CQUFtQjtJQUFZLGVBQWU7SUFDekwsVUFBVTtJQUFjLGFBQWE7SUFBb0IsY0FBYztJQUFrQixjQUFjO0lBQ3ZHLG9CQUFvQjtJQUFlLGNBQWM7SUFBYSxVQUFVO0lBQ3hFLFdBQVc7SUFBTSxXQUFXO0lBQU8sWUFBWTtJQUFRLFlBQVk7SUFDbkUsU0FBUztJ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QixlQUFPLEVBQUUsTUFBTSxHQUFHLEtBQUssMkVBQWU7TUFDeEM7QUFFQSxZQUFNLFVBQVUsT0FBTyxLQUFLLENBQUEsTUFBSyxFQUFFLFlBQVksV0FBVyxFQUFFLFNBQVMsSUFBSTtBQUN6RSxVQUFJLFNBQVM7QUFDWCxlQUFPLEVBQUUsTUFBTSxHQUFHLE1BQU0sU0FBUyxLQUFLLDhGQUFtQjtNQUMzRDtBQUNBLFlBQU0sT0FBTyxFQUFFLElBQUksR0FBRyxNQUFNLEtBQUs7QUFDakMsYUFBTyxLQUFLLElBQUk7QUFDaEIsY0FBUTtBQUNSLGFBQU8sRUFBRSxNQUFNLEdBQUcsTUFBTSxNQUFNLEtBQUssMkJBQU87SUFDNUM7RUFDRjs7RUFFQTtJQUNFLEtBQUs7SUFDTCxRQUFRO0lBQ1IsVUFBVSxDQUFDLEVBQUUsS0FBSyxNQUFNO0FBQ3RCLFlBQU0sTUFBTSxPQUFPLFVBQVUsQ0FBQSxNQUFLLEVBQUUsTUFBTSxLQUFLLEVBQUU7QUFDakQsVUFBSSxRQUFRLEdBQUksUUFBTyxFQUFFLE1BQU0sR0FBRyxLQUFLLHFCQUFNO0FBRTdDLFlBQU0sT0FBTyxPQUFPLE1BQU0sUUFBUSxPQUFPLEdBQUcsRUFBRSxJQUFJLEVBQUUsS0FBSztBQUN6RCxZQUFNLFVBQVUsT0FBTyxNQUFNLFdBQVcsT0FBTyxHQUFHLEVBQUUsT0FBTyxFQUFFLEtBQUs7QUFDbEUsWUFBTSxNQUFNLE9BQU8sS0FBSyxDQUFBLE1BQUssRUFBRSxZQUFZLFdBQVcsRUFBRSxTQUFTLFFBQVEsRUFBRSxPQUFPLE9BQU8sR0FBRyxFQUFFLEVBQUU7QUFDaEcsVUFBSSxLQUFLO0FBQ1AsZUFBTyxFQUFFLE1BQU0sR0FBRyxLQUFLLG9EQUFZO01BQ3JDO0FBQ0EsYUFBTyxHQUFHLElBQUksRUFBRSxHQUFHLE9BQU8sR0FBRyxHQUFHLEdBQUcsTUFBTSxNQUFNLFFBQVE7QUFDdkQsY0FBUTtBQUNSLGFBQU8sRUFBRSxNQUFNLEdBQUcsTUFBTSxPQUFPLEdBQUcsR0FBRyxLQUFLLDJCQUFPO0lBQ25EO0VBQ0Y7O0VBRUE7SUFDRSxLQUFLO0lBQ0wsUUFBUTtJQUNSLFVBQVUsQ0FBQyxFQUFFLEtBQUssTUFBTTtBQUN0QixlQUFTLE9BQU8sT0FBTyxDQUFBLE1BQUssRUFBRSxNQUFNLEtBQUssRUFBRTtBQUMzQyxjQUFRO0FBQ1IsYUFBTyxFQUFFLE1BQU0sR0FBRyxLQUFLLDJCQUFPO0lBQ2hDO0VBQ0Y7QUFDRjsiLAogICJuYW1lcyI6IFtdCn0K
