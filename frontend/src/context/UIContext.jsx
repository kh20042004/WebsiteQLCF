import React, { createContext, useContext, useReducer } from 'react';

// Initial state for UI components
const initialState = {
  isBillPanelOpen: false,
  isAddTableModalOpen: false,
  isEditTableModalOpen: false,
  currentTableForBill: null,
  currentTableForEdit: null,
  notifications: []  // For future toast notifications
};

// Action types
export const UI_ACTIONS = {
  // Bill Panel
  OPEN_BILL_PANEL: 'OPEN_BILL_PANEL',
  CLOSE_BILL_PANEL: 'CLOSE_BILL_PANEL',

  // Add Table Modal
  OPEN_ADD_TABLE_MODAL: 'OPEN_ADD_TABLE_MODAL',
  CLOSE_ADD_TABLE_MODAL: 'CLOSE_ADD_TABLE_MODAL',

  // Edit Table Modal
  OPEN_EDIT_TABLE_MODAL: 'OPEN_EDIT_TABLE_MODAL',
  CLOSE_EDIT_TABLE_MODAL: 'CLOSE_EDIT_TABLE_MODAL',

  // Notifications
  ADD_NOTIFICATION: 'ADD_NOTIFICATION',
  REMOVE_NOTIFICATION: 'REMOVE_NOTIFICATION'
};

// Reducer function
const uiReducer = (state, action) => {
  switch (action.type) {
    case UI_ACTIONS.OPEN_BILL_PANEL:
      return {
        ...state,
        isBillPanelOpen: true,
        currentTableForBill: action.payload
      };

    case UI_ACTIONS.CLOSE_BILL_PANEL:
      return {
        ...state,
        isBillPanelOpen: false,
        currentTableForBill: null
      };

    case UI_ACTIONS.OPEN_ADD_TABLE_MODAL:
      return {
        ...state,
        isAddTableModalOpen: true
      };

    case UI_ACTIONS.CLOSE_ADD_TABLE_MODAL:
      return {
        ...state,
        isAddTableModalOpen: false
      };

    case UI_ACTIONS.OPEN_EDIT_TABLE_MODAL:
      return {
        ...state,
        isEditTableModalOpen: true,
        currentTableForEdit: action.payload
      };

    case UI_ACTIONS.CLOSE_EDIT_TABLE_MODAL:
      return {
        ...state,
        isEditTableModalOpen: false,
        currentTableForEdit: null
      };

    case UI_ACTIONS.ADD_NOTIFICATION:
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      };

    case UI_ACTIONS.REMOVE_NOTIFICATION:
      return {
        ...state,
        notifications: state.notifications.filter(
          notification => notification.id !== action.payload
        )
      };

    default:
      return state;
  }
};

// Create contexts
const UIContext = createContext();
const UIDispatchContext = createContext();

// Provider component
export const UIProvider = ({ children }) => {
  const [state, dispatch] = useReducer(uiReducer, initialState);

  return (
    <UIContext.Provider value={state}>
      <UIDispatchContext.Provider value={dispatch}>
        {children}
      </UIDispatchContext.Provider>
    </UIContext.Provider>
  );
};

// Custom hooks to use the context
export const useUIState = () => {
  const context = useContext(UIContext);
  if (context === undefined) {
    throw new Error('useUIState must be used within a UIProvider');
  }
  return context;
};

export const useUIDispatch = () => {
  const context = useContext(UIDispatchContext);
  if (context === undefined) {
    throw new Error('useUIDispatch must be used within a UIProvider');
  }
  return context;
};

export default UIContext;