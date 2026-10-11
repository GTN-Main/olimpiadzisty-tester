@echo off
setlocal

for /f "usebackq tokens=*" %%I in (`powershell -NoProfile -Command "Add-Type -AssemblyName System.Windows.Forms; $dialog = New-Object System.Windows.Forms.FolderBrowserDialog; $dialog.ShowNewFolderButton = $false; $dialog.RootFolder = 'MyComputer'; if($dialog.ShowDialog() -eq 'OK'){ $dialog.SelectedPath }"`) do set "SELECTED_DIR=%%I"

if "%SELECTED_DIR%"=="" exit /b

:loop
cls
if exist "GTN-Tester.exe" (
    .\GTN-Tester.exe "%SELECTED_DIR%"
) else (
    node main.ts "%SELECTED_DIR%"
)

echo.
choice /C rq /N /M "Press R to retry or Q to quit: "
if errorlevel 2 exit /b
if errorlevel 1 goto loop
