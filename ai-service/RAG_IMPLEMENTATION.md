# RAG Implementation (Node.js)

## Current implementation

RAG is implemented in Node.js with local knowledge-base retrieval.

### Core files

- `src/services/knowledgeBase.service.js`
    - Loads documents from `data/knowledge_base/**`
    - Scores query/doc overlap
    - Returns top-k context snippets

- `src/services/analysis.service.js`
    - Uses retrieved context during analysis and chat
    - Appends `+ RAG` in model metadata when context is included

- `scripts/build_knowledge_base.js`
    - Node smoke test for retrieval context

- `tests/test_rag.js`
    - Basic runtime check for retrieval payload

### Configuration

Use `.env` values:

```env
USE_RAG=true
RAG_TOP_K=3
VECTOR_STORE_PATH=./data/vectorstore
```

### Run checks

```bash
cd ai-service
npm start
node scripts/build_knowledge_base.js
node tests/test_rag.js
```

### Knowledge base folders

- `data/knowledge_base/sample_resumes/`
- `data/knowledge_base/job_templates/`
- `data/knowledge_base/best_practices/`

---

## 🚀 How to Use

### **Step 1: Install Dependencies**
```bash
cd ai-service
pip install -r requirements.txt
```

### **Step 2: Build Knowledge Base (One-Time)**
```bash
python scripts/build_knowledge_base.py
```
This will:
- Load sample resumes and job templates
- Generate embeddings
- Store in ChromaDB
- Verify with test search

### **Step 3: Start the Service**
```bash
python main.py
```

### **Step 4: Test RAG (Optional)**
```bash
python tests/test_rag.py
```

---

## 🎛️ Toggle RAG On/Off

**Enable RAG:**
```env
USE_RAG=true
```

**Disable RAG (use current direct AI):**
```env
USE_RAG=false
```

Changes take effect on service restart.

---

## 📊 How It Works

### **Without RAG (Current):**
```
Resume + JD → Gemini AI → Analysis
```

### **With RAG (New):**
```
Resume + JD 
    ↓
[1] Embed query
    ↓
[2] Search vector store for similar resumes & best practices
    ↓
[3] Retrieve top 3 relevant examples
    ↓
[4] Augment prompt with examples
    ↓
[5] Send to Gemini AI with context
    ↓
Better, Example-Based Analysis
```

---

## 🔑 Key Features

### ✅ **Uses Your Existing API Key**
- Same `GOOGLE_API_KEY` for everything
- Local embeddings (no new API keys needed)
- Free vector database (ChromaDB)

### ✅ **Backward Compatible**
- Existing code still works
- Graceful fallbacks if RAG fails
- Same API endpoints

### ✅ **Enhanced Analysis**
- Gap analysis learns from successful examples
- Recommendations based on best practices
- Context-aware suggestions

### ✅ **LangChain Integration**
- Proper chain abstractions
- Unified LLM interface
- Easy to extend

---

## 📁 New Files Created

```
ai-service/
├── data/
│   └── knowledge_base/
│       ├── sample_resumes/
│       │   ├── senior_software_engineer_95.txt
│       │   ├── data_scientist_ml_90.txt
│       │   └── fullstack_developer_88.txt
│       ├── job_templates/
│       │   └── backend_engineer.txt
│       └── best_practices/
│           └── resume_tips.json
├── scripts/
│   └── build_knowledge_base.py
├── app/
│   └── embeddings/
│       ├── knowledge_base.py (NEW)
│       └── vectorstore.py (UPDATED)
└── tests/
    └── test_rag.py (NEW)
```

---

## 🧪 Testing Your Implementation

### **Test 1: Basic Analysis (Without RAG)**
```bash
# Set USE_RAG=false in .env
curl -X POST http://localhost:8000/api/analyze \
  -H "Content-Type: application/json" \
  -d '{"resume_text": "...", "job_description": "..."}'
```

### **Test 2: RAG Analysis (With RAG)**
```bash
# Set USE_RAG=true in .env
# Same API call - automatically uses RAG!
```

### **Test 3: Compare Results**
Check the `model` field in response:
- Without RAG: `"gemini-2.5-flash"`
- With RAG: `"gemini-2.5-flash + RAG"`

---

## 📈 Next Steps (Optional Enhancements)

1. **Add More Sample Data** - Add 50-100 more resumes
2. **Role-Specific Collections** - Separate vector stores per role
3. **Semantic Caching** - Cache frequent queries
4. **Hybrid Search** - Combine keyword + semantic search
5. **User Feedback Loop** - Improve knowledge base from usage

---

## 🐛 Troubleshooting

### **Issue: "ChromaDB not initialized"**
```bash
pip install chromadb sentence-transformers
```

### **Issue: "Collection not found"**
```bash
python scripts/build_knowledge_base.py
```

### **Issue: RAG not activating**
Check `.env`:
```env
USE_RAG=true  # Must be lowercase 'true'
```

### **Issue: LangChain import errors**
```bash
pip install langchain-google-genai langchain-community
```

---

## ✅ Success Indicators

You'll know RAG is working when:
1. ✅ Build script shows "Knowledge base is ready for RAG!"
2. ✅ API response includes `"model": "gemini-2.5-flash + RAG"`
3. ✅ Logs show "🔍 Using RAG for gap analysis..."
4. ✅ Recommendations reference specific examples
5. ✅ Test suite passes all checks

---

## 🎉 You're All Set!

Your Career Compass now has:
- ✅ **RAG** - Example-based learning
- ✅ **LangChain** - Proper abstractions
- ✅ **Vector Store** - ChromaDB with persistence
- ✅ **Knowledge Base** - Sample resumes & best practices
- ✅ **Backward Compatible** - Existing code unchanged
- ✅ **Same API Keys** - No new credentials needed

**Start the service and try it out!** 🚀
