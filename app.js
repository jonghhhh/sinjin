window.__appJsLoaded = true;
const proposals = [
  ["26-신진-01", "AI 라벨 효과, AI의 기여도 평가 그리고 AI가 생성한 이미지 품질이 뉴스 신뢰도에 미치는 영향에 대한 연구", "이종혁"],
  ["26-신진-02", "생성형 AI 건강정보 특성이 건강행동의도에 미치는 영향: AI 신뢰의 매개효과와 자기효능감의 조절효과", "이종혁"],
  ["26-신진-03", "뉴스 지도에서 사라지는 지역: 1996∼2025년 인구변동과 뉴스 가시성 불평등을 통해 본 ‘재현의 사막’", "이종혁"],
  ["26-신진-04", "AI 합성 미디어 수용자는 한국의 미디어 이용자를 재현하는가: 경험에서 인식까지, 데이터 저널리즘적 활용 가능성", "이종혁"],
  ["26-신진-05", "AI 뉴스 알고리즘의 위험 인식과 수용 기제: 공공서비스미디어에 대한 제도 신뢰의 조절 효과", "이종혁"],
  ["26-신진-06", "생성형 AI 시대 부모의 정보탐색과 양육 의사결정: 영유아 자녀를 둔 부모의 활용 경험을 중심으로", "이소은"],
  ["26-신진-07", "조기 검진으로 예방 가능한 6대암과 한국의 언론보도", "이소은"],
  ["26-신진-08", "지방소멸 시대, 우리 사회는 농업·농촌을 어떻게 이해하고 있는가? 언론보도와 시민인식 구조의 비교", "이소은"],
  ["26-신진-09", "공영방송의 글로벌 플랫폼 유통과 공급 다양성: KBS WORLD 공식 유튜브 채널군의 다언어·지역별 콘텐츠 포트폴리오 분석", "이소은"],
  ["26-신진-10", "디지털 플랫폼 시대 변호사의 업무와 멀티플랫폼 이용: 로톡을 이용하는 청년 변호사", "이소은"],
  ["26-신진-11", "외국계 한국인에 대한 차별 보도는 언제 공감을 이끄는가?: 사회적 정체성의 조절 효과", "진보래"],
  ["26-신진-12", "숏폼 플랫폼은 K-pop 뮤직비디오를 어떻게 변화시켰는가? 숏폼 플랫폼 시대의 편집과 퍼포먼스 분석", "진보래"],
  ["26-신진-13", "식품광고에서 의료인의 연구 및 개발 참여 사실은 언제 추천 및 보증이 되는가?", "진보래"],
  ["26-신진-14", "AI 시대 공공서비스미디어의 사회적 역할과 공공재원 모델 연구", "진보래"],
  ["26-신진-15", "AI 매개 뉴스 이용이 뉴스 수용자의 이해, 신뢰, 뉴스 다양성 인식, 그리고 뉴스 회피에 미치는 영향", "진보래"],
  ["26-신진-16", "간접광고(PPL) 제도의 법적 정합성에 관한 연구 — 방송법·시행령·심의규정 사이의 위임입법 구조를 중심으로", "정낙원"],
  ["26-신진-17", "시청자는 왜 불법 스트리밍으로 향하는가?: OTT 스포츠 중계의 유료 독점화와 디지털 보편적 시청권의 재구성", "정낙원"],
  ["26-신진-18", "플랫폼 추천 알고리즘은 어떻게 거부되는가: 음악 청취 실천에 나타난 사회기술적 상상", "정낙원"],
  ["26-신진-19", "생성형 AI 콘텐츠는 왜 외면받는가?: 품질 결함, 콘텐츠 피로감 및 회피 의도를 중심으로", "정낙원"],
  ["26-신진-20", "플랫폼 시대의 미디어 동반성: ‘밥친구’ 콘텐츠의 이용과 의미화에 관한 질적 연구", "정낙원"]
];
const criteria = [
  ["creativity", "연구의 창의성", 20],
  ["validity", "연구목적 및 방법의 타당성", 25],
  ["feasibility", "연구의 구체성 및 실행 가능성", 25],
  ["academicValue", "학술적 가치", 20],
  ["growth", "연구자의 성장 가능성", 10]
];
const password = "sinjin";
let reviews = {};

function boot() {
  if (!window.APPS_SCRIPT_URL || window.APPS_SCRIPT_URL.includes("PASTE_")) {
    showMessage("관리자가 아직 Google 저장 주소를 설정하지 않았습니다.", true);
    return;
  }
  render();
  loadReviews();
}
boot();

function jsonp(params, timeoutMs = 20000) {
  return new Promise((resolve, reject) => {
    const callback = `gasCallback_${Date.now()}_${Math.random().toString(36).slice(2)}`;
    const script = document.createElement("script");
    const timer = setTimeout(() => { cleanup(); reject(new Error("timeout")); }, timeoutMs);
    function cleanup() {
      clearTimeout(timer);
      delete window[callback];
      script.remove();
    }
    window[callback] = data => {
      cleanup();
      (data && data.ok) ? resolve(data) : reject(new Error((data && data.error) || "error"));
    };
    script.onerror = () => { cleanup(); reject(new Error("network")); };
    script.src = `${window.APPS_SCRIPT_URL}?${new URLSearchParams({ ...params, password, callback })}`;
    document.body.appendChild(script);
  });
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function loadReviews(retriesLeft = 2) {
  try {
    const data = await jsonp({ action: "list" });
    reviews = Object.fromEntries((Array.isArray(data.reviews) ? data.reviews : [])
      .filter(review => review && review.proposalId)
      .map(review => [review.proposalId, review]));
    render();
    return true;
  } catch (error) {
    if (retriesLeft > 0) {
      await delay(1500);
      return loadReviews(retriesLeft - 1);
    }
    showMessage("저장 자료를 불러오지 못했습니다. 네트워크 상태를 확인 후 새로고침해 주세요.", true);
    return false;
  }
}

function current(id, reviewer) {
  return reviews[id] || {
    proposalId: id, reviewer, creativity: "", validity: "", feasibility: "",
    academicValue: "", growth: "", comments: ""
  };
}

function render() {
  const list = document.querySelector("#list");
  list.innerHTML = proposals.map(([id, title, assigned]) => {
    const review = current(id, assigned);
    const complete = criteria.every(([key]) => review[key] !== "" && review[key] != null);
    const total = criteria.reduce((sum, [key]) => sum + (Number(review[key]) || 0), 0);
    return `<details class="proposal"><summary><span class="dot ${complete ? "done" : ""}"></span><b>${id}</b><span class="title">${escapeHtml(title)}</span><span class="reviewer">${escapeHtml(review.reviewer || "미배정")}</span><strong>${total}<small>/100</small></strong></summary>
      <form class="review-form" action="${escapeHtml(window.APPS_SCRIPT_URL)}" method="post" target="save-target" onsubmit="return saveReview(event, '${id}')">
        <input type="hidden" name="action" value="save"><input type="hidden" name="password" value="${escapeHtml(password)}"><input type="hidden" name="proposalId" value="${id}">
        <div class="actions"><label>심사자<input name="reviewer" value="${escapeHtml(review.reviewer || assigned)}" maxlength="40" required></label><a href="public/pdfs/${id}.pdf" target="_blank" rel="noopener">연구계획서 PDF 열기 ↗</a></div>
        <div class="scores">${criteria.map(([key, label, max]) => `<label>${label}<small> / ${max}점</small><input name="${key}" type="number" min="0" max="${max}" step="1" value="${review[key] == null ? "" : review[key]}"></label>`).join("")}</div>
        <label class="comments">기타의견<textarea name="comments" rows="4" maxlength="5000">${escapeHtml(review.comments || "")}</textarea></label>
        <div class="save"><span>총점 <b>${total}</b> / 100</span><button type="submit">저장</button></div>
      </form></details>`;
  }).join("");
  const count = proposals.filter(([id, , name]) => criteria.every(([key]) => {
    const review = current(id, name);
    return review[key] !== "" && review[key] != null;
  })).length;
  document.querySelector("#progress").textContent = `${count} / ${proposals.length} 입력 완료`;
}

function waitForSaveTarget() {
  return new Promise(resolve => {
    const iframe = document.querySelector('iframe[name="save-target"]');
    let done = false;
    const finish = () => {
      if (done) return;
      done = true;
      iframe.removeEventListener("load", finish);
      resolve();
    };
    iframe.addEventListener("load", finish);
    setTimeout(finish, 8000);
  });
}

function saveReview(event, id) {
  const form = event.target;
  const button = form.querySelector("button");
  button.disabled = true;
  button.textContent = "저장 중…";
  (async () => {
    try {
      await waitForSaveTarget();
      if (await loadReviews()) {
        showMessage(`${id} 심사 내용이 저장되었습니다.`);
      }
    } finally {
      button.disabled = false;
      button.textContent = "저장";
    }
  })();
  return true;
}

function showMessage(text, error = false) {
  const element = document.querySelector("#message");
  element.textContent = text;
  element.className = `message${error ? " error" : ""}`;
  element.hidden = false;
}

function escapeHtml(value) {
  return String(value == null ? "" : value).replace(/[&<>'"]/g, character => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;"
  }[character]));
}
