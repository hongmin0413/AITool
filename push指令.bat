set /p commitMsg="commit message: "
git add .
git commit -m "%commitMsg%"
rem git push origin main
git push origin master