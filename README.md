# Control de Gastos - Sistema Financiero Personal

---

## Despliegue Rápido (Docker Compose)

Ejecuta estos comandos para preparar el entorno:

```bash
# 1. Crear directorio y entrar
mkdir -p control-gastos && cd control-gastos

# 2. Descargar el archivo de orquestación
curl -L [https://raw.githubusercontent.com/tu-usuario/controlGastos/main/docker/docker-compose.yml](https://raw.githubusercontent.com/tu-usuario/controlGastos/main/docker/docker-compose.yml) -o docker-compose.yml

# 3. Descargar la plantilla de variables y renombrarla
curl -L [https://raw.githubusercontent.com/tu-usuario/controlGastos/main/docker/.env.example](https://raw.githubusercontent.com/tu-usuario/controlGastos/main/docker/.env.example) -o .env

# 4. Configurar variables (Abre el archivo y rellena tus datos)
nano .env

# 5. Levantar servicios
docker compose up -d
