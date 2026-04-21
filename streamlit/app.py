import streamlit as st
from utils.style import inject_css, kpi_cards

st.set_page_config(
    page_title="HealthAI Coach",
    page_icon="💪",
    layout="wide",
    initial_sidebar_state="expanded",
)

inject_css()

try:
    from utils.api_client import api_client
    api_connected = True
except Exception:
    api_connected = False


@st.cache_data(ttl=30)
def get_stats():
    stats = {"utilisateurs": 0, "aliments": 0, "exercices": 0, "sessions": 0}
    if not api_connected:
        return stats
    for key, endpoint in [("utilisateurs", "/utilisateurs"), ("aliments", "/aliments"), ("exercices", "/exercices")]:
        try:
            stats[key] = len(api_client.get(endpoint))
        except Exception:
            pass
    return stats


stats = get_stats()

# ── Hero ────────────────────────────────────────────────────────────────────
st.markdown("""
<div style="
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 20px; padding: 3rem 2.5rem; margin-bottom: 2rem;
    color: white; text-align: center;
    box-shadow: 0 12px 48px rgba(102,126,234,0.35);
">
    <div style="font-size:3rem;margin-bottom:0.5rem;">💪</div>
    <h1 style="font-size:2.4rem;font-weight:800;margin:0;color:white;">HealthAI Coach</h1>
    <p style="font-size:1.1rem;opacity:0.88;margin:0.6rem 0 1.2rem 0;">
        Plateforme de coaching santé personnalisé — Backend Métier
    </p>
    <span style="
        display:inline-flex;align-items:center;gap:0.4rem;
        padding:0.4rem 1rem;border-radius:999px;font-size:0.85rem;font-weight:600;
        background:rgba(255,255,255,0.2);border:1px solid rgba(255,255,255,0.35);
    ">
        {} {}
    </span>
</div>
""".format(
    "● Système opérationnel" if api_connected else "● API non disponible",
    "" if api_connected else ""
), unsafe_allow_html=True)

# ── KPI Cards ───────────────────────────────────────────────────────────────
kpi_cards([
    {"icon": "👥", "value": stats["utilisateurs"], "label": "Utilisateurs"},
    {"icon": "🍎", "value": stats["aliments"],     "label": "Aliments"},
    {"icon": "🏋️", "value": stats["exercices"],    "label": "Exercices"},
    {"icon": "🚀", "value": "∞",                   "label": "Possibilités"},
])

# ── Features ─────────────────────────────────────────────────────────────────
st.markdown('<div class="section-hdr">🚀 Fonctionnalités</div>', unsafe_allow_html=True)

FEATURES = [
    ("linear-gradient(135deg,#a8edea,#fed6e3)", "👤", "Gestion des utilisateurs",
     "Créez et gérez les profils utilisateurs avec leurs objectifs, données biométriques et abonnements."),
    ("linear-gradient(135deg,#d299c2,#fef9d7)", "🍎", "Catalogue nutritionnel",
     "Base de données de 500 aliments avec valeurs nutritionnelles détaillées pour 100g."),
    ("linear-gradient(135deg,#89f7fe,#66a6ff)", "🏋️", "Bibliothèque d'exercices",
     "200 exercices classés par groupe musculaire, niveau de difficulté et équipement requis."),
    ("linear-gradient(135deg,#a1c4fd,#c2e9fb)", "📔", "Journal alimentaire",
     "Suivi quotidien des repas et analyse des habitudes nutritionnelles par utilisateur."),
    ("linear-gradient(135deg,#f093fb,#f5576c)", "🏃", "Sessions sportives",
     "Historique des entraînements avec durée, intensité et calories brûlées."),
    ("linear-gradient(135deg,#4facfe,#00f2fe)", "📊", "Mesures biométriques",
     "Suivi du poids, fréquence cardiaque, sommeil et calories brûlées dans le temps."),
]

cols = st.columns(3)
for i, (grad, icon, title, desc) in enumerate(FEATURES):
    with cols[i % 3]:
        st.markdown(f"""
        <div style="
            background:white;border-radius:14px;padding:1.5rem;
            border:1px solid #e2e8f0;box-shadow:0 2px 8px rgba(0,0,0,0.04);
            margin-bottom:1rem;transition:all 0.2s;
        ">
            <div style="
                width:46px;height:46px;border-radius:12px;
                background:{grad};display:flex;align-items:center;
                justify-content:center;font-size:1.4rem;margin-bottom:0.8rem;
            ">{icon}</div>
            <div style="font-size:1rem;font-weight:700;color:#1e293b;margin-bottom:0.4rem;">{title}</div>
            <div style="font-size:0.85rem;color:#64748b;line-height:1.5;">{desc}</div>
        </div>
        """, unsafe_allow_html=True)

# ── Quick actions ─────────────────────────────────────────────────────────────
st.markdown('<div class="section-hdr">⚡ Navigation rapide</div>', unsafe_allow_html=True)
col1, col2, col3 = st.columns(3)
with col1:
    if st.button("👤 Utilisateurs", use_container_width=True):
        st.switch_page("pages/1_👤_Utilisateurs.py")
with col2:
    if st.button("🍎 Aliments", use_container_width=True):
        st.switch_page("pages/2_🍎_Aliments.py")
with col3:
    if st.button("🏋️ Exercices", use_container_width=True):
        st.switch_page("pages/3_🏋️_Exercices.py")

# ── Sidebar ───────────────────────────────────────────────────────────────────
st.sidebar.markdown("""
<div style="text-align:center;padding:1.2rem 0 0.5rem 0;">
    <div style="font-size:2rem;">💪</div>
    <div style="font-size:1.1rem;font-weight:700;color:#f1f5f9;">HealthAI Coach</div>
    <div style="font-size:0.75rem;color:#64748b;">v1.0.0 — MSPR TPRE501</div>
</div>
""", unsafe_allow_html=True)

st.sidebar.markdown("---")
st.sidebar.markdown("### 🔌 État du système")
if api_connected:
    st.sidebar.success("API connectée")
    st.sidebar.caption(f"👥 {stats['utilisateurs']} · 🍎 {stats['aliments']} · 🏋️ {stats['exercices']}")
else:
    st.sidebar.error("API non disponible")

st.sidebar.markdown("---")
st.sidebar.markdown("### 🔗 Liens")
st.sidebar.markdown("""
- [📚 Swagger UI](http://localhost:8000/docs)
- [📖 ReDoc](http://localhost:8000/redoc)
- [🔧 Supabase Studio](http://localhost:54323)
""")
st.sidebar.markdown("---")
st.sidebar.caption("© 2025 MSPR Santé Connectée")
