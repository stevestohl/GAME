# Word lists

`enable1.txt`: the ENABLE word list (Enhanced North American Benchmark LExicon), 172,823 lowercase words, one per
line. Its authors put it in the public domain. This copy came from
https://github.com/dolph/dictionary (`enable1.txt`, 1,743,363 bytes) on 2026-11-27.

Word Weave checks the words people find against it (sockets/wordweaveRules.js loads it once, when the server
starts). Words with a Q are left out, because Word Weave's letters have no Q, and so are a handful of slurs and
crude words.
