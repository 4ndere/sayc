const apiKey = "4858a0507b84de167523a01d6a0ed0f9";

export const reverseGeocode = async (lat, lng) => {
    try {
        const url = `https://api.openweathermap.org/geo/1.0/reverse?lat=${lat}&lon=${lng}&limit=1&appid=${apiKey}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.length > 0) {
            const ciudad = data[0].name;
            const region = data[0].state;
            return { ciudad, region };
        } else {
            throw new Error("Error en la solicitud de geocodificación inversa");
        }
    } catch (error) {
        throw new Error("Error al realizar la solicitud:", error);
    }
};