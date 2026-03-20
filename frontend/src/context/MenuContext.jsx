import React, { createContext, useContext, useReducer, useCallback } from 'react';

// --- Action Types ---
export const MENU_ACTIONS = {
  FETCH_ITEMS_REQUEST: 'FETCH_ITEMS_REQUEST',
  FETCH_ITEMS_SUCCESS: 'FETCH_ITEMS_SUCCESS',
  FETCH_ITEMS_ERROR: 'FETCH_ITEMS_ERROR',
  
  FETCH_CATEGORIES_REQUEST: 'FETCH_CATEGORIES_REQUEST',
  FETCH_CATEGORIES_SUCCESS: 'FETCH_CATEGORIES_SUCCESS',
  FETCH_CATEGORIES_ERROR: 'FETCH_CATEGORIES_ERROR',
  
  ADD_ITEM: 'ADD_ITEM',
  UPDATE_ITEM: 'UPDATE_ITEM',
  DELETE_ITEM: 'DELETE_ITEM',
  
  SET_SEARCH: 'SET_SEARCH',
  SET_CATEGORY_FILTER: 'SET_CATEGORY_FILTER'
};

// --- Initial State ---
const initialState = {
  items: [],
  categories: [],
  loading: false,
  error: null,
  searchQuery: '',
  categoryFilter: 'all',
  itemsMetadata: {
    totalItems: 0,
    totalPages: 1,
    currentPage: 1
  }
};

// --- Contexts ---
const MenuStateContext = createContext();
const MenuDispatchContext = createContext();

// --- Reducer ---
function menuReducer(state, action) {
  switch (action.type) {
    case MENU_ACTIONS.FETCH_ITEMS_REQUEST:
      return { ...state, loading: true, error: null };
    case MENU_ACTIONS.FETCH_ITEMS_SUCCESS:
      return { 
        ...state, 
        loading: false, 
        items: action.payload.items || action.payload,
        itemsMetadata: action.payload.pagination || state.itemsMetadata
      };
    case MENU_ACTIONS.FETCH_ITEMS_ERROR:
      return { ...state, loading: false, error: action.payload };
      
    case MENU_ACTIONS.FETCH_CATEGORIES_REQUEST:
      return { ...state, loading: true, error: null };
    case MENU_ACTIONS.FETCH_CATEGORIES_SUCCESS:
      return { ...state, loading: false, categories: action.payload };
    case MENU_ACTIONS.FETCH_CATEGORIES_ERROR:
      return { ...state, loading: false, error: action.payload };
      
    case MENU_ACTIONS.ADD_ITEM:
      return { ...state, items: [action.payload, ...state.items] };
    case MENU_ACTIONS.UPDATE_ITEM:
      return { 
        ...state, 
        items: state.items.map(item => item._id === action.payload._id ? action.payload : item) 
      };
    case MENU_ACTIONS.DELETE_ITEM:
      return { 
        ...state, 
        items: state.items.filter(item => item._id !== action.payload) 
      };
      
    case MENU_ACTIONS.SET_SEARCH:
      return { ...state, searchQuery: action.payload };
    case MENU_ACTIONS.SET_CATEGORY_FILTER:
      return { ...state, categoryFilter: action.payload };
      
    default:
      return state;
  }
}

// --- Provider ---
export const MenuProvider = ({ children }) => {
  const [state, dispatch] = useReducer(menuReducer, initialState);

  return (
    <MenuStateContext.Provider value={state}>
      <MenuDispatchContext.Provider value={dispatch}>
        {children}
      </MenuDispatchContext.Provider>
    </MenuStateContext.Provider>
  );
};

// --- Custom Hooks ---
export const useMenuState = () => {
  const context = useContext(MenuStateContext);
  if (context === undefined) {
    throw new Error('useMenuState must be used within a MenuProvider');
  }
  return context;
};

export const useMenuDispatch = () => {
  const context = useContext(MenuDispatchContext);
  if (context === undefined) {
    throw new Error('useMenuDispatch must be used within a MenuProvider');
  }
  return context;
};
