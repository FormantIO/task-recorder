import { Uuid } from "@formant/data-sdk";

function sanitizeTag(value: any) {
  // Replace any character that is not alphanumeric, dash, period, or underscore with an underscore
  return String(value).replace(/[^a-zA-Z0-9-._]/g, '_').slice(0, 255);
}

export async function getEvent(token: string, lastCheckedId: Uuid): Promise<any> {
  // Replace spaces with hyphens and convert to lowercase for the ID

  const url = `https://api.formant.io/v1/admin/events/${encodeURIComponent(lastCheckedId)}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
      },
    });

    console.log(response);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error('Failed to get event:', error);
  }
}

export async function createEvent(
  token: string,
  userId: string,
  taskDescription: string
): Promise<void> {
  // Construct the event ID
  const currentDateTime = new Date().toISOString();

  // Splitting the date and time
  const currentDate = currentDateTime.split('T')[0]; // Gets the date part
  const currentTime = currentDateTime.split('T')[1]; // Gets the time part


  const requestBody = {
    tags: {
      'userId': sanitizeTag(userId),
      'description': sanitizeTag(taskDescription),
      'date': sanitizeTag(currentDate),
      'time': sanitizeTag(currentTime)
    },
    time: currentDateTime,
    message: "Task Checked!"
  };


  try {
    const response = await fetch('https://api.formant.io/v1/admin/custom-events', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });
  
    if (!response.ok) {
      const errorBody = await response.text(); // or use response.json() if the server sends JSON response
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorBody}`);
    }
  
    const data = await response.json();
    return data.id;
  } catch (error) {
    console.error('Failed to create event:', error);
  }
}