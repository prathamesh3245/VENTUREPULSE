import streamlit as st
import pandas as pd
import plotly.express as px
import os
from groq import Groq

# --- 1. AI SETUP (GROQ / DEEPSEEK) ---
# It is highly recommended to use st.secrets for this in production
api_key = os.getenv(GROQ_API_KEY)
client = Groq(api_key)

# --- 2. DATA ENGINE ---
@st.cache_data
def load_and_analyze_data():
    file_path = "Final_Financial_Dataset_Practical.xlsx"
    
    try:
        # 1. LOAD DATA (Excel or CSV)
        if file_path.endswith('.xlsx'):
            df = pd.read_excel(file_path, engine='openpyxl')
        else:
            df = pd.read_csv(file_path, encoding='latin1', on_bad_lines='skip')

        # 2. CLEAN HEADERS
        df.columns = [str(c).strip().lower().replace(' ', '_') for c in df.columns]
        
        # 3. DEDUPLICATE COLUMNS (Fixes the 'arg must be a list' error)
        df = df.loc[:, ~df.columns.duplicated(keep='last')]

        # 4. SANITIZE DATA
        if 'name' in df.columns:
            df['name'] = df['name'].astype(str).str.strip()
            
            numeric_cols = ['funding_total_usd', 'churn_rate', 'month_1_revenue', 'month_6_revenue']
            for col in numeric_cols:
                if col in df.columns:
                    df[col] = pd.to_numeric(df[col], errors='coerce').fillna(0)
            
            # Special handling for Churn Rate outliers
            df.loc[df['churn_rate'] > 100, 'churn_rate'] = 0

            # 5. CALCULATE GROWTH
            if 'month_1_revenue' in df.columns and 'month_6_revenue' in df.columns:
                # Adding 1 to denominator to avoid division by zero
                df['growth_rate'] = (df['month_6_revenue'] - df['month_1_revenue']) / (df['month_1_revenue'] + 1)
            
            return df
        else:
            st.error("Column 'name' not found in file.")
            return None

    except Exception as e:
        st.error(f"Engine Load Error: {e}")
        return None

# --- 3. AI INSIGHTS FUNCTION (DEEPSEEK R1) ---
def get_insights(data):
    # This list is ordered from "Best Reasoning" to "Most Stable Fallback"
    # Based on current Feb 2026 Groq availability
    candidate_models = [
        "deepseek-r1-distill-llama-70b", # Check if original is back
        "qwen/qwen3-32b",                # Latest Qwen 3 (Excellent for logic)
        "llama-3.3-70b-versatile",       # Reliable industry standard
        "meta-llama/llama-4-scout-17b"   # New Llama 4 preview
    ]

    prompt = f"""
    Analyze the following startup data and provide a VC-style brief:
    - Company: {data['name']}
    - Funding: ${data['funding_total_usd']:,.0f}
    - Churn Rate: {data['churn_rate']:.2f}%
    - Growth (6mo): {data.get('growth_rate', 0):.1%}
    
    Provide sections for Financial Health, Growth Potential, and a Final Recommendation.
    """

    for model_id in candidate_models:
        try:
            completion = client.chat.completions.create(
                model=model_id,
                messages=[
                    {"role": "system", "content": "You are a senior VC Analyst. Be concise."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.6
            )
            # If successful, return the text and the model used (for transparency)
            return f"Analysis by {model_id}:\n\n{completion.choices[0].message.content}"
        except Exception as e:
            # If this model fails, continue to the next one in the list
            continue
    
    return "All AI models are currently unavailable. Please check your Groq Dashboard."

# --- 4. UI LAYOUT ---
st.set_page_config(page_title="VenturePulse AI", layout="wide")

# Hide the "Python is looking in" debug info for a cleaner look
# st.write(f"Python path debug hidden for production")

df = load_and_analyze_data()

if df is not None:
    # Sidebar
    st.sidebar.header("Navigation")
    names_list = sorted(df['name'].unique())
    selected_name = st.sidebar.selectbox("🔍 Select Organization", names_list)
    
    # Get specific startup data
    data = df[df['name'] == selected_name].iloc[0]

    st.title(f"🚀 {selected_name} | Predictive Dashboard")

    # Metrics Row
    c1, c2, c3 = st.columns(3)
    c1.metric("Revenue Growth (6mo)", f"{data.get('growth_rate', 0):.1%}")
    c2.metric("Churn Rate", f"{data['churn_rate']:.2f}%")
    c3.metric("Total Funding", f"${data['funding_total_usd']:,.0f}")

    # AI Section
    st.divider()
    st.subheader("🤖 DeepSeek R1 Analyst Insights")
    
    if st.button("Generate VC Report"):
        with st.spinner("DeepSeek R1 is analyzing metrics..."):
            insights = get_insights(data)
            # Use markdown for better formatting of bullet points
            st.markdown(insights)
    else:
        st.info("Click the button above to run the AI Financial Analysis.")

    # Chart Section
    st.divider()
    rev_cols = ['month_1_revenue', 'month_2_revenue', 'month_3_revenue', 'month_4_revenue', 'month_5_revenue', 'month_6_revenue']
    # Filter only columns that actually exist in the data
    existing_rev_cols = [col for col in rev_cols if col in data]
    rev_values = [data[col] for col in existing_rev_cols]
    
    if rev_values:
        fig = px.area(
            x=[f"Month {i+1}" for i in range(len(rev_values))], 
            y=rev_values, 
            title="Revenue Momentum (Last 6 Months)",
            labels={'x': 'Timeline', 'y': 'Revenue (USD)'}
        )
        st.plotly_chart(fig, use_container_width=True)