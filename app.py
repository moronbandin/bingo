# app.py
import io
import random
from typing import List, Optional

import streamlit as st
from reportlab.lib.pagesizes import A4, landscape
from reportlab.pdfgen import canvas
from reportlab.lib.units import mm
from reportlab.lib import colors

st.set_page_config(page_title="Bingo grego: bombo e cartóns", layout="wide")

# --------- Alfabeto grego ---------
UPPER = ["Α","Β","Γ","Δ","Ε","Ζ","Η","Θ","Ι","Κ","Λ","Μ","Ν","Ξ","Ο","Π","Ρ","Σ","Τ","Υ","Φ","Χ","Ψ","Ω"]
LOWER = ["α","β","γ","δ","ε","ζ","η","θ","ι","κ","λ","μ","ν","ξ","ο","π","ρ","σ","τ","υ","φ","χ","ψ","ω"]
ALL_LETTERS = UPPER + LOWER  # 48

# ========= ESTILOS COMÚNS (Times New Roman) =========
CSS = """
<style>
body, .cell, .bigletter, .badge, .section-title, .count {
  font-family: "Times New Roman", Times, serif;
}
:root {
  --border: #1f2937; --bg: #ffffff; --text: #111827;
  --hit-bg: #fff3c4; --hit-border: #f59e0b; --muted: #6b7280;
}
.grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; }
.cell { border: 1.5px solid var(--border); border-radius: 10px; padding: 12px 0;
        text-align: center; font-size: 28px; font-weight: 800; background: var(--bg); color: var(--text);}
.cell.hit { background: var(--hit-bg); border-color: var(--hit-border); box-shadow: 0 0 0 2px rgba(245,158,11,0.25) inset;}
.bigcard { border: 2px solid var(--border); border-radius: 16px; padding: 18px; background: var(--bg); color: var(--text); text-align: center;}
.bigletter { font-size: 110px; font-weight: 900; line-height: 1; margin: 0;}
.badge { display:inline-block; margin-top:8px; padding:4px 10px; border-radius:999px; border:1px solid var(--border); font-weight:700; font-size:14px;}
.section-title { font-size: 16px; font-weight: 700; color: var(--muted); margin-bottom: 8px; text-transform: uppercase; }
.hr { height:1px; background:#d1d5db; margin:12px 0 16px 0; } .count { font-size:14px; color:var(--muted); }
</style>
"""
st.markdown(CSS, unsafe_allow_html=True)

# ========= PESTANAS =========
tab1, tab2 = st.tabs(["🎲 Bombo de letras", "🧾 Cartóns (PDF)"])

# ====================== TAB 1: BOMBO ======================
with tab1:
    # estado
    if "remaining" not in st.session_state:
        st.session_state.remaining = [("upper", i) for i in range(24)] + [("lower", i) for i in range(24)]
        random.shuffle(st.session_state.remaining)
    if "drawn" not in st.session_state:
        st.session_state.drawn = []
    if "last_draw" not in st.session_state:
        st.session_state.last_draw = None

    def draw_next():
        if not st.session_state.remaining:
            return None
        pick = st.session_state.remaining.pop(0)
        st.session_state.drawn.append(pick)
        st.session_state.last_draw = pick
        return pick

    def reset_bombo():
        st.session_state.remaining = [("upper", i) for i in range(24)] + [("lower", i) for i in range(24)]
        random.shuffle(st.session_state.remaining)
        st.session_state.drawn = []
        st.session_state.last_draw = None

    def render_grid(title, letters, case_tag):
        drawn_set = {i for (c, i) in st.session_state.drawn if c == case_tag}
        st.markdown(f"<div class='section-title'>{title}</div>", unsafe_allow_html=True)
        html = ["<div class='grid'>"]
        for i, ch in enumerate(letters):
            hit = "hit" if i in drawn_set else ""
            html.append(f"<div class='cell {hit}'>{ch}</div>")
        html.append("</div>")
        st.markdown("\n".join(html), unsafe_allow_html=True)

    def render_big_display(pick):
        if pick is None:
            st.markdown(
                "<div class='bigcard'><div class='count'>Preme “Sacar letra” para comezar</div>"
                "<div class='hr'></div><div class='bigletter'>–</div></div>", unsafe_allow_html=True)
            return
        case_tag, idx = pick
        letter = UPPER[idx] if case_tag == "upper" else LOWER[idx]
        badge = "MAIÚSCULA" if case_tag == "upper" else "MINÚSCULA"
        st.markdown(
            f"<div class='bigcard'><div class='count'>Última extraída</div><div class='hr'></div>"
            f"<div class='bigletter'>{letter}</div><div class='badge'>{badge}</div></div>",
            unsafe_allow_html=True,
        )

    head_l, head_r = st.columns([2,1])
    with head_l:
        st.subheader("Bombo de letras gregas")
    with head_r:
        st.metric("Bolas restantes", len(st.session_state.remaining))

    c1, c2, _ = st.columns([1.2,1,1])
    with c1:
        if st.button("🟢 Sacar letra", key="draw", use_container_width=True):
            draw_next()
    with c2:
        if st.button("🔁 Reiniciar", key="reset", use_container_width=True):
            reset_bombo()

    st.write("")
    render_big_display(st.session_state.last_draw)
    st.write("")
    g1, g2 = st.columns(2)
    with g1: render_grid("Maiúsculas (Α–Ω)", UPPER, "upper")
    with g2: render_grid("Minúsculas (α–ω)", LOWER, "lower")

# =============== TAB 2: CARTÓNS PDF (LETRAS) ===============
with tab2:
    st.subheader("Serie de 6 cartóns — Letras gregas (PDF)")

    # --- xeración da máscara 3x9 (5 por fila, 1–3 por columna) ---
    def make_mask():
        col_counts = [1]*9
        rem = 15 - sum(col_counts)
        while rem:
            i = random.choice([j for j,c in enumerate(col_counts) if c<3])
            col_counts[i]+=1; rem-=1
        grid = [[0]*9 for _ in range(3)]
        row_counts = [0,0,0]
        for j in random.sample(range(9),9):
            need = col_counts[j]
            opts = [r for r in range(3) if row_counts[r] < 5]
            if len(opts)<need: return make_mask()
            opts.sort(key=lambda r: row_counts[r]); random.shuffle(opts)
            for r in opts[:need]:
                grid[r][j]=1; row_counts[r]+=1
        if any(rc!=5 for rc in row_counts): return make_mask()
        return grid

    def choose_letters(global_counts):
        # 15 letras sen repetición, ponderadas para repartir ben na serie
        bag=[]
        for L in ALL_LETTERS:
            w = 1.0/(1+global_counts.get(L,0))
            bag.extend([L]*max(1,int(round(w*10))))
        picked=set()
        while len(picked)<15:
            picked.add(random.choice(bag))
        return list(picked)

    def generate_ticket(global_counts):
        mask = make_mask()
        letters = choose_letters(global_counts); random.shuffle(letters)
        t = [[None]*9 for _ in range(3)]
        k=0
        for r in range(3):
            for j in range(9):
                if mask[r][j]==1:
                    t[r][j]=letters[k]; global_counts[letters[k]]=global_counts.get(letters[k],0)+1; k+=1
        return t

    def generate_strip6():
        gc={}
        return [generate_ticket(gc) for _ in range(6)]

    # --- debuxo PDF (A4 apaisado, sen títulos nin notas) ---
    def draw_ticket(c: canvas.Canvas, x: float, y: float, w: float, h: float, ticket):
        rows, cols = 3, 9
        cw, rh = w/cols, h/rows
        c.setLineWidth(1.4); c.setStrokeColor(colors.orange)
        c.rect(x,y,w,h)
        for i in range(1,rows): c.line(x, y+i*rh, x+w, y+i*rh)
        for j in range(1,cols): c.line(x+j*cw, y, x+j*cw, y+h)
        fs = 0.70*min(cw, rh); fs = max(16, min(34, fs))
        c.setFont("Times-Bold", fs); c.setFillColor(colors.orange)
        for r in range(rows):
            for j in range(cols):
                val = ticket[r][j]
                if val:
                    cx = x + j*cw + cw/2
                    cy = y + (rows-1-r)*rh + rh/2
                    tw = c.stringWidth(val, "Times-Bold", fs)
                    c.drawString(cx - tw/2, cy - fs/2.8, val)
        c.setFillColor(colors.black)

    def build_pdf(tickets: List[List[List[Optional[str]]]], cols=3, rows=2,
                  margin_mm=6, gap_x_mm=6, gap_y_mm=6) -> bytes:
        buf = io.BytesIO()
        c = canvas.Canvas(buf, pagesize=landscape(A4))
        width, height = landscape(A4)

        margin = margin_mm*mm
        gap_x, gap_y = gap_x_mm*mm, gap_y_mm*mm

        avail_w = width - 2*margin - (cols-1)*gap_x
        avail_h = height - 2*margin - (rows-1)*gap_y
        card_w = avail_w/cols
        ideal_h = card_w/3
        card_h = min(avail_h/rows, ideal_h)

        total_h = rows*card_h + (rows-1)*gap_y
        y_offset = (height - 2*margin - total_h)/2

        idx=0
        for r in range(rows):
            for j in range(cols):
                x = margin + j*(card_w + gap_x)
                y = margin + y_offset + (rows-1-r)*(card_h + gap_y)
                draw_ticket(c, x, y, card_w, card_h, tickets[idx]); idx+=1

        c.showPage(); c.save(); buf.seek(0)
        return buf.getvalue()

    # Controis de tamaño (para “recalibrar” dende a UI)
    st.write("Axusta o **deseño do PDF** (apaisado) para cambiar o tamaño dos cartóns:")
    ca, cb, cc, cd, ce = st.columns(5)
    with ca: cols = st.number_input("Cartóns/fila", 1, 3, 3)
    with cb: rows = st.number_input("Filas", 1, 3, 2)
    with cc: margin = st.number_input("Marxe (mm)", 0, 20, 6)
    with cd: gapx = st.number_input("Espazo horizontal (mm)", 0, 20, 6)
    with ce: gapy = st.number_input("Espazo vertical (mm)", 0, 20, 6)

    if st.button("🎲 Xerar serie (PDF)", use_container_width=True):
        strip = generate_strip6()
        pdf = build_pdf(strip, cols=cols, rows=rows, margin_mm=margin, gap_x_mm=gapx, gap_y_mm=gapy)
        st.download_button("⬇️ Descargar PDF", data=pdf, file_name="cartons_gregos_6.pdf",
                           mime="application/pdf", use_container_width=True)
