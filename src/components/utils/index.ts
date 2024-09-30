export const formatTemperature = (temperature: number) => {
    const kelvin = 273.15;
    return `${Math.round(temperature - kelvin)}°C`;
};
