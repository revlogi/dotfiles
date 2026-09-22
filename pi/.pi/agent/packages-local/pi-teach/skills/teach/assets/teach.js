(() => {
  const attempts = new Map();
  const id = () => crypto.randomUUID();
  const post = async payload => {
    const response = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) throw new Error(`保存失败 (${response.status})`);
    return response.json();
  };
  const waitForFeedback = async (eventId, form) => {
    const box = form.querySelector("[data-teach-feedback]");
    const status = form.querySelector("[data-teach-status]");
    for (let count = 0; count < 180; count += 1) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      try {
        const response = await fetch(`/api/feedback/${eventId}`);
        if (response.status === 202) continue;
        if (!response.ok || form.dataset.waiting !== eventId) return;
        const result = await response.json();
        box.hidden = false;
        box.textContent = `${result.feedback}\n\n下一步：${result.next}`;
        status.textContent = "作答已保存，Pi 的反馈已返回。";
        return;
      } catch { return; }
    }
    status.textContent = "作答已保存；反馈尚未返回，可回到 Pi 查看。";
  };
  document.querySelectorAll("[data-teach-hint]").forEach(element => {
    const record = async () => {
      const question = element.dataset.questionId || element.closest("[data-question-id]")?.dataset.questionId;
      if (!question || element.dataset.recorded === "true") return;
      if (!attempts.has(question)) attempts.set(question, id());
      element.dataset.recorded = "true";
      try { await post({ id: id(), attempt: attempts.get(question), kind: "hint", question, answer: "" }); }
      catch { element.dataset.recorded = "false"; }
    };
    if (element.tagName === "DETAILS") element.addEventListener("toggle", () => { if (element.open) record(); });
    else element.addEventListener("click", record);
  });
  document.querySelectorAll("[data-teach-response]").forEach(form => {
    form.addEventListener("submit", async event => {
      event.preventDefault();
      const question = form.dataset.questionId;
      const answer = new FormData(form).get("answer")?.toString().trim();
      const status = form.querySelector("[data-teach-status]");
      const button = form.querySelector("button[type=submit]");
      if (!question || !answer) { status.textContent = "请先写下你的回答。"; return; }
      if (!attempts.has(question)) attempts.set(question, id());
      const payload = button._pending || { id: id(), attempt: attempts.get(question), kind: "answer", question, answer };
      button._pending = payload; button.disabled = true; status.textContent = "正在保存……";
      try {
        const result = await post(payload);
        button._pending = null; form.dataset.waiting = result.id;
        form.querySelector("[data-teach-feedback]").hidden = true;
        status.textContent = "已保存并请求 Pi 评估。你可以继续阅读。";
        waitForFeedback(result.id, form);
      } catch (error) {
        status.textContent = `${error.message}。内容仍在页面中，请保持 Pi 运行后重试。`;
      } finally { button.disabled = false; }
    });
  });
})();
