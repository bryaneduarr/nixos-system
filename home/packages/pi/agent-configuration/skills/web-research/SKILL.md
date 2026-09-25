---
name: web-research
description: Research current or external information using local SearXNG via pi-web-access. Fetch only relevant sources; use local Crawl4AI only if direct HTTP extraction fails. Use for current events, documentation, comparisons, fact checks, and questions requiring outside sources.
---

# Web research

1. Start with one `web_search` query. Search uses local SearXNG only. Add queries only if results are insufficient, ambiguous, outdated, or lack another perspective. Never switch to hosted search providers. If SearXNG is down, say so instead of silently using another provider.
2. Select sources before fetching: official documentation and repositories, original publications, technical references, then established secondary sources. Normally choose 2 to 5 results; do not fetch the entire result list. Do not use this tool to visit arbitrary local services. The loopback SSRF exception is for SearXNG and Crawl4AI only; never fetch user-provided localhost, intranet, or private-network URLs.
3. Call `fetch_content` for selected public pages in readable mode. It tries direct HTTP and Readability first and falls back to the local Crawl4AI service only if extraction is inadequate. Do not request Crawl4AI for every page, force hosted extractors, or use raw HTML when clean text is available.
4. Keep only the useful fact, supporting passage, publication date, source name, and URL. Do not paste whole pages into context. For long content, use `get_search_content` with `findText` or a bounded `offset` and `limit` to find the relevant passage.
5. Check primary sources for important claims and corroborate with a second source when reasonable. Confirm publication dates for recent claims. Separate facts from opinions and explain contradictions or uncertainty. For programming, prefer official docs, source repositories, release notes, then relevant issues or PRs over SEO blogs.
6. Stop when evidence is sufficient. A typical question needs one search, 2 to 5 selected sources, and 2 to 4 pages actually read. Dig further only if the question requires it.
7. Answer the question first. Cite the URLs you actually used, note uncertainty, and omit irrelevant search results.
