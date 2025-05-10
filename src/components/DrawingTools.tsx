import React from 'react';
import { useDrawingTools } from '../context/DrawingToolsContext';
import { Circle, PenLine, ArrowRight, Square, Grid, Mouse, Eraser, Undo2, Redo2 } from 'lucide-react';
import { serializeDrawings } from '../ai/serializer';
import { pointToCell } from '../utils/drawingUtils';
import { executeSudokuSolver } from '../utils/sudokuSolverExec';




const getAiCall = async (serializedDrawingMap: any) => {
  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
      "HTTP-Referer": "<YOUR_SITE_URL>", // Optional. Site URL for rankings on openrouter.ai.
      "X-Title": "<YOUR_SITE_NAME>", // Optional. Site title for rankings on openrouter.ai.
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "models": ["google/gemini-2.0-flash-exp:free", "meta-llama/llama-4-scout:free","google/gemini-flash-1.5-8b-exp", ],
      "messages": [
        {
          "role": "user",
          "content": [
            {
              "type": "text",
              "text": `type is drawing tools from ['arrow', 'line', 'dotted line', 'circle', 'cage', 'region']. cell indices map to where each drawing was on the grid. ${JSON.stringify(serializedDrawingMap)}`
            },
            {
              "type": "text",
              "text": `You are an expert in variant sudoku rule inference. Given a list of drawn elements and their coordinates on a 9x9 grid (canvas size maps to cell grid), infer the constraints being defined using the constraint definitions.

- IMPORTANT: You MUST include single quotes (') around the constraint specification for CLI compatibility

For example, if you see:
{
  "type": "arrow",
  "points": [{"x": 100, "y": 100}, {"x": 200, "y": 200}],
  "cellIndices": [0, 10]
}

This means cell index 0 is the circle/sum cell, and cell index 10 is the arrow cell.
The correct command would be: -c='arrow:R1C1;R2C2'

For example with multiple arrows:
-c='arrow:R1C1;R1C2R1C3' -c='arrow:R2C2;R3C3R4C4'

Your output MUST be a single string that represents a valid command line for the Sudoku solver.
Adhere strictly to the following schema and rules for constructing the command:

**Overall Command Structure:**

The command line consists of several categories of options, typically in this order:
1.  **Input Board Option** (Exactly ONE from the list)
2.  **Additional Constraint Options** (Zero or more \`-c\` options)
3.  **Pre-Solve Options** (Zero or more)
4.  **Solve Action Option** (Exactly ONE from the list)
5.  **Solve Options** (Zero or more, related to the chosen Solve Action)
6.  **Post-Solve Options** (Zero or more)

* Single-letter parameters that do not require a variable input (e.g., \`-n\`, \`-t\`, \`-p\`, \`-s\`, \`-l\`, \`-r\`, \`-k\`, \`-z\`, \`-u\`, \`-v\`) can be combined (e.g., \`-nt\` is equivalent to \`-n -t\`).
* Parameters requiring a value MUST use the \`=\` sign (e.g., \`-b=9\`, \`-o=file.txt\`). Do NOT use a space.

**1. Input Board Options (Required - Choose EXACTLY ONE):**

You MUST include exactly one of the following options to define the input board:

* **\`-b=<n>\`** or **\`--blank=<n>\`**
    * Description: A blank board of size \`n x n\`.
    * \`<n>\`: An integer between 1 and 31 (inclusive).
    * Example: \`-b=9\`

* **\`-g=<string>\`** or **\`--givens=<string>\`**
    * Description: Board defined by a string of givens.
    * \`<string>\`:
        * Length must be \`n*n\` if board size \`n <= 9\`.
        * Length must be \`2 * (n*n)\` if board size \`n\` is between 10 and 31.
        * For \`n <= 9\`: \`.\` or any non-numerical character for a blank cell. \`1-9\` for a given digit.
        * For \`n >= 10\`: Each cell is represented by two characters. \`00\` or \`..\` (or other non-numeric pairs) for blank. Digits are \`01\` through \`31\`.
        * Cells are specified left-to-right, then top-to-bottom.
    * Example (9x9): \`-g=........1....23.4.....452....1.3.....3...4...6..7....8..6.....9.5....62.7.9...1..\`
    * Example (10x10, partial): \`-g=01..................\` (length would be 200)

* **\`-a=<string>\`** or **\`--candidates=<string>\`**
    * Description: Board defined by a string of candidates for each cell.
    * \`<string>\`:
        * Length must be \`n*n*n\` if board size \`n <= 9\`.
        * Length must be \`2 * (n*n*n)\` if board size \`n\` is between 10 and 31.
        * For \`n <= 9\`: Each character represents a candidate's availability (\`.\` or \`0\` for unavailable, digit for available). Candidates for a cell are listed in numerical order.
        * For \`n >= 10\`: Each candidate is two characters.
        * Cells are specified left-to-right, top-to-bottom. Within a cell, candidates are in numerical order.
    * Example (for a 2x2 board, cell R1C1 candidates 1,2; R1C2 candidates 1; R2C1 candidates 2; R2C2 candidates 1,2): \`-a=121.2.12\` (assuming size 2: 2*2*2 = 8 chars)

* **\`-f=<string>\`** or **\`--fpuzzles=<string>\`**
    * Description: Import board and constraints from an f-puzzles base64 string.
    * \`<string>\`: The base64 encoded puzzle data.
    * Example: \`-f=N4IgzglgXgpiBcBOANCALhNAbO8QGYAGQgAgGUBXAIzAEIRUBDCtACwHsAnBEAJUYB2AczABrBiE4UcYGGh4A5LgFtGWchQAm7URRJSZJRgAdjWAJ4A6ADoDbZNIM2NOmkmxidl7ZXM9h4EgARCCFMMBIwNE4IAGNscxIIAVjOGEZZEgAzTh93VhgSKmkqEhgBTRs7AQcnFzcAaVzjUQgSAAoBdhIBGCFGDAA3Qtj2ASjORmS0AEpAkLC0CNljFwGYNypExhIAd1ZMQu00IzSSUfGYWJYIYctg0PDImFXJtA2i7aKsRljREmOJFYjGGRhIAEZ4AAmfQDCDsSwSIQxTQIADaaOAAF9kNjcTi8YSCcT8QBdZCYklE/E06nY8mU2lU5lMhl0lnsskUzk85lsjkC1ncwW8rmM0W8/lM6WS8noApeHx+bjwTEgLDJGBgdFovj4ADCABYJLxDUaTQBWc2oXhWi2W/UANhNZudNoNbr1+vtpNJBPVmu1qt1tv1AHYTY7wyaw9GbbGABwx/WISMph2pm1WpO+/0a3pBjF8cH68EmqH6qEmg34F2Vh21m1Rqvx0sgXNyzQQLJZTzlWK4NUDrBYQt8RDWvgJ81+3EgYej9FT70mic+/0Lse8acRm0TiOz0Cbpe8Cu7vgV52H+cwEdbqP2pszrFyt7w9FH2+L1UXye8EvGtex4/tu+pJja06pkBX5btOLbLrW0F3ieJbnqe0ZId+IbTsaEErn6fpAA=\`

**2. Additional Constraint Options (\`-c\`) (Optional - Zero or more):**

You can specify this option multiple times to add constraints.
Format: \`-c=constraintname[:group1[;group2...]]\`

* **\`constraintname\`**: The name of the constraint (see table below).
* **\`:\`**: Separator, used if groups are specified.
* **\`groupX\`**: A group definition. Groups are separated by \`;\`.

**Cell Group Syntax (used within \`groupX\` definitions):**
(Case-insensitive, \`R1C1\` is same as \`r1c1\`)
* Single Cell: \`RxCy\` (e.g., \`R2C3\`)
* Multiple Cells (listed): \`RxCyRxCy...\` (e.g., \`R1C1R1C2R2C3\`)
* Cell Range (line or rectangle): \`Rx1-x2Cy\` or \`RxCy1-y2\` or \`Rx1-x2Cy1-y2\` (e.g., \`R1-4C5\`, \`R2C3-8\`, \`R2-4C3-6\`)
* Disjoint Cell Range: \`Rx1,x2,...Cy\` or \`RxCy1,y2,...\` or \`Rx1,x2Cy1,y2\` (e.g., \`R1,3,5C5\`, \`R2-5C4,6,8\`)
* Numpad Directional Movement (appended to a cell specifier): \`D[1-9]\` (e.g., \`R1C1D229\` means from R1C1, move Down, Down, Up-Right)

**Constraint Definitions Table:**

| Constraint Name      | Command-Line Name | Groups Expected & Format                                                                                                                                                                       |
| :------------------- | :---------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Arrow                | \`arrow\`           | Exactly 2 groups: \`cells1;cells2\` (cells1 for circle, cells2 for arrow)                                                                                                                          |
| Between Line         | \`betweenline\`     | Exactly 1 group: \`cells\` (first/last are circles, rest are line)                                                                                                                                 |
| Chess                | \`chess\`           | At least 1 group. Optional first group: \`v1,v2,...\` (values affected). Following group(s): \`x,y\` (symmetric offset). Example: \`chess:1,2\` (for anti-knight), \`chess:1,3,5;1,1\` (values 1,3,5, anti-king) |
| Clone                | \`clone\`           | Exactly 2 groups: \`cells1;cells2\` (originating; clone)                                                                                                                                         |
| Difference           | \`difference\`      | At least 1 group. Options: \`negV\` (e.g., \`neg1\`), \`cells\` (2 cells, diff 1), \`Vcells\` (e.g., \`4R1C1R1C2\`, value V, then 2 cells).                                                                  |
| Disjoint Group       | \`disjointoffset\`  | Exactly 1 group: \`v\` (offset within region, e.g., \`1\`)                                                                                                                                         |
| Disjoint Groups      | \`djg\`             | No groups.                                                                                                                                                                                     |
| Diagonal Nonconsec.  | \`dnc\`             | No groups.                                                                                                                                                                                     |
| Diagonal-            | \`dneg\`            | No groups. (Top-left to bottom-right)                                                                                                                                                          |
| Diagonal+            | \`dpos\`            | No groups. (Bottom-left to top-right)                                                                                                                                                          |
| Even                 | \`even\`            | Exactly 1 group: \`cells\`                                                                                                                                                                       |
| Extra Region         | \`extraregion\`     | Exactly 1 group: \`cells\`                                                                                                                                                                       |
| Killer Cage          | \`killer\`          | 1 or 2 groups. Optional first group: \`v\` (sum value, e.g., \`23\`). Second group: \`cells\`. Example: \`killer:10;R1C1R1C2\` or \`killer:R1C1R1C2\`                                                     |
| Anti-King            | \`king\`            | No groups. (Equivalent to \`chess:1,1\`)                                                                                                                                                         |
| Anti-Knight          | \`knight\`          | No groups. (Equivalent to \`chess:1,2\`)                                                                                                                                                         |
| Little Killer        | \`lk\`              | Exactly 3 groups: \`v;cell;direction\`. \`v\` (e.g., \`23\`), \`cell\` (outside grid, e.g., \`R0C3\`), \`direction\` (\`UR\`\|\`DR\`\|\`UL\`\|\`DL\`). Example: \`lk:15;R0C3;DR\`                                       |
| Maximum              | \`max\`             | Exactly 1 group: \`cells\`                                                                                                                                                                       |
| Minimum              | \`min\`             | Exactly 1 group: \`cells\`                                                                                                                                                                       |
| Odd                  | \`odd\`             | Exactly 1 group: \`cells\`                                                                                                                                                                       |
| Palindrome           | \`palindrome\`      | Exactly 1 group: \`cells\` (in order)                                                                                                                                                            |
| Renban               | \`renban\`          | Exactly 1 group: \`cells\` (in order)                                                                                                                                                            |
| Whispers             | \`whispers\`        | 1 or 2 groups. Optional first group: \`v\` (min difference). Second group: \`cells\` (in order). Default \`v\` if omitted (e.g., 5 for 9x9). Example: \`whispers:R1C1R1C2R1C3\` or \`whispers:4;R1C1R1C2R1C3\` |
| Quadruple            | \`quad\`            | At least 2 groups. First group: \`cells\` (affected cells, exactly one such group). Subsequent groups: \`v\` (value that must appear, e.g., \`2\`). Example: \`quad:R1C1R1C2R2C1R2C2;1;2;3;4\`             |
| Ratio                | \`ratio\`           | At least 1 group. Options: \`negV\` (e.g., \`neg2\`), \`cells\` (2 cells, ratio 2), \`Vcells\` (e.g., \`3R1C1R1C2\`, ratio V, then 2 cells).                                                                |
| Sandwich             | \`sandwich\`        | Exactly 1 group: \`Vcell\` (e.g., \`23R0C3\`). \`V\` is sum, \`cell\` is clue location.                                                                                                                  |
| Sum                  | \`sum\`             | At least 1 group. Options: \`negV\` (e.g., \`neg10\`), \`cells\` (2 cells, sum 5), \`Vcells\` (e.g., \`10R1C1R1C2\`, sum V, then 2 cells).                                                                  |
| Taxicab              | \`taxi\`            | Exactly 1 group: \`v\` (taxicab distance, e.g., \`2\`)                                                                                                                                             |
| Self Taxicab         | \`selftaxi\`        | No groups.                                                                                                                                                                                     |
| Thermometer          | \`thermo\`          | Exactly 1 group: \`cells\` (in order, bulb first)                                                                                                                                                |

*Example \`-c\` usage:* \`-c=knight -c=king -c=thermo:R1C1R1C2R1C3R2C3\`

**3. Pre-Solve Options (Optional - Zero or more):**

* **\`-p\`** or **\`--print\`**
    * Description: Prints the puzzle as imported before solving.
    * No sub-parameter.

**4. Solve Action Options (Required - Choose EXACTLY ONE):**

You MUST include exactly one of the following options to define the solve action:

* **\`-s\`** or **\`--solve\`**
    * Description: Finds a solution.
* **\`-d\`** or **\`--random\`**
    * Description: Finds a random solution.
* **\`-l\`** or **\`--logical\`**
    * Description: Attempts to solve logically, outputs steps.
    * Note: Does NOT support multithreading (\`-t\`).
* **\`-r\`** or **\`--truecandidates\`**
    * Description: Finds "true candidates" (union of all solutions).
* **\`-k\`** or **\`--check\`**
    * Description: Checks if puzzle has 0, 1, or 2+ solutions.
* **\`-n\`** or **\`--solutioncount\`**
    * Description: Gets the exact number of solutions.

**5. Solve Options (Optional - Zero or more, context-dependent):**

These modify the chosen Solve Action.

* **\`-t\`** or **\`--multithread\`**
    * Description: Uses multithreading for brute-force solvers.
    * Cannot be used with \`-l\` (logical solve action).

**6. Post-Solve Options (Optional - Zero or more):**

These affect behavior after the solve action completes.

* **\`-o=<filename>\`** or **\`--out=<filename>\`**
    * Description: Output solution(s) to the specified file.
    * \`<filename>\`: Name of the output file.
    * Example: \`-o=solution.txt\`

* **\`-z\`** or **\`--sort\`**
    * Description: Sorts solution count output.
    * Only valid if \`-n\` (solutioncount) is used as the Solve Action.

* **\`-u\`** or **\`--url\`**
    * Description: Outputs the result as an f-puzzles URL.

* **\`-v\`** or **\`--visit\`**
    * Description: Opens the generated f-puzzles URL in the default browser.
    * MUST be combined with \`-u\`.

**Example Combined Command (Illustrative):**
\`-b=9 -c=knight -c=king -c=thermo:R1C1R2C1R3C1 -ps -t -o=my_solution.txt\`
(This means: blank 9x9 board, anti-knight, anti-king, thermo from R1C1->R2C1->R3C1, print board, solve using brute force with multithreading, output to my_solution.txt)

**Reminder about Server Options (Not for puzzle generation, for your information):**
The solver also has server modes (\`--listen\`, \`--port=12345\`). These are NOT to be used for generating a command to solve a specific Sudoku puzzle configuration.

**Final Instruction:**
Generate only the command-line string based on the Sudoku problem details you are given and the schema above.`
            }
          ]
        }
      ],
    })
  })
  const data = await response.json();
  const commandLine = data.choices[0].message.content;
  console.log("Generated command line:", commandLine);
  
  try {
    // Execute the Sudoku solver command directly
    const solverOutput = await executeSudokuSolver(commandLine);
    console.log("Solver output:", solverOutput);
    return { commandLine, solverOutput };
  } catch (error) {
    console.error("Error executing Sudoku solver:", error);
    return { commandLine, error: "Failed to execute Sudoku solver" };
  }
}



const DrawingTools: React.FC = () => {
  const {
    selectedTool,
    setSelectedTool,
    selectedColor,
    setSelectedColor,
    undoDrawing,
    redoDrawing,
    canUndo,
    canRedo,
    clearCanvas,
    drawings
  } = useDrawingTools();

  const tools = [
    { id: 'select', icon: <Mouse size={20} />, label: 'Select' },
    { id: 'circle', icon: <Circle size={20} />, label: 'Circle' },
    { id: 'line', icon: <PenLine size={20} />, label: 'Line' },
    { id: 'dottedLine', icon: <PenLine size={20} />, label: 'Dotted Line' },
    { id: 'arrow', icon: <ArrowRight size={20} />, label: 'Arrow' },
    { id: 'cage', icon: <Square size={20} />, label: 'Cage' },
    { id: 'region', icon: <Grid size={20} />, label: 'Region' },
    { id: 'eraser', icon: <Eraser size={20} />, label: 'Eraser' },
  ];

  const colors = [
    { id: 'blue', value: '#3B82F6' },
    { id: 'green', value: '#10B981' },
    { id: 'red', value: '#EF4444' },
    { id: 'purple', value: '#8B5CF6' },
    { id: 'yellow', value: '#F59E0B' },
  ];

  return (
    <div className="bg-white rounded-lg shadow-md p-4 h-full">
      <h2 className="text-lg font-semibold mb-4">Drawing Tools</h2>

      <div className="space-y-6">
        <div className="grid grid-cols-4 gap-2">
          {tools.map((tool) => (
            <button
              key={tool.id}
              onClick={() => setSelectedTool(tool.id)}
              className={`
                flex flex-col items-center justify-center p-2 rounded-lg text-xs
                transition-all duration-200
                ${selectedTool === tool.id
                  ? 'bg-blue-100 text-blue-700 ring-2 ring-blue-500'
                  : 'hover:bg-gray-100 text-gray-700'}
              `}
              title={tool.label}
            >
              {tool.icon}
              <span className="mt-1">{tool.label}</span>
            </button>
          ))}
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">Colors</h3>
          <div className="flex space-x-2">
            {colors.map((color) => (
              <button
                key={color.id}
                onClick={() => setSelectedColor(color.value)}
                className={`
                  w-8 h-8 rounded-full
                  ${selectedColor === color.value ? 'ring-2 ring-offset-2 ring-gray-400' : ''}
                  transition-all duration-200
                `}
                style={{ backgroundColor: color.value }}
                title={color.id}
              />
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-medium mb-2">Actions</h3>
          <div className="flex space-x-2">
            <button
              onClick={undoDrawing}
              disabled={!canUndo}
              className={`
                p-2 rounded-lg flex items-center justify-center
                ${canUndo ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-400 cursor-not-allowed'}
              `}
              title="Undo"
            >
              <Undo2 size={20} />
            </button>
            <button
              onClick={redoDrawing}
              disabled={!canRedo}
              className={`
                p-2 rounded-lg flex items-center justify-center
                ${canRedo ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-400 cursor-not-allowed'}
              `}
              title="Redo"
            >
              <Redo2 size={20} />
            </button>
            <button
              onClick={clearCanvas}
              className="p-2 rounded-lg flex items-center justify-center text-red-600 hover:bg-red-50"
              title="Clear All"
            >
              Clear All
            </button>

            <button
              onClick={() => {
                const canvas = document.querySelector('canvas');
                if (!canvas) {
                  console.error('Canvas not found');
                  return;
                }
                const width = canvas.width;
                const height = canvas.height;
                const serialized = serializeDrawings(drawings);

                const withCells = serialized.map(drawing => ({
                  ...drawing,
                  cellIndices: drawing.points.map(point => pointToCell(point, width, height))
                }));

                console.log('serialized with cells:', withCells);
                getAiCall(withCells);
              }}
              className="p-2 rounded-lg flex items-center justify-center text-red-600 hover:bg-red-50"
              title="Submit"
            >
              Submit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DrawingTools;