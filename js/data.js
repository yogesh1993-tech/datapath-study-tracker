/* =========================================================================
   CURRICULUM DATA  (Data Analyst / Data Scientist / ML Engineer)
   w = industry weightage per role [Analyst, Scientist, ML-Engineer], 0-10
   h = estimated study hours,  l = level (1 Beginner, 2 Intermediate, 3 Advanced)
   Subtopics are keyed by their index - append new ones at the END only.
   ========================================================================= */
(function () {
  "use strict";

  const T = (id, title, w, h, l, subs, tip) => ({ id, title, w, h, l, subs: subs.split("|"), tip: tip || "" });

  const TRACKS = [
    /* ------------------------------------------------------------ EXCEL */
    {
      id: "excel", name: "Excel", icon: "📗", c: 0,
      desc: "The universal analyst tool. Fast cleaning, lookups, pivots and dashboards - asked in almost every analyst interview.",
      res: [["Exceljet - formulas & shortcuts", "https://exceljet.net/"], ["Microsoft Excel Help", "https://support.microsoft.com/excel"], ["Chandoo - dashboards", "https://chandoo.org/"]],
      topics: [
        T("xl-basics", "Excel Foundations & Navigation", [8, 4, 1], 4, 1, "Workbook, sheets & ribbon tour|Data types & number formats|Relative, absolute & mixed references ($A$1)|Fill handle, Flash Fill, custom lists|Find/Replace & Go To Special|Freeze panes, named ranges, tables (Ctrl+T)|Keyboard shortcuts for speed", "Learn 15 shortcuts first - speed is visible in live tests."),
        T("xl-clean", "Data Cleaning & Preparation", [9, 5, 1], 6, 1, "Remove duplicates|Text to Columns|TRIM, CLEAN, UPPER/LOWER/PROPER|LEFT, RIGHT, MID, FIND, SUBSTITUTE|TEXTSPLIT, TEXTJOIN, CONCAT|Data validation & dropdown lists|IFERROR / IFNA for errors|Handling blanks & inconsistent data", "Analysts spend ~60% of time cleaning data."),
        T("xl-formulas", "Core & Logical Formulas", [9, 4, 1], 8, 1, "SUM, AVERAGE, COUNT, COUNTA, COUNTBLANK|SUMIF(S), COUNTIF(S), AVERAGEIF(S)|IF, nested IF, IFS, SWITCH|AND, OR, NOT|MIN, MAX, LARGE, SMALL, RANK|ROUND, ROUNDUP, MOD, INT|Formula auditing (Evaluate Formula, F9, Trace)"),
        T("xl-lookup", "Lookup & Reference Functions", [10, 4, 1], 6, 2, "VLOOKUP and its limitations|HLOOKUP|INDEX + MATCH|XLOOKUP (exact, approximate, wildcard)|XMATCH|Multi-criteria lookups|Approximate match for slabs & grades|OFFSET / INDIRECT (and why to avoid)", "VLOOKUP/XLOOKUP is the #1 Excel interview question."),
        T("xl-date", "Date, Time & Text Functions", [7, 3, 0], 4, 1, "TODAY, NOW, DATE, EDATE, EOMONTH|YEAR, MONTH, DAY, WEEKDAY|DATEDIF, NETWORKDAYS, WORKDAY|TEXT() for custom formatting|Converting text to real dates|Ageing / tenure buckets"),
        T("xl-dynamic", "Dynamic Arrays & Modern Excel", [8, 3, 0], 5, 2, "FILTER|SORT & SORTBY|UNIQUE|SEQUENCE|LET & LAMBDA|Spill ranges & # operator|Combining XLOOKUP + FILTER|Legacy array (CSE) formulas"),
        T("xl-pivot", "Pivot Tables & Pivot Charts", [10, 5, 1], 8, 2, "Build & lay out a pivot table|Group dates, numbers & text|Calculated fields & items|Show Values As (% of total, running total)|Slicers & timelines|Pivot charts|GETPIVOTDATA|Refresh & source-range best practices", "Be able to build a pivot in under 2 minutes."),
        T("xl-charts", "Charts, Conditional Formatting & Dashboards", [8, 3, 0], 7, 2, "Choosing the right chart|Combo charts & secondary axis|Sparklines|Conditional formatting (data bars, icon sets, formulas)|Interactive dashboard with slicers|Waterfall, histogram, Pareto|Formatting for clarity"),
        T("xl-pq", "Power Query & Power Pivot (Data Model)", [8, 3, 1], 8, 2, "Get & Transform data|Merge & append queries|Unpivot / pivot columns|Custom columns & M basics|Data model & relationships|DAX basics (measures, CALCULATE)|Refresh & parameters", "Power Query = repeatable cleaning with zero formulas."),
        T("xl-analysis", "Data Analysis Toolkit", [7, 5, 0], 5, 2, "Analysis ToolPak (descriptive stats)|Goal Seek|Data Tables & Scenario Manager|Solver (optimization)|Correlation & regression in Excel|Advanced filters & sorting|FORECAST, STDEV, CORREL"),
        T("xl-vba", "Macros, VBA & Automation (Bonus)", [4, 2, 0], 10, 3, "Recording macros|VBA basics (variables, loops)|Office Scripts / Power Automate|Protecting sheets & workbooks")
      ]
    },
    /* -------------------------------------------------------------- SQL */
    {
      id: "sql", name: "SQL", icon: "🗃️", c: 1,
      desc: "The most tested skill for analysts and data scientists. Window functions and analytical patterns separate good from great.",
      res: [["SQLBolt - interactive lessons", "https://sqlbolt.com/"], ["Mode SQL Tutorial", "https://mode.com/sql-tutorial/"], ["LeetCode - Database", "https://leetcode.com/problemset/database/"], ["HackerRank SQL", "https://www.hackerrank.com/domains/sql"], ["StrataScratch - real interview Qs", "https://www.stratascratch.com/"], ["PostgreSQL docs", "https://www.postgresql.org/docs/"]],
      topics: [
        T("sql-basics", "SQL Fundamentals (SELECT, WHERE)", [10, 9, 7], 5, 1, "Relational concepts, keys, ER basics|SELECT, DISTINCT, aliases|WHERE with AND/OR/NOT, IN, BETWEEN|LIKE & wildcards|ORDER BY, LIMIT/TOP, OFFSET|NULL handling (IS NULL, COALESCE)|Data types & CAST|Logical order of query execution"),
        T("sql-agg", "Aggregations & GROUP BY", [10, 9, 7], 5, 1, "COUNT, SUM, AVG, MIN, MAX|GROUP BY multiple columns|HAVING vs WHERE|COUNT(*) vs COUNT(col) vs COUNT(DISTINCT)|Conditional aggregation (SUM + CASE)|ROLLUP, CUBE, GROUPING SETS"),
        T("sql-joins", "Joins & Set Operations", [10, 9, 8], 7, 2, "INNER, LEFT, RIGHT, FULL OUTER|CROSS & SELF joins|Multi-key and non-equi joins|Anti-join & semi-join (NOT EXISTS / EXISTS)|UNION vs UNION ALL, INTERSECT, EXCEPT|Join fan-out & duplicate pitfalls", "Interviewers love: LEFT JOIN + WHERE filter on right table trap."),
        T("sql-sub", "Subqueries & CTEs", [9, 8, 7], 6, 2, "Scalar, column & table subqueries|Correlated subqueries|EXISTS / NOT EXISTS|CTEs (WITH clause)|Chained CTEs for readability|Recursive CTEs (hierarchies)|CTE vs subquery vs temp table"),
        T("sql-window", "Window Functions", [10, 9, 7], 8, 3, "OVER, PARTITION BY, ORDER BY|ROW_NUMBER, RANK, DENSE_RANK, NTILE|LAG & LEAD|Running totals & moving averages (frames)|FIRST_VALUE / LAST_VALUE|Top-N per group|Percent of total|MoM / YoY growth", "Most-asked advanced SQL topic. Practise 30+ problems."),
        T("sql-func", "CASE, String & Date Functions", [8, 6, 5], 5, 1, "CASE WHEN logic|String functions (SUBSTRING, CONCAT, REPLACE, TRIM)|Date functions (DATE_TRUNC, DATEDIFF, EXTRACT)|CAST & type conversion|Regex in SQL|JSON / semi-structured functions"),
        T("sql-analytics", "Analytical SQL Patterns (Interview)", [9, 8, 5], 8, 3, "Cohort & retention analysis|Funnel analysis|Gaps & islands|Sessionization|Median & percentiles|Latest record per key / de-duplication|Pivot with CASE|Rolling metrics|RFM & customer lifetime value", "Real business questions: churn, retention, conversion."),
        T("sql-design", "Database Design, DDL & DML", [6, 5, 6], 6, 2, "CREATE / ALTER / DROP|INSERT, UPDATE, DELETE, MERGE|Primary, foreign & unique keys, constraints|Normalization (1NF-3NF) & denormalization|Star & snowflake schemas|Views & materialized views|Transactions & ACID"),
        T("sql-perf", "Indexing & Query Optimization", [5, 5, 7], 6, 3, "How B-tree indexes work|EXPLAIN / query plans|Sargable predicates, avoid SELECT *|Partitioning & clustering|Join algorithms (hash, nested loop, merge)|Statistics & caching"),
        T("sql-tools", "SQL Tools & Python Integration", [6, 7, 6], 4, 2, "Install PostgreSQL / SQLite / MySQL|DBeaver, SSMS, pgAdmin|Dialect differences (LIMIT vs TOP)|BigQuery / Snowflake basics|SQLAlchemy & pandas.read_sql|Stored procedures & functions"),
        T("sql-nosql", "NoSQL & Data Warehousing (Bonus)", [3, 4, 5], 5, 2, "SQL vs NoSQL|MongoDB basics|OLTP vs OLAP|Data warehouse vs data lake vs lakehouse|Columnar storage (Parquet)")
      ]
    },
    /* ----------------------------------------------------------- PYTHON */
    {
      id: "python", name: "Python", icon: "🐍", c: 2,
      desc: "Core language for analysis, data science and ML. Pandas + EDA is the daily bread of every data role.",
      res: [["Python Tutorial (official)", "https://docs.python.org/3/tutorial/"], ["Kaggle Learn - Python & Pandas", "https://www.kaggle.com/learn"], ["pandas User Guide", "https://pandas.pydata.org/docs/user_guide/"], ["Real Python", "https://realpython.com/"]],
      topics: [
        T("py-core", "Python Basics & Syntax", [9, 10, 10], 10, 1, "Install, venv, Jupyter & VS Code|Variables, types & operators|Strings & f-strings|Lists, tuples, sets, dicts|Conditionals & loops|Functions, *args/**kwargs, lambda|Comprehensions|Exceptions (try/except)|File I/O (txt, csv, json)|Modules & packages"),
        T("py-oop", "OOP, Decorators & Clean Code", [4, 7, 9], 8, 2, "Classes, objects, inheritance|Dunder methods|Generators & iterators|Decorators & context managers|Type hints|PEP8, docstrings, linting (ruff/black)|Unit tests with pytest|Logging & debugging"),
        T("py-numpy", "NumPy", [8, 9, 9], 6, 1, "ndarray, dtypes, shapes|Indexing, slicing, boolean masks|Broadcasting|Vectorization vs loops|Aggregations & axis|Linear algebra (dot, inv, eig)|Random numbers & seeds"),
        T("py-pandas", "Pandas - Data Manipulation", [10, 10, 8], 14, 2, "Series & DataFrame|Read/write CSV, Excel, SQL, JSON|loc / iloc / query|Filter, sort, assign|groupby, agg, transform|merge, join, concat|pivot_table, melt, crosstab|Missing data & duplicates|String & datetime accessors|apply / map & performance tips|Rolling & expanding windows|Memory optimization & categoricals", "The single most important library for analysts."),
        T("py-eda", "Exploratory Data Analysis (EDA)", [10, 10, 7], 8, 2, "Data profiling workflow|Univariate, bivariate, multivariate analysis|Outliers (IQR, z-score)|Correlation analysis|Missing-value patterns|Target analysis & leakage checks|Automated EDA (ydata-profiling)|Writing clear insights"),
        T("py-viz", "Visualization (Matplotlib, Seaborn, Plotly)", [9, 9, 6], 8, 2, "Matplotlib anatomy (figure/axes)|Seaborn statistical plots|Histogram, box, violin, scatter, heatmap|Time-series plots|Plotly interactive charts|Streamlit / Dash dashboards|Labels, colour & accessibility"),
        T("py-clean", "Data Wrangling & Quality", [9, 9, 8], 6, 2, "Fixing types & dates|Text cleaning & regex|Merging messy sources|Reshaping long/wide|Data quality checks (pandera / Great Expectations)|Reproducible cleaning pipelines"),
        T("py-scrape", "Web Scraping & APIs", [5, 6, 5], 6, 2, "requests & REST APIs|JSON parsing|Authentication & pagination|BeautifulSoup|Selenium / Playwright basics|Rate limits, robots.txt & ethics"),
        T("py-dsa", "DSA & Problem Solving", [4, 6, 8], 20, 2, "Big-O basics|Arrays, strings & hashing|Two pointers & sliding window|Stack, queue, linked list|Trees & graphs basics|Sorting & searching|Recursion & basic DP|Practice: LeetCode / HackerRank (Easy to Medium)"),
        T("py-auto", "Automation & Productivity (Bonus)", [5, 4, 5], 6, 2, "Automate Excel (openpyxl / xlwings)|Report & email automation|Scheduling (Task Scheduler / cron)|CLI scripts with argparse|Share insights with Streamlit")
      ]
    },
    /* ------------------------------------------------------------ STATS */
    {
      id: "stats", name: "Statistics & Probability", icon: "📊", c: 3,
      desc: "The foundation of every data decision: from reading distributions to proving an A/B test actually worked.",
      res: [["Khan Academy - Statistics", "https://www.khanacademy.org/math/statistics-probability"], ["StatQuest (YouTube)", "https://www.youtube.com/@statquest"], ["OpenIntro Statistics (free book)", "https://www.openintro.org/book/os/"], ["Seeing Theory - visual stats", "https://seeing-theory.brown.edu/"]],
      topics: [
        T("st-desc", "Descriptive Statistics", [9, 9, 6], 5, 1, "Mean, median, mode|Variance, SD, range, IQR|Skewness & kurtosis|Percentiles & quartiles|Distribution shapes|Covariance & correlation (Pearson, Spearman)"),
        T("st-prob", "Probability Basics", [7, 9, 8], 7, 1, "Sample space & events|Conditional probability|Bayes theorem|Independence & mutual exclusivity|Permutations & combinations|Expected value & variance|Law of large numbers"),
        T("st-dist", "Probability Distributions", [8, 9, 8], 7, 2, "Bernoulli & Binomial|Poisson & Exponential|Normal & Z-score|Uniform|t, Chi-square, F distributions|Central Limit Theorem|Sampling distributions"),
        T("st-inf", "Inferential Statistics & Estimation", [8, 9, 6], 7, 2, "Sampling methods & bias|Standard error|Confidence intervals|Point vs interval estimates|Bootstrapping|Population vs sample"),
        T("st-hyp", "Hypothesis Testing", [9, 9, 6], 9, 2, "Null & alternative, p-value, alpha|Type I & II errors, power|Z-test & t-tests (1-sample, 2-sample, paired)|Chi-square test|ANOVA|Non-parametric tests (Mann-Whitney)|Multiple-testing correction|Effect size & practical significance", "Explain a p-value in plain English - guaranteed question."),
        T("st-ab", "A/B Testing & Experimentation", [9, 9, 5], 8, 3, "Hypothesis & metric design|Sample-size & power calculation|Randomization & sample-ratio mismatch|Peeking & stopping rules|Guardrail metrics & interpretation|Causal inference basics (DiD, propensity)|CUPED & Bayesian A/B|Common pitfalls", "Top-demand skill for product/marketing analytics."),
        T("st-reg", "Regression & Correlation", [7, 9, 7], 8, 2, "Simple & multiple linear regression|Assumptions (LINE)|R-squared & adjusted R-squared|Coefficient interpretation|Multicollinearity (VIF)|Residual diagnostics|Logistic regression & odds ratio"),
        T("st-ts", "Time Series Analysis", [6, 8, 7], 8, 3, "Trend, seasonality, noise|Stationarity (ADF test)|Moving averages & exponential smoothing|ARIMA / SARIMA|Prophet|Forecast metrics (MAPE, RMSE)|Time-series cross-validation"),
        T("st-math", "Math for ML (Linear Algebra & Calculus)", [2, 8, 9], 14, 3, "Vectors & matrices|Dot product & matrix multiplication|Eigenvalues, eigenvectors, SVD|Derivatives & partial derivatives|Gradient & chain rule|Optimization basics|Entropy & KL divergence")
      ]
    },
    /* -------------------------------------------------------- VIZ / BI */
    {
      id: "bi", name: "Visualization & BI", icon: "📈", c: 4,
      desc: "Turn numbers into decisions. Power BI / Tableau skills are a hiring filter for most analyst jobs.",
      res: [["Power BI Learn (Microsoft)", "https://learn.microsoft.com/power-bi/"], ["Tableau Training", "https://www.tableau.com/learn/training"], ["Storytelling with Data", "https://www.storytellingwithdata.com/"], ["From Data to Viz", "https://www.data-to-viz.com/"], ["Tableau Public (portfolio)", "https://public.tableau.com/"]],
      topics: [
        T("bi-principles", "Data Visualization Principles", [9, 7, 3], 4, 1, "Choosing the right chart|Pre-attentive attributes|Colour theory & accessibility|Data-ink ratio|Dashboard layout & hierarchy|Avoiding misleading charts"),
        T("bi-pbi", "Power BI", [9, 4, 1], 18, 2, "Desktop vs Service|Data model & star schema|Power Query transformations|DAX measures (CALCULATE, FILTER)|Time intelligence (YTD, MoM)|Visuals, bookmarks, drill-through|Row-level security|Publish, refresh & workspaces|Performance Analyzer", "PL-300 certification is a strong resume signal."),
        T("bi-tab", "Tableau", [8, 4, 1], 16, 2, "Connect & prepare data|Dimensions vs measures|Calculated fields|LOD expressions (FIXED, INCLUDE, EXCLUDE)|Table calculations|Parameters & actions|Dashboards & stories|Publish to Tableau Public"),
        T("bi-kpi", "KPIs, Metrics & Dashboard Design", [9, 6, 2], 5, 2, "Defining SMART KPIs|Leading vs lagging metrics|Executive vs operational dashboards|Revenue, churn, CAC, LTV, retention, conversion|Requirements gathering with stakeholders|Self-service BI & governance"),
        T("bi-story", "Data Storytelling", [9, 8, 4], 4, 2, "Context - problem - insight - action|Audience-first structure|Executive summaries|Presenting to non-technical people|Annotation & highlighting|Report & slide writing"),
        T("bi-other", "Looker Studio, Streamlit & Others (Bonus)", [4, 5, 3], 6, 1, "Looker Studio|Streamlit / Dash apps|Metabase / Superset|Google Sheets for quick BI")
      ]
    },
    /* --------------------------------------------------------------- ML */
    {
      id: "ml", name: "Machine Learning", icon: "🤖", c: 5,
      desc: "Classical ML with scikit-learn - the core of data scientist interviews and the base for deep learning.",
      res: [["scikit-learn User Guide", "https://scikit-learn.org/stable/user_guide.html"], ["Google ML Crash Course", "https://developers.google.com/machine-learning/crash-course"], ["Andrew Ng ML Specialization", "https://www.coursera.org/specializations/machine-learning-introduction"], ["ISLP (free book)", "https://www.statlearning.com/"], ["Kaggle Learn & Competitions", "https://www.kaggle.com/learn"]],
      topics: [
        T("ml-intro", "ML Fundamentals & Workflow", [6, 10, 10], 5, 1, "Supervised, unsupervised, reinforcement|Bias-variance trade-off|Overfitting & underfitting|Train / validation / test split|End-to-end workflow (CRISP-DM)|Always build a baseline first"),
        T("ml-sklearn", "scikit-learn Mastery", [6, 10, 10], 8, 2, "Estimator API: fit / transform / predict|Pipelines & ColumnTransformer|Model persistence (joblib)|Custom transformers|GridSearchCV & RandomizedSearchCV|Metrics & datasets modules"),
        T("ml-prep", "Preprocessing & Feature Engineering", [7, 10, 10], 10, 2, "Missing value imputation|Encoding (one-hot, ordinal, target)|Scaling (standard, min-max, robust)|Outlier handling|Feature creation (dates, text, interactions)|Feature selection (filter, wrapper, embedded)|Class imbalance (SMOTE, class weights)|Data leakage prevention", "Feature engineering wins more than fancy models."),
        T("ml-lin", "Linear & Logistic Regression", [6, 10, 9], 7, 2, "Linear regression (OLS, gradient descent)|Ridge, Lasso, ElasticNet|Logistic regression & thresholds|Polynomial features|Assumptions & interpretation"),
        T("ml-trees", "Decision Trees & Ensembles", [5, 10, 10], 12, 2, "Decision trees (Gini, entropy)|Pruning|Random Forest & bagging|Gradient Boosting|XGBoost / LightGBM / CatBoost|Feature importance & SHAP|Hyperparameter tuning", "XGBoost/LightGBM dominate tabular data in industry."),
        T("ml-other", "KNN, SVM & Naive Bayes", [4, 8, 8], 6, 2, "KNN & distance metrics|SVM & kernels|Naive Bayes|Curse of dimensionality|Choosing the right algorithm"),
        T("ml-eval", "Model Evaluation & Validation", [7, 10, 10], 8, 2, "Confusion matrix|Precision, recall, F1|ROC-AUC & PR-AUC|Regression metrics (MAE, RMSE, R-squared, MAPE)|Cross-validation (k-fold, stratified, time-series)|Learning curves|Calibration|Business cost & error analysis", "Pick the metric that matches the business cost."),
        T("ml-tune", "Hyperparameter Tuning & Experiment Tracking", [3, 8, 9], 5, 3, "Grid vs random search|Bayesian optimization (Optuna)|Early stopping|Nested cross-validation|Experiment tracking (MLflow / W&B)|Model comparison reports"),
        T("ml-unsup", "Unsupervised Learning", [6, 9, 7], 8, 2, "K-Means, elbow & silhouette|Hierarchical clustering|DBSCAN|PCA|t-SNE / UMAP|Anomaly detection (Isolation Forest)|Association rules (Apriori)|Customer segmentation use-case"),
        T("ml-rec", "Recommender Systems", [3, 7, 8], 7, 3, "Content-based filtering|Collaborative filtering|Matrix factorization|Cold-start problem|Evaluation (precision@k, NDCG)|Hybrid & two-tower models"),
        T("ml-interp", "Explainability & Responsible AI", [5, 8, 8], 5, 2, "SHAP & LIME|Feature importance & PDP|Fairness & bias|Privacy & PII|Model cards & documentation|Explaining models to business")
      ]
    },
    /* --------------------------------------------------- DL / NLP / GenAI */
    {
      id: "dl", name: "Deep Learning, NLP & GenAI", icon: "🧠", c: 6,
      desc: "Neural networks, transformers and LLM applications - the fastest-growing area for data science and ML roles.",
      res: [["fast.ai Practical Deep Learning", "https://course.fast.ai/"], ["Hugging Face Learn", "https://huggingface.co/learn"], ["PyTorch Tutorials", "https://pytorch.org/tutorials/"], ["3Blue1Brown - Neural Networks", "https://www.3blue1brown.com/topics/neural-networks"], ["DeepLearning.AI", "https://www.deeplearning.ai/"]],
      topics: [
        T("dl-nn", "Neural Network Foundations", [2, 7, 10], 12, 3, "Perceptron & MLP|Activation functions|Backpropagation & gradient descent|Loss functions|Optimizers (SGD, Adam)|Regularization (dropout, batch norm)|Vanishing gradients & initialization"),
        T("dl-fw", "PyTorch / TensorFlow-Keras", [2, 7, 10], 12, 3, "Tensors & autograd|Building & training models|Datasets & DataLoaders|GPU basics (Colab / Kaggle)|Saving & loading models|Callbacks & logging"),
        T("dl-cv", "Computer Vision (CNNs)", [1, 6, 8], 10, 3, "Convolution & pooling|CNN architectures (ResNet, EfficientNet)|Transfer learning|Data augmentation|Object detection (YOLO)|Segmentation|Vision Transformers"),
        T("dl-seq", "Sequence Models (RNN, LSTM, GRU)", [1, 5, 7], 7, 3, "RNN basics|LSTM & GRU|Sequence-to-sequence|Time-series with deep learning|Why attention replaced RNNs"),
        T("dl-nlp", "NLP Fundamentals", [3, 8, 8], 10, 2, "Text cleaning & tokenization|Bag-of-words & TF-IDF|Word embeddings (Word2Vec, GloVe)|Sentiment & text classification|NER & topic modelling|spaCy / NLTK|NLP evaluation metrics"),
        T("dl-trans", "Transformers & LLMs", [2, 8, 9], 12, 3, "Attention mechanism|Transformer architecture|BERT & GPT families|Hugging Face Transformers|Fine-tuning (LoRA / PEFT)|Tokenization & context windows"),
        T("dl-genai", "GenAI: Prompting, RAG & Agents", [4, 8, 9], 12, 2, "Prompt engineering|Embeddings & vector databases|RAG pipeline|LLM APIs & structured output|Evaluating LLM apps|Agents & tool use|Guardrails, hallucinations & prompt-injection security|Cost & latency", "Hottest skill right now - build one RAG project."),
        T("dl-gen", "Generative Models: GAN & Diffusion (Bonus)", [0, 3, 4], 8, 3, "Autoencoders & VAEs|GANs|Diffusion models|Evaluation of generative models")
      ]
    },
    /* ------------------------------------------------- DATA ENG / MLOPS */
    {
      id: "eng", name: "Data Engineering, MLOps & Tools", icon: "⚙️", c: 7,
      desc: "Git, cloud, pipelines and deployment. These make you employable beyond notebooks.",
      res: [["Pro Git (free book)", "https://git-scm.com/book"], ["Docker - Get Started", "https://docs.docker.com/get-started/"], ["MLflow docs", "https://mlflow.org/docs/latest/"], ["Apache Spark docs", "https://spark.apache.org/docs/latest/"], ["dbt docs", "https://docs.getdbt.com/"]],
      topics: [
        T("de-git", "Git, GitHub & Collaboration", [7, 8, 9], 4, 1, "init, add, commit, push, pull|Branching & merging|Pull requests & code review|.gitignore & README|Resolving conflicts|GitHub portfolio & Pages", "Never commit secrets or API keys - use environment variables."),
        T("de-cli", "Linux, CLI & Environments", [5, 7, 9], 6, 1, "Bash essentials|File ops, grep, awk, sed|conda / venv / pip / poetry|Docker basics|SSH|Jupyter, VS Code & Colab"),
        T("de-etl", "ETL / ELT & Orchestration", [5, 6, 8], 10, 2, "ETL vs ELT|Pipeline design|Airflow / Prefect|dbt basics|Data quality testing|Batch vs streaming"),
        T("de-cloud", "Cloud Platforms (AWS / Azure / GCP)", [5, 7, 9], 12, 2, "Storage (S3 / Blob / GCS)|Compute basics|Managed warehouses (Redshift, BigQuery, Synapse, Snowflake)|Managed ML (SageMaker, Vertex, Azure ML)|IAM & security basics|Cost awareness|One fundamentals certification"),
        T("de-bigdata", "Big Data: Spark & Ecosystem", [4, 7, 8], 10, 3, "Distributed computing concepts|PySpark DataFrame API|Spark SQL|Partitioning & shuffle|Delta Lake / lakehouse|Kafka basics"),
        T("de-mlops", "MLOps & Model Deployment", [1, 6, 10], 14, 3, "Model packaging (joblib, ONNX)|REST API with FastAPI / Flask|Docker for ML|CI/CD for ML|Monitoring & data drift|Feature stores|Model registry & versioning (MLflow, DVC)|Batch vs real-time inference"),
        T("de-sec", "Data Security, Privacy & Governance", [5, 5, 6], 4, 1, "PII handling & anonymization|GDPR / DPDP basics|Access control & least privilege|Secrets management (no keys in code)|Data lineage & catalogs|Audit trails & compliance")
      ]
    },
    /* --------------------------------------------------------- BUSINESS */
    {
      id: "biz", name: "Business & Communication", icon: "💼", c: 8,
      desc: "Technical skills get you shortlisted; business thinking and communication get you hired and promoted.",
      res: [["Analytics Vidhya", "https://www.analyticsvidhya.com/"], ["Kaggle Datasets", "https://www.kaggle.com/datasets"], ["Storytelling with Data", "https://www.storytellingwithdata.com/"]],
      topics: [
        T("bz-prob", "Business Problem Solving & Case Studies", [9, 9, 6], 6, 2, "Framing the right question|MECE & issue trees|Hypothesis-driven analysis|Estimation (Fermi) questions|Metric-drop investigations (why did X fall?)|Prioritization frameworks"),
        T("bz-prod", "Product & Business Metrics", [8, 7, 4], 5, 2, "Revenue, margin, AOV|Funnel, conversion, retention, churn|CAC, LTV, ARPU|DAU / MAU & stickiness|North-Star metric|Cohort analysis"),
        T("bz-domain", "Domain Knowledge (pick 1-2)", [7, 7, 6], 10, 2, "E-commerce & retail|Banking, finance & credit risk|Healthcare (claims, quality measures)|Marketing analytics|Supply chain & operations|HR analytics|Telecom & churn"),
        T("bz-comm", "Communication & Stakeholders", [9, 8, 6], 4, 1, "Requirement gathering|Clear emails & documentation|Presenting insights|Handling ambiguity & pushback|Working with engineering & product|Agile, Scrum & JIRA basics")
      ]
    },
    /* ----------------------------------------------------------- CAREER */
    {
      id: "career", name: "Career & Interview Prep", icon: "🎯", c: 9,
      desc: "Resume, portfolio, interviews and job search - the final step that converts skills into an offer.",
      res: [["LinkedIn", "https://www.linkedin.com/"], ["GitHub", "https://github.com/"], ["Kaggle", "https://www.kaggle.com/"], ["Naukri", "https://www.naukri.com/"], ["Tableau Public", "https://public.tableau.com/"]],
      topics: [
        T("cr-resume", "Resume, LinkedIn & Portfolio Site", [10, 10, 10], 6, 1, "ATS-friendly one-page resume|Quantified achievements (action + metric + impact)|LinkedIn headline & About|GitHub profile README|Kaggle / Tableau Public profile|Tailor resume to each job description", "Every bullet: what you did + tool + measurable result."),
        T("cr-proj", "Portfolio Projects (3-5 end-to-end)", [10, 10, 10], 40, 2, "Pick problems with a business angle|Source & document data|EDA & insights|Dashboard or model|Deploy (Streamlit / Power BI Service)|Write a case-study README|Publish on GitHub|Practise presenting it", "Projects are the #1 proof of skill for freshers."),
        T("cr-beh", "Behavioral Interview (STAR)", [8, 8, 8], 4, 1, "Prepare 6 STAR stories|Tell me about yourself (60 seconds)|Strengths & weaknesses|Conflict & failure stories|Why this company / role|Salary negotiation"),
        T("cr-tech", "Technical Interview Practice", [10, 10, 10], 20, 3, "SQL live coding|Python / pandas coding|Stats & probability questions|ML theory questions|Case study & take-home assignments|Basic ML system design|Mock interviews with peers"),
        T("cr-search", "Job Search Strategy & Networking", [9, 9, 9], 10, 1, "Target-role list & JD keyword analysis|Job portals & company career pages|Referrals & networking|Cold messages that get replies|Track applications (Jobs tab)|Follow-ups|Communities, hackathons & Kaggle"),
        T("cr-cert", "Certifications (Optional)", [4, 4, 5], 30, 2, "Google Data Analytics|Microsoft PL-300 (Power BI)|Tableau Desktop Specialist|AWS / Azure / GCP fundamentals|IBM Data Science / Databricks")
      ]
    }
  ];

  /* ---------------------------------------------------- weekly study plans */
  const PLAN = {
    A: [
      ["Excel foundations & cleaning", ["xl-basics", "xl-clean"]],
      ["Formulas, lookups & dates", ["xl-formulas", "xl-lookup", "xl-date"]],
      ["Pivots, charts & Power Query", ["xl-pivot", "xl-charts", "xl-dynamic", "xl-pq"]],
      ["SQL fundamentals", ["sql-basics", "sql-agg"]],
      ["SQL joins, subqueries & tools", ["sql-joins", "sql-sub", "sql-func", "sql-tools"]],
      ["Window functions & analytical SQL", ["sql-window", "sql-analytics"]],
      ["Python basics & NumPy", ["py-core", "py-numpy"]],
      ["Pandas & EDA", ["py-pandas", "py-eda"]],
      ["Statistics for analysts", ["st-desc", "st-prob", "st-dist", "st-inf"]],
      ["Hypothesis testing & A/B tests", ["st-hyp", "st-ab"]],
      ["BI tools & storytelling", ["bi-principles", "bi-pbi", "bi-kpi", "bi-story"]],
      ["Business metrics, domain & communication", ["bz-prob", "bz-prod", "bz-domain", "bz-comm"]],
      ["Portfolio, job search & interviews", ["cr-resume", "cr-proj", "cr-tech", "cr-beh", "cr-search"]]
    ],
    S: [
      ["Python core", ["py-core"]],
      ["NumPy & Pandas", ["py-numpy", "py-pandas"]],
      ["EDA, visualization & wrangling", ["py-eda", "py-viz", "py-clean"]],
      ["SQL core", ["sql-basics", "sql-agg", "sql-joins"]],
      ["Advanced SQL", ["sql-sub", "sql-window", "sql-analytics"]],
      ["Descriptive stats & probability", ["st-desc", "st-prob", "st-dist"]],
      ["Inference, hypothesis & A/B", ["st-inf", "st-hyp", "st-ab"]],
      ["ML fundamentals & preprocessing", ["ml-intro", "ml-prep", "ml-sklearn"]],
      ["Regression", ["ml-lin", "st-reg"]],
      ["Trees & ensembles", ["ml-trees", "ml-other"]],
      ["Evaluation & tuning", ["ml-eval", "ml-tune"]],
      ["Unsupervised & explainability", ["ml-unsup", "ml-interp"]],
      ["Time series & math for ML", ["st-ts", "st-math"]],
      ["Deep learning & NLP", ["dl-nn", "dl-fw", "dl-nlp"]],
      ["LLMs, GenAI & Git", ["dl-trans", "dl-genai", "de-git"]],
      ["Business thinking & communication", ["bz-prob", "bz-prod", "bz-domain", "bz-comm"]],
      ["Portfolio, job search & interviews", ["cr-resume", "cr-proj", "cr-tech", "cr-beh", "cr-search"]]
    ],
    M: [
      ["Python core & clean code", ["py-core", "py-oop"]],
      ["NumPy & Pandas", ["py-numpy", "py-pandas"]],
      ["SQL essentials & design", ["sql-basics", "sql-joins", "sql-window", "sql-design", "sql-perf"]],
      ["Stats & probability", ["st-desc", "st-prob", "st-dist", "st-hyp"]],
      ["Math for ML", ["st-math"]],
      ["ML fundamentals & scikit-learn", ["ml-intro", "ml-prep", "ml-sklearn"]],
      ["Linear models & ensembles", ["ml-lin", "ml-trees"]],
      ["Evaluation & tuning", ["ml-eval", "ml-tune"]],
      ["Unsupervised, explainability & recsys", ["ml-unsup", "ml-interp", "ml-rec"]],
      ["Neural networks & frameworks", ["dl-nn", "dl-fw"]],
      ["CNNs & sequence models", ["dl-cv", "dl-seq"]],
      ["NLP & transformers", ["dl-nlp", "dl-trans"]],
      ["GenAI, RAG & agents", ["dl-genai"]],
      ["Git, Linux & DSA", ["de-git", "de-cli", "py-dsa"]],
      ["MLOps & cloud", ["de-mlops", "de-cloud", "de-sec"]],
      ["Pipelines & big data", ["de-etl", "de-bigdata"]],
      ["Portfolio & technical interviews", ["cr-proj", "cr-tech"]],
      ["Resume, behavioral & job search", ["cr-resume", "cr-beh", "cr-search"]]
    ]
  };

  /* ---------------------------------------------- interview question bank */
  const QS = [
    ["excel", "What is the difference between VLOOKUP and XLOOKUP?", "XLOOKUP looks in any direction, defaults to exact match, returns a custom value when not found, and can return multiple columns. VLOOKUP only looks right, needs a column index number (breaks if columns are inserted) and defaults to approximate match."],
    ["excel", "How do you handle duplicates in Excel?", "Highlight with Conditional Formatting > Duplicate Values, remove with Data > Remove Duplicates, or get a distinct list with UNIQUE(). Use COUNTIF to flag the second occurrence before deleting."],
    ["excel", "What is a pivot table and when would you use it?", "A pivot table summarizes large tables by dragging fields into rows, columns, values and filters - without formulas. Use it for quick aggregation, comparisons and exploring data by category or time."],
    ["excel", "Absolute vs relative references?", "Relative (A1) shifts when copied; absolute ($A$1) stays fixed; mixed ($A1 or A$1) locks only column or row. F4 toggles them."],
    ["excel", "How do you combine data from multiple sheets or files?", "Use Power Query to append or merge tables (repeatable on refresh), XLOOKUP / INDEX-MATCH for single lookups, or the Data Model with relationships for multi-table pivots."],
    ["excel", "SUMIF vs SUMIFS?", "SUMIF has one condition (range, criteria, sum_range). SUMIFS takes the sum range first and then any number of range/criteria pairs, all of which must be true (AND logic)."],
    ["excel", "How do you make a dashboard interactive in Excel?", "Build pivot tables / charts from a clean Excel Table, add slicers and timelines connected to all pivots, use named ranges, and keep KPIs in a top banner with consistent formatting."],
    ["excel", "What are common causes of #N/A, #REF! and #VALUE! errors?", "#N/A: lookup not found. #REF!: deleted or invalid cell reference. #VALUE!: wrong data type (text in math). Wrap with IFNA / IFERROR only after understanding the cause."],

    ["sql", "Difference between WHERE and HAVING?", "WHERE filters rows before aggregation; HAVING filters groups after aggregation. Aggregate functions are only allowed in HAVING."],
    ["sql", "INNER vs LEFT vs FULL OUTER JOIN?", "INNER keeps matching rows only. LEFT keeps all left rows plus matches (NULL when none). FULL keeps all rows from both sides."],
    ["sql", "RANK vs DENSE_RANK vs ROW_NUMBER?", "ROW_NUMBER gives unique sequential numbers. RANK gives ties the same rank and skips the next numbers (1,1,3). DENSE_RANK gives ties the same rank without gaps (1,1,2)."],
    ["sql", "How do you find the second highest salary?", "Use DENSE_RANK() OVER (ORDER BY salary DESC) and filter rank = 2, or SELECT MAX(salary) WHERE salary < (SELECT MAX(salary)). The window approach generalizes to Nth and handles per-department variants."],
    ["sql", "How do you remove duplicate rows keeping the latest?", "Use ROW_NUMBER() OVER (PARTITION BY key ORDER BY updated_at DESC) in a CTE and keep rn = 1."],
    ["sql", "COUNT(*) vs COUNT(column) vs COUNT(DISTINCT column)?", "COUNT(*) counts all rows; COUNT(column) counts non-NULL values; COUNT(DISTINCT column) counts unique non-NULL values."],
    ["sql", "What is a CTE and why use it?", "A named temporary result set defined with WITH, valid for one statement. It improves readability, allows reuse within the query, and supports recursion."],
    ["sql", "UNION vs UNION ALL?", "UNION removes duplicates (extra sort/hash cost); UNION ALL keeps all rows and is faster. Use UNION ALL unless duplicates must be removed."],
    ["sql", "How would you calculate month-over-month growth?", "Aggregate to month with DATE_TRUNC, then use LAG(metric) OVER (ORDER BY month) and compute (metric - prev) / NULLIF(prev, 0)."],
    ["sql", "What is an index and when can it hurt?", "A data structure (usually B-tree) that speeds lookups. It slows INSERT/UPDATE/DELETE and uses storage, so over-indexing or indexing low-cardinality columns can hurt."],
    ["sql", "Explain normalization and when to denormalize.", "Normalization removes redundancy by splitting data into related tables (1NF-3NF). Denormalize in analytics/warehouses to reduce joins and speed up reads."],
    ["sql", "How do you calculate retention using SQL?", "Find each user's first activity date (cohort), join to later activity, compute the difference in periods, then COUNT(DISTINCT user) per cohort and period divided by cohort size."],

    ["python", "List vs tuple vs set vs dict?", "List: ordered, mutable. Tuple: ordered, immutable. Set: unordered unique items, fast membership. Dict: key-value pairs with fast lookup by key."],
    ["python", "What is the difference between a shallow and a deep copy?", "A shallow copy duplicates the outer object but shares nested objects; a deep copy (copy.deepcopy) recursively duplicates everything."],
    ["python", "What are list comprehensions and generators?", "A comprehension builds a list in one expression. A generator expression yields items lazily, using constant memory - ideal for large data."],
    ["python", "loc vs iloc in pandas?", "loc selects by label (inclusive end); iloc selects by integer position (exclusive end). Both accept boolean masks (loc) and slices."],
    ["python", "How do you handle missing values in pandas?", "Inspect with isna().sum(); drop with dropna() if few; fill with fillna (mean/median/mode/forward-fill) or model-based imputation. Choice depends on missingness mechanism and business meaning."],
    ["python", "merge vs join vs concat?", "merge combines on column keys (SQL-style); join merges on index; concat stacks DataFrames along an axis."],
    ["python", "How do you speed up slow pandas code?", "Vectorize instead of apply/loops, use categorical dtypes, read only needed columns, downcast numerics, use chunked reads, or move to Polars / DuckDB / Spark for large data."],
    ["python", "What is a decorator?", "A function that wraps another function to add behaviour (logging, timing, caching) without changing its code, applied with @syntax."],
    ["python", "Explain *args and **kwargs.", "*args collects extra positional arguments into a tuple; **kwargs collects extra keyword arguments into a dict."],
    ["python", "groupby + transform vs agg?", "agg returns one row per group; transform returns a result aligned to the original rows (e.g., group mean per row) - useful for normalization and feature creation."],
    ["python", "What is the GIL?", "The Global Interpreter Lock lets only one thread execute Python bytecode at a time in CPython. Use multiprocessing for CPU-bound work; threads or asyncio for I/O-bound work."],
    ["python", "How do you detect outliers in a column?", "IQR rule (below Q1-1.5*IQR or above Q3+1.5*IQR), z-score beyond 3, box plots, or model-based methods like Isolation Forest. Then decide: fix, cap, or keep based on business context."],

    ["stats", "Explain p-value in simple words.", "The probability of seeing data at least as extreme as ours if the null hypothesis were true. A small p-value means the data are unlikely under the null - it is NOT the probability the null is true."],
    ["stats", "Type I vs Type II error?", "Type I: rejecting a true null (false positive, probability alpha). Type II: failing to reject a false null (false negative, probability beta). Power = 1 - beta."],
    ["stats", "What is the Central Limit Theorem?", "The sampling distribution of the sample mean approaches a normal distribution as sample size grows, regardless of the population distribution (with finite variance)."],
    ["stats", "Mean vs median - when to use which?", "Use median for skewed data or outliers (income, house prices); mean for roughly symmetric data. Comparing them also hints at skew."],
    ["stats", "Correlation vs causation?", "Correlation measures association; causation needs controlled experiments or causal methods. Confounders, reverse causality and coincidence can create correlation without causation."],
    ["stats", "What is a confidence interval?", "A range built by a procedure that captures the true parameter in a stated percentage (e.g., 95%) of repeated samples. It is not a 95% probability that this particular interval contains the truth."],
    ["stats", "How do you design and analyze an A/B test?", "Define hypothesis and primary metric, calculate sample size from baseline, MDE, alpha and power, randomize units, run the full duration without peeking, check sample-ratio mismatch, test significance, report effect size and confidence interval, and review guardrail metrics."],
    ["stats", "Explain Bayes theorem with an example.", "P(A|B) = P(B|A)P(A)/P(B). Example: a disease with 1% prevalence and a 95%-accurate test - a positive result still leaves a modest probability of disease because of the low prior."],
    ["stats", "When do you use a t-test vs z-test vs chi-square?", "t-test: compare means with unknown population variance (small samples). z-test: known variance or large samples. Chi-square: association between categorical variables or goodness-of-fit."],
    ["stats", "What are the assumptions of linear regression?", "Linearity, independence of errors, homoscedasticity (constant variance), normally distributed residuals, and no severe multicollinearity."],
    ["stats", "What is multicollinearity and how do you detect it?", "Predictors being highly correlated, which inflates coefficient variance. Detect with correlation matrix and VIF (>5-10 is a concern); fix by dropping/combining features or using regularization/PCA."],
    ["stats", "What is statistical power?", "The probability of detecting a real effect (1 - beta). It rises with larger sample size, larger effect size and higher alpha; 80% is a common target."],

    ["ml", "Explain the bias-variance trade-off.", "Bias is error from overly simple assumptions (underfitting); variance is sensitivity to training data (overfitting). Increasing complexity lowers bias but raises variance - the goal is the sweet spot minimizing total error."],
    ["ml", "How do you handle imbalanced data?", "Use appropriate metrics (PR-AUC, F1, recall), stratified splits, class weights, resampling (SMOTE, undersampling), threshold tuning, and collect more minority data if possible. Never resample before splitting."],
    ["ml", "Precision vs recall - when does each matter?", "Precision matters when false positives are costly (spam filter, fraud alerts to customers). Recall matters when false negatives are costly (disease screening, fraud detection)."],
    ["ml", "What is cross-validation?", "Splitting data into k folds, training on k-1 and validating on the remaining one in rotation, averaging the score - a more reliable estimate than a single split. Use stratified for classification and time-based splits for time series."],
    ["ml", "Random Forest vs Gradient Boosting?", "Random Forest trains many deep trees independently on bootstrapped data and averages them (reduces variance). Gradient Boosting builds shallow trees sequentially, each fixing the previous errors (reduces bias); usually more accurate but more sensitive to tuning."],
    ["ml", "What is regularization? L1 vs L2?", "A penalty on model complexity to reduce overfitting. L1 (Lasso) can shrink coefficients to exactly zero (feature selection); L2 (Ridge) shrinks them smoothly toward zero."],
    ["ml", "What is data leakage?", "When information not available at prediction time leaks into training (e.g., fitting a scaler on all data, using future values, target-derived features), producing overly optimistic results that fail in production."],
    ["ml", "Explain ROC-AUC.", "ROC plots true-positive rate vs false-positive rate across thresholds; AUC is the probability a random positive is ranked above a random negative. 0.5 = random, 1 = perfect. For heavy imbalance prefer PR-AUC."],
    ["ml", "How does K-Means work and how do you choose K?", "Assign points to the nearest centroid, update centroids, repeat until stable. Choose K with the elbow method, silhouette score, or business needs. Sensitive to scale and initialization (use k-means++)."],
    ["ml", "How do you deal with missing values and categorical variables in modelling?", "Impute inside a pipeline (median/mode/model-based) possibly adding a missing-indicator; encode categoricals with one-hot (low cardinality), ordinal (ordered) or target/frequency encoding (high cardinality) fitted only on training data."],
    ["ml", "What is PCA?", "A linear technique that projects data onto orthogonal directions of maximum variance, reducing dimensionality while keeping most information. Features must be scaled first."],
    ["ml", "How would you explain a model to a non-technical stakeholder?", "Start with the business outcome, use feature-importance/SHAP in plain language with examples, state accuracy in business terms (cost saved, errors avoided) and be clear about limits and risks."],
    ["ml", "What is the difference between bagging and boosting?", "Bagging trains models in parallel on random samples and averages them (variance reduction). Boosting trains sequentially, weighting hard examples (bias reduction)."],
    ["ml", "How do you take a model to production and monitor it?", "Package the pipeline, expose via API or batch job, version data/model/code, add logging, then monitor data drift, prediction drift and business metrics, with retraining triggers and rollback."],

    ["dl", "What is backpropagation?", "An algorithm that computes the gradient of the loss with respect to each weight using the chain rule, layer by layer from output to input, so gradient descent can update the weights."],
    ["dl", "What causes vanishing gradients and how to fix them?", "Repeated multiplication of small derivatives (sigmoid/tanh in deep nets). Fix with ReLU-family activations, better initialization, batch norm, residual connections, and LSTM/GRU for sequences."],
    ["dl", "What is the attention mechanism?", "It lets a model weigh the relevance of every input token to each output token using query-key-value dot products, capturing long-range dependencies in parallel - the basis of transformers."],
    ["dl", "What is transfer learning?", "Reusing a model pretrained on a large dataset and fine-tuning it on your smaller task, saving data, time and compute."],
    ["dl", "What is RAG and why use it?", "Retrieval-Augmented Generation fetches relevant documents (via embeddings + vector search) and gives them to an LLM as context, reducing hallucinations and enabling up-to-date, private knowledge without retraining."],
    ["dl", "How do you reduce LLM hallucinations?", "Ground answers with retrieval, ask for citations, constrain output format, lower temperature, add verification or evaluation steps, and fall back to I do not know when evidence is missing."],
    ["dl", "What is prompt injection and how do you defend against it?", "Malicious text in user input or retrieved content that tries to override the model instructions. Treat all external text as untrusted, separate instructions from data, restrict tool permissions, validate outputs and keep secrets out of prompts."],
    ["dl", "Dropout and batch normalization - what do they do?", "Dropout randomly disables neurons during training to reduce overfitting. Batch norm normalizes layer inputs per mini-batch, stabilizing and speeding up training."],

    ["bi", "How do you choose the right chart?", "Match the chart to the question: comparison - bar; trend - line; distribution - histogram/box; relationship - scatter; part-to-whole - stacked bar or a few-segment bar. Keep it simple and label clearly."],
    ["bi", "What is the difference between a measure and a calculated column in Power BI?", "A calculated column is computed per row at refresh and stored in the model; a measure is computed at query time based on filter context (DAX). Prefer measures for aggregations to save memory."],
    ["bi", "What is a star schema?", "A model with a central fact table (events/transactions) linked to dimension tables (date, product, customer). It simplifies DAX and improves performance."],
    ["bi", "What makes a good dashboard?", "A clear purpose and audience, a few key KPIs at the top, consistent filters, appropriate charts, minimal clutter, context (targets, comparisons) and fast load times."],
    ["bi", "What is a LOD expression in Tableau?", "Level-of-Detail expressions (FIXED, INCLUDE, EXCLUDE) compute aggregations at a granularity different from the view, e.g., FIXED customer first purchase date."],
    ["bi", "How do you implement row-level security?", "Define roles with DAX filter expressions on tables (e.g., user email equals region owner), test with View-as, and assign users or groups to roles in the Service."],

    ["biz", "Sales dropped 15% last week - how do you investigate?", "Verify the data first (pipeline issues, definitions), then segment by time, region, product, channel and customer type, compare against seasonality and campaigns, form hypotheses, quantify each driver and recommend actions."],
    ["biz", "How do you define success for a new feature?", "Pick a North-Star or primary metric tied to the goal, add guardrail metrics, set a baseline and target, and design an experiment to measure the causal impact."],
    ["biz", "What are churn, retention and LTV?", "Churn: share of customers lost in a period. Retention: share that stay. LTV: expected total revenue (or margin) from a customer over their lifetime, often ARPU x lifetime or discounted cash-flow based."],
    ["biz", "How do you handle a stakeholder who disagrees with your analysis?", "Listen, restate their concern, check assumptions and data together, show sensitivity or alternate cuts, stay objective and document the decision."],
    ["biz", "How do you prioritize multiple urgent requests?", "Clarify impact and deadlines, rank by business value and effort, communicate trade-offs openly, and agree on a delivery plan with stakeholders."],

    ["career", "Tell me about yourself.", "60-90 seconds: current background, key skills and one standout project with a measurable result, then why this role/company. Present - past - future."],
    ["career", "Walk me through your best project.", "Use problem - data - approach - result - learning. Quantify the impact, explain trade-offs and what you would do differently."],
    ["career", "Describe a time you failed.", "STAR format: a real, modest failure, your ownership, what you changed afterwards and the improved outcome."],
    ["career", "Why do you want to be a data analyst / data scientist?", "Connect curiosity about solving problems with data, concrete projects you completed, and how you want to create business impact."],
    ["career", "Where do you see yourself in 3-5 years?", "Growing technical depth and domain expertise, taking more ownership of impactful projects, and mentoring - aligned with the company growth path."]
  ];

  /* ------------------------------------------------ suggested portfolio projects */
  const PROJECTS = [
    { id: "p1", title: "Sales Performance Dashboard", roles: "A", tools: "Excel, Power BI / Tableau", desc: "Interactive dashboard of revenue, margin, region and product trends with KPIs and drill-down.", steps: "Choose a public sales dataset (e.g., superstore-style)|Clean data with Power Query|Build star-schema data model|Create KPIs & DAX / calculated fields|Design dashboard with slicers|Publish & write insights summary" },
    { id: "p2", title: "E-commerce SQL Analysis (Cohorts & Funnel)", roles: "AS", tools: "SQL (PostgreSQL), Python", desc: "Answer 15 business questions: retention cohorts, conversion funnel, RFM segments and top products using advanced SQL.", steps: "Load a public e-commerce dataset into PostgreSQL|Design tables & keys|Write funnel and cohort queries (CTE + windows)|Build RFM segmentation|Visualize results|Document queries & findings in README" },
    { id: "p3", title: "Customer Churn Prediction", roles: "SM", tools: "Python, scikit-learn, XGBoost, SHAP", desc: "Predict which customers will leave and explain the drivers; propose retention actions.", steps: "Define churn & success metric|EDA and feature engineering|Baseline + tuned models in a pipeline|Evaluate with PR-AUC & cost matrix|Explain with SHAP|Write business recommendations" },
    { id: "p4", title: "Retail Demand Forecasting", roles: "SM", tools: "Python, statsmodels / Prophet / LightGBM", desc: "Forecast weekly demand per store/product and compare classical vs ML approaches.", steps: "Explore trend & seasonality|Build naive & seasonal-naive baselines|ARIMA / Prophet model|Gradient boosting with lag features|Time-series cross-validation|Report MAPE & business impact" },
    { id: "p5", title: "A/B Test Analysis Report", roles: "AS", tools: "Python, SciPy, statsmodels", desc: "Analyze an experiment dataset end-to-end: checks, significance, effect size and decision memo.", steps: "State hypothesis & metrics|Check randomization (SRM)|Run z-test / t-test and CI|Calculate power & sample size|Segment analysis with caution|Write a one-page decision memo" },
    { id: "p6", title: "Customer Segmentation (RFM + K-Means)", roles: "AS", tools: "Python, scikit-learn, Plotly", desc: "Segment customers and design marketing actions per segment.", steps: "Compute RFM features|Scale & choose K (elbow, silhouette)|Profile each cluster|Name segments & actions|Dashboard in Streamlit|Share findings" },
    { id: "p7", title: "Healthcare / Claims Analytics", roles: "AS", tools: "SQL, Python, Power BI", desc: "Analyze a public health dataset: cost drivers, readmissions or quality-measure gaps. Use only public, de-identified data.", steps: "Pick a public de-identified dataset|Define metrics (cost, readmission rate)|SQL aggregation & cohorts|Statistical comparison of groups|Dashboard|Insights & privacy notes" },
    { id: "p8", title: "Credit Risk / Loan Default Model", roles: "SM", tools: "Python, scikit-learn, LightGBM", desc: "Build a scorecard-style model with fairness and explainability checks.", steps: "EDA & target definition|Handle imbalance & leakage|Logistic regression baseline|Gradient boosting model|Fairness & explainability review|Model card" },
    { id: "p9", title: "NLP: Review / Ticket Sentiment & Topics", roles: "S", tools: "Python, spaCy, Hugging Face", desc: "Classify sentiment and extract recurring complaint topics from text.", steps: "Collect & clean text|TF-IDF + logistic regression baseline|Fine-tune a small transformer|Topic modelling|Error analysis|Dashboard of insights" },
    { id: "p10", title: "Recommender System", roles: "SM", tools: "Python, implicit / LightFM / PyTorch", desc: "Movie or product recommender with offline evaluation.", steps: "Load ratings dataset|Popularity & content baselines|Collaborative filtering / matrix factorization|Evaluate precision@k & NDCG|Handle cold start|Simple demo app" },
    { id: "p11", title: "End-to-end ML Deployment", roles: "M", tools: "FastAPI, Docker, GitHub Actions, MLflow", desc: "Train, version, containerize and deploy a model API with CI/CD and monitoring.", steps: "Train model & log with MLflow|Wrap in FastAPI with input validation|Dockerize|CI pipeline: tests + build|Deploy to a cloud free tier|Add drift & latency monitoring" },
    { id: "p12", title: "RAG Chatbot over Your Documents", roles: "SM", tools: "Python, embeddings, vector DB, LLM API", desc: "Question-answering assistant over PDFs with citations and evaluation. Keep API keys in environment variables.", steps: "Chunk & embed documents|Store in vector DB|Retrieve + prompt LLM|Add citations & guardrails|Evaluate on a question set|Deploy a Streamlit demo" },
    { id: "p13", title: "Automated Reporting Pipeline", roles: "A", tools: "Python, SQL, Excel, Scheduler", desc: "Pull data with SQL/API, clean with pandas, and auto-generate a weekly Excel/PDF report.", steps: "Define report requirements|Extract data (SQL / API)|Transform with pandas|Generate Excel with charts|Schedule the job|Add logging & error alerts" }
  ];

  const TIPS = [
    "Consistency beats intensity: 90 focused minutes daily beats a 10-hour weekend binge.",
    "Learn by building: after every topic, apply it on a real dataset.",
    "Write your own notes - teaching an idea in your own words doubles retention.",
    "Practise SQL daily; 2 problems a day for 60 days changes interviews.",
    "Revise old topics on schedule (3, 7, 21 days) - spaced repetition beats cramming.",
    "Every project needs a business question, not just a model.",
    "Explain results to a non-technical friend. If they get it, interviewers will too.",
    "Quantify everything on your resume: percentage, rupees, hours saved.",
    "Apply to jobs while learning - do not wait to feel 100% ready.",
    "Never commit passwords or API keys to GitHub; use environment variables.",
    "Read job descriptions weekly and note the repeated skills - that is your real syllabus.",
    "Keep a mistakes log: errors you made in SQL / pandas become your best revision notes.",
    "Sleep, breaks and exercise are part of the study plan, not a reward for finishing it.",
    "Start with a baseline model; fancy models only after you understand the data."
  ];

  const ROLES = { A: "Data Analyst", S: "Data Scientist", M: "ML Engineer" };

  window.CURRICULUM = { TRACKS, PLAN, QS, PROJECTS, TIPS, ROLES };
})();
