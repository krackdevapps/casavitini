export default (entrada, salida, siguinte) => {
    const dominioDePeticion = entrada.headers.host
    if (dominioDePeticion === 'ddns.net') {
     //   return salida.redirect(301, 'https://casavitini.com' + entrada.originalUrl);
    }
    if (!entrada.secure && (dominioDePeticion !== "localhost")) {
        return salida.redirect('https://' + entrada.hostname + ':443' + entrada.url);
    }
    siguinte();
}