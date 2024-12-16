import {
  createContext,
  useEffect,
  useContext,
  useReducer,
  useCallback,
} from "react";

const CitiesContext = createContext();

const initialState = {
  cities: [],
  citiesData: {},
  isLoading: false,
  currentCity: {},
  error: "",
};

function reducer(state, action) {
  switch (action.type) {
    case "loading":
      return { ...state, isLoading: true, error: "" };

    case "cities/loaded":
      return { ...state, isLoading: false, cities: action.payload };

    case "city/loaded":
      return {
        ...state,
        isLoading: false,
        currentCity: action.payload,
      };

    case "city/created":
      return {
        ...state,
        isLoading: false,
        cities: [...state.cities, action.payload],
      };

    case "city/deleted":
      return {
        ...state,
        isLoading: false,
        cities: state.cities.filter((city) => city.id !== action.payload),
      };

    case "rejected":
      return {
        ...state,
        isLoading: false,
        error: action.payload,
      };

    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}

function CitiesProvider({ children }) {
  const [{ cities, isLoading, currentCity, error, citiesData }, dispatch] =
    useReducer(reducer, initialState);

  useEffect(function () {
    async function fetchCities() {
      dispatch({ type: "loading" });
    
      try {
        const res = await fetch(
          `https://worldwise-aebd9-default-rtdb.europe-west1.firebasedatabase.app/data/cities.json`
        );
    
        const data = await res.json();
    
        if (!data || Object.keys(data).length === 0) return;
    
        const formattedData = Object.values(data).filter((city) => {
          if (!city.position || city.position.lat === undefined || city.position.lng === undefined) {
            console.warn(`Skipping city with invalid position data:`, city);
            return false; // Exclude invalid city
          }
          return true; // Include valid city
        });
    
        dispatch({ type: "cities/loaded", payload: formattedData });
      } catch (error) {
        console.error("Error fetching cities:", error);
        dispatch({
          type: "rejected",
          payload: "There was an error loading cities...",
        });
      }
    }
    fetchCities();
  }, []);

  const getCity = useCallback(async function getCity(id) {
    dispatch({ type: "loading" });
  
    try {
      const res = await fetch(
        `https://worldwise-aebd9-default-rtdb.europe-west1.firebasedatabase.app/data/cities/${id}.json`
      );
  
      const data = await res.json();
      console.log("Fetched city data:", data); // Log fetched city data

      if (!data) return;
      
      dispatch({ type: "city/loaded", payload: data });
    } catch {
      dispatch({
        type: "rejected",
        payload: "There was an error loading the city...",
      });
    }
  }, []);

  async function createCity(newCity) {
    dispatch({ type: "loading" });

    try {
      await fetch(
        `https://worldwise-aebd9-default-rtdb.europe-west1.firebasedatabase.app/data/cities/${newCity.id}.json`,
        {
          method: "PUT",
          body: JSON.stringify(newCity),
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      dispatch({ type: "city/created", payload: newCity });
    } catch {
      dispatch({
        type: "rejected",
        payload: "There was an error creating the city...",
      });
    }
  }

  async function deleteCity(id) {
    dispatch({ type: "loading" });

    try {
      await fetch(
        `https://worldwise-aebd9-default-rtdb.europe-west1.firebasedatabase.app/data/cities/${id}.json`,
        {
          method: "DELETE",
        }
      );

      dispatch({ type: "city/deleted", payload: id });
    } catch {
      dispatch({
        type: "rejected",
        payload: "There was an error deleting the city...",
      });
    }
  }

  return (
    <CitiesContext.Provider
      value={{
        cities,
        citiesData,
        isLoading,
        currentCity,
        error,
        getCity,
        createCity,
        deleteCity,
      }}
    >
      {children}
    </CitiesContext.Provider>
  );
}

function useCities() {
  const context = useContext(CitiesContext);
  if (context === undefined)
    throw new Error("CitiesContext was used outside the CitiesProvider");
  console.log("useCities context:", context);
  return context;
}

export { CitiesProvider, useCities };