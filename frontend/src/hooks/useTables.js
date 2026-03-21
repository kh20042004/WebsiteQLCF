import { useCallback } from 'react';
import { useTableState, useTableDispatch, TABLE_ACTIONS } from '../context/TableContext';
import tableService from '../services/tableService';

/**
 * Custom hook để quản lý tables
 * Wraps TableContext và cung cấp tất cả CRUD methods
 */
export const useTables = () => {
  const state = useTableState();
  const dispatch = useTableDispatch();

  // Fetch all tables with optional filter
  const fetchTables = useCallback(async (status = null) => {
    dispatch({ type: TABLE_ACTIONS.FETCH_TABLES_REQUEST });

    try {
      const tables = await tableService.getAllTables(status);
      dispatch({
        type: TABLE_ACTIONS.FETCH_TABLES_SUCCESS,
        payload: tables.tables || tables
      });
      return { success: true, data: tables };
    } catch (error) {
      dispatch({
        type: TABLE_ACTIONS.FETCH_TABLES_ERROR,
        payload: error.message
      });
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  // Fetch table statistics
  const fetchStats = useCallback(async () => {
    try {
      const stats = await tableService.getTableStats();
      dispatch({
        type: TABLE_ACTIONS.FETCH_STATS_SUCCESS,
        payload: stats
      });
      return { success: true, data: stats };
    } catch (error) {
      console.error('Error fetching stats:', error);
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  // Create new table
  const createTable = useCallback(async (tableData) => {
    try {
      const newTable = await tableService.createTable(tableData);
      dispatch({
        type: TABLE_ACTIONS.ADD_TABLE,
        payload: newTable
      });

      // Refresh stats after creating table
      fetchStats();

      return { success: true, data: newTable };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [dispatch, fetchStats]);

  // Update table
  const updateTable = useCallback(async (id, tableData) => {
    try {
      const updatedTable = await tableService.updateTable(id, tableData);
      dispatch({
        type: TABLE_ACTIONS.UPDATE_TABLE,
        payload: updatedTable
      });

      return { success: true, data: updatedTable };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  // Update table status
  const updateTableStatus = useCallback(async (id, status) => {
    try {
      const updatedTable = await tableService.updateTableStatus(id, status);
      dispatch({
        type: TABLE_ACTIONS.UPDATE_TABLE,
        payload: updatedTable
      });

      // Refresh stats after status change
      fetchStats();

      return { success: true, data: updatedTable };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [dispatch, fetchStats]);

  // Delete table
  const deleteTable = useCallback(async (id) => {
    try {
      await tableService.deleteTable(id);
      dispatch({
        type: TABLE_ACTIONS.DELETE_TABLE,
        payload: id
      });

      // Refresh stats after deleting table
      fetchStats();

      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [dispatch, fetchStats]);

  // Set filter
  const setFilter = useCallback((filter) => {
    dispatch({
      type: TABLE_ACTIONS.SET_FILTER,
      payload: filter
    });
  }, [dispatch]);

  // Select table for operations
  const selectTable = useCallback((table) => {
    dispatch({
      type: TABLE_ACTIONS.SELECT_TABLE,
      payload: table
    });
  }, [dispatch]);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: TABLE_ACTIONS.CLEAR_ERROR });
  }, [dispatch]);

  // Get tables by status (computed)
  const getTablesByStatus = useCallback((status) => {
    return state.tables.filter(table => table.status === status);
  }, [state.tables]);

  // Get table counts (computed)
  const tableCounts = {
    total: state.tables.length,
    available: state.tables.filter(t => t.status === 'available').length,
    occupied: state.tables.filter(t => t.status === 'occupied').length,
    reserved: state.tables.filter(t => t.status === 'reserved').length
  };

  return {
    // State
    tables: state.tables,
    filteredTables: state.filteredTables,
    currentFilter: state.currentFilter,
    stats: state.stats.total > 0 ? state.stats : tableCounts, // Use computed if stats not loaded
    loading: state.loading,
    error: state.error,
    selectedTable: state.selectedTable,

    // Actions
    fetchTables,
    fetchStats,
    createTable,
    updateTable,
    updateTableStatus,
    deleteTable,
    setFilter,
    selectTable,
    clearError,

    // Computed
    getTablesByStatus,
    tableCounts
  };
};

export default useTables;