@echo off
REM === Guvenli Surus - tek seferlik kurulum ===
REM Onkosul: Node.js ve MongoDB kurulu olmali, MongoDB calisir durumda olmali.

echo ============================================
echo   Guvenli Surus - Kurulum
echo ============================================
echo.

echo [1/4] Backend bagimliliklari kuruluyor...
cd /d "%~dp0backend"
call npm install
if errorlevel 1 goto hata

echo.
echo [2/4] .env dosyasi hazirlaniyor...
if not exist ".env" (
  copy ".env.example" ".env" >nul
  echo     .env olusturuldu.
) else (
  echo     .env zaten var, atlandi.
)

echo.
echo [3/4] Ornek veri yukleniyor (MongoDB calisiyor olmali)...
call npm run seed
if errorlevel 1 goto hata

echo.
echo [4/4] Dashboard bagimliliklari kuruluyor...
cd /d "%~dp0dashboard"
call npm install
if errorlevel 1 goto hata

echo.
echo ============================================
echo   KURULUM TAMAMLANDI
echo   Calistirmak icin: baslat.bat
echo ============================================
pause
exit /b 0

:hata
echo.
echo HATA olustu. Node.js kurulu mu? MongoDB calisiyor mu? Kontrol edin.
pause
exit /b 1
