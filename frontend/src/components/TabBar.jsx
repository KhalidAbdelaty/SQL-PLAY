import React, { useState } from 'react';
import { Plus, X, Edit2, Copy } from 'lucide-react';
import { useTab } from '../contexts/TabContext';

const TabBar = () => {
  const {
    tabs,
    activeTabId,
    setActiveTabId,
    addTab,
    closeTab,
    renameTab,
    duplicateTab,
  } = useTab();

  const [editingTabId, setEditingTabId] = useState(null);
  const [editValue, setEditValue] = useState('');

  const handleStartEdit = (tab, e) => {
    e.stopPropagation();
    setEditingTabId(tab.id);
    setEditValue(tab.title);
  };

  const handleFinishEdit = (tabId) => {
    if (editValue.trim()) {
      renameTab(tabId, editValue.trim());
    }
    setEditingTabId(null);
  };

  const handleKeyDown = (e, tabId) => {
    if (e.key === 'Enter') {
      handleFinishEdit(tabId);
    } else if (e.key === 'Escape') {
      setEditingTabId(null);
    }
  };

  return (
    <div className="flex items-center gap-1 bg-gray-800 dark:bg-gray-900 border-b border-gray-700 dark:border-gray-800 px-2 py-1 overflow-x-auto">
      {tabs.map((tab) => (
        <div
          key={tab.id}
          className={`
            group flex items-center gap-2 px-3 py-2 rounded-t-lg cursor-pointer
            transition-all min-w-[120px] max-w-[200px] relative
            ${activeTabId === tab.id
              ? 'bg-gray-700 dark:bg-gray-800 text-white border-t-2 border-blue-500'
              : 'bg-gray-750 dark:bg-gray-850 text-gray-400 hover:bg-gray-700 dark:hover:bg-gray-800 hover:text-gray-300'
            }
            ${tab.isExecuting ? 'border-t-2 border-green-500' : ''}
          `}
          onClick={() => setActiveTabId(tab.id)}
        >
          {editingTabId === tab.id ? (
            <input
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => handleFinishEdit(tab.id)}
              onKeyDown={(e) => handleKeyDown(e, tab.id)}
              className="flex-1 bg-transparent border-none outline-none text-sm"
              autoFocus
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <>
              <span className="flex-1 text-sm truncate">
                {tab.title}
              </span>

              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => handleStartEdit(tab, e)}
                  className="p-1 hover:bg-gray-600 dark:hover:bg-gray-700 rounded"
                  title="Rename tab"
                >
                  <Edit2 className="w-3 h-3" />
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    duplicateTab(tab.id);
                  }}
                  className="p-1 hover:bg-gray-600 dark:hover:bg-gray-700 rounded"
                  title="Duplicate tab"
                >
                  <Copy className="w-3 h-3" />
                </button>

                {tabs.length > 1 && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      closeTab(tab.id);
                    }}
                    className="p-1 hover:bg-red-600 rounded"
                    title="Close tab"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </>
          )}

          {tab.isExecuting && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500 animate-pulse" />
          )}
        </div>
      ))}

      <button
        onClick={addTab}
        className="flex items-center justify-center w-8 h-8 rounded hover:bg-gray-700 dark:hover:bg-gray-800 text-gray-400 hover:text-white transition-all"
        title="New tab"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};

export default TabBar;
