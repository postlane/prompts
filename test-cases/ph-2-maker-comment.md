pgwatch started as a debugging script I kept copying between projects. Every time a query started timing out in production I would SSH in, set up pg_stat_statements, run queries manually, and then tear it all down. After doing that fifteen times I made it a proper tool.

The decision I'm most interested in feedback on is not storing any data. pgwatch tails the Postgres log file directly using inotify and writes to stdout. This means there is nothing to configure, no separate service to keep running, and no retention policy to worry about. The tradeoff is that you lose history the moment you stop watching, which is intentional.

This is early. It works on Postgres 14 and 15 on Linux. I have not tested on macOS or with managed services like RDS. I am not sure how broadly useful the no-storage approach is outside my own use cases.

If you run Postgres in production and have used it, I would like to know whether the output format is useful or whether you ended up piping it through something else.
