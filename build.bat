@echo off
chcp 65001 > nul
echo กำลังรวมและบีบอัดโค้ดสำหรับ Production...
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0build.ps1"
pause
