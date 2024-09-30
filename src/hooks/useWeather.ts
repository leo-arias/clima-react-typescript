import axios from "axios";
import { SearchType } from "../types";
import { InferOutput, number, object, string, parse } from "valibot";
import { useMemo, useState } from "react";

const WeatherSchema = object({
    name: string(),
    main: object({
        temp: number(),
        temp_max: number(),
        temp_min: number(),
    }),
});

export type Weather = InferOutput<typeof WeatherSchema>;

const initialState: Weather = {
    name: "",
    main: {
        temp: 0,
        temp_max: 0,
        temp_min: 0,
    },
};

export default function useWeather() {
    const [weather, setWeather] = useState<Weather>(initialState);
    const [loading, setLoading] = useState(false);
    const [notFound, setNotFound] = useState(false);

    const fetchWeather = async (search: SearchType) => {
        const appId = import.meta.env.VITE_API_KEY;
        setLoading(true);
        setWeather(initialState);

        try {
            const geoUrl = `https://api.openweathermap.org/geo/1.0/direct?q=${search.city},${search.country}&appid=${appId}`;
            const geoResponse = await axios(geoUrl);

            // Comprobamos si la ciudad existe
            if (!geoResponse.data.length) {
                setNotFound(true);
                return;
            }

            const { lat, lon } = geoResponse.data[0];

            const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${appId}`;
            const weatherResponse = await axios(weatherUrl);
            const result = parse(WeatherSchema, weatherResponse.data);

            if (result) {
                setWeather(result);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
            setNotFound(false);
        }
    };

    const hasWeatherData = useMemo(() => weather.name, [weather]);

    return {
        weather,
        loading,
        notFound,
        fetchWeather,
        hasWeatherData,
    };
}
