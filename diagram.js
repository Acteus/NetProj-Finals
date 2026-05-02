/* diagram.js – D3 v7 interactive network diagram */
(function initDiagram() {
  const networkEl = document.getElementById('network');
  if (!networkEl) return;

  const nodeData = NODES.map(n => ({ ...n }));
  const linkData = LINKS.map(l => ({
    ...l,
    source: nodeData.find(n => n.id === l.source),
    target: nodeData.find(n => n.id === l.target)
  }));

  const pad = 52;
  const nodeR = 26;
  let W = 800, H = 500;

  function measure() {
    const r = networkEl.getBoundingClientRect();
    W = Math.max(320, Math.floor(r.width) || 320);
    H = Math.max(280, Math.floor(r.height) || 280);
  }

  function applyLayout() {
    measure();
    const iW = W - pad * 2, iH = H - pad * 2;
    nodeData.forEach(d => {
      const t = LAYOUT[d.id];
      d.x = pad + t.nx * iW;
      d.y = pad + t.ny * iH;
    });
  }

  const svg = d3.select('#network').append('svg')
    .attr('role', 'img')
    .attr('aria-label', 'Logical network topology');

  const defs = svg.append('defs');

  // Arrow marker
  defs.append('marker')
    .attr('id', 'arrow')
    .attr('viewBox', '0 -4 8 8')
    .attr('refX', 8).attr('refY', 0)
    .attr('markerWidth', 5).attr('markerHeight', 5)
    .attr('orient', 'auto')
    .append('path').attr('d', 'M0,-4L8,0L0,4').attr('fill', '#4d6477');

  // Glow filter
  const filter = defs.append('filter').attr('id', 'node-glow').attr('x', '-50%').attr('y', '-50%').attr('width', '200%').attr('height', '200%');
  filter.append('feGaussianBlur').attr('stdDeviation', '4').attr('result', 'blur');
  filter.append('feMerge').selectAll('feMergeNode')
    .data(['blur', 'SourceGraphic']).join('feMergeNode')
    .attr('in', d => d);

  const vp = svg.append('g').attr('class', 'viewport');

  const zoom = d3.zoom().scaleExtent([0.15, 3])
    .on('zoom', e => vp.attr('transform', e.transform));
  svg.call(zoom);

  // Links
  const linkSel = vp.append('g').selectAll('line').data(linkData).join('line')
    .attr('stroke', '#1e3a52').attr('stroke-opacity', 0.9)
    .attr('stroke-width', 1.5).attr('marker-end', 'url(#arrow)');

  // Link labels
  const linkLblSel = vp.append('g').selectAll('text').data(linkData).join('text')
    .attr('dy', -6).attr('text-anchor', 'middle')
    .style('font-size', '10px').style('fill', '#4d6477')
    .style('pointer-events', 'none')
    .style('opacity', 0)
    .text(d => d.label);

  // Nodes
  const nodeSel = vp.append('g').selectAll('g.node').data(nodeData).join('g')
    .attr('class', 'node').style('cursor', 'pointer')
    .call(d3.drag()
      .on('start', (e, d) => d3.select(e.sourceEvent.target.closest('.node')).raise())
      .on('drag', (e, d) => { d.x += e.dx; d.y += e.dy; render(); })
    );

  // Node outer glow ring
  nodeSel.append('circle')
    .attr('r', nodeR + 6)
    .attr('fill', 'none')
    .attr('stroke', d => d.color)
    .attr('stroke-opacity', 0.15)
    .attr('stroke-width', 8);

  // Node circle
  nodeSel.append('circle')
    .attr('r', nodeR)
    .attr('fill', d => d.color + '22')
    .attr('stroke', d => d.color)
    .attr('stroke-width', 1.5);

  // Node icon
  nodeSel.append('text')
    .attr('text-anchor', 'middle')
    .attr('dominant-baseline', 'central')
    .attr('y', -6)
    .style('font-size', '18px')
    .style('pointer-events', 'none')
    .text(d => d.icon);

  // Node label (below circle)
  nodeSel.each(function (d) {
    const g = d3.select(this);
    const words = d.name.split(/\s+/);
    const maxCh = 13;
    const lines = [];
    let line = '';
    words.forEach(w => {
      const t = line ? `${line} ${w}` : w;
      if (t.length > maxCh && line) { lines.push(line); line = w; }
      else line = t;
    });
    if (line) lines.push(line);
    const txt = g.append('text')
      .attr('text-anchor', 'middle')
      .style('font-size', '10px').style('font-weight', '600')
      .style('fill', '#c8dce9').style('pointer-events', 'none')
      .style('font-family', 'Inter, sans-serif');
    lines.forEach((ln, i) => {
      txt.append('tspan').attr('x', 0).attr('y', nodeR + 10 + i * 12).text(ln);
    });
  });

  nodeSel.append('title').text(d => d.name + ' — ' + d.ip);

  function along(fx, fy, tx, ty, dist) {
    const dx = tx - fx, dy = ty - fy;
    const len = Math.hypot(dx, dy) || 1;
    return { x: fx + dx / len * dist, y: fy + dy / len * dist };
  }

  function render() {
    linkSel.each(function (d) {
      const s = along(d.source.x, d.source.y, d.target.x, d.target.y, nodeR + 2);
      const t = along(d.target.x, d.target.y, d.source.x, d.source.y, nodeR + 10);
      d3.select(this).attr('x1', s.x).attr('y1', s.y).attr('x2', t.x).attr('y2', t.y);
    });
    linkLblSel
      .attr('x', d => (d.source.x + d.target.x) / 2)
      .attr('y', d => (d.source.y + d.target.y) / 2);
    nodeSel.attr('transform', d => `translate(${d.x},${d.y})`);
  }

  function bounds() {
    const r = nodeR + 60;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    nodeData.forEach(d => {
      x0 = Math.min(x0, d.x - r); x1 = Math.max(x1, d.x + r);
      y0 = Math.min(y0, d.y - r); y1 = Math.max(y1, d.y + r);
    });
    return { w: x1 - x0, h: y1 - y0, cx: (x0 + x1) / 2, cy: (y0 + y1) / 2 };
  }

  function fit() {
    measure(); svg.attr('width', W).attr('height', H);
    const b = bounds();
    if (!isFinite(b.w) || b.w <= 0) return;
    const s = 0.9 * Math.min((W - 48) / b.w, (H - 48) / b.h, 2.5);
    svg.transition().duration(500).call(zoom.transform,
      d3.zoomIdentity.translate(W / 2 - s * b.cx, H / 2 - s * b.cy).scale(s));
  }

  function init() {
    measure(); svg.attr('width', W).attr('height', H);
    applyLayout(); render(); fit();
  }

  // Hover effects
  nodeSel.on('mouseover', function (e, d) {
    linkSel
      .attr('stroke', l => (l.source.id === d.id || l.target.id === d.id) ? d.color : '#1e3a52')
      .attr('stroke-opacity', l => (l.source.id === d.id || l.target.id === d.id) ? 1 : 0.3)
      .attr('stroke-width', l => (l.source.id === d.id || l.target.id === d.id) ? 2.5 : 1.5);
    linkLblSel.style('opacity', l => (l.source.id === d.id || l.target.id === d.id) ? 1 : 0);
    nodeSel.attr('opacity', n => (n.id === d.id || linkData.some(l =>
      (l.source.id === d.id && l.target.id === n.id) || (l.target.id === d.id && l.source.id === n.id)
    )) ? 1 : 0.3);
  });

  nodeSel.on('mouseout', () => {
    linkSel.attr('stroke', '#1e3a52').attr('stroke-opacity', 0.9).attr('stroke-width', 1.5);
    linkLblSel.style('opacity', 0);
    nodeSel.attr('opacity', 1);
  });

  // Click → info panel
  const infoEl = document.getElementById('diagramInfo');
  nodeSel.on('click', (e, d) => {
    e.stopPropagation();
    const incoming = LINKS.filter(l => l.target === d.id).map(l => NODES.find(n => n.id === l.source).name);
    const outgoing = LINKS.filter(l => l.source === d.id).map(l => NODES.find(n => n.id === l.target).name);
    infoEl.innerHTML = `
      <div class="node-info-name" style="color:${d.color}">${d.icon} ${d.name}</div>
      <div class="node-info-ip">${d.ip}</div>
      <div class="node-info-desc">${d.description}</div>
      ${incoming.length ? `<div style="margin-top:8px;font-size:11px;color:var(--text-muted)">← FROM: ${incoming.join(', ')}</div>` : ''}
      ${outgoing.length ? `<div style="font-size:11px;color:var(--text-muted)">→ TO: ${outgoing.join(', ')}</div>` : ''}
    `;
  });

  document.getElementById('fitBtn').addEventListener('click', fit);
  document.getElementById('resetViewBtn').addEventListener('click', () => {
    svg.transition().duration(350).call(zoom.transform, d3.zoomIdentity);
  });
  document.getElementById('resetLayoutBtn').addEventListener('click', () => { applyLayout(); render(); fit(); });

  requestAnimationFrame(init);

  let resizeTimer;
  new ResizeObserver(() => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(init, 80);
  }).observe(networkEl);
})();
