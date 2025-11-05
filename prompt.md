You are given a git *word-diff*. Your goal is to change lines that are incorrectly merged. Most lines should not change. 

Rewrite lines 
1. that are mixing deletions and insertions
AND
2. where MOST of the line changed, ~70% words are different

How to rewrite:
```
[- entire old line -]
{+ entire new line +}
```

The insertions and deletions can NEVER span multiple lines. 

Return the entire modified version of this diff:
