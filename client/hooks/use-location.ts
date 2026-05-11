// hooks/use-location.ts

import { useEffect, useState } from "react";
import { locationClientService } from "@/services/location/location.client";
import { City, Country, State } from "@/types/location";

export const useLocation = () => {
  const [countries, setCountries] = useState<Country[]>([]);
  const [states, setStates] = useState<State[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedState, setSelectedState] = useState<State | null>(null);
  const [selectedCity, setSelectedCity] = useState<City | null>(null);

  // ✅ Load countries + default India
  useEffect(() => {
    const fetchCountries = async () => {
      const res = await locationClientService.getCountries();
      const data = res.data;
      setCountries(data);
    };

    fetchCountries();
  }, []);

  const fetchStates = async (countryId: number) => {
    const res = await locationClientService.getStates(Number(countryId));
    setStates(res.data);
  };

  const fetchCities = async (stateId: number) => {
    const res = await locationClientService.getCities(Number(stateId));
    setCities(res.data);
  };

  const selectCountry = (country: Country) => {
    setSelectedCountry(country);
    setSelectedState(null);
    setSelectedCity(null);
    setStates([]);
    setCities([]);

    fetchStates(country.id);
  };

  const selectState = (state: State) => {
    setSelectedState(state);
    setSelectedCity(null);
    setCities([]);

    if (!selectedCountry) return;

    fetchCities(state.id);
  };

  const selectCity = (city: City) => {
    setSelectedCity(city);
  };

  return {
    countries,
    states,
    cities,
    selectedCountry,
    selectedState,
    selectedCity,
    selectCountry,
    selectState,
    selectCity,
    setSelectedCountry,
    setSelectedState,
    setSelectedCity,
  };
};
