import { useCallback } from 'react';
import { useUIState, useUIDispatch, UI_ACTIONS } from '../context/UIContext';

/**
 * Custom hook để quản lý modals và UI state
 * Wraps UIContext và cung cấp methods để open/close modals
 */
export const useModal = () => {
  const state = useUIState();
  const dispatch = useUIDispatch();

  // Bill Panel methods
  const openBillPanel = useCallback((table) => {
    dispatch({
      type: UI_ACTIONS.OPEN_BILL_PANEL,
      payload: table
    });
  }, [dispatch]);

  const closeBillPanel = useCallback(() => {
    dispatch({ type: UI_ACTIONS.CLOSE_BILL_PANEL });
  }, [dispatch]);

  // Add Table Modal methods
  const openAddTableModal = useCallback(() => {
    dispatch({ type: UI_ACTIONS.OPEN_ADD_TABLE_MODAL });
  }, [dispatch]);

  const closeAddTableModal = useCallback(() => {
    dispatch({ type: UI_ACTIONS.CLOSE_ADD_TABLE_MODAL });
  }, [dispatch]);

  // Edit Table Modal methods
  const openEditTableModal = useCallback((table) => {
    dispatch({
      type: UI_ACTIONS.OPEN_EDIT_TABLE_MODAL,
      payload: table
    });
  }, [dispatch]);

  const closeEditTableModal = useCallback(() => {
    dispatch({ type: UI_ACTIONS.CLOSE_EDIT_TABLE_MODAL });
  }, [dispatch]);

  // Notification methods (for future use)
  const addNotification = useCallback((notification) => {
    const id = Date.now(); // Simple ID generation
    dispatch({
      type: UI_ACTIONS.ADD_NOTIFICATION,
      payload: {
        ...notification,
        id,
        timestamp: new Date()
      }
    });

    // Auto remove after 5 seconds
    setTimeout(() => {
      dispatch({
        type: UI_ACTIONS.REMOVE_NOTIFICATION,
        payload: id
      });
    }, 5000);

    return id;
  }, [dispatch]);

  const removeNotification = useCallback((id) => {
    dispatch({
      type: UI_ACTIONS.REMOVE_NOTIFICATION,
      payload: id
    });
  }, [dispatch]);

  // Helper methods
  const closeAllModals = useCallback(() => {
    closeBillPanel();
    closeAddTableModal();
    closeEditTableModal();
  }, [closeBillPanel, closeAddTableModal, closeEditTableModal]);

  const showSuccessNotification = useCallback((message) => {
    return addNotification({
      type: 'success',
      message,
      title: 'Thành công'
    });
  }, [addNotification]);

  const showErrorNotification = useCallback((message) => {
    return addNotification({
      type: 'error',
      message,
      title: 'Lỗi'
    });
  }, [addNotification]);

  const showInfoNotification = useCallback((message) => {
    return addNotification({
      type: 'info',
      message,
      title: 'Thông báo'
    });
  }, [addNotification]);

  return {
    // State
    isBillPanelOpen: state.isBillPanelOpen,
    isAddTableModalOpen: state.isAddTableModalOpen,
    isEditTableModalOpen: state.isEditTableModalOpen,
    currentTableForBill: state.currentTableForBill,
    currentTableForEdit: state.currentTableForEdit,
    notifications: state.notifications,

    // Bill Panel
    openBillPanel,
    closeBillPanel,

    // Add Table Modal
    openAddTableModal,
    closeAddTableModal,

    // Edit Table Modal
    openEditTableModal,
    closeEditTableModal,

    // Notifications
    addNotification,
    removeNotification,

    // Helpers
    closeAllModals,
    showSuccessNotification,
    showErrorNotification,
    showInfoNotification
  };
};

export default useModal;