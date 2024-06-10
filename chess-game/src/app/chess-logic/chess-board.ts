import {
  Color,
  FENChar,
  Coords,
  CheckState,
  SafeSquares,
  LastMove,
  MoveType,
  GameHistory,
  MoveList,
} from './models';
import {FENConverter} from "./FENConverter";
import { Bishop } from './pieces/bishop';
import { King } from './pieces/king';
import { Knight } from './pieces/knight';
import { Pawn } from './pieces/pawn';
import { Piece } from './pieces/piece';
import { Queen } from './pieces/queen';
import { Rook } from './pieces/rook';

export class ChessBoard {
  private chessBoard: (Piece | null)[][];
  private readonly chessBoardSize: number = 8;
  private _playerColor = Color.White;
  private _safeSquares: SafeSquares;
  private _lastMove: LastMove | undefined;
  private _checkState: CheckState = { isInCheck: false };
  private fiftyMoveRuleCounter: number = 0;

  private _isGameOver:boolean = false;
  private _gameOverMessage: string | undefined;

  private fullNumberOfMoves: number = 1;
  private threeFoldRepetitionDictionary = new Map<string, number>();
  private threeFoldRepetitionFlag:boolean =false;

  private _boardAsFEN: string = FENConverter.initialPosition;
  private FENConverter = new FENConverter();

  private _moveList: MoveList = [];
  private _gameHistory: GameHistory;


  constructor() {
    this.chessBoard = [
      [
        new Rook(Color.White),
        new Knight(Color.White),
        new Bishop(Color.White),
        new Queen(Color.White),
        new King(Color.White),
        new Bishop(Color.White),
        new Knight(Color.White),
        new Rook(Color.White),
      ],
      [
        new Pawn(Color.White),
        new Pawn(Color.White),
        new Pawn(Color.White),
        new Pawn(Color.White),
        new Pawn(Color.White),
        new Pawn(Color.White),
        new Pawn(Color.White),
        new Pawn(Color.White),
      ],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [null, null, null, null, null, null, null, null],
      [
        new Pawn(Color.Black),
        new Pawn(Color.Black),
        new Pawn(Color.Black),
        new Pawn(Color.Black),
        new Pawn(Color.Black),
        new Pawn(Color.Black),
        new Pawn(Color.Black),
        new Pawn(Color.Black),
      ],
      [
        new Rook(Color.Black),
        new Knight(Color.Black),
        new Bishop(Color.Black),
        new Queen(Color.Black),
        new King(Color.Black),
        new Bishop(Color.Black),
        new Knight(Color.Black),
        new Rook(Color.Black),
      ],
    ];
    this._safeSquares = this.findSafeSquares();
    this._gameHistory = [{ board: this.chessBoardView, lastMove: this._lastMove, checkState: this._checkState}];
  }

  public get safeSquares(): SafeSquares {
    return this._safeSquares;
  }

  public get playerColor(): Color {
    return this._playerColor;
  }

  public get checkState(): CheckState {
    return this._checkState;
  }

  public get chessBoardView(): (FENChar | null)[][] {
    return this.chessBoard.map((row) => {
      return row.map((piece) =>
        piece instanceof Piece ? piece.FENChar : null
      );
    });
  }

  public get isGameOver(): boolean {
    return this._isGameOver;
  }

  public get gameOverMessage(): string | undefined {
    return this._gameOverMessage;
  }

  public get boardAsFEN(): string {
    return this._boardAsFEN;
  }

  public get moveList(): MoveList {
    return this._moveList;
  }

  public get gameHistory(): GameHistory {
    return this._gameHistory;
  }

  public isSquareDark(x: number, y: number): boolean {
    return (x % 2 === 0 && y % 2 === 0) || (x % 2 === 1 && y % 2 === 1);
  }

  private areCoordsValid(x: number, y: number): boolean {
    return (
      x >= 0 && y >= 0 && x < this.chessBoardSize && y < this.chessBoardSize
    );
  }

  public isInCheck(
    playerColor: Color,
    checkingCurrentPosition: boolean
  ): boolean {
    for (let x = 0; x < this.chessBoardSize; x++) {
      for (let y = 0; y < this.chessBoardSize; y++) {
        const piece: Piece | null = this.chessBoard[x][y];
        if (!piece || piece.color === playerColor) continue;

        for (const { x: dx, y: dy } of piece.directions) {
          let newX: number = x + dx;
          let newY: number = y + dy;

          if (!this.areCoordsValid(newX, newY)) continue;

          if (
            piece instanceof Pawn ||
            piece instanceof Knight ||
            piece instanceof King
          ) {
            //pawns are only atacking diagonally
            if (piece instanceof Pawn && dy === 0) continue;

            const attackedPiece: Piece | null = this.chessBoard[newX][newY];
            if (
              attackedPiece instanceof King &&
              attackedPiece.color === playerColor
            ) {
              if (checkingCurrentPosition)
                this._checkState = { isInCheck: true, x: newX, y: newY };
              return true;
            }
          } else {
            while (this.areCoordsValid(newX, newY)) {
              const attackedPiece: Piece | null = this.chessBoard[newX][newY];
              if (
                attackedPiece instanceof King &&
                attackedPiece.color === playerColor
              ) {
                if (checkingCurrentPosition)
                  this._checkState = { isInCheck: true, x: newX, y: newY };
                return true;
              }
              if (attackedPiece !== null) break;
              newX += dx;
              newY += dy;
            }
          }
        }
      }
    }
    if (checkingCurrentPosition) this._checkState = { isInCheck: false };
    return false;
  }

  private isPositionSafeAfterMove(
    prevX: number,
    prevY: number,
    newX: number,
    newY: number
  ): boolean {
    const piece: Piece | null = this.chessBoard[prevX][prevY];
    if (!piece) return false;

    const newPiece: Piece | null = this.chessBoard[newX][newY];
    // we cant put piece on a square that already contains piece of the same square
    if (newPiece && newPiece.color === piece.color) return false;

    //simulate position
    this.chessBoard[prevX][prevY] = null;
    this.chessBoard[newX][newY] = piece;

    const isPositionSafe: boolean = !this.isInCheck(piece.color, false);

    // restore position back
    this.chessBoard[prevX][prevY] = piece;
    this.chessBoard[newX][newY] = newPiece;

    return isPositionSafe;
  }

  private findSafeSquares(): SafeSquares {
    const safeSquares: SafeSquares = new Map<string, Coords[]>();

    for (let x = 0; x < this.chessBoardSize; x++) {
      for (let y = 0; y < this.chessBoardSize; y++) {
        const piece: Piece | null = this.chessBoard[x][y];
        if (!piece || piece.color !== this._playerColor) continue;

        const pieceSafeSquares: Coords[] = [];

        for (const { x: dx, y: dy } of piece.directions) {
          let newX: number = x + dx;
          let newY: number = y + dy;

          if (this.areCoordsValid(newX, newY)) continue;

          let newPiece: Piece | null = this.chessBoard[newX][newY];
          if (newPiece && newPiece.color === piece.color) continue;

          // need to restrict pawn moves in certain directions
          if (piece instanceof Pawn) {
            // cant move pawn two squares straight if there is piece infront of it.
            if (dx === 2 || dx === -2) {
              if (newPiece) continue;
              if (this.chessBoard[newX + (dx === 2 ? -1 : 1)][newY]) continue;
            }
            //  cant move pawn one squarestraight if piece is infront of him
            if ((dx === 1 || dx === -1) && dy === 0 && newPiece) continue;

            // cant move pawn diagonally if there is no piece, or piece has same color as pawn
            if (
              (dy === 1 || dy === -1) &&
              (!newPiece || piece.color === newPiece.color)
            )
              continue;
          }
          if (
            piece instanceof Pawn ||
            piece instanceof Knight ||
            piece instanceof King
          ) {
            if (this.isPositionSafeAfterMove(x, y, newX, newY))
              pieceSafeSquares.push({ x: newX, y: newY });
          } else {
            while (this.areCoordsValid(newX, newY)) {
              newPiece = this.chessBoard[newX][newY];
              if (newPiece && newPiece.color === piece.color) break;

              if (this.isPositionSafeAfterMove(x, y, newX, newY))
                pieceSafeSquares.push({ x: newX, y: newY });

              if (newPiece !== null) break;
              newX += dx;
              newY += dy;
            }
          }
        }

        if (piece instanceof King) {
          if (this.canCastle(piece, true)) pieceSafeSquares.push({ x, y: 6 });

          if (this.canCastle(piece, false)) pieceSafeSquares.push({ x, y: 2 });
        } else if (
          piece instanceof Pawn &&
          this.canCaptureEnPassant(piece, x, y)
        )
          pieceSafeSquares.push({
            x: x + (piece.color === Color.White ? 1 : -1),
            y: this._lastMove!.prevY,
          });

        if (pieceSafeSquares.length)
          safeSquares.set(x + ',' + y, pieceSafeSquares);
      }
    }
    return safeSquares;
  }

  private canCaptureEnPassant(
    pawn: Pawn,
    pawnX: number,
    pawnY: number
  ): boolean {
    if (!this._lastMove) return false;
    const { piece, prevX, prevY, currX, currY } = this._lastMove;

    if (
      !(piece instanceof Pawn) ||
      pawn.color !== this._playerColor ||
      Math.abs(currX - prevX) !== 2 ||
      pawnX !== currX ||
      Math.abs(pawnY - currY) !== 1
    )
      return false;

    const pawnNewPositionX: number =
      pawnX + (pawn.color === Color.White ? 1 : -1);
    const pawnNewPositionY: number = currY;

    this.chessBoard[currX][currY] = null;
    const isPositionSafe: boolean = this.isPositionSafeAfterMove(
      pawnX,
      pawnY,
      pawnNewPositionX,
      pawnNewPositionY
    );
    this.chessBoard[currX][currY] = piece;

    return isPositionSafe;
  }
  private canCastle(king: King, kingSideCastle: boolean): boolean {
    if (king.hasMoved) return false;

    const kingPositionX: number = king.color === Color.White ? 0 : 7;
    const kingPositionY: number = 4;
    const rookPositionX: number = kingPositionX;
    const rookPositionY: number = kingSideCastle ? 7 : 0;
    const rook: Piece | null = this.chessBoard[rookPositionX][rookPositionY];

    if (!(rook instanceof Rook) || rook.hasMoved || this._checkState.isInCheck)
      return false;

    const firstNextKingPositionY: number =
      kingPositionY + (kingSideCastle ? 1 : -1);
    const secondNextKingPositionY: number =
      kingPositionY + (kingSideCastle ? 2 : -2);

    if (
      this.chessBoard[kingPositionX][firstNextKingPositionY] ||
      this.chessBoard[kingPositionX][secondNextKingPositionY]
    )
      return false;

    if (!kingSideCastle && this.chessBoard[kingPositionX][1]) return false;

    return (
      this.isPositionSafeAfterMove(
        kingPositionX,
        kingPositionY,
        kingPositionX,
        firstNextKingPositionY
      ) &&
      this.isPositionSafeAfterMove(
        kingPositionX,
        kingPositionY,
        kingPositionX,
        secondNextKingPositionY
      )
    );
  }

  public move(
    prevX: number,
    prevY: number,
    newX: number,
    newY: number,
    promotedPieceType: FENChar | null
  ): void {
    if (this._isGameOver) throw new Error('The GAME is OVER, No play no move');

    if (!this.areCoordsValid(prevX, prevY) || !this.areCoordsValid(newX, newY))
      return;
    const piece: Piece | null = this.chessBoard[prevX][prevY];
    if (!piece || piece.color !== this._playerColor) return;

    const pieceSafeSquares: Coords[] | undefined = this._safeSquares.get(
      prevX + ',' + prevY
    );
    if (
      !pieceSafeSquares ||
      !pieceSafeSquares.find((coords) => coords.x === newX && coords.y === newY)
    )
      throw new Error('Square is not safe');

    if (
      (piece instanceof Pawn ||
        piece instanceof King ||
        piece instanceof Rook) &&
      !piece.hasMoved
    )
      piece.hasMoved = true;

    const moveType = new Set<MoveType.Capture>();

    const isPieceTaken: boolean = this.chessBoard[newX][newY] !== null;
    if (isPieceTaken) moveType.add(MoveType.Capture);

    if (piece instanceof Pawn || isPieceTaken) this.fiftyMoveRuleCounter = 0;
    else this.fiftyMoveRuleCounter += 0.5;

    this.handlingSpecialMoves(piece, prevX, prevY, newY, newX, moveType);
    // update the board
    if (promotedPieceType) {
      this.chessBoard[newX][newY] = this.promotedPiece(promotedPieceType);
      moveType.add(MoveType.Promotion);
    } else {
      this.chessBoard[newX][newY] = piece;
    }

    this.chessBoard[prevX][prevY] = null;

    this._lastMove = {
      prevX,
      prevY,
      currX: newX,
      currY: newY,
      piece,
      moveType,
    };
    this._playerColor =
      this._playerColor === Color.White ? Color.Black : Color.White;
    this.isInCheck(this._playerColor, true);
    const safeSquares: SafeSquares = this.findSafeSquares();

    if (this._checkState.isInCheck)
      moveType.add(!safeSquares.size ? MoveType.CheckMate : MoveType.Check);
    else if (!moveType.size) moveType.add(MoveType.BasicMove);

    this.isPositionSafeAfterMove(promotedPieceType);
    this.updateGameHistory();

    this._safeSquares = safeSquares;
    if(this._playerColor === Color.White) this.fullNumberOfMoves++;
    this._boardAsFEN = this.FENConverter.convertBoardToFEN(this.chessBoard, this._playerColor, this._lastMove, this.fiftyMoveRuleCounter, this.fullNumberOfMoves);
    this.updateThreeFoldRepetitionDictionary(this._boardAsFEN);

    this._isGameOver = this.isGameFinished();
  }

}
