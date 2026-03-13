@echo off
chcp 65001 >nul
title 노후연구소 카페 회원 동기화
echo.
echo   컴퓨터를 켜놓으면 자동으로 동기화됩니다.
echo   이 창을 닫으면 동기화가 중지됩니다.
echo.
node "%~dp0sync-cafe-members.mjs"
pause
