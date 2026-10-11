@echo off
setlocal

:pick_folder
set "SELECTED_DIR="
for /f "usebackq tokens=*" %%I in (`powershell -NoProfile -ExecutionPolicy Bypass -Command ^
  "$code = '[DllImport(\"kernel32.dll\")] public static extern IntPtr GetConsoleWindow(); [DllImport(\"user32.dll\")] public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);';" ^
  "$win = Add-Type -MemberDefinition $code -Name Win32Utils -Namespace Win32 -PassThru;" ^
  "$handle = $win::GetConsoleWindow();" ^
  "$win::ShowWindow($handle, 0) | Out-Null;" ^
  "$app = New-Object -ComObject Shell.Application;" ^
  "$folder = $app.BrowseForFolder(0, 'Wybierz folder:', 0x00000050, 0);" ^
  "$win::ShowWindow($handle, 5) | Out-Null;" ^
  "if ($folder) { $folder.Self.Path }"`) do set "SELECTED_DIR=%%I"

if "%SELECTED_DIR%"=="" exit /b

:loop
cls
if exist "GTN-Tester.exe" (
    .\GTN-Tester.exe "%SELECTED_DIR%"
) else (
    node main.ts "%SELECTED_DIR%"
)

echo.
choice /C roq /N /M "Press R to retry, O to open other folder, or Q to quit: "
if errorlevel 3 exit /b
if errorlevel 2 goto pick_folder
if errorlevel 1 goto loop
