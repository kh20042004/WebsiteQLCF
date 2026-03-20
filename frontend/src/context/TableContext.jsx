import React, { createContext, useContext, useReducer } from 'react';

// Initial state
const initialState = {
  tables: [],              // All tables from API
  filteredTables: [],      // Tables after applying filter
  currentFilter: 'all',    // 'all' | 'available' | 'occupied' | 'reserved'
  stats: {                 // From /api/tables/stats
    total: 0,
    available: 0,
    occupied: 0,
    reserved: 0
  },
  loading: false,
  error: null,
  selectedTable: null      // For bill panel
};

// Action types
export const TABLE_ACTIONS = {
  // Fetch operations
  FETCH_TABLES_REQUEST: 'FETCH_TABLES_REQUEST',
  FETCH_TABLES_SUCCESS: 'FETCH_TABLES_SUCCESS',
  FETCH_TABLES_ERROR: 'FETCH_TABLES_ERROR',

  // Stats
  FETCH_STATS_SUCCESS: 'FETCH_STATS_SUCCESS',

  // CRUD operations
  ADD_TABLE: 'ADD_TABLE',
  UPDATE_TABLE: 'UPDATE_TABLE',
  DELETE_TABLE: 'DELETE_TABLE',

  // Filter
  SET_FILTER: 'SET_FILTER',

  // UI
  SELECT_TABLE: 'SELECT_TABLE',
  CLEAR_ERROR: 'CLEAR_ERROR'
};

// Reducer function
const tableReducer = (state, action) => {
  switch (action.type) {
    case TABLE_ACTIONS.FETCH_TABLES_REQUEST:
      return {
        ...state,
        loading: true,
        error: null
      };

    case TABLE_ACTIONS.FETCH_TABLES_SUCCESS:
      const tables = action.payload;
      return {
        ...state,
        loading: false,
        tables,
        filteredTables: filterTables(tables, state.currentFilter),
        error: null
      };

    case TABLE_ACTIONS.FETCH_TABLES_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload
      };

    case TABLE_ACTIONS.FETCH_STATS_SUCCESS:
      return {
        ...state,
        stats: action.payload
      };

    case TABLE_ACTIONS.ADD_TABLE:
      const newTable = action.payload;
      const updatedTablesAdd = [...state.tables, newTable];
      return {
        ...state,
        tables: updatedTablesAdd,
        filteredTables: filterTables(updatedTablesAdd, state.currentFilter)
      };

    case TABLE_ACTIONS.UPDATE_TABLE:
      const updatedTable = action.payload;
      const updatedTablesUpdate = state.tables.map(table =>
        table._id === updatedTable._id ? updatedTable : table
      );
      return {
        ...state,
        tables: updatedTablesUpdate,
        filteredTables: filterTables(updatedTablesUpdate, state.currentFilter)
      };

    case TABLE_ACTIONS.DELETE_TABLE:
      const deletedTableId = action.payload;
      const updatedTablesDelete = state.tables.filter(table => table._id !== deletedTableId);
      return {
        ...state,
        tables: updatedTablesDelete,
        filteredTables: filterTables(updatedTablesDelete, state.currentFilter)
      };

    case TABLE_ACTIONS.SET_FILTER:
      const filter = action.payload;
      return {
        ...state,
        currentFilter: filter,
        filteredTables: filterTables(state.tables, filter)
      };

    case TABLE_ACTIONS.SELECT_TABLE:
      return {
        ...state,
        selectedTable: action.payload
      };

    case TABLE_ACTIONS.CLEAR_ERROR:
      return {
        ...state,
        error: null
      };

    default:
      return state;
  }
};

// Helper function to filter tables
const filterTables = (tables, filter) => {
  if (filter === 'all') return tables;
  return tables.filter(table => table.status === filter);
};

// Create contexts
const TableContext = createContext();
const TableDispatchContext = createContext();

// Provider component
export const TableProvider = ({ children }) => {
  const [state, dispatch] = useReducer(tableReducer, initialState);

  return (
    <TableContext.Provider value={state}>
      <TableDispatchContext.Provider value={dispatch}>
        {children}
      </TableDispatchContext.Provider>
    </TableContext.Provider>
  );
};

// Custom hooks to use the context
export const useTableState = () => {
  const context = useContext(TableContext);
  if (context === undefined) {
    throw new Error('useTableState must be used within a TableProvider');
  }
  return context;
};

export const useTableDispatch = () => {
  const context = useContext(TableDispatchContext);
  if (context === undefined) {
    throw new Error('useTableDispatch must be used within a TableProvider');
  }
  return context;
};

export default TableContext;