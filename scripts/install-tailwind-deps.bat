@echo off
echo Installation des dependances Tailwind CSS pour le frontend
echo ======================================================
echo.

cd "%~dp0..\frontend"

echo Installation du package @tailwindcss/aspect-ratio...
call npm install --save @tailwindcss/aspect-ratio

echo Installation du package @tailwindcss/line-clamp...
call npm install --save @tailwindcss/line-clamp

echo.
echo Installation des dependances Tailwind CSS terminee!
echo.
pause
