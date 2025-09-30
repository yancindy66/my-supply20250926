import fs from 'fs';
import path from 'path';

const dataDir = path.resolve(process.cwd(), 'mock', 'data');
const file = path.resolve(dataDir, 'platform-standard.json');
function ensure(){ try{ if(!fs.existsSync(dataDir)) fs.mkdirSync(dataDir,{recursive:true}); }catch{} }
function load(){ try{ if(fs.existsSync(file)) return JSON.parse(fs.readFileSync(file,'utf8')); }catch{} return null; }
function save(data){ try{ ensure(); fs.writeFileSync(file, JSON.stringify(data,null,2),'utf8'); }catch{} }

let standards = load() || [
  { id:1, commodity_type:'棉花', grade_name:'一级棉', base_premium: 0,
    specifications: { '颜色级':['11','21','31'], '纤维长度_mm':[28,31], '马克隆等级':['A','B'], '强度_cN/tex':[28.0,30.0], '长度整齐度_min':82 } },
  { id:2, commodity_type:'棉花', grade_name:'双29', base_premium: 120,
    specifications: { '颜色级':['11','21','31'], '纤维长度_mm':[29,30], '马克隆等级':['A','B'], '强度_cN/tex':[28.5,30.5], '长度整齐度_min':82 } },
  { id:3, commodity_type:'红枣', grade_name:'一级枣', base_premium: 0,
    specifications: { '糖度_Brix_%':[70,85], '含水率_%':[0,25], '每公斤颗粒数':[150,400], '霉变率_%':[0,1], '破损率_%':[0,3] } }
];
save(standards);

export default [
  { url:'/api/platform_standard', method:'get', response:({ query })=>{
      const ct = String(query?.commodity_type||'');
      const list = ct? standards.filter(s=> s.commodity_type===ct) : standards;
      return { code:0, data: list };
    }
  },
  { url:'/api/platform_standard/:id', method:'get', response:({ params })=>{
      const item = standards.find(s=> String(s.id)===String(params?.id));
      return item? { code:0, data:item } : { code:1, msg:'未找到' };
    }
  }
];




