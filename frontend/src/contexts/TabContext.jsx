import React, { createContext, useContext, useState, useCallback } from 'react';

const TabContext = createContext();

export const useTab = () => {
  const context = useContext(TabContext);
  if (!context) {
    throw new Error('useTab must be used within a TabProvider');
  }
  return context;
};

let tabIdCounter = 1;

export const TabProvider = ({ children }) => {
  const [tabs, setTabs] = useState([
    {
      id: 'tab-1',
      title: 'Query 1',
      query: '-- Write your SQL query here\nSELECT @@VERSION AS [SQL Server Version]',
      result: null,
      isExecuting: false,
    }
  ]);
  const [activeTabId, setActiveTabId] = useState('tab-1');

  const activeTab = tabs.find(tab => tab.id === activeTabId) || tabs[0];

  const addTab = useCallback(() => {
    tabIdCounter++;
    const newTab = {
      id: `tab-${tabIdCounter}`,
      title: `Query ${tabIdCounter}`,
      query: '-- Write your SQL query here\n',
      result: null,
      isExecuting: false,
    };
    setTabs(prev => [...prev, newTab]);
    setActiveTabId(newTab.id);
  }, []);

  const closeTab = useCallback((tabId) => {
    setTabs(prev => {
      const filtered = prev.filter(tab => tab.id !== tabId);
      // Don't allow closing the last tab
      if (filtered.length === 0) {
        return [{
          id: `tab-${++tabIdCounter}`,
          title: `Query ${tabIdCounter}`,
          query: '-- Write your SQL query here\n',
          result: null,
          isExecuting: false,
        }];
      }
      return filtered;
    });

    // If closing active tab, switch to another
    if (tabId === activeTabId) {
      setTabs(prev => {
        const filtered = prev.filter(tab => tab.id !== tabId);
        if (filtered.length > 0) {
          setActiveTabId(filtered[filtered.length - 1].id);
        }
        return prev;
      });
    }
  }, [activeTabId]);

  const updateTab = useCallback((tabId, updates) => {
    setTabs(prev => prev.map(tab =>
      tab.id === tabId ? { ...tab, ...updates } : tab
    ));
  }, []);

  const renameTab = useCallback((tabId, newTitle) => {
    updateTab(tabId, { title: newTitle });
  }, [updateTab]);

  const updateActiveTabQuery = useCallback((query) => {
    updateTab(activeTabId, { query });
  }, [activeTabId, updateTab]);

  const updateActiveTabResult = useCallback((result) => {
    updateTab(activeTabId, { result });
  }, [activeTabId, updateTab]);

  const setActiveTabExecuting = useCallback((isExecuting) => {
    updateTab(activeTabId, { isExecuting });
  }, [activeTabId, updateTab]);

  const duplicateTab = useCallback((tabId) => {
    const tabToDuplicate = tabs.find(tab => tab.id === tabId);
    if (tabToDuplicate) {
      tabIdCounter++;
      const newTab = {
        ...tabToDuplicate,
        id: `tab-${tabIdCounter}`,
        title: `${tabToDuplicate.title} (Copy)`,
        result: null,
        isExecuting: false,
      };
      setTabs(prev => [...prev, newTab]);
      setActiveTabId(newTab.id);
    }
  }, [tabs]);

  const value = {
    tabs,
    activeTabId,
    activeTab,
    setActiveTabId,
    addTab,
    closeTab,
    updateTab,
    renameTab,
    updateActiveTabQuery,
    updateActiveTabResult,
    setActiveTabExecuting,
    duplicateTab,
  };

  return (
    <TabContext.Provider value={value}>
      {children}
    </TabContext.Provider>
  );
};
