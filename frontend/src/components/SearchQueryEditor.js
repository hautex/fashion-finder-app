import React, { useState, useEffect } from 'react';
import { FaEdit, FaSave, FaUndo, FaSearch } from 'react-icons/fa';

/**
 * Composant permettant d'éditer et personnaliser la requête de recherche
 * Cela donne plus de contrôle à l'utilisateur pour affiner la recherche
 */
const SearchQueryEditor = ({ initialQuery, onSearch, isSearching }) => {
  const [query, setQuery] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [originalQuery, setOriginalQuery] = useState('');

  // Mettre à jour la requête lorsque initialQuery change
  useEffect(() => {
    if (initialQuery) {
      setQuery(initialQuery);
      setOriginalQuery(initialQuery);
    }
  }, [initialQuery]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSave = () => {
    setIsEditing(false);
    setOriginalQuery(query); // Sauvegarder la nouvelle requête comme référence
  };

  const handleCancel = () => {
    setQuery(originalQuery);
    setIsEditing(false);
  };

  const handleChange = (e) => {
    setQuery(e.target.value);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSearch = () => {
    if (query.trim() !== '') {
      handleSave();
      onSearch(query);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow mb-6">
      <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-700 flex items-center">
          <FaSearch className="mr-2" />
          Requête de recherche
        </h2>
        {!isEditing ? (
          <button
            className="px-2 py-1 text-sm bg-blue-100 text-blue-700 rounded flex items-center"
            onClick={handleEdit}
          >
            <FaEdit className="mr-1" /> Modifier
          </button>
        ) : (
          <div className="flex space-x-2">
            <button
              className="px-2 py-1 text-sm bg-red-100 text-red-700 rounded flex items-center"
              onClick={handleCancel}
            >
              <FaUndo className="mr-1" /> Annuler
            </button>
            <button
              className="px-2 py-1 text-sm bg-green-100 text-green-700 rounded flex items-center"
              onClick={handleSave}
            >
              <FaSave className="mr-1" /> Enregistrer
            </button>
          </div>
        )}
      </div>
      <div className="p-4">
        {isEditing ? (
          <div className="flex flex-col space-y-2">
            <label htmlFor="search-query" className="text-sm text-gray-600">
              Modifiez la requête pour affiner la recherche:
            </label>
            <div className="flex space-x-2">
              <input
                id="search-query"
                type="text"
                value={query}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                className="flex-grow px-3 py-2 border rounded focus:ring-2 focus:ring-blue-500 focus:outline-none"
                placeholder="Saisissez votre requête de recherche..."
                autoFocus
              />
              <button
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center disabled:opacity-50"
                onClick={handleSearch}
                disabled={isSearching || query.trim() === ''}
              >
                <FaSearch className="mr-1" /> Rechercher
              </button>
            </div>
            <p className="text-xs text-gray-500 italic">
              Conseil: ajoutez des termes précis comme le type de vêtement, la couleur, le style, la marque, etc.
            </p>
          </div>
        ) : (
          <div className="bg-gray-100 p-3 rounded text-sm font-mono break-words">
            {query || 'Aucune requête disponible'}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchQueryEditor;
