// Three.js world for "Portfolio ChrisKid - Immersif". build(THREE, canvas, opts) -> api
export function build(THREE, canvas, opts) {
  const C = opts.colors;
  const ink = new THREE.Color(C.ink), paper = new THREE.Color(C.paper), red = new THREE.Color(C.red);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight, false);
  renderer.setClearColor(ink);
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(ink, 0.042);
  const camera = new THREE.PerspectiveCamera(45, innerWidth / innerHeight, 0.1, 200);
  const S = [[0, 0, 0], [16, 0, -16], [0, 0, -34], [-16, 0, -50], [0, 0, -68]].map(a => new THREE.Vector3(...a));
  const OFF = [[0, 0.9, 9], [0, 1.1, 8.5], [0, 1.4, 9], [0, 1.0, 11.5], [0, 1.2, 10]].map(a => new THREE.Vector3(...a));
  const g = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;

  const pts = (arr, colors, size, opacity) => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(arr, 3));
    if (colors) geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    const m = new THREE.PointsMaterial({ size, vertexColors: !!colors, color: colors ? 0xffffff : paper, transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true });
    return new THREE.Points(geo, m);
  };
  const mixColors = (n, ratio) => { const c = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const k = Math.random() < ratio ? red : paper; c[i * 3] = k.r; c[i * 3 + 1] = k.g; c[i * 3 + 2] = k.b; } return c; };
  const ring = (n, R, gap) => { const a = new Float32Array(n * 3); for (let i = 0; i < n; i++) { const t = gap + Math.random() * Math.PI * 2 * (1 - gap / 6), w = 0.03 + 0.3 * Math.pow(Math.sin((t - gap) / 1.9), 2), r = R + g() * w; a[i * 3] = Math.cos(t) * r; a[i * 3 + 1] = Math.sin(t) * r; a[i * 3 + 2] = g() * 0.15; } return a; };

  // floor, path, dust
  const grid = new THREE.GridHelper(260, 130, paper, paper);
  grid.material.transparent = true; grid.material.opacity = 0.06; grid.position.set(0, -2.6, -34); scene.add(grid);
  const curve = new THREE.CatmullRomCurve3(S.map(v => v.clone().setY(-2.58)));
  scene.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(400)), new THREE.LineBasicMaterial({ color: red, transparent: true, opacity: 0.7 })));
  const pulseN = 40, pulseArr = new Float32Array(pulseN * 3), pulse = pts(pulseArr, null, 0.12, 0.9); pulse.material.color = red; scene.add(pulse);
  const dustN = 2600, dustArr = new Float32Array(dustN * 3);
  for (let i = 0; i < dustN; i++) { dustArr[i * 3] = (Math.random() - 0.5) * 80; dustArr[i * 3 + 1] = -2.5 + Math.random() * 14; dustArr[i * 3 + 2] = 12 - Math.random() * 100; }
  const dust = pts(dustArr, null, 0.045, 0.45); scene.add(dust);

  // 0 - enso
  const g0 = new THREE.Group(); g0.position.copy(S[0]).add(new THREE.Vector3(0, 0.9, 0));
  g0.add(pts(ring(6000, 2.5, 0.45), mixColors(6000, 0.3), 0.045, 0.85)); scene.add(g0);

  // 1 - code: helix + code panels
  const g1 = new THREE.Group(); g1.position.copy(S[1]).add(new THREE.Vector3(0, 0.6, 0));
  const hN = 3200, hA = new Float32Array(hN * 3);
  for (let i = 0; i < hN; i++) { const y = -2 + Math.random() * 5, ang = y * 1.7 + (i % 2) * Math.PI; hA[i * 3] = Math.cos(ang) * 1.1 + g() * 0.05; hA[i * 3 + 1] = y; hA[i * 3 + 2] = Math.sin(ang) * 1.1 + g() * 0.05; }
  const helix = pts(hA, mixColors(hN, 0.35), 0.04, 0.85); g1.add(helix);
  const codeTex = lines => { const cv = document.createElement('canvas'); cv.width = 640; cv.height = 400; const x = cv.getContext('2d');
    x.fillStyle = 'rgba(32,30,29,.82)'; x.fillRect(0, 0, 640, 400); x.strokeStyle = C.paper; x.globalAlpha = 0.5; x.lineWidth = 3; x.strokeRect(1.5, 1.5, 637, 397); x.globalAlpha = 1;
    x.fillStyle = C.red; x.fillRect(0, 0, 640, 8); x.font = '500 24px ui-monospace, Menlo, monospace';
    lines.forEach((l, i) => { x.fillStyle = i === 0 ? C.red : C.paper; x.globalAlpha = i === 0 ? 1 : 0.85; x.fillText(l, 28, 56 + i * 38); });
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t; };
  const CODE = [
    ['# rag.py', 'async def answer(q):', '  ctx = await store.search(q)', '  return llm.reply(q, ctx)', '', 'app.post("/ask")(answer)'],
    ['// api.ts', 'router.get("/missions", auth,', '  async (req, res) => {', '    res.json(await db.prod())', '  })'],
    ['-- prod.sql', 'SELECT client, status', 'FROM   missions', "WHERE  status = 'prod'", 'ORDER  BY critical DESC;']
  ];
  const codePanels = CODE.map((l, i) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(2.6, 1.625), new THREE.MeshBasicMaterial({ map: codeTex(l), transparent: true, side: THREE.DoubleSide, depthWrite: false }));
    m.position.set([-2.9, 2.9, 0.3][i], [1.3, 0.2, -1.1][i], [-0.6, -0.2, 0.9][i]); m.rotation.y = [0.35, -0.35, 0.05][i]; g1.add(m); return m; });
  scene.add(g1);

  // 2 - infra: racks, LEDs, links, packets
  const g2 = new THREE.Group(); g2.position.copy(S[2]).add(new THREE.Vector3(0, -0.4, 0));
  const edge = (w, h, d, op, col) => new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(w, h, d)), new THREE.LineBasicMaterial({ color: col || paper, transparent: true, opacity: op }));
  const ledPos = [];
  [-2.3, 0, 2.3].forEach(x => {
    const r = edge(1.5, 3.8, 1.2, 0.75); r.position.set(x, 0, 0); g2.add(r);
    for (let u = 0; u < 8; u++) { const y = -1.6 + u * 0.44, s = edge(1.3, 0.3, 1.0, 0.28); s.position.set(x, y, 0); g2.add(s);
      for (let l = 0; l < 3; l++) ledPos.push(x - 0.5 + l * 0.12, y, 0.62); }
  });
  const ledArr = new Float32Array(ledPos), ledCol = mixColors(ledArr.length / 3, 0.4), leds = pts(ledArr, ledCol, 0.09, 1); g2.add(leds);
  const linkPts = [new THREE.Vector3(-2.3, 2.1, 0), new THREE.Vector3(0, 2.7, 0), new THREE.Vector3(2.3, 2.1, 0)];
  const link = new THREE.Line(new THREE.BufferGeometry().setFromPoints(new THREE.CatmullRomCurve3(linkPts).getPoints(60)), new THREE.LineBasicMaterial({ color: red, transparent: true, opacity: 0.8 })); g2.add(link);
  const linkCurve = new THREE.CatmullRomCurve3(linkPts), pkN = 10, pkArr = new Float32Array(pkN * 3), packets = pts(pkArr, null, 0.13, 1); packets.material.color = red; g2.add(packets);
  scene.add(g2);

  // 3 - hanging scrolls (projects)
  const g3 = new THREE.Group(); g3.position.copy(S[3]);
  const scrollTex = p => { const cv = document.createElement('canvas'); cv.width = 360; cv.height = 640; const x = cv.getContext('2d');
    x.fillStyle = C.paper; x.fillRect(0, 0, 360, 640); x.fillStyle = C.red; x.fillRect(28, 28, 304, 6);
    x.font = '800 120px Archivo, sans-serif'; x.fillStyle = C.red; x.fillText(p.n, 22, 160);
    x.fillStyle = C.ink; x.font = '800 34px Archivo, sans-serif'; wrap(x, p.title, 28, 230, 304, 38);
    x.font = '600 22px Archivo, sans-serif'; x.globalAlpha = 0.6; x.fillText(p.client, 28, 590); x.globalAlpha = 1;
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; };
  const nP = (opts.projects || []).length;
  const panels = (opts.projects || []).map(p => {
    const grp = new THREE.Group();
    grp.add(new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.49), new THREE.MeshBasicMaterial({ map: scrollTex(p), side: THREE.DoubleSide, transparent: true })));
    [1.3, -1.3].forEach(y => { const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 1.62, 8), new THREE.MeshBasicMaterial({ color: y > 0 ? red : paper, transparent: true })); rod.rotation.z = Math.PI / 2; rod.position.y = y; grp.add(rod); });
    g3.add(grp); return grp; });
  // Coverflow slider: the focused scroll faces the camera front and center,
  // neighbours recede behind it at an angle and fade; recomputed every frame.
  let scrollFocus = 0, focusF = 0, cfStep1 = 2.7, cfStep2 = 2.0, cfBase = 1, hsSX = 1, hsSY = 1;
  function layoutPanels() {
    const narrow = innerWidth / innerHeight < 0.8;
    cfStep1 = narrow ? 1.75 : 2.7;
    cfStep2 = narrow ? 1.2 : 2.0;
    cfBase = narrow ? 1.15 : 1;
    hsSX = narrow ? 0.5 : 1; hsSY = narrow ? 0.85 : 1;
    panels.forEach(grp => { grp.userData.by = 0.7; });
  }
  function setScroll(i) { scrollFocus = i; }
  layoutPanels();
  scene.add(g3);

  // 4 - contact enso, large
  const g4 = new THREE.Group(); g4.position.copy(S[4]).add(new THREE.Vector3(0, 1, -1));
  g4.add(pts(ring(9000, 3.6, 0.45), mixColors(9000, 0.45), 0.05, 0.9));
  const orbit = new THREE.Line(new THREE.BufferGeometry().setFromPoints(new THREE.EllipseCurve(0, 0, 4.6, 4.6).getPoints(160).map(p => new THREE.Vector3(p.x, p.y, 0))), new THREE.LineBasicMaterial({ color: paper, transparent: true, opacity: 0.18 }));
  g4.add(orbit); scene.add(g4);

  // hotspots
  const hotspots = [];
  (opts.hsLocal || []).forEach(h => hotspots.push({ ch: h.ch, local: new THREE.Vector3(...h.p) }));
  panels.forEach((grp, k) => hotspots.push({ ch: 3, obj: grp, idx: k }));

  const tmpT = new THREE.Vector3(), tmpO = new THREE.Vector3(), v = new THREE.Vector3();
  const ease = f => f < 0.5 ? 4 * f * f * f : 1 - Math.pow(-2 * f + 2, 3) / 2;
  let ledTick = 0;

  function update(chF, mx, my, time, intro) {
    const i = Math.min(4, Math.max(0, Math.floor(chF))), f = ease(Math.min(1, chF - i)), j = Math.min(4, i + 1);
    tmpT.copy(S[i]).lerp(S[j], f); tmpO.copy(OFF[i]).lerp(OFF[j], f);
    const lift = Math.sin(f * Math.PI);
    camera.position.copy(tmpT).add(tmpO);
    camera.position.x += mx * 0.7; camera.position.y += -my * 0.45 + lift * 2.2; camera.position.z += (1 - intro) * 26 + lift * 3;
    camera.fov = 45 + lift * 14; camera.updateProjectionMatrix();
    camera.lookAt(tmpT.x, tmpT.y + 0.6, tmpT.z);

    g0.rotation.z = time * 0.08; g0.rotation.y = Math.sin(time * 0.3) * 0.25;
    helix.rotation.y = time * 0.4; codePanels.forEach((m, k) => { m.position.y += Math.sin(time * 0.8 + k * 2) * 0.0015; });
    if (++ledTick % 6 === 0) { const c = leds.geometry.attributes.color; for (let k = 0; k < c.count; k++) if (Math.random() < 0.08) { const on = Math.random() < 0.5 ? red : paper, a = Math.random() < 0.25 ? 0.15 : 1; c.setXYZ(k, on.r * a, on.g * a, on.b * a); } c.needsUpdate = true; }
    for (let k = 0; k < pkN; k++) { const p = linkCurve.getPoint((time * 0.25 + k / pkN) % 1); pkArr[k * 3] = p.x; pkArr[k * 3 + 1] = p.y; pkArr[k * 3 + 2] = p.z; } packets.geometry.attributes.position.needsUpdate = true;
    for (let k = 0; k < pulseN; k++) { const p = curve.getPoint((time * 0.02 + k / pulseN) % 1); pulseArr[k * 3] = p.x; pulseArr[k * 3 + 1] = p.y + 0.02; pulseArr[k * 3 + 2] = p.z; } pulse.geometry.attributes.position.needsUpdate = true;
    focusF += (scrollFocus - focusF) * 0.09;
    panels.forEach((grp, k) => {
      const d = k - focusF, ad = Math.abs(d), sgn = d < 0 ? -1 : 1;
      grp.position.x = sgn * (ad < 1 ? ad * cfStep1 : cfStep1 + (ad - 1) * cfStep2);
      grp.position.z = -Math.min(ad, 1) * 1.7 - Math.max(0, ad - 1) * 0.5;
      grp.position.y = grp.userData.by + Math.sin(time * 0.6 + k * 1.3) * 0.05;
      grp.rotation.y = -sgn * Math.min(ad, 1) * 0.55;
      grp.rotation.z = Math.sin(time * 0.7 + k) * 0.012;
      grp.scale.setScalar(cfBase * (1 + 0.45 * Math.max(0, 1 - ad)));
      const op = 1 - Math.min(0.6, Math.max(0, ad - 0.4) * 0.28);
      grp.children.forEach(c => { c.material.opacity = op; });
    });
    g4.rotation.z = -time * 0.06; orbit.rotation.x = time * 0.2;
    dust.rotation.y = Math.sin(time * 0.02) * 0.05;
    renderer.render(scene, camera);
  }

  function project() {
    return hotspots.map(h => {
      if (h.obj) { h.obj.updateMatrixWorld(); v.set(0, -1.62, 0).applyMatrix4(h.obj.matrixWorld); } else { v.copy(S[h.ch]); v.x += h.local.x * hsSX; v.y += h.local.y * hsSY; v.z += h.local.z; }
      v.project(camera);
      const focused = h.idx == null || Math.abs(h.idx - focusF) < 0.5;
      return { x: (v.x + 1) / 2 * innerWidth, y: (1 - v.y) / 2 * innerHeight, front: focused && v.z < 1 && Math.abs(v.x) < 1.05 && Math.abs(v.y) < 1.05, ch: h.ch };
    });
  }
  function resize() { renderer.setSize(innerWidth, innerHeight, false); camera.aspect = innerWidth / innerHeight; camera.updateProjectionMatrix(); layoutPanels(); }
  function dispose() { renderer.dispose(); }
  return { update, project, resize, dispose, setScroll };
}

function wrap(ctx, text, x, y, maxW, lh) {
  const words = String(text).split(' '); let line = '';
  for (const w of words) { const test = line ? line + ' ' + w : w; if (ctx.measureText(test).width > maxW && line) { ctx.fillText(line, x, y); line = w; y += lh; } else line = test; }
  if (line) ctx.fillText(line, x, y);
}
