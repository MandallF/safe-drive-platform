@echo off
REM === Guvenli Surus - TELEFON ile CANLI demo ===
REM Backend + Dashboard + Expo (telefon icin QR) baslatir.
REM Simulator BASLATILMAZ (telefonun gercek verisiyle karismasin diye).
REM Onkosul: kurulum.bat bir kez calistirilmis, MongoDB calisiyor,
REM          mobile/app.json icindeki apiUrl laptopun IP'sine ayarli olmali.

echo ===============================================
echo   Guvenli Surus - TELEFON ile canli demo
echo ===============================================
echo.
echo Servisler baslatiliyor: backend, panel, Expo...

start "Safe Drive - Backend"   /D "%~dp0backend"   cmd /k "npm run dev"
timeout /t 6 >nul

start "Safe Drive - Dashboard" /D "%~dp0dashboard" cmd /k "npm run dev"
timeout /t 3 >nul

start "Safe Drive - Expo (telefon)" /D "%~dp0mobile" cmd /k "npx expo start"
timeout /t 5 >nul

start "" http://localhost:5173

echo.
echo  1) Tarayicida acilan panelde driver@example.com / driver123 ile giris yap,
echo     Dashboard sayfasinda kal.
echo  2) "Expo" penceresindeki QR kodu telefonla (Expo Go) tara.
echo  3) Telefonda giris yap -> "Surus Baslat" -> telefonu hareket ettir.
echo     Panelde canli veri akar.
echo.
echo  Durdurmak icin acilan pencereleri kapatin.
pause
