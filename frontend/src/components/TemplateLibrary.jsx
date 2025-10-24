import React, { useState } from 'react';
import { FileText, Search, X, Plus, Trash2, Copy } from 'lucide-react';
import { useTemplate } from '../contexts/TemplateContext';
import { useTab } from '../contexts/TabContext';

const TemplateLibrary = ({ isOpen, onClose }) => {
  const { templates, categories, searchTemplates, deleteTemplate, addTemplate } = useTemplate();
  const { updateActiveTabQuery, addTab } = useTab();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTemplate, setNewTemplate] = useState({
    name: '',
    category: 'Custom',
    description: '',
    query: '',
  });

  if (!isOpen) return null;

  const filteredTemplates = searchQuery
    ? searchTemplates(searchQuery)
    : selectedCategory === 'All'
    ? templates
    : templates.filter(t => t.category === selectedCategory);

  const handleUseTemplate = (template, inNewTab = false) => {
    if (inNewTab) {
      addTab();
      setTimeout(() => {
        updateActiveTabQuery(template.query);
      }, 50);
    } else {
      updateActiveTabQuery(template.query);
    }
    onClose();
  };

  const handleAddTemplate = () => {
    if (newTemplate.name && newTemplate.query) {
      addTemplate(newTemplate);
      setNewTemplate({
        name: '',
        category: 'Custom',
        description: '',
        query: '',
      });
      setShowAddForm(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gray-800 dark:bg-gray-900 rounded-lg shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-500" />
            <h2 className="text-xl font-bold text-white">Query Templates</h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Search and Filter */}
        <div className="p-4 border-b border-gray-700 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search templates..."
              className="w-full pl-10 pr-4 py-2 bg-gray-700 dark:bg-gray-800 text-white rounded-lg border border-gray-600 focus:border-blue-500 outline-none"
            />
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setSelectedCategory('All')}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                selectedCategory === 'All'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  selectedCategory === category
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {category}
              </button>
            ))}
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="ml-auto px-3 py-1 rounded-lg text-sm bg-green-600 hover:bg-green-700 text-white transition-colors flex items-center gap-1"
            >
              <Plus className="w-4 h-4" />
              Add Custom
            </button>
          </div>
        </div>

        {/* Add Template Form */}
        {showAddForm && (
          <div className="p-4 border-b border-gray-700 bg-gray-750 dark:bg-gray-850">
            <h3 className="text-white font-semibold mb-3">Create Custom Template</h3>
            <div className="space-y-2">
              <input
                type="text"
                placeholder="Template name"
                value={newTemplate.name}
                onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 outline-none"
              />
              <input
                type="text"
                placeholder="Category"
                value={newTemplate.category}
                onChange={(e) => setNewTemplate({ ...newTemplate, category: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 outline-none"
              />
              <input
                type="text"
                placeholder="Description"
                value={newTemplate.description}
                onChange={(e) => setNewTemplate({ ...newTemplate, description: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 outline-none"
              />
              <textarea
                placeholder="SQL Query"
                value={newTemplate.query}
                onChange={(e) => setNewTemplate({ ...newTemplate, query: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-blue-500 outline-none font-mono text-sm"
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddTemplate}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
                >
                  Save Template
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="p-4 bg-gray-750 dark:bg-gray-850 rounded-lg border border-gray-700 hover:border-blue-500 transition-all group"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <h3 className="text-white font-semibold">{template.name}</h3>
                    <p className="text-xs text-gray-400 mt-1">{template.description}</p>
                  </div>
                  <span className="text-xs px-2 py-1 bg-gray-700 text-gray-300 rounded">
                    {template.category}
                  </span>
                </div>

                <pre className="text-xs bg-gray-800 dark:bg-gray-900 p-2 rounded mt-2 text-gray-300 overflow-x-auto max-h-32">
                  {template.query}
                </pre>

                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => handleUseTemplate(template, false)}
                    className="flex-1 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded transition-colors"
                  >
                    Use in Current Tab
                  </button>
                  <button
                    onClick={() => handleUseTemplate(template, true)}
                    className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded transition-colors"
                    title="Open in new tab"
                  >
                    <Copy className="w-4 h-4" />
                  </button>
                  {!template.id.startsWith('custom-') || (
                    <button
                      onClick={() => deleteTemplate(template.id)}
                      className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                      title="Delete template"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>

          {filteredTemplates.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <FileText className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No templates found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemplateLibrary;
