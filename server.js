import express from 'express';
import { exec } from 'child_process';
import cors from 'cors';
import { promisify } from 'util';

const execPromise = promisify(exec);
const app = express();
const port = 3001; // Choose any available port

app.use(cors());
app.use(express.json());

// Endpoint to execute Sudoku solver command
app.post('/execute-solver', async (req, res) => {
  try {
    const { command } = req.body;
    
    if (!command) {
      return res.status(400).json({ error: 'Command is required' });
    }
    
    console.log('Executing command:', command);
    
    // Construct the full command
    const fullCommand = `"/Volumes/SolverApp 1/SudokuSolverConsole" ${command}`;
    
    // Execute the command
    const { stdout, stderr } = await execPromise(fullCommand);
    
    if (stderr) {
      console.error('Solver error:', stderr);
      return res.status(500).json({ error: stderr });
    }
    
    console.log('Solver output:', stdout);
    return res.json({ output: stdout });
  } catch (error) {
    console.error('Error executing Sudoku solver:', error);
    return res.status(500).json({ error: error.message });
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
