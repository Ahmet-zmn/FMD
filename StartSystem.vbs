Set WshShell = CreateObject("WScript.Shell")
Set FSO = CreateObject("Scripting.FileSystemObject")

' Check if global Python setup sentinel or node_modules is missing
If Not FSO.FileExists("backend\.installed") Or Not FSO.FolderExists("frontend\node_modules") Then
    ' Display first-time setup notification popup for 10 seconds, or until user clicks OK
    WshShell.Popup "Sistem ilk kez baslatiliyor. Gerekli bilesenler (Python Kutuphaneleri ve Node Paketleri) otomatik olarak kurulacaktir. Bu islem internet hiziniz ve donaniminiza bagli olarak 1-2 dakika surebilir. Lutfen acilacak olan pencereyi kapatmayin.", 10, "FMD AI Diagnosis - Ilk Kurulum", 64
    
    ' Run setup and wait for it to complete (style: 1 = Normal/Visible, wait: True)
    WshShell.Run "cmd /c QuickStart.bat /setup", 1, True
End If

' 1. Start Backend silently (Window style: 0 = Hidden)
WshShell.Run "cmd /c cd backend && python -m uvicorn app.main:app --host 0.0.0.0 --port 8000", 0, False

' 2. Wait 3 seconds for backend to initialize
WScript.Sleep 3000

' 3. Start Frontend silently (Window style: 0 = Hidden)
WshShell.Run "cmd /c cd frontend && npm run dev", 0, False

' 4. Wait 2 seconds and open Dashboard
WScript.Sleep 2000
WshShell.Run "QuickStart.html"

Set WshShell = Nothing
Set FSO = Nothing
