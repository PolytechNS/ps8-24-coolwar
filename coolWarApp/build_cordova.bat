@echo off

:: Nettoyez et construisez le projet
echo Building Cordova project...
call cordova clean
call cordova build

:: Lancer l'émulateur Android
::echo Starting Android emulator...
::call cordova emulate android

:: Fin du script
echo Done.
ENDLOCAL