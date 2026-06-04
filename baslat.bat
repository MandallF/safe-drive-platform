@echo off
REM === Guvenli Surus - tum servisleri baslat ===
REM Onkosul: kurulum.bat bir kez calistirilmis olmali, MongoDB calisir durumda.

echo Servisler baslatiliyor (3 pencere acilacak)...

REM 1) Backend (5000)
start "Safe Drive - Backend" /D "%~dp0backend" cmd /k "npm run dev"

REM Backend'in acilmasi icin bekle
timeout /t 6 >nul

REM 2) Dashboard (5173)
start "Safe Drive - Dashboard" /D "%~dp0dashboard" cmd /k "npm run dev"

REM 3) Surus simulatoru (canli veri) - backend hazir olsun diye kisa bekler
start "Safe Drive - Simulator" /D "%~dp0backend" cmd /k "timeout /t 4 >nul & npm run simulate"

REM Tarayicida paneli ac
timeout /t 5 >nul
start "" http://localhost:5173

echo.
echo Panel acildi: http://localhost:5173
echo Giris -> Surucu: driver@example.com / driver123   Admin: admin@example.com / admin123
echo.
echo Durdurmak icin acilan 3 pencereyi kapatin (veya her birinde Ctrl+C).
pause
