@echo off
cd /d "C:\Users\leome\Documents\polytech\s8\PS8\ps8-24-coolwar\coolWarApp"
call cordova build android

set "APK_SOURCE=C:\Users\leome\Documents\polytech\s8\PS8\ps8-24-coolwar\coolWarApp\platforms\android\app\build\outputs\apk\debug\app-debug.apk"
set "ADB_PATH=C:\Users\leome\AppData\Local\Android\Sdk\platform-tools"

echo Copying APK to your phone...
%ADB_PATH%\adb push "%APK_SOURCE%" "/sdcard/Cordova/"

echo Done.
pause
