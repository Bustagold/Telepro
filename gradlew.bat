@echo off
set DIR=%~dp0
call "%DIR%android\gradlew.bat" -p "%DIR%android" %*
