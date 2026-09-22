import { createServer, type Server } from "node:http";
import { createHash } from "node:crypto";
import { mkdirSync, readFileSync, realpathSync, writeFileSync, existsSync, statSync } from "node:fs";
import { resolve, sep } from "node:path";

export interface Lesson {
  title: string;
  objective: string;
  sources: { path: string; location: string; excerpt: string }[];
  explanation: string;
  diagramHtml?: string;
  questions: { id: string; prompt: string; hint: string; source: number }[];
}
export interface LearningEvent {
  id: string;
  at: string;
  attempt: string;
  kind: "answer" | "hint" | "position";
  question: string;
  value: string;
  hintUsed: boolean;
  revision: string;
}
const hash = (value: string | Buffer) => createHash("sha256").update(value).digest("hex");
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
function text(value: unknown, limit: number): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= limit;
}
export function validateLesson(value: unknown): Lesson {
  const v = value as Lesson;
  if (!v || !text(v.title, 200) || !text(v.objective, 2000) || !text(v.explanation, 16000) ||
      !Array.isArray(v.sources) || v.sources.length < 1 || v.sources.length > 8 ||
      !v.sources.every(s => s && text(s.path, 1000) && text(s.location, 1000) && text(s.excerpt, 12000)) ||
      !Array.isArray(v.questions) || v.questions.length < 1 || v.questions.length > 6 ||
      !v.questions.every(q => q && q.id !== "position" && /^[a-z0-9-]{1,60}$/.test(q.id) && text(q.prompt, 4000) && text(q.hint, 2000) &&
        Number.isInteger(q.source) && q.source >= 0 && q.source < v.sources.length) ||
      new Set(v.questions.map(q => q.id)).size !== v.questions.length ||
      (v.diagramHtml !== undefined && !text(v.diagramHtml, 50000))) throw new Error("Invalid lesson manifest; see references/interactive.md");
  return v;
}
function child(root: string, path: string): string {
  const base = realpathSync(root);
  const target = realpathSync(resolve(root, path));
  if (!target.startsWith(base + sep)) throw new Error("Path escapes its allowed directory");
  return target;
}
export function evidenceDirectory(root: string, name: "events" | "lessons" | "feedback"): string {
  const base = realpathSync(root);
  // Do not follow redirected state directories, including pre-existing symlinks.
  for (const path of [resolve(base, "learning"), resolve(base, "learning", name)]) {
    mkdirSync(path, { recursive: true });
    if (realpathSync(path) !== path) throw new Error("Learning state directory must not be a symlink");
  }
  return resolve(base, "learning", name);
}
export function saveFeedback(root: string, id: string, feedback: string, next: string): void {
  if (!uuid.test(id) || !text(feedback, 10000) || !text(next, 2000)) throw new Error("Invalid feedback");
  const event = JSON.parse(readFileSync(child(evidenceDirectory(root, "events"), `${id}.json`), "utf8")) as LearningEvent;
  if (event.kind === "hint") throw new Error("Hints do not require an assessment");
  writeFileSync(resolve(evidenceDirectory(root, "feedback"), `${id}.json`), JSON.stringify({ feedback, next }), { flag: "wx", mode: 0o600 });
}
const escape = (value: string) => value.replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function renderLesson(lesson: Lesson): string {
  return `<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${escape(lesson.title)}</title><style>
body{font:17px/1.7 system-ui;background:#f6f4ef;color:#202b30;margin:0}main{max-width:1050px;margin:auto;padding:32px 24px}h1{line-height:1.2}h2{font-size:20px}section,.card{background:white;border:1px solid #dddcd4;border-radius:12px;padding:22px;margin:18px 0}.columns{display:grid;grid-template-columns:1fr 1fr;gap:20px}.prose,blockquote{white-space:pre-wrap}blockquote{margin:12px 0;border-left:3px solid #568171;padding-left:15px}small{color:#52615b}textarea,input{box-sizing:border-box;width:100%;font:inherit;padding:10px;border:1px solid #9aa7a0;border-radius:6px}button{font:inherit;cursor:pointer;background:#24634e;color:white;border:0;border-radius:6px;padding:8px 15px;margin:8px 8px 0 0}button.secondary{background:#e8eee9;color:#234735}button:disabled{opacity:.5;cursor:wait}.status{color:#375d4c}.feedback{white-space:pre-wrap;background:#edf4ef;padding:12px;border-radius:6px}.hint{white-space:pre-wrap;color:#76521b}iframe{width:100%;height:350px;border:0}@media(max-width:750px){.columns{display:block}main{padding:18px}}a{color:#24634e}
</style><main><small>Material Mentor · 基于原材料的小课</small><h1>${escape(lesson.title)}</h1><p>${escape(lesson.objective)}</p>
<div class="columns"><section><h2>原材料</h2>${lesson.sources.map((s,i) => `<h3>${i+1}. ${escape(s.location)}</h3><small>${escape(s.path)}</small><blockquote>${escape(s.excerpt)}</blockquote><a href="/source/${i}" target="_blank" rel="noopener">打开完整原文</a>`).join("")}</section>
<section><h2>导师讲解</h2><small>AI 辅助解释，请对照左侧原文；有疑问时以原文核对。</small><div class="prose">${escape(lesson.explanation)}</div>${lesson.diagramHtml ? `<iframe title="辅助图解" sandbox srcdoc="${escape(lesson.diagramHtml)}"></iframe>` : ""}</section></div>
<h2>尝试与反馈</h2><p>提交后自动保存到课程，并请 Pi 评估。提示使用会记录；打开页面不会增加掌握进度。</p>
${lesson.questions.map(q => `<section data-question="${q.id}"><small>对照原材料 ${q.source+1}</small><h3>${escape(q.prompt)}</h3><textarea aria-label="${escape(q.prompt)}" rows="4" placeholder="写下你的解释、预测或操作结果……"></textarea><button data-action="answer">提交给 Pi</button><button class="secondary" data-action="hint">给我一个提示</button><p class="hint" hidden></p><p class="status" role="status"></p><div class="feedback" hidden></div></section>`).join("")}
<section data-question="position"><h2>阅读位置（可选）</h2><p>只在你主动确认后更新阅读位置；这属于自述，不是掌握证据。</p><input aria-label="已读位置" placeholder="例如：读完 §2.3，但例题 2 仍不明白"><button data-action="position">确认位置</button><p class="status" role="status"></p><div class="feedback" hidden></div></section>
<small>仅记录此页的主动提交和提示请求，不监控其他应用。Pi 退出后服务停止；尚未保存的文字请保留，重新打开课程页面后再提交。反馈显示在本页及 Pi。</small></main>
<script>
const attempt=crypto.randomUUID();
async function feedback(id,section){
 const box=section.querySelector('.feedback');
 for(let i=0;i<180;i++){
  await new Promise(r=>setTimeout(r,2000));
  try{const r=await fetch('/feedback/'+id);if(r.status===202)continue;if(!r.ok)return;
   const result=await r.json();if(section.waiting!==id)return;box.hidden=false;box.textContent=result.feedback+'\\n\\n下一步：'+result.next;section.querySelector('.status').textContent='已保存，反馈已返回。';return;
  }catch{return;}
 }
 section.querySelector('.status').textContent+=' 反馈尚未到达，可回 Pi 查看；作答已保存。';
}
document.querySelectorAll('button[data-action]').forEach(button=>button.addEventListener('click',async()=>{
 const section=button.closest('section'),status=section.querySelector('.status'),kind=button.dataset.action;
 const value=kind==='hint'?'':section.querySelector('textarea,input').value.trim();
 if(kind!=='hint'&&!value){status.textContent='请先写下你的回答。';return;}
 // Preserve the same payload/id on an uncertain network result, so retry cannot duplicate evidence.
 const payload=button.pending||{id:crypto.randomUUID(),attempt,kind,question:section.dataset.question,value};
 button.pending=payload;button.disabled=true;status.textContent='正在保存……';
 try{const response=await fetch('/events',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload)});
  if(!response.ok)throw Error('保存失败（'+response.status+'）');
  const result=await response.json();button.pending=null;
  if(kind==='hint'){const hint=section.querySelector('.hint');hint.hidden=false;hint.textContent=result.hint;status.textContent='提示使用已记录。';}
  else{status.textContent='已保存，已请求 Pi 评估。反馈会显示在下方。';section.waiting=result.id;section.querySelector('.feedback').hidden=true;feedback(result.id,section);}
 }catch(error){status.textContent='尚未确认保存：'+error.message+'。请保持 Pi 运行后重试；本次内容仍保留。';}
 finally{button.disabled=false;}
}));
</script></html>`;
}

export async function startLesson(root: string, manifest: string, onEvidence: (event: LearningEvent, path: string) => void): Promise<{ url: string; close: () => Promise<void> }> {
  child(root, "lessons");
  child(root, "material");
  const file = child(resolve(root, "lessons"), manifest);
  if (statSync(file).size > 150000) throw new Error("Lesson manifest is too large");
  const raw = readFileSync(file, "utf8");
  const lesson = validateLesson(JSON.parse(raw));
  const sources = lesson.sources.map(s => {
    if (!s.path.startsWith("material/")) throw new Error("Sources must be inside material/");
    const path = child(resolve(root, "material"), s.path.slice(9));
    if (statSync(path).size > 50 * 1024 * 1024) throw new Error("Source exceeds 50 MB; extract the relevant portion first");
    const bytes = readFileSync(path);
    return { path: s.path, bytes, hash: hash(bytes) };
  });
  const snapshot = JSON.stringify({ lesson, sources: sources.map(({path,hash}) => ({path,hash})) });
  const revision = hash(snapshot);
  const snapshotPath = resolve(evidenceDirectory(root, "lessons"), `${revision}.json`);
  if (!existsSync(snapshotPath)) writeFileSync(snapshotPath, snapshot, { flag: "wx", mode: 0o600 });
  const events = evidenceDirectory(root, "events");
  const feedbackDir = evidenceDirectory(root, "feedback");
  const hints = new Set<string>();
  let origin = "";
  const server: Server = createServer(async (req,res) => {
    const send = (status: number, body: unknown) => { res.writeHead(status, { "Content-Type": "application/json" });res.end(JSON.stringify(body)); };
    res.setHeader("Cache-Control", "no-store");
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Content-Security-Policy", "default-src 'none'; script-src 'unsafe-inline'; style-src 'unsafe-inline'; connect-src 'self'; frame-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'");
    try {
      if (req.headers.host !== new URL(origin).host) return send(403, { error: "Invalid host" });
      if (req.method === "GET" && req.url === "/") { res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });res.end(renderLesson(lesson));return; }
      const sourceMatch = /^\/source\/(\d+)$/.exec(req.url ?? "");
      if (req.method === "GET" && sourceMatch) {
        const source = sources[Number(sourceMatch[1])];
        if (!source) return send(404, {});
        res.writeHead(200, { "Content-Type": source.path.endsWith(".pdf") ? "application/pdf" : "text/plain; charset=utf-8" });res.end(source.bytes);return;
      }
      const feedbackMatch = /^\/feedback\/([a-f0-9-]+)$/.exec(req.url ?? "");
      if (req.method === "GET" && feedbackMatch && uuid.test(feedbackMatch[1])) {
        const path = resolve(feedbackDir, `${feedbackMatch[1]}.json`);
        if (!existsSync(path)) return send(202, {});
        return send(200, JSON.parse(readFileSync(child(feedbackDir, `${feedbackMatch[1]}.json`), "utf8")));
      }
      if (req.method !== "POST" || req.url !== "/events") return send(404, {});
      if (req.headers.origin !== origin || req.headers["content-type"] !== "application/json") return send(403, { error: "Same-origin JSON required" });
      req.setEncoding("utf8");
      let body = "";
      for await (const chunk of req) { body += chunk.toString();if (body.length > 20000) return send(413, {}); }
      const input = JSON.parse(body);
      const question = lesson.questions.find(q => q.id === input.question);
      if (typeof input.id !== "string" || typeof input.attempt !== "string" || !uuid.test(input.id) || !uuid.test(input.attempt) ||
          !["answer", "hint", "position"].includes(input.kind) ||
          (input.kind === "position" ? input.question !== "position" : !question) ||
          (input.kind !== "hint" && !text(input.value, 12000))) return send(400, { error: "Invalid event" });
      const path = resolve(events, `${input.id}.json`);
      if (existsSync(path)) {
        const previous = JSON.parse(readFileSync(child(events, `${input.id}.json`), "utf8"));
        if (previous.revision !== revision || previous.attempt !== input.attempt || previous.kind !== input.kind || previous.question !== input.question || previous.value !== (input.kind === "hint" ? "" : input.value)) return send(409, {});
        return send(200, { id: previous.id, hint: input.kind === "hint" ? question!.hint : undefined });
      }
      const key = `${input.attempt}:${input.question}`;
      if (input.kind === "hint") hints.add(key);
      const event: LearningEvent = { id: input.id, at: new Date().toISOString(), attempt: input.attempt, kind: input.kind, question: input.question, value: input.kind === "hint" ? "" : input.value, hintUsed: hints.has(key), revision };
      writeFileSync(path, JSON.stringify(event, null, 2) + "\n", { flag: "wx", mode: 0o600 });
      // A durable event remains available even if the agent cannot accept a turn now.
      try { if (event.kind !== "hint") onEvidence(event, path); } catch { /* next course turn reads pending events */ }
      return send(200, { id: event.id, hint: input.kind === "hint" ? question!.hint : undefined });
    } catch { if (!res.headersSent) send(400, { error: "Request could not be processed" });else res.end(); }
  });
  await new Promise<void>((ok,fail) => { server.once("error",fail);server.listen(0,"127.0.0.1",() => { server.off("error",fail);ok(); }); });
  const address = server.address();
  if (!address || typeof address === "string") throw new Error("No listener address");
  origin = `http://127.0.0.1:${address.port}`;
  return { url: origin, close: () => new Promise<void>((ok,fail) => { server.close(error => error ? fail(error) : ok());server.closeAllConnections(); }) };
}
