const API_BASE = 'https://vitto-kpc8.onrender.com/api';

export async function submitApplication(data) {
  const response = await fetch(`${API_BASE}/applications`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  const result = await response.json();

  if (!response.ok) {
    const error = new Error(result.error?.message || 'Something went wrong');
    error.details = result.error?.details || [];
    error.status = response.status;
    throw error;
  }

  return result.data;
}

export async function getApplication(id) {
  const response = await fetch(`${API_BASE}/applications/${id}`);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error?.message || 'Application not found');
  }

  return result.data;
}

export async function listApplications() {
  const response = await fetch(`${API_BASE}/applications`);
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error?.message || 'Failed to fetch applications');
  }

  return result.data;
}
