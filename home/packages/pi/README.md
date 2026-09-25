# Configuración de Pi

- `agent-configuration/extensions/` contiene las extensiones pequeñas. Cada archivo registra una función independiente de Pi.
- `agent-configuration/harness/tools/` implementa las herramientas. `tools/search/` separa la búsqueda de coincidencias y el formato de resultados.
- `agent-configuration/harness/activity/` guarda el estado y valida los datos recibidos de Pi.
- `agent-configuration/harness/ui/activity/` registra eventos, reconstruye sesiones y presenta el resumen.
- `agent-configuration/harness/ui/inspector/` separa la navegación, la entrada, el diseño de pantalla, las listas y el detalle de cada llamada.
- `agent-configuration/settings/` define la configuración que Home Manager instala como archivos JSON.
- `agent-configuration/themes/` contiene los temas.
- `agent-configuration/skills/` contiene las instrucciones instaladas como skills.
- `home-manager/` instala los archivos y configura Pi. `pi-tools/` empaqueta sus dependencias. `tests/` contiene las pruebas de las extensiones.

`home-manager/managed-files.nix` conecta los archivos fuente con sus destinos en el directorio personal. Para ejecutar las pruebas, usa `bun test` desde `home/packages/pi/`.
