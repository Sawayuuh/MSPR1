import streamlit as st
import pandas as pd
import plotly.express as px
import plotly.graph_objects as go
from utils.api_client import api_client
from utils.style import inject_css, page_header, kpi_cards, section_header

st.set_page_config(page_title="Analytics", page_icon="📊", layout="wide")
inject_css()
page_header("📊", "Analytics & Dashboard", "Vue consolidée des indicateurs clés de la plateforme")


@st.cache_data(ttl=60)
def fetch_all(endpoint: str, total_limit: int = 2000) -> list:
    all_data = []
    step = 1000
    for skip in range(0, total_limit, step):
        batch = api_client.get(endpoint, params={"skip": skip, "limit": step})
        if not batch:
            break
        all_data.extend(batch)
        if len(batch) < step:
            break
    return all_data


CHART_THEME = dict(
    paper_bgcolor="white",
    plot_bgcolor="white",
    font=dict(family="Inter, sans-serif", color="#374151"),
    margin=dict(t=40, b=10, l=10, r=10),
)

try:
    with st.spinner("Chargement des données…"):
        utilisateurs = fetch_all("/utilisateurs", total_limit=3000)
        aliments     = fetch_all("/aliments",     total_limit=1000)
        exercices    = fetch_all("/exercices",     total_limit=500)
        mesures      = fetch_all("/mesures",       total_limit=2000)

    df_users    = pd.DataFrame(utilisateurs) if utilisateurs else pd.DataFrame()
    df_aliments = pd.DataFrame(aliments)     if aliments     else pd.DataFrame()
    df_exercices= pd.DataFrame(exercices)    if exercices    else pd.DataFrame()
    df_mesures  = pd.DataFrame(mesures)      if mesures      else pd.DataFrame()

except Exception as e:
    st.error(f"Impossible de charger les données depuis l'API : {e}")
    st.stop()

# ── KPIs ─────────────────────────────────────────────────────────────────────
kpi_cards([
    {"icon": "👥", "value": len(df_users),    "label": "Utilisateurs"},
    {"icon": "🍎", "value": len(df_aliments), "label": "Aliments"},
    {"icon": "🏋️", "value": len(df_exercices),"label": "Exercices"},
    {"icon": "📏", "value": len(df_mesures),  "label": "Mesures biométriques"},
])

# ── Utilisateurs ──────────────────────────────────────────────────────────────
section_header("👥", "Utilisateurs")

col_abo, col_sexe, col_age = st.columns(3)

with col_abo:
    if "type_abonnement" in df_users.columns:
        abo = df_users["type_abonnement"].value_counts().reset_index()
        abo.columns = ["Abonnement", "Nombre"]
        fig = px.pie(abo, names="Abonnement", values="Nombre",
                     title="Répartition des abonnements",
                     color_discrete_sequence=["#667eea","#764ba2","#10b981","#f59e0b"],
                     hole=0.42)
        fig.update_layout(**CHART_THEME)
        st.plotly_chart(fig, use_container_width=True)

with col_sexe:
    if "sexe" in df_users.columns:
        sexe = df_users["sexe"].value_counts().reset_index()
        sexe.columns = ["Sexe", "Nombre"]
        fig = px.pie(sexe, names="Sexe", values="Nombre",
                     title="Répartition Hommes / Femmes",
                     color_discrete_sequence=["#3b82f6","#ec4899","#94a3b8"],
                     hole=0.42)
        fig.update_layout(**CHART_THEME)
        st.plotly_chart(fig, use_container_width=True)

with col_age:
    if "age" in df_users.columns:
        ages = pd.to_numeric(df_users["age"], errors="coerce").dropna()
        fig = px.histogram(ages, x=ages, nbins=20, title="Distribution des âges",
                           labels={"x": "Âge"},
                           color_discrete_sequence=["#667eea"])
        fig.update_layout(**CHART_THEME, showlegend=False)
        fig.update_traces(marker_line_width=0)
        st.plotly_chart(fig, use_container_width=True)

if {"poids","taille","type_abonnement"}.issubset(df_users.columns):
    df_imc = df_users.copy()
    df_imc["poids"] = pd.to_numeric(df_imc["poids"], errors="coerce")
    df_imc["taille"] = pd.to_numeric(df_imc["taille"], errors="coerce")
    df_imc = df_imc.dropna(subset=["poids","taille"])
    df_imc = df_imc[df_imc["taille"] > 0]
    df_imc["IMC"] = df_imc["poids"] / (df_imc["taille"] / 100) ** 2
    imc_abo = df_imc.groupby("type_abonnement")["IMC"].mean().reset_index()
    imc_abo.columns = ["Abonnement", "IMC moyen"]
    fig = px.bar(imc_abo, x="Abonnement", y="IMC moyen",
                 title="IMC moyen par type d'abonnement",
                 color="Abonnement",
                 color_discrete_sequence=["#667eea","#764ba2","#10b981","#f59e0b"],
                 text_auto=".1f")
    fig.update_layout(**CHART_THEME, showlegend=False)
    fig.update_traces(marker_line_width=0)
    st.plotly_chart(fig, use_container_width=True)

# ── Aliments ─────────────────────────────────────────────────────────────────
section_header("🍎", "Aliments")

col_top, col_macro = st.columns(2)

with col_top:
    if "calories" in df_aliments.columns and "nom" in df_aliments.columns:
        df_aliments["calories"] = pd.to_numeric(df_aliments["calories"], errors="coerce")
        top = df_aliments.nlargest(15, "calories")[["nom","calories"]].dropna()
        fig = px.bar(top, y="nom", x="calories", orientation="h",
                     title="Top 15 aliments les plus caloriques",
                     labels={"calories":"Calories (kcal)","nom":""},
                     color="calories", color_continuous_scale="Reds")
        fig.update_layout(**CHART_THEME, yaxis=dict(autorange="reversed"))
        fig.update_coloraxes(showscale=False)
        st.plotly_chart(fig, use_container_width=True)

with col_macro:
    macro_cols = ["proteines","glucides","lipides","fibres"]
    present = [c for c in macro_cols if c in df_aliments.columns]
    if present:
        moyennes = {c: pd.to_numeric(df_aliments[c], errors="coerce").mean() for c in present}
        fig = go.Figure(go.Bar(
            x=list(moyennes.keys()), y=list(moyennes.values()),
            marker_color=["#3b82f6","#f59e0b","#ef4444","#10b981"],
            text=[f"{v:.1f}g" for v in moyennes.values()], textposition="outside",
        ))
        fig.update_layout(title="Macronutriments moyens (pour 100g)",
                          xaxis_title="", yaxis_title="Quantité (g)", **CHART_THEME)
        st.plotly_chart(fig, use_container_width=True)

if "calories" in df_aliments.columns:
    cal = pd.to_numeric(df_aliments["calories"], errors="coerce").dropna()
    cal = cal[cal < 1000]
    fig = px.histogram(cal, x=cal, nbins=30, title="Distribution des calories (aliments)",
                       labels={"x":"Calories (kcal)"}, color_discrete_sequence=["#ef4444"])
    fig.update_layout(**CHART_THEME, showlegend=False)
    st.plotly_chart(fig, use_container_width=True)

# ── Exercices ─────────────────────────────────────────────────────────────────
section_header("🏋️", "Exercices")

col_type, col_niveau, col_muscle = st.columns(3)

with col_type:
    if "type" in df_exercices.columns:
        tc = df_exercices["type"].value_counts().reset_index()
        tc.columns = ["Type","Nombre"]
        fig = px.pie(tc, names="Type", values="Nombre", title="Par type",
                     color_discrete_sequence=["#3b82f6","#ef4444","#10b981","#94a3b8"],
                     hole=0.42)
        fig.update_layout(**CHART_THEME)
        st.plotly_chart(fig, use_container_width=True)

with col_niveau:
    if "niveau" in df_exercices.columns:
        nc = df_exercices["niveau"].value_counts().reset_index()
        nc.columns = ["Niveau","Nombre"]
        fig = px.bar(nc, x="Niveau", y="Nombre", title="Par niveau",
                     color="Niveau",
                     color_discrete_map={"debutant":"#10b981","intermediaire":"#f59e0b","avance":"#ef4444"},
                     text_auto=True)
        fig.update_layout(**CHART_THEME, showlegend=False)
        st.plotly_chart(fig, use_container_width=True)

with col_muscle:
    if "groupe_musculaire" in df_exercices.columns:
        mc = (df_exercices["groupe_musculaire"].dropna()
              .value_counts().head(10).reset_index())
        mc.columns = ["Groupe musculaire","Nombre"]
        fig = px.bar(mc, y="Groupe musculaire", x="Nombre", orientation="h",
                     title="Top 10 groupes musculaires",
                     color="Nombre", color_continuous_scale="Blues")
        fig.update_layout(**CHART_THEME, yaxis=dict(autorange="reversed"))
        fig.update_coloraxes(showscale=False)
        st.plotly_chart(fig, use_container_width=True)

# ── Mesures biométriques ──────────────────────────────────────────────────────
section_header("📏", "Mesures biométriques")

if df_mesures.empty:
    st.info("Aucune mesure biométrique disponible.")
else:
    col_bpm, col_cal = st.columns(2)
    with col_bpm:
        if "frequence_cardiaque" in df_mesures.columns:
            bpm = pd.to_numeric(df_mesures["frequence_cardiaque"], errors="coerce").dropna()
            fig = px.histogram(bpm, x=bpm, nbins=30, title="Fréquence cardiaque (BPM)",
                               labels={"x":"BPM"}, color_discrete_sequence=["#ec4899"])
            fig.update_layout(**CHART_THEME, showlegend=False)
            st.plotly_chart(fig, use_container_width=True)
    with col_cal:
        if "calories_brulees" in df_mesures.columns:
            cal = pd.to_numeric(df_mesures["calories_brulees"], errors="coerce").dropna()
            fig = px.histogram(cal, x=cal, nbins=30, title="Calories brûlées",
                               labels={"x":"Calories"}, color_discrete_sequence=["#f59e0b"])
            fig.update_layout(**CHART_THEME, showlegend=False)
            st.plotly_chart(fig, use_container_width=True)

    st.markdown("#### Statistiques descriptives")
    nums = df_mesures.select_dtypes(include="number")
    if not nums.empty:
        st.dataframe(nums.describe().round(2), use_container_width=True)

st.caption("Données actualisées toutes les 60 secondes · Source : API HealthAI Coach")
