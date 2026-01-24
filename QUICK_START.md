# Quick Start Guide - Running the API

## 🚀 Easiest Way to Start the API

### **Option 1: Use the Improved Batch Script (RECOMMENDED)**

From the project root (`d:\3Dmodel`), run:

```batch
scripts\start_api_improved.bat
```

This script:
- ✅ Automatically uses the correct Python (conda)
- ✅ Changes to the correct directory
- ✅ Checks if dependencies are installed
- ✅ Shows clear error messages if something fails

---

### **Option 2: Use Full Python Path**

```batch
C:\Users\voram\miniconda3\python.exe api\app.py
```

---

### **Option 3: Use the Wrapper Script**

```batch
C:\Users\voram\miniconda3\python.exe api\run.py
```

This ensures correct working directory and imports.

---

## 🔍 If You Get Errors

### **Error: "ModuleNotFoundError: No module named 'fastapi'"**

**Solution:** Install dependencies in conda Python:
```batch
C:\Users\voram\miniconda3\python.exe -m pip install -r api\requirements.txt
```

---

### **Error: "ImportError" or "No module named 'X'"**

**Solution:** The Python you're using doesn't have the dependencies. Use conda Python:
```batch
C:\Users\voram\miniconda3\python.exe api\app.py
```

---

### **Error: "Cannot find api\app.py"**

**Solution:** Make sure you're in the project root (`d:\3Dmodel`), not in the `api` folder.

---

## 🎯 Why `python app.py` Fails But Full Path Works

**The Issue:**
- Your system has multiple Python installations
- The `python` command points to a different Python than conda's
- That Python doesn't have FastAPI and other dependencies installed
- Conda's Python (`C:\Users\voram\miniconda3\python.exe`) has everything installed

**The Fix:**
- Always use the full path to conda's Python, OR
- Use the batch script that does it for you, OR
- Fix your PATH to prioritize conda's Python

---

## 📝 Recommended Workflow

1. **Always run from project root:**
   ```batch
   cd d:\3Dmodel
   ```

2. **Use the improved batch script:**
   ```batch
   scripts\start_api_improved.bat
   ```

3. **Or use the full path:**
   ```batch
   C:\Users\voram\miniconda3\python.exe api\app.py
   ```

---

## ✅ Verification

After starting, you should see:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

Then visit:
- **API**: http://localhost:8000
- **Docs**: http://localhost:8000/docs

---

## 🔧 Permanent Fix (Optional)

If you want `python app.py` to work directly:

1. **Initialize conda for PowerShell:**
   ```powershell
   C:\Users\voram\miniconda3\Scripts\conda.exe init powershell
   ```

2. **Close and reopen terminal**

3. **Activate conda:**
   ```powershell
   conda activate base
   ```

4. **Verify:**
   ```powershell
   python -c "import sys; print(sys.executable)"
   # Should show: C:\Users\voram\miniconda3\python.exe
   ```

5. **Now `python api\app.py` should work**

---

## 🆘 Still Having Issues?

Run the diagnostic script:
```batch
scripts\diagnose_python.bat
```

This will show you exactly what's wrong and how to fix it.
