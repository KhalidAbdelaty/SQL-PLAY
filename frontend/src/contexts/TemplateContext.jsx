import React, { createContext, useContext, useState, useEffect } from 'react';

const TemplateContext = createContext();

export const useTemplate = () => {
  const context = useContext(TemplateContext);
  if (!context) {
    throw new Error('useTemplate must be used within a TemplateProvider');
  }
  return context;
};

// Default templates
const DEFAULT_TEMPLATES = [
  {
    id: 'select-all',
    name: 'Select All',
    category: 'Basic',
    description: 'Select all columns from a table',
    query: 'SELECT *\nFROM [schema].[table_name];',
  },
  {
    id: 'select-where',
    name: 'Select with WHERE',
    category: 'Basic',
    description: 'Select with filtering condition',
    query: 'SELECT column1, column2\nFROM [schema].[table_name]\nWHERE condition = value;',
  },
  {
    id: 'inner-join',
    name: 'Inner Join',
    category: 'Joins',
    description: 'Join two tables',
    query: 'SELECT t1.column1, t2.column2\nFROM [schema].[table1] t1\nINNER JOIN [schema].[table2] t2\n  ON t1.id = t2.foreign_id;',
  },
  {
    id: 'left-join',
    name: 'Left Join',
    category: 'Joins',
    description: 'Left outer join two tables',
    query: 'SELECT t1.column1, t2.column2\nFROM [schema].[table1] t1\nLEFT JOIN [schema].[table2] t2\n  ON t1.id = t2.foreign_id;',
  },
  {
    id: 'group-by',
    name: 'Group By with Aggregation',
    category: 'Aggregation',
    description: 'Group and aggregate data',
    query: 'SELECT \n  column1,\n  COUNT(*) as count,\n  SUM(column2) as total,\n  AVG(column2) as average\nFROM [schema].[table_name]\nGROUP BY column1\nORDER BY count DESC;',
  },
  {
    id: 'subquery',
    name: 'Subquery',
    category: 'Advanced',
    description: 'Query with subquery in WHERE',
    query: 'SELECT column1, column2\nFROM [schema].[table_name]\nWHERE column1 IN (\n  SELECT column1\n  FROM [schema].[other_table]\n  WHERE condition = value\n);',
  },
  {
    id: 'cte',
    name: 'Common Table Expression (CTE)',
    category: 'Advanced',
    description: 'Use CTE for complex queries',
    query: 'WITH cte_name AS (\n  SELECT column1, column2\n  FROM [schema].[table_name]\n  WHERE condition = value\n)\nSELECT *\nFROM cte_name\nORDER BY column1;',
  },
  {
    id: 'insert',
    name: 'Insert Data',
    category: 'DML',
    description: 'Insert new rows',
    query: 'INSERT INTO [schema].[table_name] (column1, column2, column3)\nVALUES \n  (value1, value2, value3),\n  (value4, value5, value6);',
  },
  {
    id: 'update',
    name: 'Update Data',
    category: 'DML',
    description: 'Update existing rows',
    query: 'UPDATE [schema].[table_name]\nSET \n  column1 = value1,\n  column2 = value2\nWHERE condition = value;',
  },
  {
    id: 'delete',
    name: 'Delete Data',
    category: 'DML',
    description: 'Delete rows',
    query: 'DELETE FROM [schema].[table_name]\nWHERE condition = value;',
  },
  {
    id: 'create-table',
    name: 'Create Table',
    category: 'DDL',
    description: 'Create a new table',
    query: 'CREATE TABLE [schema].[table_name] (\n  id INT PRIMARY KEY IDENTITY(1,1),\n  column1 NVARCHAR(100) NOT NULL,\n  column2 INT,\n  created_at DATETIME DEFAULT GETDATE()\n);',
  },
  {
    id: 'window-function',
    name: 'Window Function',
    category: 'Advanced',
    description: 'Use window functions for analytics',
    query: 'SELECT \n  column1,\n  column2,\n  ROW_NUMBER() OVER (PARTITION BY column1 ORDER BY column2 DESC) as row_num,\n  RANK() OVER (ORDER BY column2 DESC) as rank\nFROM [schema].[table_name];',
  },
  {
    id: 'pivot',
    name: 'Pivot Table',
    category: 'Advanced',
    description: 'Pivot data from rows to columns',
    query: 'SELECT *\nFROM (\n  SELECT column1, column2, value\n  FROM [schema].[table_name]\n) AS SourceTable\nPIVOT (\n  SUM(value)\n  FOR column2 IN ([Value1], [Value2], [Value3])\n) AS PivotTable;',
  },
  {
    id: 'temp-table',
    name: 'Temporary Table',
    category: 'Advanced',
    description: 'Create and use temp table',
    query: 'CREATE TABLE #TempTable (\n  id INT,\n  name NVARCHAR(100)\n);\n\nINSERT INTO #TempTable\nSELECT id, name\nFROM [schema].[table_name];\n\nSELECT * FROM #TempTable;\n\nDROP TABLE #TempTable;',
  },
  {
    id: 'transaction',
    name: 'Transaction',
    category: 'Advanced',
    description: 'Use transaction for data integrity',
    query: 'BEGIN TRANSACTION;\n\nBEGIN TRY\n  -- Your queries here\n  UPDATE [schema].[table_name]\n  SET column1 = value1\n  WHERE condition = value;\n  \n  COMMIT TRANSACTION;\nEND TRY\nBEGIN CATCH\n  ROLLBACK TRANSACTION;\n  SELECT ERROR_MESSAGE() AS ErrorMessage;\nEND CATCH;',
  },
];

export const TemplateProvider = ({ children }) => {
  const [templates, setTemplates] = useState(() => {
    const saved = localStorage.getItem('sql-playground-templates');
    if (saved) {
      try {
        const custom = JSON.parse(saved);
        return [...DEFAULT_TEMPLATES, ...custom];
      } catch (e) {
        return DEFAULT_TEMPLATES;
      }
    }
    return DEFAULT_TEMPLATES;
  });

  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // Extract unique categories
    const cats = [...new Set(templates.map(t => t.category))];
    setCategories(cats);

    // Save custom templates (exclude defaults)
    const customTemplates = templates.filter(t =>
      !DEFAULT_TEMPLATES.find(dt => dt.id === t.id)
    );
    localStorage.setItem('sql-playground-templates', JSON.stringify(customTemplates));
  }, [templates]);

  const addTemplate = (template) => {
    const newTemplate = {
      ...template,
      id: `custom-${Date.now()}`,
    };
    setTemplates(prev => [...prev, newTemplate]);
  };

  const updateTemplate = (id, updates) => {
    setTemplates(prev => prev.map(t =>
      t.id === id ? { ...t, ...updates } : t
    ));
  };

  const deleteTemplate = (id) => {
    // Don't allow deleting default templates
    if (DEFAULT_TEMPLATES.find(t => t.id === id)) {
      return false;
    }
    setTemplates(prev => prev.filter(t => t.id !== id));
    return true;
  };

  const getTemplatesByCategory = (category) => {
    return templates.filter(t => t.category === category);
  };

  const searchTemplates = (query) => {
    const lowerQuery = query.toLowerCase();
    return templates.filter(t =>
      t.name.toLowerCase().includes(lowerQuery) ||
      t.description.toLowerCase().includes(lowerQuery) ||
      t.query.toLowerCase().includes(lowerQuery)
    );
  };

  const value = {
    templates,
    categories,
    addTemplate,
    updateTemplate,
    deleteTemplate,
    getTemplatesByCategory,
    searchTemplates,
  };

  return (
    <TemplateContext.Provider value={value}>
      {children}
    </TemplateContext.Provider>
  );
};
