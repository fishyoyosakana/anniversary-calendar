// Build script: generates index.html for WebSocket-backed shared calendar
const fs = require('fs');
const path = require('path');

// All Chinese text constants
const T = {
  TITLE: '纪念日日历',
  HEADING: '纪念日日历',
  QUOTE: '我们每天度过的日常，都是连续不断的奇迹',
  ROOM_NAME_DEFAULT: '我们的纪念日',
  ONLINE_CONNECTING: '连接中...',
  ONLINE_LOCAL: '本地模式',
  ONLINE_PREFIX: ' 人在线',
  INVITE_BTN: '🔗 分享',
  BG_BTN: '🎨 背景',
  IO_BTN: '📤 导入/导出',
  TODAY_BTN: '今天',
  JUMP_BTN: '📅 跳转',
  JUMP_TITLE: '跳转到指定年月',
  PREV_TITLE: '上个月',
  NEXT_TITLE: '下个月',
  YEAR_SEL: '选择年份',
  MONTH_SEL: '选择月份',
  BACK_TODAY: '回到今天',
  CLOSE: '关闭',
  WEEKDAYS: ['日','一','二','三','四','五','六'],
  OVERVIEW: '概览',
  TOTAL_LABEL: '纪念日总数',
  MONTH_LABEL: '本月',
  UPCOMING_LABEL: '30天内',
  UPCOMING_TITLE: '即将到来',
  SEARCH_PLACEHOLDER: '搜索纪念日...',
  EMPTY_HINT: "还没有纪念日，点击下方添加",
  EMPTY_SEARCH: '没有匹配的纪念日',
  EMPTY_NO_DATA: '还没有纪念日',
  DAY_TODAY: '今天',
  DAY_THIS: '这一天',
  DAY_ANN_LABEL: '这一天的纪念日',
  ADD_ANN_BTN: '＋ 添加纪念日',
  ADD_ANN_TITLE: '新建纪念日',
  NAME_LABEL: '名称',
  NAME_REQUIRED: '*',
  NAME_PLACEHOLDER: '比如：在一起的日子',
  DESC_LABEL: '描述（可选）',
  DESC_PLACEHOLDER: '写点什么...',
  PHOTO_LABEL: '照片（可选，最大 2MB）',
  PHOTO_BTN: '📷 上传照片',
  ICON_LABEL: '图标',
  COLOR_LABEL: '颜色标签',
  REPEAT_LABEL: '重复',
  REPEAT_TOGGLE: '每年重复',
  SAVE_BTN: '保存',
  DELETE: '删除',
  ANN_ADDED: '已添加 ✨',
  ANN_DELETED: '已删除',
  TOAST_LINK_COPIED: '链接已复制，发给好友吧！',
  TOAST_COPY_FAIL: '复制失败',
  TOAST_IMAGE_TOO_BIG: '图片不能超过 2MB',
  TOAST_BG_TOO_BIG: '背景图不能超过 2MB',
  TOAST_PROCESSING: '处理中...',
  TOAST_NO_TITLE: '请填写名称',
  TOAST_BG_UPDATED: '背景已更新',
  BG_SETTINGS: '背景设置',
  BG_UPLOAD_LABEL: '上传自定义背景',
  BG_UPLOAD_BTN: '📁 选择背景图',
  BG_GRADIENT_LABEL: '预设渐变',
  BG_SOLID_LABEL: '纯色 / 无背景',
  GRADIENT_NAMES: ['晨曦','花海','森林','晚霞','星空','糖果'],
  SOLID_NAMES: ['默认','纯白','浅粉','浅蓝','浅绿','浅紫'],
  SHARE_TITLE: '分享日历',
  SHARE_DESC: '把这个链接发给好友，大家一起编辑同一个日历，每个人的修改都会实时同步！',
  SHARE_COPY_LINK: '📋 复制链接',
  IO_TITLE: '导入 / 导出数据',
  IO_DESC: '导出数据文件作为备份，或发给好友导入。导入会合并到现有数据中。',
  IO_DOWNLOAD: '📥 下载数据文件 (.json)',
  IO_COPY: '📋 复制数据到剪贴板',
  IO_IMPORT_LABEL: '导入数据',
  IO_IMPORT_BTN: '📁 选择 .json 文件',
  IO_IMPORT_PLACEHOLDER: '或在此粘贴数据文本...',
  IO_IMPORT_BTN2: '导入',
  IO_SUCCESS: (n) => '导入成功，新增 ' + n + ' 条纪念日 🎉',
  IO_BAD_FORMAT: '数据格式不正确',
  IO_PARSE_FAIL: (e) => '数据解析失败：' + e,
  IO_NO_DATA: '请选择文件或粘贴数据',
  EMOJIS: ['❤️','🎂','💍','🌹','⭐','🌙','🎈','✈️','🏠','🎓','🏆','🐾','☕','📷','🎵','🎁'],
  EDIT_TITLE: '点击修改空间名称'
};

// CSS (unchanged from before)
const css = `
:root{--accent:#d96459;--accent-soft:#fbeae8;--accent-deep:#b84a40;--gold:#d4a24c;--gold-soft:#fbf3e2;--green:#6b9b7e;--blue:#6b8db4;--purple:#9b7bb4;--bg:#f7f5f1;--card:#ffffff;--card-trans:rgba(255,255,255,0.9);--ink:#2b2b2b;--ink-soft:#6b6b6b;--ink-faint:#a8a8a8;--line:#ece8e1;--shadow:0 4px 20px rgba(40,30,25,0.06);--shadow-lg:0 12px 40px rgba(40,30,25,0.12);--radius:16px;--radius-sm:10px}
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI","PingFang SC","Microsoft YaHei",sans-serif;background:var(--bg);background-size:cover;background-position:center;background-attachment:fixed;color:var(--ink);min-height:100vh;transition:background .5s;position:relative}
body::before{content:'';position:fixed;inset:0;background:inherit;background-size:cover;background-position:center;background-attachment:fixed;opacity:0;transition:opacity .5s;z-index:-2;pointer-events:none}
body.custom-bg::before{opacity:1}
body::after{content:'';position:fixed;inset:0;background:rgba(247,245,241,0.92);z-index:-1;transition:background .5s;pointer-events:none}
body.custom-bg::after{background:rgba(247,245,241,0.78)}
.topbar{position:sticky;top:0;z-index:50;backdrop-filter:blur(12px);background:var(--card-trans);border-bottom:1px solid var(--line);padding:12px 24px;display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap}
.topbar-left{display:flex;align-items:center;gap:10px;min-width:0}
.room-name{font-size:18px;font-weight:800;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;color:var(--ink);cursor:pointer;border:1px dashed transparent;padding:2px 8px;border-radius:8px}
.room-name:hover{border-color:var(--line);background:#faf8f4}
.room-name-edit{font-size:18px;font-weight:800;border:1.5px solid var(--accent);padding:2px 8px;border-radius:8px;background:#fff;font-family:inherit;color:var(--ink);outline:none;width:220px}
.online-badge{display:inline-flex;align-items:center;gap:5px;font-size:12px;color:var(--ink-soft);padding:3px 10px;border-radius:12px;background:#faf8f4}
.online-dot{width:7px;height:7px;border-radius:50%;background:#4caf50}
.online-dot.connecting{background:#d4a24c;animation:pulse 1.2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}
.topbar-right{display:flex;align-items:center;gap:10px}
.top-btn{padding:7px 16px;border-radius:20px;border:1px solid var(--line);background:#fff;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;color:var(--ink-soft);transition:.15s;white-space:nowrap}
.top-btn:hover{border-color:var(--accent);color:var(--accent);background:var(--accent-soft)}
.top-btn-accent{background:var(--accent);color:#fff;border-color:var(--accent)}
.top-btn-accent:hover{background:var(--accent-deep);color:#fff}
.quote-line{max-width:1180px;margin:14px auto 0;text-align:center;font-size:13px;color:var(--ink-faint);font-style:italic;letter-spacing:.5px}
.app{max-width:1180px;margin:16px auto;display:grid;grid-template-columns:1fr 340px;gap:20px;padding:0 24px 24px}
.calendar-card{background:var(--card-trans);backdrop-filter:blur(8px);border-radius:var(--radius);box-shadow:var(--shadow);padding:28px 32px 32px;position:relative}
.cal-header{display:flex;align-items:center;justify-content:space-between;margin-bottom:24px;position:relative;flex-wrap:wrap;gap:10px}
.cal-title{display:flex;align-items:baseline;gap:10px}
.cal-title .y{font-size:34px;font-weight:800;letter-spacing:-1px}
.cal-title .ym-sep{color:var(--ink-faint);font-weight:300}
.cal-title .m{font-size:34px;font-weight:800;color:var(--accent);letter-spacing:-1px}
.cal-title .m-label{font-size:14px;color:var(--ink-faint);margin-left:4px}
.nav{display:flex;align-items:center;gap:8px}
.nav button{width:38px;height:38px;border:1px solid var(--line);background:#fff;border-radius:50%;cursor:pointer;font-size:16px;color:var(--ink-soft);display:flex;align-items:center;justify-content:center;transition:.15s}
.nav button:hover{background:var(--accent-soft);border-color:var(--accent);color:var(--accent)}
.nav .today-btn,.nav .jump-btn{width:auto;padding:0 16px;border-radius:19px;font-size:13px;font-weight:600}
.jump-popover{position:absolute;top:70px;right:32px;background:#fff;border-radius:var(--radius);box-shadow:var(--shadow-lg);padding:20px 22px;z-index:60;display:none;width:300px;animation:pop .18s ease}
.jump-popover.show{display:block}
.jump-popover .jp-section{margin-bottom:14px}
.jump-popover .jp-section:last-child{margin-bottom:0}
.jump-popover .jp-label{font-size:11px;color:var(--ink-faint);font-weight:700;letter-spacing:.5px;margin-bottom:10px;display:flex;align-items:center;justify-content:space-between}
.jump-popover .jp-label .jp-y-nav{display:flex;gap:6px}
.jump-popover .jp-label .jp-y-nav button{width:24px;height:24px;border:1px solid var(--line);background:#fff;border-radius:6px;cursor:pointer;font-size:13px;color:var(--ink-soft);display:flex;align-items:center;justify-content:center}
.jump-popover .jp-label .jp-y-nav button:hover{background:var(--accent-soft);border-color:var(--accent);color:var(--accent)}
.jump-year-display{font-size:20px;font-weight:800;color:var(--ink)}
.jump-month-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:6px}
.jump-month-grid button{padding:8px 0;border:1px solid var(--line);background:#fff;border-radius:8px;cursor:pointer;font-size:13px;font-weight:600;color:var(--ink-soft);font-family:inherit}
.jump-month-grid button:hover{background:var(--accent-soft);border-color:var(--accent);color:var(--accent)}
.jump-month-grid button.on{background:var(--accent);color:#fff;border-color:var(--accent)}
.jump-popover .jp-actions{display:flex;gap:8px;margin-top:14px}
.jump-popover .jp-actions button{flex:1;padding:8px;border-radius:8px;border:none;cursor:pointer;font-size:13px;font-weight:600;font-family:inherit}
.jump-popover .jp-today{background:var(--accent);color:#fff}
.jump-popover .jp-close{background:#f0ede8;color:var(--ink-soft)}
.weekdays{display:grid;grid-template-columns:repeat(7,1fr);margin-bottom:8px}
.weekdays div{text-align:center;font-size:12px;color:var(--ink-faint);font-weight:600;padding:8px 0;letter-spacing:1px}
.weekdays div.weekend{color:var(--accent)}
.days{display:grid;grid-template-columns:repeat(7,1fr);gap:6px}
.day{aspect-ratio:1/.95;border-radius:var(--radius-sm);padding:6px 8px;cursor:pointer;position:relative;display:flex;flex-direction:column;transition:.15s;border:1.5px solid transparent;background:#faf8f4;overflow:hidden}
.day:hover{background:#fff;border-color:var(--line);box-shadow:var(--shadow);transform:translateY(-1px)}
.day.other-month{opacity:.35;background:transparent}
.day .num{font-size:15px;font-weight:600}
.day.other-month .num{color:var(--ink-faint)}
.day.weekend .num{color:var(--accent)}
.day.today{background:var(--accent)}
.day.today .num{color:#fff}
.day.today .badge-text{color:#fff!important}
.day.has-ann{background:var(--accent-soft);border-color:rgba(217,100,89,.25)}
.day.today.has-ann{background:var(--accent)}
.day .ann-list{margin-top:3px;display:flex;flex-direction:column;gap:2px;overflow:hidden}
.day .badge{font-size:10px;padding:1px 5px;border-radius:4px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:500}
@media(max-width:860px){.app{grid-template-columns:1fr;padding:0 14px 14px}.calendar-card{padding:20px 16px}.cal-title .y,.cal-title .m{font-size:26px}.day{padding:4px 5px}.day .num{font-size:13px}.topbar{padding:10px 14px}.jump-popover{right:16px;width:260px}}
`;

const css2 = `
.sidebar{display:flex;flex-direction:column;gap:16px}
.panel{background:var(--card-trans);backdrop-filter:blur(8px);border-radius:var(--radius);box-shadow:var(--shadow);padding:22px 24px}
.panel h3{font-size:13px;color:var(--ink-faint);font-weight:700;letter-spacing:1px;margin-bottom:16px;display:flex;align-items:center;gap:8px}
.panel h3 .count{background:var(--accent-soft);color:var(--accent);font-size:11px;padding:1px 8px;border-radius:10px}
.stat-row{display:flex;gap:12px;margin-bottom:4px}
.stat{flex:1;background:#faf8f4;border-radius:var(--radius-sm);padding:14px;text-align:center}
.stat .v{font-size:26px;font-weight:800;color:var(--accent);line-height:1}
.stat .l{font-size:11px;color:var(--ink-faint);margin-top:6px;letter-spacing:.5px}
.stat:nth-child(2) .v{color:var(--gold)}.stat:nth-child(3) .v{color:var(--green)}
.upcoming-list{display:flex;flex-direction:column;gap:10px}
.up-item{display:flex;align-items:center;gap:12px;padding:10px 12px;border-radius:var(--radius-sm);background:#faf8f4;cursor:pointer;transition:.15s}
.up-item:hover{background:var(--accent-soft)}.up-item .up-date{text-align:center;min-width:46px}
.up-item .up-date .d{font-size:22px;font-weight:800;line-height:1;color:var(--accent)}.up-item .up-date .m{font-size:10px;color:var(--ink-faint);margin-top:3px}
.up-item .up-info{flex:1;min-width:0}.up-item .up-title{font-size:14px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.up-item .up-desc{font-size:11px;color:var(--ink-faint);margin-top:2px}
.up-item .up-count{font-size:11px;font-weight:700;color:var(--accent);background:#fff;padding:4px 9px;border-radius:10px;white-space:nowrap}
.empty-hint{text-align:center;color:var(--ink-faint);font-size:13px;padding:20px 0}
.modal-mask{position:fixed;inset:0;background:rgba(40,30,25,.35);backdrop-filter:blur(3px);display:none;align-items:center;justify-content:center;z-index:100;padding:20px}
.modal-mask.show{display:flex}
.modal{background:#fff;border-radius:20px;box-shadow:var(--shadow-lg);width:100%;max-width:480px;max-height:86vh;overflow:hidden;display:flex;flex-direction:column;animation:pop .2s ease}
@keyframes pop{from{transform:scale(.94);opacity:0}to{transform:scale(1);opacity:1}}
.modal-head{padding:22px 26px 16px;border-bottom:1px solid var(--line)}
.modal-head .mh-date{font-size:13px;color:var(--ink-faint);font-weight:600}
.modal-head .mh-title{font-size:22px;font-weight:800;margin-top:4px}
.modal-head .mh-title.today-tag{color:var(--accent)}.modal-body{padding:18px 26px;overflow-y:auto;flex:1}
.modal-foot{padding:16px 26px;border-top:1px solid var(--line);display:flex;gap:10px;justify-content:flex-end}
.ann-section-label{font-size:12px;color:var(--ink-faint);font-weight:700;letter-spacing:.5px;margin-bottom:10px}
.ann-card{background:#faf8f4;border-radius:var(--radius-sm);padding:12px 14px;margin-bottom:10px;display:flex;align-items:flex-start;gap:12px;border-left:3px solid var(--accent)}
.ann-card.c-gold{border-left-color:var(--gold)}.ann-card.c-green{border-left-color:var(--green)}
.ann-card.c-blue{border-left-color:var(--blue)}.ann-card.c-purple{border-left-color:var(--purple)}
.ann-card .ann-media{flex-shrink:0}.ann-card .ann-emoji{font-size:24px;line-height:1}
.ann-card .ann-img{width:48px;height:48px;border-radius:8px;object-fit:cover;cursor:pointer}
.ann-card .ann-main{flex:1;min-width:0}.ann-card .ann-t{font-size:15px;font-weight:700}
.ann-card .ann-d{font-size:12px;color:var(--ink-soft);margin-top:3px}
.ann-card .ann-meta{font-size:11px;color:var(--ink-faint);margin-top:5px}
.ann-card .ann-del{background:none;border:none;color:var(--ink-faint);cursor:pointer;font-size:16px;padding:2px 4px;border-radius:6px;transition:.15s}
.ann-card .ann-del:hover{color:var(--accent);background:var(--accent-soft)}
.image-preview{margin-top:10px;position:relative;display:inline-block}
.image-preview img{max-width:100%;max-height:160px;border-radius:10px;object-fit:cover}
.image-preview .rm-img{position:absolute;top:-6px;right:-6px;width:24px;height:24px;border-radius:50%;background:var(--accent);color:#fff;border:none;cursor:pointer;font-size:14px;display:flex;align-items:center;justify-content:center}
.form-row{margin-bottom:14px}.form-row label{display:block;font-size:12px;font-weight:600;color:var(--ink-soft);margin-bottom:6px}
.form-row input[type="text"],.form-row textarea{width:100%;border:1px solid var(--line);border-radius:var(--radius-sm);padding:10px 12px;font-size:14px;font-family:inherit;color:var(--ink);background:#fff}
.form-row input:focus,.form-row textarea:focus{outline:none;border-color:var(--accent)}
.form-row textarea{resize:vertical;min-height:60px}
.file-upload-btn{display:inline-flex;align-items:center;gap:6px;padding:8px 16px;border-radius:8px;border:1.5px dashed var(--line);background:#faf8f4;font-size:13px;color:var(--ink-soft);cursor:pointer;font-family:inherit}
.file-upload-btn:hover{border-color:var(--accent);color:var(--accent);background:var(--accent-soft)}
.emoji-pick{display:flex;flex-wrap:wrap;gap:6px}
.emoji-pick span{width:34px;height:34px;display:flex;align-items:center;justify-content:center;border-radius:8px;cursor:pointer;font-size:18px;border:1.5px solid transparent}
.emoji-pick span:hover{background:var(--accent-soft)}.emoji-pick span.on{background:var(--accent-soft);border-color:var(--accent)}
.color-pick{display:flex;gap:8px}.color-pick span{width:26px;height:26px;border-radius:50%;cursor:pointer;border:3px solid transparent}
.color-pick span.on{border-color:var(--ink)}.toggle-row{display:flex;align-items:center;gap:10px}
.switch{position:relative;width:42px;height:24px;background:#ddd;border-radius:12px;cursor:pointer;transition:background .2s;flex-shrink:0}
.switch.on{background:var(--accent)}
.switch::after{content:'';position:absolute;top:3px;left:3px;width:18px;height:18px;background:#fff;border-radius:50%;transition:transform .2s}
.switch.on::after{transform:translateX(18px)}.toggle-row .t-label{font-size:13px;color:var(--ink-soft)}
.btn{padding:9px 20px;border-radius:var(--radius-sm);border:none;font-size:13px;font-weight:600;cursor:pointer;font-family:inherit}
.btn-primary{background:var(--accent);color:#fff}.btn-primary:hover{background:var(--accent-deep)}
.btn-ghost{background:#f0ede8;color:var(--ink-soft)}.btn-ghost:hover{background:#e6e2db}
.btn-add{width:100%;padding:11px;background:var(--accent-soft);color:var(--accent);border:1.5px dashed rgba(217,100,89,.4);border-radius:var(--radius-sm);font-size:13px;font-weight:600;cursor:pointer;font-family:inherit}
.btn-add:hover{background:rgba(217,100,89,.12)}.add-form{display:none}.add-form.show{display:block}
.settings-grid{display:flex;flex-direction:column;gap:18px}
.settings-grid label{font-size:12px;font-weight:600;color:var(--ink-soft)}
.bg-gradients{display:flex;gap:8px;flex-wrap:wrap}
.bg-gradients div{width:52px;height:52px;border-radius:10px;cursor:pointer;border:2px solid transparent}
.bg-gradients div:hover{transform:scale(1.08)}.bg-gradients div.on{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-soft)}
.bg-solid{display:flex;gap:8px;flex-wrap:wrap}
.bg-solid div{width:38px;height:38px;border-radius:50%;cursor:pointer;border:3px solid transparent}
.bg-solid div.on{border-color:var(--ink)}
.toast{position:fixed;bottom:30px;left:50%;transform:translateX(-50%) translateY(20px);background:var(--ink);color:#fff;padding:11px 22px;border-radius:24px;font-size:13px;opacity:0;transition:all .25s;z-index:200;pointer-events:none}
.toast.show{opacity:1;transform:translateX(-50%) translateY(0)}
`;

// ============================================================
// JAVASCRIPT — WebSocket-based sync, no Y.js dependency
// ============================================================
const js = `
// ---- Shorthand helpers ----
const $=s=>document.querySelector(s);
const pad=n=>String(n).padStart(2,'0');
const fmt=d=>pad(d.getFullYear())+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const parse=s=>{const[y,m,dd]=s.split('-').map(Number);return new Date(y,m-1,dd)};
const sameDay=(a,b)=>a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();
const isToday=d=>sameDay(d,new Date());
const el=(t,cls)=>{const e=document.createElement(t);if(cls)e.className=cls;return e};

const EMOJIS=${JSON.stringify(T.EMOJIS)};
const COLORS=[{key:"red",cls:"",hex:"#d96459"},{key:"gold",cls:"c-gold",hex:"#d4a24c"},{key:"green",cls:"c-green",hex:"#6b9b7e"},{key:"blue",cls:"c-blue",hex:"#6b8db4"},{key:"purple",cls:"c-purple",hex:"#9b7bb4"}];

// ---- Data state ----
let data={anniversaries:[],settings:{background:null,name:'${T.ROOM_NAME_DEFAULT}'}};
let view=new Date();view.setDate(1);
let selectedDate=null;
let formState={emoji:EMOJIS[0],color:COLORS[0].key,repeat:false,image:''};
let jpYear=view.getFullYear();
let isRemoteUpdate=false;
let isInitSynced=false;

// ---- WebSocket sync ----
let ws=null, reconnectTimer=null, wsConnected=false;

function connectWS(){
  const proto=location.protocol==='https:'?'wss:':'ws:';
  const url=proto+'//'+location.host;
  try{
    ws=new WebSocket(url);
    ws.onopen=()=>{
      wsConnected=true;clearTimeout(reconnectTimer);
    };
    ws.onmessage=(e)=>{
      let msg;try{msg=JSON.parse(e.data)}catch(ex){return;}
      if(msg.type==='init'){
        if(!isInitSynced){
          data=msg.data;isInitSynced=true;
          backupToLocal();applyAll();
          updateOnlineStatus(msg.count||1);
        }
      }else if(msg.type==='state'){
        isRemoteUpdate=true;
        try{
          const p=JSON.parse(msg.data);
          data={anniversaries:p.anniversaries||[],settings:p.settings||{background:null,name:'${T.ROOM_NAME_DEFAULT}'}};
          backupToLocal();applyAll();
        }catch(ex){}
        isRemoteUpdate=false;
      }else if(msg.type==='presence'){
        updateOnlineStatus(msg.count);
      }
    };
    ws.onclose=()=>{
      wsConnected=false;updateOnlineStatus(-1);
      reconnectTimer=setTimeout(connectWS,2000);
    };
    ws.onerror=()=>{updateOnlineStatus(-1);};
  }catch(ex){fallbackToLocal();}
}

function sendState(){
  if(ws&&ws.readyState===1){
    ws.send(JSON.stringify({type:'state',data:JSON.stringify(data)}));
  }
}

function backupToLocal(){
  try{localStorage.setItem('ann_shared_data',JSON.stringify(data))}catch(e){}
}

function loadFromLocal(){
  try{
    const raw=localStorage.getItem('ann_shared_data');
    if(raw){const p=JSON.parse(raw);data={anniversaries:p.anniversaries||[],settings:p.settings||{background:null,name:'${T.ROOM_NAME_DEFAULT}'}};return true}
  }catch(e){}
  return false;
}

function fallbackToLocal(){
  loadFromLocal();applyAll();
  $('#onlineText').textContent='${T.ONLINE_LOCAL}';
}

function saveData(){
  if(!isRemoteUpdate)sendState();
  backupToLocal();
}

function applyAll(){applyBg();updateRoomName();render();renderSidebar();}

function updateOnlineStatus(c){
  const dot=$('#onlineDot'),text=$('#onlineText');
  if(!dot||!text)return;
  dot.classList.remove('connecting');
  if(c<=0||!isInitSynced){dot.classList.add('connecting');text.textContent='${T.ONLINE_CONNECTING}'}
  else text.textContent=c+'${T.ONLINE_PREFIX}';
}

// ---- Background ----
function applyBg(){
  const bg=(data.settings&&data.settings.background)||null;
  document.body.classList.remove('custom-bg');document.body.style.background='';document.body.style.backgroundImage='';
  if(!bg)return;
  if(bg.type==='image'){document.body.style.backgroundImage='url('+bg.value+')';document.body.classList.add('custom-bg')}
  else if(bg.type==='gradient'){document.body.style.backgroundImage=bg.value;document.body.classList.add('custom-bg')}
  else if(bg.type==='color'){document.body.style.backgroundColor=bg.value}
}

// ---- Room name ----
function updateRoomName(){
  $('#roomName').textContent=data.settings&&data.settings.name?data.settings.name:'${T.ROOM_NAME_DEFAULT}';
}

function editRoomNameHandler(){
  const span=$('#roomName'),old=span.textContent;
  const input=document.createElement('input');input.className='room-name-edit';input.value=old;input.maxLength=40;
  span.replaceWith(input);input.focus();input.select();
  const save=()=>{
    const val=input.value.trim()||'${T.ROOM_NAME_DEFAULT}';
    const ns=document.createElement('span');ns.className='room-name';ns.id='roomName';ns.textContent=val;ns.title='${T.EDIT_TITLE}';
    ns.addEventListener('click',editRoomNameHandler);input.replaceWith(ns);
    data.settings.name=val;saveData();
  };
  input.addEventListener('blur',save);input.addEventListener('keydown',e=>{if(e.key==='Enter')input.blur()});
}
$('#roomName').addEventListener('click',editRoomNameHandler);

// ---- Calendar ----
function render(){
  const y=view.getFullYear(),m=view.getMonth();
  $('#yearLabel').textContent=y;$('#monthLabel').textContent=m+1;
  const first=new Date(y,m,1),startWeekday=first.getDay(),daysInMonth=new Date(y,m+1,0).getDate();
  const grid=$('#daysGrid');grid.innerHTML='';
  const prevDays=new Date(y,m,0).getDate();
  for(let i=startWeekday-1;i>=0;i--)grid.appendChild(makeDayCell(new Date(y,m-1,prevDays-i),true));
  for(let d=1;d<=daysInMonth;d++)grid.appendChild(makeDayCell(new Date(y,m,d),false));
  const filled=startWeekday+daysInMonth,remain=(7-filled%7)%7;
  for(let d=1;d<=remain;d++)grid.appendChild(makeDayCell(new Date(y,m+1,d),true));
  while(grid.children.length<42){const nd=remain+grid.children.length-filled;grid.appendChild(makeDayCell(new Date(y,m+1,nd+1),true))}
}

function annsForDateRecurring(date){
  const md=pad(date.getMonth()+1)+'-'+pad(date.getDate());
  return(data.anniversaries||[]).filter(a=>{
    if(a.date===fmt(date))return true;
    if(a.repeat){const ad=parse(a.date);return pad(ad.getMonth()+1)+'-'+pad(ad.getDate())===md&&ad<=date}
    return false;
  });
}

function makeDayCell(date,otherMonth){
  const cell=el('div','day');if(otherMonth)cell.classList.add('other-month');
  const dow=date.getDay();if(dow===0||dow===6)cell.classList.add('weekend');if(isToday(date))cell.classList.add('today');
  const num=el('div','num');num.textContent=date.getDate();cell.appendChild(num);
  const list=annsForDateRecurring(date);
  if(list.length){cell.classList.add('has-ann');const al=el('div','ann-list');
    list.slice(0,2).forEach(a=>{const badge=el('div','badge badge-text');const co=COLORS.find(c=>c.key===a.color)||COLORS[0];
      const r=parseInt(co.hex.slice(1,3),16),g=parseInt(co.hex.slice(3,5),16),b=parseInt(co.hex.slice(5,7),16);
      badge.style.background='rgba('+r+','+g+','+b+',0.12)';badge.style.color=co.hex;badge.textContent=(a.emoji||'')+' '+a.title;al.appendChild(badge)});cell.appendChild(al)}
  cell.addEventListener('click',()=>openDayModal(date));return cell;
}

// ---- Day modal ----
function openDayModal(date){selectedDate=date;
  $('#mhDate').textContent=date.getFullYear()+'\\u5e74'+(date.getMonth()+1)+'\\u6708'+date.getDate()+'\\u65e5 \\u00b7 \\u661f\\u671f'+'\\u65e5\\u4e00\\u4e8c\\u4e09\\u56db\\u4e94\\u516d'[date.getDay()];
  const t=$('#mhTitle');t.textContent=isToday(date)?'${T.DAY_TODAY}':'${T.DAY_THIS}';t.classList.toggle('today-tag',isToday(date));
  renderAnnList();$('#addForm').classList.remove('show');resetForm();$('#showAddBtn').style.display='';$('#dayModal').classList.add('show');
}
function renderAnnList(){
  const wrap=$('#annList');wrap.innerHTML='';const list=annsForDateRecurring(selectedDate);
  if(!list.length){const h=el('div','empty-hint');h.textContent='${T.EMPTY_HINT}';wrap.appendChild(h);return}
  list.sort((a,b)=>parse(a.date)-parse(b.date)).forEach(a=>{
    const card=el('div','ann-card');const co=COLORS.find(c=>c.key===a.color)||COLORS[0];if(co.cls)card.classList.add(co.cls);
    const media=el('div','ann-media');
    if(a.image){const img=el('img','ann-img');img.src=a.image;img.alt=a.title;img.addEventListener('click',()=>{const w=window.open();w.document.write('<img src="'+a.image+'" style="max-width:100%;max-height:100vh;margin:auto;display:block;">')});media.appendChild(img)}
    else{const em=el('div','ann-emoji');em.textContent=a.emoji||'';media.appendChild(em)}
    const main=el('div','ann-main');const tt=el('div','ann-t');tt.textContent=a.title;main.appendChild(tt);
    if(a.desc){const dd=el('div','ann-d');dd.textContent=a.desc;main.appendChild(dd)}
    const meta=el('div','ann-meta');const aDate=parse(a.date);
    let mt=aDate.getFullYear()!==selectedDate.getFullYear()?('\\u59cb\\u4e8e '+aDate.getFullYear()):'\\u4eca\\u5e74';
    if(a.repeat){const yrs=selectedDate.getFullYear()-aDate.getFullYear();if(yrs>0)mt+=' \\u00b7 \\u7b2c '+yrs+' \\u5468\\u5e74'}
    meta.textContent=mt+(a.repeat?' \\u00b7 \\u6bcf\\u5e74\\u91cd\\u590d':'');main.appendChild(meta);
    const del=el('button','ann-del');del.innerHTML='\\u2715';
    del.addEventListener('click',e=>{e.stopPropagation();if(confirm('\\u5220\\u9664\\u300c'+a.title+'\\u300d\\uff1f')){
      data.anniversaries=data.anniversaries.filter(x=>x.id!==a.id);saveData();renderAnnList();renderSidebar();render();toast('${T.ANN_DELETED}');
    }});
    card.appendChild(media);card.appendChild(main);card.appendChild(del);wrap.appendChild(card);
  });
}
function resetForm(){$('#fTitle').value='';$('#fDesc').value='';formState={emoji:EMOJIS[0],color:COLORS[0].key,repeat:false,image:''};$('#repeatSwitch').classList.remove('on');hideImagePreview();buildEmojiPick();buildColorPick()}
function hideImagePreview(){$('#imagePreview').style.display='none';$('#imagePreview').innerHTML='';formState.image='';$('#fImage').value=''}
function buildEmojiPick(){const p=$('#emojiPick');p.innerHTML='';EMOJIS.forEach(e=>{const s=el('span');s.textContent=e;if(e===formState.emoji)s.classList.add('on');s.addEventListener('click',()=>{formState.emoji=e;buildEmojiPick()});p.appendChild(s)})}
function buildColorPick(){const p=$('#colorPick');p.innerHTML='';COLORS.forEach(c=>{const s=el('span');s.style.background=c.hex;if(c.key===formState.color)s.classList.add('on');s.addEventListener('click',()=>{formState.color=c.key;buildColorPick()});p.appendChild(s)})}

$('#fImage').addEventListener('change',()=>{const file=$('#fImage').files[0];if(!file)return;if(file.size>2*1024*1024){toast('${T.TOAST_IMAGE_TOO_BIG}');$('#fImage').value='';return}toast('${T.TOAST_PROCESSING}');const reader=new FileReader();reader.onload=()=>{formState.image=reader.result;const prev=$('#imagePreview');prev.style.display='inline-block';prev.innerHTML='<img src="'+reader.result+'" alt="\\u9884\\u89c8"><button class="rm-img">\\u00d7</button>';prev.querySelector('.rm-img').addEventListener('click',()=>{formState.image='';hideImagePreview()})};reader.readAsDataURL(file)});
$('#showAddBtn').addEventListener('click',()=>{$('#addForm').classList.add('show');$('#showAddBtn').style.display='none';$('#fTitle').focus()});
$('#repeatSwitch').addEventListener('click',()=>{formState.repeat=!formState.repeat;$('#repeatSwitch').classList.toggle('on',formState.repeat)});
$('#closeDayBtn').addEventListener('click',()=>$('#dayModal').classList.remove('show'));
$('#dayModal').addEventListener('click',e=>{if(e.target===$('#dayModal'))$('#dayModal').classList.remove('show')});
$('#saveBtn').addEventListener('click',()=>{
  if(!$('#addForm').classList.contains('show')){$('#dayModal').classList.remove('show');return}
  const title=$('#fTitle').value.trim();if(!title){toast('${T.TOAST_NO_TITLE}');$('#fTitle').focus();return}
  const ann={id:Date.now().toString(36)+Math.random().toString(36).slice(2,7),date:fmt(selectedDate),title,desc:$('#fDesc').value.trim(),emoji:formState.emoji,color:formState.color,repeat:formState.repeat,image:formState.image||''};
  data.anniversaries.push(ann);saveData();$('#addForm').classList.remove('show');$('#showAddBtn').style.display='';$('#fTitle').value='';$('#fDesc').value='';hideImagePreview();renderAnnList();renderSidebar();render();toast('${T.ANN_ADDED}')
});

// ---- Navigation ----
$('#prevBtn').addEventListener('click',()=>{view.setMonth(view.getMonth()-1);render()});
$('#nextBtn').addEventListener('click',()=>{view.setMonth(view.getMonth()+1);render()});
$('#todayBtn').addEventListener('click',()=>{view=new Date();view.setDate(1);render()});

// ---- Jump popover ----
function buildJumpPopover(){jpYear=view.getFullYear();$('#jpYearDisplay').textContent=jpYear+'\\u5e74';const grid=$('#jpMonthGrid');grid.innerHTML='';const curY=view.getFullYear(),curM=view.getMonth();for(let i=0;i<12;i++){const btn=el('button');btn.textContent=(i+1)+'\\u6708';if(jpYear===curY&&i===curM)btn.classList.add('on');btn.addEventListener('click',()=>{view=new Date(jpYear,i,1);render();$('#jumpPopover').classList.remove('show')});grid.appendChild(btn)}}
$('#jumpBtn').addEventListener('click',e=>{e.stopPropagation();const pop=$('#jumpPopover');if(pop.classList.contains('show'))pop.classList.remove('show');else{buildJumpPopover();pop.classList.add('show')}});
$('#jpYPrev').addEventListener('click',e=>{e.stopPropagation();jpYear-=1;$('#jpYearDisplay').textContent=jpYear+'\\u5e74';const curY=view.getFullYear(),curM=view.getMonth();Array.from($('#jpMonthGrid').children).forEach((btn,i)=>{btn.classList.toggle('on',jpYear===curY&&i===curM)})});
$('#jpYNext').addEventListener('click',e=>{e.stopPropagation();jpYear+=1;$('#jpYearDisplay').textContent=jpYear+'\\u5e74';const curY=view.getFullYear(),curM=view.getMonth();Array.from($('#jpMonthGrid').children).forEach((btn,i)=>{btn.classList.toggle('on',jpYear===curY&&i===curM)})});
$('#jpToday').addEventListener('click',e=>{e.stopPropagation();view=new Date();view.setDate(1);render();$('#jumpPopover').classList.remove('show')});
$('#jpClose').addEventListener('click',e=>{e.stopPropagation();$('#jumpPopover').classList.remove('show')});
document.addEventListener('click',e=>{const pop=$('#jumpPopover');if(!pop.classList.contains('show'))return;if(pop.contains(e.target)||e.target.closest('#jumpBtn'))return;pop.classList.remove('show')});

document.addEventListener('keydown',e=>{
  if(e.key==='Escape'){['#dayModal','#settingsModal','#shareModal','#importModal'].forEach(s=>{if($(s).classList.contains('show'))$(s).classList.remove('show')});if($('#jumpPopover').classList.contains('show'))$('#jumpPopover').classList.remove('show');return}
  if(['#dayModal','#settingsModal','#shareModal','#importModal'].some(s=>$(s).classList.contains('show')))return;
  if(e.key==='ArrowLeft'){view.setMonth(view.getMonth()-1);render()}if(e.key==='ArrowRight'){view.setMonth(view.getMonth()+1);render()}
});

// ---- Sidebar ----
function renderSidebar(){
  const q=($('#searchBox').value||'').trim().toLowerCase();const now=new Date();now.setHours(0,0,0,0);
  $('#statTotal').textContent=(data.anniversaries||[]).length;
  const mc=(data.anniversaries||[]).filter(a=>{const d=parse(a.date);return d.getMonth()===view.getMonth()}).length;$('#statMonth').textContent=mc;
  let items=(data.anniversaries||[]).map(a=>{const base=parse(a.date);let next;if(a.repeat){next=new Date(now.getFullYear(),base.getMonth(),base.getDate());if(next<now)next=new Date(now.getFullYear()+1,base.getMonth(),base.getDate())}else next=base;return{a,next,days:Math.round((next-now)/86400000)}});
  if(q)items=items.filter(it=>(it.a.title+(it.a.desc||'')).toLowerCase().includes(q));
  items.sort((x,y)=>x.next-y.next);
  $('#statUpcoming').textContent=items.filter(it=>it.days>=0&&it.days<=30).length;
  $('#upCount').textContent=items.filter(it=>it.days>=0).length;
  const list=$('#upcomingList');list.innerHTML='';const shown=items.filter(it=>it.days>=0).slice(0,12);
  if(!shown.length){const h=el('div','empty-hint');h.textContent=q?'${T.EMPTY_SEARCH}':'${T.EMPTY_NO_DATA}';list.appendChild(h);return}
  shown.forEach(it=>{const item=el('div','up-item');const db=el('div','up-date');const dd=el('div','d');dd.textContent=it.next.getDate();const mm=el('div','m');mm.textContent=(it.next.getMonth()+1)+'\\u6708';db.appendChild(dd);db.appendChild(mm);const info=el('div','up-info');const t=el('div','up-title');t.textContent=(it.a.emoji||'')+' '+it.a.title;info.appendChild(t);if(it.a.desc){const d=el('div','up-desc');d.textContent=it.a.desc;info.appendChild(d)}const count=el('div','up-count');if(it.days===0)count.textContent='${T.TODAY_COUNTDOWN}';else if(it.days===1)count.textContent='${T.TOMORROW_COUNTDOWN}';else count.textContent=it.days+'\\u5929\\u540e';item.appendChild(db);item.appendChild(info);item.appendChild(count);item.addEventListener('click',()=>{view=new Date(it.next.getFullYear(),it.next.getMonth(),1);render();openDayModal(it.next)});list.appendChild(item)});
}
$('#searchBox').addEventListener('input',renderSidebar);

// ---- Settings ----
function buildBgGradients(){const p=$('#bgGradients');const presets=[{name:'${T.GRADIENT_NAMES[0]}',css:'linear-gradient(135deg, #fce4cc, #f8c7c7, #c5d5e8)'},{name:'${T.GRADIENT_NAMES[1]}',css:'linear-gradient(135deg, #f9d5e5, #e8c3d6, #c8d6e5)'},{name:'${T.GRADIENT_NAMES[2]}',css:'linear-gradient(135deg, #d4e5d4, #c5d5c5, #b8c8b8)'},{name:'${T.GRADIENT_NAMES[3]}',css:'linear-gradient(135deg, #f8d4c4, #e8c4b4, #d4b4a4)'},{name:'${T.GRADIENT_NAMES[4]}',css:'linear-gradient(135deg, #d4d8e8, #c4c8d8, #b4b8c8)'},{name:'${T.GRADIENT_NAMES[5]}',css:'linear-gradient(135deg, #fce4ec, #f8d4e8, #e8c4d8)'}];p.innerHTML='';const cur=(data.settings&&data.settings.background)?JSON.stringify(data.settings.background):'null';presets.forEach(pr=>{const div=el('div');div.style.backgroundImage=pr.css;div.title=pr.name;if(JSON.stringify({type:'gradient',value:pr.css})===cur)div.classList.add('on');div.addEventListener('click',()=>{data.settings.background={type:'gradient',value:pr.css};applyBg();saveData();buildBgGradients();buildBgSolid()});p.appendChild(div)})}
function buildBgSolid(){const p=$('#bgSolid');const presets=[{name:'${T.SOLID_NAMES[0]}',color:null,style:'background:#f7f5f1'},{name:'${T.SOLID_NAMES[1]}',color:{type:'color',value:'#f8f6f2'},style:'background:#f8f6f2'},{name:'${T.SOLID_NAMES[2]}',color:{type:'color',value:'#fce4ec'},style:'background:#fce4ec'},{name:'${T.SOLID_NAMES[3]}',color:{type:'color',value:'#e3f2fd'},style:'background:#e3f2fd'},{name:'${T.SOLID_NAMES[4]}',color:{type:'color',value:'#e8f5e9'},style:'background:#e8f5e9'},{name:'${T.SOLID_NAMES[5]}',color:{type:'color',value:'#f3e5f5'},style:'background:#f3e5f5'}];p.innerHTML='';const cur=(data.settings&&data.settings.background)?JSON.stringify(data.settings.background):'null';presets.forEach(pr=>{const div=el('div');div.style.cssText=pr.style+';border:1px solid var(--line)';div.title=pr.name;const val=pr.color?JSON.stringify(pr.color):'null';if(val===cur)div.classList.add('on');div.addEventListener('click',()=>{data.settings.background=pr.color;applyBg();saveData();buildBgGradients();buildBgSolid()});p.appendChild(div)})}
$('#settingsBtn').addEventListener('click',()=>{buildBgGradients();buildBgSolid();$('#settingsModal').classList.add('show')});
$('#closeSettingsBtn').addEventListener('click',()=>$('#settingsModal').classList.remove('show'));
$('#settingsModal').addEventListener('click',e=>{if(e.target===$('#settingsModal'))$('#settingsModal').classList.remove('show')});
$('#bgImage').addEventListener('change',()=>{const file=$('#bgImage').files[0];if(!file)return;if(file.size>2*1024*1024){toast('${T.TOAST_BG_TOO_BIG}');$('#bgImage').value='';return}toast('${T.TOAST_PROCESSING}');const reader=new FileReader();reader.onload=()=>{data.settings.background={type:'image',value:reader.result};applyBg();saveData();toast('${T.TOAST_BG_UPDATED}')};reader.readAsDataURL(file)});

// ---- Share ----
$('#shareBtn').addEventListener('click',()=>{$('#shareModal').classList.add('show')});
$('#copyLinkBtn').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(location.href);toast('${T.TOAST_LINK_COPIED}')}catch(e){toast('${T.TOAST_COPY_FAIL}')}});
$('#closeShareBtn').addEventListener('click',()=>$('#shareModal').classList.remove('show'));
$('#shareModal').addEventListener('click',e=>{if(e.target===$('#shareModal'))$('#shareModal').classList.remove('show')});

// ---- Import/Export ----
$('#exportImportBtn').addEventListener('click',()=>{$('#importText').value='';$('#importFile').value='';$('#importModal').classList.add('show')});
$('#closeImportBtn').addEventListener('click',()=>$('#importModal').classList.remove('show'));
$('#importModal').addEventListener('click',e=>{if(e.target===$('#importModal'))$('#importModal').classList.remove('show')});
$('#downloadBtn').addEventListener('click',()=>{const json=JSON.stringify(data,null,2);const blob=new Blob([json],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='anniversary-data.json';a.click();URL.revokeObjectURL(url)});
$('#copyDataBtn').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(JSON.stringify(data,null,2))}catch(e){}});
$('#importFile').addEventListener('change',()=>{const file=$('#importFile').files[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{$('#importText').value=reader.result};reader.readAsText(file)});
$('#doImportBtn').addEventListener('click',()=>{const text=$('#importText').value.trim();if(!text){toast('${T.IO_NO_DATA}');return}try{const imported=JSON.parse(text);if(!imported.anniversaries){toast('${T.IO_BAD_FORMAT}');return}const existingIds=new Set(data.anniversaries.map(a=>a.id));let added=0;imported.anniversaries.forEach(a=>{if(!existingIds.has(a.id)){data.anniversaries.push(a);added++}});if(imported.settings&&imported.settings.name)data.settings.name=imported.settings.name;if(imported.settings&&imported.settings.background)data.settings.background=imported.settings.background;saveData();applyBg();updateRoomName();render();renderSidebar();$('#importModal').classList.remove('show');toast('\\u5bfc\\u5165\\u6210\\u529f\\uff0c\\u65b0\\u589e '+added+' \\u6761\\u7eaa\\u5ff5\\u65e5 \\ud83c\\udf89')}catch(e){toast('\\u6570\\u636e\\u89e3\\u6790\\u5931\\u8d25\\uff1a'+e.message)}});

// ---- Toast ----
let toastTimer;function toast(msg){const t=$('#toast');t.textContent=msg;t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2200)}

// ---- Init ----
(function(){
  // Try localStorage first for instant display
  loadFromLocal();
  applyAll();
  // Then connect to server for live data
  connectWS();
})();
`;

// Build HTML
const output = '<!DOCTYPE html>\n<html lang="zh-CN">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>' + T.TITLE + '</title>\n<style>\n' + css + '\n' + css2 + '\n</style>\n</head>\n<body>\n\n<div id="mainApp">\n<div class="topbar">\n  <div class="topbar-left">\n    <span class="room-name" id="roomName" title="' + T.EDIT_TITLE + '">' + T.ROOM_NAME_DEFAULT + '</span>\n    <span class="online-badge" id="onlineBadge">\n      <span class="online-dot connecting" id="onlineDot"></span>\n      <span id="onlineText">' + T.ONLINE_CONNECTING + '</span>\n    </span>\n  </div>\n  <div class="topbar-right">\n    <button class="top-btn" id="shareBtn">' + T.INVITE_BTN + '</button>\n    <button class="top-btn" id="settingsBtn">' + T.BG_BTN + '</button>\n    <button class="top-btn top-btn-accent" id="exportImportBtn">' + T.IO_BTN + '</button>\n  </div>\n</div>\n<div class="quote-line">「' + T.QUOTE + '」</div>\n\n<div class="app">\n  <div class="calendar-card">\n    <div class="cal-header">\n      <div class="cal-title"><span class="y" id="yearLabel"></span><span class="ym-sep">·</span><span class="m" id="monthLabel"></span><span class="m-label">月</span></div>\n      <div class="nav">\n        <button id="prevBtn" title="' + T.PREV_TITLE + '">‹</button>\n        <button class="today-btn" id="todayBtn">' + T.TODAY_BTN + '</button>\n        <button class="jump-btn" id="jumpBtn" title="' + T.JUMP_TITLE + '">' + T.JUMP_BTN + '</button>\n        <button id="nextBtn" title="' + T.NEXT_TITLE + '">›</button>\n      </div>\n    </div>\n    <div class="jump-popover" id="jumpPopover">\n      <div class="jp-section"><div class="jp-label"><span>' + T.YEAR_SEL + '</span><div class="jp-y-nav"><button id="jpYPrev">‹‹</button><button id="jpYNext">››</button></div></div><div class="jump-year-display" id="jpYearDisplay"></div></div>\n      <div class="jp-section"><div class="jp-label"><span>' + T.MONTH_SEL + '</span></div><div class="jump-month-grid" id="jpMonthGrid"></div></div>\n      <div class="jp-actions"><button class="jp-today" id="jpToday">' + T.BACK_TODAY + '</button><button class="jp-close" id="jpClose">' + T.CLOSE + '</button></div>\n    </div>\n    <div class="weekdays">' + T.WEEKDAYS.map(d => '<div' + (d === '日' || d === '六' ? ' class="weekend"' : '') + '>' + d + '</div>').join('') + '</div>\n    <div class="days" id="daysGrid"></div>\n  </div>\n  <div class="sidebar">\n    <div class="panel">\n      <h3>' + T.OVERVIEW + '</h3>\n      <div class="stat-row">\n        <div class="stat"><div class="v" id="statTotal">0</div><div class="l">' + T.TOTAL_LABEL + '</div></div>\n        <div class="stat"><div class="v" id="statMonth">0</div><div class="l">' + T.MONTH_LABEL + '</div></div>\n        <div class="stat"><div class="v" id="statUpcoming">0</div><div class="l">' + T.UPCOMING_LABEL + '</div></div>\n      </div>\n    </div>\n    <div class="panel">\n      <h3>' + T.UPCOMING_TITLE + ' <span class="count" id="upCount">0</span></h3>\n      <input class="search-box" id="searchBox" placeholder="' + T.SEARCH_PLACEHOLDER + '" style="width:100%;border:1px solid var(--line);border-radius:10px;padding:9px 12px;font-size:13px;font-family:inherit;background:#faf8f4;color:var(--ink);margin-bottom:14px;">\n      <div class="upcoming-list" id="upcomingList"></div>\n    </div>\n  </div>\n</div>\n</div>\n\n<!-- Day Modal -->\n<div class="modal-mask" id="dayModal"><div class="modal">\n  <div class="modal-head"><div class="mh-date" id="mhDate"></div><div class="mh-title" id="mhTitle"></div></div>\n  <div class="modal-body">\n    <div id="annListWrap"><div class="ann-section-label">' + T.DAY_ANN_LABEL + '</div><div id="annList"></div></div>\n    <button class="btn-add" id="showAddBtn">' + T.ADD_ANN_BTN + '</button>\n    <div class="add-form" id="addForm">\n      <div class="ann-section-label" style="margin-top:16px">' + T.ADD_ANN_TITLE + '</div>\n      <div class="form-row"><label>' + T.NAME_LABEL + ' <span style="color:var(--accent)">' + T.NAME_REQUIRED + '</span></label><input type="text" id="fTitle" placeholder="' + T.NAME_PLACEHOLDER + '" maxlength="30"></div>\n      <div class="form-row"><label>' + T.DESC_LABEL + '</label><textarea id="fDesc" placeholder="' + T.DESC_PLACEHOLDER + '" maxlength="120"></textarea></div>\n      <div class="form-row"><label>' + T.PHOTO_LABEL + '</label><label class="file-upload-btn" for="fImage">' + T.PHOTO_BTN + '</label><input type="file" id="fImage" accept="image/*" style="display:none;"><div id="imagePreview" class="image-preview" style="display:none"></div></div>\n      <div class="form-row"><label>' + T.ICON_LABEL + '</label><div class="emoji-pick" id="emojiPick"></div></div>\n      <div class="form-row"><label>' + T.COLOR_LABEL + '</label><div class="color-pick" id="colorPick"></div></div>\n      <div class="form-row"><label>' + T.REPEAT_LABEL + '</label><div class="toggle-row"><div class="switch" id="repeatSwitch"></div><span class="t-label">' + T.REPEAT_TOGGLE + '</span></div></div>\n    </div>\n  </div>\n  <div class="modal-foot"><button class="btn btn-ghost" id="closeDayBtn">' + T.CLOSE + '</button><button class="btn btn-primary" id="saveBtn">' + T.SAVE_BTN + '</button></div>\n</div></div>\n\n<!-- Settings Modal -->\n<div class="modal-mask" id="settingsModal"><div class="modal">\n  <div class="modal-head"><div class="mh-title">' + T.BG_SETTINGS + '</div></div>\n  <div class="modal-body"><div class="settings-grid">\n    <div><label>' + T.BG_UPLOAD_LABEL + '</label><label class="file-upload-btn" for="bgImage">' + T.BG_UPLOAD_BTN + '</label><input type="file" id="bgImage" accept="image/*" style="display:none;"></div>\n    <div><label>' + T.BG_GRADIENT_LABEL + '</label><div class="bg-gradients" id="bgGradients"></div></div>\n    <div><label>' + T.BG_SOLID_LABEL + '</label><div class="bg-solid" id="bgSolid"></div></div>\n  </div></div>\n  <div class="modal-foot"><button class="btn btn-ghost" id="closeSettingsBtn">' + T.CLOSE + '</button></div>\n</div></div>\n\n<!-- Share Modal -->\n<div class="modal-mask" id="shareModal"><div class="modal">\n  <div class="modal-head"><div class="mh-title">' + T.SHARE_TITLE + '</div></div>\n  <div class="modal-body">\n    <p style="font-size:14px;color:var(--ink-soft);margin-bottom:14px;line-height:1.7;">' + T.SHARE_DESC + '</p>\n    <button class="btn btn-primary" id="copyLinkBtn" style="width:100%;">' + T.SHARE_COPY_LINK + '</button>\n  </div>\n  <div class="modal-foot"><button class="btn btn-ghost" id="closeShareBtn">' + T.CLOSE + '</button></div>\n</div></div>\n\n<!-- Import/Export Modal -->\n<div class="modal-mask" id="importModal"><div class="modal">\n  <div class="modal-head"><div class="mh-title">' + T.IO_TITLE + '</div></div>\n  <div class="modal-body">\n    <p style="font-size:14px;color:var(--ink-soft);margin-bottom:14px;line-height:1.7;">' + T.IO_DESC + '</p>\n    <button class="btn btn-primary" id="downloadBtn" style="width:100%;margin-bottom:12px;">' + T.IO_DOWNLOAD + '</button>\n    <button class="btn btn-ghost" id="copyDataBtn" style="width:100%;margin-bottom:14px;">' + T.IO_COPY + '</button>\n    <div class="ann-section-label" style="border-top:1px solid var(--line);padding-top:14px;">' + T.IO_IMPORT_LABEL + '</div>\n    <label class="file-upload-btn" for="importFile" style="margin-bottom:10px;">' + T.IO_IMPORT_BTN + '</label>\n    <input type="file" id="importFile" accept=".json,application/json" style="display:none;">\n    <textarea id="importText" style="width:100%;height:100px;border:1px solid var(--line);border-radius:10px;padding:10px;font-size:11px;font-family:monospace;background:#faf8f4;color:var(--ink);resize:vertical;" placeholder="' + T.IO_IMPORT_PLACEHOLDER + '"></textarea>\n    <button class="btn btn-primary" id="doImportBtn" style="width:100%;margin-top:10px;">' + T.IO_IMPORT_BTN2 + '</button>\n  </div>\n  <div class="modal-foot"><button class="btn btn-ghost" id="closeImportBtn">' + T.CLOSE + '</button></div>\n</div></div>\n\n<div class="toast" id="toast"></div>\n\n<script>\n' + js + '\n</script>\n</body>\n</html>';

fs.writeFileSync(path.join(__dirname, 'index.html'), output, 'utf8');
console.log('Built index.html: ' + (output.length / 1024).toFixed(1) + 'KB');

// Verify
const html = fs.readFileSync(path.join(__dirname, 'index.html'), 'utf8');
const bad = html.split('').filter(c => c === '\ufffd').length;
console.log('Garbled chars: ' + bad);
console.log('Contains "纪念日日历": ' + html.includes('纪念日日历'));
console.log('Contains "WebSocket": ' + html.includes('WebSocket'));
console.log('Contains "sendState": ' + html.includes('sendState'));
