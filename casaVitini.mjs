import express from 'express';
import path from 'path';
import { router } from './middleware/rutas.mjs'
import ejs from 'ejs'
import fs from 'fs';

import https from 'https';
import { controlHTTPS } from './logica/componentes/controlHttps.mjs';
import { sessionConfig } from './middleware/almacenSessiones.mjs';
import { controlBaseDeDatos } from './middleware/controlBaseDeDatos.mjs';
import { controlSizePeticion } from './middleware/controlSizePeticion.mjs';
import { controlJSON } from './middleware/controlJSON.mjs';
import { controlTipoVerbo } from './middleware/controlTipoVerbo.mjs';
import { manejador404 } from './middleware/manejador404.mjs';
import dotenv from 'dotenv'
dotenv.config()

process.on('uncaughtException', (error) => {
  console.error('Alerta! ->> Algo a petado:', error.message);
});
const app = express()
app.use(controlHTTPS)
app.set('views', './ui/constructor')
app.set('view engine', 'ejs')
app.use(express.raw({ limit: '50mb' }))
app.use(controlSizePeticion);
app.use(express.json({ limit: '10mb', extended: true }))
app.use(express.urlencoded({ extended: true }))
app.set('trust proxy', true)
app.disable('x-powered-by')
app.use(controlJSON)
app.use('/componentes', express.static(path.join('./ui/componentes')))
app.use(controlBaseDeDatos)
app.use(sessionConfig)
app.use(router)
app.use(controlTipoVerbo)
app.use(manejador404)

const puerto = process.env.PORT_HTTP
const puertoSec = process.env.PORT_HTTPS
const entorno = process.env.ENTORNO_DB
const llave = process.env.CERTIFICADOS_KEY
const cert = process.env.CERTIFICADOS_CERT
const options = {
  key: fs.readFileSync(llave),
  cert: fs.readFileSync(cert),
};
console.info("Entorno DB:", entorno)
console.info("Casa Vitini dice Hola!")

app.listen(puerto, (entrada, Salida) => {
  console.info(">> http:", puerto)
})
https.createServer(options, app).listen(puertoSec, (entrada, salida) => {
  console.info(">> https", puertoSec)
});


