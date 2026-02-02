
export const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

// Helper to add Authorization header when we have a token
export const getHeaders = () => {
  const token = sessionStorage.getItem('authToken');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const login = async (email, password) => {
  const response = await fetch(`${BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Login failed');
  }

  return response.json(); // { token, user }
};

export const register = async (name, email, password) => {
  const response = await fetch(`${BASE_URL}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name,     // ← must be here (first or wherever your backend expects)
      email,
      password
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Registration failed');
  }

  return response.json();
};

// get current user (if your backend has /auth/me or similar)
export const getCurrentUser = async () => {
  const response = await fetch(`${BASE_URL}/auth/me`, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch user details');
  }

  const data = await response.json();
  return data.user || data; // adjust based on your response shape
};


export const getBoards = async () => {
  const response = await fetch(`${BASE_URL}/boards`, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch boards');
  }

  const data = await response.json();
  return data.boards || []; // extract the boards array
};

// src/services/api.js
export const createBoard = async (title, description, backgroundColor) => {
  const response = await fetch(`${BASE_URL}/boards`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({ title, description, backgroundColor }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create board');
  }

  return response.json(); // returns the created board object
};

// Delete a board
export const deleteBoard = async (boardId) => {
  const response = await fetch(`${BASE_URL}/boards/${boardId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete board');
  }

  return response.json(); // or just { success: true } — whatever your backend returns
};


/**
 * Fetch all lists for a specific board
 * @param {string} boardId - The ID of the board
 * @returns {Promise<Array>} List of lists for the board
 */
export const getLists = async (boardId) => {
  if (!boardId) {
    throw new Error('Board ID is required');
  }

  const response = await fetch(`${BASE_URL}/lists/board/${boardId}`, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch lists for this board');
  }

  const data = await response.json();

  // Adjust based on your actual response shape
  // Assuming it returns { lists: [...] } or directly [...]
  return data.lists || data || [];
};


// src/services/api.js
export const createList = async (boardId, title, description = '') => {
  const response = await fetch(`${BASE_URL}/lists`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      boardId,          // required
      title,
      description,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create list');
  }

  const data = await response.json();
  return data.list; // returns the created list object
};

// ...

// Delete a list by ID
export const deleteList = async (listId) => {
  if (!listId) throw new Error('List ID is required');

  const response = await fetch(`${BASE_URL}/lists/${listId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete list');
  }

  return response.json(); // or just return success
};

// Update a list
export const updateList = async (listId, title, description = '') => {
  if (!listId) {
    throw new Error('List ID is required');
  }

  const response = await fetch(`${BASE_URL}/lists/${listId}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({
      title,
      description,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update list');
  }

  const data = await response.json();
  return data.list; // returns updated list object
};


// Cards

// Fetch all cards for a specific Cards
export const getCards = async (listId) => {
  if (!listId) {
    throw new Error('List ID is required');
  }

  const response = await fetch(`${BASE_URL}/cards/list/${listId}`, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch cards for this list');
  }

  const data = await response.json();
  // Assuming response is { cards: [...] } or directly [...]
  return data.cards || data || [];
};

//Create a Card
// Create a new card in a list
export const createCard = async (listId, title, description = '') => {
  if (!listId) {
    throw new Error('List ID is required');
  }

  const response = await fetch(`${BASE_URL}/cards`, {  // or /cards/list/${listId} if needed
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      listId,          // required by backend
      title,
      description,
      // add other fields like priority, dueDate, labels later if needed
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create card');
  }

  const data = await response.json();
  return data.card; // returns the new card object
};


// Delete a card by ID
export const deleteCard = async (cardId) => {
  if (!cardId) {
    throw new Error('Card ID is required');
  }

  const response = await fetch(`${BASE_URL}/cards/${cardId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete card');
  }

  return response.json(); // or just { success: true }
};

// Update a card by ID
export const updateCard = async (cardId, updates) => {
  if (!cardId) {
    throw new Error('Card ID is required');
  }

  const response = await fetch(`${BASE_URL}/cards/${cardId}`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update card');
  }

  const data = await response.json();
  return data.card; // returns updated card object
};

// Add a comment to a card
export const addComment = async (cardId, text) => {
  if (!cardId || !text) {
    throw new Error('Card ID and comment text are required');
  }

  const response = await fetch(`${BASE_URL}/cards/${cardId}/comments`, {
    method: 'POST',
    headers: getHeaders(),
    body: JSON.stringify({
      text,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to add comment');
  }

  const data = await response.json();
  return data.card; // returns updated card object with new comment
};

// Delete a comment from a card
export const deleteComment = async (cardId, commentId) => {
  if (!cardId || !commentId) {
    throw new Error('Card ID and comment ID are required');
  }

  const response = await fetch(`${BASE_URL}/cards/${cardId}/comments/${commentId}`, {
    method: 'DELETE',
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to delete comment');
  }

  const data = await response.json();
  return data.card; // returns updated card object with comment removed
};



// Reorder lists for a board (PATCH)
export const reorderLists = async (boardId, listIds) => {
  if (!boardId || !Array.isArray(listIds)) {
    throw new Error('Board ID and list IDs array are required');
  }

  const response = await fetch(`${BASE_URL}/lists/reorder`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({
      boardId,
      orderedListIds: listIds, // array of list _ids in the new order
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to reorder lists');
  }

  return response.json(); // or just success message
};

// Reorder cards in a list (PATCH)
export const reorderCards = async (listId, cardIds) => {
  if (!listId || !Array.isArray(cardIds)) {
    throw new Error('List ID and card IDs array are required');
  }

  const response = await fetch(`${BASE_URL}/cards/reorder`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({
      listId,
      cardIds, // array of card _ids in new order
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to reorder cards');
  }

  return response.json(); // or success message
};


// Get all cards assigned to the current user
export const getMyTasks = async () => {
  const response = await fetch(`${BASE_URL}/cards/my-tasks`, {
    method: 'GET',
    headers: getHeaders(),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch your tasks');
  }

  const data = await response.json();
  return data.cards || data || [];
};


// Change user password
export const changePassword = async (currentPassword, newPassword) => {
  const response = await fetch(`${BASE_URL}/auth/change-password`, {
    method: 'PATCH',
    headers: getHeaders(),
    body: JSON.stringify({
      currentPassword,
      newPassword,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to change password');
  }

  return response.json(); // { message: "Password updated" } or similar
};

// Change user profile picture
export const changeProfilePicture = async (formData) => {
  const token = sessionStorage.getItem('authToken');
  const response = await fetch(`${BASE_URL}/auth/upload-profile-picture`, {
    method: 'POST',
    headers: {
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to change profile picture');
  }

  return response.json(); // { message: "Profile picture updated", user }
};

export const forgotPassword = async (email) => {
  const response = await fetch(`${BASE_URL}/auth/forgot-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to send reset link');
  return data;
};

export const resetPassword = async (token, newPassword) => {
  const response = await fetch(`${BASE_URL}/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token, newPassword }),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Failed to reset password');
  return data;
};


