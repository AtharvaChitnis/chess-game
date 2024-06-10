# chess-game

This is an Angular Project, for my attempt to create a chess-game.

An interactive chess board application built with Angular. This project provides a full-featured chess interface, allowing players to make moves, handle pawn promotions, and view the game's state.

## Features

- **Interactive Chess Board**: Click to select and move pieces.
- **Pawn Promotion**: Automatic handling of pawn promotions with a selection dialog.
- **Game State Tracking**: Keeps track of the game's move history, last move, and check state.
- **Visual Indicators**: Highlights selected pieces, valid moves, and the last move made.

## Installation

To run this project locally, follow these steps:

1. **Clone the repository**:
    ```sh
    git clone https://github.com/yourusername/angular-chess-board.git
    cd angular-chess-board
    ```

2. **Install dependencies**:
    ```sh
    npm install
    ```

3. **Run the development server**:
    ```sh
    ng serve
    ```

4. **Open your browser** to `http://localhost:4200`.

## Usage

### Selecting and Moving Pieces

- Click on a piece to select it.
- Click on a valid destination square to move the piece.
- If a pawn reaches the last rank, a promotion dialog will appear to select the new piece.

### Promotion

When a pawn reaches the last rank (row 0 for black, row 7 for white), a dialog will appear allowing you to choose a piece (Knight, Bishop, Rook, or Queen) for promotion.

## Code Structure

### Components

- **ChessBoardComponent**: The main component handling the chessboard UI and interactions.

### Models

- **Color**: Enum for player colors.
- **FENChar**: Enum for FEN notation characters.
- **Coords**: Interface for board coordinates.
- **CheckState**: Interface for the check state.
- **SafeSquares**: Interface for safe squares.
- **pieceImagePaths**: Constant for piece image paths.
- **LastMove**: Interface for the last move information.
- **MoveList**: Interface for the move list.
- **GameHistory**: Interface for the game history.
- **SelectedSquare**: Interface for the selected square.

### Services

- **ChessBoardService**: Manages the chess board state and interactions with the `ChessBoard` class.

## Contributing

Contributions are welcome! Please follow these steps to contribute:

1. Fork the repository.
2. Create a new branch (`git checkout -b feature/your-feature-name`).
3. Make your changes.
4. Commit your changes (`git commit -m 'Add some feature'`).
5. Push to the branch (`git push origin feature/your-feature-name`).
6. Open a pull request.


## Contact

If you have any questions, feel free to reach out:

- Atharva Chitnis -

mailto: highiamatharva@gmail.com

---

## Happy Coding
