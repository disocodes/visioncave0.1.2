import React, { createContext, useContext, useReducer } from 'react';

const WidgetContext = createContext();

const initialState = {
  widgets: [],
  activeModule: null,
};

const widgetReducer = (state, action) => {
  switch (action.type) {
    case 'ADD_WIDGET':
      return {
        ...state,
        widgets: [...state.widgets, action.payload],
      };
    case 'REMOVE_WIDGET':
      return {
        ...state,
        widgets: state.widgets.filter((widget) => widget.id !== action.payload),
      };
    case 'REORDER_WIDGETS':
      return {
        ...state,
        widgets: action.payload,
      };
    case 'SET_ACTIVE_MODULE':
      return {
        ...state,
        activeModule: action.payload,
      };
    default:
      return state;
  }
};

export const WidgetProvider = ({ children }) => {
  const [state, dispatch] = useReducer(widgetReducer, initialState);

  const addWidget = (widget) => {
    dispatch({ type: 'ADD_WIDGET', payload: widget });
  };

  const removeWidget = (widgetId) => {
    dispatch({ type: 'REMOVE_WIDGET', payload: widgetId });
  };

  const reorderWidgets = (widgets) => {
    dispatch({ type: 'REORDER_WIDGETS', payload: widgets });
  };

  const setActiveModule = (module) => {
    dispatch({ type: 'SET_ACTIVE_MODULE', payload: module });
  };

  return (
    <WidgetContext.Provider
      value={{
        widgets: state.widgets,
        activeModule: state.activeModule,
        addWidget,
        removeWidget,
        reorderWidgets,
        setActiveModule,
      }}
    >
      {children}
    </WidgetContext.Provider>
  );
};

export const useWidgets = () => {
  const context = useContext(WidgetContext);
  if (!context) {
    throw new Error('useWidgets must be used within a WidgetProvider');
  }
  return context;
};

export default WidgetContext;
