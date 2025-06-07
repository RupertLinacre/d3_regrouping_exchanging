D3 Regrouping Visualizer: Specification
1. Introduction

This document specifies a D3.js web application designed as a high-quality pedagogical tool to illustrate the mathematical concepts of place value, grouping, and regrouping (composition and decomposition) for numbers up to 999. The application will provide an interactive visual representation of numbers using base-10 blocks (units, rods, and flats) and allow users to manipulate these groupings. The implementation will prioritize small, focused functions within a modular file structure.

2. Core Functionality

Number Input:
Users can enter a whole number between 0 and 999 (inclusive) into an HTML input field.
The initial visual representation will correspond to the canonical base-10 block representation of the entered number (e.g., 234 is 2 flats, 3 rods, 4 units).
Visual Representation:
The application will display three distinct columns: "Hundreds," "Tens," and "Ones."
Textual information (digit, expanded value, word phrase) will be displayed above the blocks in each column.
The total number of individual unit squares displayed will always equal the number entered in the input box.
Units (Ones): Represented as small squares.
Rods (Tens): Represented as a visual grouping of 10 unit squares arranged vertically.
Flats (Hundreds): Represented as a visual grouping of 10 rods (or 100 unit squares) arranged as a 10x10 square.
Decomposition (Breaking Apart / Ungrouping):
Users can left-click on a flat in the "Hundreds" column. If a flat exists, it will visually decompose into 10 rods. These 10 rods (composed of their constituent unit squares) will animate from the flat's original position to appropriate positions in the "Tens" column.
Users can left-click on a rod in the "Tens" column. If a rod exists, it will visually decompose into 10 units. These 10 units will animate from the rod's original position to appropriate positions in the "Ones" column.
Composition (Grouping Up):
Users can right-click anywhere within the "Ones" column background. If there are 10 or more units present in the "Ones" column, 10 of these units will visually compose into a single rod. These 10 units will animate from their positions in the "Ones" column and merge to form a new rod in an appropriate position in the "Tens" column.
Users can right-click anywhere within the "Tens" column background. If there are 10 or more rods present in the "Tens" column, 10 of these rods (composed of their constituent unit squares) will visually compose into a single flat. These 10 rods will animate from their positions in the "Tens" column and merge to form a new flat in an appropriate position in the "Hundreds" column.
Object Permanence: All animations must clearly demonstrate that no unit squares are created or destroyed during regrouping operations. The same set of squares is merely rearranged and regrouped.
State Synchronization:
The visual representation (number of flats, rods, units) will reflect the current state of grouping, which may not be canonical (e.g., 1 flat, 13 rods, 4 units for the number 234).
The HTML input field will always display the canonical numeric value corresponding to the total number of unit squares shown. Changes in the input field will reset the visual grouping to its canonical form.
3. Architecture

The application will be architected with a clear separation of concerns using small, focused functions and modules.

3.1. State Management:

Primary State: An array of objects, where each object represents a single unit square. The length of this array will always equal the number in the input box.
Each unit square object will contain:
A unique id (for D3 object constancy).
Its current grouping status (e.g., 'unit', 'rod', 'flat').
An indexInGroup (e.g., which unit it is within a rod (0-9), or which unit it is within a flat (0-99)).
A groupLeaderId or similar mechanism to identify which squares belong to the same rod/flat for interaction purposes.
Derived State: From this primary state, the application will derive:
The count of active flats, rods, and individual units currently displayed.
Textual information for display above each column.
Input Value: The canonical number from the input field dictates the total number of unit squares.
3.2. Layout Engine:

This engine is responsible for determining the (x, y) screen coordinates for every individual unit square.
Input to the Layout Engine:
The array of all unit square objects (from State Management).
Dimensions of the columns and the SVG drawing area.
Output: For each unit square, its target x and y position.
Logic:
It will first determine the conceptual flats, rods, and "loose" units based on the grouping status of all unit squares.
Flats Layout:
Conceptual flats are positioned in a grid within the "Hundreds" column (e.g., up to 3 flats per row, bottom-aligned).
For each unit square that is part of a conceptual flat, its (x,y) position will be calculated relative to that flat's top-left corner, and then offset by the flat's position in the column.
Rods Layout:
Conceptual rods are positioned within the "Tens" column, arranged in rows (e.g., side-by-side, wrapping to new rows if needed, bottom-aligned).
For each unit square that is part of a conceptual rod, its (x,y) position will be calculated relative to that rod's top-left corner (as a vertical stack of units), and then offset by the rod's position in the column.
Units Layout:
"Loose" units are positioned in a grid within the "Ones" column (e.g., in rows, bottom-aligned).
For each unit square grouped as a 'unit', its (x,y) position is calculated directly within the "Ones" column grid.
The key is that every square gets an individual target (x,y) based on its current grouping.
3.3. Renderer (D3.js):

Binds the array of unit square objects (from State Management) to SVG <rect> elements.
Uses D3's data join (.data(allUnitSquares, d => d.id)).
Enter: New squares (when the input number increases) will animate into their initial positions.
Update: Squares changing position due to regrouping will transition smoothly from their old (x,y) to their new (x,y) (as determined by the Layout Engine).
Exit: Squares (when the input number decreases) will animate out.
Attaches event listeners:
Left-click listeners to elements visually representing flats and rods (these will be dynamically identified, perhaps by selecting the first unit square of a group).
Right-click listeners to invisible overlay rectangles covering each column's block area for composition.
3.4. Animation System:

Primarily driven by D3 transitions on the attributes (especially transform or x/y) of the SVG elements representing the unit squares.
When a regrouping operation occurs:
The State Management updates the grouping status of the affected unit squares.
The Layout Engine recalculates the new target (x,y) positions for all squares.
The Renderer (D3) applies these new positions with a transition, causing the squares to "fly" to their new locations.
No temporary "flying pieces" are created; the actual data-bound square elements move.
3.5. Interaction Handler:

Listens for user events (input change, clicks, right-clicks).
Orchestrates the calls to:
State Management (to update groupings).
Renderer (indirectly, by triggering a re-render which uses the Layout Engine).
4. Visual Design & Layout Details

Columns: Three equally sized columns labeled "Hundreds," "Tens," "Ones."
Hundreds Column: Displays conceptual flats in a grid (e.g., max 3 wide, stacking rows, bottom-aligned).
Tens Column: Displays conceptual rods in rows (e.g., side-by-side, wrapping to new rows, bottom-aligned).
Ones Column: Displays loose units in rows (e.g., side-by-side, wrapping to new rows, bottom-aligned).
Colors: A consistent color (e.g., teal/green as per mockup) for all unit squares, with white internal grid lines for flats and rods to show their composition from units.
Animation: Smooth transitions for all movements and regroupings. Duration should be pedagogically appropriate.
5. Non-Functional Requirements

Browser Compatibility: Modern evergreen browsers (Chrome, Firefox, Safari, Edge).
Performance: Smooth animations even with up to 999 individual squares being managed and potentially repositioned.
Modularity & Testability: Code should be well-organized into small, focused functions within a modular file structure.