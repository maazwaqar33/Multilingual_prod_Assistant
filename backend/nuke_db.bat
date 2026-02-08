@echo off
:loop
echo Killing uvicorn...
taskkill /F /IM uvicorn.exe >nul 2>&1
echo Killing python...
taskkill /F /IM python.exe >nul 2>&1
timeout /t 2 /nobreak >nul
echo Deleting DB...
del todoevolve.db >nul 2>&1
if exist todoevolve.db (
    echo DB still exists, retrying...
    goto loop
)
echo DB Deleted!
exit 0
