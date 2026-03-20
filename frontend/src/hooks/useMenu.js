import { useCallback } from 'react';
import { useMenuState, useMenuDispatch, MENU_ACTIONS } from '../context/MenuContext';
import itemService from '../services/itemService';
import categoryService from '../services/categoryService';

/**
 * Custom hook để quản lý Menu (Items và Categories)
 */
export const useMenu = () => {
  const state = useMenuState();
  const dispatch = useMenuDispatch();

  // Fetch all items with filters
  const fetchItems = useCallback(async (params = {}) => {
    dispatch({ type: MENU_ACTIONS.FETCH_ITEMS_REQUEST });

    try {
      const items = await itemService.getAllItems(params);
      dispatch({
        type: MENU_ACTIONS.FETCH_ITEMS_SUCCESS,
        payload: items
      });
      return { success: true, data: items };
    } catch (error) {
      dispatch({
        type: MENU_ACTIONS.FETCH_ITEMS_ERROR,
        payload: error.message
      });
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  // Fetch all categories
  const fetchCategories = useCallback(async () => {
    dispatch({ type: MENU_ACTIONS.FETCH_CATEGORIES_REQUEST });

    try {
      const categories = await categoryService.getAllCategories();
      dispatch({
        type: MENU_ACTIONS.FETCH_CATEGORIES_SUCCESS,
        payload: categories
      });
      return { success: true, data: categories };
    } catch (error) {
      dispatch({
        type: MENU_ACTIONS.FETCH_CATEGORIES_ERROR,
        payload: error.message
      });
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  // Create new item
  const createItem = useCallback(async (itemData) => {
    try {
      const newItem = await itemService.createItem(itemData);
      dispatch({
        type: MENU_ACTIONS.ADD_ITEM,
        payload: newItem
      });
      return { success: true, data: newItem };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  // Update item
  const updateItem = useCallback(async (id, itemData) => {
    try {
      const updatedItem = await itemService.updateItem(id, itemData);
      dispatch({
        type: MENU_ACTIONS.UPDATE_ITEM,
        payload: updatedItem
      });
      return { success: true, data: updatedItem };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  // Delete item
  const deleteItem = useCallback(async (id) => {
    try {
      await itemService.deleteItem(id);
      dispatch({
        type: MENU_ACTIONS.DELETE_ITEM,
        payload: id
      });
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }, [dispatch]);

  // Set search query
  const setSearch = useCallback((query) => {
    dispatch({ type: MENU_ACTIONS.SET_SEARCH, payload: query });
  }, [dispatch]);

  // Set category filter
  const setCategoryFilter = useCallback((categoryId) => {
    dispatch({ type: MENU_ACTIONS.SET_CATEGORY_FILTER, payload: categoryId });
  }, [dispatch]);

  return {
    ...state,
    fetchItems,
    fetchCategories,
    createItem,
    updateItem,
    deleteItem,
    setSearch,
    setCategoryFilter
  };
};

export default useMenu;
