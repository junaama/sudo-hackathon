// Utility to execute the Sudoku solver command via a server API

// Function to execute the Sudoku solver command and return the output
export const executeSudokuSolver = async (puzzleCommand: string): Promise<string> => {
  try {
    console.log('Sending command to server:', puzzleCommand);
    
    // Send the command to our Express server
    const response = await fetch('http://localhost:3001/execute-solver', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ command: puzzleCommand }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('Server error:', errorData);
      return `Error: ${errorData.error || 'Unknown server error'}`;
    }
    
    const data = await response.json();
    console.log('Server response:', data);
    return data.output;
  } catch (error: unknown) {
    console.error('Error executing Sudoku solver:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return `Error: ${errorMessage}`;
  }
};
