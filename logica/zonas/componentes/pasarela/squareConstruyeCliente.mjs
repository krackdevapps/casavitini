export const squareConstruyeCliente = async (entrada, salida) => {
    try {
        const locationResponse = await clienteSquare.locationsApi.retrieveLocation(SQUARE_LOCATION_ID);
        const currency = locationResponse.result.location.currency;
        const country = locationResponse.result.location.country;
        const idempotencyKey = uuidv4();
        const clienteMetadatos = {
            squareApplicationId: SQUARE_APPLICATION_ID,
            squareLocationId: SQUARE_LOCATION_ID,
            squareAccountCountry: country,
            squareAccountCurrency: currency,
            idempotencyKey
        };
        salida.json(clienteMetadatos);
    } catch (errorCapturado) {
        const error = {
            error: errorCapturado.message
        };
        salida.json(error);
    }
}