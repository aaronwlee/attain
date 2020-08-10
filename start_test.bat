@ECHO OFF

deno -V

echo "start basic benchmark"
deno test -A --unstable test/basicTest/
IF ERRORLEVEL 1 (
EXIT 1
)

echo "start graph benchmark"
deno test -A --unstable test/benchmarks/graph_test.ts
IF ERRORLEVEL 1 (
EXIT 1
)

echo "start linear benchmark"
deno test -A --unstable test/benchmarks/linear_test.ts 
IF ERRORLEVEL 1 (
EXIT 1
)

echo "start database test"
deno test -A --unstable test/database/
IF ERRORLEVEL 1 (
EXIT 1
)