@echo off
rem Launch a python server to run the Vis on Chrome
title Launching Python Server
echo launching a python server on port 8888 ....
start chrome http://localhost:8888/movies.html
start python -m SimpleHTTPServer 8888