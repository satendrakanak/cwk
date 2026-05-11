"use client";

import axios from "axios";
import React, {
  ReactNode,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const UserCountryContext = createContext({
  userCountry: "IN",
  userCurrency: "INR",
  userRegion: null,
  userCity: null,
  userIpAddress: null,
  userCountryName: null,
  exchangeRate: 1 as number | null,
});

export const useUserCountry = () => useContext(UserCountryContext);

export const UserCountryProvider: React.FC<{
  children: ReactNode;
}> = ({ children }) => {
  const [userCountry, setUserCountry] = useState("IN");
  const [userCountryName, setUserCountryName] = useState(null);
  const [userIpAddress, setIpAddress] = useState(null);
  const [userRegion, setUserRegion] = useState(null);
  const [userCity, setUserCity] = useState(null);
  const [userCurrency, setUserCurrency] = useState("INR");
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);

  useEffect(() => {
    const fetchUserCountry = async () => {
      try {
        const responseIpInfo = await fetch(
          `https://ipinfo.io/?token=${process.env.NEXT_PUBLIC_IPINFO_ACCESS_TOKEN}`,
        );
        const dataIpInfo = await responseIpInfo.json();
        const responseIpApi = await fetch("https://ipapi.co/json/");
        const dataIpApi = await responseIpApi.json();
        const userCountry = dataIpApi.country;
        const userCurrency = dataIpApi.currency;
        setUserCountry(userCountry);
        setUserCurrency(userCurrency);
        setUserCountryName(dataIpApi.country_name);
        setUserRegion(dataIpApi.region);
        setUserCity(dataIpApi.city);
        setIpAddress(dataIpInfo.ip);
      } catch (error) {
        console.error("Error fetching current country:", error);
      }
    };

    fetchUserCountry();
  }, []);
  useEffect(() => {
    const getExchangeRate = async () => {
      if (!userCurrency || userCurrency === "INR") return setExchangeRate(1);
      try {
        const response = await axios.get(
          `https://api.freecurrencyapi.com/v1/latest?apikey=${process.env.NEXT_PUBLIC_FREE_CURRENCY_API_KEY}&base_currency=USD`,
        );
        const rate = response.data.data?.[userCurrency];

        setExchangeRate(rate ?? 1);
      } catch (err) {
        console.error("Exchange rate fetch failed:", err);
        setExchangeRate(1);
      }
    };

    getExchangeRate();
  }, [userCurrency]);

  return (
    <UserCountryContext.Provider
      value={{
        userCountry,
        userCurrency,
        userRegion,
        userCity,
        userIpAddress,
        userCountryName,
        exchangeRate,
      }}
    >
      {children}
    </UserCountryContext.Provider>
  );
};
