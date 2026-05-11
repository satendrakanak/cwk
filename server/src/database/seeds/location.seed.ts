import { City } from 'src/location/city.entity';
import { Country } from 'src/location/country.entity';
import { State } from 'src/location/state.entity';
import { DataSource, Repository } from 'typeorm';
type CountryJSON = {
  id: string;
  name: string;
  countryCode: string;
  phoneCode?: string;
};

type StateJSON = {
  id: string;
  name: string;
  stateCode: string;
  countryCode: string;
};

type CityJSON = {
  id: string;
  name: string;
  stateCode: string;
  countryCode: string;
};

import countriesJson from './../data/Countries.json';
import statesJson from './../data/States.json';
import citiesJson from './../data/Cities.json';

const countries = countriesJson as CountryJSON[];
const states = statesJson as StateJSON[];
const cities = citiesJson as CityJSON[];

type SeedLocationProgress = {
  phase: 'countries' | 'states' | 'cities' | 'completed';
  progress: number;
  label: string;
  current?: number;
  total?: number;
};

type SeedLocationOptions = {
  cityCountryCodes?: string[];
  skipCountryStateSeed?: boolean;
  cityChunkSize?: number;
  onProgress?: (progress: SeedLocationProgress) => void;
};

const DEFAULT_CITY_CHUNK_SIZE = 2000;

export const seedLocation = async (
  dataSource: DataSource,
  options: SeedLocationOptions = {},
) => {
  const countryRepository = dataSource.getRepository(Country);
  const stateRepository = dataSource.getRepository(State);
  const cityRepository = dataSource.getRepository(City);
  const cityChunkSize = options.cityChunkSize || DEFAULT_CITY_CHUNK_SIZE;
  const cityCountryCodeSet = options.cityCountryCodes?.length
    ? new Set(options.cityCountryCodes)
    : null;

  console.log('🌱 Location seeding started...');

  const countryMap = new Map<string, Country>();
  const stateMap = new Map<string, State>();

  if (!options.skipCountryStateSeed) {
    options.onProgress?.({
      phase: 'countries',
      progress: 2,
      label: 'Preparing countries...',
      current: 0,
      total: countries.length,
    });

    const existingCountries = await countryRepository.find();
    const existingCountryCodes = new Set(
      existingCountries.map((country) => country.countryCode),
    );
    const missingCountries = countries
      .filter((country) => !existingCountryCodes.has(country.countryCode))
      .map((country) =>
        countryRepository.create({
          name: country.name,
          countryCode: country.countryCode,
          phoneCode: country.phoneCode,
        }),
      );

    if (missingCountries.length) {
      await countryRepository.save(missingCountries, { chunk: 500 });
    }

    options.onProgress?.({
      phase: 'countries',
      progress: 12,
      label: 'Countries ready',
      current: countries.length,
      total: countries.length,
    });

    console.log('✅ Countries seeded');
  }

  const countriesFromDb = await countryRepository.find();
  for (const country of countriesFromDb) {
    countryMap.set(country.countryCode, country);
  }

  if (!options.skipCountryStateSeed) {
    options.onProgress?.({
      phase: 'states',
      progress: 14,
      label: 'Preparing states...',
      current: 0,
      total: states.length,
    });

    const existingStates = await stateRepository.find({
      relations: ['country'],
    });
    const existingStateKeys = new Set(
      existingStates.map(
        (state) => `${state.country.countryCode}-${state.name.toLowerCase()}`,
      ),
    );
    const missingStates = states
      .map((state) => {
        const country = countryMap.get(state.countryCode);
        if (!country) return null;

        const key = `${state.countryCode}-${state.name.toLowerCase()}`;
        if (existingStateKeys.has(key)) return null;

        existingStateKeys.add(key);
        return stateRepository.create({
          name: state.name,
          country,
        });
      })
      .filter((state): state is State => Boolean(state));

    if (missingStates.length) {
      await stateRepository.save(missingStates, { chunk: 1000 });
    }

    options.onProgress?.({
      phase: 'states',
      progress: 24,
      label: 'States ready',
      current: states.length,
      total: states.length,
    });

    console.log('✅ States seeded');
  }

  const statesFromDb = await stateRepository.find({
    relations: ['country'],
  });
  for (const state of statesFromDb) {
    const matchingState = states.find(
      (item) =>
        item.countryCode === state.country.countryCode &&
        item.name.toLowerCase() === state.name.toLowerCase(),
    );
    if (!matchingState) continue;

    stateMap.set(
      `${matchingState.countryCode}-${matchingState.stateCode}`,
      state,
    );
  }

  const targetCities = cityCountryCodeSet
    ? cities.filter((city) => cityCountryCodeSet.has(city.countryCode))
    : cities;

  options.onProgress?.({
    phase: 'cities',
    progress: 26,
    label: `Preparing ${targetCities.length.toLocaleString('en-IN')} cities...`,
    current: 0,
    total: targetCities.length,
  });

  const seenCityKeys = new Set<string>();
  const cityRows = targetCities
    .map((city) => {
      const state = stateMap.get(`${city.countryCode}-${city.stateCode}`);
      if (!state) return null;

      const cityKey = `${state.id}-${city.name.toLowerCase()}`;
      if (seenCityKeys.has(cityKey)) return null;

      seenCityKeys.add(cityKey);
      return {
        name: city.name,
        state,
      };
    })
    .filter((city): city is { name: string; state: State } => Boolean(city));

  for (let index = 0; index < cityRows.length; index += cityChunkSize) {
    const chunk = cityRows.slice(index, index + cityChunkSize);
    await insertMissingCities(cityRepository, chunk);

    const current = Math.min(index + cityChunkSize, cityRows.length);
    const cityProgress = cityRows.length
      ? 26 + Math.round((current / cityRows.length) * 72)
      : 98;

    options.onProgress?.({
      phase: 'cities',
      progress: cityProgress,
      label: `Imported ${current.toLocaleString('en-IN')} of ${cityRows.length.toLocaleString('en-IN')} cities...`,
      current,
      total: cityRows.length,
    });

    await new Promise((resolve) => setImmediate(resolve));
  }

  options.onProgress?.({
    phase: 'completed',
    progress: 100,
    label: 'Location data ready',
    current: cityRows.length,
    total: cityRows.length,
  });

  console.log('✅ Cities seeded');
  console.log('🎉 Location seeding completed!');
};

async function insertMissingCities(
  cityRepository: Repository<City>,
  rows: Array<{ name: string; state: State }>,
) {
  if (!rows.length) return;

  const stateIds = Array.from(new Set(rows.map((row) => row.state.id)));
  const names = Array.from(new Set(rows.map((row) => row.name)));
  const existingCities = await cityRepository
    .createQueryBuilder('city')
    .select('city.name', 'name')
    .addSelect('state.id', 'stateId')
    .leftJoin('city.state', 'state')
    .where('state.id IN (:...stateIds)', { stateIds })
    .andWhere('city.name IN (:...names)', { names })
    .getRawMany<{ name: string; stateId: string | number }>();

  const existingKeys = new Set(
    existingCities.map(
      (city) => `${Number(city.stateId)}-${city.name.toLowerCase()}`,
    ),
  );
  const missingRows = rows.filter(
    (row) => !existingKeys.has(`${row.state.id}-${row.name.toLowerCase()}`),
  );

  if (!missingRows.length) return;

  await cityRepository
    .createQueryBuilder()
    .insert()
    .into(City)
    .values(
      missingRows.map((row) => ({
        name: row.name,
        state: { id: row.state.id },
      })),
    )
    .execute();
}

export function getLocationCityCountryCodes() {
  return Array.from(new Set(cities.map((city) => city.countryCode)));
}
