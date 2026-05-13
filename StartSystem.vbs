Set WshShell = CreateObject("WScript.Shell")

' 1. Start Backend silently (Window style: 0 = Hidden)
WshShell.Run "cmd /c cd backend && .\venv\Scripts\python.exe -m uvicorn app.main:app --host 0.0.0.0 --port 8000", 0, False

' 2. Wait 3 seconds for backend to initialize
WScript.Sleep 3000

' 3. Start Frontend silently (Window style: 0 = Hidden)
WshShell.Run "cmd /c cd frontend && npm run dev", 0, False

' 4. Wait 2 seconds and open Dashboard
WScript.Sleep 2000
WshShell.Run "QuickStart.html"

Set WshShell = Nothing
