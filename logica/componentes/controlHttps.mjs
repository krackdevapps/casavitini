export default (entrada, salida, siguinte) => {
    const dominioDePeticion = entrada.headers.host
    console.log("host", dominioDePeticion)
    if (dominioDePeticion === 'lripoll.ddns.net') {
       // return salida.redirect(301, 'https://casavitini.com' + entrada.originalUrl);
    } else if (!entrada.secure && (dominioDePeticion !== "localhost")) {
        return salida.redirect(301,'https://' + entrada.hostname + ':443' + entrada.url);
    }
    siguinte();
}