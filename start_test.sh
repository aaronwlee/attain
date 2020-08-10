#!/bin/bash

deno -V

echo "start basic benchmark"
deno test -A --unstable test/basicTest/ 
status=$?
if test $status -ne 0
then 
  echo "Error code - $status"
  exit $status
fi

echo "start graph benchmark"
deno test -A --unstable test/benchmarks/graph_test.ts
status=$?
if test $status -ne 0
then 
  echo "Error code - $status"
  exit $status
fi

echo "start linear benchmark"
deno test -A --unstable test/benchmarks/linear_test.ts 
status=$?
if test $status -ne 0
then 
  echo "Error code - $status"
  exit $status
fi

echo "start database test"
deno test -A --unstable test/database/
status=$?
if test $status -ne 0
then 
  echo "Error code - $status"
  exit $status
fi