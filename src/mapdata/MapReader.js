import path from 'path';
// Import the WorldAction class
import { WorldAction } from './MapData'; // Replace '../path/to/WorldAction' with the actual path to the WorldAction class.

// Helper function to convert JSON object to WorldAction class instance
function convertToWorldAction(data) {
  return new WorldAction(data.name, data.summary, data.description, data.imagePath);
}

export function importWorldActions() {
  const jsonDataPath = path.join(process.cwd(), 'tiledata', 'actions_list.json'); // Adjust the path according to your project's structure

  try {
    // Import the JSON data
    const rawData = require(jsonDataPath);
  
    // Convert the actions array in JSON to an array of WorldAction instances
    const worldActions = rawData.actions.map(convertToWorldAction);
    return worldActions;
  } catch (error) {
    console.error('Error importing world actions:', error);
    throw new Error('Error importing world actions');   
  }
}