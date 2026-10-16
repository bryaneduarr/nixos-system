{ pkgs }:
{
  searxngBaseUrl = "http://127.0.0.1:8888";
  provider = "searxng";
  webSearch.allowedProviders = [ "searxng" ];

  crawl4aiBaseUrl = "http://127.0.0.1:11235";
  # The command resolves the same on-host token passed to the OCI container.
  # Only the local user and root can read this file; no secret enters the store.
  crawl4aiApiToken = "!${pkgs.gnused}/bin/sed -n 's/^CRAWL4AI_API_TOKEN=//p' /var/lib/web-research/crawl4ai.env";
  fetchRouting = {
    providers = [
      "http"
      "crawl4ai"
    ];
    allowRemoteHostedProviders = false;
  };
  ssrf.allowRanges = [ "127.0.0.1/32" ];
  # Applies only to fetch_content targets, not to the SearXNG/Crawl4AI endpoints.
  fetchContent.domainPolicy.deny = [
    "localhost"
    "127.0.0.1"
  ];
  maxInlineContentChars = 8000;
}
