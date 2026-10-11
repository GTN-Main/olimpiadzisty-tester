@echo off
setlocal

:pick_folder
set "SELECTED_DIR="
for /f "usebackq tokens=*" %%I in (`powershell -NoProfile -Command "Add-Type -AssemblyName System.Windows.Forms; $d = New-Object System.Windows.Forms.OpenFileDialog; $d.Title = 'Select the folder with test files'; $d.ValidateNames = $false; $d.CheckFileExists = $false; $d.FileName = '[Use current folder]'; if($d.ShowDialog() -eq 'OK'){ Split-Path $d.FileName }"`) do set "SELECTED_DIR=%%I"

if "%SELECTED_DIR%"=="" exit /b

:loop
cls
if exist "GTN-Tester.exe" (
    .\GTN-Tester.exe "%SELECTED_DIR%"
) else (
    node main.ts "%SELECTED_DIR%"
)

echo.
choice /C roq /N /M "Press R to retry, O to open new folder, or Q to quit: "

if errorlevel 3 exit /b
if errorlevel 2 goto pick_folder
if errorlevel 1 goto loop
