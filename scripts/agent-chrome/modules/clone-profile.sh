readonly -a CLONE_EXCLUDES=(
  'Singleton*' 'Cache/' 'Code Cache/' 'GPUCache/' 'GrShaderCache/' 'ShaderCache/'
  'DawnGraphiteCache/' 'DawnWebGPUCache/' 'Crashpad/' 'BrowserMetrics*'
  'Service Worker/CacheStorage/'
)

clone_profile() {
  local source_directory="$1" target_directory="$2" pattern
  local -a rsync_arguments=(-a)
  [[ -d "$source_directory" ]] || fail "clone source profile not found: $source_directory"
  for pattern in "${CLONE_EXCLUDES[@]}"; do
    rsync_arguments+=("--exclude=$pattern")
  done
  mkdir -p "$target_directory"
  rsync "${rsync_arguments[@]}" "$source_directory/" "$target_directory/"
}
