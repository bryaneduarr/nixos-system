{ lib, ... }:
{
  options.my.onedrive = {
    vfsCacheMaxSize = lib.mkOption {
      type = lib.types.str;
      default = "20G";
      description = "Max VFS cache size. Oldest data evicts automatically.";
    };

    vfsCacheMaxAge = lib.mkOption {
      type = lib.types.str;
      default = "24h";
      description = "Cached files unused for this long get evicted.";
    };

    dirCacheTime = lib.mkOption {
      type = lib.types.str;
      default = "30m";
      description = "How long directory listings are cached before re-querying OneDrive.";
    };

    attrTimeout = lib.mkOption {
      type = lib.types.str;
      default = "30s";
      description = "How long file/directory attributes (size, mtime) are cached.";
    };
  };
}
